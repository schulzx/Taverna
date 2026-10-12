/* teste-sessao-8-lugar.mjs — mais três consertos de motor da 8.ª sessão (12/10)

   `mente/mm11-sessao-8.md` ("A coerência: as contradições", linhas 2 e 4;
   "Os defeitos", 2 e 5), cada um preso às frases que a sessão deu de verdade
   (o registo das 147 chamadas, `registo-s8.jsonl`, lido por script). Falha na
   árvore de antes (v9.427) e passa na de depois:

     1. o GANHO com a moeda do mundo: "você acha 10 escamas" não entrava na
        bolsa — a v9.427 deu a palavra do léxico só ao lado de pagar; sem
        crédito em dobro (o achado da estrada já creditado fica de fora);
     2. o LUGAR lido de palavras (M21–M23, M8, M13): o poço das Celas virou o
        Poço de Silêncio e depois Alicerces de Silêncio; a guarita virou o
        posto da estrada; a procura pôs a prisioneira na banca e a carcereira
        na taverna;
     3. a VOLTA sem destino (M35–M69): a jornada abriu com `para` vazio e
        nunca fechou; o sistema recusou a chegada que o Mestre narrou. */
let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => { if (typeof cond === "function") { try { cond = cond(); } catch (e) { extra = String(e && e.message); cond = false; } } if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? "  → " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const J = (x) => JSON.stringify(x);
const S = "../src/";

const C = await import(S + "cobranca.js");
const L = await import(S + "lugar.js");
const P = await import(S + "procura.js");
const R = await import(S + "rastro.js");
const V = await import(S + "viagem.js");
const E = await import(S + "encontros.js");
/* o que esta etapa trouxe, lido com rede: na árvore de antes falta, e a
   suíte tem de FALHAR asserção a asserção — não estourar na primeira */
const jornadaSemDestino = V.jornadaSemDestino || ((j) => j);
const PARTE = L.PARTE_DO_LUGAR || { palavras: [], fontes: [] };
const NAO_AQUI = P.PROCURA_NAO_E_AQUI || {};
const VOLTA = R.VOLTA_TEM_DESTINO || { longe: [] };

/* ============================================================ */
sec("1 · o ganho com a moeda do mundo (\"Escamas\", o léxico de Ponte Brumoso)");
{
  const E8 = "Escamas";
  const credita = (n, o) => C.oQueFaltaCreditar(n, {}, o).moedas;
  t("\"Você acha 10 escamas no bolso do morto.\" credita 10 (era 0)", credita("Você acha 10 escamas no bolso do morto.", { moeda: E8 }) === 10);
  t("por extenso também, como o Narrador escreve o preço: \"Você encontra dez escamas na vala\" = 10", credita("Você encontra dez escamas na vala.", { moeda: E8 }) === 10);
  t("\"vinte e uma escamas\" = 21", credita("Você recolhe vinte e uma escamas do chão da mina.", { moeda: E8 }) === 21);
  t("sem a palavra do mundo, a régua é a de antes (escama não é moeda)", credita("Você acha 10 escamas no bolso do morto.", {}) === 0 && credita("Você acha 10 escamas no bolso do morto.") === 0);
  t("as moedas de sempre continuam a creditar com a palavra do mundo", credita("Você embolsa 30 moedas.", { moeda: E8 }) === 30);
  t("lerGanhos direto, com a mesma opção", C.lerGanhos("Você pega 7 escamas.", { moeda: E8 }).moedas === 7);
  /* o que NÃO pode creditar — as falas reais da sessão */
  t("M46 \"Você paga as dez escamas na mão da anã…\" não é ganho", credita("Você paga as dez escamas na mão da anã, e as duas guardas apalpam as trouxas com pressa, mais por costume do que por desconfiança.", { moeda: E8 }) === 0);
  t("M11 \"Astrid apanha as quatro escamas…\" — quem ganha é ela", credita("Astrid apanha as quatro escamas sem pressa, mordendo uma delas antes de guardar no bolso do avental.", { moeda: E8 }) === 0);
  t("a compra com a moeda do mundo não vira crédito: \"Você recebe o pão e paga dez escamas\"", credita("Você recebe o pão e paga dez escamas.", { moeda: E8 }) === 0);
  t("negação: \"Você não encontra nenhuma escama\"", credita("Você não encontra nenhuma escama.", { moeda: E8 }) === 0);
  t("\"alguma escama\" não é \"uma escama\"", credita("Você acha alguma escama solta no chão.", { moeda: E8 }) === 0);
  /* sem crédito em dobro: o achado da estrada já entrou na bolsa no rolar */
  const env = "[VIAGEM] Achado rolado pelas tabelas: ◉ 12 já na bolsa (creditadas pelo sistema). Crie o contexto…";
  t("o envelope do achado tem a marca de encontros.js (12)", E.moedasDoAchadoNoEnvelope(env) === 12);
  t("o achado narrado com escamas não paga outra vez (era: 12 a mais, com a moeda; 0 sem ela)", credita("Você acha 12 escamas na vala, num saco podre.", { moeda: E8, envelopes: env }) === 0);
  t("…e o que passa do achado ainda credita (15 narradas, 12 já na bolsa = 3)", credita("Você acha 15 escamas na vala.", { moeda: E8, envelopes: env }) === 3);
  t("o declarado pelo Mestre continua a descontar", C.oQueFaltaCreditar("Você acha 10 escamas.", { moedas: 10 }, { moeda: E8 }).moedas === 0);
  t("lixo não estoura", C.oQueFaltaCreditar(null, null, null).moedas === 0 && C.oQueFaltaCreditar("x", {}, { moeda: 7, envelopes: 9 }).moedas === 0 && C.lerGanhos("Você acha 5 escamas.", null).moedas === 0);
  t("determinismo: a mesma frase dá o mesmo crédito duas vezes", credita("Você acha 10 escamas.", { moeda: E8 }) === credita("Você acha 10 escamas.", { moeda: E8 }));
}

/* ============================================================ */
sec("2 · o lugar não se lê de palavras (M21–M23)");
{
  const celas = { nome: "As Celas Trêmulas", cidade: "Ponte Brumoso", distancia: "dentro" };
  const cron = { lugar: celas, cidade: "Ponte Brumoso", fonte: "cronista" };
  const M21 = "Empurro Nyla de lado e desço a escada dos fundos com Freya, devagar, com a mão na parede, até onde dá para ver o poço.";
  const M22 = "Examino o poço com atenção: a corda, as bordas, o fundo, qualquer marca no chão em volta. Procuro o que as Celas escondem.";
  const M23 = "Ajudo Freya a levantar e subo a escada de volta até a guarita. Quero olhar Nyla de frente de novo e ver quem fez o barulho.";
  t("a regra é tabela (PARTE_DO_LUGAR, com o poço e a guarita)", PARTE.palavras.includes("poco") && PARTE.palavras.includes("guarita") && PARTE.fontes.includes("cronista"));
  const r21 = L.lerLugarDito("Poço de Silêncio", { ...cron, pedido: M21 });
  t("M21: o Cronista diz \"Poço de Silêncio\" (a masmorra a 4 h) pelo poço das Celas — ignora (era: novo)", r21.acao === "ignora" && r21.porque === PARTE.porque, J(r21));
  const r22 = L.lerLugarDito("Alicerces de Silêncio", { ...cron, pedido: M22 });
  t("M22: \"Alicerces de Silêncio\" quando a frase examina as Celas — ignora (era: novo)", r22.acao === "ignora" && r22.porque === PARTE.fica, J(r22));
  t("o Mestre também não muda o herói de sítio pelo poço", L.lerLugarDito("Poço de Silêncio", { ...cron, fonte: "mestre", pedido: M21 }).acao === "ignora");
  /* a parte do lugar dita pelo NOME continua a mover */
  t("o nome inteiro pedido move: \"Saio das Celas e vou à Serpente & o Elmo\"", L.lerLugarDito("A Serpente & o Elmo", { ...cron, pedido: "Saio das Celas e vou à Serpente & o Elmo." }).acao === "novo");
  t("o sítio novo sem palavra de parte continua a mover (M47: \"Sigo Freya até o lugar mais barato\")", L.lerLugarDito("a pensão do xale", { ...cron, pedido: "Sigo Freya até o lugar mais barato. Quanto custa uma cama para as duas esta noite?" }).acao === "novo");
  t("o poço com o resto do nome no pedido move: \"vou ao poço da praça\"", L.lerLugarDito("o poço da praça", { ...cron, pedido: "Saio e vou ao poço da praça." }).acao === "novo");
  t("sem lugar registado (na rua), a régua é a de sempre", L.lerLugarDito("Poço de Silêncio", { cidade: "Ponte Brumoso", fonte: "cronista", pedido: M21 }).acao === "novo");
  t("lixo não estoura", L.lerLugarDito("Poço de Silêncio", { ...cron, pedido: null }).acao === "novo" && L.lerLugarDito("Poço de Silêncio", { ...cron, lugar: { nome: "" }, pedido: M21 }).acao === "novo");
  /* a guarita (M23) */
  const LUGARES = [
    { nome: "As Celas Trêmulas", tipo: "cadeia", onde: "dentro" },
    { nome: "A Serpente & o Elmo", tipo: "taverna", onde: "dentro" },
    { nome: "O Martelo Velho", tipo: "forja", onde: "dentro" },
    { nome: "o posto da estrada", tipo: "posto", onde: "arredores" },
  ];
  t("M23: \"subo a escada de volta até a guarita\" não é o posto da estrada (era: o arredor a 1,3 h)", L.lugarPedido(M23, LUGARES) === null, J(L.lugarPedido(M23, LUGARES)));
  t("o posto pedido pelo tipo continua: \"Vou ao posto da guarda\"", (L.lugarPedido("Vou ao posto da guarda.", LUGARES) || {}).nome === "o posto da estrada");
  t("o posto pedido pelo nome continua: \"Vou até o posto da estrada\"", (L.lugarPedido("Vou até o posto da estrada.", LUGARES) || {}).nome === "o posto da estrada");
  t("a cadeia pelo tipo continua: \"Vou à prisão\"", (L.lugarPedido("Vou à prisão.", LUGARES) || {}).nome === "As Celas Trêmulas");
}

/* ============================================================ */
sec("2b · a procura não põe ninguém onde a cena já disse outra coisa (M8, M13)");
{
  const NOMES = ["Ursa o Andarilho", "Nyla", "Orla da Urze", "Astrid", "Rhogar", "Freya"];
  const M8 = "Deixo Ursa e vou até a banca do Martelo Velho. Pergunto ao ferreiro: quanto custa o Arco de vime? E quem é aquela mulher de capa verde ali no canto?";
  const M13 = "Agradeço a Astrid, deixo uma gorjeta de uma moeda e volto às Celas Trêmulas com Freya. Procuro Nyla, a carcereira, e pergunto o que ela guarda ali embaixo.";
  const M4 = "Pergunto ao guarda da porta: \"Quem é aquele homem amarrado no pelourinho, e o que ele fez? E eu procuro uma prisioneira, Ursa — dá pra falar com ela?\"";
  t("a regra é tabela (PROCURA_NAO_E_AQUI: ida e deixa)", NAO_AQUI.ida instanceof RegExp && NAO_AQUI.deixa instanceof RegExp);
  t("M8: \"Deixo Ursa e vou até a banca…\" não é procura daqui (era: \"Ursa está aqui — O Armazém do Silêncio\")", P.ehProcura(M8) === false);
  t("M8: e \"Deixo Ursa\" não procura Ursa", P.nomeProcurado(M8, NOMES) === "");
  t("M13: \"…volto às Celas Trêmulas… Procuro Nyla\" é resolvida na chegada, não na taverna (era: \"Nyla está aqui — A Serpente & o Elmo\")", P.ehProcura(M13) === false);
  t("M13: o nome continua conhecido — a guarda do vasculhar (ehPessoaConhecida) não cai", P.nomeProcurado(M13, NOMES) === "Nyla");
  t("M4: a procura no sítio onde se está continua (\"eu procuro uma prisioneira, Ursa\")", P.ehProcura(M4) === true && P.nomeProcurado(M4, NOMES) === "Ursa o Andarilho");
  t("\"Procuro Ione.\" continua", P.ehProcura("Procuro Ione."));
  t("\"Vou perguntar a Astrid onde está Lina\" é procura (o ir é perguntar)", P.ehProcura("Vou perguntar a Astrid onde está Lina."));
  t("\"Vou procurar Lina na feira\" é procura", P.ehProcura("Vou procurar Lina na feira."));
  t("lixo não estoura", P.ehProcura(null) === false && P.ehProcura("") === false && P.nomeProcurado(null, NOMES) === "");
}

/* ============================================================ */
sec("3 · a volta tem destino, e a jornada sem destino tem saída (M35–M69)");
{
  const CIDADES = ["Ponte Brumoso", "Pedra Rasa", "Vau Cinzento"];
  const boca = { nome: "Poço de Silêncio", cidade: "Ponte Brumoso", distancia: "perto" };
  const ctx35 = { cidadeAtual: "Ponte Brumoso", cidades: CIDADES, lugar: boca };
  const M35 = "Digo a Ursa que venha conosco. Viajamos de volta para Ponte Brumoso pela estrada, sem pressa, e eu pago um pão de viagem a ela no caminho se o povo vender.";
  const p35 = R.detectarPartida(M35, ctx35);
  t("a regra é tabela (VOLTA_TEM_DESTINO: longe = a meio dia)", VOLTA.longe.includes("perto"));
  t("M35: à boca do Poço, \"viajamos de volta para Ponte Brumoso\" tem destino Ponte Brumoso (era: \"\")", p35 && p35.destino === "Ponte Brumoso", J(p35));
  t("a cidade de onde se veio é a do lugar longe", R.cidadeDeOrigem && R.cidadeDeOrigem(ctx35) === "Ponte Brumoso");
  t("\"Volto para a cidade.\" à boca também (a volta sem nome)", (R.detectarPartida("Volto para a cidade.", ctx35) || {}).destino === "Ponte Brumoso");
  t("\"Volto para a mina.\" não vai à cidade", R.detectarPartida("Volto para a mina.", ctx35) === null);
  t("virar-se não parte: \"Me volto para Ursa\"", R.detectarPartida("Me volto para Ursa e aponto a corda.", ctx35) === null);
  t("dentro dos muros nada muda (voltar dali é um passo, não estrada)", (R.detectarPartida(M35, { cidadeAtual: "Ponte Brumoso", cidades: CIDADES, lugar: { nome: "A Serpente & o Elmo", distancia: "dentro" } }) || {}).destino === "");
  const env35 = R.envelopeDePartida(p35 && p35.destino, "Ponte Brumoso");
  t("o envelope da volta não diz \"saí de Ponte Brumoso rumo a Ponte Brumoso… não me devolva para lá\"", env35.includes("de volta a Ponte Brumoso") && !env35.includes("não me devolva") && env35.includes("ainda NÃO estou em Ponte Brumoso"), env35.slice(0, 160));
  t("o envelope de uma partida de verdade fica como era", R.envelopeDePartida("Pedra Rasa", "Ponte Brumoso").includes("eu saí de Ponte Brumoso") && R.envelopeDePartida("Pedra Rasa", "Ponte Brumoso").includes("não me devolva"));
  t("nos arredores também (a régua de lugar.js decide a volta)", (R.detectarPartida(M35, { cidadeAtual: "Ponte Brumoso", cidades: CIDADES, lugar: { nome: "o lado de fora dos portões", distancia: "arredores" } }) || {}).destino === "");
  /* a jornada que a 8.ª abriu: Ponte Brumoso → "" */
  const j0 = V.abrirViagem({ de: "Ponte Brumoso", para: "", dia: 2 });
  const emV = { cidadeAtual: "Ponte Brumoso", cidades: CIDADES, emViagem: true, jornada: j0 };
  const M37 = "Sigo viagem para Ponte Brumoso com Freya e Ursa, passo a passo, ouvindo a estrada.";
  const M41 = "Foi um engano, eu queria atacar a encapuzada da corrente, não Ursa. Volto ao posto, levanto as mãos e peço desculpa a Freya e a Ursa, e digo que ainda quero saber a coisa que só ela sabe.";
  const M43 = "Respiro, digo a Freya que a gente não volta a se separar, e parto agora para Ponte Brumoso. Quero achar Petra Guarda-Portão, a gnoma, antes de qualquer outra coisa.";
  const M44 = "Sigo pela estrada até chegar às portas de Ponte Brumoso, de capuz puxado, com Freya ao lado.";
  t("M37: \"Sigo viagem para Ponte Brumoso\" dá destino à jornada sem destino (era: só seguir)", (R.detectarSeguirViagem(M37, emV) || {}).destino === "Ponte Brumoso", J(R.detectarSeguirViagem(M37, emV)));
  t("M41: \"Volto ao posto\" não é a cidade, nem seguir viagem", R.detectarSeguirViagem(M41, emV) === null);
  t("M43: \"parto agora para Ponte Brumoso\" na estrada dá o destino (era: nada)", (R.detectarSeguirViagem(M43, emV) || {}).destino === "Ponte Brumoso");
  t("M44: \"Sigo pela estrada até chegar às portas de Ponte Brumoso\" dá o destino", (R.detectarSeguirViagem(M44, emV) || {}).destino === "Ponte Brumoso");
  t("com destino na jornada, seguir não o troca", (R.detectarSeguirViagem(M37, { ...emV, jornada: { ...j0, para: "Pedra Rasa" } }) || {}).destino === undefined);
  t("\"Sigo viagem.\" continua a ser só seguir", J(R.detectarSeguirViagem("Sigo viagem.", emV)) === J({ motivo: "o jogador escreveu que segue caminho" }));
  t("\"sigo conversando com Freya\" não anda", R.detectarSeguirViagem("sigo conversando com Freya", emV) === null);
  /* a sequência: o destino dado chega */
  let j = { ...j0, para: (R.detectarSeguirViagem(M37, emV) || {}).destino || "" };
  t("com o destino, a jornada tem progresso (era: nulo, e nunca chegava)", !!V.progressoDaViagem(j));
  for (let i = 0; i < 20 && !(V.progressoDaViagem(j) || {}).chegou; i++) j = V.andar(j);
  t("…e chega a Ponte Brumoso andando", (V.progressoDaViagem(j) || {}).chegou === true && j.para === "Ponte Brumoso");
  /* a saída da jornada sem destino (os saves que já a têm) */
  let s = j0;
  for (let i = 0; i < 20; i++) s = V.andar(s);
  const fim = jornadaSemDestino(s);
  t("a jornada sem destino, andada até ao fim, fecha na cidade de onde partiu (era: em curso para sempre)", fim && fim.para === "Ponte Brumoso" && fim.semDestino === true && !!(V.progressoDaViagem(fim) || {}).chegou, J(fim && { para: fim.para, andadoMin: fim.andadoMin, totalMin: fim.totalMin }));
  t("a meio, fica como está", jornadaSemDestino(V.andar(j0)).para === "");
  t("com destino, fica como está", jornadaSemDestino({ ...s, para: "Pedra Rasa" }).para === "Pedra Rasa");
  t("imutável: a jornada recebida não muda", s.para === "" && !("semDestino" in s));
  t("lixo não estoura", jornadaSemDestino(null) === null && J(jornadaSemDestino({})) === "{}" && R.detectarSeguirViagem(null, emV) === null && R.detectarPartida(null, ctx35) === null);
}

console.log(`\nsessão 8 (o lugar e a volta): ${ok} passaram, ${mal} falharam`);
if (mal) process.exit(1);
