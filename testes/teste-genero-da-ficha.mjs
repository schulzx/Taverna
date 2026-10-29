/* teste-genero-da-ficha.mjs (29/10/2026, Fase 4, trilha B) — o gênero sai do sistema

   A trilha A deu ao desfecho o gênero do alvo («Lina ficou cega»), e a
   ordem dele lê primeiro o campo do próprio alvo (envelopes-do-turno.js
   GENERO_DO_ALVO). Faltava o campo: o bestiário sabia o gênero de 2 das 27
   por uma lista ao lado, nenhuma criatura de outro mundo o tinha, e o
   inimigo que nasce de uma pessoa do registo perdia o dela no caminho. Esta
   suíte prova que o gênero agora mora onde o resto da ficha mora:

     1. o cenário — as 27 do padrão declaram, e o validador lê o vocabulário;
     2. a ficha — daFicha leva o campo, e completarInimigo o passa ao
        inimigo quando a criatura é a CABEÇA do nome (GENERO_DA_FICHA);
     3. outro mundo — a Rainha da Colmeia fica «cega», e não «cego»;
     4. a pessoa do registo — lerAgressao, alvoPrometido e abrirOCombate
        levam o gênero dela até ao inimigo;
     5. o lixo, a imutabilidade e o determinismo.

   As secções 3 e 4 falham na árvore de antes (o campo não existia, e
   abrirOCombate deixava cair tudo o que não fosse nome, ameaça e nível). */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const S = "../src/";
const CN = await import(S + "cenario.js");
const { DADOS_DO_CENARIO_PADRAO } = await import(S + "cenario-padrao.js");
const B = await import(S + "bestiario.js");
const AG = await import(S + "agressao.js");
const EV = await import(S + "motor/envelopes-do-turno.js");
const CB = await import(S + "motor/combate-do-turno.js");

let ok = 0, mal = 0;
const t = (nome, cond, extra) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const copia = (o) => JSON.parse(JSON.stringify(o));
const completar = (nome, extra) => B.completarInimigo({ nome, ...(extra || {}) }, 3);
const condicao = (alvo, npcs) => EV.ENVELOPES_DO_DESFECHO.condicao({ alvo: alvo.nome, aplicou: true, condicao: "Cego", genero: EV.generoDoAlvo(alvo, npcs) });

sec("1. o cenário — as 27 do padrão declaram o gênero do nome");
{
  const todas = [...DADOS_DO_CENARIO_PADRAO.bestiario.criaturas, ...DADOS_DO_CENARIO_PADRAO.bestiario.arquetipos];
  t("as 27 declaram, cada uma com um dos dois", todas.length === 27 && todas.every((c) => CN.ESQUEMA_DO_CENARIO.generosDaFicha.includes(c.genero)), todas.filter((c) => !c.genero).map((c) => c.nome).join());
  const femininas = todas.filter((c) => c.genero === "mulher").map((c) => c.nome);
  t("duas femininas: a Quimera e a Sentinela Blindada", femininas.join() === "Quimera,Sentinela Blindada", femininas.join());
  /* a lista da trilha A (GENERO_DO_ALVO.criaturasFemininas) e o cenário não discordam:
     cada palavra dela é a cabeça de uma ficha feminina, e cada ficha feminina tem a dela */
  const cabeca = (n) => n.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").split(/\s+/)[0];
  t("o cenário e a lista do desfecho dizem as mesmas femininas", femininas.map(cabeca).sort().join() === [...EV.GENERO_DO_ALVO.criaturasFemininas].sort().join(), femininas.map(cabeca).join());
  t("o vocabulário é o da gente (o do bestiário e o do esquema são um só)", B.GENERO_DA_FICHA.generos.join() === CN.ESQUEMA_DO_CENARIO.generosDaFicha.join() && Object.isFrozen(B.GENERO_DA_FICHA.generos));
  t("é campo opcional da ficha (um mundo escrito antes dele continua válido)", CN.ESQUEMA_DO_CENARIO.criatura.genero === "generoDaFicha?");
  const d = copia(DADOS_DO_CENARIO_PADRAO);
  delete d.bestiario.criaturas[0].genero;
  t("sem o campo, o mundo carrega", CN.validarCenario(d).ok === true);
  d.bestiario.criaturas[1].genero = "feminino";
  const v = CN.validarCenario(d);
  t("o gênero fora do vocabulário é recusado, e diz onde", !v.ok && v.erros.some((e) => e.startsWith("bestiario.criaturas[1].genero: devia ser o gênero do nome")), v.erros.join(" | "));
}

sec("2. a ficha leva o campo, e o inimigo o herda pela cabeça do nome");
{
  t("a ficha derivada traz o gênero (as 27)", [...B.CRIATURAS_FANTASIA, ...B.ARQUETIPOS].every((c) => c.genero === "mulher" || c.genero === "homem"));
  t("a Quimera da ficha é mulher, o Ogro é homem", B.CRIATURAS_FANTASIA.find((c) => c.nome === "Quimera").genero === "mulher" && B.CRIATURAS_FANTASIA.find((c) => c.nome === "Ogro").genero === "homem");
  const casos = [
    ["Quimera", "mulher"], ["a Quimera de Três Cabeças", "mulher"], ["Sentinela Blindada", "mulher"],
    ["Lobo Atroz Velho", "homem"], ["o goblin arqueiro", "homem"], ["Goblin, o Rei", "homem"], ["TROLL DAS PONTES", "homem"],
    /* a base casa por includes, mas não é a cabeça: o campo não nasce */
    ["Marta, chefe dos bandidos", undefined], ["Velha Quimera", undefined], ["Capitã dos Bandidos", undefined],
    /* fora do bestiário: sem campo, como antes */
    ["Rainha Aranha", undefined], ["Bruxa da Turfa", undefined],
  ];
  const tortos = casos.filter(([n, g]) => completar(n).genero !== g);
  t(`a cabeça do nome decide, e só ela (${casos.length} nomes)`, tortos.length === 0, tortos.map(([n]) => n + "=" + completar(n).genero).join());
  t("o que o inimigo já traz ganha da ficha (a pessoa do registo, ou o Narrador)", completar("Lobo", { genero: "Mulher" }).genero === "mulher" && completar("Quimera", { genero: "homem" }).genero === "homem");
  t("o gênero torto não decide: a ficha decide, e sem ficha fica o que veio", completar("Quimera", { genero: "feminino" }).genero === "mulher" && completar("Zé Ninguém", { genero: "x" }).genero === "x");
  t("o desfecho da Quimera completada diz «cega» pelo campo dela", condicao(completar("Quimera")) === "Quimera ficou cega");
}

sec("3. outro mundo — a Rainha da Colmeia fica cega");
{
  const ORBITA = copia(DADOS_DO_CENARIO_PADRAO);
  ORBITA.id = "orbita-genero";
  ORBITA.bestiario.criaturas = [
    { nome: "Rato de Duto", ameaca: "fraco", nivelRef: 1, des: 3, desc: "rói cabos", genero: "homem" },
    { nome: "Rainha da Colmeia", ameaca: "lendario", nivelRef: 12, des: 2, desc: "o casco é o corpo dela", importante: true, genero: "mulher" },
  ];
  ORBITA.bestiario.arquetipos = [{ nome: "Contrabandista", ameaca: "comum", nivelRef: 3, des: 2, desc: "sabe onde o scanner não vê" }];
  CN.usarCenario(CN.carregarCenario(ORBITA));
  const rainha = completar("Rainha da Colmeia");
  t("a Rainha da Colmeia nasce mulher, pela ficha do mundo dela", rainha.genero === "mulher", String(rainha.genero));
  t("e o desfecho diz «ficou cega» (antes: «cego»)", condicao(rainha) === "Rainha da Colmeia ficou cega", condicao(rainha));
  t("o Contrabandista, que não declarou, vai sem campo e no masculino genérico", !("genero" in completar("Contrabandista")) && condicao(completar("Contrabandista")) === "Contrabandista ficou cego");
  CN.usarCenario(CN.CENARIO_PADRAO);
  t("de volta ao padrão, a Rainha já não é criatura de ninguém", !("genero" in completar("Rainha da Colmeia")));
}

sec("4. a pessoa do registo leva o gênero dela até ao inimigo");
{
  /* nomes fora dos bancos: só o campo da pessoa sabe */
  const presentes = [{ nome: "Xandra Vau", papel: "guarda", genero: "mulher" }, { nome: "Orvo Sal", papel: "ferreiro", genero_pessoa: "Homem" }, { nome: "Quel Pó", papel: "vendedora" }];
  const a1 = AG.lerAgressao("ataco a Xandra Vau com a espada", { presentes });
  const a2 = AG.lerAgressao("ataco o Orvo Sal", { presentes });
  const a3 = AG.lerAgressao("ataco a Quel Pó", { presentes });
  t("o golpe contra a pessoa do registo leva o gênero dela", a1 && a1.tipo === "agressao" && a1.genero === "mulher" && a2.genero === "homem", JSON.stringify([a1, a2]));
  t("quem o registo não diz vai sem campo", a3 && a3.tipo === "agressao" && !("genero" in a3));
  const prom = AG.alvoPrometido("a guarda", { presentes });
  t("a luta prometida pelo cartão leva o gênero de quem o registo achou", prom.deOnde === "registo" && prom.nome === "Xandra Vau" && prom.genero === "mulher", JSON.stringify(prom));
  const abrir = (crus) => CB.abrirOCombate({ inimigosCrus: crus, pers: { nome: "Vera", nivel: 3, atributos: {} }, planta: { local: "estrada" }, sementeDaAbertura: "prova|genero|1" }, {});
  const r = abrir([{ nome: a1.nome, ameaca: a1.ameaca, genero: a1.genero }, { nome: "Quimera", ameaca: "elite" }, { nome: "Quel Pó", ameaca: "fraco" }]);
  const ini = (r.combateNoRef && r.combateNoRef.inimigos) || [];
  const g = (n) => (ini.find((e) => e.nome === n) || {}).genero;
  t("a abertura da luta guarda o gênero da pessoa (antes caía)", r.abriu && g("Xandra Vau") === "mulher", JSON.stringify(ini.map((e) => [e.nome, e.genero])));
  t("…e o da ficha, e nenhum para quem nada sabe", g("Quimera") === "mulher" && g("Quel Pó") === undefined);
  t("o desfecho diz «Xandra Vau ficou cega» sem o registo à mão", condicao(ini.find((e) => e.nome === "Xandra Vau"), {}) === "Xandra Vau ficou cega");
}

sec("5. o lixo, a imutabilidade e o determinismo");
{
  const e = Object.freeze({ nome: "Quimera", genero: "x" });
  const a = B.completarInimigo(e, 4), b = B.completarInimigo(e, 4);
  t("não muta o que recebe, e dá o mesmo duas vezes", e.genero === "x" && JSON.stringify(a) === JSON.stringify(b));
  t("completar o completado dá o mesmo (idempotente)", JSON.stringify(B.completarInimigo(a, 4)) === JSON.stringify(a));
  t("o inimigo sem nome nem gênero não ganha campo", !("genero" in B.completarInimigo({}, 1)));
  let estourou = false;
  try { AG.lerAgressao("ataco a Xandra", { presentes: [{ nome: "Xandra", genero: null }, null, { nome: "Zé", genero: 7 }] }); AG.alvoPrometido("a guarda", { presentes: [{ nome: "A Guarda", papel: "guarda", genero: {} }] }); } catch { estourou = true; }
  t("o gênero torto na pessoa não estoura a leitura do golpe", !estourou);
  const fonte = fs.readFileSync(path.join(AQUI, "..", "src", "bestiario.js"), "utf8");
  t("os artigos e os gêneros saem da tabela (GENERO_DA_FICHA), não de literal na função", /GENERO_DA_FICHA\.artigos/.test(fonte) && /GENERO_DA_FICHA\.generos\.includes\(proprio\)/.test(fonte));
}

console.log(`\ngênero da ficha: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
