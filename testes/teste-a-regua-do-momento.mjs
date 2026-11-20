/* teste-a-regua-do-momento.mjs (M3 · 18/11/2026) — «a régua do momento».

   O desenho é mente/lancamento/o-mestre-vivo.md §3; as regras, de
   mente/lancamento/estudo-das-mesas.md §6. O módulo é
   src/motor/a-regua-do-momento.js: `valeRolagem(veredito, cena, ctx)` e o
   dado espontâneo `oQueACenaChama(cenaAntes, cenaDepois)`.

   Três provas:
   1. a tabela é o que diz ser (cobre o catálogo inteiro);
   2. REGRESSÃO ZERO: sem cena, a régua devolve exatamente o que o Mestre de
      hoje devolve, frase a frase, sobre os dois corpus que afinaram o
      catálogo — é o que deixa a régua entrar no jogo atrás de uma chave;
   3. cada regra do estudo, com uma frase e duas cenas (a que rola e a que
      não rola). As frases são de prova, nossas, e nenhuma é do exame. */
import fs from "node:fs";
import { lerAcao, DESAFIOS, FAMILIAS_DO_IMPROVISO } from "../src/desafios.js";
import { TAMANHOS_DO_PEDIDO } from "../src/social.js";
import { porQueNaoChama } from "../src/motor/o-mestre-chama.js";
import {
  FAMILIA_DO_DESAFIO, FAMILIA_DO_IMPROVISO, familiaDaAcao, PERGUNTA_DA_ESCADA, CEDE_COM_MEDO, REGUA_DO_MOMENTO,
  valeRolagem, PORQUE_DO_ESPONTANEO, oQueACenaChama, FAMILIAS_DA_CONVERSA, FAMILIAS_DO_SABER,
  MOLDURAS_DE_RISCO, FAMILIAS_DO_IMPOSSIVEL, FAMILIAS_DA_ALAVANCA, FAMILIAS_DO_EVIDENTE,
  PERGUNTA_DO_DESTINO, FAIXAS_DO_DESTINO, oDadoDoDestino, ePerguntaDoDestino,
  RISCO_DO_ATO, MOTIVO_PARA_NEGAR_DO_ALVO, A_VITIMA_DO_FURTO, OUVIR_QUEM_FALA, CALA_POR_AUSENCIA,
  O_ALVO_DA_FALA, MENTIRA_E_AMEACA, quemAFraseNomeia, estranhoAQuemSeFala,
  PERIGO_DECLARADO, O_ALVO_AUSENTE, nomeAusenteNaFrase, A_BUSCA_SOB_OLHOS,
} from "../src/motor/a-regua-do-momento.js";
import { ESTADOS_DA_CENA, LUGARES_DA_CENA, estadoPorId, RESPOSTAS_DA_PERGUNTA } from "../src/cena-do-momento.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

const HEROI = { nivel: 1, inventario: ["Gazua"], habilidades: [], equipado: { arma: "Espada curta" }, moedas: 50 };
const CTX = { personagem: HEROI, semente: "teste-a-regua", lugar: "Largo do Cereal", tentativas: {}, dia: 1 };
const ler = (frase) => lerAcao(frase, CTX);
const P = (papel, ...estados) => ({ nome: "", papel, estados });
const cenaDe = (o) => ({ pessoas: [], criaturas: [], coisas: [], cena: { estados: [] }, ...o });
const vale = (frase, cena, ctx) => valeRolagem(ler(frase), cena, ctx || {});

sec("1. a tabela");
{
  const ids = REGUA_DO_MOMENTO.map((r) => r.id);
  t(`${ids.length} linhas, ids únicos, todas com rola, diz e quando`, new Set(ids).size === ids.length
    && REGUA_DO_MOMENTO.every((r) => typeof r.rola === "boolean" && typeof r.diz === "string" && r.diz.length > 8 && typeof r.quando === "function"));
  t("a última linha pega tudo (nenhum veredito fica sem resposta)", REGUA_DO_MOMENTO[REGUA_DO_MOMENTO.length - 1].quando({}) === true);
  t("todo desafio do catálogo tem família", DESAFIOS.every((d) => d.id === "improviso" || FAMILIA_DO_DESAFIO[d.id]), DESAFIOS.filter((d) => d.id !== "improviso" && !FAMILIA_DO_DESAFIO[d.id]).map((d) => d.id).join(","));
  t("toda família do improviso tem família na régua", FAMILIAS_DO_IMPROVISO.every((f) => FAMILIA_DO_IMPROVISO[f.id]));
  t("o improviso diz a família pela chave", familiaDaAcao({ tipo: "teste", id: "improviso", chave: "aqui|improviso|forca|a mesa" }) === "forcar");
  t("o que não é teste não tem família", ["", null, undefined, { tipo: "livre" }].every((v) => familiaDaAcao(v) === ""));
  const tamanhos = new Set(TAMANHOS_DO_PEDIDO.map((x) => x.id));
  t("a pergunta da escada são degraus que existem (cortesia, conversa)", PERGUNTA_DA_ESCADA.every((id) => tamanhos.has(id)));
  t("quem cede com medo são famílias da régua", CEDE_COM_MEDO.every((f) => Object.values(FAMILIA_DO_DESAFIO).includes(f)));
  t("o porquê do espontâneo cobre toda perícia que um estado chama",
    ESTADOS_DA_CENA.filter((e) => e.chama).every((e) => typeof PORQUE_DO_ESPONTANEO[e.chama] === "string" && PORQUE_DO_ESPONTANEO[e.chama].length > 8));
  t("a tabela é congelada", Object.isFrozen(REGUA_DO_MOMENTO) && REGUA_DO_MOMENTO.every(Object.isFrozen) && Object.isFrozen(FAMILIA_DO_DESAFIO));
}

sec("2. regressão zero: sem cena, a régua é o Mestre de hoje");
{
  const MESA = JSON.parse(fs.readFileSync(new URL("./corpus-da-mesa.json", import.meta.url), "utf8"));
  const SIT = JSON.parse(fs.readFileSync(new URL("./corpus-das-situacoes.json", import.meta.url), "utf8"));
  const CONTEXTOS = [{}, { emCombate: true }, { bonus: 30 }, { mundoDisseNao: true }];
  for (const [nome, frases] of [["corpus-da-mesa", MESA.frases], ["corpus-das-situacoes", SIT.frases]]) {
    let n = 0, dif = [];
    for (const f of frases) {
      let v = null;
      try { v = ler(f.frase); } catch { v = null; }
      for (const cx of CONTEXTOS) {
        n++;
        const hoje = porQueNaoChama(v, cx);
        for (const semCena of [null, undefined, 42, "cena"]) {
          const r = valeRolagem(v, semCena, cx);
          if (r.rola !== (hoje === null || hoje === "conversa") || r.porque !== (hoje || "chama") || r.pesos !== null) dif.push(f.frase);
        }
      }
    }
    t(`${nome}: ${frases.length} frases × ${CONTEXTOS.length} contextos — o mesmo veredito e o mesmo porquê (${dif.length} diferenças)`, n > 0 && dif.length === 0, dif.slice(0, 3).join(" | "));
  }
}

sec("3. as regras do estudo, uma a uma (§6)");
{
  const nada = cenaDe({});
  /* a busca */
  t("busca com algo escondido rola", vale("vasculho o baú", cenaDe({ coisas: [{ nome: "baú", estados: ["ha_algo_escondido"] }] })).rola);
  t("busca com perigo rola", vale("vasculho o baú", cenaDe({ cena: { estados: ["perigo_fisico"] } })).rola);
  const bv = vale("vasculho o baú", nada);
  t("busca sem nada nem perigo não rola: o Mestre descreve", !bv.rola && bv.porque === "buscaVazia", bv.porque);
  /* escutar */
  t("escutar com gente do outro lado rola", vale("encosto o ouvido na porta", cenaDe({ pessoas: [P("contrabandistas")] })).rola);
  t("escutar com o som claro não rola", vale("encosto o ouvido na porta", cenaDe({ pessoas: [P("contrabandistas")], cena: { estados: ["som_claro"] } })).porque === "somClaro");
  t("escutar o nada não rola", vale("encosto o ouvido na porta", nada).porque === "silencio");
  /* esgueirar */
  t("esgueirar com vigia rola", vale("me esgueiro até a porta", cenaDe({ coisas: [{ nome: "corredor", estados: ["vigiado"] }] })).rola);
  t("esgueirar com um estranho presente rola", vale("me esgueiro até a porta", cenaDe({ pessoas: [P("anfitrião")] })).rola);
  t("esgueirar sem ninguém (ou só com os seus) não rola", vale("me esgueiro até a porta", nada).porque === "ninguemVe"
    && !vale("me esgueiro até a porta", cenaDe({ pessoas: [P("Tobias", "do_grupo")] })).rola);
  /* a conversa, dentro da régua */
  const conv = "tento convencer o guarda a me deixar passar";
  t("conversa com quem tem motivo para negar rola", vale(conv, cenaDe({ pessoas: [P("guarda", "motivo_para_negar")] })).porque === "motivoParaNegar");
  t("conversa com quem está disposto não rola", vale(conv, cenaDe({ pessoas: [P("guarda", "disposta")] })).porque === "dispostoCede");
  t("conversa com quem deve um favor não rola", !vale(conv, cenaDe({ pessoas: [P("guarda", "deve_favor")] })).rola);
  t("quem já está com medo cede sem dado", vale(conv, cenaDe({ pessoas: [P("guarda", "com_medo")] })).porque === "medoCede"
    && vale("intimido o ladrão", cenaDe({ pessoas: [P("ladrão", "com_medo")] })).porque === "medoCede");
  t("intimidar quem é hostil rola", vale("intimido o ladrão", cenaDe({ pessoas: [P("ladrão", "hostil")] })).rola);
  t("conversa com um estranho sem estado rola (a escada do pedido dá o número)", vale(conv, cenaDe({ pessoas: [P("guarda")] })).porque === "conversaComEstranho");
  const pg = vale("tento convencer o taverneiro a me dizer onde fica a ferraria", cenaDe({ pessoas: [P("taverneiro", "esconde_algo")] }));
  t("pedir uma cortesia é pergunta: não rola, e quem esconde responde evasivo", !pg.rola && pg.porque === "pergunta" && pg.resposta === "evasiva", JSON.stringify(pg));
  /* a pergunta que nem é teste */
  const q = valeRolagem(ler("onde fica a ferraria?"), cenaDe({ pessoas: [P("taverneiro", "esconde_algo")] }), {});
  t("pergunta não rola; com segredo, a resposta sai evasiva (sinal, não dado)", !q.rola && q.porque === "naoETeste" && q.resposta === "evasiva");
  t("a pergunta a quem é hostil volta como recusa", valeRolagem(null, cenaDe({ pessoas: [P("contrabandista", "hostil")] }), {}).resposta === "recusa");
  t("as respostas são as da tabela", RESPOSTAS_DA_PERGUNTA.some((r) => r.id === q.resposta));
  /* ler a pessoa */
  t("ler a pessoa rola quando o jogador pede", vale("ele está mentindo?", cenaDe({ pessoas: [P("nobre", "disposta")] })).porque === "lerPessoa");
  /* travessia */
  t("travessia com perigo rola", vale("escalo o muro", cenaDe({ cena: { estados: ["perigo_fisico"] } })).rola);
  t("travessia com pressa rola", vale("escalo o muro", cenaDe({ cena: { estados: ["com_pressa"] } })).rola);
  t("travessia sem perigo nem pressa não rola", vale("escalo o muro", nada).porque === "travessiaCalma");
  /* a tranca */
  t("a porta trancada rola; a que não está, abre", vale("arrombo a porta", cenaDe({ coisas: [{ nome: "porta", estados: ["trancado"] }] })).porque === "trancado"
    && vale("arrombo a porta", nada).porque === "semTranca");
  /* socorrer */
  t("o curativo de quem morre rola; o do corte à toa, não", vale("faço um curativo nele", cenaDe({ cena: { estados: ["perigo_fisico", "com_pressa"] } })).rola
    && vale("faço um curativo nele", nada).porque === "socorroCalmo");
  /* encenação */
  t("cantar para a taverna cheia rola; para os seus, não", vale("canto para a taverna", cenaDe({ cena: { estados: ["com_testemunhas"] } })).porque === "plateia"
    && vale("canto para a taverna", cenaDe({ pessoas: [P("Tobias", "do_grupo")] })).porque === "entreOsSeus");
  /* o bicho */
  t("o cavalo assustado rola; o manso, não", vale("acalmo o cavalo", cenaDe({ criaturas: [{ nome: "cavalo", estados: ["assustada"] }] })).porque === "bichoResiste"
    && vale("acalmo o cavalo", cenaDe({ criaturas: [{ nome: "cavalo", estados: ["mansa"] }] })).porque === "bichoManso");
  /* o resto rola como sempre */
  t("o saber sem saber comum rola como sempre", vale("o que sei sobre esse brasão?", nada).porque === "comoSempre");
  /* as linhas de sempre continuam valendo com cena */
  const tranc = cenaDe({ coisas: [{ nome: "porta", estados: ["trancado"] }] });
  t("com cena, a luta continua com o dado dela", vale("arrombo a porta", tranc, { emCombate: true }).porque === "luta");
  t("com cena, o que o mundo disse que não existe continua sem dado", vale("arrombo a porta", tranc, { mundoDisseNao: true }).porque === "mundoDisseNao");
  t("com cena, o bônus que torna o resultado certo continua sem dado", vale("arrombo a porta", tranc, { bonus: 40 }).porque === "automatico");
}

sec("4. os pesos (o número e o preço, nunca a decisão)");
{
  const c = cenaDe({ pessoas: [P("viúva", "esconde_algo")], cena: { estados: ["com_pressa", "com_testemunhas", "perigo_fisico"] } });
  const r = vale("escalo o muro", c, { vantagem: true });
  t("segredo, pressa, testemunha, perigo e vantagem", r.pesos.segredo && r.pesos.pressa && r.pesos.testemunha && r.pesos.perigo && r.pesos.vantagem);
  const z = vale("escalo o muro", cenaDe({}), {});
  t("a cena vazia não pesa nada", Object.values(z.pesos).every((x) => x === false));
  t("o veredito é congelado", Object.isFrozen(r) && Object.isFrozen(r.pesos));
}

sec("5. o dado espontâneo");
{
  const vazia = cenaDe({});
  const ap = oQueACenaChama(vazia, cenaDe({ cena: { estados: ["algo_se_aproxima"] } }));
  t("algo se aproxima: Percepção", ap && ap.pericia === "percepcao" && ap.estado === "algo_se_aproxima" && ap.porque === PORQUE_DO_ESPONTANEO.percepcao);
  t("entrar no lugar vigiado: Furtividade", oQueACenaChama(vazia, cenaDe({ coisas: [{ nome: "casarão", estados: ["vigiado"] }] })).pericia === "furtividade");
  t("o assunto raro aparece: Saberes", oQueACenaChama(null, cenaDe({ cena: { estados: ["assunto_raro"] } })).pericia === "saberes");
  t("o que já estava na cena não chama de novo", oQueACenaChama(cenaDe({ coisas: [{ estados: ["vigiado"] }] }), cenaDe({ coisas: [{ estados: ["vigiado"] }] })) === null);
  t("a cena que não muda nada, ou que some, não chama", oQueACenaChama(vazia, vazia) === null && oQueACenaChama(vazia, null) === null);
  t("todo estado que chama tem dono na tabela da cena", ESTADOS_DA_CENA.filter((e) => e.chama).every((e) => estadoPorId(e.id) === e && (e.de === "cena" || LUGARES_DA_CENA[e.de])));
}

sec("6. o módulo é puro, e não estoura com lixo");
{
  /* 18/11 (preparo da fiação, MUDADA E O MOTIVO): esta asserção lia o TEXTO
     do módulo (readFileSync + regex), e teste-assercoes-de-texto proíbe ler o
     texto de src/motor/ — o motor se prova jogando. A intenção fica: o módulo
     não sorteia nem lê o relógio. Agora prova-se pelo comportamento: Math.random
     e Date.now trocados por espiões que contam, o módulo jogado, e nenhuma
     chamada. (O «sem React» já se prova pelo próprio import em Node; o
     «new Date» não se espiona sem trocar o construtor global, e a repetição
     idêntica, provada nesta mesma secção, cobre o que ele mudaria.) */
  const sorte0 = Math.random, agora0 = Date.now;
  let tocou = 0;
  Math.random = () => { tocou++; return 0.5; };
  Date.now = () => { tocou++; return 0; };
  try {
    const cs = [cenaDe({}), cenaDe({ pessoas: [P("guarda", "desconfiada")], cena: { estados: ["perigo_fisico", "algo_se_aproxima"] } })];
    for (const f of ["tento convencer o guarda a me deixar passar", "vasculho o baú", "escalo o muro", "o frasco sobreviveu?", "posso me esgueirar até a porta?"])
      for (const c of cs) valeRolagem(ler(f), c, { frase: f, leitura: CTX });
    oQueACenaChama(cs[0], cs[1]); oDadoDoDestino("s", "o frasco sobreviveu?");
  } finally { Math.random = sorte0; Date.now = agora0; }
  t("sem sorteio, sem relógio: a régua jogada nunca chama Math.random nem Date.now", tocou === 0, String(tocou));
  let estourou = false;
  try {
    for (const v of [undefined, null, 42, "x", {}, { tipo: "teste" }, { tipo: "teste", id: "buscar", dc: 13 }])
      for (const c of [undefined, null, {}, { pessoas: "x" }, cenaDe({ pessoas: [null] })])
        for (const cx of [undefined, null, 7, {}]) valeRolagem(v, c, cx);
    oQueACenaChama(undefined, undefined); oQueACenaChama(42, "x");
  } catch { estourou = true; }
  t("veredito, cena e contexto de lixo não estouram", !estourou);
  const c = cenaDe({ pessoas: [P("guarda", "desconfiada")] });
  const antes = JSON.stringify(c);
  const a = vale("tento convencer o guarda a me deixar passar", c), b = vale("tento convencer o guarda a me deixar passar", c);
  t("mesma frase e mesma cena, mesmo veredito; a cena não é mutada", JSON.stringify(a) === JSON.stringify(b) && JSON.stringify(c) === antes);
}

sec("M5. o treino: as linhas novas e a escuta da cena (18/11/2026)");
{
  const ouve = (frase, cena, ctx) => valeRolagem(ler(frase), cena, { ...(ctx || {}), frase, leitura: CTX });
  t("as famílias da conversa e do saber são famílias da régua", [...FAMILIAS_DA_CONVERSA, ...FAMILIAS_DO_SABER].every((f) => Object.values(FAMILIA_DO_DESAFIO).includes(f)));
  /* a escuta só existe com cena: sem cena, a frase é ignorada e o Mestre é o de hoje */
  const semCena = valeRolagem(ler("dá pra eu trepar na árvore?"), null, { frase: "dá pra eu trepar na árvore?", leitura: CTX });
  t("sem cena, a frase não muda nada (a escuta não corre)", semCena.porque === (porQueNaoChama(ler("dá pra eu trepar na árvore?"), {}) || "chama") && !("ouviu" in semCena));
  /* a moldura */
  const mold = ouve("será que consigo escalar a torre?", cenaDe({ cena: { estados: ["perigo_fisico"] } }));
  t("a moldura sai e o ato de dentro é lido: com perigo, rola", mold.rola && mold.ouviu && mold.ouviu.id === "escalar" && mold.ouviu.porta === "moldura", JSON.stringify(mold.ouviu));
  /* MOVIDA em 19/11 (o-mestre-vivo.md §17), e o motivo: a torre é uma
     fortificação, e a queda dela passou a ser o risco do próprio ato
     (RISCO_DO_ATO — «vou escalar o muro do forte» passava de graça na sessão
     jogada). A intenção desta asserção — a moldura lida num chão calmo não
     rola — fica, com um muro comum no lugar da torre. */
  t("a mesma moldura num chão calmo não rola", ouve("será que consigo escalar o muro?", cenaDe({})).porque === "travessiaCalma");
  /* a fala que pede */
  const pedido = "eu te pago o dobro se você abrir o portão";
  t("o pedido sem verbo de conversa, a quem tem motivo para negar, rola", ouve(pedido, cenaDe({ pessoas: [P("porteiro", "motivo_para_negar")] })).porque === "motivoParaNegar");
  /* MOVIDA em 19/11 (§17), e o motivo: «abrir o portão» é o degrau do risco
     na escada do pedido (quebrar uma regra pequena), e desde o conserto o
     motivo para negar se lê no alvo da fala pelo tamanho do pedido — pedir
     isso a um estranho rola. A intenção (a fala que só a escuta ouviu, sem
     motivo nenhum, não rola) fica, com um pedido que não custa a quem ouve. */
  t("o pedido a um estranho que nada lhe custa não rola (a fala ouvida pela escuta é a leitura mais fraca)", ouve("eu te pago o dobro se voce me ajudar a carregar isso", cenaDe({ pessoas: [P("porteiro")] })).porque === "falaSemOposicao");
  t("e o pedido que lhe custa (abrir o portão), ao mesmo estranho, rola pelo motivo do alvo", ouve(pedido, cenaDe({ pessoas: [P("porteiro")] })).porque === "motivoParaNegar");
  t("o mesmo pedido sem ninguém em cena não é ouvido", ouve(pedido, cenaDe({})).porque === "naoETeste");
  /* o morto */
  t("quem ouviria não pode responder: sem dado", ouve(pedido, cenaDe({ pessoas: [P("porteiro", "motivo_para_negar", "morta")] })).rola === false);
  const fur = "surrupio a bolsa do cinto dele";
  t("a mão leve com alguém que pode notar rola", vale(fur, cenaDe({ pessoas: [P("mercador")] })).rola);
  t("a mão leve no morto não rola: ninguém nota", vale(fur, cenaDe({ pessoas: [P("mercador", "morta")] })).porque === "maoLeveSemOlhos");
  /* o céu */
  const ceu = "leio o céu para achar o rumo";
  t("orientar-se com o céu encoberto rola", vale(ceu, cenaDe({ cena: { estados: ["ceu_encoberto"] } })).porque === "ceuEncoberto");
  t("orientar-se com o céu à vista, sem perigo nem pressa, não rola", vale(ceu, cenaDe({})).porque === "ceuAVista");
  t("com pressa, orientar-se rola mesmo com o céu à vista", vale(ceu, cenaDe({ cena: { estados: ["com_pressa"] } })).rola);
  /* a coisa do herói, a de toda feira, a rara */
  t("examinar a magia da coisa do próprio herói não rola", vale("examino o selo para reconhecer a magia", cenaDe({ coisas: [{ nome: "selo", estados: ["do_heroi"] }] })).porque === "doProprioHeroi");
  t("lembrar o que é coisa de toda feira não rola", vale("o que eu sei sobre a ponte velha?", cenaDe({ coisas: [{ nome: "ponte", estados: ["coisa_comum"] }] })).porque === "coisaComum");
  t("procurar a coisa rara de achar rola; a comum, sem nada escondido, não", vale("vasculho o mercado", cenaDe({ coisas: [{ nome: "mercado", estados: ["raro_de_achar"] }] })).rola
    && !vale("vasculho o mercado", cenaDe({})).rola);
  /* o que a ficha já sabe, em qualquer desafio de saber */
  const sab = "tento lembrar se troll tem medo de fogo";
  const vSab = ler(sab);
  t("o saber que a ficha já tem cala também a fraqueza (não só o lembrar)", vSab && vSab.id === "fraqueza"
    && valeRolagem(vSab, cenaDe({}), { frase: sab, saber: { factos: ["troll"] } }).porque === "jaSabeOAssunto"
    && valeRolagem(vSab, cenaDe({}), { frase: sab }).rola, vSab && vSab.id);
  /* o discurso lido pelo improviso é conversa: quem já quer, cede */
  const disc = "faço um discurso inflamado para a vila";
  const vDisc = ler(disc);
  t("o discurso que o catálogo leu pela Presença passa pela conversa: com quem está disposto, não rola", vDisc && vDisc.tipo === "teste"
    && valeRolagem(vDisc, cenaDe({ pessoas: [P("aldeões", "disposta")] }), {}).porque === "dispostoCede", vDisc && vDisc.id);
}

sec("R3. o treino da rodada 3: a moldura, os estados que faltavam e o dado do destino (18/11/2026)");
{
  const ouve = (frase, cena, ctx) => valeRolagem(ler(frase), cena, { ...(ctx || {}), frase, leitura: CTX });
  const C = (estados) => cenaDe({ cena: { estados } });
  const coisa = (...estados) => cenaDe({ coisas: [{ nome: "a coisa", estados }] });
  t("as famílias das linhas novas são famílias da régua; as molduras de risco são sinais da escuta",
    [...FAMILIAS_DO_IMPOSSIVEL, ...FAMILIAS_DA_ALAVANCA, ...FAMILIAS_DO_EVIDENTE].every((f) => Object.values(FAMILIA_DO_DESAFIO).includes(f))
    && MOLDURAS_DE_RISCO.every((m) => ["pedido", "licenca", "tentativa"].includes(m)));
  /* os estados que faltavam, cada um com a sua linha */
  t("o que já foi tentado não rola de novo", ouve("escalo o muro pelo lado da hera", C(["perigo_fisico", "ja_testado"])).porque === "jaTestado");
  t("a pessoa já convencida não precisa de dado", ouve("tento convencer o guarda a me deixar passar", cenaDe({ pessoas: [P("guarda", "ja_convencida")] })).porque === "jaResolvido");
  t("o selado não cede: o mundo decide", ouve("empurro a pedra que trava a passagem", coisa("selado")).porque === "impossivel"
    && ouve("empurro a pedra que trava a passagem", coisa()).rola);
  t("a alavanca do herói resolve a tranca e a conversa — salvo contra quem é hostil",
    ouve("forço a fechadura com a gazua", cenaDe({ coisas: [{ nome: "cofre", estados: ["trancado"] }], cena: { estados: ["heroi_tem_alavanca"] } })).porque === "alavanca"
    && ouve("tento convencer o guarda a me deixar passar", cenaDe({ pessoas: [P("guarda", "motivo_para_negar")], cena: { estados: ["heroi_tem_alavanca"] } })).porque === "alavanca"
    && ouve("tento convencer o guarda a me deixar passar", cenaDe({ pessoas: [P("guarda", "hostil")], cena: { estados: ["heroi_tem_alavanca"] } })).rola);
  t("o que está à vista não se procura", ouve("vasculho o mercado", cenaDe({ coisas: [{ nome: "mercado", estados: ["ha_algo_escondido", "a_vista"] }] })).porque === "aVista");
  t("o som abafado rola; o claro não", ouve("encosto o ouvido na porta para ouvir a conversa", C(["som_abafado"])).porque === "somAbafado"
    && !ouve("encosto o ouvido na porta para ouvir a conversa", C(["som_claro"])).rola);
  t("o moribundo faz o curativo rolar mesmo sem perigo nem pressa", ouve("trato o ferimento antes que ele piore", cenaDe({ pessoas: [P("ferido", "moribunda")] })).porque === "socorroUrgente"
    && !ouve("trato o ferimento antes que ele piore", cenaDe({ pessoas: [P("ferido")] })).rola);
  t("o herói mal (bêbado, ferido) faz a travessia calma rolar, e a penalidade pesa", ouve("escalo o muro pelo lado da hera", C(["heroi_penalizado"])).porque === "corpoQueFalha"
    && ouve("escalo o muro pelo lado da hera", C(["heroi_penalizado"])).pesos.penalidade === true && ouve("escalo o muro pelo lado da hera", C([])).porque === "travessiaCalma");
  t("o que o herói já sabe, dito pela cena, não rola; o que não resiste não se força",
    ouve("o que eu sei sobre a ponte velha?", C(["heroi_ja_sabe"])).porque === "heroiJaSabe"
    && ouve("empurro a pedra que trava a passagem", coisa("sem_resistencia")).porque === "semResistencia");
  t("o que se move pune e apressa: saltar da carroça em movimento rola", ouve("pulo da carroça para a estrada", coisa("em_movimento")).rola
    && !ouve("pulo da carroça para a estrada", coisa()).rola);
  /* a moldura como peso, nunca sozinha contra a cena */
  /* MOVIDA em 19/11 (§17): rola como antes, mas agora pela linha do motivo
     (o pedido de abrir o portão custa a quem ouve), que vem antes da licença */
  t("a fala que só a escuta ouviu, com licença, a quem não está do seu lado, rola", ["falaComLicenca", "motivoParaNegar"].includes(ouve("posso pedir pra ele, eu te pago o dobro se você abrir o portão?", cenaDe({ pessoas: [P("porteiro")] })).porque));
  t("a mesma licença a quem está disposto não rola", !ouve("posso pedir pra ele, eu te pago o dobro se você abrir o portão?", cenaDe({ pessoas: [P("porteiro", "disposta")] })).rola);
  t("com a cena calma, «posso abrir a porta?» não rola (a moldura não decide sozinha)", !ouve("posso abrir a porta?", cenaDe({})).rola);
  /* as ações encadeadas: fica o ato que tem oposição */
  const enc = ouve("reviro a despensa. aí eu sigo pé ante pé até a escada", coisa("vigiado"));
  t("as ações encadeadas se partem, e a régua fica com o ato que tem oposição", enc.rola && /^encadeada:/.test(enc.porque) && enc.ouviu && enc.ouviu.id === "furtar_se", enc.porque);
  t("encadeadas numa cena calma não rolam", !ouve("reviro a despensa. aí eu sigo pé ante pé até a escada", coisa()).rola);
  /* o jogador pede o dado ou nomeia a perícia: a régua decide pela cena */
  t("«mando uma percepção» com algo escondido rola; sem nada, não", ouve("mando uma percepção", coisa("ha_algo_escondido")).rola && !ouve("mando uma percepção", coisa()).rola);
  t("«preciso rolar alguma coisa pra forçar a fechadura do baú?»: trancado rola, aberto não",
    ouve("preciso rolar alguma coisa pra forçar a fechadura do baú?", coisa("trancado")).rola && !ouve("preciso rolar alguma coisa pra forçar a fechadura do baú?", coisa()).rola);
  /* o dado do destino */
  const dest = "o frasco que eu levava sobreviveu?";
  const d1 = ouve(dest, coisa("ameacado"));
  t("a pergunta pelo que a sorte fez com a coisa, logo depois do tranco, é o dado do destino (sem perícia)", d1.rola && d1.porque === "destino" && d1.ouviu.pericia === "" && d1.destino && d1.destino.faces === 6);
  t("sem tranco nem perigo, a mesma pergunta não rola", !ouve(dest, coisa()).rola);
  t("dirigida a alguém, é pergunta, não destino", !ouve("você acha que o frasco sobreviveu?", coisa("ameacado")).rola);
  t("ePerguntaDoDestino só com cena; PERGUNTA_DO_DESTINO conhece o «sobrou?»", !ePerguntaDoDestino(dest, null) && PERGUNTA_DO_DESTINO.test("qual das flechas sobrou?"));
  const faces = new Set(Array.from({ length: 60 }, (_, k) => oDadoDoDestino("s" + k, dest).dado));
  t("o dado do destino é um d6 determinístico, e as faixas cobrem as seis faces",
    JSON.stringify(oDadoDoDestino("x", dest)) === JSON.stringify(oDadoDoDestino("x", dest)) && faces.size === 6 && [...faces].every((d) => d >= 1 && d <= 6)
    && FAIXAS_DO_DESTINO[FAIXAS_DO_DESTINO.length - 1].ate === 6 && Object.isFrozen(FAIXAS_DO_DESTINO));
  /* sem cena, nada disto corre */
  const semCena = valeRolagem(ler(dest), null, { frase: dest, leitura: CTX });
  t("sem cena, a frase do destino é o Mestre de hoje", semCena.porque === (porQueNaoChama(ler(dest), {}) || "chama") && !("destino" in semCena));
}

sec("S17. o conserto depois da primeira sessão jogada (19/11/2026, o-mestre-vivo.md §17)");
{
  /* as frases são as da sessão mv-1 (nossas), cada uma o caso que falhava
     antes (a sessão: mestre-vivo-sessao.md §5) e passa agora */
  const comFrase = (frase, cena, ctx) => valeRolagem(ler(frase), cena, { ...(ctx || {}), frase, leitura: CTX });
  t("as tabelas novas são congeladas", [RISCO_DO_ATO, MOTIVO_PARA_NEGAR_DO_ALVO, A_VITIMA_DO_FURTO, CALA_POR_AUSENCIA].every(Object.isFrozen));
  /* (a) o risco do ato */
  const forte = comFrase("eu vou escalar o muro do forte pra espiar de cima", cenaDe({ pessoas: [P("artilheira")] }));
  t("escalar o muro do forte rola sem estado nenhum: a queda da fortificação é o risco do ato (era travessiaCalma)", forte.rola && forte.porque === "riscoDoAto", forte.porque);
  const quintal = comFrase("escalo o muro pra entrar no quintal", cenaDe({}));
  t("o muro do quintal, calmo, continua sem dado (o exame, E174)", !quintal.rola && quintal.porque === "travessiaCalma", quintal.porque);
  /* (b) a vítima do furto */
  const furto = comFrase("tento roubar uma bolsa de moedas do bolso de um bebado", cenaDe({ pessoas: [P("caçador", "do_grupo")] }));
  t("roubar do bolso de alguém rola mesmo com só o grupo em cena: a vítima está na frase (era sem dado)", furto.rola && furto.veredito && furto.veredito.id === "bater_carteira", furto.porque);
  const morto = comFrase("roubo a bolsa do bandido", cenaDe({ pessoas: [P("bandido", "morta")] }));
  t("do morto, sem ninguém que note, a mão leve não rola", !morto.rola && morto.porque === "maoLeveSemOlhos", morto.porque);
  const dorme = comFrase("pego a bolsa dele", cenaDe({ pessoas: [P("marinheiro", "dormindo"), P("taverneira")] }));
  t("quem dorme dá vantagem e não dispensa o dado", dorme.rola && dorme.vantagem === A_VITIMA_DO_FURTO.diz, JSON.stringify([dorme.porque, dorme.vantagem]));
  /* (c) o motivo para negar, no alvo da fala */
  const ferreiro = cenaDe({ pessoas: [P("ferreiro anão")] });
  const d1 = comFrase("posso pedir um desconto pra quem vende por aqui?", ferreiro);
  const d2 = comFrase("pergunto ao anao da Bigorna de Ferro se ele faz um desconto", ferreiro);
  t("pedir desconto rola nas duas formas de dizer (a segunda era falaSemOposicao)", d1.rola && d2.rola && d2.porque === "motivoParaNegar", JSON.stringify([d1.porque, d2.porque]));
  const barg = comFrase("antes de assinar, pergunto quanto custa e tento barganhar pela metade do preco", cenaDe({ pessoas: [P("cartógrafa")] }));
  t("barganhar pela metade rola, mesmo com «pergunto quanto custa» na frase (era a linha da pergunta)", barg.rola && barg.porque === "motivoParaNegar", barg.porque);
  const tropeiro = comFrase("nao pago o dobro. digo pro tropeiro que a adaga de guarda vale mais que isso e que ele faz pelo preco normal ou eu vou procurar outro", cenaDe({ pessoas: [P("tropeiro")] }));
  t("o «faz pelo preço normal» é barganha, e rola (era sem leitura)", tropeiro.rola, tropeiro.porque);
  const caminho = comFrase("pergunto onde fica o templo", cenaDe({ pessoas: [P("guarda")] }));
  t("perguntar o caminho ao guarda continua sem dado", !caminho.rola, caminho.porque);
  const amigo = comFrase("peço ao Aldric que vigie a porta enquanto eu durmo", cenaDe({ pessoas: [{ nome: "Aldric", papel: "caçador", estados: ["do_grupo"] }] }));
  t("o favor a quem está do seu lado acontece sem dado", !amigo.rola && amigo.porque === "dispostoCede", amigo.porque);
  const magia = comFrase("conjuro amizade nele antes de pedir o desconto", cenaDe({ pessoas: [P("mercador")] }));
  t("a magia resolve pela própria regra: o desconto depois do feitiço não rola (o exame, E122)", !magia.rola, magia.porque);
  /* (3) ouvir quem fala com você */
  const ouvir = comFrase("pago as dez pecas e assino. depois digo que quero ouvir o que ela tem pra me contar", cenaDe({ pessoas: [P("cartógrafa")] }));
  t("ouvir o que a pessoa tem para contar não rola: é conversa (era haOQueOuvir)", !ouvir.rola && ouvir.porque === "ouvirQuemFala", ouvir.porque);
  const espiar = comFrase("escuto a conversa da mesa ao lado", cenaDe({ pessoas: [P("mercador")] }));
  t("escutar a conversa dos outros continua a rolar", espiar.rola && espiar.porque === "haOQueOuvir", espiar.porque);
  t("a regra de segurança cala só pela ausência de estado", CALA_POR_AUSENCIA.every((id) => REGUA_DO_MOMENTO.some((r) => r.id === id && r.rola === false)));
}

sec("S18. o conserto depois da segunda sessão jogada (19/11/2026, o-mestre-vivo.md §18)");
{
  /* as frases são nossas, escritas sobre os turnos da sessão mv-2
     (mestre-vivo-sessao-2.md): cada uma falhava antes e passa agora */
  const comFrase = (frase, cena, ctx) => valeRolagem(ler(frase), cena, { ...(ctx || {}), frase, leitura: CTX });
  const G = (nome) => ({ nome, papel: "ladino", estados: ["do_grupo"] });
  const N = (nome, papel, ...estados) => ({ nome, papel, estados });
  t("as tabelas novas são congeladas", [O_ALVO_DA_FALA, O_ALVO_DA_FALA.naoEPessoa, MENTIRA_E_AMEACA, MENTIRA_E_AMEACA.familias].every(Object.isFrozen));
  t("as famílias da mentira e da ameaça são famílias da conversa", MENTIRA_E_AMEACA.familias.every((f) => FAMILIAS_DA_CONVERSA.includes(f))
    && MENTIRA_E_AMEACA.contraODisposto.every((f) => MENTIRA_E_AMEACA.familias.includes(f)));
  /* (d) a quem a fala se dirige */
  const soOGrupo = cenaDe({ pessoas: [G("Jasper")] });
  t("o nome na frase diz o alvo: «peço pro Jasper…» é o companheiro", (quemAFraseNomeia("peço pro Jasper dar uma volta", cenaDe({ pessoas: [N("Wilhelmina Hartley", "artilheiro"), G("Jasper")] })) || {}).nome === "Jasper");
  t("o papel inteiro também, sem o gênero: «a artilheira» é quem tem o papel de artilheiro", (quemAFraseNomeia("seguro a artilheira pelo braço", cenaDe({ pessoas: [G("Jasper"), N("Wilhelmina Hartley", "artilheiro")] })) || {}).nome === "Wilhelmina Hartley");
  t("só com o grupo em cena, «pro cobrador» é um estranho fora do retrato", estranhoAQuemSeFala("digo pro cobrador que sou enviado do conselho", soOGrupo) === "cobrador");
  t("mas não «pra fugir», «pra ele», nem o companheiro pelo nome", estranhoAQuemSeFala("corro pra fugir", soOGrupo) === "" && estranhoAQuemSeFala("falo pra ele que sim", soOGrupo) === ""
    && estranhoAQuemSeFala("digo pro Jasper que vamos", soOGrupo) === "");
  t("e com alguém de fora em cena, não há estranho a inventar", estranhoAQuemSeFala("digo pro cobrador que sim", cenaDe({ pessoas: [G("Jasper"), N("Bruno", "taverneiro")] })) === "");
  const mentiraAusente = comFrase("digo pro cobrador que eu sou enviado do conselho e que ele tem que me deixar passar sem pagar", soOGrupo);
  t("a mentira ao cobrador que o retrato não tem rola (caía em Jasper, que cedia: T5)", mentiraAusente.rola, mentiraAusente.porque);
  const descontoAusente = comFrase("vou la no armazem e peço um desconto no elixir pro vendedor, to meio sem grana", soOGrupo);
  t("o desconto pedido ao vendedor ausente rola (caía no companheiro: T3)", descontoAusente.rola && descontoAusente.porque === "motivoParaNegar", descontoAusente.porque);
  const favorAoGrupo = comFrase("peço pro Jasper dar uma volta entre os soldados e descobrir quem anda pensando em desertar, sem ninguem notar", cenaDe({ pessoas: [N("Wilhelmina Hartley", "artilheiro"), G("Jasper")] }));
  t("o favor pedido ao companheiro pelo nome não rola, nem pelo que ele vai fazer depois (era Persuasão 18: T13)", !favorAoGrupo.rola && favorAoGrupo.porque === "dispostoCede", favorAoGrupo.porque);
  /* (e) mentira e ameaça não são pedido */
  const fiscal = comFrase("falo pra Seraphina que sou fiscal do porto mandado pelo conselho e que preciso ver o pacote agora", cenaDe({ pessoas: [N("Seraphina Pennington", "mestre do porto")] }));
  t("a mentira sobre quem se é, a uma estranha sem estado, rola (era falaSemOposicao: T16)", fiscal.rola && fiscal.porque === "mentiraOuAmeaca", fiscal.porque);
  const ameaca = comFrase("seguro a artilheira pelo braço e digo que ou ela me conta pra onde some a polvora ou eu mesmo conto pro conselho", cenaDe({ pessoas: [N("Wilhelmina Hartley", "artilheiro")] }));
  t("a ameaça a uma estranha sem estado rola (era falaSemOposicao: T14)", ameaca.rola && ameaca.porque === "mentiraOuAmeaca", ameaca.porque);
  const aAmiga = comFrase("chego bem perto dela e falo baixo que se ela nao me disser esse nome agora as chaves voltam pro conselho", cenaDe({ pessoas: [N("Prudence Cranborne", "sacerdotisa", "disposta")] }));
  t("ameaçar quem está do seu lado rola: ameaça não é favor (T8)", aAmiga.rola && aAmiga.porque === "ameacaAoDisposto", aAmiga.porque);
  const comMedo = comFrase("chego bem perto dela e falo baixo que se ela nao me disser esse nome agora as chaves voltam pro conselho", cenaDe({ pessoas: [N("Prudence Cranborne", "sacerdotisa", "com_medo")] }));
  t("quem já está com medo continua cedendo sem dado", !comMedo.rola && comMedo.porque === "medoCede", comMedo.porque);
  const mentiraAoAmigo = comFrase("digo pro guarda que venho a serviço do barão", cenaDe({ pessoas: [P("guarda do portão", "disposta")] }));
  t("mentir a quem já deixa passar continua sem dado (o exame, E094)", !mentiraAoAmigo.rola && mentiraAoAmigo.porque === "dispostoCede", mentiraAoAmigo.porque);
  const verdade = comFrase("sento na cadeira e explico que a Helga me mandou e que quero um salvo-conduto", cenaDe({ pessoas: [P("cartógrafa")] }));
  t("dizer quem mandou pode ser verdade: sem título nem cargo, a conversa de sempre (o exame, E696)", !verdade.rola, verdade.porque);
  /* a barganha pelo valor */
  const pagarMenos = comFrase("pergunto pra Seraphina quanto ela quer pela mao de engenho e tento pagar bem menos", cenaDe({ pessoas: [N("Seraphina Pennington", "mestre do porto")] }));
  t("«tento pagar bem menos» é barganha, e rola (era sem leitura: T17)", pagarMenos.rola && pagarMenos.porque === "motivoParaNegar", pagarMenos.porque);
  t("e o preço do motivo para negar o ouve", MOTIVO_PARA_NEGAR_DO_ALVO.preco.test("tento pagar bem menos"));
}

sec("S19. o conserto depois da terceira sessão jogada (19/11/2026, o-mestre-vivo.md §19)");
{
  /* as frases são nossas, escritas sobre os turnos da sessão mv-3
     (mestre-vivo-sessao-3.md): cada uma falhava antes e passa agora; os
     controles provam que o calmo continua calmo */
  const comFrase = (frase, cena, ctx) => valeRolagem(ler(frase), cena, { ...(ctx || {}), frase, leitura: CTX });
  const G = (nome) => ({ nome, papel: "guerreira", estados: ["do_grupo"] });
  const N = (nome, papel, ...estados) => ({ nome, papel, estados });
  const soOrla = cenaDe({ pessoas: [G("Orla")] });
  t("as tabelas novas são congeladas", [PERIGO_DECLARADO, PERIGO_DECLARADO.numeros, O_ALVO_AUSENTE, A_BUSCA_SOB_OLHOS, MENTIRA_E_AMEACA.contraOGrupo].every(Object.isFrozen));
  /* 1. a mesma ação, o mesmo veredito: quem a frase nomeia e não está em cena */
  const guarda = comFrase("digo ao guarda que sou inspetor da coroa e preciso passar", soOrla);
  t("a mentira ao guarda que o painel não tem rola (caía na companheira: T2)", guarda.rola && guarda.porque === "mentiraOuAmeaca", guarda.porque);
  const metade = comFrase("peço que ela me venda o mapa pela metade do preço", soOrla);
  t("a barganha sem nome, só com o grupo em cena, é com quem vende, e rola (T5)", metade.rola && metade.porque === "motivoParaNegar", metade.porque);
  const regateio = comFrase("regateio o preço do frasco", cenaDe({ pessoas: [N("Tobin", "mercador")] }));
  t("regatear é barganha, e rola como a do T18 (era sem leitura: T4)", regateio.rola && regateio.porque === "motivoParaNegar" && MOTIVO_PARA_NEGAR_DO_ALVO.preco.test("regateio"), regateio.porque);
  t("o nome próprio a quem se fala e que não está em cena é um estranho, mesmo com outros de fora",
    nomeAusenteNaFrase("minto pra Bryna que estou de passagem", cenaDe({ pessoas: [N("Tobin", "marinheiro", "disposta")] })) === "Bryna"
    && nomeAusenteNaFrase("minto pra Tobin que estou de passagem", cenaDe({ pessoas: [N("Tobin", "marinheiro")] })) === ""
    && nomeAusenteNaFrase("vou pra ele e digo oi", soOrla) === "");
  const bryna = comFrase("minto pra Bryna que estou só de passagem pela ilha", cenaDe({ pessoas: [G("Orla"), N("Tobin", "marinheiro", "disposta")] }));
  t("a mentira a Bryna, ausente do painel, não cai no marinheiro disposto: rola (T24)", bryna.rola && bryna.porque === "mentiraOuAmeaca", bryna.porque);
  const aOrla = comFrase("minto pra Orla que não fui eu que peguei a chave", soOrla);
  t("mentir à companheira é mentir a quem sabe: rola (era dispostoCede: T13)", aOrla.rola && aOrla.porque === "mentiraAoGrupo", aOrla.porque);
  const vigia = comFrase("peço a Orla que vigie a porta", soOrla);
  t("o favor à companheira continua sem dado (T10)", !vigia.rola && vigia.porque === "dispostoCede", vigia.porque);
  const mentiraAoAmigo = comFrase("digo pro guarda que venho a serviço do barão", cenaDe({ pessoas: [P("guarda do portão", "disposta")] }));
  t("a mentira a quem já deixa passar, que não é do grupo, continua sem dado (E094)", !mentiraAoAmigo.rola, mentiraAoAmigo.porque);
  /* a busca debaixo dos olhos do dono */
  const doran = cenaDe({ pessoas: [G("Orla"), N("Doran", "mercador")] });
  const barraca = comFrase("reviro a barraca dele procurando o livro", doran);
  t("revirar a barraca do dono presente é a mão leve contra ele, e rola Prestidigitação (era buscaVazia: T21)",
    barraca.rola && barraca.veredito && barraca.veredito.pericia === "prestidigitacao" && barraca.ouviu && barraca.ouviu.porta === "dono", JSON.stringify([barraca.porque, barraca.veredito && barraca.veredito.pericia]));
  const peloNome = comFrase("reviro a barraca do Doran", doran);
  t("e pelo nome, quando o «do» diz de quem é", peloNome.rola && peloNome.veredito.pericia === "prestidigitacao", peloNome.porque);
  const procura = comFrase("procuro o Doran no meio do povo", doran);
  t("procurar a pessoa não é mexer nas coisas dela", !procura.rola || procura.veredito.pericia !== "prestidigitacao", procura.porque);
  const caido = comFrase("reviso os bolsos dele", cenaDe({ pessoas: [N("", "bandido caído")] }));
  t("do caído, revistar continua a ser procurar (o exame, E018–E021)", !caido.rola && caido.porque === "buscaVazia", caido.porque);
  const vazio = comFrase("procuro um compartimento escondido na arca", cenaDe({ pessoas: [G("Orla")] }));
  t("a busca sem nada escondido e sem dono continua descrita (o exame, E002, E010, E703)", !vazio.rola && vazio.porque === "buscaVazia", vazio.porque);
  /* 2. o corpo em risco que a frase declara */
  const vao = comFrase("salto o vão de três metros entre os trapiches, por cima da água", cenaDe({}));
  t("o vão de três metros sobre a água rola sem estado nenhum (era travessiaCalma: T12)", vao.rola && vao.porque === "riscoDoAto", vao.porque);
  const fuga = comFrase("pulo por cima dos barris e fujo do Orin, que vem atrás de mim com uma faca", cenaDe({ pessoas: [N("Orin", "capanga")] }));
  t("pular os barris fugindo de alguém rola (era travessiaCalma: T27)", fuga.rola && fuga.porque === "riscoDoAto", fuga.porque);
  const barcos = comFrase("atravesso o cais pulando por cima dos barcos, fugindo", cenaDe({}));
  t("e o salto no gerúndio em fuga (a sessão mv-2, T22, ficava de fora)", barcos.rola && barcos.porque === "riscoDoAto", barcos.porque);
  const alto = comFrase("escalo a parede do armazém, uns cinco metros até a janela", cenaDe({}));
  t("a altura dita em metros rola", alto.rola && alto.porque === "riscoDoAto", alto.porque);
  for (const [f, id] of [["pulo na agua e vou nadando ate o bote", "E196"], ["dá pra eu subir no telhado pela calha?", "E365"], ["salto a cerca e sigo correndo", "E373"], ["pulo o muro", "E172"], ["escalo um muro de dois metros", "medida curta"]]) {
    const r = comFrase(f, cenaDe({}));
    t(`o calmo continua calmo: «${f}» (${id})`, !r.rola, r.porque);
  }
  /* 3. a ameaça com a arma é Intimidação */
  const adaga = comFrase("levanto o Doran pela gola com a adaga na mão e mando ele falar", doran);
  t("ameaçar com a adaga na mão é Intimidação, não Atletismo (T22)", adaga.rola && adaga.veredito.pericia === "intimidacao", JSON.stringify([adaga.porque, adaga.veredito && adaga.veredito.pericia]));
}

console.log(`\n${ok} ok, ${mal} falha(s)`);
if (mal) process.exit(1);
