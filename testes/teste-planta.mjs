/* teste-planta.mjs (v9.55) — os três achados da partida: coisa no mar,
   o cardeal que mentia e o herói que não saía do centro.               */
import { formaDaCidade, gerarGeografia, nomeMenteSobreOLugar } from "../src/geografia.js";
import { lugarPedido, definirLugar, distanciaPorTexto, DISTANCIAS } from "../src/lugar.js";
import { locaisDaCidade } from "../src/mundo-base.js";
import { arredoresDaCidade } from "../src/arredores.js";
import { moldePorId, MOLDES } from "../src/moldes.js";

let ok = 0, mal = 0;
const t = (nome, cond) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome); } };
const sec = (s) => console.log("\n" + s);

/* as mesmas contas do desenho — se divergirem, volta a boiar coisa no mar */
const xDaAgua = (f) => (f.agua ? 50 - f.raio * 0.42 : -Infinity);
const emTerra = (ang, raio, f) => {
  const limite = xDaAgua(f);
  if (limite === -Infinity) return ang;
  const molha = (a) => 50 + Math.cos(a) * raio * 1.15 < limite + 2;
  if (!molha(ang)) return ang;
  const esp = Math.PI - ang;
  if (!molha(esp)) return esp;
  return Math.sin(ang) >= 0 ? Math.PI / 4 : -Math.PI / 4;
};

sec("1. nada da cidade cai no mar");
{
  const porto = { nome: "Rio das Águias", populacao: 76780, bioma: "costa", porte: "capital" };
  const f = formaDaCidade(porto);
  t("a cidade tem mar", !!f.agua);
  const limite = xDaAgua(f);
  console.log(`      linha d'água em x=${limite.toFixed(1)} · raio ${f.raio}`);

  /* o cinturão: todo ângulo possível, corrigido, tem de sair seco */
  let molhados = 0;
  for (let i = 0; i < 720; i++) {
    const ang = (i / 720) * Math.PI * 2;
    const bom = emTerra(ang, 44 / 1.15, f);
    if (50 + Math.cos(bom) * 44 < limite) molhados++;
  }
  t("nenhum dos 720 ângulos do cinturão cai na água", molhados === 0);

  /* os locais de dentro, nos dois anéis */
  let dentroMolhado = 0;
  for (const mult of [0.5, 0.84]) {
    const anel = mult * f.raio * 0.75;
    for (let i = 0; i < 360; i++) {
      const bom = emTerra((i / 360) * Math.PI * 2, anel, f);
      if (50 + Math.cos(bom) * anel * 1.15 < limite) dentroMolhado++;
    }
  }
  t("nem os locais de dentro, nos dois anéis", dentroMolhado === 0);

  /* cidade sem mar não deve mexer em ângulo nenhum */
  const seco = formaDaCidade({ nome: "X", populacao: 8000, bioma: "planicie" });
  t("cidade sem mar não distorce nada", [0, 1, 2, 3, 4, 5].every((a) => emTerra(a, 20, seco) === a));
}

sec("1b. o cais fica na água, não na praça");
{
  const RX = /doca|porto|cais|embarcad|estaleiro|ancorad/i;
  t("a régua do cais reconhece uma doca", RX.test("docas") && RX.test("Cais Torto") && RX.test("embarcadouro"));
  t("e não reconhece uma taverna", !RX.test("taverna O Javali Cambaleante") && !RX.test("mercado Feira Baixa"));
}

sec("1c. os rótulos param de se sobrepor");
{
  /* o bug: i/(n-1) faz o primeiro e o último caírem no mesmo ângulo */
  const angAntigo = (i, n) => (i / Math.max(1, n - 1)) * Math.PI * 2;
  const angNovo = (i, n) => (i / Math.max(1, n)) * Math.PI * 2;
  const n = 7;
  t("a conta ANTIGA punha o 1º e o último no mesmo ângulo", Math.abs((angAntigo(0, n) % (Math.PI * 2)) - (angAntigo(n - 1, n) % (Math.PI * 2))) < 1e-9);
  t("a nova não", Math.abs((angNovo(0, n) % (Math.PI * 2)) - (angNovo(n - 1, n) % (Math.PI * 2))) > 0.5);
  const angs = Array.from({ length: n }, (_, i) => angNovo(i, n));
  t("e os sete ficam bem espalhados", new Set(angs.map((a) => a.toFixed(4))).size === n);
}

sec("2. o nome cardeal para de mentir");
{
  t("'do Norte' no sul é mentira", nomeMenteSobreOLugar("Nova do Norte", 50, 80));
  t("'do Norte' no norte, não", !nomeMenteSobreOLugar("Nova do Norte", 50, 20));
  t("'do Sul' no norte é mentira", nomeMenteSobreOLugar("Vila do Sul", 50, 20));
  t("'do Leste' a oeste é mentira", nomeMenteSobreOLugar("Porto do Leste", 15, 50));
  t("'Ocidental' a leste é mentira", nomeMenteSobreOLugar("Marca Ocidental", 85, 50));
  t("no meio do mapa, ninguém mente", !nomeMenteSobreOLugar("Nova do Norte", 50, 50) && !nomeMenteSobreOLugar("Vila do Sul", 50, 50));
  t("nome sem cardeal nunca mente", !nomeMenteSobreOLugar("Pedra Brumosa", 5, 95));
  t("sem posição, não julga", !nomeMenteSobreOLugar("Nova do Norte", null, null));

  /* o mundo inteiro, nos cinco moldes */
  let mentiras = 0, total = 0;
  for (const m of MOLDES) {
    for (let s = 0; s < 12; s++) {
      const geo = gerarGeografia(`cardeal|${m.id}|${s}`, m);
      for (const c of geo.cidades) { total++; if (nomeMenteSobreOLugar(c.nome, c.x, c.y)) mentiras++; }
    }
  }
  console.log(`      ${total} lugares gerados nos cinco moldes · ${mentiras} com nome fora de lugar`);
  t("nenhum lugar do mundo nasce com o cardeal errado", mentiras === 0);
}

sec("3. o herói anda dentro da cidade");
{
  const cidade = { nome: "Rio das Águias", populacao: 76780, bioma: "costa", porte: "capital", x: 40, y: 40 };
  const locais = locaisDaCidade("s|planta", cidade, "Fantasia medieval", moldePorId("sobremundo")).map((l) => ({ ...l, onde: "dentro" }));
  const fora = arredoresDaCidade("s|planta", cidade).map((a) => ({ ...a, onde: "arredores" }));
  const todos = [...locais, ...fora];
  const taverna = locais.find((l) => l.tipo === "taverna");
  t("a capital tem uma taverna com nome", !!taverna && taverna.nome.length > 3);
  console.log(`      "${taverna.nome}" · ${locais.length} dentro · ${fora.length} fora`);

  t("pedir a taverna pelo nome inteiro move", (lugarPedido(`Vou até ${taverna.nome}`, todos) || {}).nome === taverna.nome);
  t("pedir por uma palavra do nome também", (lugarPedido(`vou pro ${taverna.nome.split(" ").slice(-1)[0]}`, todos) || {}).nome === taverna.nome);
  t("e o resultado sabe que é de dentro", (lugarPedido(`Vou até ${taverna.nome}`, todos) || {}).onde === "dentro");
  t("'entro na' também move", !!lugarPedido(`entro na ${taverna.nome}`, todos));

  /* e as recusas, que são o que impede o teleporte */
  t("FALAR do lugar não move", !lugarPedido(`pergunto ao guarda sobre ${taverna.nome}`, todos));
  t("nem pensar nele", !lugarPedido(`lembro de ${taverna.nome} e do que aconteceu lá`, todos));
  t("verbo sem nome não move", !lugarPedido("vou embora daqui", todos));
  t("nome que não existe não move", !lugarPedido("vou até a Catedral de Vidro", todos));
  t("texto vazio não move", !lugarPedido("", todos) && !lugarPedido(null, todos));
  t("lista vazia não quebra", !lugarPedido("vou até a taverna", []) && !lugarPedido("vou até a taverna"));

  /* o cinturão continua sendo horas, não minutos */
  const arredor = fora[0];
  const pedido = lugarPedido(`sigo até ${arredor.nome}`, todos);
  t("um arredor também é alcançável", !!pedido && pedido.nome === arredor.nome);
  t("e vem marcado como arredor", pedido.onde === "arredores");
  t("com os minutos de caminhada da tabela", Number(arredor.minutos) > 0);
}

sec("3b. a distância certa para cada um");
{
  const dentro = definirLugar("O Javali Cambaleante", { cidade: "Vaal", dia: 1, distancia: "dentro" });
  t("a taverna registrada é 'dentro'", dentro.distancia === "dentro");
  t("e sair dela leva MINUTOS", /MINUTOS/.test(DISTANCIAS[dentro.distancia].volta));
  const fazenda = definirLugar("a fazenda velha", { cidade: "Vaal", dia: 1, distancia: "arredores" });
  t("a fazenda continua 'arredores'", fazenda.distancia === "arredores");
  t("e leva HORAS", /HORAS/.test(DISTANCIAS[fazenda.distancia].volta));
  /* sem distância declarada, o texto decide — e uma taverna não tem palavra
     de interior, então cairia em arredores: é por isso que quem sabe declara */
  t("sem declarar, 'O Javali Cambaleante' cairia em arredores", distanciaPorTexto("O Javali Cambaleante") === "arredores");
  t("por isso quem conhece a cidade é que declara", definirLugar("O Javali Cambaleante", { cidade: "V", distancia: "dentro" }).distancia === "dentro");
}

console.log(`\nplanta e movimento v9.55: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
