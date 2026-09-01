import {
  custoDoDegrau, custoAcumulado, pontosAtributoTotais, tetoAtributo,
  baseDeCriacao, gastoEmAtributos, pontosAtributoDisponiveis, podeSubirAtributo,
  subirAtributo, redistribuirAtributos, tabelaDeAtributos, atributoDaHabilidade,
  valorParaHabilidade, conselhoDeBuild, migrarAtributos,
} from "../src/atributos.js";

let falhas = 0;
const ok = (c, t) => { if (!c) { falhas++; console.log("  FALHA:", t); } else console.log("  ok:", t); };

console.log("\n[custo dos degraus]");
console.log("  ", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((v) => `+${v}→+${v + 1}: ${custoDoDegrau(v)}`).join(" · "));
ok(custoAcumulado(5) === 7, `chegar a +5 custa 7 pontos (deu ${custoAcumulado(5)})`);
ok(custoAcumulado(7) === 13, `chegar a +7 custa 13 (deu ${custoAcumulado(7)})`);
ok(custoAcumulado(8) === 17, `chegar a +8 custa 17 (deu ${custoAcumulado(8)})`);

console.log("\n[orçamento por nível]");
for (const nv of [1, 5, 10, 15, 20]) console.log(`  nv ${String(nv).padStart(2)}: ${pontosAtributoTotais(nv)} pontos · teto +${tetoAtributo(nv)}`);
const orc20 = pontosAtributoTotais(20);
ok(orc20 === 38, `nível 20 rende 38 pontos (deu ${orc20})`);
ok(6 * custoAcumulado(5) > orc20, `levar os SEIS a +5 custaria ${6 * custoAcumulado(5)} — não cabe nos ${orc20}`);
ok(2 * custoAcumulado(7) + custoAcumulado(5) <= orc20, "dois atributos em +7 e um em +5 cabem (a build focada existe)");

console.log("\n[mago-guerreiro: a build do pedido]");
const mg = {
  nome: "Vera", nivel: 20, raca: "Humano", classe: "Mago",
  atributos: { forca: 1, destreza: 1, vigor: 1, intelecto: 4, presenca: 1, percepcao: 1 },
  habilidades: [
    { nome: "Projétil Arcano" }, { nome: "Escudo Arcano" }, { nome: "Rajada de Fogo" },
    { nome: "Golpe Poderoso" }, { nome: "Investida" }, { nome: "Fúria de Batalha" },
  ],
};
const base = baseDeCriacao(mg);
console.log("  base reconstruída:", JSON.stringify(base));
ok(Object.values(base).reduce((s, v) => s + v, 0) <= 12, `base cabe no que a criação podia dar: 6 racial + 6 pontos (deu ${Object.values(base).reduce((s, v) => s + v, 0)})`);
ok(Object.keys(base).every((k) => base[k] <= mg.atributos[k]), "a base nunca inventa atributo acima do que a ficha tem");
const m = migrarAtributos(mg);
console.log(`  gasto: ${gastoEmAtributos(m)} · saldo migrado: ${m.pontosAtr}`);
ok(m.pontosAtr > 0, "save antigo recebe saldo em vez de ficar travado");

/* ficha realmente evoluída: um mago 20 do sistema velho, +5 em quase tudo */
const veterano = migrarAtributos({
  nome: "Antigo", nivel: 20, raca: "Elfo", classe: "Mago",
  atributos: { forca: 2, destreza: 5, vigor: 3, intelecto: 5, presenca: 2, percepcao: 5 },
  habilidades: [{ nome: "Projétil Arcano" }, { nome: "Rajada de Fogo" }],
});
console.log(`  veterano: base ${JSON.stringify(baseDeCriacao(veterano))} · gasto ${gastoEmAtributos(veterano)} · saldo ${veterano.pontosAtr}`);
ok(gastoEmAtributos(veterano) > 0, "quem subiu atributos no sistema velho tem gasto contabilizado");
ok(veterano.pontosAtr < pontosAtributoTotais(20), "e recebe só o troco — não ganha o orçamento inteiro de novo");
ok(veterano.pontosAtr >= 0, "o saldo nunca fica negativo");
ok(m.atributosVersao === 1 && migrarAtributos(m) === m, "migração é idempotente");

ok(atributoDaHabilidade("Projétil Arcano", mg) === "intelecto", "magia de mago escala com intelecto");
ok(atributoDaHabilidade("Golpe Poderoso", mg) === "forca", "golpe de guerreiro escala com força");
ok(atributoDaHabilidade("Fúria de Batalha", mg) === "forca", "Fúria de Batalha é do guerreiro → força");
ok(valorParaHabilidade(m, { nome: "Golpe Poderoso" }) === 1, "com força +1 o golpe de guerreiro sai fraco — é a consequência da build");
ok(valorParaHabilidade(m, { nome: "Projétil Arcano" }) === 4, "com intelecto +4 a magia sai forte");
console.log("  conselho:", conselhoDeBuild(m));
ok(/Força/.test(conselhoDeBuild(m)) && /Intelecto/.test(conselhoDeBuild(m)), "o conselho aponta os DOIS atributos da multiclasse");

console.log("\n[gastar pontos]");
let p = { ...m, pontosAtr: 10 };
const antes = p.atributos.forca;
const r1 = subirAtributo(p, "forca");
ok(r1.ok && r1.pers.atributos.forca === antes + 1, `força ${antes} → ${r1.pers.atributos.forca} por ${r1.custo} ponto(s)`);
ok(r1.pers.pontosAtr === 10 - r1.custo, `saldo desceu para ${r1.pers.pontosAtr}`);

let alto = { ...m, nivel: 12, atributos: { ...m.atributos, intelecto: 6 }, pontosAtr: 30 };
const chk = podeSubirAtributo(alto, "intelecto");
ok(!chk.pode && /teto/.test(chk.motivo), `no nível 12 o teto é +6 e trava: "${chk.motivo}"`);

let pobre = { ...m, atributos: { ...m.atributos, intelecto: 5 }, pontosAtr: 1 };
const chk2 = podeSubirAtributo(pobre, "intelecto");
ok(!chk2.pode && /custa 3/.test(chk2.motivo), `degrau caro exige poupança: "${chk2.motivo}"`);

console.log("\n[respec de atributos]");
const rd = redistribuirAtributos(m);
ok(rd.pontosAtr === pontosAtributoTotais(20), `devolve os ${rd.pontosAtr} pontos do nível 20`);
ok(rd.atributos.intelecto === base.intelecto, "volta exatamente à base de criação, nunca abaixo dela");
ok(gastoEmAtributos(rd) === 0, "depois do respec o gasto é zero");

console.log("\n[tabela para a interface]");
for (const l of tabelaDeAtributos(m)) {
  console.log(`  ${l.nome.padEnd(10)} +${l.valor}  próximo: ${l.custoProximo ?? "—"}  ${l.chave ? `★ ${l.classesQueUsam.join("/")}` : ""}`);
}
ok(tabelaDeAtributos(m).filter((l) => l.chave).length === 2, "a tabela marca os dois atributos-chave da multiclasse");

console.log(falhas ? `\n${falhas} FALHA(S)` : "\nTudo passou");
process.exit(falhas ? 1 : 0);
