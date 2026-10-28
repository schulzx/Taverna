/* teste-narrador-so-narra-e3.mjs — o Narrador só narra, E3: a regra O QUE É
   FATO entra, e o 2.º lote de escrivão sai (12/10)

   A medição (`mente/narrador-so-narra.md` §2–§4) contou, nas 137 respostas
   da 6.ª e da 7.ª sessões, seis canais USADOS e com dono no sistema:
   `moedas` (3 usos, 2 nocivos), `cidade_atual` (2, 1 nocivo — marcou o
   destino à partida), `lugar_atual` (1, redundante), `jornada_meio` (1, "a
   pé"), `canone` e `npcs` (2 e 2, que o Cronista repete). E o prompt
   mandava "invente à vontade" fora dos envelopes — a licença que fazia o
   Narrador preencher o que o sistema calava.

   O que esta suíte guarda:
     1. a regra existe, curta, positiva, sem caixa alta, e diz onde está o
        dado (PERGUNTOU, O PREÇO, NOMES À MÃO); o "invente à vontade" saiu;
        a LIBERDADE CRIATIVA fica, com a ousadia na textura e nas vozes;
     2. o prompt já não cita nenhum canal do 1.º e do 2.º lote, nem os
        textos dos módulos que vão ao Narrador por turno;
     3. o que não podia sair continua lá;
     4. cada dono cobre o caso medido (a bolsa, a chegada, o lugar, o meio,
        o cânone e as pessoas);
     5. o App continua a ler os seis campos (tolerante: reversão = um commit);
     6. o tamanho: a regra paga-se com o que saiu.

   Falha na árvore de v9.422 e passa nesta. */
import { readFileSync, readdirSync } from "node:fs";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? "  → " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const S = new URL("../src/", import.meta.url).href;

const { montarSystemPrompt } = await import(S + "prompt.js");
const { SECOES } = await import(S + "pauta.js");
const { oQueFaltaDebitar, envelopeDoDebito, envelopeDaCobranca, oQueFaltaCreditar } = await import(S + "cobranca.js");
const { fechoDoPedido } = await import(S + "escuta.js");
const { LUGAR_PROMPT, resumoLugarPrompt, lerLugarDito } = await import(S + "lugar.js");
const { notaDaChegada, TERRENO_VIAGEM } = await import(S + "geografia.js");
const { escolherSitio } = await import(S + "acampamento.js");
const { COMO_O_FIO_ENTRA } = await import(S + "fios-da-estrada.js");
const { envelopeDePartida } = await import(S + "rastro.js");
const app = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");

const ficha = (nivel) => ({ nome: "Brann", conceito: "druida do vale", historia: "", nivel, raca: "Humano", classe: "Druida", atributos: { forca: 1, destreza: 1, vigor: 4, intelecto: 4, presenca: 1, percepcao: 1 }, vidaMax: 61, manaMax: 48, efeitos: [], condicoes: [] });
const banco = { cidades: ["Pedravale", "Dwen", "Corvo Alto"], tavernas: ["O Javali"], elenco: [] };
const M = { genero: "Fantasia medieval" };
/* as mesmas três cenas da medição e da E2 */
const tipica = { emCidade: true, temGente: true, temMercado: true, temMissao: true, temTrama: true, temVilao: true };
const piorReal = { emCombate: true, emMasmorra: true, temChao: true, temGente: true, conjura: true, temGrupo: true, aflicao: true, temSintonia: true, temRegraPropria: true, temMissao: true, temGatilho: true, temDadiva: true, temEspecializacao: true, despertou: true, invoca: true, temLegado: true };
const pT = montarSystemPrompt("C", M, ficha(8), {}, banco, "", "", "", "", "", "", "Mortal", tipica);
const pP = montarSystemPrompt("C", M, ficha(20), {}, banco, "", "", "", "", "", "", "Mortal", piorReal);
const pTodo = montarSystemPrompt("C", M, ficha(20), {}, banco, "", "", "", "", "", "", "Mortal", null);
const ALTAS = /(^|[^A-Za-zÀ-ú])(NÃO|NUNCA|PROIBIDO|PROIBIDA|JAMAIS|TERMINANTEMENTE)(?![A-Za-zÀ-ú])/g;
const altas = (s) => (String(s).match(ALTAS) || []).length;

/* ============================================================ */
sec("1. a regra O QUE É FATO, no lugar do «invente à vontade»");
const regra = (pT.match(/^O QUE É FATO: [^\n]*/m) || [""])[0];
{
  t("a regra está no prompt da cena típica", !!regra);
  t("diz o contrato numa linha: número, nome próprio e consequência vêm do sistema; a textura é sua", /^O QUE É FATO: número, nome próprio e consequência vêm do sistema; a textura é sua\./.test(regra));
  console.log(`      (a regra: ${regra.length} caracteres)`);
  t("curta: ~660 caracteres (entre 560 e 700)", regra.length >= 560 && regra.length <= 700, String(regra.length));
  t("sem caixa alta gritada (nenhum NÃO/NUNCA/PROIBIDO/JAMAIS)", altas(regra) === 0);
  const tipos = ["Preço", "distância", "hora", "quantia", "gente com nome e papel", "criatura ou pessoa armada", "lugar novo", "item", "o começo de uma luta"];
  t("nomeia o que só existe se o sistema o disse (preço, distância, hora, gente, armado, lugar, item, luta)", tipos.every((x) => regra.includes(x)), tipos.filter((x) => !regra.includes(x)).join(", "));
  t("diz onde o fato está: na pauta, num envelope ou no estado", /na pauta, num envelope ou no estado/.test(regra));
  const rotulos = new Set(SECOES.map((s) => s.rotulo));
  /* F2a (12/10), MOVIDA: os NOMES À MÃO passaram a ir DENTRO da linha EM
     CENA (em-cena.js#pautaComEmCena), e a regra aponta-a no lugar deles —
     com um caractere a menos. A intenção fica: a regra só cita secções que
     existem na pauta. */
  t("e aponta as ferramentas da E1 e da F2a, que são secções reais da pauta (PERGUNTOU, O PREÇO, EM CENA)", ["PERGUNTOU", "O PREÇO", "EM CENA"].every((r) => regra.includes(r) && rotulos.has(r)));
  t("quando o sistema cala: não sabe, desconversa ou diz sem número", /não sabe, desconversa ou diz sem número/.test(regra) && /"não sai barato"/.test(regra));
  t("e a textura continua inteira dele, e ousada", /A textura é inteira sua, e quanto mais ousada melhor/.test(regra));
  t("a textura com exemplos: cheiro, gesto, voz, figurante sem nome, boato vago, a porta que não muda nada", ["cheiro", "gesto", "voz", "figurante sem nome", "boato vago", "porta que não muda nada"].every((x) => regra.includes(x)));
  t("vem logo a seguir à DIVISÃO (o contrato e a regra lêem-se juntos)", pT.indexOf("A DIVISÃO, EM UMA LINHA") < pT.indexOf("O QUE É FATO:") && pT.indexOf("O QUE É FATO:") < pT.indexOf("CAMPANHA: "));
  for (const [nome, p] of [["típica", pT], ["pior real", pP], ["inteiro", pTodo]]) t(`o «invente à vontade» saiu (${nome})`, !/invente à vontade/.test(p) && /O QUE É FATO:/.test(p));
  t("a LIBERDADE CRIATIVA fica (regra-mestra, ousadia total)", /LIBERDADE CRIATIVA \(regra-mestra/.test(pT) && /crie com ousadia total/.test(pT));
  t("e a ousadia aponta à textura e às vozes", /Gaste a ousadia inteira na textura e nas vozes/.test(pT) && !/DENTRO do que os envelopes governam/.test(pT));
  t("as vozes e as personagens sem amarras ficam", /PERSONAGENS SEM AMARRAS/.test(pT) && /Diálogos com alma/.test(pT));
}

/* ============================================================ */
sec("2. o prompt já não cita nenhum canal do 1.º e do 2.º lote");
{
  const LOTES = [
    ["moedas", /"moedas"/], ["cidade_atual", /cidade_atual/], ["lugar_atual", /lugar_atual/],
    ["jornada_meio", /jornada_meio/], ["canone", /"canone"/], ["npcs", /"npcs"/],
    ["mapa_cidades/mapa_faccoes", /mapa_(cidades|faccoes)/], ["adicionar/remover_itens", /(adicionar|remover)_itens/],
    ["grupo_adicionar/remover/itens/atualizar", /grupo_(adicionar|remover|itens|atualizar)/], ["loot:", /loot:/],
    ["feito", /"feito"/], ["missao_oferecida", /missao_oferecida/], ["relogio_novo", /relogio_novo/],
    ["evento_global_encerrar", /evento_global_encerrar/], ["adicionar_habilidades", /adicionar_habilidades/],
  ];
  for (const [nome, rx] of LOTES) t(`fora do prompt inteiro: ${nome}`, !rx.test(pTodo) && !rx.test(pP));
  t("o CÂNONE já não manda registar (fica a guarda)", !/registre em "canone"/.test(pTodo) && /O que está lá NUNCA é contradito/.test(pTodo));
  t("as PESSOAS CONHECIDAS já não pedem ficha ao Narrador", !/NPC RELEVANTE/.test(pTodo) && /PESSOAS CONHECIDAS \(registro persistente/.test(pTodo));
  t("o ELENCO já não manda registar no cânone", !/registre no cânone/.test(pTodo));
  /* E4 (12/10), MOVIDA: a vida, a mana, o dano e o combate saíram do
     exemplo com a E4; fica a guarda da E3 — o 2.º lote não volta a ele */
  t("o exemplo do formato não leva o 2.º lote (e, desde a E4, nem a luta)", /"mudancas": null\r?\n\}/.test(pTodo) && !/"moedas": /.test(pTodo) && !/"combate_iniciar"/.test(pTodo));
  /* os textos dos módulos que vão ao Narrador por turno, lidos no fonte:
     nenhum ensina mais o 2.º lote */
  const ENSINA = /(registre|mande|envie|DECLARE|declarar|registrar|via)[^.\n`]{0,40}\\?"(moedas|cidade_atual|lugar_atual|jornada_meio|canone|npcs)\\?"/;
  /* a espera com data (12/10) era o achado da estrada (encontros.js), que
     rolava ◉ e o entregava pelo campo até o App o creditar no rolar.
     ESVAZIOU na fiação da E3 (frontend, v9.424): o App credita o achado em
     viajar() e o detalhe diz que o dinheiro já está na bolsa. Asserção
     movida — de "a espera é só o achado" para "não há espera": a intenção
     (nenhum módulo ensina o 2.º lote) ficou inteira, sem exceção. */
  const ESPERA = new Set();
  const quem = readdirSync(new URL("../src/", import.meta.url)).filter((f) => f.endsWith(".js")).filter((f) => ENSINA.test(readFileSync(new URL("../src/" + f, import.meta.url), "utf8")));
  const fora = quem.filter((f) => !ESPERA.has(f));
  t(`nenhum módulo (src/*.js) ensina o 2.º lote ao Narrador, fora a espera${fora.length ? " — ainda: " + fora.join(", ") : ""}`, fora.length === 0);
  t("e já não há espera: o achado da estrada deixou de pedir o campo", quem.length === 0 && !/via "moedas"/.test(readFileSync(new URL("../src/encontros.js", import.meta.url), "utf8")));
  t("e o achado já leva o ◉ em número, para o App o creditar no rolar", /tipo: "achado", titulo: "algo à beira da estrada", moedas: esp\.moedas/.test(readFileSync(new URL("../src/encontros.js", import.meta.url), "utf8")));
  t("o LUGAR já não pede lugar_atual", !/lugar_atual/.test(LUGAR_PROMPT) && /Quem regista onde o herói está é o sistema/.test(LUGAR_PROMPT));
  t("nem o ONDE EU ESTOU de um sítio", !/lugar_atual/.test(resumoLugarPrompt({ nome: "a fazenda de Jessa", cidade: "Vau", distancia: "arredores" }, "Vau")));
  t("a nota da chegada já não pede cidade_atual", !/cidade_atual/.test(notaDaChegada({ nome: "Andar 2" }, "Andar 1")));
  t("o viajante da estrada já não pede ficha em npcs", !/npcs/.test(COMO_O_FIO_ENTRA.viajante));
  t("os bilhetes da bolsa já não pedem o campo", !/mudancas/.test(envelopeDoDebito({ temAlgo: true, moedas: 2 })) && !/mudancas/.test(envelopeDaCobranca({ temAlgo: true, moedas: 3, consumiveis: [] })));
}

/* ============================================================ */
sec("3. o que a E3 não podia tirar");
{
  const FICA = [
    ["o contrato", /O Mestre desta mesa não é você: é o sistema/],
    ["a divisão", /A DIVISÃO, EM UMA LINHA/],
    ["o ofício", /O OFÍCIO DA CENA/],
    ["o cânone nunca contradito, e ampliar sem substituir", /O que está lá NUNCA é contradito/],
    ["as datas de encontro", /DATAS DE ENCONTRO/],
    ["o escopo do envelope", /ESCOPO DO ENVELOPE/],
    ["o tempo do sistema", /TEMPO É DO SISTEMA/],
    /* E4 (12/10), MOVIDAS: o perigo, combate_iniciar e dano_ambiental
       saíram com a E4 (teste-narrador-so-narra-e4 prova quem os faz agora) */
    ["só se narra um pagamento feito ou aceite", /só narre um pagamento que eu fiz ou aceitei/],
    ["a viagem: a cidade só chega quando o sistema regista", /Só me coloque numa cidade quando o sistema registrar a chegada/],
    ["O CHAMADO (a raid não tem outra porta)", /O CHAMADO: /],
  ];
  for (const [nome, rx] of FICA) t(`fica: ${nome}`, rx.test(pTodo));
}

/* ============================================================ */
sec("4. cada dono cobre o caso medido");
const pedido = (texto) => fechoDoPedido({ doJogador: true, texto });
{
  /* moedas — a 7.ª, M9: "Pago os dois cobres." e a cena sem verbo de pagar */
  const M9 = "Você tira dois cobres do bolso e os põe no balcão. Frida os recolhe num gesto rápido, sem contar, e os guarda no avental.";
  const d9 = oQueFaltaDebitar(M9, null, { bolsa: 40, envelopes: `[PAUTA DO TURNO 8]\nONDE no Píer Rachado\n${pedido("Pago os dois cobres.")}` });
  t("moedas · 7.ª M9: «Pago os dois cobres.» desce 2 sem o canal (a cena não tem verbo de pagar)", d9.temAlgo && d9.moedas === 2, JSON.stringify(d9));
  t("moedas · 7.ª M14: «Pago os cinco cobres.» desce 5", oQueFaltaDebitar("Ele assente e guarda as moedas.", null, { bolsa: 40, envelopes: pedido("Pago os cinco cobres.") }).moedas === 5);
  t("moedas · a gorjeta da 7.ª M18 («deixo uma moeda na mesa dele») desce 1", oQueFaltaDebitar("Ambrósio nem olha.", null, { bolsa: 40, envelopes: pedido("Agradeço a Ambrósio, deixo uma moeda na mesa dele e corro pela porta do fundo.") }).moedas === 1);
  t("moedas · o mesmo pagamento dito pelos dois lados conta uma vez", oQueFaltaDebitar("Você paga os três cobres, e Hilda pega a chave.", null, { bolsa: 40, envelopes: pedido("Pago os três cobres e peço a chave.") }).moedas === 3);
  t("moedas · a pergunta não paga", !oQueFaltaDebitar("Frida dá de ombros.", null, { bolsa: 40, envelopes: pedido("Pago os dois cobres?") }).temAlgo);
  t("moedas · a condição não paga", !oQueFaltaDebitar("Frida dá de ombros.", null, { bolsa: 40, envelopes: pedido("Se ela aceitar, pago dois cobres.") }).temAlgo);
  t("moedas · a cena que recusa o dinheiro ganha", !oQueFaltaDebitar("Frida empurra as moedas de volta. — É por conta da casa.", null, { bolsa: 40, envelopes: pedido("Pago os dois cobres.") }).temAlgo);
  t("moedas · a compra do balcão já registada não desce outra vez", !oQueFaltaDebitar("Você paga.", null, { bolsa: 40, envelopes: `[COMPRA — JÁ REGISTRADA PELO SISTEMA]\n${pedido("Pago os dois cobres.")}` }).temAlgo);
  t("moedas · o campo antigo, se ainda chegar, não cobra duas vezes", !oQueFaltaDebitar(M9, { moedas: -2 }, { bolsa: 40, envelopes: pedido("Pago os dois cobres.") }).temAlgo);
  const sf = oQueFaltaDebitar(M9, null, { bolsa: 1, envelopes: pedido("Pago os dois cobres.") });
  t("moedas · sem fundos, nada desce e o bilhete diz que não cabe", sf.semFundos && sf.moedas === 0 && /não cabe na minha bolsa/.test(envelopeDoDebito(sf)));
  t("moedas · a frase do jogador sem a etiqueta do pedido não é lida (o rodapé não paga)", !oQueFaltaDebitar("Frida sorri.", null, { bolsa: 40, envelopes: "RODAPÉ: pago os dois cobres." }).temAlgo);
  t("moedas · a 7.ª M11 (a bolsa do morto, +8 do Narrador): sem o canal nada entra pela cena", !oQueFaltaCreditar("Você entrega a bolsa de couro do pescador a Jaco, que a guarda sem contar.", null).temAlgo);
  let estourou = false;
  try {
    oQueFaltaDebitar(null, null, { envelopes: null }); oQueFaltaDebitar(undefined, undefined, undefined);
    oQueFaltaDebitar(M9, Object.freeze({}), Object.freeze({ bolsa: 40, envelopes: pedido("Pago os dois cobres.") }));
    oQueFaltaDebitar(M9, null, { envelopes: { lixo: 1 } });
  } catch { estourou = true; }
  t("moedas · lixo e argumentos congelados não estouram", !estourou);
  t("moedas · determinístico (a mesma entrada, a mesma saída)", JSON.stringify(oQueFaltaDebitar(M9, null, { bolsa: 40, envelopes: pedido("Pago os dois cobres.") })) === JSON.stringify(d9));

  /* cidade_atual — a jornada chega sozinha; a partida diz que a chegada é do sistema */
  t("cidade_atual · a jornada com destino chega sozinha (App: talvezChegarSozinho põe a cidade)", /const talvezChegarSozinho = \(\) => \{[\s\S]{0,2500}?cidadeAtualRef\.current = j\.para;/.test(app));
  t("cidade_atual · e a partida avisa o Narrador de que a chegada é do sistema", /a chegada é do sistema/.test(envelopeDePartida("Sul Molhado", "Quebrado do Leste")));
  t("cidade_atual · a travessia de um passo narrada é ratificada (App: detectarChegada)", /detectarChegada\(resp\.narrativa/.test(app));

  /* lugar_atual — o Cronista diz o lugar; a régua do lugar dito é do motor */
  t("lugar_atual · o Cronista tem a SEÇÃO lugar e o App regista-a", /SEÇÃO lugar \(v9\.39\)/.test(app) && /registrarLugar\(r\.lugar, "cronista"\)/.test(app));
  t("lugar_atual · o galpão pedido e contado pelo Cronista é lugar novo", lerLugarDito("o galpão de Lia Cinzela", { lugar: null, cidade: "Quebrado do Leste", pedido: "Vou ao galpão de Lia Cinzela.", fonte: "cronista" }).acao === "novo");
  t("lugar_atual · a volta à cidade pedida pelo jogador volta (pelo Cronista)", lerLugarDito("cidade", { lugar: { nome: "a fazenda de Jessa", distancia: "perto" }, cidade: "Vau", pedido: "Volto para Vau.", fonte: "cronista" }).acao === "volta");

  /* jornada_meio — o mar sai da rota */
  t("jornada_meio · a rota marítima diz o meio no mapa (TERRENO_VIAGEM.maritima.meio)", TERRENO_VIAGEM.maritima && TERRENO_VIAGEM.maritima.meio === "navio");
  const sorte = () => 0.1;
  t("jornada_meio · sem o meio do Narrador, a rota marítima acampa a bordo", escolherSitio({ jornada: { de: "Porto", para: "Ilha", terreno: "maritima" } }, sorte).tipo === "embarcado");
  t("jornada_meio · a estrada continua estrada", escolherSitio({ jornada: { de: "A", para: "B", terreno: "estrada" } }, sorte).tipo === "estrada");
  t("jornada_meio · o meio que já está na jornada (save antigo) ganha", escolherSitio({ jornada: { de: "A", para: "B", terreno: "estrada", meio: "caravana" } }, sorte).tipo === "comboio");
  t("jornada_meio · terreno desconhecido não estoura", escolherSitio({ jornada: { de: "A", terreno: "nada" } }, sorte).tipo === "estrada");

  /* canone e npcs — o Cronista regista, depois do Narrador, vendo o que já existe */
  t("canone · o Cronista tem a SEÇÃO canone (fatos duráveis, sem reescrever o que existe)", /SEÇÃO canone: fatos DURÁVEIS/.test(app) && /NÃO reescreva nem contradiga o CÂNONE ATUAL/.test(app));
  t("npcs · e a SEÇÃO pessoas (com nome e papel durável)", /SEÇÃO pessoas: pessoas COM NOME e papel durável/.test(app));
  t("canone/npcs · o Cronista recebe o CÂNONE ATUAL e o ELENCO", /CÂNONE ATUAL:\\n\$\{formatarCanone\(canoneRef\.current\)/.test(app) && /ELENCO \(pessoas já registradas\)/.test(app));
  /* onda 1 do custo (13/10): o Cronista ganhou o terceiro argumento (a frase e os envelopes do turno, para o gatilho) — a âncora segue a chamada */
  t("canone/npcs · e corre DEPOIS de aplicada a resposta do Narrador", app.indexOf("let pers = aplicarResposta(resp, persAtual") > 0 && app.indexOf("let pers = aplicarResposta(resp, persAtual") < app.indexOf("cronistaDoTurno(pers, narrativaFinal, doTurnoCr)"));
  t("canone/npcs · os nomes que o Narrador inventava vêm dos NOMES À MÃO, registados pelo código", /nomesAMaoNaProsa\(/.test(app));
  t("canone · o Cronista não reescreve identidade (só preenche o vazio)", /identidade NUNCA é reescrita/.test(app));
}

/* ============================================================ */
sec("5. o App continua a ler os seis campos (tolerante: a instrução saiu, o leitor fica)");
{
  t("cidade_atual", /if \(md\.cidade_atual\)/.test(app));
  t("lugar_atual", /hasOwnProperty\.call\(md, "lugar_atual"\)/.test(app));
  t("jornada_meio", /md\.jornada_meio/.test(app));
  /* MOVIDAS (27/10, T1-A 2.ª fatia, o oficial): DE TEXTO PARA COMPORTAMENTO.
     O leitor de `canone` e de `npcs` mudou-se do `aplicarResposta` para
     `src/motor/aplicar.js#aplicarORegisto` (puro); a intenção — o App ainda
     lê os dois campos, tolerante — prova-se jogando o registo com eles. */
  {
    const { aplicarORegisto } = await import(S + "motor/aplicar.js");
    const r = aplicarORegisto({ personagem: { nome: "Vera" }, canone: {}, mapa: { cidades: [], faccoes: [] }, npcs: {}, npcTurno: 0, dia: 1 },
      { narrativa: "x", mudancas: { canone: { "a lâmina partida": { tipo: "artefato" } }, npcs: [{ nome: "Brann Ferro", papel: "ferreiro" }] } },
      { baseDoNome: { importantes: [], conhecidos: [], recentes: [], grupo: [], aqui: [], heroi: "Vera" } });
    t("canone", !!r.estado.canone["a lâmina partida"]);
    t("npcs", !!r.estado.npcs["Brann Ferro"]);
  }
  /* MOVIDA (27/10, T1-B fatia 2): DE TEXTO PARA COMPORTAMENTO. Lia `oQueFaltaDebitar(resp.narrativa, resp.mudancas` no texto do motor; agora a narração que conta um pagamento passa pelo `aplicar` com e sem o campo declarado, e a bolsa desce UMA vez nos dois casos. O bloco
     mora em `src/motor/aplicar.js` desde a T1-A, que é puro: o turno se JOGA
     em Node, e o texto deixou de ser a melhor prova — o próximo bloco que o
     `oficial` mover para lá mexe nas linhas sem mexer no jogo, e a asserção
     partiria pelo motivo errado (fragilidade 5 da auditoria do motor). */
  {
    const { aplicar } = await import(S + "motor/aplicar.js");
    const fichaDoTurno = (x = {}) => ({ nome: "Vera", classe: "Guerreiro", nivel: 1, xp: 0, vida: 20, vidaMax: 20, mana: 0, manaMax: 0, moedas: 34, atributos: {}, inventario: [], habilidades: [], efeitos: [], condicoes: [], grupo: [], ...x });
    const bolsa = (mudancas) => aplicar({ personagem: fichaDoTurno() }, { narrativa: "Você paga 5 moedas ao taberneiro.", mudancas }, {}).estado.personagem.moedas;
    t("moedas (e a bolsa ainda o desconta do que leu, para não cobrar duas vezes)", bolsa({}) === 29 && bolsa({ moedas: -5 }) === 29);
  }
  /* 12/10 (8.ª sessão): esta asserção passava e a bolsa não descia. Ela
     provava que os envelopes chegavam, não que a frase estivesse neles — a
     etiqueta do pedido só vai em `pedidoFinal`, e `conteudo` chega sem ela.
     A frase passou a ir por nome (`pedido:`), e quem prova que paga, com as
     seis frases reais, é teste-frase-que-paga.mjs. Fica aqui o que ela de
     facto prova: os envelopes continuam a chegar (a porta do JÁ PAGO). */
  t("e os envelopes do turno chegam à bolsa (a porta do já pago pelo sistema)", /aplicarResposta\(resp, persAtual, \{ envelopes: conteudo/.test(app) && /envelopes: op\.envelopes/.test(app));
  t("e a frase do jogador chega à bolsa por nome", /pedido: pedidoDaBolsa/.test(app));
}

/* ============================================================ */
sec("6. o tamanho: a regra paga-se com o que saiu");
{
  /* medido na v9.422 (a E2) com estas mesmas três cenas: típica 52.971,
     pior real 65.917, inteiro 79.306. A E3 tira o 2.º lote (~1,7 mil) e a
     regra come ~650: a típica desce ~1,1 mil. A catraca deixa ~150 de folga. */
  console.log(`      (típica ${pT.length} · pior real ${pP.length} · inteiro ${pTodo.length})`);
  t("a típica desceu, com a regra dentro (< 52.050; a E2 deixou 52.971)", pT.length < 52050, String(pT.length));
  t("a PIOR CENA REAL desceu (< 65.000; a E2 deixou 65.917)", pP.length < 65000, String(pP.length));
  t("o prompt inteiro desceu (< 78.200; a E2 deixou 79.306)", pTodo.length < 78200, String(pTodo.length));
  console.log(`      (caixa alta na típica: ${altas(pT)}; a E2 deixou 63)`);
  t("a caixa alta da típica desceu (a E2 deixou 63)", altas(pT) < 63, String(altas(pT)));
}

console.log(`\nnarrador só narra (E3): ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
