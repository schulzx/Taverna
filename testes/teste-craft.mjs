import {
  COMPONENTES, RECEITAS, OFICIOS, componentePorId, comoComponente, itemComponente,
  receitaPorId, produtoDaReceita, contarComponentes, faltaPara, receitasDisponiveis,
  forjarNaBancada, aplicarCraft, textoDoCraft, envelopeDoCraft, colherComponentes, despojosDe,
} from "../src/craft.js";
import { CONSUMIVEIS, comoConsumivel, consumivelPorId } from "../src/pocoes.js";

let falhas = 0;
const ok = (c, t) => { if (!c) { falhas++; console.log("  FALHA:", t); } else console.log("  ok:", t); };

console.log("\n[CATÁLOGO — nada aqui pode ser inventado depois]");
ok(new Set(COMPONENTES.map((c) => c.id)).size === COMPONENTES.length, `${COMPONENTES.length} componentes, nenhum id duplicado`);
ok(new Set(RECEITAS.map((r) => r.id)).size === RECEITAS.length, `${RECEITAS.length} receitas, nenhum id duplicado`);
const semProduto = RECEITAS.filter((r) => !consumivelPorId(r.produz));
ok(semProduto.length === 0, `toda receita produz um consumível REAL do catálogo${semProduto.length ? ` — quebradas: ${semProduto.map((r) => r.produz)}` : ""}`);
const semComp = RECEITAS.flatMap((r) => (r.custo || []).map(([id]) => id)).filter((id) => !componentePorId(id));
ok(semComp.length === 0, `todo custo aponta para um componente que existe${semComp.length ? ` — órfãos: ${[...new Set(semComp)]}` : ""}`);
ok(RECEITAS.every((r) => OFICIOS[r.oficio]), "todo ofício está definido");
const cobertos = new Set(RECEITAS.map((r) => r.produz));
console.log(`  consumíveis que dá para fabricar: ${cobertos.size} de ${CONSUMIVEIS.length}`);
ok(cobertos.size >= CONSUMIVEIS.length - 1, "quase todo consumível do jogo tem receita");

console.log("\n[O PRODUTO É IDÊNTICO AO COMPRADO — não existe versão 'de craft']");
const rc = receitaPorId("r_cura_m");
ok(produtoDaReceita(rc) === consumivelPorId("cura_m"), "a receita aponta para o MESMO objeto do catálogo");
console.log(`  r_cura_m → ${produtoDaReceita(rc).nome} (${produtoDaReceita(rc).dado.join("d").replace(/^(\d+)d(\d+)$/, "$1d$2")})`);

console.log("\n[LEITURA DA BOLSA — string solta e objeto]");
ok(comoComponente("Erva Amarga") && comoComponente("Erva Amarga").id === "erva_amarga", "reconhece pelo nome cru");
ok(comoComponente(itemComponente("raiz_sangue")).id === "raiz_sangue", "reconhece o objeto gerado pelo sistema");
ok(comoComponente({ nome: "Poção de Cura Média" }) === null, "poção não é componente");
ok(comoComponente(null) === null && comoComponente("qualquer coisa") === null, "lixo não vira componente");
const bolsa = ["Erva Amarga", "Erva Amarga", itemComponente("raiz_sangue"), { nome: "Poção de Cura Pequena" }];
const conta = contarComponentes(bolsa);
console.log("  contagem:", JSON.stringify(conta));
ok(conta.erva_amarga === 2 && conta.raiz_sangue === 1, "conta certo e ignora o que não é componente");

console.log("\n[O QUE FALTA]");
ok(faltaPara(receitaPorId("r_cura_p"), bolsa).length === 0, "cura pequena: dá para forjar com 2 ervas");
const f = faltaPara(receitaPorId("r_cura_g"), bolsa);
console.log("  falta para cura grande:", f.map((x) => `${x.nome} ${x.tem}/${x.precisa}`).join(", "));
ok(f.length === 2, "cura grande: falta raiz e musgo, com as quantidades certas");
ok(faltaPara(receitaPorId("r_cura_m"), bolsa).length === 0, "cura média cabe exatamente no que tenho");

console.log("\n[NÍVEL ABRE O CADERNO]");
ok(receitasDisponiveis(1).every((r) => r.nivel <= 1), "nível 1 só vê as básicas");
console.log(`  nv 1: ${receitasDisponiveis(1).length} receitas · nv 5: ${receitasDisponiveis(5).length} · nv 20: ${receitasDisponiveis(20).length}`);
ok(receitasDisponiveis(20).length === RECEITAS.length, "nível 20 vê tudo");
ok(receitasDisponiveis(1).length < receitasDisponiveis(8).length, "o caderno cresce");

console.log("\n[A BANCADA — 4000 tentativas por faixa de modificador]");
for (const mod of [0, 3, 6]) {
  let s = 0, c = 0, des = 0;
  for (let i = 0; i < 4000; i++) {
    const r = forjarNaBancada(receitaPorId("r_cura_m"), mod);
    if (r.ok) s++;
    if (r.critico) c++;
    if (r.desastre) des++;
  }
  console.log(`  mod +${mod} vs dif 14: ${(s / 40).toFixed(0)}% sucesso · ${(c / 40).toFixed(0)}% dobrado · ${(des / 40).toFixed(0)}% perde tudo`);
}
let nat1ok = 0;
for (let i = 0; i < 3000; i++) { const r = forjarNaBancada(receitaPorId("r_ataduras"), 30); if (r.dado === 1 && r.ok) nat1ok++; }
ok(nat1ok === 0, "1 natural falha mesmo com modificador absurdo");

console.log("\n[APLICAR — a bolsa depois]");
const heroi = { nome: "T", inventario: ["Erva Amarga", "Erva Amarga", "Erva Amarga", itemComponente("raiz_sangue"), { nome: "Espada" }] };
const rec = receitaPorId("r_cura_m");   // custa 2 ervas + 1 raiz
const bom = aplicarCraft(heroi, rec, { ok: true, critico: false, qtd: 1, devolve: 0 });
console.log("  sucesso →", bom.inventario.map((x) => (typeof x === "string" ? x : x.nome)).join(", "));
ok(contarComponentes(bom.inventario).erva_amarga === 1, "sobrou exatamente 1 erva");
ok(!contarComponentes(bom.inventario).raiz_sangue, "a raiz foi consumida");
ok(bom.inventario.some((x) => comoConsumivel(x) && comoConsumivel(x).id === "cura_m"), "a poção entrou na bolsa");
ok(bom.inventario.some((x) => x && x.nome === "Espada"), "o que não é componente nem encosta");

const critico = aplicarCraft(heroi, rec, { ok: true, critico: true, qtd: 2, devolve: 0 });
ok(critico.inventario.filter((x) => comoConsumivel(x) && comoConsumivel(x).id === "cura_m").length === 2, "crítico entrega duas");

const meia = aplicarCraft(heroi, rec, { ok: false, devolve: 0.5, desastre: false });
console.log("  falha comum →", meia.inventario.map((x) => (typeof x === "string" ? x : x.nome)).join(", "));
ok(contarComponentes(meia.inventario).erva_amarga === 2, "falha comum devolve 1 das 2 ervas (metade)");
ok(!meia.inventario.some((x) => comoConsumivel(x)), "e NÃO entrega poção nenhuma");

const perdeu = aplicarCraft(heroi, rec, { ok: false, devolve: 0, desastre: true });
ok(contarComponentes(perdeu.inventario).erva_amarga === 1 && !contarComponentes(perdeu.inventario).raiz_sangue, "desastre não devolve nada");

console.log("\n[O QUE O JOGADOR E O MESTRE LEEM]");
const rOk = { ok: true, critico: false, qtd: 1, rolagem: "d20 → 15+4 = 19 vs dif. 14", devolve: 0 };
const rFail = { ok: false, critico: false, qtd: 0, rolagem: "d20 → 4+4 = 8 vs dif. 14", devolve: 0.5, desastre: false };
console.log("  " + textoDoCraft(rec, rOk, true));
console.log("  " + textoDoCraft(rec, rFail, true));
console.log("  " + textoDoCraft(rec, { ...rFail, desastre: true, devolve: 0 }, true));
ok(/NÃO envie itens/.test(envelopeDoCraft(rec, rOk)), "no sucesso o Mestre é proibido de duplicar o item");
ok(/NÃO me dê o item/.test(envelopeDoCraft(rec, rFail)), "na falha ele é proibido de dar o item mesmo assim");
ok(/não invente|NÃO invente/.test(envelopeDoCraft(rec, rFail)), "e de inventar um consolo material");

console.log("\n[DE ONDE VEM A MATÉRIA-PRIMA]");
for (const b of ["floresta", "montanha", "deserto", "pantano"]) {
  const amostra = {};
  for (let i = 0; i < 600; i++) for (const c of colherComponentes(b, 3)) amostra[c.nome] = (amostra[c.nome] || 0) + 1;
  console.log(`  ${b.padEnd(9)} → ${Object.entries(amostra).sort((a, z) => z[1] - a[1]).map(([n, q]) => `${n} ${(q / 6).toFixed(0)}%`).join(" · ")}`);
}
ok(colherComponentes("floresta", 0).length >= 1, "sempre volta com alguma coisa");
ok(colherComponentes("montanha", 0).every((c) => c.classe === "mineral" || c.classe === "erva"), "montanha rende pedra e musgo, não glândula");
const muitos = Array.from({ length: 400 }, () => colherComponentes("floresta", 6).length);
ok(muitos.filter((n) => n === 2).length > 100, "percepção alta traz o segundo achado com frequência");
ok(colherComponentes("bioma_que_nao_existe", 0).length >= 1, "bioma desconhecido cai na planície, não quebra");

const alvos = [{ nome: "Elemental de Fogo", ameaca: "lendario" }, { nome: "Aranha Gigante", ameaca: "elite" }, { nome: "Lobo Cinzento", ameaca: "comum" }];
const cont = {};
for (let i = 0; i < 800; i++) for (const c of despojosDe(alvos)) cont[c.nome] = (cont[c.nome] || 0) + 1;
console.log("  abates:", Object.entries(cont).map(([n, q]) => `${n} ${(q / 8).toFixed(0)}%`).join(" · "));
ok(despojosDe([{ nome: "Elemental de Fogo", ameaca: "lendario" }])[0].id === "essencia", "criatura mágica deixa essência");
ok(despojosDe([{ nome: "Aranha Gigante", ameaca: "lendario" }])[0].id === "glandula", "peçonhenta deixa glândula");
ok(despojosDe([{ nome: "Javali", ameaca: "lendario" }])[0].id === "couro_curtido", "bicho comum deixa couro");
ok((cont["Essência Residual"] || 0) > (cont["Retalho de Couro"] || 0), "lendário rende mais que o comum");
ok(despojosDe([]).length === 0 && despojosDe([null]).length === 0, "lista vazia ou suja não quebra");

console.log("\n[ECONOMIA — fazer tem que valer mais que comprar]");
for (const id of ["r_cura_p", "r_cura_m", "r_cura_g", "r_mana_g"]) {
  const r = receitaPorId(id);
  const custo = (r.custo || []).reduce((s, [cid, q]) => s + (componentePorId(cid).valor * q), 0);
  const p = produtoDaReceita(r);
  console.log(`  ${p.nome.padEnd(26)} material ◉ ${String(custo).padStart(3)} → vale ◉ ${p.valor}  (×${(p.valor / custo).toFixed(1)})`);
  if (custo >= p.valor) { falhas++; console.log("    FALHA: sai mais caro fazer do que comprar"); }
}

console.log(falhas ? `\n${falhas} FALHA(S)` : "\nTudo passou");
process.exit(falhas ? 1 : 0);
