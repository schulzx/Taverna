/* teste-narrador-so-narra-e4.mjs — o Narrador só narra, E4: a luta e o dano
   saem do Narrador (12/10)

   Contados os três registos (6.ª, 7.ª e 8.ª sessões: 209 respostas do
   Narrador), os canais da luta e do dano foram usados 5 vezes (T = o turno
   da pauta; o M64 é o nome que a transcrição da 8.ª lhe deu, turno 60):
     · 6.ª T42 (masmorra): "enfrento o que respira" → o Narrador põe um Rato
       de Calabouço (`combate_iniciar`) e o faz morder (`perigo`);
     · 6.ª T47: o golpe sem alvo ("ataco o lagarto") → o sistema PEDE o alvo,
       e o Narrador abre (certo) e ainda fere pelo `perigo` (nocivo);
     · 7.ª T60: o golpe sem alvo → o Narrador diz que não há ninguém (certo,
       `combate_iniciar: null`);
     · 8.ª T24: o Zumbi do encontro da estrada investe pelo `perigo` do
       Narrador (o encontro era do sistema; a investida, não);
     · 8.ª M64: Sobrevivência 21 contra 13, SUCESSO → dois lobos
       (`perigo` + `combate_iniciar`) e `vida: −1`. O sucesso castigado.
   E 0 usos de combate_inimigo_vida, combate_atualizar, combate_encerrar,
   dano_ambiental e mana.

   O que esta suíte guarda:
     1. o M64: a resposta de um sucesso perde a luta e a ferida (a guarda),
        e o envelope do sim di-lo;
     2. cada um dos cinco usos, pela guarda e pela porta do sistema que o
        cobre agora;
     3. a guarda: o que corta, o que deixa, lixo, imutabilidade, determinismo;
     4. a porta nova: a estrada que investe, por tabela;
     5. o prompt já não ensina a abrir luta nem a ferir;
     6. o App continua a saber ler (reversão = um commit);
     7. o tamanho.

   Falha na árvore de v9.429 (podarONarrador e investidaDaEstrada não
   existem) e passa nesta. */
import { readFileSync } from "node:fs";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? "  → " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const S = new URL("../src/", import.meta.url).href;
const ler = (f) => readFileSync(new URL("../src/" + f, import.meta.url), "utf8");

const A = await import(S + "agressao.js");
const E = await import(S + "encontros.js");
const TS = await import(S + "testes.js");
const { montarSystemPrompt } = await import(S + "prompt.js");
const { CONDICOES_PROMPT } = await import(S + "condicoes.js");
const { PROIBICOES_DO_ARCO } = await import(S + "historia.js");
const app = ler("App.jsx");

/* ============================================================ */
sec("1. o M64: um sucesso nunca é castigado");
/* a resposta real (registo da 8.ª, chamada 199), com a narrativa encurtada */
const M64 = Object.freeze({
  narrativa: "Você retoma a trilha com o faro de quem nunca se perde… De trás de uma moita, dois vultos famintos se atiram contra você.",
  perigo: "Dois lobos atacam você na trilha.",
  mudancas: Object.freeze({ vida: -1, combate_iniciar: Object.freeze([{ nome: "Lobo", ameaca: "fraco", gd: 0 }, { nome: "Lobo", ameaca: "fraco", gd: 0 }]) }),
});
const ENV_M64 = "[TESTE PEDIDO POR MIM — ROLADO PELO SISTEMA] Pedi um teste de Sobrevivência (Vigor) para não se perder. Sou treinado nisso. O sistema fixou a dificuldade em 13 e rolou: d20 16 + 5 = 21. Resultado: SUCESSO.\nREGRA DESTE ENVELOPE (obrigatória): eu PASSEI. Revele UMA coisa concreta e útil sobre não se perder";
{
  const r = A.podarONarrador(M64, { envelopes: ENV_M64 });
  t("M64 · o sucesso é lido do envelope", r.sucesso === true && A.sucessoNoTurno(ENV_M64));
  t("M64 · a luta não abre (combate_iniciar sai)", !r.resp.mudancas || !("combate_iniciar" in r.resp.mudancas), JSON.stringify(r.resp));
  t("M64 · a ferida não entra (vida −1 sai)", !r.resp.mudancas || !("vida" in r.resp.mudancas));
  t("M64 · e o perigo também sai (era a emboscada pelo Narrador)", r.resp.perigo === null);
  t("M64 · a narrativa fica (a guarda corta campo, não prosa)", r.resp.narrativa === M64.narrativa);
  t("M64 · os três cortes dizem porquê: o sucesso", r.cortes.length === 3 && r.cortes.every((c) => c.porque === A.O_NARRADOR_NAO_ABRE.porqueDoSucesso));
  t("M64 · a resposta original não foi mexida", M64.perigo === "Dois lobos atacam você na trilha." && M64.mudancas.vida === -1);
  /* os envelopes do sim, como testes.js os escreve */
  const base = { tipo: "sabedoria", motivo: "não se perder", valor: 16, mod: 5, total: 21, dc: 13 };
  let tipo = "sabedoria";
  try { TS.envelopeDoTeste({ ...base, resultado: "sucesso" }); } catch { tipo = "percepcao"; }
  const sim = TS.envelopeDoTeste({ ...base, tipo, resultado: "sucesso" });
  const simGesto = TS.envelopeDoTeste({ ...base, tipo, resultado: "sucesso", gesto: true });
  const nao = TS.envelopeDoTeste({ ...base, tipo, total: 9, resultado: "falha" });
  const naoGesto = TS.envelopeDoTeste({ ...base, tipo, total: 9, resultado: "falha", gesto: true });
  t("o envelope do sim diz que não traz luta nem ferida", sim.includes(TS.SUCESSO_SEM_CASTIGO) && simGesto.includes(TS.SUCESSO_SEM_CASTIGO));
  t("o da falha não (a falha tem o preço dela, decidido pelo sistema)", !nao.includes(TS.SUCESSO_SEM_CASTIGO) && !naoGesto.includes(TS.SUCESSO_SEM_CASTIGO));
  t("a guarda lê o sucesso dos envelopes reais do sim", A.sucessoNoTurno(sim) && A.sucessoNoTurno(simGesto));
  t("e não lê sucesso nos da falha", !A.sucessoNoTurno(nao) && !A.sucessoNoTurno(naoGesto));
  t("o sim sem dado (abaixo do patamar) também é sucesso", A.sucessoNoTurno(TS.envelopeDoTeste({ ...base, tipo, resultado: "sucesso", automatico: true })));
}

/* ============================================================ */
sec("2. os cinco usos, e a porta que cobre cada um");
{
  /* 6.ª T42: a masmorra, "enfrento o que respira" — o Narrador abriu e mordeu */
  const m42 = A.podarONarrador({ narrativa: "Mas o rato não espera. Ele avança.", perigo: "o rato de calabouço se lança contra o herói com as garras na frente", mudancas: { combate_iniciar: [{ nome: "Rato de Calabouço", ameaca: "fraco" }] } },
    { envelopes: "[PAUTA DO TURNO 42]\nMASMORRA  camada 0 de 4" });
  t("6.ª T42 · sem pedido, a luta do Narrador não abre e a mordida não fere", m42.cortes.map((c) => c.campo).sort().join(",") === "combate_iniciar,perigo" && !m42.pedido && !m42.sucesso);
  t("6.ª T42 · a porta é a sala (masmorras.js abre a luta da sala, e o veto manda parar antes do golpe)", /COMBATE JÁ ABERTO PELO SISTEMA/.test(ler("masmorras.js")) && A.vetoDaLutaSemPainel("Sigo direto em direção ao ronco e Vando e eu o enfrentamos.", {})[0] === A.LUTA_SEM_PAINEL.veto);

  /* 6.ª T47: o golpe sem alvo — o pedido do sistema */
  const ENV_SEM_ALVO = A.envelopeSemAlvo({ tipo: "semAlvoConhecido", porPronome: true }, "Ataco o lagarto que desceu pela parede, com o cajado, mirando a cabeça dele.");
  const m47 = A.podarONarrador({ narrativa: "As garras já estão em cima de você.", perigo: "O lagarto de sola acerta você com as garras no ombro, abrindo um corte feio", mudancas: { combate_iniciar: [{ nome: "Lagarto de Sola", ameaca: "comum" }] } },
    { envelopes: ENV_SEM_ALVO });
  t("6.ª T47 · o pedido do sistema abre (o jogador declarou o golpe)", m47.pedido && Array.isArray(m47.resp.mudancas.combate_iniciar) && m47.resp.mudancas.combate_iniciar[0].nome === "Lagarto de Sola");
  t("6.ª T47 · mas as garras antes da vez dele não ferem (o perigo sai)", m47.resp.perigo === null && m47.cortes.length === 1 && m47.cortes[0].campo === "perigo");
  /* e hoje o próprio sistema acha o alvo: o lagarto que o Mestre mostrou */
  const M45 = "Você responde sem desviar os olhos do lagarto que desce a parede. Vando assente, e vocês avançam. A tocha estremece quando o lagarto estala a cauda contra o chão e se arremessa.";
  const a47 = A.lerAgressao("Ataco o lagarto que desceu pela parede, com o cajado, mirando a cabeça dele.", { presentes: [], mostrado: [M45] });
  t("6.ª T47 · hoje o golpe já abre pelo sistema (o bicho que o Mestre mostrou)", a47 && a47.tipo === "agressao" && a47.criatura === true, JSON.stringify(a47));

  /* 7.ª T60: o pedido respondido com "não há ninguém" */
  const m60 = A.podarONarrador({ narrativa: "Não há ninguém para atacar.", perigo: null, mudancas: null }, { envelopes: A.envelopeSemAlvo({ tipo: "semAlvoConhecido" }, "ataco o pescador de barba ruiva") });
  t("7.ª T60 · nada a cortar (o certo passa intacto)", m60.cortes.length === 0 && m60.resp.mudancas === null);

  /* 8.ª T24: o zumbi do encontro da estrada */
  const m24 = A.podarONarrador({ narrativa: "…", perigo: "O zumbi avança lentamente pela estrada, fechando o caminho até o Poço de Silêncio.", mudancas: {} },
    { envelopes: "[VIAGEM — tudo rolado pelas tabelas do app; você só NARRA]\nENCONTRO DO TRECHO (perigo): Criatura do bestiário: Zumbi" });
  t("8.ª T24 · a investida pelo Narrador sai", m24.resp.perigo === null && m24.cortes.length === 1);
  const enc = { tipo: "perigo", titulo: "Zumbi", criatura: "Zumbi", ameaca: "comum", quantos: 1, detalhe: "…" };
  const inv = E.investidaDaEstrada(enc, { sorte: () => 0.1 });
  t("8.ª T24 · a porta é a tabela da estrada: o zumbi investe e o encontro é o rolado", inv.investe && inv.inimigos.length === 1 && inv.inimigos[0].nome === "Zumbi" && inv.inimigos[0].ameaca === "comum");
  t("8.ª T24 · e quando não investe, fica à vista e o primeiro gesto é do jogador", E.investidaDaEstrada(enc, { sorte: () => 0.9 }).investe === false);
}

/* ============================================================ */
sec("3. a guarda: o que corta e o que deixa");
{
  const T = A.O_NARRADOR_NAO_ABRE;
  t("a tabela nomeia os campos que saem sempre", ["combate_iniciar", "combate_inimigo_vida", "combate_atualizar", "combate_remover", "dano_ambiental"].every((c) => typeof T.campos[c] === "string"));
  t("e os que saem quando tiram", typeof T.tiram.vida === "string" && typeof T.tiram.mana === "string");
  t("o único pedido é o golpe sem alvo", T.pedidos.length === 1 && A.envelopeSemAlvo({ tipo: "semAlvoConhecido" }, "x").includes(T.pedidos[0]));
  const tudo = { narrativa: "n", perigo: "o teto cai", mudancas: { combate_inimigo_vida: [{ nome: "X", vida: -8 }], combate_atualizar: [{ nome: "X", ameaca: "enfurecido" }], combate_remover: ["X"], dano_ambiental: "grave", vida: -3, mana: -2, combate_encerrar: true, sinais: ["raid:o Dragão"] } };
  const r = A.podarONarrador(tudo, { envelopes: "" });
  const m = r.resp.mudancas || {};
  t("sem pedido nem sucesso: o dano, a ficha e o perigo do Narrador saem", ["combate_inimigo_vida", "combate_atualizar", "combate_remover", "dano_ambiental", "vida", "mana"].every((c) => !(c in m)) && r.resp.perigo === null);
  t("o que não é luta nem dano fica (O CHAMADO, o encerrar)", Array.isArray(m.sinais) && m.combate_encerrar === true);
  t("a cura do Narrador não é castigo, e fica (vida/mana positivas)", A.podarONarrador({ narrativa: "", mudancas: { vida: 4, mana: 2 } }, {}).resp.mudancas.vida === 4);
  t("combate_iniciar sem pedido sai, também com a luta aberta", A.podarONarrador({ narrativa: "", mudancas: { combate_iniciar: [{ nome: "Reforço" }] } }, { envelopes: "[COMBATE — RESOLVIDO PELO SISTEMA]" }).cortes[0].campo === "combate_iniciar");
  t("o sucesso vence o pedido", A.podarONarrador({ narrativa: "", mudancas: { combate_iniciar: [{ nome: "Y" }] } }, { envelopes: T.pedidos[0] + " … Resultado: SUCESSO." }).cortes.length === 1);
  t("campo vazio sai sem contar como corte (null, [], false)", (() => { const x = A.podarONarrador({ narrativa: "", mudancas: { combate_iniciar: [], dano_ambiental: null, combate_atualizar: false } }, {}); return x.cortes.length === 0 && x.resp.mudancas === null; })());
  t("mudancas que fica vazia vira null (o App já o trata)", A.podarONarrador({ narrativa: "", mudancas: { vida: -1 } }, {}).resp.mudancas === null);
  t("resposta sem nada a cortar volta a mesma (sem cópia à toa)", (() => { const x = { narrativa: "n", mudancas: { sinais: ["raid:x"] } }; return A.podarONarrador(x, {}).resp === x; })());
  let estourou = false;
  try {
    A.podarONarrador(null); A.podarONarrador(undefined, undefined); A.podarONarrador({}, null); A.podarONarrador([], {});
    A.podarONarrador({ narrativa: "x", mudancas: [] }, { envelopes: 3 }); A.podarONarrador({ narrativa: "x", mudancas: "lixo" }, { envelopes: null });
    A.sucessoNoTurno(null); A.sucessoNoTurno({});
  } catch { estourou = true; }
  t("lixo não estoura", !estourou && A.podarONarrador(null).resp === null && A.sucessoNoTurno(null) === false);
  const a1 = JSON.stringify(A.podarONarrador(tudo, { envelopes: ENV_M64 }));
  const a2 = JSON.stringify(A.podarONarrador(tudo, { envelopes: ENV_M64 }));
  t("determinística (a mesma entrada, a mesma saída)", a1 === a2);
  t("imutável: a resposta recebida fica como veio", tudo.perigo === "o teto cai" && tudo.mudancas.vida === -3 && tudo.mudancas.dano_ambiental === "grave");
}

/* ============================================================ */
sec("4. a porta nova: a estrada que investe, por tabela");
{
  const T = E.INVESTIDA_DA_ESTRADA;
  t("a base é a medida: 1 em 3 (sessões 6–8)", Math.abs(T.base - 1 / 3) < 1e-9 && /1 de 3/.test(T.porque));
  t("a neblina pesa (a própria tabela de CLIMAS diz que favorece emboscadas)", T.porClima.neblina > 0 && /emboscadas/.test(E.CLIMAS.find((c) => c.id === "neblina").nota));
  const enc = { tipo: "perigo", criatura: "Lobo", ameaca: "fraco", quantos: 3 };
  const no = (v, o = {}) => E.investidaDaEstrada(enc, { ...o, sorte: () => v });
  t("abaixo da chance, investe; acima, não", no(0.3).investe && !no(0.34).investe);
  t("com neblina a chance sobe", no(0.5, { clima: "neblina" }).investe && !no(0.5).investe);
  t("e nunca passa do teto", no(T.teto, { clima: "neblina" }).investe === false && no(0, { clima: "neblina" }).chance <= T.teto);
  t("a matilha vem inteira, numerada", no(0).inimigos.map((i) => i.nome).join(",") === "Lobo 1,Lobo 2,Lobo 3");
  const fraco = { nivel: 1, vidaMax: 8, atributos: { forca: 0, destreza: 0, vigor: 0, intelecto: 0, presenca: 0, percepcao: 0 } };
  const muitos = E.investidaDaEstrada({ tipo: "perigo", criatura: "Ogro", ameaca: "elite", quantos: 6 }, { sorte: () => 0, pers: fraco });
  t("o orçamento do herói da frente apara o número (o teto da emboscada)", muitos.quantos <= 6 && muitos.quantos >= 1 && muitos.pedidos === 6);
  t("determinística pela sorte", JSON.stringify(no(0.2)) === JSON.stringify(no(0.2)));
  t("fora do perigo, nada", E.investidaDaEstrada({ tipo: "achado" }) === null && E.investidaDaEstrada(null) === null && E.investidaDaEstrada({ tipo: "perigo" }) === null);
  let estourou = false;
  try { E.investidaDaEstrada(enc, null); E.investidaDaEstrada(enc, { sorte: "x", pers: "lixo" }); E.investidaDaEstrada({ tipo: "perigo", criatura: "Lobo", quantos: "muitos" }, {}); } catch { estourou = true; }
  t("lixo não estoura", !estourou);
  const env = E.envelopeDaInvestida(no(0));
  t("o envelope da investida diz que a luta já está aberta, e manda narrar só o instante", /JÁ ESTÁ ABERTO/.test(env) && /3× Lobo/.test(env) && /investem/.test(env) && !/combate_iniciar/.test(env));
  t("sem investida, sem envelope", E.envelopeDaInvestida(no(0.9)) === "" && E.envelopeDaInvestida(null) === "");
  /* o encontro rolado leva a criatura em dado, e já não ensina o canal */
  let perigo = null;
  for (let i = 0; i < 3000 && !perigo; i++) { const e = E.rolarEncontro("Fantasia medieval", 3, null); if (e && e.tipo === "perigo") perigo = e; }
  t("o encontro de perigo leva criatura, ameaça e quantidade", perigo && perigo.criatura && perigo.ameaca && perigo.quantos >= 1, JSON.stringify(perigo));
  t("e o detalhe já não ensina combate_iniciar: à vista, o jogador decide", perigo && !/combate_iniciar/.test(perigo.detalhe) && /quem decide sou eu/.test(perigo.detalhe));
  t("nenhum módulo ensina mais o combate_iniciar pela estrada", !/Se a coisa engrossar/.test(ler("encontros.js")));
}

/* ============================================================ */
sec("5. o prompt já não ensina a abrir luta nem a ferir");
const ficha = (nivel) => ({ nome: "Brann", conceito: "druida do vale", historia: "", nivel, raca: "Humano", classe: "Druida", atributos: { forca: 1, destreza: 1, vigor: 4, intelecto: 4, presenca: 1, percepcao: 1 }, vidaMax: 61, manaMax: 48, efeitos: [], condicoes: [] });
const banco = { cidades: ["Pedravale", "Dwen", "Corvo Alto"], tavernas: ["O Javali"], elenco: [] };
const M = { genero: "Fantasia medieval" };
/* as mesmas três cenas da medição, da E2 e da E3 */
const tipica = { emCidade: true, temGente: true, temMercado: true, temMissao: true, temTrama: true, temVilao: true };
const piorReal = { emCombate: true, emMasmorra: true, temChao: true, temGente: true, conjura: true, temGrupo: true, aflicao: true, temSintonia: true, temRegraPropria: true, temMissao: true, temGatilho: true, temDadiva: true, temEspecializacao: true, despertou: true, invoca: true, temLegado: true };
const pT = montarSystemPrompt("C", M, ficha(8), {}, banco, "", "", "", "", "", "", "Mortal", tipica);
const pP = montarSystemPrompt("C", M, ficha(20), {}, banco, "", "", "", "", "", "", "Mortal", piorReal);
const pTodo = montarSystemPrompt("C", M, ficha(20), {}, banco, "", "", "", "", "", "", "Mortal", null);
{
  const SAIU = [
    ["combate_iniciar", /combate_iniciar/], ["combate_inimigo_vida", /combate_inimigo_vida/], ["combate_atualizar", /combate_atualizar/],
    ["combate_encerrar", /combate_encerrar/], ["dano_ambiental", /dano_ambiental/], ["o campo perigo", /"perigo"/],
    ["o exemplo com vida e mana", /"vida": -3/], ["a ABERTURA NO MESMO TURNO", /ABERTURA NO MESMO TURNO/],
    ["o BESTIÁRIO de abrir combate", /Ao abrir combate envie/], ["o DANO DE GOLPE", /DANO DE GOLPE NÃO PASSA POR VOCÊ/],
    ["a COBRANÇA ÚNICA da mana", /NUNCA envie "mana" negativa/], ["o GD no combate_iniciar", /registre o GD dela/],
  ];
  for (const [nome, rx] of SAIU) t(`saiu: ${nome}`, !rx.test(pT) && !rx.test(pP) && !rx.test(pTodo));
  const FICA = [
    ["a COESÃO DE RESULTADO (dano e morte só do sistema)", /COESÃO DE RESULTADO/],
    ["o PATAMAR DE COMBATE", /PATAMAR DE COMBATE DO HERÓI/],
    ["O QUE É FATO (o começo de uma luta vem do sistema)", /e o começo de uma luta/],
    ["o COMBATE RESOLVIDO PELO SISTEMA", /COMBATE RESOLVIDO PELO SISTEMA/],
    ["a narrativa curta na luta", /mantenha a narrativa CURTA \(2-4 frases\)\./],
    ["o formato JSON, com mudancas", /"mudancas": null/],
    ["O CHAMADO (a raid não tem outra porta)", /O CHAMADO: /],
  ];
  for (const [nome, rx] of FICA) t(`fica: ${nome}`, rx.test(pTodo));
  t("o CONDIÇÕES já não ensina o perigo", !/"perigo"/.test(CONDICOES_PROMPT) && /NÃO APLICA NEM REMOVE CONDIÇÃO/.test(CONDICOES_PROMPT));
  t("o veto da luta sem painel manda parar, e não abrir", !/combate_iniciar/.test(A.LUTA_SEM_PAINEL.veto) && /quem abre a luta é o sistema/.test(A.LUTA_SEM_PAINEL.veto));
  t("o pedido que fica leva o formato no próprio envelope", /"combate_iniciar": \[\{"nome":"…","ameaca":"comum"\}\]/.test(A.envelopeSemAlvo({ tipo: "semAlvoConhecido" }, "x")));
  t("e o prompt.js já não importa o bestiário (a lista ia só ao abrir combate)", !/criaturasDoGenero/.test(ler("prompt.js")));
}

/* ============================================================ */
sec("6. o App continua a saber ler (tolerante: a instrução saiu, o leitor fica)");
{
  /* (movido, T1-A 6.ª fatia: o leitor de `resp.mudancas.combate_iniciar` saiu do App com o bloco do combate, para `aLutaDaResposta` (src/motor/luta-do-turno.js), que esta suíte não lê como texto — a catraca de teste-assercoes-de-texto. A intenção é a mesma, agora JOGADA pela luta de bolso de combate-bloco.mjs.) No App fica a entrega da resposta ao motor. */
  {
    const { lutaDeBolso } = await import("./combate-bloco.mjs");
    const b = lutaDeBolso({ pers: { nome: "Vera", nivel: 2, grupo: [] }, mudancas: { combate_iniciar: [{ nome: "Lobo", ameaca: "fraco" }] } });
    /* MOVIDA (28/10, T2-B lote 1), E O MOTIVO: a asserção começava por `/aLutaDaResposta\(\{ pers, mudancas: resp\.mudancas \}/.test(app)` — a entrega da resposta ao motor. teste-motor-luta.mjs §4 ("o aplicarResposta chama o motor, em calou") guarda essa mesma chamada, inteira e dentro do try. Fica o comportamento: a luta abre com o Lobo, uma vez, pela porta única. */
    t("combate_iniciar", !!b.st.combate && b.st.combate.inimigos[0].nome === "Lobo" && b.chamou("abrirCombate").length === 1);
  }
  /* (movido, T1-A 7.ª fatia: a leitura do `perigo` saiu do App para `oPerigoDaResposta` (src/motor/fecho-da-resposta.js). A intenção é a mesma — o App continua a saber ler o campo —, agora JOGADA: a investida vai à emboscada, a armadilha à salvaguarda, e o App entrega-lhe o `resp.perigo`.) */
  {
    const { oPerigoDaResposta } = await import("../src/motor/fecho-da-resposta.js");
    const portas = [];
    const ctx = { aplicar: () => {}, abrirCombate: (ins, o) => { portas.push("abrir"); return { pers: o.pers, msgs: [], nota: "" }; }, dispararPerigo: (x) => portas.push("salvaguarda:" + x) };
    oPerigoDaResposta({ pers: { nivel: 10 }, perigo: "Três bandidos saltam do mato.", combate: null, folego: null, lugares: [] }, ctx);
    oPerigoDaResposta({ pers: { nivel: 10 }, perigo: "Uma armadilha de lâminas dispara do chão.", combate: null, folego: null, lugares: [] }, ctx);
    /* MOVIDA (28/10, T2-B lote 1), E O MOTIVO: a asserção terminava em `/oPerigoDaResposta\(\{ pers, perigo: resp\.perigo/.test(app)` — o App entrega o `resp.perigo` à peça. teste-motor-fecho.mjs §4 guarda a chamada inteira (`const doPerigo = oPerigoDaResposta({ pers, perigo: resp.perigo, combate: …`). Fica o comportamento: a investida vai à emboscada, a armadilha à salvaguarda. */
    t("perigo (a emboscada e a salvaguarda)", portas[0] === "abrir" && portas[1] === "salvaguarda:Uma armadilha de lâminas dispara do chão.");
  }
  t("dano_ambiental, combate_inimigo_vida, combate_atualizar, combate_encerrar (regras-jogo.js)", /m\.dano_ambiental/.test(ler("regras-jogo.js")) && /m\.combate_inimigo_vida/.test(ler("regras-jogo.js")) && /m\.combate_atualizar/.test(ler("regras-jogo.js")) && /m\.combate_encerrar/.test(ler("regras-jogo.js")));
  t("e as portas do sistema abrem pela porta única (abrirCombate)", /const abrirCombate = \(inimigosCrus/.test(app));
}

/* ============================================================ */
sec("7. o tamanho");
{
  /* medido na v9.429 (a E3 no ar) com estas mesmas três cenas: típica
     51.880, pior real 64.824, inteiro 78.019. A E4 tira ~2,8 mil fora da luta
     e ~3,7 mil dentro dela, e não acrescenta nada ao texto fixo. */
  const ALTAS = /(^|[^A-Za-zÀ-ú])(NÃO|NUNCA|PROIBIDO|PROIBIDA|JAMAIS|TERMINANTEMENTE)(?![A-Za-zÀ-ú])/g;
  const altas = (s) => (String(s).match(ALTAS) || []).length;
  console.log(`      (típica ${pT.length} · pior real ${pP.length} · inteiro ${pTodo.length} · caixa alta ${altas(pT)})`);
  t("a típica desceu (< 49.200; a E3 deixou 51.880)", pT.length < 49200, String(pT.length));
  /* ONDA 2 DO CUSTO (13/10): as DUAS PROIBIÇÕES do arco passaram de
     `resumoHistoria` (o `historiaInfo`, vazio nestas três cenas) para o
     texto fixo. No pedido real o total não cresce — saem do momento do arco
     e entram aqui —, mas esta medida, que monta com o arco vazio, passa a
     contá-las. Os limites descontam exatamente esse texto (e o "  · " da
     linha), e nada mais. */
  const PROIB = PROIBICOES_DO_ARCO.length + 5;
  t("a PIOR CENA REAL desceu (< 61.300 + as proibições do arco; a E3 deixou 64.824)", pP.length < 61300 + PROIB, String(pP.length));
  t("o prompt inteiro desceu (< 74.500 + as proibições do arco; a E3 deixou 78.019)", pTodo.length < 74500 + PROIB, String(pTodo.length));
  t("a caixa alta da típica desceu (a E3 deixou 61)", altas(pT) < 61, String(altas(pT)));
}

console.log(`\nnarrador só narra (E4): ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
