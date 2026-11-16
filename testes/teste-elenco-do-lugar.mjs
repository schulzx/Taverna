/* ============================================================
   O ELENCO DO LUGAR (S4e, 16/11/2026) — testes/teste-elenco-do-lugar.mjs

   A prova jogada de 16/11 viu a estalagem e a chegada vazias na tela e com
   gente na prosa. Esta suíte prova a tabela e as quatro peças de
   src/elenco-do-lugar.js; a catraca das cenas (≥ 300 por semente, tela =
   pauta) mora em teste-quem-esta-aqui.mjs, ao lado da do posto.
   ============================================================ */
const S = "../src/";
const { ELENCO_DO_LUGAR, abertoAgora, tipoDoSitio, figuranteDoSitio, figurantesDaCidade, quemAtende } = await import(S + "elenco-do-lugar.js");
const { aGenteInventadaDaProsa } = await import(S + "motor/memoria-do-inventado.js");
const { oQueExisteAqui } = await import(S + "mundo-base.js");

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => { if (typeof cond === "function") { try { cond = cond(); } catch (e) { extra = String(e && e.message); cond = false; } } if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? "  → " + extra : "")); } };

console.log("\n§1 a tabela");
t("todo tipo tem expediente, dois ofícios e palavras", Object.values(ELENCO_DO_LUGAR.tipos).every((d) => (d.aberto === "sempre" || (Number.isFinite(d.aberto.de) && Number.isFinite(d.aberto.ate))) && d.oficio.length === 2 && d.palavras.length));
t("os nomes à mão calam (quem o sistema não pôs em cena não tem nome)", ELENCO_DO_LUGAR.nomesAMao === false);
t("o portão está em toda cidade", ELENCO_DO_LUGAR.sempreNaCidade.includes("portao"));

console.log("\n§2 o expediente");
t("a estalagem abre às 6h e fecha às 2h (atravessa a meia-noite)", abertoAgora("taverna", 6 * 60) && abertoAgora("taverna", 60) && !abertoAgora("taverna", 3 * 60));
t("o mercado fecha à noite", abertoAgora("mercado", 12 * 60) && !abertoAgora("mercado", 22 * 60));
t("o portão nunca fecha", abertoAgora("portao", 3 * 60));
t("sem relógio, aberto", abertoAgora("mercado", undefined));
t("tipo sem função: nunca aberto", !abertoAgora("beco", 12 * 60) && !abertoAgora(null, 0));

console.log("\n§3 o tipo do sítio");
const gente = [{ id: "Pedra das Águias|taverna|0", nome: "Orla Vau", local: "A Roda dos Insones" }];
t("pela gente da base do posto (o id diz o tipo)", tipoDoSitio({ nome: "A Roda dos Insones" }, gente) === "taverna");
t("sem artigo, o mesmo", tipoDoSitio({ nome: "Roda dos Insones" }, gente) === "taverna");
t("pelas palavras do nome: «a Estalagem do Corvo»", tipoDoSitio({ nome: "a Estalagem do Corvo" }, []) === "taverna");
t("«o portão norte» é portão (com acento e sem)", tipoDoSitio("o portão norte", []) === "portao" && tipoDoSitio("o portao norte", []) === "portao");
t("«a Feira» é mercado", tipoDoSitio("a Feira", []) === "mercado");
t("um beco não tem função", tipoDoSitio("o beco dos curtidores", []) === "");
t("o tipo que o lugar traz manda", tipoDoSitio({ nome: "Casa X", tipo: "forja" }, []) === "forja");
t("lixo não estoura", () => tipoDoSitio(null, 7) === "" && tipoDoSitio(undefined) === "");

console.log("\n§4 o figurante");
const f1 = figuranteDoSitio({ semente: "s4e", cidade: "Pedra das Águias", tipo: "taverna" });
const f2 = figuranteDoSitio({ semente: "s4e", cidade: "Pedra das Águias", tipo: "taverna" });
t("tem nome, ofício e género", !!(f1 && f1.nome && f1.rotulo && /^(homem|mulher)$/.test(f1.genero)), JSON.stringify(f1));
t("determinístico: a mesma semente, o mesmo figurante", JSON.stringify(f1) === JSON.stringify(f2));
t("o ofício concorda com o género", ELENCO_DO_LUGAR.tipos.taverna.oficio[f1.genero === "mulher" ? 1 : 0] === f1.rotulo);
t("não repete o primeiro nome de quem já existe", (() => { const f3 = figuranteDoSitio({ semente: "s4e", cidade: "Pedra das Águias", tipo: "taverna", usados: [f1.nome] }); return f3 && f3.nome.split(" ")[0] !== f1.nome.split(" ")[0]; })());
t("tipo sem tabela: ninguém", figuranteDoSitio({ semente: "s4e", cidade: "X", tipo: "ruína" }) === null);
let generos = { homem: 0, mulher: 0 };
for (let i = 0; i < 200; i++) { const f = figuranteDoSitio({ semente: "g" + i, cidade: "C", tipo: "mercado" }); if (f) generos[f.genero]++; }
t("os dois géneros aparecem (≥ 30 % cada em 200)", generos.homem >= 60 && generos.mulher >= 60, JSON.stringify(generos));

console.log("\n§5 quem atende");
t("a estalagem antes das 11h tem quem atenda", quemAtende({ nome: "A Roda dos Insones" }, { semente: "s4e", cidade: "Pedra das Águias", minuto: 8 * 60, gente }).length === 1);
t("às 3h a estalagem está fechada", quemAtende({ nome: "A Roda dos Insones" }, { semente: "s4e", cidade: "Pedra das Águias", minuto: 3 * 60, gente }).length === 0);
t("o beco: ninguém", quemAtende({ nome: "o beco" }, { semente: "s4e", cidade: "P", minuto: 600 }).length === 0);

console.log("\n§6 a memória do inventado conhece o figurante");
{
  const mapa = { cidades: [{ nome: "Pedra das Águias", porte: "vila", bioma: "planície", x: 0, y: 0 }], rotas: [] };
  const semente = "Prova S4e|Fantasia medieval";
  const base = oQueExisteAqui(semente, mapa, "Pedra das Águias", null, "Fantasia medieval");
  const figs = figurantesDaCidade({ semente, cidade: "Pedra das Águias", locais: base.locais, genero: "Fantasia medieval", usados: base.gente });
  t("a cidade tem um figurante por tipo de local (+ o portão)", figs.length === new Set([...base.locais.map((l) => l.tipo), "portao"]).size, figs.length + "");
  const nome = (figs.find((f) => f.nome.includes(" ")) || figs[0]).nome;
  const E = { personagem: { nome: "Vera Lume" }, npcs: {}, mapa };
  const marcados = aGenteInventadaDaProsa(`${nome} chegou com a manhã, trouxe um pão duro e o partiu com as mãos.`, E, { mundo: { semente, genero: "Fantasia medieval" } }).map((x) => x.nome);
  t("o figurante que o sistema pôs em cena não é acusado de invenção", !marcados.length, nome + " → " + marcados.join(","));
  const inventado = aGenteInventadaDaProsa("Ursa Sombravinda chegou com a manhã, trouxe um pão duro e o partiu com as mãos.", E, { mundo: { semente, genero: "Fantasia medieval" } }).map((x) => x.nome);
  t("…e o inventado continua a ser (Ursa Sombravinda)", inventado.includes("Ursa Sombravinda"), inventado.join(","));
}

console.log(`\nelenco do lugar (S4e): ${ok} passaram, ${mal} falharam`);
if (mal) process.exit(1);
