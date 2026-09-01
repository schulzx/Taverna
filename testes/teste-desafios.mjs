/* teste-desafios.mjs (v9.59) — "se eu ficar pedindo testes infinitamente
   ele vai me dar testes infinitamente, mesmo que não tenha nada nem lógica".
   Esta suíte é a resposta: o obstáculo decide, e ele tem memória.        */
import {
  lerAcao, falaDoVeredicto, envelopeDeVeredicto, envelopeDeBuscaVazia, envelopeDoBarulho,
  envelopeSemOportunidade, comoSeDiz, DIFICULDADES, degrauDaDC, custoPorAlvo, desfechoDaFalha, SEM_DADO,
  garantirTentativas, registrarTentativa, marcarLimpo, chaveDaTentativa,
  viasAbertas, viaDeclarada, viaPorId, trancaDe, naoPedeDado, oQueMudou, bonusDoQueMudou,
  desafioPorId, desafioPorPericia, DESAFIOS, VIAS_DE_TRANCA, TIPOS_DE_ROLAGEM, DESAFIOS_PROMPT,
  ACOES_RAPIDAS, fraseDaAcaoRapida,
} from "../src/desafios.js";
import { PERICIAS, periciaPorId } from "../src/pericias.js";

let ok = 0, mal = 0;
const t = (nome, cond) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome); } };
const sec = (s) => console.log("\n" + s);

const SEM = "taverna|desafios";
const heroi = { nivel: 5, inventario: [], habilidades: [], equipado: {} };
const ladino = { nivel: 5, inventario: [{ nome: "Gazuas de ladrão" }], habilidades: [], equipado: {} };
const mago = { nivel: 5, inventario: [], habilidades: [{ nome: "Palavra de Abrir", descricao: "destranca o que está fechado" }], equipado: {} };
const base = { personagem: heroi, semente: SEM, lugar: "o quarto de cima", tentativas: {}, dia: 3 };

sec("1. os três tipos, e quem começa cada um");
{
  t("são três, nem mais nem menos", TIPOS_DE_ROLAGEM.length === 3);
  const sal = TIPOS_DE_ROLAGEM.find((x) => x.id === "salvaguarda");
  t("a salvaguarda é a que acontece CONTRA o herói", /contra o herói/.test(sal.quem));
  t("e ninguém a pede", /Nunca se pede/.test(sal.pede));
  t("o teste de perícia nasce da ação declarada", /declara a ação/.test(TIPOS_DE_ROLAGEM.find((x) => x.id === "pericia").pede));
}

sec("2. o que NÃO se rola");
{
  const casos = [
    "pergunto o nome dele", "converso com o taverneiro", "ando até o balcão",
    "sento numa mesa", "saco a espada", "bebo a cerveja", "espero",
  ];
  for (const c of casos) {
    const v = lerAcao(c, base);
    t(`"${c}" não vira teste`, !v || v.tipo === "livre");
  }
  t("e o motivo fica registrado", (naoPedeDado("pergunto o nome dele") || {}).porque.length > 10);
  t("texto vazio não quebra", lerAcao("", base) === null && lerAcao(null, base) === null);
  t("envelope do sistema não é ação minha", lerAcao("[ALGO] eu vasculho tudo", base) === null);
}

sec("3. a ação declarada vira teste — e a dificuldade vem do obstáculo");
{
  const v = lerAcao("presto bastante atenção na taverna para identificar algo incomum", base);
  t("virou teste", v && v.tipo === "teste");
  t("é Percepção", v.pericia === "percepcao");
  t("tem dificuldade", Number.isFinite(v.dc) && v.dc > 0);
  t("e diz DE ONDE ela vem", v.deOnde.length > 5);
  t("custa tempo", v.minutos > 0);
  t("busca não faz barulho", v.barulho === false);

  const f = lerAcao("tento identificar alguma fraqueza no inimigo", { ...base, emCombate: true });
  t("a fraqueza da criatura é Saberes", f && f.pericia === "saberes");
  t("e não é penalizada por estar na luta — é para isso que ela serve", !/no meio da luta/.test(f.deOnde));

  const b = lerAcao("vasculho o quarto", { ...base, emCombate: true });
  t("mas vasculhar no meio da luta é mais difícil", /no meio da luta/.test(b.deOnde));
}

sec("4. a dificuldade da tranca é da PORTA, não do herói");
{
  const naTaverna = trancaDe(SEM, "o quarto de cima da taverna", "porta");
  const naCadeia = trancaDe(SEM, "as celas do cárcere", "porta");
  console.log(`      taverna dc ${naTaverna.dc} (${naTaverna.nome}) · cadeia dc ${naCadeia.dc} (${naCadeia.nome})`);
  t("a cadeia tranca melhor que a taverna", naCadeia.dc > naTaverna.dc);
  t("a mesma porta é a mesma porta para sempre", trancaDe(SEM, "o quarto de cima da taverna", "porta").dc === naTaverna.dc);
  t("outra semente, outro mundo", trancaDe("outra", "o quarto de cima da taverna", "porta").dc !== undefined);
  t("e a porta tem nome, para o Mestre descrever sem inventar", naTaverna.nome.length > 4);
}

sec("5. a porta trancada tem quatro caminhos — e o sistema sabe quais estão abertos");
{
  t("quatro vias no catálogo", VIAS_DE_TRANCA.length === 4);
  t("força não precisa de nada", viasAbertas(heroi).some((v) => v.id === "forca"));
  t("sem gazua, a via da gazua não existe", !viasAbertas(heroi).some((v) => v.id === "ferramentas"));
  t("com gazua, existe", viasAbertas(ladino).some((v) => v.id === "ferramentas"));
  t("sem magia de abrir, a via mágica não existe", !viasAbertas(heroi).some((v) => v.id === "magia"));
  t("com a magia certa, existe", viasAbertas(mago).some((v) => v.id === "magia"));

  t("a frase escolhe a via", (viaDeclarada("arrombo a porta com a gazua") || {}).id === "ferramentas");
  t("no ombro é força", (viaDeclarada("ponho o ombro na porta") || {}).id === "forca");
  t("por magia é magia", (viaDeclarada("abro a porta com magia") || {}).id === "magia");

  /* pedir a via que não se tem NÃO é um teste difícil — é impossível, e o
     sistema diz o que resolveria */
  const imp = lerAcao("tento abrir a porta com a gazua", base);
  t("sem gazua, é impossível — não teste difícil", imp && imp.tipo === "impossivel");
  t("e diz por quê", /ferramentas de ladrão/.test(imp.porque));
  t("e o que abriria", imp.comoSeria.length > 0);
  t("a fala ao jogador lista as saídas", /O que abriria/.test(falaDoVeredicto(imp)));

  const ok1 = lerAcao("tento abrir a porta com a gazua", { ...base, personagem: ladino });
  t("com a gazua na bolsa, vira teste", ok1 && ok1.tipo === "teste" && ok1.via === "ferramentas");
  t("e é Prestidigitação, não Arrombamento", ok1.pericia === "prestidigitacao");
  t("gazua é silenciosa", ok1.barulho === false);

  const bruto = lerAcao("arrombo a porta no braço", base);
  t("no braço vira Arrombamento", bruto.pericia === "arrombamento");
  t("e FAZ barulho", bruto.barulho === true);
  t("a força é mais difícil que a gazua na mesma porta", bruto.dc > ok1.dc);
}

sec("6. o que quebrava: insistir");
{
  /* a captura de tela: seis Percepções no mesmo quarto */
  let reg = {};
  const frase = "vasculho o quarto";
  const v1 = lerAcao(frase, { ...base, tentativas: reg });
  t("a primeira vez rola", v1.tipo === "teste");
  reg = registrarTentativa(reg, v1.chave, { resultado: "falha", dia: 3 });

  const v2 = lerAcao(frase, { ...base, tentativas: reg });
  t("a segunda, igualzinha, NÃO rola", v2.tipo === "jaTentou");
  t("e diz como reabrir", v2.comoReabrir.length >= 3);
  t("a fala ao jogador é clara", /já tentou/.test(falaDoVeredicto(v2)));
  t("o envelope proíbe o Mestre de ser generoso", /NÃO resolva o obstáculo por generosidade/.test(envelopeDeVeredicto(v2, frase)));

  const v3 = lerAcao("vasculho o quarto com a ajuda de Bram", { ...base, tentativas: reg });
  t("com ajuda, reabre", v3.tipo === "teste");
  t("e a ajuda facilita", v3.dc < v1.dc);
  t("dizendo o que contou a favor", v3.mudou.includes("com ajuda"));

  const v4 = lerAcao("vasculho o quarto palmo a palmo, sem pressa", { ...base, tentativas: reg });
  t("com tempo de sobra, também reabre", v4.tipo === "teste" && v4.dc < v1.dc);

  const v5 = lerAcao("vasculho o quarto com a lanterna", { ...base, tentativas: reg });
  t("com outra ferramenta, também", v5.tipo === "teste");

  t("mas o alívio tem teto — não se empilha até o trivial", bonusDoQueMudou(oQueMudou("com a ajuda de todos, sem pressa, com a lanterna e o pé de cabra")) <= 4);
  /* achado na tela: a PRIMEIRA tentativa anunciava "conta a favor: por outro
     caminho". Outro caminho que quê? Só é outro se já houve um. */
  t("na primeira tentativa não existe 'outro caminho'", !oQueMudou("arrombo a porta", { viaNova: "forca" }).some((m) => m.id === "via"));
  t("depois de já ter tentado, existe", oQueMudou("arrombo a porta", { viaNova: "forca", viasJaUsadas: ["ferramentas"], houveTentativa: true }).some((m) => m.id === "via"));
  const primeira = lerAcao("arrombo a porta no braço", base);
  t("e o painel não mente na estreia", primeira.mudou.length === 0);
}

sec("6b. e insistir por OUTRO caminho é outra tentativa");
{
  let reg = {};
  const a = lerAcao("arrombo a porta no braço", { ...base, personagem: ladino });
  reg = registrarTentativa(reg, a.chave, { via: "forca", resultado: "falha", dia: 3 });
  const b = lerAcao("arrombo a porta no braço", { ...base, personagem: ladino, tentativas: reg });
  t("o mesmo ombro na mesma porta não rola de novo", b.tipo === "jaTentou");
  const c = lerAcao("tento a fechadura com a gazua", { ...base, personagem: ladino, tentativas: reg });
  t("mas a gazua é outra tentativa", c.tipo === "teste" && c.via === "ferramentas");
}

sec("7. o lugar vasculhado fica vasculhado");
{
  let reg = {};
  const v = lerAcao("reviro o quarto", { ...base, tentativas: reg });
  t("sem nada aqui, o sistema ainda deixa procurar UMA vez", v.tipo === "teste");
  t("e marca que este é o tipo de busca que fecha o lugar", v.fechaDepois === true);
  reg = registrarTentativa(reg, v.chave, { resultado: "sucesso", dia: 3, limpo: true });

  const v2 = lerAcao("reviro o quarto", { ...base, tentativas: reg });
  t("depois disso, não rola mais", v2.tipo === "vasculhado");
  t("a fala diz que acabou", /não há mais o que achar/.test(falaDoVeredicto(v2)));
  const env = envelopeDeVeredicto(v2, "reviro o quarto");
  t("e o envelope proíbe inventar achado novo", /NÃO invente um achado novo/.test(env));
  t("e proíbe a pista de consolo", /pista de consolo/.test(env));

  /* mas outra coisa no mesmo lugar continua aberta — a chave é lugar+alvo */
  const outro = lerAcao("escuto à porta", { ...base, tentativas: reg });
  t("escutar à porta é outro alvo, e continua valendo", outro.tipo === "teste");

  /* com AJUDA, nem o lugar limpo reabre por milagre? reabre — e é o certo:
     quem traz gente nova pode ver o que o primeiro par de olhos não viu */
  const comAjuda = lerAcao("reviro o quarto com a ajuda de Bram", { ...base, tentativas: reg });
  t("com ajuda nova, o lugar limpo aceita mais uma", comAjuda.tipo === "teste");
}

sec("7b. passar numa busca vazia NÃO é achar");
{
  const env = envelopeDeBuscaVazia("vasculhar o lugar");
  t("diz que passou", /Passei no teste/.test(env));
  t("e que não há nada — e que isso é a verdade do lugar", /NÃO HÁ NADA ESCONDIDO/.test(env));
  t("proíbe inventar", /NÃO invente um achado/.test(env));
  t("e fecha o lugar", /encerrado para busca/.test(env));
}

sec("8. o sucesso repetido não vira teste");
{
  let reg = {};
  const v = lerAcao("tento convencer o guarda a me deixar passar", base);
  t("convencer com esforço é teste", v && v.tipo === "teste" && v.pericia === "persuasao");
  reg = registrarTentativa(reg, v.chave, { resultado: "sucesso", dia: 3 });
  const v2 = lerAcao("tento convencer o guarda a me deixar passar", { ...base, tentativas: reg });
  t("de novo, depois de ter dado certo, não se rola", v2.tipo === "livre");
  t("e o sistema diz por quê", /já conseguiu/.test(v2.porque));

  /* ACHADO JOGANDO: procurar não é conseguir. Uma busca bem-sucedida dizia
     "você já conseguiu isso aqui" na segunda vez — errado de duas maneiras:
     soa como se não houvesse mais nada (e pode haver, mais fundo), e trata
     revirar um quarto como tarefa que se conclui. */
  let reg2 = registrarTentativa({}, chaveDaTentativa("o quarto de cima", "busca"), { resultado: "sucesso", dia: 3 });
  const b2 = lerAcao("vasculho o quarto", { ...base, tentativas: reg2 });
  t("mas buscar de novo depois de achar não é 'já conseguiu'", b2.tipo === "jaTentou" && b2.apósSucesso === true);
  t("a fala fala de revistar, não de conquistar", /já revistou isto assim/.test(falaDoVeredicto(b2)));
  t("e ainda reabre com ajuda ou tempo", b2.comoReabrir.length >= 3);
  t("o envelope proíbe achado de consolo", /NÃO ofereça um achado novo/.test(envelopeDeVeredicto(b2, "vasculho o quarto")));
  t("com ajuda, reabre mesmo depois do sucesso", lerAcao("vasculho o quarto com a ajuda de Bram", { ...base, tentativas: reg2 }).tipo === "teste");
  t("uma porta aberta continua aberta — ali 'já conseguiu' está certo", v2.tipo === "livre");
}

sec("9. o hábito antigo deixa de ter porta (v9.64)");
{
  /* Até a v9.63 esta seção afirmava o contrário: "peço um teste de
     Percepção" entrava pela perícia nomeada e virava o desafio de busca.
     Era conforto de mesa, e custava caro — quem escolhe a perícia escolhe o
     que existe. Pedir Percepção já afirma que há o que ver. */
  const v = lerAcao("peço um teste de percepção", base);
  t("não vira mais o desafio de busca", v && v.tipo === "naoSePede");
  t("e o sistema não escondeu o nome da perícia pedida", v.pericia === "percepcao");
  /* A FRESTA COM NOME PRÓPRIO: metade das perícias carrega no nome o verbo
     da ação que cobre, e por ele o desafio casava assim mesmo. Uma regra
     que vale para Percepção e não vale para Arrombamento é pior que
     nenhuma regra. */
  const comVerboNoNome = [
    ["peço um teste de Arrombamento", "arromb"],
    ["faço uma checagem de Investigação", "investig"],
    ["quero rolar Intimidação", "intimid"],
    ["peço um teste de Persuasão", "persuad"],
    ["rolo Sobrevivência", "rastre"],
    ["peço uma jogada de Medicina", "estanc"],
  ];
  for (const [frase] of comVerboNoNome) {
    const r = lerAcao(frase, base);
    t(`"${frase}" também não passa`, r && r.tipo === "naoSePede");
  }
  t("toda perícia do catálogo pode ser pedida sem quebrar nada",
    PERICIAS.every((p) => { try { lerAcao(`peço um teste de ${p.nome}`, base); return true; } catch { return false; } }));
  /* e o que sobra do pedido continua sendo lido: a ação vence a moldura */
  t("mas a ação colada ao pedido continua valendo",
    lerAcao("peço um teste de Arrombamento para abrir a porta no ombro", { ...base, personagem: heroi }).tipo === "teste");
}

sec("10. o barulho");
{
  const bruto = lerAcao("arrombo a porta no braço", base);
  t("a força faz barulho", bruto.barulho === true);
  const env = envelopeDoBarulho("abrir o que está trancado", false);
  t("o envelope diz que alguém ouviu", /ELE OUVIU/.test(env));
  t("e que tem consequência real", /consequência real/.test(env));
  t("e proíbe transformar em nada", /NÃO o transforme em nada/.test(env));
  const silencio = lerAcao("tento abrir a porta com a gazua", { ...base, personagem: ladino });
  t("a gazua não faz", silencio.barulho === false);
  t("investigar não faz", lerAcao("investigo a cena", base).barulho === false);
}

sec("11. o livro de tentativas");
{
  t("save vazio não quebra", Object.keys(garantirTentativas(null)).length === 0);
  t("lixo no save é descartado", Object.keys(garantirTentativas({ a: 1, b: "x", c: null })).length === 0);
  const reg = registrarTentativa({}, "aqui|busca", { via: "forca", resultado: "falha", dia: 2 });
  t("registra a via", reg["aqui|busca"].vias.includes("forca"));
  t("conta as vezes", registrarTentativa(reg, "aqui|busca", { resultado: "falha" })["aqui|busca"].vezes === 2);
  t("não duplica a via", registrarTentativa(reg, "aqui|busca", { via: "forca" })["aqui|busca"].vias.length === 1);
  t("marcar limpo funciona", marcarLimpo(reg, "aqui|busca")["aqui|busca"].limpo === true);
  t("limpo sobrevive a novo registro", registrarTentativa(marcarLimpo(reg, "aqui|busca"), "aqui|busca", { resultado: "falha" })["aqui|busca"].limpo === true);
  t("a chave separa lugares", chaveDaTentativa("o quarto", "busca") !== chaveDaTentativa("o salão", "busca"));
  t("e separa alvos", chaveDaTentativa("o quarto", "busca") !== chaveDaTentativa("o quarto", "escuta"));
  t("acento não cria duas chaves", chaveDaTentativa("o salão", "busca") === chaveDaTentativa("O SALAO", "busca"));
}

sec("12. o catálogo é coerente");
{
  let mal2 = 0;
  for (const d of DESAFIOS) {
    if (!d.id || !d.rx || !d.rotulo || !d.alvo) mal2++;
    if (d.pericia && !periciaPorId(d.pericia)) { mal2++; console.log("      perícia inexistente:", d.pericia); }
  }
  t("toda entrada tem id, regex, rótulo, alvo e perícia real", mal2 === 0);
  t("os ids são únicos", new Set(DESAFIOS.map((d) => d.id)).size === DESAFIOS.length);
  t("busca e investigação fecham o lugar; o resto não", DESAFIOS.filter((d) => d.alvo === "busca" || d.alvo === "investigacao").length === 2);
  t("desafioPorId acha", (desafioPorId("tranca") || {}).id === "tranca");
  t("desafioPorPericia acha", (desafioPorPericia("furtividade") || {}).id === "furtar_se");
  t("id inexistente devolve null", desafioPorId("voar") === null && desafioPorPericia("voar") === null);
}

sec("13. nenhuma frase comum de jogo vira teste por acidente");
{
  /* o custo do falso positivo aqui é alto: sequestra o turno e marca o
     lugar. Estas são frases reais de partida que NÃO podem virar dado. */
  const inocentes = [
    "peço uma cerveja ao taverneiro",
    "procuro o taverneiro para perguntar do trabalho",
    "olho para Astrid e sorrio",
    "ouço o barulho da rua",
    "conto a ele o que aconteceu na estrada",
    "guardo as moedas na bolsa",
    "sigo para o mercado",
    "descanso um pouco antes de sair",
    "agradeço e me despeço",
    "encaro o horizonte",
    "pergunto se alguém viu Cora",
  ];
  let vazaram = 0;
  for (const f of inocentes) {
    const v = lerAcao(f, base);
    if (v && v.tipo === "teste") { vazaram++; console.log(`      VAZOU: "${f}" → ${v.pericia}`); }
  }
  t("nenhuma frase inocente virou teste", vazaram === 0);

  /* e o inverso: as que DEVEM virar */
  const devem = [
    ["presto bastante atenção na taverna para identificar algo incomum", "percepcao"],
    ["tento identificar alguma fraqueza no inimigo", "saberes"],
    ["tento abrir a porta a força", "arrombamento"],
    ["me esgueiro até a porta sem ser visto", "furtividade"],
    ["tento convencer o capitão a nos deixar entrar", "persuasao"],
    ["investigo a cena do crime", "investigacao"],
    ["escalo o muro", "atletismo"],
    ["rastreio as pegadas na lama", "sobrevivencia"],
    ["estanco o sangramento de Bram", "medicina"],
    ["tento saber se ele está mentindo", "intuicao"],
  ];
  let faltaram = 0;
  for (const [f, per] of devem) {
    const v = lerAcao(f, base);
    if (!v || v.tipo !== "teste" || v.pericia !== per) { faltaram++; console.log(`      FALTOU: "${f}" → ${v ? `${v.tipo}/${v.pericia}` : "nada"} (esperado ${per})`); }
  }
  t("todas as que devem virar teste viram, com a perícia certa", faltaram === 0);
}

sec("13b. os botões do painel entram pela mesma porta");
{
  /* ACHADO JOGANDO: o painel de Ações tinha seis botões "Pedir um teste" que
     chamavam a rolagem direto, pela dificuldade velha e sem livro de
     tentativas. Toda a arquitetura tinha uma porta dos fundos. */
  t("todo botão aponta para um desafio que existe", ACOES_RAPIDAS.every((a) => !!desafioPorId(a.id)));
  t("os ids são únicos", new Set(ACOES_RAPIDAS.map((a) => a.id)).size === ACOES_RAPIDAS.length);
  t("nenhum botão pede salvaguarda — ninguém pede uma", !ACOES_RAPIDAS.some((a) => /aguentar|resistir/i.test(a.rotulo)));
  for (const a of ACOES_RAPIDAS) {
    const v = lerAcao(fraseDaAcaoRapida(a.id, ""), { ...base, personagem: ladino });
    t(`"${a.rotulo}" cai no desafio ${a.id}`, v && (v.tipo === "teste" ? v.id === a.id : v.tipo === "impossivel"));
  }
  t("o alvo digitado entra colado na frase", /guarda/.test(fraseDaAcaoRapida("convencer", "o guarda a nos deixar passar")));
  t("sem alvo, a frase canônica basta", fraseDaAcaoRapida("buscar", "").length > 5);
  t("id inventado devolve só o que foi digitado", fraseDaAcaoRapida("voar", "xyz") === "xyz");
  /* e o botão obedece ao livro como o teclado */
  const v1 = lerAcao(fraseDaAcaoRapida("buscar", ""), base);
  const reg = registrarTentativa({}, v1.chave, { resultado: "falha", dia: 3 });
  t("botão repetido ouve 'você já tentou'", lerAcao(fraseDaAcaoRapida("buscar", ""), { ...base, tentativas: reg }).tipo === "jaTentou");
}

sec("14. a regra que o Mestre recebe");
{
  t("diz que são três rolagens", /TRÊS rolagens/.test(DESAFIOS_PROMPT));
  t("proíbe o Mestre de rolar", /VOCÊ NUNCA ROLA E NUNCA PEDE ROLAGEM/.test(DESAFIOS_PROMPT));
  t("explica as duas condições da mesa", /chance real de falhar E custo real por falhar/.test(DESAFIOS_PROMPT));
  t("diz que o jogador não pede testes", /O jogador NÃO pede testes/.test(DESAFIOS_PROMPT));
  t("diz que insistir igual não rola", /MESMA ABORDAGEM, UMA VEZ SÓ/.test(DESAFIOS_PROMPT));
  t("e conta os quatro jeitos de abrir o que está trancado", /a chave, ferramentas de ladrão, uma magia que abra, ou força bruta/.test(DESAFIOS_PROMPT));
}

sec("15. TESTE NÃO SE PEDE (v9.64)");
{
  const ctx = { personagem: heroi, semente: SEM, lugar: "o quarto de cima", tentativas: {}, dia: 1 };
  const pedidos = [
    "peço um teste de Percepção",
    "quero rolar Intuição",
    "faço uma checagem de Arrombamento",
    "posso fazer um teste de Atletismo?",
  ];
  for (const frase of pedidos) {
    const v = lerAcao(frase, ctx);
    t(`"${frase}" não vira dado`, v && v.tipo === "naoSePede");
  }
  {
    const v = lerAcao("peço um teste de Percepção", ctx);
    t("a recusa nomeia a perícia que ele pediu", v.periciaNome === "Percepção");
    t("e ensina a frase que teria funcionado", !!v.comoSeDiz && v.comoSeDiz.length > 10);
    t("a fala ao jogador diz que não se pede", /não se pede/.test(falaDoVeredicto(v)));
    t("e traz o exemplo entre aspas", falaDoVeredicto(v).includes(v.comoSeDiz));
    const env = envelopeDeVeredicto(v, "peço um teste de Percepção");
    t("o envelope proíbe o Mestre de rolar", /NÃO role, NÃO peça rolagem/.test(env));
    t("e proíbe entregar por narração o que o dado daria", /NÃO me entregue por narração aquilo que o teste teria dado/.test(env));
    t("e não trata a recusa como fracasso do herói", /não trate isto como fracasso meu/i.test(env));
  }
  /* REGRESSÃO: pedir o teste JUNTO com a ação continua valendo — quem
     escreve "peço um teste de Percepção para vasculhar o quarto" declarou
     uma ação, e a ação é o que manda. */
  {
    const v = lerAcao("peço um teste de Percepção para vasculhar o quarto", ctx);
    t("mas pedir COM a ação declarada continua rolando", v && v.tipo === "teste" && v.id === "buscar");
  }
  /* toda perícia que alguém pode nomear tem uma frase de exemplo */
  {
    const semExemplo = DESAFIOS.filter((d) => !comoSeDiz(d.id));
    t("todo desafio do catálogo sabe ensinar como se diz", semExemplo.length === 0);
    t("e nenhum exemplo é o próprio rótulo", DESAFIOS.every((d) => comoSeDiz(d.id) !== d.rotulo));
  }
  /* o exemplo que o sistema ensina tem de ser lido pelo próprio sistema —
     seria cruel mandar escrever uma frase que o leitor não reconhece */
  {
    const mudos = DESAFIOS.filter((d) => {
      const v = lerAcao(comoSeDiz(d.id), { ...ctx, personagem: ladino });
      return !v || v.tipo === "livre";
    }).map((d) => d.id);
    console.log("      exemplos que o leitor não reconhece: " + (mudos.join(", ") || "nenhum"));
    t("toda frase de exemplo é reconhecida pelo leitor", mudos.length === 0);
  }
}

sec("16. o vocabulário alargado — e o falso positivo que ele trouxe");
{
  const ctx = { personagem: heroi, semente: SEM, lugar: "o quarto de cima", tentativas: {}, dia: 1 };
  /* a frase que o próprio jogador escreveu como exemplo, e que não casava nada */
  for (const frase of ["verifico o quarto se encontro algo", "confiro as prateleiras", "checo o baú por um fundo falso", "esquadrinho o chão", "passo os olhos pela sala"]) {
    const v = lerAcao(frase, ctx);
    t(`"${frase}" é uma busca`, v && v.tipo === "teste" && v.id === "buscar");
  }
  /* conferir se algo está fechado NÃO é vasculhar: `buscar` vem antes de
     `tranca` no catálogo e roubaria a frase, marcando o cômodo como revirado */
  for (const frase of ["verifico se a porta está trancada", "confiro se o cadeado está fechado", "checo a fechadura"]) {
    const v = lerAcao(frase, ctx);
    t(`"${frase}" não é busca`, !v || v.id !== "buscar");
  }
}

sec("17. o mundo fala antes do dado (v9.64)");
{
  const ctx = { personagem: heroi, semente: SEM, lugar: "o corredor", tentativas: {}, dia: 1 };
  const ouvir = lerAcao("encosto o ouvido na porta", ctx);
  t("escutar carrega a pergunta de oportunidade", ouvir.oportunidade && ouvir.oportunidade.pergunta === "haOQueOuvir");
  t("e a frase do vazio, para o jogador", /nem voz, nem passo/.test(ouvir.oportunidade.nada));
  const rastro = lerAcao("sigo as pegadas na lama", ctx);
  t("rastrear também", rastro.oportunidade && rastro.oportunidade.pergunta === "haRastro");
  t("vasculhar NÃO pergunta — o mundo já sabe item por item", !lerAcao("reviro o quarto", ctx).oportunidade);
  t("a tranca pergunta pela vigia", lerAcao("arrombo a porta", ctx).vigia === true);
  t("e escutar não pergunta por vigia", ouvir.vigia === false);
  {
    const env = envelopeSemOportunidade(ouvir, "encosto o ouvido na porta");
    t("o envelope do vazio proíbe meia-pista", /NÃO invente meia-pista/.test(env));
    t("e proíbe o som distante de consolo", /NÃO plante um som distante/.test(env));
    t("e diz que não houve dado porque não havia obstáculo", /não se rola contra o que não existe/.test(env));
    t("e carrega a frase daquele desafio", env.includes(ouvir.oportunidade.nada));
  }
  t("o prompt avisa o Mestre de que o mundo fala antes", /ANTES DO DADO, O MUNDO DIZ SE HÁ/.test(DESAFIOS_PROMPT));
  t("e que uma rolagem pedida é recusada", /o sistema recusa e devolve a vez/.test(DESAFIOS_PROMPT));
}

sec("18. A RÉGUA — nenhum número do catálogo é mágico (v9.67)");
{
  t("sete degraus, do trivial ao heroico", DIFICULDADES.length === 7);
  const dcs = DIFICULDADES.map((d) => d.dc);
  t("e a régua sobe", dcs.every((d, i) => i === 0 || d > dcs[i - 1]));
  t("cada degrau explica a si mesmo", DIFICULDADES.every((d) => d.diz.length > 20));
  /* a propriedade que impede o 14 de voltar: todo número do catálogo é um
     degrau, e por isso todo número tem um nome que se pode discutir */
  const soltos = DESAFIOS
    .map((d) => d.dcPadrao || d.dcBase)
    .filter((n) => n && !DIFICULDADES.some((x) => x.dc === n));
  console.log("      números fora da régua: " + (soltos.join(", ") || "nenhum"));
  t("todo número do catálogo é um degrau com nome", soltos.length === 0);
  t("degrauDaDC sabe nomear o que já está rolado", degrauDaDC(18).id === "dificil" && degrauDaDC(13).id === "comum");
  t("e não quebra com número fora de escala", degrauDaDC(0).id === "trivial" && degrauDaDC(99).id === "heroico");
}

sec("19. COBERTURA — toda perícia da ficha tem como aparecer no jogo");
{
  /* O buraco que dava para MEDIR: quatro das dezoito perícias não tinham
     desafio nenhum. Um jogador podia gastar a especialização inteira em
     Acrobacia e nunca rolar uma — a perícia existia na tela, custava
     pontos, e não havia frase no mundo que a convocasse. */
  const comDesafio = new Set();
  for (const d of DESAFIOS) comDesafio.add(d.pericia);
  /* as vias da tranca dão perícia própria: a gazua é Prestidigitação e o
     ombro é Arrombamento, e nenhuma das duas está no campo `pericia` */
  for (const v of VIAS_DE_TRANCA) if (v.pericia) comDesafio.add(v.pericia);
  const orfas = PERICIAS.filter((p) => !comDesafio.has(p.id)).map((p) => p.nome);
  console.log("      perícias sem desafio: " + (orfas.join(", ") || "nenhuma"));
  t("nenhuma perícia da ficha ficou órfã", orfas.length === 0);
  t("e o catálogo cresceu de verdade", DESAFIOS.length >= 30);
  t("todo desafio sabe ensinar como se diz", DESAFIOS.every((d) => comoSeDiz(d.id)));
  t("todo desafio tem um custo de falha escrito", DESAFIOS.every((d) => !!custoPorAlvo(d.alvo) || d.social));
  t("ids únicos", new Set(DESAFIOS.map((d) => d.id)).size === DESAFIOS.length);
  t("alvos únicos — a chave do livro de tentativas depende disso",
    new Set(DESAFIOS.map((d) => d.alvo)).size === DESAFIOS.length);
}

sec("20. A LEVA NOVA — cada uma reconhece o seu, e recusa o vizinho");
{
  const ctx = { personagem: ladino, semente: SEM, lugar: "o corredor", tentativas: {}, dia: 1 };
  const casos = [
    ["desarmo a armadilha antes de pisar nela", "desarmar", "prestidigitacao"],
    ["atravesso a nado até a outra margem", "nadar", "atletismo"],
    ["salto o vão até o outro telhado", "saltar", "atletismo"],
    ["empurro a pedra que trava a passagem", "forcar", "atletismo"],
    ["atravesso a viga sem olhar para baixo", "equilibrio", "acrobacia"],
    ["me solto das cordas torcendo os pulsos", "escapar", "acrobacia"],
    ["seguro o fôlego e sigo em frente", "aguentar", "fortitude"],
    ["esporeio o cavalo por dentro do bosque", "cavalgar", "montaria"],
    ["acalmo o cavalo que empinou", "acalmar_bicho", "montaria"],
    ["canto para a taverna inteira", "atuar", "atuacao"],
    ["leio o céu para achar o rumo", "orientar", "sobrevivencia"],
    ["examino o corpo para saber de que ele morreu", "diagnosticar", "medicina"],
    ["reconheço esse brasão", "heraldica", "saberes"],
    ["falsifico o salvo-conduto", "falsificar", "enganacao"],
    ["sigo ele de longe, sem ser notado", "seguir_alguem", "furtividade"],
  ];
  for (const [frase, id, per] of casos) {
    const v = lerAcao(frase, ctx);
    t(`"${frase}" → ${id}`, v && v.tipo === "teste" && v.id === id && v.pericia === per);
  }

  /* AS VIZINHAS. `buscar` é a primeira entrada do catálogo e rouba tudo que
     diz "examino" ou "procuro" — cada leva nova devolve para ela uma
     palavra que precisa recuar. */
  t("examinar um corpo é Medicina, não vasculhar", lerAcao("examino o corpo", ctx).id === "diagnosticar");
  t("procurar água no ermo é Sobrevivência", lerAcao("procuro água", ctx).id === "orientar");
  t("mas revirar o quarto continua sendo busca", lerAcao("reviro o quarto", ctx).id === "buscar");
  t("forçar a porta continua sendo a tranca, não o peso", lerAcao("forço a porta", ctx).id === "tranca");
  t("e empurrar a pedra é peso, não tranca", lerAcao("empurro a pedra", ctx).id === "forcar");
  t("seguir pegadas é rastro; seguir alguém é furtividade",
    lerAcao("sigo as pegadas na lama", ctx).id === "rastrear" && lerAcao("sigo ele de longe", ctx).id === "seguir_alguem");
}

sec("21. O QUE CAI — as novas que terminam no chão");
{
  const ctx = { personagem: heroi, semente: SEM, lugar: "o telhado", tentativas: {}, dia: 1 };
  for (const [frase, id] of [["salto o vão", "saltar"], ["atravesso a viga", "equilibrio"], ["esporeio o cavalo", "cavalgar"]]) {
    const v = lerAcao(frase, ctx);
    t(`${id} sabe de que altura se cai`, !!v.queda && v.queda.metros >= 2);
    t(`e falhar feio em ${id} é cair`, desfechoDaFalha(v, v.dc - 6, v.dc).pele.queda === true);
  }
  t("mas escapar das cordas não derruba ninguém", lerAcao("me solto das cordas", ctx).queda === null);
}

sec("22. O QUE NÃO SE ROLA cresceu junto com o catálogo");
{
  const ctx = { personagem: heroi, semente: SEM, lugar: "o acampamento", tentativas: {}, dia: 1 };
  t("a lista dobrou", SEM_DADO.length >= 10);
  const casos = [
    "conto as moedas da bolsa", "leio a placa da estalagem", "monto a barraca",
    "pago a conta", "rezo pelos mortos", "amarro o cavalo", "respiro fundo",
    "acendo a fogueira", "assino o documento", "dou bom dia ao ferreiro",
  ];
  for (const c of casos) {
    const v = lerAcao(c, ctx);
    t(`"${c}" não vira teste`, !v || v.tipo === "livre");
  }
  /* e a régua do porquê: cada entrada explica por que não se rola */
  t("toda entrada explica a si mesma", naoPedeDado("conto as moedas").porque.length > 20);
  /* o outro lado da moeda: o esforço declarado continua rolando */
  t("mas 'monto no cavalo que empinou' ainda é montaria",
    lerAcao("acalmo o cavalo que empinou", ctx).tipo === "teste");
  t("e 'assino' não engole 'falsifico'", lerAcao("falsifico a assinatura", ctx).id === "falsificar");
}

console.log(`\ndesafios v9.67: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
