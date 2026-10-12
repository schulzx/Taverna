/* teste-mm-c0.mjs — MM-C · C0, as mãos (11/10)

   Os três consertos da 6.ª sessão de prova (`mente/mm11-sessao-6.md`,
   "Os 3 consertos de maior efeito"), cada um preso pela FRASE REAL da
   sessão — a do jogador ou a do Mestre —, de modo que esta suíte falha na
   árvore de antes e passa na de depois:

     1. uma pergunta é uma pergunta; o alvo sai do que o Mestre mostrou; a
        luta que só a prosa começou é vetada no canal dinâmico;
     2. o marco fecha pelo fato, na ordem do ato; o herói e a descrição não
        são gente; o sítio do marco não se troca pelo que a IA inventa;
     3. o que o jogador pagou, o jogo debita (a conta em dois passos), e a
        maçã não é a maça. */
let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? "  → " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const J = (x) => JSON.stringify(x);
const S = "../src/";

const R = await import(S + "rastro.js");
const A = await import(S + "agressao.js");
const C = await import(S + "crime.js");
const G = await import(S + "saga.js");
const M = await import(S + "missoes.js");
const L = await import(S + "lugar.js");
const N = await import(S + "npcs.js");
const B = await import(S + "bolsa-da-frase.js");

/* ============================================================ */
sec("1a. uma pergunta de rumo não abre viagem (J19)");
{
  const ctx = { cidades: ["Serra do Bode", "Fogão Queimada", "Rio do Sul"], cidadeAtual: "Serra do Bode" };
  const J19 = "Sigo Zeca para os fundos com Vando, e pergunto baixo: o que é o Fogão da Meia-Noite, como se chega a Fogão Queimada, e quanto tempo leva? E o que ele sabe do carroceiro que anda a recrutar gente por lá?";
  t("J19 (seguir o Zeca + a pergunta do caminho) não parte", R.detectarPartida(J19, ctx) === null, J(R.detectarPartida(J19, ctx)));
  t("a pergunta sozinha não parte", R.detectarPartida("Como se chega a Fogão Queimada, e quanto tempo leva?", ctx) === null);
  t("a partida com ponto de interrogação também é pergunta", R.detectarPartida("Sigo para Rio do Sul?", ctx) === null);
  t("pergunto o caminho e SIGO para Rio do Sul: parte (o verbo e a cidade na mesma oração)", (R.detectarPartida("pergunto o caminho e sigo para Rio do Sul", ctx) || {}).destino === "Rio do Sul");
  t("o plural parte: \"Saímos para Fogão Queimada agora\"", (R.detectarPartida("Saímos para Fogão Queimada agora.", ctx) || {}).destino === "Fogão Queimada");
  t("\"Parto. Quero chegar a Rio do Sul\" continua a dar o destino", (R.detectarPartida("Parto. Quero chegar a Rio do Sul antes do anoitecer.", ctx) || {}).destino === "Rio do Sul");
  t("a cidade só dentro da oração que pergunta o rumo não é destino de outra",
    (R.detectarPartida("Pergunto ao guarda como se chega a Rio do Sul e saio pela estrada.", ctx) || {}).destino === "");
  t("os verbos de partida são tabela, com o plural", R.VERBOS_DE_PARTIDA.includes("saimos") && R.VERBOS_DE_PARTIDA.includes("seguimos") && !R.VERBOS_DE_PARTIDA.includes("vamos"));
  t("a regra da pergunta é tabela, com o porquê", R.PERGUNTA_NAO_PARTE.fim.test("leva?") && !!R.PERGUNTA_NAO_PARTE.porque);
  t("lixo não estoura", R.detectarPartida(null, ctx) === null && R.detectarPartida("", {}) === null);
}

sec("1b. o alvo do golpe sai do que o Mestre mostrou (M36–M39)");
{
  const presentes = [{ nome: "Dário da Cova", papel: "coveiro", relacao: "neutro" }, { nome: "Nira", papel: "coveiro", relacao: "neutro" }];
  const grupo = [{ nome: "Vando" }];
  const M36 = "Dário da Cova ergue o rosto, e pela primeira vez os olhos dele parecem menos cansados. \"Se é para ver morto, tem um cão sem pelo que anda pela paliçada norte desde a noite passada. Ronda a casa de Nira, o coveiro. Ele não dorme.\"";
  const M39 = "Você ergue o cajado, e a manhã parece prender a respiração. O cão sem pelo não avança: ele se move um passo para o lado, lento, as costelas subindo e descendo sob a pele cinzenta.";
  const recentes = [M36, "Fico em guarda, de cajado erguido.", M39];
  const ler = (txt, mostrado) => A.lerAgressao(txt, { presentes, grupo, recentes, mostrado });
  /* a frase da sessão: o "ele" ia ao último nome citado, Dário */
  const a1 = ler("Ataco o cão sem pelo antes que ele avance.", [M36, M39]);
  t("\"Ataco o cão sem pelo antes que ele avance\" vai ao cão, não a Dário", a1 && a1.tipo === "agressao" && a1.criatura && /^c[aã]o sem pelo$/i.test(a1.nome), J(a1));
  t("o nome é o da prosa, com acento", a1 && a1.nome === "Cão sem pelo", a1 && a1.nome);
  /* J37: Nira citada noutra oração, como lugar */
  const a2 = ler("Vou até a paliçada norte e procuro o cão sem pelo, perto da casa de Nira. Quando o vir, ataco primeiro.", [M36]);
  t("\"…perto da casa de Nira. Quando o vir, ataco primeiro\" vai ao cão, não a Nira", a2 && a2.criatura && a2.nome !== "Nira", J(a2));
  t("o pronome sem nome vai ao único bicho da última resposta", (ler("Ataco-o.", [M39]) || {}).criatura === true);
  t("o nome dito NA oração do golpe continua a mandar", (ler("Ataco Nira com o cajado.", [M39]) || {}).nome === "Nira");
  /* sem `mostrado` (o App de antes), o pronome vai ao último nome citado na
     conversa — Nira, a última nomeada no M36: é o defeito, preso aqui para
     se ver que a ordem nova só vale com o que o Mestre mostrou na mão */
  const antes = A.lerAgressao("Ataco o cão sem pelo antes que ele avance.", { presentes, grupo, recentes }) || {};
  t("sem o que o Mestre mostrou, o comportamento de antes (uma pessoa pelo pronome)", antes.tipo === "agressao" && !antes.criatura && ["Nira", "Dário da Cova"].includes(antes.nome), J(antes));
  t("o bicho que o Mestre NÃO mostrou não nasce da frase", (ler("Ataco o dragão.", [M39]) || {}).tipo === "semAlvoConhecido");
  t("o bicho do marco empresta nome e ameaça", J(A.criaturaMostrada("enfrento o cão", ["um Cão sem pelo"], [{ nome: "cão sem pelo", ameaca: "fraco" }])) === J({ nome: "cão sem pelo", ameaca: "fraco", criatura: true }));
  t("as cabeças de bicho são tabela", A.CRIATURA_NA_PROSA.cabecas.includes("cao") && A.CRIATURA_NA_PROSA.cabecas.includes("lagarto"));
  /* e o veredito do crime não morde o cão */
  t("atacar o bicho não é crime (o veredito antes do clique cala)", C.lerCrime(a1, { npcs: {}, presentes, grupo, hostis: [] }) === null && C.veredictoDoCrime(a1, { npcs: {}, presentes, grupo, hostis: [] }, {}) === "");
  t("criaturaMostrada com lixo devolve null", A.criaturaMostrada(null, null) === null && A.criaturaMostrada("ataco o lagarto", []) === null);
}

sec("1c. \"A luta começa\" sem combate aberto vira veto do turno (M47)");
{
  const J47 = "Respondo a Nira que sim, é ele, e que não o escute. Avanço pelo túnel com Vando e enfrento o que vier ao nosso encontro, sem recuar um passo.";
  const M47 = "Você responde sem desviar os olhos do lagarto que desce a parede. Não há recuo. A luta começa.";
  t("o J47 sem combate aberto leva o veto", A.vetoDaLutaSemPainel(J47, {}).length === 1);
  t("a prosa que já começou a luta leva o veto no turno seguinte", A.vetoDaLutaSemPainel("Olho em volta.", { mostrado: [M47] }).length === 1);
  t("com o painel aberto, nada a vetar", A.vetoDaLutaSemPainel(J47, { emCombate: true, mostrado: [M47] }).length === 0);
  t("turno sem luta à vista não custa um carácter", A.vetoDaLutaSemPainel("Bebo a cerveja.", { mostrado: ["Pipa serve a caneca."] }).length === 0);
  /* E4 (12/10): o veto já não manda o Narrador abrir a luta — quem a abre é
     o sistema (o golpe do jogador, a sala, a estrada, a lei). A guarda desta
     asserção era "nunca a luta sem painel", e continua; muda o remédio. */
  t("o veto manda parar antes do golpe, e já não pede combate_iniciar (tabela; E4)", !/combate_iniciar/.test(A.LUTA_SEM_PAINEL.veto) && /quem abre a luta é o sistema/.test(A.LUTA_SEM_PAINEL.veto) && /pare antes do primeiro golpe/.test(A.LUTA_SEM_PAINEL.veto) && A.vetoDaLutaSemPainel(J47, {})[0] === A.LUTA_SEM_PAINEL.veto);
  t("lixo não estoura", A.vetoDaLutaSemPainel(null, null).length === 0);
}

/* ============================================================ */
const marco = (o) => ({ id: o.id, feitio: o.feitio, titulo: o.titulo || o.id, quem: o.quem || "", alvo: o.alvo || "", onde: o.onde || "", cidade: o.cidade || "", quantos: 1, condicao: o.condicao, feito: false, ...(o.extra || {}) });
const ESP = {
  estrutura: "jornada", semente: "s6",
  atos: [
    { ato: 0, marcos: [
      marco({ id: "m1", feitio: "procurar", quem: "Elmo", onde: "Posto da Baixa", cidade: "Serra do Bode", condicao: { tipo: "falar_com", alvo: "Elmo" }, extra: { batida: { cena: "Elmo no posto", emJogo: "a tábua", pergunta: "o que Elmo pede?" } } }),
      marco({ id: "m2", feitio: "descobrir", onde: "Fogueira da Beira", cidade: "Fogão Queimada", condicao: { tipo: "revelar", alvo: "Fogueira da Beira", chave: "Fogão Queimada|fogueira" }, extra: { segredo: { coisa: "um livro de contas com uma página arrancada", diz: "alguém paga", acha: "Percepção", dc: 13 } } }),
      marco({ id: "m3", feitio: "procurar", quem: "Dário da Cova", onde: "Fogueira da Beira", cidade: "Fogão Queimada", condicao: { tipo: "falar_com", alvo: "Dário da Cova" }, extra: { batida: { cena: "Dário", emJogo: "a irmã", pergunta: "o que ele teme?" } } }),
    ] },
    { ato: 4, marcos: [
      marco({ id: "m9", feitio: "descobrir", onde: "Banca do Avesso", cidade: "Serra do Bode", condicao: { tipo: "revelar", alvo: "Banca do Avesso", chave: "Serra do Bode|banca" } }),
    ] },
  ],
};
const ver = (cond, m) => M.etapaDef(cond.tipo).ver(cond, m);

sec("2a. marco de outro ato não fecha (o ato 4 no turno 8)");
{
  const mundo = { cidadeAtual: "Serra do Bode", lugarAtual: { nome: "Banca do Avesso", cidade: "Serra do Bode" }, revelados: ["Serra do Bode|banca"], npcs: {} };
  const r = G.conferirEspinha(ESP, mundo, ver, { ato: 0 });
  t("com o arco no ato 0, \"O que Banca do Avesso esconde\" (ato 4) fica de pé", !r.cumpridos.some((m) => m.id === "m9"), J(r.cumpridos.map((m) => m.id)));
  t("sem `ato`, a conferência de sempre (fecha por presença)", G.conferirEspinha(ESP, mundo, ver).cumpridos.some((m) => m.id === "m9"));
  t("no ato 4, fecha", G.conferirEspinha(ESP, mundo, ver, { ato: 4 }).cumpridos.some((m) => m.id === "m9"));
}

sec("2b. descobrir e procurar fecham pelo fato, não pela chegada");
{
  const fatos = G.fatosQueFecham(ESP);
  t("os fatos da espinha: o lugar com segredo e as pessoas com batida", J(fatos) === J({ lugares: ["Fogueira da Beira"], pessoas: ["Elmo", "Dário da Cova"] }), J(fatos));
  t("lixo dá listas vazias", J(G.fatosQueFecham(null)) === J({ lugares: [], pessoas: [] }));
  const npcs = { "Dário da Cova": { nome: "Dário da Cova", conhecidoEm: 3, local: "Fogueira da Beira" } };
  const chegada = { cidadeAtual: "Fogão Queimada", lugarAtual: { nome: "Fogueira da Beira", cidade: "Fogão Queimada" }, revelados: ["Fogão Queimada|fogueira"], npcs, soPeloFato: fatos, falouCom: [], segredosRevelados: [] };
  const r0 = G.conferirEspinha(ESP, chegada, ver, { ato: 0 });
  t("NA CHEGADA à Fogueira da Beira, nem o segredo nem Dário fecham", r0.cumpridos.length === 0, J(r0.cumpridos.map((m) => m.id)));
  const semFato = { ...chegada, soPeloFato: undefined };
  t("(sem `soPeloFato`, a régua antiga fechava os dois na chegada)", G.conferirEspinha(ESP, semFato, ver, { ato: 0 }).cumpridos.length === 2);
  const falou = G.conferirEspinha(ESP, { ...chegada, falouCom: ["Dário da Cova"] }, ver, { ato: 0 });
  t("falar com Dário frente a frente fecha \"Encontrar Dário\"", falou.cumpridos.map((m) => m.id).join() === "m3", J(falou.cumpridos.map((m) => m.id)));
  /* o fato do segredo: o teste que passou, ou a pista dada */
  const passou = G.segredosReveladosNoTurno(ESP, { lugar: "Fogueira da Beira", teste: { pericia: "Percepção", sucesso: true } });
  t("o teste de Percepção que passou, no lugar, revela o segredo", J(passou) === J(["Fogueira da Beira"]), J(passou));
  t("o teste que falhou não revela (falhar custa tempo, não o segredo)", G.segredosReveladosNoTurno(ESP, { lugar: "Fogueira da Beira", teste: { pericia: "percepcao", sucesso: false } }).length === 0);
  t("fora do lugar, nem o teste revela", G.segredosReveladosNoTurno(ESP, { lugar: "Posto da Baixa", teste: { pericia: "percepcao", sucesso: true } }).length === 0);
  t("a pista dada na prosa revela", G.segredosReveladosNoTurno(ESP, { lugar: "a Fogueira da Beira", narrativa: "Debaixo da tábua solta há um livro de contas, e uma página foi arrancada à pressa." }).length === 1);
  t("a prosa que não diz a coisa não revela", G.segredosReveladosNoTurno(ESP, { lugar: "Fogueira da Beira", narrativa: "Dário olha para a tábua e cala." }).length === 0);
  const desc = G.conferirEspinha(ESP, { ...chegada, segredosRevelados: passou }, ver, { ato: 0 });
  t("com o segredo revelado neste turno, \"O que Fogueira da Beira esconde\" fecha", desc.cumpridos.map((m) => m.id).join() === "m2", J(desc.cumpridos.map((m) => m.id)));
  t("as perícias que procuram e a pista são tabela", G.PERICIAS_QUE_ACHAM.includes("investigacao") && G.PISTA_DADA.palavrasMinimas >= 1);
  /* a missão do fio nasce da MESMA condição — e espera o mesmo fato */
  const etapa = { tipo: "revelar", alvo: "Fogueira da Beira", chave: "Fogão Queimada|fogueira" };
  t("a etapa da missão com o mesmo lugar também espera o fato", !M.etapaDef("revelar").ver(etapa, chegada) && M.etapaDef("revelar").ver(etapa, { ...chegada, segredosRevelados: ["Fogueira da Beira"] }));
  t("a tarefa de guilda (lugar fora da espinha) continua pela régua de sempre",
    M.etapaDef("revelar").ver({ tipo: "revelar", alvo: "O Cofre", chave: "Fogão Queimada|cofre" }, { ...chegada, lugarAtual: { nome: "O Cofre", cidade: "Fogão Queimada" }, revelados: ["Fogão Queimada|cofre"] }));
}

sec("2c. Encontrar Elmo: a conversa vale com o lugar inventado (M31–M34)");
{
  const fatos = G.fatosQueFecham(ESP);
  const mundo = { cidadeAtual: "Serra do Bode", lugarAtual: { nome: "o posto da estrada", cidade: "Fogão Queimada" }, npcs: {}, soPeloFato: fatos, falouCom: ["Elmo"] };
  const r = G.conferirEspinha(ESP, mundo, ver, { ato: 0 });
  t("falar com Elmo em Serra do Bode fecha o marco, mesmo com o lugar do save a dizer outra cidade", r.cumpridos.some((m) => m.id === "m1"), J(r.cumpridos.map((m) => m.id)));
  t("e a conversa noutra cidade continua a não valer", !G.conferirEspinha(ESP, { ...mundo, cidadeAtual: "Rio do Sul", lugarAtual: { nome: "praça", cidade: "Rio do Sul" } }, ver, { ato: 0 }).cumpridos.some((m) => m.id === "m1"));
}

sec("2d. o sítio do marco não se troca pelo que a IA inventa (M30–M31)");
{
  const J31 = "Respondo que sim, venho atrás do que ele guarda, e agradeço. Sem mais paradas, Vando e eu seguimos direto até Serra do Bode e chegamos ao Posto da Baixa. Entro e procuro Elmo.";
  const posto = { nome: "o posto da estrada", distancia: "perto", cidade: "Fogão Queimada" };
  const r1 = L.lerLugarDito("o posto da estrada", { fonte: "cronista", lugar: posto, cidade: "Serra do Bode", pedido: J31, doMarco: ["Posto da Baixa"] });
  t("o J31 pede o Posto da Baixa e a IA diz \"o posto da estrada\": vale o do pedido", r1.acao === "novo" && r1.nome === "Posto da Baixa" && r1.porque === L.LUGAR_DO_MARCO.pedido, J(r1));
  t("(sem `doMarco`, ficava o inventado)", L.lerLugarDito("o posto da estrada", { fonte: "cronista", lugar: posto, cidade: "Serra do Bode", pedido: J31 }).nome === undefined);
  const noPosto = { nome: "Posto da Baixa", distancia: "dentro", cidade: "Serra do Bode" };
  t("já no sítio do marco, um nome inventado sem pedido não move", L.lerLugarDito("o posto da estrada", { fonte: "mestre", lugar: noPosto, cidade: "Serra do Bode", pedido: "Pergunto a Elmo o que quer.", doMarco: ["Posto da Baixa"] }).acao === "ignora");
  t("o pedido do jogador para outro sítio continua a valer", L.lerLugarDito("a ferraria", { fonte: "mestre", lugar: noPosto, cidade: "Serra do Bode", pedido: "Vou até a ferraria.", doMarco: ["Posto da Baixa"] }).acao === "novo");
}

sec("2e. o herói e a descrição nunca são gente do registo");
{
  const reg = { Bento: { nome: "Bento", papel: "carroceiro", local: "Fogão Queimada" } };
  const ctx = { heroi: "Tamsin", aqui: ["Fogão Queimada"] };
  t("\"Tamsin\" (o \"E aí, Tamsin?\" de Vando) é recusada: é a heroína", N.nomeComDono("Tamsin", reg, ctx).motivo === "heroi");
  t("o nome inteiro da heroína também", N.nomeComDono("Tamsin Vael", reg, { heroi: "Tamsin Vael" }).decisao === "recusada");
  t("\"o homem que manda\" é descrição, não pessoa", N.nomeComDono("o homem que manda", reg, ctx).motivo === "descritor");
  t("\"o carroceiro\" funde-se com o único carroceiro da cena", N.nomeComDono("o carroceiro", reg, ctx).nome === "Bento");
  t("sem um dono do ofício, \"o mercador viajante\" fica sem ficha", N.nomeComDono("o mercador viajante", reg, ctx).decisao === "recusada");
  t("nome próprio passa (Elmo, Pipa do Espinho, O Torto)", ["Elmo", "Pipa do Espinho", "O Torto"].every((n) => N.nomeComDono(n, reg, ctx).decisao === "nova"));
  t("a nota ao Narrador diz a saída de cada um (tabela)", N.notaDoHomonimo([N.nomeComDono("o homem que manda", reg, ctx)]).includes(N.SAIDA_DO_HOMONIMO.descritor));
  t("ehDescritor: lixo é não", !N.ehDescritor(null) && !N.ehDescritor(3) && N.ehDescritor("o carroceiro") && !N.ehDescritor("Dário da Cova"));
  t("a régua do nome próprio é tabela", N.QUEM_NAO_E_GENTE.maiuscula.test("É") && N.QUEM_NAO_E_GENTE.curto >= 2);
}

/* ============================================================ */
sec("3. o que o jogador pagou, o jogo debita (J7–J8, J12, J23)");
{
  const balcao = [{ id: "tochas", nome: "Tochas", preco: 1 }, { id: "racoes", nome: "Rações", preco: 2 }, { id: "kit", nome: "Kit de viagem", preco: 35 }, { id: "agua", nome: "Odre", preco: 1 }];
  const J7 = "Deixo o mural. Vou à banca de um mercador qualquer e compro duas tochas e uma corda de cinco braças. Quanto é? Pago e guardo na mochila.";
  const J8 = "Sim, amarre as tochas. Pago as sete fichas, e já enfio tudo na mochila.";
  t("J7 pergunta o preço: o balcão responde, não vende", B.compraNaFrase(J7, { balcao, bolsa: 14 }) === null);
  const c8 = B.compraNaFrase(J8, { balcao, bolsa: 14, anterior: J7 });
  t("J8 (\"Pago as sete fichas\") herda as tochas e a corda do J7", c8 && c8.itens.map((x) => x.id).join() === "tochas,kit" && c8.total === 37, J(c8));
  t("e não fecha: a bolsa não chega a ◉ 37", c8 && !c8.fecha && c8.porque === "sem_fundos");
  t("a linha de jogo diz a conta, sem falar do sistema", /◉ 37/.test(B.falaDaCompra(c8)) && !/sistema/i.test(B.falaDaCompra(c8)));
  t("o veto do turno chega ao Narrador", B.vetoDaCompra(c8).length === 1);
  t("(sem a frase anterior, o \"pago\" sozinho não compra nada — o de antes)", B.compraNaFrase(J8, { balcao, bolsa: 14 }) === null);
  const c8b = B.compraNaFrase(J8, { balcao, bolsa: 60, anterior: J7 });
  t("com a bolsa a chegar mas \"sete\" ditos, sete não paga trinta e sete", c8b && c8b.porque === "pouco");
  t("\"Pago.\" depois do preço fecha ao preço do balcão", (B.compraNaFrase("Pago.", { balcao, bolsa: 60, anterior: J7 }) || {}).fecha === true);
  t("a frase anterior que não falou de compra não empresta item", B.compraNaFrase("Pago.", { balcao, bolsa: 60, anterior: "Olho as tochas acesas na parede." }) === null);
  /* J12: a maçã */
  t("\"Compro uma maçã de uma vendedora ambulante\" não é a maça das armas", B.compraNaFrase("Compro uma maçã de uma vendedora ambulante e como sentada na fonte, vendendo o povo passar.", { balcao, bolsa: 14 }) === null);
  t("a maça de guerra continua a ser das bancas", (B.compraNaFrase("Compro uma maça de guerra.", { balcao, bolsa: 14 }) || {}).porque === "so_banca");
  /* E1 (12/10): a tabela mudou-se para economia.js — bolsa-da-frase.js e
     mercado.js liam-na em círculo, e o mercado ficava sem ela (o "não há
     macas" do J13). A asserção segue a tabela para a casa nova. */
  t("o que o acento separa é tabela", (await import(S + "economia.js")).O_ACENTO_SEPARA.length >= 1);
  /* J23: o item na mesma frase, a quantia dita é teto */
  const c23 = B.compraNaFrase("Pago as sete fichas ao vendedor e guardo as duas tochas e as três rações na mochila.", { balcao, bolsa: 14 });
  t("J23: duas tochas e três rações custam ◉ 8, e sete não paga", c23 && c23.total === 8 && c23.porque === "pouco", J(c23));
}

console.log(`\nmm-c0: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
