const S = "../src/";
const { gerarGeografia } = await import(S + "geografia.js");
const G = await import(S + "guildas.js");

const semente = "O Decimo Portao";
const mapa = gerarGeografia(semente, null, null);
const gs = G.guildasDoMundo(semente, mapa, "Fantasia medieval", null);
console.log("guildas no mundo:", gs.length, "\n");
for (const g of gs) {
  const of = G.oficioPorId(g.oficio);
  console.log(`${of.icone} ${g.nome} — ${of.nome}`);
  console.log(`   sede ${g.sede} · mestre ${g.mestre} · poder ${g.poder} · cofre ◉${g.cofre} · ${g.membros.length} membros`);
  console.log(`   "${g.lema}"`);
  console.log(`   leis: ${G.leisDa(g).map((l) => l.icone + " " + l.nome).join(" · ")}`);
  console.log(`   atrito: ${JSON.stringify(g.atrito)}`);
}

const g0 = gs[0];
console.log("\n== ENTRAR ==");
console.log("nivel 1, sem moeda:", JSON.stringify(G.podeEntrar(g0, { nivel: 1, moedas: 0 })));
const ok = G.podeEntrar(g0, { nivel: 5, moedas: 500 });
console.log("nivel 5, com moeda:", ok.ok, "· taxa", ok.taxa, "· prova:", ok.prova && ok.prova.titulo);
console.log("ja e de outra:", G.podeEntrar(g0, { nivel: 5, moedas: 500 }, { jaEDeOutra: "a Casa Franca" }).motivo);

let g = G.entrar(g0, { dia: 3 });
console.log("\n== SUBIR ==  posto:", G.nomeDoPosto(g, g.posto));
for (const q of [70, 130, 250, 450]) {
  const r = G.contribuir(g, q); g = r.guilda;
  console.log(`  +${q} → ${G.nomeDoPosto(g, g.posto)}${r.subiu ? "  ⬆ " + r.subiu.o : ""}`);
}
console.log("delegados:", G.podeDelegar(g), "· saque do cofre:", G.degrauDe(g.posto).saque);

console.log("\n== LEI ==");
const inf = G.conferirLeis({ ...g, vistoEm: 3 }, { dia: 60, mortos: [], contratosDeFora: 0 });
console.log("sumido 57 dias:", JSON.stringify(inf));
const p = G.punir(g, inf); console.log("punição:", p.caiu ? `caiu para ${p.caiu.nome}` : "só falta", "· faltas", p.guilda.faltas);
console.log("dízimo de 200:", G.dizimoDe(g, 200));

console.log("\n== GUERRA ==");
let a = G.atritar(g, "guilda|sombras", 60, "contrato disputado");
console.log("+60:", a.virou && `${a.virou.de} → ${a.virou.para}`);
a = G.atritar(a.guilda, "guilda|sombras", 40, "um dos nossos caiu");
console.log("+40:", a.virou && `${a.virou.de} → ${a.virou.para}`, "· guerraCom:", a.guilda.guerraCom);

console.log("\n== TRABALHO DA CASA ==");
const cidades = mapa.cidades.slice(0, 6);
const trabs = G.trabalhosDaCasa(a.guilda, { semente, dia: 9, nivel: 6, cidades, gente: [{ nome: "Vantel" }, { nome: "Zulmira" }], criaturas: [{ nome: "Lobo Cinzento" }], lugares: [{ nome: "A Capela do Juramento" }] });
for (const t of trabs) console.log(`  ${t.icone} ${t.titulo} — nv${t.nivel} · ◉${t.paga} · contribui ${t.contribui}${t.guerra ? "  [GUERRA]" : ""}`);

console.log("\n== DELEGAR ==");
const d = G.delegar(a.guilda, trabs[0], a.guilda.membros[0].nome, { dia: 9 });
console.log(d.ok ? `  ${d.tarefa.quem} saiu — ${d.tarefa.dias} dias, ${d.tarefa.chance}% de chance` : "  " + d.motivo);
if (d.ok) { let seed = 1; const r = G.resolverTarefa(d.tarefa, () => ((seed = (seed * 9301 + 49297) % 233280) / 233280)); console.log("  →", G.DESFECHO_TAREFA[r.desfecho].diz(r)); }

console.log("\n== FUNDAR ==");
console.log(" nv8:", G.podeFundar({ nivel: 8, moedas: 5000 }, { cidade: "Prata Velha" }).motivo);
console.log(" nv10:", JSON.stringify(G.podeFundar({ nivel: 10, moedas: 5000 }, { cidade: "Prata Velha" })));
const minha = G.fundar({ nome: "A Mesa Quebrada", oficio: "laminas", cidade: "Prata Velha", mestre: "Iris", dia: 40, grupo: [{ nome: "Kael" }] });
console.log(" ", G.linhaDaGuilda(minha), "· manda?", G.podeMandar(minha), "· membros:", minha.membros.length);
const ad = G.admitir(minha, { nome: "Zulmira", papel: "taverneira" });
console.log("  admitir Zulmira:", ad.ok, "→", ad.guilda.membros.map((m) => m.nome).join(", "));
console.log("\n", G.envelopeDaGuilda(minha).slice(0, 200) + "…");
