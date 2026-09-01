/* teste-onda5.mjs (v9.54) — o prompt que só manda o que a cena usa e as
   células do ermo (estágios 2 e 3 da geração de mundo).               */
import { montarSystemPrompt, PORTAS_DA_CENA, portasAbertas } from "../src/prompt.js";
import { readFileSync } from "node:fs";
import { SISTEMAS } from "../src/lexico.js";
const FONTE_PROMPT = readFileSync("../src/prompt.js", "utf8");
import { celulaEm, celulasNaRota, celulaDaJornada, celulaDaCidade, coordDaCelula, centroDaCelula, resumoCelulaPrompt, linhaDaCelula, ROTULOS_PERIGO, CELULAS_PROMPT, LADO_CELULA, CELULAS_POR_LADO } from "../src/celulas.js";
import { gerarGeografia } from "../src/geografia.js";
import { moldePorId, MOLDES } from "../src/moldes.js";
import { temRegraPropria } from "../src/habilidades.js";
import { CLASSES } from "../src/classes.js";

let ok = 0, mal = 0;
const t = (nome, cond) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome); } };
const sec = (s) => console.log("\n" + s);

const heroi = { nome: "V", conceito: "x", nivel: 5, atributos: { forca: 1, destreza: 1, vigor: 1, intelecto: 1, presenca: 1, percepcao: 1 }, vidaMax: 40, manaMax: 20 };
const monta = (cena) => montarSystemPrompt("C", { genero: "Fantasia medieval" }, heroi, {}, {}, "", "", "", "", "", "", "", cena);

sec("1. o prompt encolhe conforme a cena");
{
  const cheio = monta(null);
  t("sem objeto de cena, tudo entra — como sempre foi", cheio.length > 70000);
  const taverna = monta({ emCidade: true });
  const luta = monta({ emCombate: true });
  const tudo = monta(Object.fromEntries(["emCombate", "emMasmorra", "temChao", "emCidade", "temMercado", "temBancada", "temMissao", "conjura", "temGrupo", "temLegado", "temSintonia", "temEspecializacao", "despertou", "invoca", "temGatilho", "temDadiva", "temRegraPropria", "emViagem", "dentroDeUmLocal", "acampado", "emMasmorra", "temGente", "temVilao", "temCobranca", "emRaid", "temTrama", "emSala"].map((k) => [k, true])));
  console.log(`      tudo ligado ${cheio.length} · taverna ${taverna.length} · combate ${luta.length}`);
  t("uma cena de taverna manda menos", taverna.length < cheio.length * 0.85);
  t("e economiza pelo menos 15 mil caracteres", cheio.length - taverna.length >= 15000);
  t("o combate manda mais que a taverna", luta.length > taverna.length);
  /* a lista acima é escrita à mão, e uma porta nova entra sem ela — foi o
     que aconteceu com `acampamento` na v9.99: o teste falhou por 508
     caracteres de diferença, que não diz nada a quem lê. Esta linha diz. */
  /* v9.110: "TUDO LIGADO" DEIXOU DE SER POSSÍVEL. A porta do descanso é
     `!emCombate` e a do combate é `emCombate` — a mesma regra dos dois
     lados, porque o código já recusa descansar na luta. A partir daqui
     existe um par de portas que se EXCLUEM, e a soma de todas virou uma
     cena que não acontece.

     O guarda continua valendo com a correção: toda porta que não se
     exclui tem de abrir, e as que se excluem têm de se excluir de fato.
     Sem a segunda metade, afrouxar a porta do descanso amanhã passaria
     despercebido. */
  /* v9.116: o PORTE entra no par que se exclui. A porta dele é
     `temGente && !emCombate` — como as pessoas tratam o herói não decide
     nada dentro de uma luta, onde quem responde é o dado. */
  const SE_EXCLUEM = ["descanso", "porte"];
  const abertas = portasAbertas(Object.fromEntries(["emCombate", "emMasmorra", "temChao", "emCidade", "temMercado", "temBancada", "temMissao", "conjura", "temGrupo", "temLegado", "temSintonia", "temEspecializacao", "despertou", "invoca", "temGatilho", "temDadiva", "temRegraPropria", "emViagem", "dentroDeUmLocal", "acampado", "emMasmorra", "temGente", "temVilao", "temCobranca", "emRaid", "temTrama", "emSala"].map((k) => [k, true])));
  const fechadas = Object.entries(abertas).filter(([, v]) => !v).map(([k]) => k);
  t("o contexto do teste abre todas as portas que não se excluem (senão a lista acima envelheceu)",
    fechadas.every((id) => SE_EXCLUEM.includes(id)));
  t("e as que se excluem se excluem de fato", SE_EXCLUEM.every((id) => fechadas.includes(id)));
  t("fora da luta, a porta do descanso abre", portasAbertas({ emCidade: true }).descanso === true);
  t("com tudo ligado, o prompt fica perto do cheio, menos o que se exclui",
    cheio.length - tudo.length > 0 && cheio.length - tudo.length < 1500);
}

sec("2. o que sai e o que NUNCA sai");
{
  const taverna = monta({ emCidade: true });
  /* o que a cena não usa */
  for (const [rotulo, marca] of [
    ["terreno da luta", "TERRENO E POSIÇÃO"],
    ["economia de ação", "ECONOMIA DE AÇÃO"],
    ["controle de inimigo", "CONTROLE DE INIMIGO"],
    ["grimório", "MAGIA PREPARADA"],
    ["invocações", "INVOCAÇÕES E CONSTRUTOS"],
  ]) t(`fora de combate, sai: ${rotulo}`, !taverna.includes(marca) || !monta(null).includes(marca));
  /* e o que fica em toda cena, sempre */
  for (const [rotulo, marca] of [
    ["cânone e memória", "PERSONAGEM DO JOGADOR"],
    ["tempo é do sistema", "TEMPO É DO SISTEMA"],
    ["condições", "CONDIÇÕES E EFEITOS"],
    ["formato da resposta", "FORMATO DA RESPOSTA"],
    ["liberdade criativa", "LIBERDADE CRIATIVA"],
    ["o preço de falhar", "O PREÇO DE FALHAR"],
  ]) t(`nunca sai: ${rotulo}`, taverna.includes(marca));
  t("em combate, o terreno volta", monta({ emCombate: true }).includes("TERRENO E POSIÇÃO"));
  t("com bancada, a oficina volta", monta({ temBancada: true }).includes("TRABALHO DE BASTIDOR"));
  /* v9.118: A PORTA DA CIDADE FOI REMOVIDA, e esta prova mudou de pergunta.
     O único bloco atrás dela repetia as duas regras que o envelope dos
     arredores já diz logo abaixo da lista, e a porta abria exatamente
     quando o envelope existe — ele nunca apareceu sozinho. Uma porta que
     abre para nada é o avesso da regra sem código: custa a conta de todo
     turno e não ensina nada. No lugar dela entra a invariante que teria
     pegado isto sozinha. */
  t("a porta da cidade continua, porque o LÉXICO a lê", PORTAS_DA_CENA.some((x) => x.id === "cidade"));
  /* Uma porta tem DOIS leitores possíveis: um bloco so(id, ...) no prompt e
     um sistema do léxico pendurado nela. Olhar só para o primeiro foi o que
     quase apagou "COMO É UM ASSENTAMENTO" em silêncio quando o bloco fixo
     dos arredores saiu. A invariante mede os dois. */
  const leitorDaPorta = (id) => FONTE_PROMPT.includes(`so("${id}"`) || SISTEMAS.some((sx) => sx.porta === id);
  const semLeitor = PORTAS_DA_CENA.filter((x) => !leitorDaPorta(x.id)).map((x) => x.id);
  t(`nenhuma porta abre para o vazio${semLeitor.length ? `: ${semLeitor.join(", ")}` : ""}`, semLeitor.length === 0);
  t("e o ermo sai quando se está na cidade", !monta({ emCidade: true }).includes("O ESPAÇO ENTRE OS LUGARES"));
  t("mas volta na estrada", monta({}).includes("O ESPAÇO ENTRE OS LUGARES"));
}

sec("2b. a régua das portas");
{
  t("toda porta tem id, pergunta e motivo", PORTAS_DA_CENA.every((p) => p.id && typeof p.quando === "function" && p.porque && p.porque.length > 20));
  t("nenhum id repetido", new Set(PORTAS_DA_CENA.map((p) => p.id)).size === PORTAS_DA_CENA.length);
  const vazio = portasAbertas(null);
  t("cena nula abre TODAS as portas", Object.values(vazio).every(Boolean));
  const nada = portasAbertas({});
  t("cena vazia fecha as que dependem de estado", Object.values(nada).filter(Boolean).length < Object.keys(nada).length);
  t("e o prompt não fica com buracos de linha", !monta({ emCidade: true }).includes("\n\n\n"));
}

sec("3. as células do ermo existem e não mudam");
{
  const geo = gerarGeografia("teste|ermo", moldePorId("sobremundo"));
  const mapa = { cidades: geo.cidades };
  const o = { mapa, molde: moldePorId("sobremundo") };

  const a = celulaEm("s1", 37, 62, o);
  const b = celulaEm("s1", 37, 62, o);
  t("a mesma coordenada devolve a mesma célula", JSON.stringify(a) === JSON.stringify(b));
  t("e dois pontos da MESMA célula também", celulaEm("s1", 36, 61, o).id === celulaEm("s1", 39, 64, o).id);
  t("outra semente, outro mundo", celulaEm("s2", 37, 62, o).feicao.nome !== a.feicao.nome || celulaEm("s2", 37, 62, o).id === a.id);
  t("a célula sabe onde fica", a.cx === 7 && a.cy === 12);
  t("e sabe o centro dela", centroDaCelula(7, 12).x === 37.5);
  t("coordenada fora do mapa não quebra", !!celulaEm("s1", -50, 500, o) && celulaEm("s1", 999, 999, o).cx === CELULAS_POR_LADO - 1);
  t("o mapa inteiro cabe na grade", CELULAS_POR_LADO * LADO_CELULA === 100);

  t("toda célula tem terreno", !!a.bioma);
  t("toda célula tem uma feição com nome e descrição", a.feicao && a.feicao.nome && a.feicao.desc && a.feicao.icone);
  t("e um perigo com rótulo", a.perigo >= 0 && !!a.rotuloPerigo);
}

sec("3b. o terreno é HERDADO, não sorteado");
{
  const geo = gerarGeografia("teste|bioma", moldePorId("sobremundo"));
  const mapa = { cidades: geo.cidades };
  const o = { mapa, molde: moldePorId("sobremundo") };
  let iguais = 0;
  for (const cid of mapa.cidades) {
    if (cid.x == null || !cid.bioma) continue;
    if (celulaEm("s", cid.x, cid.y, o).bioma === cid.bioma) iguais++;
  }
  t(`a célula de cada cidade tem o bioma dela (${iguais}/${mapa.cidades.length})`, iguais === mapa.cidades.length);
  /* sem mapa nenhum, não quebra e cai num bioma do molde */
  const solto = celulaEm("s", 50, 50, { molde: moldePorId("sobremundo") });
  t("sem mapa, ainda devolve célula", !!solto && !!solto.bioma);
}

sec("3c. longe de gente é mais perigoso");
{
  const mapa = { cidades: [{ nome: "Casa", x: 50, y: 50, bioma: "planicie" }] };
  const o = { mapa, molde: moldePorId("sobremundo") };
  const perto = celulaEm("s", 52, 50, o);
  const meio = celulaEm("s", 62, 50, o);
  const longe = celulaEm("s", 95, 95, o);
  console.log(`      perigo: colado ${perto.perigo} · a meio caminho ${meio.perigo} · no canto ${longe.perigo}`);
  t("colado na cidade é terra de gente", perto.perigo === 0);
  t("e cresce com a distância", meio.perigo > perto.perigo && longe.perigo > meio.perigo);
  t("há rótulo para cada degrau", ROTULOS_PERIGO.length >= 4 && ROTULOS_PERIGO.every((r) => r.length > 15));
  t("a célula diz de quem é a vizinhança", perto.perto === "Casa" && perto.distancia <= 5);
}

sec("4. o eixo extra por molde (estágio 3)");
{
  const torre = moldePorId("torre");
  t("a Torre declara o eixo z", torre.eixos.includes("z"));
  const mapa = { cidades: [{ nome: "Átrio", x: 50, y: 50, bioma: (torre.biomas[0] || {}).id }] };
  const baixo = celulaEm("s", 70, 70, { mapa, molde: torre, z: 0 });
  const alto = celulaEm("s", 70, 70, { mapa, molde: torre, z: 40 });
  t("a célula da Torre carrega o andar", baixo.z === 0 && alto.z === 40);
  console.log(`      Torre: andar 0 → perigo ${baixo.perigo} · andar 40 → perigo ${alto.perigo}`);
  t("subir é mais perigoso — o eixo enfim pesa", alto.perigo > baixo.perigo);
  t("e a célula alta é outra célula", alto.id !== baixo.id);

  const plano = moldePorId("sobremundo");
  const p0 = celulaEm("s", 70, 70, { mapa, molde: plano, z: 0 });
  const p9 = celulaEm("s", 70, 70, { mapa, molde: plano, z: 40 });
  t("num mundo sem eixo z, o z é ignorado", p0.id === p9.id && p0.perigo === p9.perigo);
  t("e a célula não finge ter altura", p0.z === null);

  for (const m of MOLDES) {
    const c = celulaEm("s", 40, 40, { mapa: { cidades: [{ nome: "X", x: 20, y: 20, bioma: (m.biomas[0] || {}).id }] }, molde: m });
    t(`${String(m.nome).padEnd(16)} gera célula sem quebrar`, !!c && !!c.feicao && c.perigo >= 0);
  }
}

sec("5. a rota atravessa células, e são as mesmas na volta");
{
  const o = { molde: moldePorId("sobremundo"), mapa: { cidades: [{ nome: "A", x: 10, y: 10, bioma: "planicie" }, { nome: "B", x: 80, y: 60, bioma: "floresta" }] } };
  const A = { x: 10, y: 10 }, B = { x: 80, y: 60 };
  const ida = celulasNaRota("s", A, B, o);
  const volta = celulasNaRota("s", B, A, o);
  t("a rota atravessa várias células", ida.length >= 8);
  t("nenhuma repetida", new Set(ida.map((c) => c.id)).size === ida.length);
  t("a volta passa pelas mesmas", new Set(ida.map((c) => c.id)).size === new Set(volta.map((c) => c.id)).size
    && ida.every((c) => volta.some((v) => v.id === c.id)));
  t("e com as mesmas feições", ida.every((c) => (volta.find((v) => v.id === c.id) || {}).feicao.nome === c.feicao.nome));
  t("rota sem pontos não quebra", celulasNaRota("s", null, B, o).length === 0);
  t("origem igual ao destino devolve uma", celulasNaRota("s", A, A, o).length === 1);
}

sec("5b. a jornada sabe em que trecho está");
{
  const mapa = { cidades: [{ nome: "A", x: 10, y: 10, bioma: "planicie" }, { nome: "B", x: 90, y: 90, bioma: "gelo" }] };
  const j = { de: "A", para: "B", desde: 1 };
  const inicio = celulaDaJornada("s", j, mapa, moldePorId("sobremundo"), 0);
  const meio = celulaDaJornada("s", j, mapa, moldePorId("sobremundo"), 0.5);
  const fim = celulaDaJornada("s", j, mapa, moldePorId("sobremundo"), 1);
  t("no começo, perto da origem", inicio.perto === "A");
  t("no fim, perto do destino", fim.perto === "B");
  t("no meio, longe das duas", meio.distancia > inicio.distancia && meio.distancia > fim.distancia);
  t("e o meio do caminho é mais perigoso", meio.perigo >= inicio.perigo && meio.perigo >= fim.perigo);
  t("jornada sem destino não quebra", celulaDaJornada("s", { de: "A" }, mapa, null, 0.5) === null);
  t("cidade que não existe no mapa também não", celulaDaJornada("s", { de: "Z", para: "W" }, mapa, null, 0.5) === null);
  t("celulaDaCidade devolve a célula da cidade", celulaDaCidade("s", mapa.cidades[0], { mapa }).perto === "A");
  t("e sem cidade devolve nada", celulaDaCidade("s", null) === null);
}

sec("6. o que o Mestre lê");
{
  const o = { molde: moldePorId("sobremundo"), mapa: { cidades: [{ nome: "Vaal", x: 20, y: 20, bioma: "floresta" }] } };
  const c = celulaEm("s", 60, 60, o);
  const txt = resumoCelulaPrompt(c, moldePorId("sobremundo"));
  t("o resumo diz o terreno", txt.includes("O ERMO AQUI"));
  t("nomeia a feição", txt.includes(c.feicao.nome));
  t("diz que ela continua lá na volta", /será a mesma coisa, no mesmo lugar/.test(txt));
  t("e proíbe fundar vila no ermo", /Não invente povoado/.test(txt));
  t("sem célula, sem texto", resumoCelulaPrompt(null) === "" && linhaDaCelula(null) === "");
  t("a linha da tela é curta e tem ícone", linhaDaCelula(c).length < 160 && linhaDaCelula(c).startsWith(c.feicao.icone));
  t("o bloco de regra proíbe o mesmo", /TERMINANTEMENTE PROIBIDO fundar povoado/.test(CELULAS_PROMPT));
  t("e manda a feição ser permanente", /PERMANENTE/.test(CELULAS_PROMPT));
}

sec("7. a porta das habilidades de regra própria");
{
  const monge = CLASSES.find((c) => c.nome === "Monge");
  const comGuarda = { habilidades: [monge.habilidades.find((h) => h.nome === "Corpo de Ferro") || monge.habilidades[0]] };
  const semNada = { habilidades: [{ nome: "Lábia", descricao: "Convence com palavras." }] };
  t("herói sem nenhuma delas fecha a porta", !temRegraPropria(semNada));
  t("ficha vazia também", !temRegraPropria({}) && !temRegraPropria(null));
  const druida = CLASSES.find((c) => c.nome === "Druida");
  t("quem tem Forma Animal abre", temRegraPropria({ habilidades: [druida.habilidades.find((h) => /Forma Animal/.test(h.nome))] }));
  t("quem tem Passo do Vento não abre por isso", !temRegraPropria({ habilidades: [monge.habilidades.find((h) => h.nome === "Passo do Vento")] }));
}

console.log(`\nonda 5 v9.54: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
