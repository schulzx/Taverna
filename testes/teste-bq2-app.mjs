/* teste-bq2-app.mjs (BQ2, 08/11/2026) — a fiação do livro de factos no App

   O módulo (src/livro-de-factos.js) prova-se em teste-livro-de-factos, e a
   escrita do turno (src/motor/livro-do-turno.js) em teste-bq2-ligacao; aqui
   prova-se o lado do App, pelo texto: o livro vai ao save e volta do load, um
   capítulo novo guarda-o e uma campanha nova esvazia-o, a sala NÃO o leva (o
   protocolo de api/sala não muda), e toda escrita passa por um invólucro só,
   em try/catch com `calou` — um livro que estoura nunca custa o turno — com as
   notas do ambíguo na consola e nunca na tela.

   A ESCRITA É DO MOTOR (08/11, a mesma leva). O replay (sessao.js) e o
   servidor têm de produzir o mesmo livro que o App; por isso o elenco que
   resolve os nomes sai do ESTADO (livro-do-turno.js#elencoDoLivro) e a
   presença do fim da resposta também (#oQueACenaDaAoLivro). O App só monta o
   retrato do livro com os refs do instante e grava o que a peça devolve. */
import fs from "node:fs";
import { garantirFactos, anotarTurno } from "../src/livro-de-factos.js";
import { CAMPOS } from "../src/estado.js";

const APP = fs.readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8").replace(/\r\n/g, "\n");
/* o código sem os comentários: uma chamada citada num comentário não conta */
const COD = APP.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);
const corpo = (abre, fecha = "\n  };") => { const i = APP.indexOf(abre); return i < 0 ? "" : APP.slice(i, APP.indexOf(fecha, i) + fecha.length); };

sec("1. o ref, o save e o load");
/* MOVIDA (08/11, BQ2): o App já não importa o anotarTurno — escreve pela peça
   do motor (o replay e o servidor chamam a mesma); do módulo lê só o garantir */
t("o App lê o garantir do módulo, e escreve pela peça do motor",
  APP.includes('import { garantirFactos } from "./livro-de-factos.js";') && APP.includes('import { anotarOLivro, oQueACenaDaAoLivro } from "./motor/livro-do-turno.js";'));
t("o livro mora num ref, que nasce vazio", APP.includes("const factosRef = useRef(garantirFactos(null));"));
t("o save leva `factos`, a seguir à memória", APP.includes("memoria: memoriaRef.current, factos: factosRef.current, saber: saberRef.current,"));
{
  const i = CAMPOS.findIndex((c) => c.campo === "memoria");
  t("e a tabela do estado conhece o campo, no mesmo lugar (teste-estado lê os dois)", i >= 0 && CAMPOS[i + 1] && CAMPOS[i + 1].campo === "factos");
}
t("o load lê `sv.factos` pelo garantir, em try/catch com calou (um save torto dá o livro vazio)",
  APP.includes('try { factosRef.current = garantirFactos(sv.factos); } catch (e) { calou("o livro de factos do save", e); factosRef.current = garantirFactos(null); }'));
t("o save de antes (sem o campo) abre com o livro vazio", JSON.stringify(garantirFactos(undefined)) === JSON.stringify(garantirFactos(null)) && Object.keys(garantirFactos(undefined).pessoas).length === 0);
t("campanha nova esvazia o livro; o capítulo novo guarda-o (como a memória)", APP.includes("if (!cap) factosRef.current = garantirFactos(null);"));

sec("2. a sala não o leva");
const linhaSala = APP.split("\n").find((l) => l.includes("...paraSala } = dados;")) || "";
t("a desestruturação da sala tira `factos`", linhaSala.includes("factos: _factosLocal, ...paraSala } = dados; publicarEstado(paraSala);"));
{
  /* a mesma desestruturação, corrida: o convidado recebe o objeto de antes */
  const dados = { versao: 2, nomeCampanha: "x", elenco: {}, lei: {}, memoria: {}, factos: { v: 1, pessoas: { "npc|Bruna": {} }, lugares: {} }, mapa: {} };
  const { versao: _v, elenco: _e, lei: _l, memoria: _m, factos: _f, ...paraSala } = dados;
  t("e o que atravessa não tem a chave", !("factos" in paraSala) && "mapa" in paraSala);
}

sec("3. toda escrita num invólucro só, em calou");
/* MOVIDA (08/11, BQ2): o invólucro chama a peça do motor (anotarOLivro) e
   recebe, se quem o chama já o tem, o retrato do instante; o elenco já não se
   monta aqui — sai do estado, no motor, um só para o App, o replay e o
   servidor (e por isso sem o núcleo e sem a gente da base, que o estado não
   leva: livro-do-turno.js, o cabeçalho) */
const inv = corpo("  const anotarNoLivro = (onde, ocorrido, retrato) => {");
t("o invólucro existe", inv.length > 0);
t("o App não chama o anotarTurno; a peça do motor chama-se num sítio só, dentro do invólucro",
  (COD.match(/anotarTurno\(/g) || []).length === 0 && (COD.match(/anotarOLivro\(/g) || []).length === 1 && inv.includes("anotarOLivro(retrato || retratoDoLivro(), ocorrido, { mundo: mundoDoLivro() })"));
t("o invólucro tem try e o catch é calou", /^\s*const anotarNoLivro = \(onde, ocorrido, retrato\) => \{\n\s*try \{/.test(inv) && inv.includes('} catch (e) { calou("LIVRO · " + onde, e); }'));
t("as notas do ambíguo vão à consola e nunca à tela", inv.includes("console.info(") && !/pushMsgs|set[A-Z]\w*\(/.test(inv));
const retrato = corpo("  const retratoDoLivro = () => ({", "\n  });");
t("o retrato do livro é o estado que o motor lê (o livro, a ficha, a cidade, o registo, o cânone, o dia, o turno)",
  ["factos: factosRef.current", "personagem: personagemRef.current", "cidadeAtual: cidadeAtualRef.current", "npcs: npcsRef.current", "canone: canoneRef.current", "dia: diaRef.current", "npcTurno: npcTurnoRef.current"].every((x) => retrato.includes(x)));
t("e o App não monta outro elenco", !COD.includes("const elencoDoLivro"));

sec("4. os sítios que escrevem");
/* MOVIDA (08/11, BQ2): a presença saiu do efeito das fichas (que corre no
   render, e também no load) para o turno, depois do conferente e do trabalho
   daqui e antes do Cronista — o sítio do passo «o livro de factos» do
   replay —, pela peça do motor, com a prosa crua que a sessão grava */
{
  /* MOVIDA (13/11, NE2): a peça recebe também o modo do Narrador — a porta
     `livroVistoDaProsa` fecha o «visto» lido da prosa nos modos que a fecham.
     O sítio e a ordem são os mesmos; a âncora ganhou só o campo. */
  const i = COD.indexOf('anotarNoLivro("o fim da resposta", oQueACenaDaAoLivro(rl, { narrativa: narrativaDoLivro, modoDoNarrador: MODO_DA_MESA }), rl)');
  t("o fim da resposta: a cena, o lugar e a afeição do grupo, pela peça do motor, no turno",
    i > 0 && i > COD.indexOf("try { oferecerTrabalhoDaqui(); }") && i < COD.indexOf("cronistaDoTurno(pers, narrativaFinal, doTurnoCr)"));
  t("a prosa é a resposta crua, tirada antes do aplicar (a que a sessão grava)",
    COD.includes('const narrativaDoLivro = String(resp.narrativa || "");') && COD.indexOf("const narrativaDoLivro") < COD.indexOf("let pers = aplicarResposta(resp"));
  t("e as fichas da tela já não escrevem no livro", !COD.includes('anotarNoLivro("a cena do fim da resposta"'));
}
t("o Cronista: o efeito `factos`", APP.includes('else if (ef.tipo === "factos") anotarNoLivro("o Cronista", ef);'));
t("e o Cronista lê o livro", corpo("  const estadoDoCronista = () => ({", "\n  });").includes("factos: factosRef.current"));
t("a luta: o efeito `factos` do motor", APP.includes('else if (ef.tipo === "factos") anotarNoLivro("a luta", ef);'));
t("a luta fechada pelo golpe: todos os inimigos, com as marcas", APP.includes('anotarNoLivro("os caídos da luta", { derrotados: c.inimigos || [] });'));
t("a luta sem saída: só quem caiu (quem ficou de pé não)", /anotarNoLivro\("os caídos da luta sem saída", \{ derrotados: \(fimDaLuta\.inimigos \|\| \[\]\)\.filter\(/.test(APP));
t("o mundo das missões leva o livro", corpo("  const mundoDasMissoes = (persAtual) => {", "\n  };").includes("factos: factosRef.current,"));
/* (08/11, BQ2) as peças do motor que leem o livro recebem-no no estado: o
   livro não é ref das tabelas delas (REFS_DO_*), e vai junto */
t("as peças do motor que leem o livro recebem-no no estado (as missões do depois e do prelúdio, a pauta do vilão)",
  COD.includes("factos: factosRef.current, render: { mundo, nomeCampanha, personagem }") && COD.includes("e.factos = factosRef.current;") && COD.includes("historico }), factos: factosRef.current })"));

sec("5. o invólucro não precisa de mais do que o módulo dá");
{
  /* as marcas de como caiu, como o golpe as passa (o inimigo cru da luta) */
  const r = anotarTurno(null, { npcs: { Bruna: {} }, dia: 2, turno: 5, derrotados: [{ nome: "Bruna", rendido: true }] });
  t("o inimigo cru com `rendido` cai como rendido", r.factos.pessoas["npc|Bruna"] && r.factos.pessoas["npc|Bruna"].derrotado.como === "rendido");
  const r2 = anotarTurno(r.factos, { npcs: { Bruna: {} }, dia: 2, turno: 5, emCena: [{ tipo: "pessoa", nome: "Bruna", aqui: true, deOnde: "registo" }] });
  const r3 = anotarTurno(r2.factos, { npcs: { Bruna: {} }, dia: 2, turno: 5, emCena: [{ tipo: "pessoa", nome: "Bruna", aqui: true, deOnde: "registo" }] });
  t("dois sítios no mesmo turno não contam a mesma vez duas vezes", r3.factos.pessoas["npc|Bruna"].visto.vezes === 1);
}

console.log(`\nBQ2 · a fiação do livro de factos: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
