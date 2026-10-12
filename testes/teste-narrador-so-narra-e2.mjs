/* teste-narrador-so-narra-e2.mjs — o Narrador só narra, E2: o escrivão sem
   uso e as licenças contrárias saem do texto fixo (12/10)

   A medição (`mente/narrador-so-narra.md` §2 e §4) contou 137 turnos da 6.ª
   e da 7.ª sessões: o Narrador mandou `mudancas` em 10, e uma dúzia de
   canais nunca foi usada — e cada um tinha o seu parágrafo no prompt, pago
   em todo turno. Ao lado deles, oito frases mandavam inventar ou decidir o
   que agora é do sistema (o preço "dentro da faixa", "na dúvida, ABRA o
   combate", "semeia-as você", os achados espontâneos, o preço da missão, o
   relógio proposto, a política "é sua").

   O que esta suíte guarda:
     1. os canais do 1.º lote já não são oferecidos ao Narrador;
     2. as licenças contrárias saíram (ou viraram o avesso);
     3. o que NÃO podia sair continua lá (o contrato, o ofício, a coerência,
        os canais da E3 e da E4, o perigo);
     4. O CHAMADO, o único sinal sem outra porta, só para quem o alcança;
     5. o App ainda lê os campos (o parser é tolerante: a reversão é um
        commit, e o que chegar ainda se aplica);
     6. o tamanho: a catraca do que a E2 tirou.

   Falha na árvore de v9.421 e passa nesta. */
import { readFileSync } from "node:fs";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? "  → " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const S = new URL("../src/", import.meta.url).href;

const { montarSystemPrompt } = await import(S + "prompt.js");
const { NIVEL_MINIMO } = await import(S + "raids.js");
const { MISSOES_PROMPT } = await import(S + "missoes.js");
const { OFERTAS_PROMPT } = await import(S + "ofertas.js");
const { RELOGIOS_PROMPT } = await import(S + "relogios.js");
const { ECONOMIA_PROMPT } = await import(S + "economia.js");
const app = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");

const ficha = (nivel) => ({ nome: "Brann", conceito: "druida do vale", historia: "", nivel, raca: "Humano", classe: "Druida", atributos: { forca: 1, destreza: 1, vigor: 4, intelecto: 4, presenca: 1, percepcao: 1 }, vidaMax: 61, manaMax: 48, efeitos: [], condicoes: [] });
const banco = { cidades: ["Pedravale", "Dwen", "Corvo Alto"], tavernas: ["O Javali"], elenco: [] };
const M = { genero: "Fantasia medieval" };
/* as mesmas três cenas da medição (render.mjs da E1): a típica de cidade, a
   PIOR CENA REAL (todas as portas que um turno real abre) e o prompt inteiro */
const tipica = { emCidade: true, temGente: true, temMercado: true, temMissao: true, temTrama: true, temVilao: true };
const piorReal = { emCombate: true, emMasmorra: true, temChao: true, temGente: true, conjura: true, temGrupo: true, aflicao: true, temSintonia: true, temRegraPropria: true, temMissao: true, temGatilho: true, temDadiva: true, temEspecializacao: true, despertou: true, invoca: true, temLegado: true };
const pT = montarSystemPrompt("C", M, ficha(8), {}, banco, "", "", "", "", "", "", "Mortal", tipica);
const pP = montarSystemPrompt("C", M, ficha(20), {}, banco, "", "", "", "", "", "", "Mortal", piorReal);
const pTodo = montarSystemPrompt("C", M, ficha(20), {}, banco, "", "", "", "", "", "", "Mortal", null);

/* ============================================================ */
sec("1. o escrivão sem uso já não é oferecido (0 usos em 137 turnos, e um dono no sistema ou no Cronista)");
{
  const LOTE_1 = [
    ["mapa_cidades", /"mapa_cidades"/], ["mapa_faccoes", /"mapa_faccoes"/],
    ["adicionar_habilidades (o sistema recusa)", /adicionar_habilidades/],
    ["evento_global_encerrar (o Cronista fecha)", /evento_global_encerrar/],
    ["adicionar_itens / remover_itens", /"(adicionar|remover)_itens"/],
    ["grupo_adicionar/remover/itens/atualizar", /"grupo_(adicionar|remover|itens|atualizar)"/],
    ["loot:", /loot:/], ["feito (XP)", /"feito":/],
    ["missao_oferecida e paga", /missao_oferecida|"paga"/],
    ["relogio_novo", /relogio_novo/],
    ["a linha SINAIS (fe:, milagre:, viagem:, masmorra:, ascender:, dominio:, patrono:)", /SINAIS \(canal barato|"fe:|milagre:<|viagem:<|masmorra:<|ascender:|dominio:<|patrono:</],
  ];
  for (const [nome, rx] of LOTE_1) t(`fora do prompt inteiro: ${nome}`, !rx.test(pTodo));
  t("o MAPA vazio já não manda registrar cidade nova", !/ao apresentar uma cidade nova, registre-a/.test(pTodo));
  /* E3 (12/10), MOVIDA: o "moedas" saiu do exemplo com o 2.º lote */
  /* E4 (12/10), MOVIDA: a vida, a mana, o dano e o combate saíram do
     exemplo com a E4 (a prova está em teste-narrador-so-narra-e4); o que
     esta guardava da E2 — o formato sem os tipos de equipamento — fica */
  t("o exemplo do formato só leva os campos que ficam", /"mudancas": null\r?\n\}/.test(pTodo) && !/"vida": -3/.test(pTodo) && !/Tipos de equipamento:/.test(pTodo));
}

/* ============================================================ */
sec("2. as licenças contrárias saíram (§4a do relatório)");
{
  const LICENCAS = [
    ["o preço «DEVE respeitar estas faixas» (economia.js)", /DEVE respeitar estas faixas/, ECONOMIA_PROMPT],
    ["«Mercadores com personalidade e preços coerentes»", /Mercadores com personalidade/, pTodo],
    ["«Na dúvida, ABRA o combate»", /ABRA o combate/, pTodo],
    ["«semeia-as você… masmorra:<nome>»", /semeia-as você/, pTodo],
    ["ACHADOS ESPONTÂNEOS", /ACHADOS ESPONTÂNEOS/, pTodo],
    ["«DIGA O PREÇO NA CENA… paga» (missoes.js)", /DIGA O PREÇO NA CENA/, MISSOES_PROMPT],
    ["«Você PODE PROPOR um relógio» (relogios.js)", /PODE PROPOR um relógio/, RELOGIOS_PROMPT],
    ["«A política é sua… você registra o desfecho»", /A política é sua|registra o desfecho/, pTodo],
    ["«Companheiros e inimigos podem ganhar habilidades livremente»", /ganhar habilidades livremente/, pTodo],
    ["«podem partir ou trair» (a consequência que só existia pelo canal)", /podem partir ou trair/, pTodo],
  ];
  for (const [nome, rx, txt] of LICENCAS) t(`saiu: ${nome}`, !rx.test(txt));
  t("a 1.ª linha da ECONOMIA virou o avesso: o preço dito é o do sistema", /o preço dito na cena é o que o sistema mandou/.test(ECONOMIA_PROMPT));
  t("a DIPLOMACIA diz quem decide: o envelope do sistema", /\[DIPLOMACIA — RESOLVIDA PELO SISTEMA\]/.test(pTodo));
  t("o CONTEÚDO ESCONDIDO: chefes e lugares secretos são os do sistema", /os chefes e os lugares secretos são os que o sistema já pôs no mundo/.test(pTodo));
  t("OFERTAS e MISSÕES já não oferecem o campo", !/missao_oferecida/.test(OFERTAS_PROMPT) && !/missao_oferecida/.test(MISSOES_PROMPT));
  /* E3 (12/10), MOVIDA: a E3 trocou-a pela regra O QUE É FATO, no mesmo
     commit (teste-narrador-so-narra-e3.mjs prova a regra) */
  t("o «invente à vontade» da abertura saiu com a E3, no mesmo commit da regra", !/invente à vontade/.test(pTodo) && /O QUE É FATO:/.test(pTodo));
}

/* ============================================================ */
sec("3. o que NÃO podia sair (§6 do relatório)");
{
  const FICA = [
    ["o contrato", /O Mestre desta mesa não é você: é o sistema/],
    ["a divisão", /A DIVISÃO, EM UMA LINHA/],
    ["o ofício", /O OFÍCIO DA CENA/],
    ["o cânone nunca contradito", /O que está lá NUNCA é contradito/],
    ["as datas de encontro", /DATAS DE ENCONTRO/],
    ["o escopo do envelope", /ESCOPO DO ENVELOPE/],
    ["o tempo do sistema", /TEMPO É DO SISTEMA/],
    /* E4 (12/10), MOVIDAS: o perigo, combate_iniciar e dano_ambiental
       saíram com a E4; a prova de que saíram, e de quem os faz agora, está
       em teste-narrador-so-narra-e4 */
    /* E3 (12/10), MOVIDAS: o 2.º lote (moedas, cidade_atual, jornada_meio,
       canone, npcs) saiu com a E3 e a prova de que saiu está na suíte dela;
       aqui fica o que a E3 também não podia tirar */
    ["o espólio é do sistema", /ESPÓLIO DE COMBATE É DO SISTEMA/],
    /* E3, MOVIDA: o Narrador já não desconta; a guarda virou "só narre um
       pagamento que eu fiz ou aceitei" (a cena que paga, desce a bolsa) */
    ["só se narra um pagamento feito ou aceite", /só narre um pagamento que eu fiz ou aceitei/],
  ];
  for (const [nome, rx] of FICA) t(`fica: ${nome}`, rx.test(pTodo));
}

/* ============================================================ */
sec("4. O CHAMADO: o único sinal sem outra porta, só para quem o alcança");
{
  /* a raid abre-se SÓ pelo sinal do Narrador (App: sinalRaidRef ← chave
     "raid"), e abaixo de NIVEL_MINIMO o sistema recusava de qualquer modo */
  t("o App só abre a raid pelo sinal", /chave === "raid"/.test(app) && /sinalRaidRef\.current = arg/.test(app));
  const abaixo = montarSystemPrompt("C", M, ficha(NIVEL_MINIMO - 1), {}, banco, "", "", "", "", "", "", "Mortal", tipica);
  const acima = montarSystemPrompt("C", M, ficha(NIVEL_MINIMO), {}, banco, "", "", "", "", "", "", "Mortal", tipica);
  t("abaixo do nível do chamado, a linha não vem", !/O CHAMADO: /.test(abaixo));
  t("no nível do chamado, vem — e diz o campo", /O CHAMADO: [^\n]*"sinais": \["raid:<nome da coisa>"\]/.test(acima));
  t("sem cena (o prompt inteiro), vem — como toda porta", /O CHAMADO: /.test(pTodo));
  t("lixo no nível não estoura (cai no 1)", !/O CHAMADO: /.test(montarSystemPrompt("C", M, { ...ficha(1), nivel: "x" }, {}, banco, "", "", "", "", "", "", "Mortal", tipica)));
}

/* ============================================================ */
sec("5. o App continua a ler os campos (tolerante: a instrução saiu, o leitor fica)");
{
  t("mapa_cidades", /mapa_cidades/.test(app));
  t("evento_global_encerrar", /md2\.evento_global_encerrar/.test(app));
  t("relogio_novo", /relogio_novo/.test(app));
  t("missao_oferecida (é por onde a proposta do Cronista vira cartaz)", /missao_oferecida/.test(app));
  t("os sinais (fé, milagre, viagem, masmorra, loot)", /chave === "fe"/.test(app) && /chave === "milagre"/.test(app) && /chave === "loot"/.test(app));
}

/* ============================================================ */
sec("6. o tamanho: a catraca do que a E2 tirou");
{
  /* medido na v9.421 com estas mesmas três cenas: típica 59.094, pior real
     71.367, inteiro 85.249. A E2 tira ~6,1 mil da típica e ~5,5 mil do pior
     (o pior ganha O CHAMADO, nível 20). A catraca deixa ~500 de folga. */
  console.log(`      (típica ${pT.length} · pior real ${pP.length} · inteiro ${pTodo.length})`);
  t("a típica desceu mais de 5,5 mil (< 53.500)", pT.length < 53500, String(pT.length));
  t("a PIOR CENA REAL desceu mais de 5 mil (< 66.400)", pP.length < 66400, String(pP.length));
  t("o prompt inteiro desceu mais de 5,5 mil (< 79.800)", pTodo.length < 79800, String(pTodo.length));
  const altas = (s) => (s.match(/(^|[^A-Za-zÀ-ú])(NÃO|NUNCA|PROIBIDO|PROIBIDA|JAMAIS|TERMINANTEMENTE)(?![A-Za-zÀ-ú])/g) || []).length;
  console.log(`      (caixa alta na típica: ${altas(pT)}; era 68)`);
  t("a caixa alta da típica desceu (era 68)", altas(pT) < 68, String(altas(pT)));
}

console.log(`\nnarrador só narra (E2): ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
