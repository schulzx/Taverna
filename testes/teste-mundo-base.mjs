import {
  locaisDaCidade, genteDoLocal, segredosDaCidade, criaturasDaRegiao, chefesDoMundo,
  garantirBase, revelar, saquear, matar, estaMorto, foiSaqueado,
  oQueExisteAqui, resumoDaqui, resumoChefesPrompt, chefePorNome, criaturaPorNome,
} from "../src/mundo-base.js";
import { gerarGeografia } from "../src/geografia.js";

let falhas = 0;
const ok = (c, t) => { if (!c) { falhas++; console.log("  FALHA:", t); } else console.log("  ok:", t); };
const SEM = "campanha-do-corvo|Fantasia medieval";
const GEN = "Fantasia medieval";

console.log("\n[O MAPA PRECISA SER ESTÁVEL — a base inteira depende disso]");
const g1 = gerarGeografia(SEM);
const g2 = gerarGeografia(SEM);
console.log(`  continente: ${g1.continente} · ${g1.regioes.length} regiões · ${g1.cidades.length} cidades`);
console.log("  cidades:", g1.cidades.map((c) => `${c.nome} (${c.porte})`).join(", "));
ok(JSON.stringify(g1) === JSON.stringify(g2), "duas gerações com a mesma semente dão o MESMO mundo");
ok(new Set(g1.cidades.map((c) => c.nome)).size === g1.cidades.length, "nenhuma cidade repete nome");
const outro = gerarGeografia("outra-campanha");
ok(JSON.stringify(outro.cidades) !== JSON.stringify(g1.cidades), "semente diferente dá mundo diferente");

console.log("\n[LOCAIS — o porte manda]");
const capital = g1.cidades.find((c) => c.porte === "capital");
const aldeia = g1.cidades.find((c) => c.porte === "aldeia") || g1.cidades.find((c) => c.porte === "vila");
for (const c of [capital, aldeia].filter(Boolean)) {
  const ls = locaisDaCidade(SEM, c, GEN);
  console.log(`  ${c.nome} (${c.porte}): ${ls.map((l) => `${l.icone} ${l.nome}`).join(" · ")}`);
}
ok(locaisDaCidade(SEM, capital, GEN).length > locaisDaCidade(SEM, aldeia, GEN).length, "capital tem mais locais que aldeia/vila");
ok(locaisDaCidade(SEM, capital, GEN).some((l) => l.tipo === "taverna"), "toda cidade tem taverna");
ok(JSON.stringify(locaisDaCidade(SEM, capital, GEN)) === JSON.stringify(locaisDaCidade(SEM, capital, GEN)), "locais são estáveis entre chamadas");
const semCosta = g1.cidades.filter((c) => c.bioma !== "costa");
ok(semCosta.every((c) => !locaisDaCidade(SEM, c, GEN).some((l) => l.tipo === "docas")), "cidade sem costa não ganha docas");

console.log("\n[A GENTE — ninguém é 'um taverneiro']");
const taverna = locaisDaCidade(SEM, capital, GEN).find((l) => l.tipo === "taverna");
const povo = genteDoLocal(SEM, taverna, GEN);
for (const p of povo) console.log(`  ${p.nome} — ${p.raca}, ${p.papel}, ${p.traco}, ${p.modo}; ${p.vontade}`);
ok(povo.length >= 2, `a taverna "${taverna.nome}" já vem com ${povo.length} pessoas`);
ok(povo.every((p) => p.nome && p.raca && p.papel && p.traco && p.vontade), "cada uma tem nome, raça, ofício, traço e vontade própria");
ok(JSON.stringify(genteDoLocal(SEM, taverna, GEN)) === JSON.stringify(povo), "a mesma taverna tem sempre a mesma gente");
const generos = new Set();
for (const c of g1.cidades) for (const l of locaisDaCidade(SEM, c, GEN)) for (const p of genteDoLocal(SEM, l, GEN)) generos.add(p.genero_pessoa);
ok(generos.size === 2, "o mundo tem homens e mulheres (a diversidade é do gerador, não do Mestre)");

console.log("\n[O QUE ESTÁ ESCONDIDO — o baú da taverna]");
for (const c of g1.cidades.slice(0, 3)) {
  for (const s of segredosDaCidade(SEM, c, GEN)) console.log(`  ${c.nome}: ${s.icone} em ${s.local} — ${s.o} (teste de ${s.acha}, dif. ${s.dc})`);
}
const segs = segredosDaCidade(SEM, capital, GEN);
ok(segs.length >= 1 && segs.every((s) => s.local && s.dc), "todo segredo mora num local nomeado e tem dificuldade");
const locaisDaCap = locaisDaCidade(SEM, capital, GEN).map((l) => l.nome);
ok(segs.every((s) => locaisDaCap.includes(s.local)), "o segredo está sempre num local que existe de verdade");

console.log("\n[CRIATURAS — variedade de nível é de propósito]");
const reg = g1.regioes[0];
const bichos = criaturasDaRegiao(SEM, reg, GEN);
console.log(`  ${reg.nome} (${reg.bioma}): ${bichos.map((b) => `${b.nome} nv${b.nivel} — ${b.comportamento}`).join(" · ")}`);
ok(bichos.length >= 3, "cada região tem sua fauna");
ok(new Set(bichos.map((b) => b.nome)).size === bichos.length, "sem criatura repetida na mesma região");
ok(bichos[0].nivel <= bichos[bichos.length - 1].nivel, "vêm ordenadas do mais fraco ao mais forte");
const todos = g1.regioes.flatMap((r) => criaturasDaRegiao(SEM, r, GEN));
ok(Math.max(...todos.map((b) => b.nivel)) - Math.min(...todos.map((b) => b.nivel)) >= 6, "o mundo tem bicho muito abaixo e muito acima do herói");

console.log("\n[CHEFES]");
const chefes = chefesDoMundo(SEM, g1, GEN);
for (const c of chefes) console.log(`  ${c.linha === "principal" ? "★" : "·"} ${c.nome} — nv ${c.nivel}${c.gd ? ` GD ${c.gd}` : ""}, ${c.regiao}; ${c.personalidade}; ${c.motivo}`);
ok(chefes.filter((c) => c.linha === "principal").length === 1, "existe exatamente UM chefe de linha principal");
ok(chefes.length >= 4, `e ${chefes.length - 1} secundários que podem nunca aparecer`);
ok(chefes[0].nivel >= 14, `o principal é o teto do mundo (nv ${chefes[0].nivel})`);
ok(chefes.every((c) => c.personalidade && c.motivo), "todo chefe tem personalidade e motivo");
ok(JSON.stringify(chefesDoMundo(SEM, g1, GEN)) === JSON.stringify(chefes), "os chefes são os mesmos a cada consulta");

console.log("\n[O LIVRO-RAZÃO — o que vai para o save]");
let base = garantirBase(null);
base = matar(base, povo[0].nome);
base = saquear(base, segs[0].id);
base = revelar(base, "chefe|0");
const tamanho = JSON.stringify(base).length;
console.log(`  ${JSON.stringify(base)}`);
console.log(`  tamanho no save: ${tamanho} caracteres`);
ok(tamanho < 400, "o mundo inteiro cabe em algumas centenas de bytes — nada é armazenado, tudo é recalculado");
ok(estaMorto(base, povo[0].nome) && estaMorto(base, povo[0].nome.toUpperCase()), "morte é reconhecida sem depender de maiúscula");
ok(foiSaqueado(base, segs[0].id), "segredo achado fica marcado");
ok(matar(matar(base, "X"), "X").mortos.filter((m) => m === "X").length === 1, "matar duas vezes não duplica o nome");

console.log("\n[CONSULTA — o que o Mestre recebe]");
const q = oQueExisteAqui(SEM, g1, capital.nome, base, GEN);
ok(!q.gente.some((p) => p.nome === povo[0].nome), "o morto sai da lista de gente viva");
ok(!q.segredos.some((s) => s.id === segs[0].id), "o segredo saqueado some da lista");
const txt = resumoDaqui(SEM, g1, capital.nome, base, GEN);
console.log("  " + txt.split("\n").slice(0, 3).join("\n  ").slice(0, 700));
ok(/use ISTO, não invente/.test(txt), "o bloco manda o Mestre usar a base");
ok(!txt.includes(povo[0].nome), "e não vaza o nome do morto");
const chefesTxt = resumoChefesPrompt(SEM, g1, base, GEN);
ok(/LINHA PRINCIPAL/.test(chefesTxt), "os chefes chegam marcados por linha");
const baseComChefeMorto = matar(base, chefes[0].nome);
ok(!resumoChefesPrompt(SEM, g1, baseComChefeMorto, GEN).includes(chefes[0].nome), "chefe morto some do prompt para sempre");

console.log("\n[RECONCILIAÇÃO — o combate busca a ficha na base]");
const achado = chefePorNome(SEM, g1, GEN, chefes[1].nomeCurto);
ok(achado && achado.nivel === chefes[1].nivel, `"${chefes[1].nomeCurto}" encontra a ficha (nv ${achado && achado.nivel})`);
const bicho = criaturaPorNome(SEM, g1, GEN, bichos[0].nome);
ok(bicho && bicho.nivel === bichos[0].nivel, `"${bichos[0].nome}" encontra o nível da região (nv ${bicho && bicho.nivel})`);
ok(criaturaPorNome(SEM, g1, GEN, "Coisa Que Não Existe") === null, "nome desconhecido não inventa ficha");

console.log(falhas ? `\n${falhas} FALHA(S)` : "\nTudo passou");
process.exit(falhas ? 1 : 0);
