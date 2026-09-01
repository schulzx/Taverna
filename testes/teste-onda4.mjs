/* teste-onda4.mjs (v9.54) — o mundo que já existia e o jogador não via:
   a planta que responde ao lugar, o cinturão que fica no mapa, o lugar
   DENTRO de outro e a invocação com dois relógios.                      */
import { formaDaCidade, PORTES, populacaoDe, pisarNaCidade, cidadesPisadas, gerarGeografia } from "../src/geografia.js";
import { DISTANCIAS, distanciaDe, distanciaPorTexto, definirLugar, textoDoLugar, linhaDeLugar, resumoLugarPrompt } from "../src/lugar.js";
import { criarInvocacoes, expirarInvocacoes, expirarPorMinuto, invocacaoDe, MINUTOS_POR_RODADA_FORA } from "../src/invocacoes.js";
import { MOLDES, moldePorId } from "../src/moldes.js";

let ok = 0, mal = 0;
const t = (nome, cond) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome); } };
const sec = (s) => console.log("\n" + s);

const cid = (extra) => ({ nome: "Teste", populacao: 5000, bioma: "planicie", porte: "cidade", ...extra });

sec("1. a planta deixa de ser a mesma para todo mundo");
{
  const aldeia = formaDaCidade(cid({ populacao: 190, porte: "aldeia" }));
  const vila = formaDaCidade(cid({ populacao: 900, porte: "vila" }));
  const cidade = formaDaCidade(cid({ populacao: 8000 }));
  const capital = formaDaCidade(cid({ populacao: 54000, porte: "capital" }));

  t("aldeia de 190 almas NÃO tem muralha", aldeia.muro.id === "nenhum");
  t("e por isso não tem portão nenhum", aldeia.portoes === 0);
  t("vila levanta paliçada", vila.muro.id === "palicada");
  t("cidade paga pedra", cidade.muro.id === "muralha");
  t("capital paga pedra grossa", capital.muro.id === "grossa");

  t("povoado tem UMA rua", aldeia.ruas === 1 && vila.ruas === 1);
  t("cidade tem o cruzamento", cidade.ruas === 2 && capital.ruas === 2);
  t("só a grande ganha anel viário", capital.anelViario && !cidade.anelViario);
  t("aldeia não tem praça, tem largo", !aldeia.praca);
  t("vila já tem", vila.praca);

  t("o desenho cresce com a gente", aldeia.raio < vila.raio && vila.raio < cidade.raio && cidade.raio < capital.raio);
  t("mas nunca estoura o mapa", capital.raio <= 37 && aldeia.raio >= 14);
  console.log(`      raios: aldeia ${aldeia.raio} · vila ${vila.raio} · cidade ${cidade.raio} · capital ${capital.raio}`);
}

sec("1b. o chão manda tanto quanto o tamanho");
{
  const porto = formaDaCidade(cid({ populacao: 9000, bioma: "costa", porte: "porto" }));
  t("cidade de costa tem água de um lado", !!porto.agua);
  t("e um cais", porto.agua.cais === true);
  t("a nota diz isso ao jogador", /mar de um lado/.test(porto.nota));

  const serra = formaDaCidade(cid({ populacao: 4000, bioma: "montanha" }));
  t("cidade de montanha nasce espremida", serra.aperto < 1);
  t("e a nota também diz", /espremida/.test(serra.nota));
  t("cidade de planície não é nenhuma das duas", !formaDaCidade(cid()).agua && formaDaCidade(cid()).aperto === 1);

  const forte = formaDaCidade(cid({ populacao: 800, porte: "fortaleza" }));
  t("fortaleza de 800 almas tem muralha, não paliçada", forte.muro.id === "muralha");
  t("e é compacta — muita parede em volta de pouco chão", forte.raio < formaDaCidade(cid({ populacao: 800 })).raio);
  t("fortaleza grande tem muralha grossa", formaDaCidade(cid({ populacao: 1800, porte: "fortaleza" })).muro.id === "grossa");
}

sec("1c. a régua vale para os cinco moldes, não só o medieval");
{
  const vistos = new Set();
  for (const m of MOLDES) {
    for (const porte of (m.portes || [])) {
      const pop = populacaoDe(porte, () => 0.5);
      const f = formaDaCidade({ nome: "X", populacao: pop, bioma: "planicie", porte });
      t(`${String(m.nome || m.id).padEnd(16)} ${String(porte).padEnd(16)} ${String(pop).padStart(6)} almas → ${f.nota}`, !!f.muro && f.raio >= 13 && f.raio <= 37);
      vistos.add(porte);
    }
  }
  t(`${vistos.size} portes diferentes atravessados sem tabela por nome`, vistos.size >= 15);
  t("cidade sem população não quebra", !!formaDaCidade({ nome: "Ruína" }).muro);
  t("nem cidade nenhuma", !!formaDaCidade(null).muro && !!formaDaCidade().muro);
}

sec("2. o cinturão fica no mapa depois de sair da cidade");
{
  const geo = gerarGeografia("teste|onda4", moldePorId("medieval"));
  let mapa = { cidades: geo.cidades };
  const primeira = mapa.cidades[0].nome;
  t("nenhuma cidade nasce pisada", cidadesPisadas(mapa).length === 0);
  mapa = pisarNaCidade(mapa, primeira);
  t("pisar marca", cidadesPisadas(mapa).length === 1 && cidadesPisadas(mapa)[0].nome === primeira);
  t("e também revela", mapa.cidades[0].descoberta === true);
  const segunda = mapa.cidades[1].nome;
  mapa = pisarNaCidade(mapa, segunda);
  t("sair e chegar em outra NÃO apaga a primeira", cidadesPisadas(mapa).length === 2);
  t("pisar de novo na mesma não duplica", cidadesPisadas(pisarNaCidade(mapa, primeira)).length === 2);
  t("cidade que não existe não quebra", pisarNaCidade(mapa, "Nenhures") === mapa);
  /* a que se conhece só de ouvir NÃO ganha cinturão */
  const deOuvir = { cidades: [{ nome: "Ouvida", descoberta: true, deOuvir: true }] };
  t("conhecer de ouvir não é ter pisado", cidadesPisadas(deOuvir).length === 0);
  t("mas pisar nela limpa o 'de ouvir'", pisarNaCidade(deOuvir, "Ouvida").cidades[0].deOuvir === undefined);
}

sec("3. um lugar DENTRO de outro");
{
  t("existe a distância dentro", !!DISTANCIAS.dentro);
  t("e ela fala em minutos", /MINUTOS/.test(DISTANCIAS.dentro.volta));
  t("os arredores continuam em horas", /HORAS/.test(DISTANCIAS.arredores.volta));

  const interiores = ["o segundo andar da torre", "o porão da taverna", "a sala do trono", "a cripta sob a capela", "a cozinha da estalagem", "a biblioteca do templo", "o corredor leste", "a adega"];
  for (const n of interiores) t(`"${n}" é interior`, distanciaPorTexto(n) === "dentro");
  const foras = ["a fazenda de Jessa", "o moinho de cima", "a capela da encruzilhada", "a ponte de pedra", "as salinas", "o pomar cercado"];
  for (const n of foras) t(`"${n}" continua nos arredores`, distanciaPorTexto(n) === "arredores");
  t("texto vazio cai no padrão", distanciaPorTexto("") === "arredores" && distanciaPorTexto(null) === "arredores");

  const torre = definirLugar("o segundo andar da torre", { cidade: "Vaal", dia: 3 });
  t("definirLugar lê a distância do nome", torre.distancia === "dentro");
  const fazenda = definirLugar("a fazenda de Jessa", { cidade: "Vaal", dia: 3 });
  t("e não estraga o caso antigo", fazenda.distancia === "arredores");
  t("distância declarada ainda ganha do texto", definirLugar("a fazenda de Jessa", { cidade: "V", distancia: "perto" }).distancia === "perto");

  const l = linhaDeLugar(torre);
  t("a linha do interior NÃO diz 'fora da cidade'", !/FORA DA CIDADE/.test(l));
  t("mas continua defendendo o herói do teleporte", /não me tira daqui/i.test(l));
  t("e fala em minutos", /MINUTOS/.test(l));
  t("a do arredor continua como era", /FORA DA CIDADE/.test(linhaDeLugar(fazenda)));
  const rp = resumoLugarPrompt(torre, "Vaal");
  t("o prompt do interior fala de escada, não de estrada", /escada/.test(rp) && !/na estrada/.test(rp));
  t("e proíbe cobrar horas por um corredor", /nunca cobre horas/.test(rp));
  t("o texto do lugar não fica com 'de de'", !/de de /.test(textoDoLugar(torre)) && /dentro de Vaal/.test(textoDoLugar(torre)));
}

sec("4. a invocação passa a ter dois relógios");
{
  const hab = { nome: "Invocar Fera Menor", descricao: "Chama uma fera espiritual." };
  t("é uma invocação", !!invocacaoDe(hab));
  const pers = { nome: "Vera", nivel: 6, grupo: [] };

  /* dentro da luta: rodadas, como sempre */
  const naLuta = criarInvocacoes(hab, pers, 2);
  t("sem hora do mundo, não há prazo em minutos", naLuta[0].expiraMin === null);
  t("e o prazo em rodadas é o de sempre", naLuta[0].expiraEm === 5);

  /* fora da luta: minutos */
  const fora = criarInvocacoes(hab, pers, 1, { minutoAbs: 1000 });
  t("com a hora do mundo, ganha prazo em minutos", fora[0].expiraMin === 1000 + 3 * MINUTOS_POR_RODADA_FORA);
  const comFera = { ...pers, grupo: fora };
  t("aos 1010 minutos ainda está aqui", expirarPorMinuto(comFera, 1010).sumiram.length === 0);
  const fim = expirarPorMinuto(comFera, 1015);
  t("aos 1015 se desfaz", fim.sumiram.length === 1);
  t("e sai do grupo", fim.pers.grupo.length === 0);
  t("o jogador lê por quê", /não fica/.test(fim.linhas[0]));

  t("um companheiro de verdade nunca some por tempo", expirarPorMinuto({ grupo: [{ nome: "Ilse", vida: 20 }] }, 99999).sumiram.length === 0);
  t("nem uma invocação sem prazo em minutos (save antigo)", expirarPorMinuto({ grupo: [{ nome: "F", invocada: true, expiraEm: 4 }] }, 99999).sumiram.length === 0);
  t("os dois relógios não se atrapalham", expirarInvocacoes(comFera, 2).sumiram.length === 0);
  t("e o de rodadas segue valendo", expirarInvocacoes(comFera, 9).sumiram.length === 1);
}

console.log(`\nonda 4 v9.54: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
