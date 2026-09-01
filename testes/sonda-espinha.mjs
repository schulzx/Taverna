const S = "../src/";
const { gerarGeografia } = await import(S + "geografia.js");
const { estenderEspinha, resumoDaEspinha, linhaDoMarco, marcoAtual } = await import(S + "saga.js");
const { estruturaPorId, custoDaEtapa } = await import(S + "historia.js");

const semente = "O Decimo Portao";
const mapa = gerarGeografia(semente, null, null);
console.log("cidades:", (mapa.cidades || []).length, "· regioes:", (mapa.regioes || []).length);

for (const estr of ["jornada", "misterio"]) {
  const e = estenderEspinha({ semente, mapa, estrutura: estr, cidadeInicial: (mapa.cidades[0] || {}).nome });
  const est = estruturaPorId(estr);
  console.log("\n===== " + est.nome + " =====", JSON.stringify(resumoDaEspinha(e)));
  e.atos.forEach((a, i) => {
    console.log(`\n-- ato ${i}: ${est.etapas[i].nome} (custo ${custoDaEtapa(est, i)})`);
    a.marcos.forEach((m) => console.log("   " + linhaDoMarco(m) + "   [" + m.feitio + " · " + JSON.stringify(m.condicao) + "]"));
  });
}

// determinismo
const a = estenderEspinha({ semente, mapa, estrutura: "jornada" });
const b = estenderEspinha({ semente, mapa, estrutura: "jornada" });
console.log("\ndeterministica:", JSON.stringify(a) === JSON.stringify(b));
