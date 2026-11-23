/* QUEM É QUEM (23/11/2026, identidade · etapa 1) — src/quem-e-quem.js

   A ordem da pessoa: «mesmo que tenha dois fulanos, o sistema vai saber
   qual é que está em cena». Esta suíte prova o MECANISMO, e nenhum nome
   em particular — os nomes daqui são de prova e podiam ser outros:
   §1 a tabela e a forma de cada id (idDe);
   §2 dois de mesmo nome na mesma cidade dão dois ids estáveis (o `~2`,
      pela ordem da base), e a primeira continua com o id de sempre;
   §3 a mesma semente dá os mesmos ids em duas corridas, e a base refeita
      pela semente acha o homônimo sozinha;
   §4 o save sem o campo `pessoas` deriva tudo, e o campo vai ao estado
      como aditivo (estado.js);
   §5 a pessoa do registo e a mesma pessoa da base fundem num id só;
   §6 candidatos: os homônimos, cada um com o seu estado (aqui, longe,
      morto), sem escolher calado;
   §7 o rótulo só distingue quando há outro de mesmo primeiro nome perto;
   §8 a presença;
   §9 o campo do save: garantirPessoas e fundir, e o catálogo que os lê;
   §10 o livro delega e não muda (o que já resolvia, resolve igual);
   §11 a imutabilidade e o lixo. */
import {
  QUEM_E_QUEM, RESOLVER_NOME, CASA_O_NOME, palavrasDoNome, naCidade,
  idDe, catalogoDoElenco, oCatalogo, genteDaCidade, candidatos, presenca, rotuloDe,
  fundir, garantirPessoas,
} from "../src/quem-e-quem.js";
import { idDaPessoa, anotarTurno, garantirFactos, RESOLVER_NOME as RESOLVER_DO_LIVRO } from "../src/livro-de-factos.js";
import { CAMPOS, estadoDoSave, estadoVazio } from "../src/estado.js";
import { idDaGente } from "../src/mundo-base.js";

let bons = 0, maus = 0;
const t = (n, c, extra) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const J = (x) => JSON.stringify(x);
const congelar = (o) => { if (o && typeof o === "object") { Object.freeze(o); for (const v of Object.values(o)) congelar(v); } return o; };

/* uma ficha do registo como criarNPC (npcs.js) a deixa no save */
const ficha = (nome, extra = {}) => ({ nome, papel: "", relacao: "desconhecido", genero: "", local: "", status: "vivo", segredo: "", notas: "", laco: null, entre: {}, consultas: 0, ultimaVez: 0, semente: `npc|${nome}|`, ...extra });
/* um estado mínimo, na forma do save (estado.js) */
const estado = (extra = {}) => ({ ...estadoVazio(), nomeCampanha: "prova", mundo: { genero: "Horror cósmico", molde: "sobremundo" }, personagem: { nome: "Aurelia Vane", grupo: [] }, npcs: {}, canone: {}, cidadeAtual: "Vau", mapa: { cidades: [] }, ...extra });

/* ============================================================ */
sec("§1 a tabela e a forma do id");
{
  t("a régua do nome é tabela, e o livro reexporta a mesma", RESOLVER_DO_LIVRO === RESOLVER_NOME && J(RESOLVER_NOME.fontes) === J(["gente", "nucleo", "grupo", "registo", "canone"]));
  t("os níveis são os do livro, por nome", J(Object.keys(CASA_O_NOME)) === J(RESOLVER_NOME.niveis));
  t("os estados são tabela", J(QUEM_E_QUEM.estados) === J(["aqui", "longe", "morto"]));
  t("o herói é `heroi`", idDe({ nome: "Aurelia" }, "heroi") === "heroi");
  t("o registo é npc|<chave>", idDe({ chave: "Hilda~2", nome: "Hilda" }, "registo") === "npc|Hilda~2");
  t("…e o id que a ficha traz vale, se for do registo", idDe({ chave: "Hilda", id: "npc|Hilda~3" }, "registo") === "npc|Hilda~3" && idDe({ chave: "Hilda", id: "Vau|taverna|0" }, "registo") === "npc|Hilda");
  t("núcleo, grupo, cânone e batizado são npc|<nome>", ["nucleo", "grupo", "canone", "batizado"].every((f) => idDe({ nome: "Brom" }, f) === "npc|Brom"));
  t("a gente da base é o id de idDaGente", idDe({ nome: "Hilda Ferro", cidade: "Vau" }, "gente") === idDaGente("Vau", { nome: "Hilda Ferro" }));
  t("o figurante é Cidade|figurante|<tipo>", idDe({ tipo: "guarda" }, "figurante", { cidade: "Vau" }) === "Vau|figurante|guarda");
  t("a banca é banca|<id>", idDe({ id: "Vau|mercado" }, "banca") === "banca|Vau|mercado");
  t("fonte que não existe, ou sem nome: vazio", idDe({ nome: "X" }, "outra") === "" && idDe({}, "registo") === "" && idDe(null, "gente") === "");
  t("as palavras do nome tiram artigo e aposto", J(palavrasDoNome("Dona Inocência, a viúva")) === J(["inocencia"]));
  t("a «onde» nomeia a cidade", naCidade("nas docas de Vau", "Vau") && !naCidade("", "Vau"));
}

/* ============================================================ */
sec("§2 dois de mesmo nome na mesma cidade: dois ids");
{
  /* a gente como genteDoLocal a dá: o id posicional `Cidade|tipo|i` */
  const gente = [
    { id: "Vau|taverna|0", nome: "Hilda", cidade: "Vau", local: "O Caneco", papel: "taverneira" },
    { id: "Vau|ferraria|0", nome: "Teodoro Rima", cidade: "Vau", local: "A Bigorna", papel: "ferreiro" },
    { id: "Vau|ferraria|1", nome: "Hilda", cidade: "Vau", local: "A Bigorna", papel: "ferreira" },
  ];
  const c = catalogoDoElenco({ gente, cidade: "Vau" });
  const ids = Object.keys(c.porId);
  t("as duas Hildas são duas pessoas", ids.includes("Vau|gente|Hilda") && ids.includes("Vau|gente|Hilda~2"), J(ids));
  t("a primeira, pela ordem da base, fica com o id de sempre (o fato gravado continua dela)", c.porId["Vau|gente|Hilda"].local === "O Caneco");
  t("a segunda leva o número", c.porId["Vau|gente|Hilda~2"].oficio === "ferreira");
  t("o índice do primeiro nome tem as duas", J(c.porNome.hilda) === J(["Vau|gente|Hilda", "Vau|gente|Hilda~2"]));
  const de = catalogoDoElenco({ gente: [gente[2], gente[1], gente[0]], cidade: "Vau" });
  t("a ordem da base é que numera (outra ordem, outro número — por isso ela vem da semente)", de.porId["Vau|gente|Hilda"].local === "A Bigorna");
  t("idDe acha o número da pessoa na lista", idDe(gente[2], "gente", { gente }) === "Vau|gente|Hilda~2" && idDe(gente[0], "gente", { gente }) === "Vau|gente|Hilda");
  const repetida = catalogoDoElenco({ gente: [gente[0], { ...gente[0] }], cidade: "Vau" });
  t("a mesma pessoa duas vezes na lista não vira homônimo", J(Object.keys(repetida.porId)) === J(["Vau|gente|Hilda"]));
  const outra = catalogoDoElenco({ gente: [gente[0], { ...gente[2], cidade: "Sal" }], cidade: "Vau" });
  t("o mesmo nome noutra cidade não leva número (o id já traz a cidade)", J(Object.keys(outra.porId)) === J(["Vau|gente|Hilda", "Sal|gente|Hilda"]));
  const reg = catalogoDoElenco({ npcs: { Hilda: ficha("Hilda", { local: "Vau" }), "Hilda~2": ficha("Hilda", { local: "Sal" }) } });
  t("no registo, o homônimo é a chave `~2` com o nome de sempre", J(Object.keys(reg.porId)) === J(["npc|Hilda", "npc|Hilda~2"]) && reg.porId["npc|Hilda~2"].nome === "Hilda");
}

/* ============================================================ */
sec("§3 a mesma semente, os mesmos ids");
{
  const cidade = { nome: "Rio do Martelo", porte: "capital", tipo: "capital", bioma: "planicie" };
  const mundo = { genero: "Horror cósmico", molde: "sobremundo" };
  /* procura uma semente de prova cuja base tenha um homônimo — o motor
     não é ensinado a nenhuma: ele acha-o sozinho */
  let achada = null;
  for (let i = 0; i < 400 && !achada; i++) {
    const semente = `prova-quem|${i}|${mundo.genero}`;
    const g = genteDaCidade(semente, cidade, mundo);
    const nomes = g.map((p) => p.nome);
    if (nomes.some((n, j) => nomes.indexOf(n) !== j)) achada = semente;
  }
  t("há semente de prova com homônimo na base", !!achada);
  const E = estado({ cidadeAtual: cidade.nome, mapa: { cidades: [cidade] } });
  const um = oCatalogo(E, { mundo: { ...mundo, semente: achada } });
  const dois = oCatalogo(E, { mundo: { ...mundo, semente: achada } });
  t("duas corridas, os mesmos ids, na mesma ordem", J(Object.keys(um.porId)) === J(Object.keys(dois.porId)) && Object.keys(um.porId).length > 0);
  t("…e o homônimo da base sai com `~2`", Object.keys(um.porId).some((id) => id.endsWith(`${QUEM_E_QUEM.homonimo}2`)));
  t("a mesma base duas vezes é igual (genteDaCidade é da semente)", J(genteDaCidade(achada, cidade, mundo)) === J(genteDaCidade(achada, cidade, mundo)));
  const sem = oCatalogo(E, { mundo: { ...mundo, semente: achada + "x" } });
  t("outra semente, outra gente", J(Object.keys(sem.porId)) !== J(Object.keys(um.porId)));
  const daCampanha = oCatalogo({ ...E, nomeCampanha: "Vale" });
  const comSemente = oCatalogo(E, { mundo: { ...mundo, semente: "Vale|Horror cósmico" } });
  t("sem semente dada, vale a da campanha (o nome e o gênero, a régua do App)", J(Object.keys(daCampanha.porId)) === J(Object.keys(comSemente.porId)));
  t("a gente que quem chama já tem passa por cima da semente", J(Object.keys(oCatalogo(E, { gente: [{ nome: "Hilda", cidade: "Rio do Martelo" }] }).porId)) === J(["Rio do Martelo|gente|Hilda"]));
}

/* ============================================================ */
sec("§4 o save sem `pessoas` deriva tudo");
{
  const sv = { personagem: { nome: "Aurelia Vane", grupo: [{ nome: "Brom" }] }, npcs: { Hilda: ficha("Hilda", { local: "Vau" }) }, cidadeAtual: "Vau" };
  const E = estadoDoSave(sv);
  t("o campo novo vai ao estado com o padrão null", Object.prototype.hasOwnProperty.call(E, "pessoas") && E.pessoas === null);
  const def = CAMPOS.find((c) => c.campo === "pessoas");
  t("…declarado em estado.js, na memória, sem padrão que apague migração", def && def.padrao === null && def.grupo === "memoria");
  const c = oCatalogo(E);
  t("o catálogo sai inteiro do que o save já tem", J(Object.keys(c.porId)) === J(["npc|Brom", "npc|Hilda"]));
  t("garantirPessoas do ausente é null (nada a guardar)", garantirPessoas(undefined) === null && garantirPessoas({}) === null && garantirPessoas({ alias: {}, fichas: {} }) === null);
  t("nenhum campo existente mudou: o save lido sai com os mesmos valores", J(E.npcs) === J(sv.npcs) && J(E.personagem) === J(sv.personagem));
}

/* ============================================================ */
sec("§5 o registo e a base: um id só");
{
  const gente = [{ id: "Vau|taverna|0", nome: "Hilda Ferro", cidade: "Vau", local: "O Caneco", papel: "taverneira" }];
  const npcs = { "Hilda Ferro": ficha("Hilda Ferro", { local: "Vau" }), Hilda: ficha("Hilda", { local: "Vau" }) };
  const c = catalogoDoElenco({ gente, npcs, cidade: "Vau" });
  t("a do registo é apelido da da base", c.alias["npc|Hilda Ferro"] === "Vau|gente|Hilda Ferro");
  t("…e o nome curto também (prefixo, na mesma terra)", c.alias["npc|Hilda"] === "Vau|gente|Hilda Ferro");
  t("o catálogo tem uma pessoa só", J(Object.keys(c.porId)) === J(["Vau|gente|Hilda Ferro"]));
  const cs = candidatos("Hilda Ferro", c);
  t("o nome dá um candidato só", cs.length === 1 && cs[0].id === "Vau|gente|Hilda Ferro");
  const longe = catalogoDoElenco({ gente, npcs: { "Hilda Ferro": ficha("Hilda Ferro", { local: "Sal" }) }, cidade: "Vau" });
  t("o mesmo nome noutra terra não funde (são duas)", Object.keys(longe.porId).length === 2 && !longe.alias["npc|Hilda Ferro"]);
  const duas = catalogoDoElenco({ gente: [gente[0], { id: "Vau|ferraria|0", nome: "Hilda Ferro", cidade: "Vau" }], npcs: { "Hilda Ferro": ficha("Hilda Ferro", { local: "Vau" }) }, cidade: "Vau" });
  t("com duas da base de mesmo nome, a do registo não escolhe uma (fica ela mesma)", !duas.alias["npc|Hilda Ferro"] && Object.keys(duas.porId).length === 3);
}

/* ============================================================ */
sec("§6 candidatos: os dois, com o estado de cada um");
{
  const E = estado({
    npcs: {
      Hilda: ficha("Hilda", { local: "Vau", papel: "taverneira" }),
      "Hilda~2": ficha("Hilda", { local: "Sal", papel: "ferreira" }),
      "Hilda~3": ficha("Hilda", { local: "Vau", papel: "parteira", status: "morto" }),
      Teodoro: ficha("Teodoro", { local: "Vau" }),
    },
    mapa: { cidades: [{ nome: "Vau" }, { nome: "Sal" }] },
  });
  const c = oCatalogo(E, { gente: [] });
  const cs = candidatos("Hilda", c);
  t("o nome dá as três, e não uma escolhida", J(cs.map((x) => x.id)) === J(["npc|Hilda", "npc|Hilda~2", "npc|Hilda~3"]));
  t("cada uma com o seu estado: aqui, longe, morto", J(cs.map((x) => x.estado)) === J(["aqui", "longe", "morto"]));
  t("e com rótulos que as distinguem", new Set(cs.map((x) => x.rotulo)).size === 3 && cs[0].rotulo === "Hilda, taverneira", J(cs.map((x) => x.rotulo)));
  t("o nível é dito (porque)", cs.every((x) => x.porque === "exato"));
  t("quem vive na cidade do herói vem marcado", J(cs.map((x) => x.daCidade)) === J([true, false, true]));
  t("um nome só de uma pessoa dá uma", candidatos("Teodoro", c).length === 1);
  t("o herói não é candidato de gente: vem marcado como herói", candidatos("Aurelia", c)[0].porque === "heroi" && candidatos("Aurelia", c)[0].id === "heroi");
  t("um id já feito passa como veio", candidatos("npc|Hilda~2", c)[0].id === "npc|Hilda~2" && candidatos("npc|Hilda~2", c)[0].porque === "id");
  t("ninguém com o nome: vazio", candidatos("Zebedeu", c).length === 0 && candidatos("", c).length === 0);
  const outra = presenca(E, c);
  const ajeitada = { ...outra, aqui: [...outra.aqui, "npc|Hilda~2"] };
  t("a presença dada por quem chama vale por cima da do catálogo", candidatos("Hilda", c, ajeitada)[1].estado === "aqui");
}

/* ============================================================ */
sec("§7 o rótulo só distingue quando há outro perto");
{
  const c = catalogoDoElenco({ npcs: {
    Hilda: ficha("Hilda", { local: "Vau", papel: "taverneira" }),
    "Hilda~2": ficha("Hilda", { local: "Vau", papel: "ferreira" }),
    "Hilda Sal": ficha("Hilda Sal", { local: "Vau", papel: "ferreira" }),
    Ilda: ficha("Ilda", { local: "Vau", papel: "ferreira" }),
  } });
  t("sozinha em cena: só o nome", rotuloDe("npc|Hilda", c, ["npc|Hilda", "npc|Ilda"]) === "Hilda");
  t("com outra Hilda perto: o ofício", rotuloDe("npc|Hilda", c, ["npc|Hilda", "npc|Hilda~2"]) === "Hilda, taverneira");
  t("o ofício igual não distingue: passa ao seguinte (o nome inteiro)", rotuloDe("npc|Hilda Sal", c, ["npc|Hilda~2", "npc|Hilda Sal"]) === "Hilda Sal");
  const iguais = catalogoDoElenco({ npcs: { Hilda: ficha("Hilda", { local: "Vau" }), "Hilda~2": ficha("Hilda", { local: "Vau" }) } });
  t("nada distingue: o número do homônimo", rotuloDe("npc|Hilda~2", iguais, ["npc|Hilda", "npc|Hilda~2"]) === "Hilda (2)");
  const lugar = catalogoDoElenco({ npcs: { Hilda: ficha("Hilda", { local: "O Caneco" }), "Hilda~2": ficha("Hilda", { local: "A Bigorna" }) } });
  t("sem ofício, o lugar", rotuloDe("npc|Hilda~2", lugar, ["npc|Hilda", "npc|Hilda~2"]) === "Hilda, de A Bigorna");
  t("a presença serve de cena (vale o `aqui`)", rotuloDe("npc|Hilda", c, { aqui: ["npc|Hilda", "npc|Hilda~2"] }) === "Hilda, taverneira");
  t("id que o catálogo não tem: vazio", rotuloDe("npc|Ninguém", c, []) === "");
}

/* ============================================================ */
sec("§8 a presença");
{
  const E = estado({
    personagem: { nome: "Aurelia Vane", grupo: [{ nome: "Brom" }, { nome: "Lobo", invocada: true }] },
    npcs: { Brom: ficha("Brom", { local: "Sal" }), Corrado: ficha("Corrado", { local: "Vau" }), Dario: ficha("Dario", { local: "Sal" }), Noe: ficha("Noe", { local: "Vau" }) },
    lugar: { nome: "Vau", cidade: "Vau" },
    factos: { v: 1, pessoas: { "npc|Noe": { derrotado: { dia: 2, como: "morto" } } }, lugares: {} },
    mapa: { cidades: [{ nome: "Vau" }, { nome: "Sal" }] },
  });
  const c = oCatalogo(E, { gente: [{ id: "Vau|taverna|0", nome: "Marta", cidade: "Vau", local: "O Caneco" }] });
  const p = c.presenca;
  t("o grupo está sempre aqui, e a invocação não é gente", p.grupo.includes("npc|Brom") && p.aqui.includes("npc|Brom") && !Object.keys(c.porId).includes("npc|Lobo"));
  t("o registo pela régua da cena: quem vive aqui está aqui; o outro, longe", p.aqui.includes("npc|Corrado") && p.longe.includes("npc|Dario"));
  t("a gente da base desta cidade está aqui", p.aqui.includes("Vau|gente|Marta"));
  t("quem o livro diz que caiu morto é morto, e nunca aqui", p.mortos.includes("npc|Noe") && !p.aqui.includes("npc|Noe") && !p.longe.includes("npc|Noe"));
  const naEstrada = presenca({ ...E, jornada: { de: "Vau", para: "Sal" } }, c);
  t("na estrada, a gente da cidade fica longe", naEstrada.longe.includes("Vau|gente|Marta"));
  const sitio = presenca({ ...E, lugar: { nome: "O Caneco", cidade: "Vau" } }, c);
  t("doSitio: quem é do lugar onde o herói está", J(sitio.doSitio) === J(["Vau|gente|Marta"]));
  t("doPasso: o que quem chama diz que o passo pede, resolvido para id", J(presenca(E, c, { passo: ["Dario", "Ninguém"] }).doPasso) === J(["npc|Dario"]));
  t("catálogo vazio, presença vazia", J(presenca(E, {})) === J({ aqui: [], longe: [], grupo: [], doSitio: [], doPasso: [], mortos: [] }));
}

/* ============================================================ */
sec("§9 o campo do save: garantirPessoas e fundir");
{
  const p1 = fundir(null, "npc|Velha do Poço", "npc|Inês");
  t("fundir abre o campo", p1 && p1.v === QUEM_E_QUEM.v && p1.alias["npc|Velha do Poço"] === "npc|Inês");
  const p2 = fundir(p1, "npc|Inês", "Vau|gente|Inês Moura");
  t("quem apontava para o de baixo passa a apontar para o fim", p2.alias["npc|Velha do Poço"] === "Vau|gente|Inês Moura" && p2.alias["npc|Inês"] === "Vau|gente|Inês Moura");
  t("a fusão que fecharia um laço não acontece", J(fundir(p2, "Vau|gente|Inês Moura", "npc|Inês")) === J(p2));
  t("fundir consigo mesmo, ou com vazio, não muda nada", J(fundir(p1, "npc|Inês", "npc|Inês")) === J(p1) && J(fundir(p1, "", "npc|X")) === J(p1));
  t("o laço vindo do save abre-se no garantir (cai o primeiro que o fecha)", J(garantirPessoas({ alias: { a: "b", b: "a", c: "d" } }).alias) === J({ b: "a", c: "d" }));
  t("lixo dá null", garantirPessoas("x") === null && garantirPessoas([1]) === null && garantirPessoas({ alias: { a: 3 }, fichas: { b: null } }) === null);
  const muitos = garantirPessoas({ alias: Object.fromEntries(Array.from({ length: 300 }, (_, i) => [`npc|a${i}`, `npc|b${i}`])) });
  t("o teto do alias vale", Object.keys(muitos.alias).length === QUEM_E_QUEM.alias);
  const fichaSo = garantirPessoas({ fichas: { "npc|Hilda~2": { nome: "Hilda", origem: "batizado", cidade: "Vau", lixo: 1 } } });
  t("a ficha guarda só a sua forma", J(fichaSo.fichas["npc|Hilda~2"]) === J({ nome: "Hilda", origem: "batizado", cidade: "Vau" }));
  /* o catálogo lê o campo */
  const npcs = { "Velha do Poço": ficha("Velha do Poço", { local: "Vau" }), "Inês": ficha("Inês", { local: "Vau" }) };
  const sem = catalogoDoElenco({ npcs });
  t("a régua sozinha não funde a velha e a Inês (nomes que não se casam)", Object.keys(sem.porId).length === 2);
  const com = catalogoDoElenco({ npcs }, p1);
  t("a fusão guardada funde", J(Object.keys(com.porId)) === J(["npc|Inês"]) && com.alias["npc|Velha do Poço"] === "npc|Inês");
  t("…e o nome da de baixo dá a de cima", candidatos("Velha do Poço", com)[0].id === "npc|Inês");
  t("a fusão para quem não existe é ignorada (ninguém some)", Object.keys(catalogoDoElenco({ npcs }, fundir(null, "npc|Inês", "npc|Fantasma")).porId).length === 2);
  const homo = catalogoDoElenco({ npcs: { Hilda: ficha("Hilda", { local: "Vau" }) } }, { fichas: { "npc|Hilda~2": { nome: "Hilda", cidade: "Sal" } } });
  t("a ficha do homônimo guardada entra no catálogo", J(Object.keys(homo.porId)) === J(["npc|Hilda", "npc|Hilda~2"]));
  const E = estado({ npcs, pessoas: p1 });
  t("oCatalogo lê o campo do estado", J(Object.keys(oCatalogo(E, { gente: [] }).porId)) === J(["npc|Inês"]));
}

/* ============================================================ */
sec("§10 o livro delega, e o que resolvia resolve igual");
{
  const gente = [{ nome: "Marl de Osso", cidade: "Foz" }, { nome: "Teodoro Rima", cidade: "Foz" }];
  const ctx = { gente, npcs: { Marl: { nome: "Marl", local: "Foz" } }, cidade: "Foz" };
  t("o id do livro é o id do catálogo", idDaPessoa("Marl", ctx).id === catalogoDoElenco(ctx).alias["npc|Marl"]);
  const duasHildas = { gente: [{ id: "Foz|taverna|0", nome: "Hilda", cidade: "Foz" }, { id: "Foz|cais|1", nome: "Hilda", cidade: "Foz" }], cidade: "Foz" };
  const r = idDaPessoa("Hilda", duasHildas);
  t("duas Hildas da base na cidade: o livro não escolhe (ambíguo, com as duas)", r.id === "" && r.motivo === "ambiguo" && r.candidatos.length === 2);
  t("…e cada uma pelo seu id escreve na sua", idDaPessoa("Foz|gente|Hilda~2", duasHildas).id === "Foz|gente|Hilda~2");
  const { factos, notas } = anotarTurno(garantirFactos(null), { ...duasHildas, falouCom: ["Hilda", "Foz|gente|Hilda~2"] });
  t("anotar com o nome ambíguo não escreve, com o id escreve só nela", J(Object.keys(factos.pessoas)) === J(["Foz|gente|Hilda~2"]) && notas.length === 1);
}

/* ============================================================ */
sec("§11 a imutabilidade e o lixo");
{
  const E = congelar(estado({ npcs: { Hilda: ficha("Hilda", { local: "Vau" }) }, pessoas: { v: 1, alias: { "npc|X": "npc|Hilda" }, fichas: {} } }));
  let ok = true;
  try { oCatalogo(E, { gente: [] }); fundir(E.pessoas, "npc|Hilda", "npc|Y"); garantirPessoas(E.pessoas); } catch { ok = false; }
  t("estado congelado: nada estoura, nada se escreve", ok);
  let nada = true;
  try {
    for (const x of [null, undefined, 3, "x", [], {}]) { oCatalogo(x); catalogoDoElenco(x); candidatos(x, x); presenca(x, x); rotuloDe(x, x, x); idDe(x, x, x); }
  } catch (e) { nada = false; console.log(e.stack); }
  t("lixo em toda função: vazio, nunca exceção", nada);
}

console.log(`\n${bons} ok · ${maus} falhas`);
if (maus) process.exit(1);
