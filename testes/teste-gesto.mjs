/* teste-gesto.mjs (v9.87) — o movimento por baixo da forma.

   A estante evitava repetir a mesma FORMA e nada impedia que duas formas
   DIFERENTES fizessem o mesmo movimento. `mensageiro`, `rosto_conhecido`,
   `pela_crianca`, `procurador`, `ordem_de_longe` e `quem_ficou` são seis
   entradas distintas e uma única cena: alguém chega e fala comigo. Três
   delas seguidas passavam pela memória sem alarme nenhum, e o jogador lia
   a mesma coisa três vezes com nomes diferentes do lado de cá.

   Três coisas provadas aqui: o GESTO (todo o acervo o tem, e ele quebra a
   sequência), a CADÊNCIA que responde à mesa, e as EXIGÊNCIAS de memória
   como tabela — com a garantia de leitor que faz uma exigência nova
   quebrar a suíte em vez de abrir sozinha. */
import {
  JOGADAS, GESTOS, VETOS, EXIGENCIAS, NAO_REPETIR_GESTO, CADENCIAS,
  gestoPorId, exigenciaDe, cadenciaDe, garantirSituacao, garantirEstante,
  marcarJogada, consultarBiblioteca, podeFormaDeCena, contarTurnoDeCena,
} from "../src/biblioteca.js";
import fs from "node:fs";

let ok = 0, mal = 0;
const t = (nome, cond) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome); } };
const sec = (s) => console.log("\n" + s);
const viva = (sit) => garantirSituacao({
  temGenteConhecida: true, temPassado: true, temFalaAnterior: true,
  temObjetos: true, temLugarVisitado: true, ...sit,
});

sec("1. O GESTO — todo o acervo tem um, e ele é grosso de propósito");
{
  const semGesto = JOGADAS.filter((j) => !j.gesto).map((j) => j.id);
  t(`toda forma tem gesto${semGesto.length ? " — sem: " + semGesto.join(", ") : ""}`, semGesto.length === 0);
  const orfaos = JOGADAS.filter((j) => !gestoPorId(j.gesto)).map((j) => j.id + ":" + j.gesto);
  t(`todo gesto existe na tabela${orfaos.length ? " — " + orfaos.join(", ") : ""}`, orfaos.length === 0);
  t("e todo gesto da tabela diz o que é", GESTOS.every((g) => g.id && g.diz));

  /* GROSSO DE PROPÓSITO: uma taxonomia fina não distingue nada — se cada
     forma tivesse o próprio gesto, o gesto seria o id de novo. */
  t(`os gestos são poucos (${GESTOS.length}) para muitas formas (${JOGADAS.length})`,
    GESTOS.length <= 30 && JOGADAS.length / GESTOS.length >= 5);
  const usados = new Set(JOGADAS.map((j) => j.gesto));
  const ociosos = GESTOS.filter((g) => !usados.has(g.id)).map((g) => g.id);
  t(`nenhum gesto da tabela fica ocioso${ociosos.length ? " — " + ociosos.join(", ") : ""}`, ociosos.length === 0);
  /* e nenhum gesto pode engolir o acervo: um que cubra metade das formas
     não separa nada, e a memória dele proibiria metade das cenas */
  const conta = {};
  for (const j of JOGADAS) conta[j.gesto] = (conta[j.gesto] || 0) + 1;
  const maior = Object.entries(conta).sort((a, b) => b[1] - a[1])[0];
  t(`nenhum gesto domina (maior: ${maior[0]} com ${maior[1]})`, maior[1] < JOGADAS.length * 0.2);

  /* os ids do acervo são ASCII: um com acento no meio de cento e noventa
     é armadilha para qualquer varredura que o percorra */
  const tortos = JOGADAS.filter((j) => !/^[a-z][a-z0-9_]*$/.test(j.id)).map((j) => j.id);
  t(`todo id é ascii minúsculo${tortos.length ? " — " + tortos.join(", ") : ""}`, tortos.length === 0);
}

sec("2. E ELE QUEBRA A SEQUÊNCIA");
{
  /* a prova concreta do defeito que o gesto veio consertar */
  const chegam = JOGADAS.filter((j) => j.gesto === "chega_gente").map((j) => j.id);
  t(`"alguém chega e fala" são várias formas (${chegam.length})`, chegam.length >= 5);
  t("e mensageiro e rosto_conhecido são duas delas",
    chegam.includes("mensageiro") && chegam.includes("rosto_conhecido"));

  const sit = viva({ emCidade: true, pessoaNaCena: true, momento: 0.4, ordemDaFase: 2, nivel: 5, fama: 30 });
  let est = garantirEstante(null);
  const gestos = [];
  for (let i = 0; i < 24; i++) {
    const j = consultarBiblioteca(sit, { sorte: () => (i * 0.113) % 1, estante: est });
    if (!j) break;
    gestos.push(j.gesto);
    est = marcarJogada(est, j.id, j.gesto);
  }
  t("vinte e quatro consultas", gestos.length === 24);
  let colado = false;
  for (let k = 1; k < gestos.length; k++) {
    if (gestos.slice(Math.max(0, k - NAO_REPETIR_GESTO), k).includes(gestos[k])) colado = true;
  }
  t("nenhum gesto se repete dentro da janela", !colado);
  t(`e a variedade de gesto é real (${new Set(gestos).size} gestos distintos)`, new Set(gestos).size >= 8);
  t("a memória de gesto não cresce sem fim", garantirEstante({ gestos: new Array(40).fill("x") }).gestos.length === 8);

  /* a escapatória: se filtrar por gesto esvaziar a estante, o gesto
     repetido é melhor que forma nenhuma — uma cena repetida é defeito,
     uma cena sem forma é o comportamento de antes, que não era defeito */
  const estCheia = garantirEstante({ gestos: GESTOS.map((g) => g.id).slice(0, 8) });
  t("estante saturada ainda devolve forma", !!consultarBiblioteca(sit, { sorte: () => 0.5, estante: estCheia }));

  /* e o gesto sobe junto na resposta, senão o chamador não tem como marcá-lo */
  const j = consultarBiblioteca(sit, { sorte: () => 0.5 });
  t("a consulta devolve o gesto", !!j.gesto && !!gestoPorId(j.gesto));
  /* marcarJogada acha o gesto sozinho quando não recebe: um chamador que
     esqueça o segundo argumento não pode desligar a memória em silêncio */
  t("marcarJogada acha o gesto pelo id", marcarJogada(garantirEstante(null), "mensageiro").gestos[0] === "chega_gente");
  t("e ignora id que não existe", marcarJogada(garantirEstante(null), "nao_existe").gestos.length === 0);
}

sec("3. OS VETOS LEEM ESTRUTURA, NÃO TEXTO");
{
  const fonte = fs.readFileSync("../src/biblioteca.js", "utf8");
  const bloco = fonte.split("export const VETOS")[1].split("export const EXIGENCIAS")[0];
  /* era um casamento de TEXTO da forma, e por isso frágil ao ponto de
     sumir sozinho: bastava reescrever uma frase para o veto parar de
     cortar sem que nada quebrasse */
  t("nenhum veto casa texto de forma", !/test\(j\.forma\)/.test(bloco));
  t("todos leem gesto ou precisa", /j\.gesto ===/.test(bloco) && /j\.precisa/.test(fonte));

  const abertas = (sit) => {
    const s = viva(sit);
    const v = VETOS.filter((x) => x.quando(s));
    return JOGADAS.filter((j) => j.quando(s) && !v.some((x) => x.corta(j, s)));
  };
  const brasa = abertas({ temperatura: "brasa", emCombate: true, emCidade: true, momento: 0.5 }).map((j) => j.id);
  t("em brasa, nenhum respiro sobra",
    !JOGADAS.filter((j) => j.gesto === "respira").some((j) => brasa.includes(j.id)));
  t("em combate, nenhum plantio sobra",
    !JOGADAS.filter((j) => j.gesto === "planta").some((j) => brasa.includes(j.id)));
  t("em combate, nenhum mundo de fundo sobra",
    !JOGADAS.filter((j) => j.gesto === "mostra_mundo").some((j) => brasa.includes(j.id)));
  t("mas os dentes continuam abertos", brasa.some((id) => (JOGADAS.find((j) => j.id === id) || {}).gesto === "mostra_dentes"));

  const semVilao = abertas({ emCidade: true, ordemDaFase: -1 }).map((j) => j.id);
  t("sem vilão, nenhum `mostra_o_outro`",
    !JOGADAS.filter((j) => j.gesto === "mostra_o_outro").some((j) => semVilao.includes(j.id)));
  /* mas `oferece` NÃO é cortado: quem oferece também é o aldeão que dá uma
     recompensa torta, e essa não tem vilão nenhum atrás */
  t("mas a recompensa torta do aldeão continua", semVilao.includes("recompensa_torta"));
}

sec("4. AS EXIGÊNCIAS — tabela, e com garantia de leitor");
{
  /* GARANTIA DE LEITOR: uma forma que declare uma exigência que a tabela
     não conhece tem de quebrar a suíte — senão ela abriria sempre, e a
     trava seria uma regra escrita sem código atrás. */
  const declaradas = new Set(JOGADAS.filter((j) => j.precisa).map((j) => j.precisa));
  const semLinha = [...declaradas].filter((p) => !exigenciaDe(p));
  t(`toda exigência declarada tem linha na tabela${semLinha.length ? " — " + semLinha.join(", ") : ""}`, semLinha.length === 0);
  const semUso = EXIGENCIAS.filter((x) => !declaradas.has(x.precisa)).map((x) => x.precisa);
  t(`e nenhuma linha sobra${semUso.length ? " — " + semUso.join(", ") : ""}`, semUso.length === 0);
  t("cada linha diz o campo e o porquê", EXIGENCIAS.every((x) => x.precisa && x.campo && x.porque));
  t(`são mais que as duas de antes (${EXIGENCIAS.length})`, EXIGENCIAS.length >= 5);

  /* e o campo tem de existir na situação, senão a trava tranca sempre */
  const s = garantirSituacao({});
  const foraDaSituacao = EXIGENCIAS.filter((x) => !(x.campo in s)).map((x) => x.campo);
  t(`todo campo existe na situação${foraDaSituacao.length ? " — " + foraDaSituacao.join(", ") : ""}`, foraDaSituacao.length === 0);

  /* LACUNA É SILÊNCIO, NUNCA PERMISSÃO — foi assim que `seguraOTeste` quase
     deixou passar meio catálogo na v9.71 */
  const veto = VETOS.find((v) => v.id === "sem_memoria_sem_forma");
  t("existe o veto único das exigências", !!veto);
  t("forma com exigência desconhecida é cortada", veto.corta({ precisa: "inventada" }, garantirSituacao({})) === true);
  t("forma sem exigência passa", veto.corta({ gesto: "respira" }, garantirSituacao({})) === false);

  /* as travas são INDEPENDENTES: passado grosso não abre lugar */
  const abre = (sit, id) => {
    const s2 = garantirSituacao(sit);
    const v = VETOS.filter((x) => x.quando(s2));
    const j = JOGADAS.find((x) => x.id === id);
    return j.quando(s2) && !v.some((x) => x.corta(j, s2));
  };
  const base = { emCidade: true, momento: 0.5, pessoaNaCena: true, temLugarAbandonado: true };
  t("passado sem lugar não abre `lugar_lembra`", !abre({ ...base, temPassado: true }, "lugar_lembra"));
  t("com lugar visitado, abre", abre({ ...base, temPassado: true, temLugarVisitado: true }, "lugar_lembra"));
  t("passado sem fala não abre `eco`", !abre({ ...base, temPassado: true }, "eco"));
  t("com fala anterior, abre", abre({ ...base, temPassado: true, temFalaAnterior: true }, "eco"));
  t("passado sem objeto não abre `objeto_volta`", !abre({ ...base, temPassado: true, temLugarAbandonado: true }, "objeto_volta"));
}

sec("5. A CADÊNCIA RESPONDE À MESA");
{
  /* Um número fixo tratava igual duas mesas opostas. Numa mesa FRIA a
     forma é o socorro; numa QUENTE já há voz demais. */
  t("as quatro temperaturas têm linha", ["fria", "morna", "quente", "brasa"].every((x) => CADENCIAS.some((c) => c.temperatura === x)));
  t("cada linha diz por quê", CADENCIAS.every((c) => c.porque));
  t("a fria vem antes da morna", cadenciaDe("fria").cada < cadenciaDe("morna").cada);
  t("e a quente depois", cadenciaDe("quente").cada > cadenciaDe("morna").cada);
  t("a brasa é nunca", cadenciaDe("brasa").cada === 0);
  t("temperatura desconhecida cai na morna", cadenciaDe("roxa").cada === cadenciaDe("morna").cada);

  const est = (n) => { let e = garantirEstante(null); for (let i = 0; i < n; i++) e = contarTurnoDeCena(e); return e; };
  t("mesa fria libera em 2", podeFormaDeCena({ temperatura: "fria" }, est(2)).pode === true);
  t("mesa morna ainda não em 2", podeFormaDeCena({ temperatura: "morna" }, est(2)).pode === false);
  t("mesa morna libera em 3", podeFormaDeCena({ temperatura: "morna" }, est(3)).pode === true);
  t("mesa quente ainda não em 3", podeFormaDeCena({ temperatura: "quente" }, est(3)).pode === false);
  t("mesa quente libera em 6", podeFormaDeCena({ temperatura: "quente" }, est(6)).pode === true);
  t("em brasa nunca, mesmo com vinte turnos", podeFormaDeCena({ temperatura: "brasa" }, est(20)).pode === false);
  t("e em combate nunca, seja qual for a mesa", podeFormaDeCena({ temperatura: "fria", emCombate: true }, est(20)).pode === false);
  /* o motivo da espera diz a mesa: quem for depurar isto tem de saber por
     que esperou seis turnos e não três */
  t("a espera nomeia a temperatura", /mesa quente/.test(podeFormaDeCena({ temperatura: "quente" }, est(1)).porque));
}

sec("6. E O APP ENTREGA AS TRÊS MEMÓRIAS NOVAS");
{
  const app = fs.readFileSync("../src/App.jsx", "utf8");
  const chamada = app.split("const situacaoDaMesa")[1].split("\n  };")[0];
  for (const c of ["temFalaAnterior", "temObjetos", "temLugarVisitado"]) {
    t(`o App entrega ${c}`, chamada.includes(c + ":"));
  }
  /* e cada uma vem de uma fonte de VERDADE do jogo, não de um palpite */
  t("a fala vem do histórico de mensagens", /mensagensRef\.current[\s\S]{0,120}autor === "mestre"/.test(chamada));
  t("o objeto vem do inventário", /temObjetos: \(p0\.inventario \|\| \[\]\)\.length/.test(chamada));
  t("o lugar vem das cidades pisadas", /temLugarVisitado: cidadesPisadas\(mapaRef\.current\)/.test(chamada));
  /* v9.181: `PORTES` entrou na frente da lista quando a cerimônia do lugar
     novo passou a dizer o porte da cidade. A lei é que a função venha da
     geografia — e não que ela seja a primeira da linha. */
  t("e cidadesPisadas está importada", /import \{[^}]*\bcidadesPisadas\b[^}]*\} from "\.\/geografia\.js"/.test(app));
  /* o gesto tem de ser marcado nos DOIS canais, senão a memória fica cega
     em metade dos turnos e o defeito volta pela porta que ninguém olhou */
  t("o gesto é marcado no canal do envelope", /marcarJogada\(estanteRef\.current, j\.id, j\.gesto\)/.test(app));
  t("e no canal da cena comum", /zerarCadenciaDaCena\(marcarJogada\(estanteRef\.current, j\.id, j\.gesto\)\)/.test(app));
}

console.log(`\ngesto v9.87: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
