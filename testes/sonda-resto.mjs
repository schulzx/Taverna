/* Sonda dos demais sistemas, na ordem pedida:
   companheiros, combate, descanso longo, mercado, morte, diplomacia, ascensao. */
import { garantirFichaCompanheiro, decidirAcaoCompanheiro } from "../src/companheiros.js";
import { MAX_COMPANHEIROS } from "../src/constantes.js";
import { evoluirCompanheiro } from "../src/regras-jogo.js";
import { resolverAtaque, testeDeMorte, aplicarTesteMorte, pvEsperadoInimigo, gerarEspolios, querFugir, rolarIniciativa, novosRecursos } from "../src/combate.js";
import { limparPorDescanso, criarCondicao } from "../src/condicoes.js";
import { mercadoresDaCidade, precoDeCompra, precoDeVenda } from "../src/mercado.js";
import { CAMINHOS_ASCENSAO, caminhoPorId, GRAUS, grauDe, gdMaximoPorNivel } from "../src/divindades.js";
import { TRATADOS } from "../src/mapa.js";
import { gerarGeografia } from "../src/geografia.js";

const A = [];
const anota = (grau, o) => A.push({ grau, o });

console.log("=== COMPANHEIROS ===\n");
{
  const c = garantirFichaCompanheiro({ nome: "Kael", conceito: "Batedor", nivel: 1, vida: 12, vidaMax: 12 });
  console.log("ficha gerada:", JSON.stringify({ classe: c.classe, hab: (c.habilidades || []).map((h) => h.nome), pv: c.vidaMax, vinculo: c.vinculo }));
  if (!(c.habilidades || []).length) anota("alto", "companheiro entra sem habilidade nenhuma — o motor não tem o que jogar por ele");

  /* ele evolui? */
  let e = { ...c };
  for (const xp of [100, 500, 2000, 8000]) { e = evoluirCompanheiro({ ...e, xp: (e.xp || 0) + xp }); }
  console.log(`depois de 10.600 XP: nível ${e.nivel} · ${e.vidaMax} PV · ${(e.habilidades || []).length} habilidades`);
  if (e.nivel <= 1) anota("alto", "companheiro não sobe de nível nem com 10 mil XP");
  if ((e.habilidades || []).length <= (c.habilidades || []).length) anota("medio", "companheiro sobe de nível e NÃO aprende habilidade nova");

  /* ele decide? */
  const alvos = [{ nome: "Lobo", vida: 20, vidaMax: 20 }];
  const decisoes = {};
  for (let i = 0; i < 200; i++) {
    const d = decidirAcaoCompanheiro(e, { inimigos: alvos, aliados: [{ nome: "Herói", vida: 10, vidaMax: 60 }], heroi: { nome: "Herói", vida: 10, vidaMax: 60 } });
    const k = d && (d.tipo || d.acao || "?"); decisoes[k] = (decisoes[k] || 0) + 1;
  }
  console.log("200 decisões:", JSON.stringify(decisoes));
  if (Object.keys(decisoes).length === 1) anota("medio", "o companheiro toma sempre a MESMA decisão — não há tática, só repetição");
  console.log("teto de companheiros:", MAX_COMPANHEIROS);
}

console.log("\n=== COMBATE: FUGA, INICIATIVA, ESPÓLIO ===\n");
{
  const fracos = [{ nome: "Lacaio", vida: 1, vidaMax: 20, ameaca: "fraco" }];
  let fugiram = 0;
  for (let i = 0; i < 200; i++) if (querFugir(fracos[0], { rodada: 3 })) fugiram++;
  console.log(`inimigo a 1/20 PV quer fugir em ${fugiram}/200 tentativas`);
  if (fugiram === 0) anota("medio", "nenhum inimigo foge, nem a 5% de PV — a fuga do inimigo não acontece");

  const ord = rolarIniciativa([{ nome: "Herói", destreza: 3 }, { nome: "A" }, { nome: "B" }]);
  console.log("iniciativa:", JSON.stringify((ord || []).map((x) => x.nome || x)));

  for (const nv of [1, 10, 20]) {
    const e = gerarEspolios([{ nome: "Chefe", nivel: nv, ameaca: "lendario", vidaMax: pvEsperadoInimigo(nv, "lendario") }], nv);
    console.log(`espólio de um lendário nv${nv}: ${JSON.stringify(e)}`);
  }
}

console.log("\n=== MORTE DO HERÓI ===\n");
{
  let m = { sucessos: 0, falhas: 0, rolagens: [] };
  let voltas = 0, morreu = false, salvou = false;
  while (voltas++ < 20) {
    const r = testeDeMorte();
    m = aplicarTesteMorte(m, r);
    if (m.falhas >= 3) { morreu = true; break; }
    if (m.sucessos >= 3) { salvou = true; break; }
  }
  console.log(`teste de morte em ${voltas} rolagens → ${morreu ? "MORREU" : salvou ? "estabilizou" : "indefinido"} · ${JSON.stringify(m)}`);
  if (!morreu && !salvou) anota("alto", "o teste de morte não termina: nem mata nem estabiliza em 20 rolagens");
  /* a distribuicao: quantas vezes o heroi morre de fato? */
  let mortes = 0;
  for (let i = 0; i < 500; i++) {
    let x = { sucessos: 0, falhas: 0, rolagens: [] };
    for (let k = 0; k < 20; k++) { x = aplicarTesteMorte(x, testeDeMorte()); if (x.falhas >= 3 || x.sucessos >= 3) break; }
    if (x.falhas >= 3) mortes++;
  }
  console.log(`em 500 quedas a 0 PV, o herói morre ${mortes} vezes (${(mortes / 5).toFixed(0)}%)`);
}

console.log("\n=== DESCANSO LONGO ===\n");
{
  const cs = ["envenenado", "sangrando", "exausto", "caido", "cego", "atordoado", "agarrado", "queimando", "paralisado", "enfraquecido", "lento", "amedrontado", "abencoado", "inspirado"].map((id) => criarCondicao(id)).filter(Boolean);
  const curto = limparPorDescanso(cs, "curto");
  const longo = limparPorDescanso(cs, "longo");
  console.log("curto limpa:", curto.removidas.map((c) => c.nome).join(", ") || "nada");
  console.log("longo limpa:", longo.removidas.map((c) => c.nome).join(", ") || "nada");
  console.log("longo DEIXA:", longo.condicoes.map((c) => c.nome).join(", ") || "nada");
  const ruinsQueFicam = longo.condicoes.filter((c) => c.tipo === "ruim");
  if (ruinsQueFicam.length) anota("medio", `descanso longo não limpa: ${ruinsQueFicam.map((c) => c.nome).join(", ")} — condição ruim que dura para sempre`);
  const bonsQueSaem = longo.removidas.filter((c) => c.tipo === "bom");
  if (bonsQueSaem.length) anota("baixo", `descanso longo apaga bênção: ${bonsQueSaem.map((c) => c.nome).join(", ")}`);
}

console.log("\n=== MERCADO ===\n");
{
  const mapa = gerarGeografia("sonda|mercado", null);
  for (const c of mapa.cidades.slice(0, 4)) {
    const ms = mercadoresDaCidade("sonda|mercado", c, 1, "Fantasia medieval"); const est = ms.flatMap(m=>m.estoque||[]);
    console.log(`${c.nome.padEnd(18)} ${c.porte.padEnd(10)} ${est.length} itens${est.length ? " · ex: " + est.slice(0, 3).map((i) => `${i.nome} ◉${i.preco}`).join(", ") : ""}`);
    if (!est.length) anota("alto", `${c.nome} (${c.porte}) não tem nada à venda`);
  }
  const it = { nome: "Espada Curta", raridade: "comum", valor: 20 };
  console.log("compra:", precoDeCompra ? precoDeCompra(it) : "(sem função)", "· venda:", precoDeVenda ? precoDeVenda(it) : "(sem função)");
}

console.log("\n=== DIPLOMACIA ===\n");
console.log("tratados:", Object.keys(TRATADOS).join(", "));
console.log(JSON.stringify(TRATADOS, null, 0).slice(0, 300));

console.log("\n=== ASCENSÃO ===\n");
{
  console.log("caminhos:", CAMINHOS_ASCENSAO.map((c) => `${c.id} (${(c.provas || []).length} provas)`).join(" · "));
  for (const c of CAMINHOS_ASCENSAO) {
    if (!(c.provas || []).length) anota("alto", `caminho de ascensão "${c.id}" não tem prova nenhuma`);
    for (const p of c.provas || []) if (p.dificuldade == null && p.dc == null) anota("medio", `prova "${p.id || p.nome}" sem dificuldade definida`);
  }
  console.log("graus:", GRAUS.map((g) => g.titulo || g.nome).join(" → "));
  for (const nv of [1, 10, 15, 20]) console.log(`  nv${nv}: GD máximo ${gdMaximoPorNivel(nv)}`);
}

console.log("\n\n=== ACHADOS ===\n");
if (!A.length) console.log("nada torto nesta sonda.");
for (const a of A) console.log(`[${a.grau}] ${a.o}`);
