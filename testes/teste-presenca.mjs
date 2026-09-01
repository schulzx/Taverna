import {
  gdDeCriatura, reconciliarGraus, resolverPresenca, presencaDoHeroi,
  dificuldadeDaPresenca, DIFERENCA_MINIMA, EFEITOS_PRESENCA,
} from "../src/presenca-divina.js";

let falhas = 0;
const ok = (c, t) => { if (!c) { falhas++; console.log("  FALHA:", t); } else console.log("  ok:", t); };
const dadoFixo = (v) => () => v;

const panteao = [
  { nome: "Vharath", gd: 3, dominio: "das Tempestades" },
  { nome: "Ossimir", gd: 4, dominio: "dos Mortos" },
];

console.log("\n[O SISTEMA DESCOBRE O GRAU SOZINHO — o Mestre não precisa lembrar]");
const casos = [
  [{ nome: "Vharath, o Trovão Antigo" }, 3, "nome bate com o panteão → GD do deus, mesmo sem o campo"],
  [{ nome: "Ossimir" }, 4, "idem para um GD 4"],
  [{ nome: "Vharath", gd: 1 }, 3, "o panteão SOBREPÕE um gd errado mandado pelo Mestre"],
  [{ nome: "Avatar de Kaelis" }, 3, "criatura anunciada como divina, sem estar no panteão"],
  [{ nome: "Arauto divino do Norte" }, 3, "marca divina na descrição do nome"],
  [{ nome: "Capitão Bandido", gd: 2 }, 2, "gd declarado vale quando não há nada melhor"],
  [{ nome: "Orc Batedor" }, 0, "mortal continua mortal"],
  [{ nome: "Lobo", desc: "faminto e sarnento" }, 0, "descrição comum não vira divindade"],
];
for (const [ini, esperado, rot] of casos) {
  const gd = gdDeCriatura(ini, panteao);
  console.log(`  ${String(ini.nome).padEnd(26)} → GD ${gd}`);
  ok(gd === esperado, rot);
}

const entrada = [{ nome: "Vharath" }, { nome: "Orc" }, { nome: "Cultista", gd: 0 }];
const lista = reconciliarGraus(entrada, panteao);
ok(lista[0].gd === 3 && lista[0].gdPeloSistema, "reconciliar marca quem teve o GD descoberto pelo sistema");
ok(lista[1] === entrada[1] && lista[2] === entrada[2], "mortais passam intactos — nem o objeto é recriado");
ok(!gdDeCriatura(lista[1], panteao), "e continuam com grau zero");

console.log("\n[A RESISTÊNCIA — este é o efeito que você pediu para conferir]");
const heroi = { nome: "Vera", nivel: 20, atributos: { vigor: 3, presenca: 2 }, inventario: [], equipados: {} };
const grupo = [
  { nome: "Doran", vinculo: 1, atributos: { vigor: 2 } },
  { nome: "Íris", vinculo: 5, atributos: { vigor: 1 } },
];
const fonte = { nome: "Vharath", gd: 3 };
ok(dificuldadeDaPresenca(3) === 16 && dificuldadeDaPresenca(4) === 18, "dificuldade cresce com o grau (GD3 = 16, GD4 = 18)");

const falhou = resolverPresenca({ fonte, jogador: heroi, grupo, gdJogador: 0, rolar: dadoFixo(1), sortear: () => 0.5 });
console.log("  " + falhou.linhas.join("\n  "));
ok(!falhou.passouJogador && falhou.condJogador, `com rolagem baixa o herói é afetado: ${falhou.condJogador.nome}`);
ok(EFEITOS_PRESENCA.includes(falhou.condJogador.id), "a condição sai do catálogo (amedrontado/cego/enfeitiçado)");
ok(falhou.condJogador.turnos === 3 && falhou.condJogador.efeito, "vem com duração e efeito mecânico de verdade");
ok(falhou.afetados.length === 1 && falhou.afetados[0].nome === "Doran", "companheiro de vínculo baixo cai; o de vínculo 5 é imune");
ok(/JÁ está na ficha/.test(falhou.nota), "o envelope proíbe o Mestre de aplicar outra condição por cima");

/* cegueira especificamente — o exemplo que você deu */
const cego = resolverPresenca({ fonte, jogador: heroi, grupo: [], gdJogador: 0, rolar: dadoFixo(1), sortear: () => 0.34 });
ok(cego.condJogador.id === "cego", `dá para cair cego: "${cego.condJogador.nome} — ${cego.condJogador.efeito}"`);

const passou = resolverPresenca({ fonte, jogador: heroi, grupo, gdJogador: 0, rolar: dadoFixo(20) });
ok(passou.passouJogador && !passou.condJogador, "com rolagem alta ele resiste e nada é aplicado");
ok(/não houve/.test(passou.nota), "e o envelope diz explicitamente que não houve efeito");

console.log("\n[quando NÃO deve disparar]");
ok(resolverPresenca({ fonte: { nome: "X", gd: 3 }, jogador: heroi, gdJogador: 2, rolar: dadoFixo(1) }) === null, `semideus (GD 2) diante de GD 3 não sofre — diferença menor que ${DIFERENCA_MINIMA}`);
ok(resolverPresenca({ fonte: { nome: "Orc", gd: 0 }, jogador: heroi, gdJogador: 0, rolar: dadoFixo(1) }) === null, "inimigo mortal nunca abre presença divina");
const comRelicario = { ...heroi, inventario: [{ nome: "Relicário consagrado" }] };
const r1 = resolverPresenca({ fonte, jogador: heroi, gdJogador: 0, rolar: dadoFixo(10) });
const r2 = resolverPresenca({ fonte, jogador: comRelicario, gdJogador: 0, rolar: dadoFixo(10) });
ok(!r1.passouJogador && r2.passouJogador, `item consagrado vira a rolagem (${r1.rolagemJogador} vs ${r2.rolagemJogador} contra ${r1.dc})`);

console.log("\n[O OUTRO LADO — o herói que ascendeu também pesa]");
const povo = [{ nome: "Taverneiro", vinculo: 0 }, { nome: "Guarda", vinculo: 0 }, { nome: "Doran", vinculo: 5 }];
const p = presencaDoHeroi({ gdJogador: 4, alvos: povo, nomeHeroi: "Vera", rolar: dadoFixo(2) });
console.log("  " + p.texto);
ok(p.dobrados.length === 2, "desconhecidos desviam o olhar");
ok(!p.dobrados.some((d) => d.nome === "Doran"), "quem convive com o herói não se curva");
ok(/nunca como controle mental/.test(p.nota) || /não como controle mental/.test(p.nota), "o envelope impede o Mestre de virar isso em domínio da vontade");
ok(presencaDoHeroi({ gdJogador: 2, alvos: povo, rolar: dadoFixo(1) }) === null, "abaixo de GD 3 o herói não impõe presença");

console.log(falhas ? `\n${falhas} FALHA(S)` : "\nTudo passou");
process.exit(falhas ? 1 : 0);
