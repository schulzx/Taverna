/* teste-prova-viva-e4.mjs — três consertos achados na prova viva da E4
   (12/10, campanha "Prova E4", Ponto do Sul)

     1. A LUTA NA ESTRADA TINHA CHÃO DE CIDADE. A investida dos dois Goblins
        abriu o tabuleiro com "no meio da praça · sob a arcada · no beco
        estreito". A jornada não muda `cidadeAtual`, e o lugar que o App
        passa a `montarGrade` durante a viagem é a linha "EM VIAGEM: … — não
        estou em cidade nenhuma": a palavra "cidade" da NEGAÇÃO casava a
        planta da cidade (e um destino chamado Porto casaria o navio).
     2. O ALVO DO TESTE SOCIAL. "Tento convencer o guarda do portão…" rolou
        "🎯 convencer Lysa": a única pessoa registada na cena ganhava o
        teste mesmo com a frase a descrever outra (o guarda, sem nome).
     3. OS VETOS REDUNDANTES. Com `podarONarrador` ligada no topo de
        `aplicarResposta`, o "NÃO envie combate_iniciar" dos quatro envelopes
        de luta já aberta era texto que a guarda já garante.

   Falha na árvore de v9.431 e passa nesta. */
import { readFileSync } from "node:fs";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? "  → " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const S = new URL("../src/", import.meta.url).href;
const ler = (f) => readFileSync(new URL("../src/" + f, import.meta.url), "utf8");

const G = await import(S + "grid.js");
const D = await import(S + "desafios.js");
const SO = await import(S + "social.js");
const A = await import(S + "agressao.js");
const Em = await import(S + "emboscada.js");
const C = await import(S + "crime.js");
const M = await import(S + "masmorras.js");
const MO = await import(S + "moldes.js");

/* ============================================================ */
sec("1. a luta na estrada tem chão de estrada");
{
  /* o lugar exato que `localAtualTxt` monta durante a jornada */
  const viagem = (para) => `EM VIAGEM: Ponto do Sul → ${para} · ▰▰▱▱▱▱▱▱ 25% · faltam 3 avanços — não estou em cidade nenhuma`;
  const regioes = (ctx) => (G.PLANTAS[G.cenarioDe(ctx)].regioes || []).map((r) => r.nome).join(" · ");
  t("a prova viva: a investida a caminho do Monte do Sul já não luta na praça",
    G.cenarioDe({ local: viagem("Monte do Sul"), bioma: "planicie" }) === "estrada" && !/praça|arcada|beco/.test(regioes({ local: viagem("Monte do Sul"), bioma: "planicie" })),
    regioes({ local: viagem("Monte do Sul"), bioma: "planicie" }));
  t("o destino chamado Porto não põe a luta num convés", G.cenarioDe({ local: viagem("Porto clara"), bioma: "floresta" }) === "floresta", G.cenarioDe({ local: viagem("Porto clara"), bioma: "floresta" }));
  t("o tabuleiro montado na jornada é o da estrada (18×12)", (() => { const g = G.montarGrade({ local: viagem("Monte do Sul"), bioma: "colina" }); return g.cenario === "estrada" && g.largura === 18 && g.altura === 12; })());
  const T = G.PLANTA_DA_ESTRADA;
  t("a tabela existe e todo destino dela é uma planta", !!T && Object.values(T.porBioma).concat(Object.values(T.porChao), [T.padrao]).every((p) => p in G.PLANTAS));
  t("todo bioma de superfície tem chão na tabela", MO.biomasDe(MO.moldePorId("sobremundo")).every((b) => b.id in T.porBioma), MO.biomasDe(MO.moldePorId("sobremundo")).map((b) => b.id).filter((id) => !(id in T.porBioma)).join(","));
  t("o bioma do trecho escolhe: floresta, pântano, deserto, gelo", ["floresta", "pantano", "deserto", "gelo"].map((b) => G.cenarioDe({ emViagem: true, bioma: b })).join(",") === "floresta,floresta,deserto,gelo");
  t("a travessia por mar luta no convés (bioma do mar, ou a rota marítima)", G.cenarioDe({ emViagem: true, bioma: "mar_aberto" }) === "navio" && G.cenarioDe({ emViagem: true, chao: "maritima", bioma: "planicie" }) === "navio");
  t("bioma desconhecido na viagem cai na estrada", G.cenarioDe({ emViagem: true, bioma: "nebulosa" }) === "estrada" && G.cenarioDe({ emViagem: true }) === "estrada");
  t("a masmorra continua a vencer tudo", G.cenarioDe({ emMasmorra: true, emViagem: true, bioma: "floresta" }) === "masmorra");
  t("fora da viagem, nada muda: a cidade é cidade, a taverna é taverna, o porto é navio",
    G.cenarioDe({ local: "na praça de Ponto do Sul", bioma: "planicie" }) === "cidade" && G.cenarioDe({ local: "na taverna do Gomo" }) === "taverna" && G.cenarioDe({ local: "no porto" }) === "navio" && G.cenarioDe({ local: "", bioma: "floresta" }) === "floresta");
  t("lixo: null, {} e nada não estouram", G.cenarioDe(null) === "estrada" && G.cenarioDe({}) === "estrada" && G.cenarioDe() === "estrada" && G.montarGrade(null).cenario === "estrada");
  t("determinismo: o mesmo lugar dá a mesma planta", G.cenarioDe({ local: viagem("Monte do Sul"), bioma: "gelo" }) === G.cenarioDe({ local: viagem("Monte do Sul"), bioma: "gelo" }));
}

/* ============================================================ */
sec("2. o alvo do teste social é quem a frase descreve");
{
  const LYSA = Object.freeze({ nome: "Lysa", papel: "mercadora", relacao: "amigo" });
  const VELA = Object.freeze({ nome: "Vela", papel: "guarda do portão", relacao: "desconhecido" });
  const ctx = (p) => ({ personagem: { nivel: 1, atributos: {} }, semente: "prova-e4", lugar: "o portão", tentativas: {}, dia: 1, fama: 0, pessoaDe: () => p });
  const FRASE = "Tento convencer o guarda do portão a me deixar passar.";
  const v = D.lerAcao(FRASE, ctx(LYSA));
  t("a prova viva: o teste já não se chama \"convencer Lysa\"", v && v.tipo === "teste" && v.quem !== "Lysa" && v.pessoa === null, v && `${v.rotulo} ${v.quem}`);
  t("…chama-se pelo que a frase disse: convencer o guarda do portão", v && v.quem === "o guarda do portão", v && v.quem);
  const vazia = D.lerAcao(FRASE, ctx(null));
  t("…e a conta é a de quem não está no registo (a mesma da cena vazia), não a de uma amiga", v && v.social.dc === vazia.social.dc && v.social.deOnde === vazia.social.deOnde && !/amig/i.test(v.social.deOnde), v && v.social.deOnde);
  t("a cena vazia também se chama pelo que a frase disse", vazia.quem === "o guarda do portão" && vazia.pessoa === null);
  const vVela = D.lerAcao(FRASE, ctx(VELA));
  t("o guarda registado na cena continua a ser ele", vVela.quem === "Vela" && vVela.pessoa === VELA);
  t("o nome dito na frase vence a descrição", D.lerAcao("Tento convencer Lysa a falar com o guarda por mim.", ctx(LYSA)).quem === "Lysa");
  t("sem descrição na frase, a única pessoa da cena continua a ser o alvo", D.lerAcao("Tento convencê-la a me deixar passar.", ctx(LYSA)).quem === "Lysa");
  t("palavra que não é ofício (a elfa, o homem) não veta ninguém", D.lerAcao("Tento convencer o homem a me deixar passar.", ctx(LYSA)).quem === "Lysa");
  t("o pedido à pessoa errada também não fica na chave de Lysa", !String(v.chave).includes("Lysa"), v.chave);

  const al = SO.alvoDescrito(FRASE);
  t("alvoDescrito lê o ofício e devolve a descrição inteira", al && al.oficio === "guarda" && al.descricao === "o guarda do portão", JSON.stringify(al));
  t("contração vira artigo: \"insisto com a taverneira\"", (SO.alvoDescrito("Insisto com a taverneira para baixar o preço.") || {}).descricao === "a taverneira");
  t("quemADescricaoAponta escolhe na cena quem veste o ofício", SO.quemADescricaoAponta(FRASE, [LYSA, VELA]) === VELA && SO.quemADescricaoAponta(FRASE, [LYSA]) === null);
  t("dois guardas na cena: não adivinha", SO.quemADescricaoAponta(FRASE, [VELA, { nome: "Bram", papel: "guarda" }]) === null);
  t("a tabela de ofícios existe e cada linha tem id e rx", Array.isArray(SO.OFICIOS_DO_ALVO) && SO.OFICIOS_DO_ALVO.length >= 10 && SO.OFICIOS_DO_ALVO.every((o) => typeof o.id === "string" && o.rx instanceof RegExp));
  t("lixo: null, {}, número e frase sem ofício", SO.alvoDescrito(null) === null && SO.alvoDescrito({}) === null && SO.alvoDescrito(42) === null && SO.alvoDescrito("Tento convencê-lo.") === null && SO.quemADescricaoAponta(FRASE, null) === null && SO.quemADescricaoAponta(null, [VELA]) === null);
  t("imutabilidade: a pessoa da cena não é tocada", Object.isFrozen(LYSA) && LYSA.nome === "Lysa");
  t("determinismo: a mesma frase dá o mesmo teste", JSON.stringify(D.lerAcao(FRASE, ctx(LYSA))) === JSON.stringify(v));
}

/* ============================================================ */
sec("3. os vetos que a guarda já cobre saíram dos envelopes de luta aberta");
{
  const envs = {
    agressao: A.envelopeDaAgressao({ tipo: "agressao", nome: "Doran", papel: "guarda" }),
    emboscada: Em.envelopeDaEmboscada({ tipo: "emboscada", quantos: 2, criatura: "Lobo", ameaca: "fraco", pedidos: 2 }),
    crime: C.envelopeDaGuarda({ inimigos: [{ nome: "G" }], quem: "a guarda" }, { nome: "Vado" }),
    masmorra: M.envelopeDaLuta({ tipo: "combate" }, { pos: "P", lista: "L" }),
  };
  /* medidos em v9.431 com estas mesmas entradas */
  const ANTES = { agressao: 715, emboscada: 567, crime: 276, masmorra: 287 };
  let poupados = 0;
  for (const [k, env] of Object.entries(envs)) {
    t(`${k}: o envelope já não diz combate_iniciar`, !/combate_iniciar/.test(env));
    t(`${k}: e continua a dizer que a luta já está aberta`, /JÁ ESTÁ ABERTO/.test(env));
    const r = A.podarONarrador({ narrativa: "x", mudancas: { combate_iniciar: [{ nome: "Outro" }] } }, { envelopes: env });
    t(`${k}: a guarda corta o combate_iniciar que viesse (não é pedido)`, !r.pedido && r.cortes.some((c) => c.campo === "combate_iniciar") && !r.resp.mudancas);
    t(`${k}: encolheu`, env.length < ANTES[k], `${env.length} vs ${ANTES[k]}`);
    poupados += ANTES[k] - env.length;
  }
  console.log(`      (${poupados} caracteres poupados nos quatro envelopes)`);
  /* T1-A (27/10): o relógio, as travas, as mudanças e a cobrança mudaram-se do
     `aplicarResposta` para `src/motor/aplicar.js`, com o MESMO texto (b9e6e20,
     provado byte a byte em teste-motor-aplicar.mjs). A asserção segue o código: e o App chama o motor (teste-motor-aplicar §4). */
  t("a guarda segue ligada no App (sem ela, estes vetos não podiam sair)", /podarONarrador\(resp, \{ envelopes: op\.envelopes/.test(ler("motor/aplicar.js")));
}

console.log(`\nprova viva da E4: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
