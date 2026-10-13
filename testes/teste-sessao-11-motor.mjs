/* teste-sessao-11-motor.mjs — os consertos de motor da 11.ª sessão de prova (13/10)

   `mente/mm11-sessao-11.md` ("O eco", "A coerência", "Os defeitos" 1, 5,
   6, 9 e 11, "Os 3 consertos"), cada conserto preso ao que a sessão deu de
   verdade — as frases do jogador (M10, M24, M52), as falas que o Mestre pôs
   em boca alheia (M8) e os nomes do registo (M3–M7, M50). Falha na árvore
   de antes (v9.466) e passa na de depois:

     1. a viagem lida de palavras: "Ainda nem saímos de Bela do Rio quando
        eu a deixei com a sentinela" e "Vou até o batedor de Bela do Rio"
        abriam jornadas de 4 h (rastro.js, resolver.js);
     2. o eco: a ameaça que o Mestre pôs na boca de Branca voltava como
        ENCONTRO DO TRECHO — "alguém traz notícia de '…'" (fios-da-estrada.js);
     3. o acampamento: o botão prometia "PV e PM cheios" com a noite já
        gasta, e a pauta dizia "restaurados (parcialmente)" com o PV a 1/12
        (descanso.js);
     4. "Sujeito de braço magro", "Vulto da faca" e "Homem de lâmina" viravam
        fichas, e o mural pregava um segundo Gualtério (npcs.js, ofertas.js);
     5. "Arrasto o barril": dif. 15, 15 = 15, −3 PV, e o cartão dizia só
        "falhar fere" (desafios.js);
     6. o degrau que cobra pedia "com o nome dito" sem dar o nome — e o
        Mestre deu-lhe um, Godofredo, por cima do Tristão do save (escuta.js). */
let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => { if (typeof cond === "function") { try { cond = cond(); } catch (e) { extra = String(e && e.message); cond = false; } } if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? "  → " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const S = "../src/";
const J = JSON.stringify;

const R = await import(S + "rastro.js");
const RV = await import(S + "resolver.js");
const F = await import(S + "fios-da-estrada.js");
const PR = await import(S + "prometido.js");
const DS = await import(S + "descanso.js");
const N = await import(S + "npcs.js");
const OF = await import(S + "ofertas.js");
const D = await import(S + "desafios.js");
const E = await import(S + "escuta.js");
/* o que esta etapa trouxe, lido com rede: na árvore de antes falta, e a
   suíte tem de FALHAR asserção a asserção — não estourar na primeira. A
   rede da oferta é o que o App fazia antes (o botão prometia sempre). */
const ofertaDoAcampamento = DS.ofertaDoAcampamento || (() => ({ tipo: "longo", preco: "uma noite", retorno: "PV e PM cheios" }));
const reciboDoDescanso = DS.reciboDoDescanso || (({ tipo } = {}) => `PV e PM já foram restaurados pelo sistema (${tipo === "longo" ? "totalmente" : "parcialmente"})`);

/* ---------------- o mundo da sessão ---------------- */
const CIDADES = ["Bela do Rio", "Alto das Pedras", "Alto Velho"];
const MAPA = { cidades: CIDADES.map((nome, i) => ({ nome, x: 20 + i * 30, y: 40 })) };
const NO_ESCUDO = { cidades: CIDADES, cidadeAtual: "Alto das Pedras" };
/* M10 — o herói no Escudo Rachado, a lembrar a véspera */
const J10 = "Devolvo a medalha na saída, como prometi. Ainda nem saímos de Bela do Rio quando eu a deixei com a sentinela.";
/* M24 — o batedor estava ali, à frente dele */
const J24 = "Vou até o batedor de Bela do Rio e pergunto o que ele viu.";

sec("1. a viagem lida de palavras (M10, M24)");
{
  t("M10: \"ainda nem saímos de Bela do Rio\" não parte", R.detectarPartida(J10, NO_ESCUDO) === null, J(R.detectarPartida(J10, NO_ESCUDO)));
  t("M24: \"vou até o batedor de Bela do Rio\" não parte", R.detectarPartida(J24, NO_ESCUDO) === null, J(R.detectarPartida(J24, NO_ESCUDO)));
  const r24 = RV.resolverLugar(J24, MAPA, { excluir: "Alto das Pedras" });
  t("M24: e o resolver (a porta do \"vou até\") não acha Bela do Rio", r24.tipo !== "achei", r24.tipo);
  const comBatedor = RV.resolverLugar("Vou até o batedor.", MAPA, { excluir: "Alto das Pedras", extra: [{ cidade: "Bela do Rio", termos: ["batedor"], porque: "o batedor mora lá" }] });
  t("\"vou até o batedor\" não viaja para a cidade onde o cânone o pôs (a pessoa é o alvo)", comBatedor.tipo !== "achei", comBatedor.tipo);
  const ondeMora = RV.resolverLugar("Quero ir para a cidade onde mora o batedor.", MAPA, { excluir: "Alto das Pedras", extra: [{ cidade: "Bela do Rio", termos: ["batedor"], porque: "o batedor mora lá" }] });
  t("…mas \"a cidade onde mora o batedor\" continua a ser destino", ondeMora.tipo === "achei" && ondeMora.escolha.cidade.nome === "Bela do Rio", ondeMora.tipo);
  /* o que tem de continuar a partir */
  const vai = (f) => (R.detectarPartida(f, NO_ESCUDO) || {}).destino || "";
  t("\"Parto para Bela do Rio\" parte", vai("Parto para Bela do Rio.") === "Bela do Rio");
  t("\"Vou até Bela do Rio\" parte", vai("Vou até Bela do Rio.") === "Bela do Rio");
  t("\"Saio de Alto das Pedras rumo a Bela do Rio\" parte (o de é a origem, o rumo é o destino)", vai("Saio de Alto das Pedras rumo a Bela do Rio.") === "Bela do Rio");
  t("\"Sigo pela estrada até as portas de Bela do Rio\" parte", vai("Sigo pela estrada até as portas de Bela do Rio.") === "Bela do Rio");
  t("\"Viajamos de volta para Bela do Rio\" parte", vai("Viajamos de volta para Bela do Rio.") === "Bela do Rio");
  t("o resolver ainda acha \"Vou até Bela do Rio\"", RV.resolverLugar("Vou até Bela do Rio.", MAPA, { excluir: "Alto das Pedras" }).tipo === "achei");
  /* e o que não parte */
  t("a negação não parte (\"Não vou para Bela do Rio hoje\")", R.detectarPartida("Não vou para Bela do Rio hoje.", NO_ESCUDO) === null);
  t("a fala entre aspas não parte", R.detectarPartida("Digo a Gualtério: \"Partimos para Bela do Rio ao amanhecer.\" E fico a olhar o fogo.", NO_ESCUDO) === null);
  t("a régua é tabela, com o porquê", !!R.CIDADE_COMO_DESTINO && R.CIDADE_COMO_DESTINO.rumo.test("vou para ") && !R.CIDADE_COMO_DESTINO.rumo.test("o batedor de ") && !!R.CIDADE_COMO_DESTINO.porque);
  t("cidadeEhDestino lê a oração (e o lixo não estoura)", typeof R.cidadeEhDestino === "function" && R.cidadeEhDestino("parto para bela do rio", "bela do rio") && !R.cidadeEhDestino("saimos de bela do rio", "bela do rio") && R.cidadeEhDestino(null, "") === false);
  t("na estrada sem destino, \"o batedor de Bela do Rio\" não dá destino", (() => {
    const seg = R.detectarSeguirViagem("Sigo viagem com o batedor de Bela do Rio.", { emViagem: true, cidades: CIDADES, jornada: { de: "Alto das Pedras", para: "" } });
    return !seg || !seg.destino;
  })());
}

sec("2. o eco: a fala que o Mestre inventou não volta como fato (M8, M10, M17, M44)");
{
  /* M8 — o que o Cronista guardou da prosa do Mestre */
  const pr = PR.guardarSementes(null, [{ tipo: "ameaca", texto: "Devolve na saída ou perde as orelhas no pelourinho", quem: "Branca Pau Seco" }]).estado;
  const FIO = [{ nome: "Berengária Passo Largo", tipo: "pessoa" }, { nome: "O Escudo Rachado", tipo: "lugar" }];
  const viajante = F.encontroComFio({ tipo: "viajante", detalhe: "(da tabela)" }, { fio: FIO, prometido: pr });
  t("o viajante traz notícia do que o sistema decidiu (Berengária), não da ameaça de Branca", /Berengária Passo Largo/.test(viajante.detalhe) && !/orelhas/.test(viajante.detalhe), viajante.detalhe);
  const sinal = F.encontroComFio({ tipo: "cena", detalhe: "(da tabela)" }, { fio: FIO, prometido: pr });
  t("o sinal na estrada também (a forca e a fita azul não nascem dele)", !/orelhas/.test(sinal.detalhe), sinal.detalhe);
  const soAFala = F.encontroComFio({ tipo: "viajante", detalhe: "(da tabela)" }, { fio: [], prometido: pr });
  t("sem fio do sistema, o encontro fica com a tabela (não com a fala)", soAFala.detalhe === "(da tabela)" && !soAFala.tema, soAFala.detalhe);
  const calmo = F.encontroComFio({ tipo: "tranquilo", detalhe: "(da tabela)" }, { fio: [], prometido: pr });
  t("a conversa do caminho pode voltar à fala — marcada como dita, não fato", /orelhas/.test(calmo.detalhe) && /dito por Branca Pau Seco: palavra, não fato/.test(calmo.detalhe), calmo.detalhe);
  const noite = F.linhaDoAcampamento({ fio: [], prometido: pr, grupo: ["Gualtério"] });
  t("a noite do acampamento idem", /dito por Branca Pau Seco: palavra, não fato/.test(noite), noite);
  const env = ["[RUMOR] Um boato: a Ronda corta as orelhas no pelourinho a quem não paga"];
  const fe = F.fiosNovosNaEstrada(env, { naEstrada: true, fio: [], prometido: pr });
  t("o fio novo amarrado a uma fala diz que ela é palavra, e não a confirma", fe.ficam.length === 1 && /dito por Branca Pau Seco/.test(fe.ficam[0]) && /sem dar o dito por verdade/.test(fe.ficam[0]), J(fe.ficam));
  t("a regra é tabela: o que AFIRMA só toma do sistema", !!F.O_ECO && F.O_ECO.afirma.viajante === true && F.O_ECO.afirma.cena === true && F.O_ECO.afirma.tranquilo === false && !!F.O_ECO.porque);
  t("lixo não estoura", typeof F.encontroComFio(null, null) === "object" && F.linhaDoAcampamento(null) === "");
}

sec("3. o acampamento que promete e não cura (M40–M42, M60–M63)");
{
  /* o herói da sessão: 1/12 PV, o dado de vida gasto, a noite já dormida */
  const heroi = { nivel: 1, vida: 1, vidaMax: 12, mana: 0, manaMax: 0, dadosVida: { total: 1, gastos: 1 }, ultimoLongo: 3 };
  const of1 = ofertaDoAcampamento(heroi, 3, {});
  t("já dormiu, sem dado de vida nem PM a recuperar: o botão não promete nada (não há oferta)", of1 === null, J(of1));
  const comDado = { ...heroi, dadosVida: { total: 1, gastos: 0 } };
  const of2 = ofertaDoAcampamento(comDado, 3, {});
  t("já dormiu, com um dado de vida: só um curto, ao preço de uma hora — nunca \"PV e PM cheios\"", !!of2 && of2.tipo === "curto" && of2.preco === "uma hora" && !/cheios/.test(of2.retorno), J(of2));
  const of3 = ofertaDoAcampamento(heroi, 4, {});
  t("noite livre: a noite inteira, PV e PM cheios", !!of3 && of3.tipo === "longo" && of3.retorno === "PV e PM cheios", J(of3));
  const of4 = ofertaDoAcampamento(heroi, 4, { cura: "Envenenado" });
  t("noite livre com condição: diz o que cura", !!of4 && /Envenenado/.test(of4.retorno), J(of4));
  /* o recibo: a ficha antes e depois, nunca o nome do descanso */
  const curto = DS.aplicarCurto(comDado).pers;
  const rc = reciboDoDescanso({ antes: comDado, depois: curto, tipo: "curto", pedido: "longo" });
  t("o curto que não deu PV diz que não deu, com o número, e proíbe a cura narrada", /NÃO subiu/.test(rc) && /1\/12 PV/.test(rc) && /NÃO narre cura/.test(rc) && !/restaurad/.test(rc), rc);
  t("e diz porquê (já tinha dormido hoje)", /já tinha dormido/.test(rc), rc);
  const longo = DS.aplicarLongo(heroi, 4).pers;
  const rl = reciboDoDescanso({ antes: heroi, depois: longo, tipo: "longo" });
  t("o longo diz o que de facto subiu", /subiu de 1 para 12\/12 PV/.test(rl), rl);
  const comDadoGasto = { ...comDado, vida: 5 };
  const rd = reciboDoDescanso({ antes: comDado, depois: comDadoGasto, tipo: "nenhum" });
  t("o dado de vida gasto no acampamento conta como cura, mesmo sem descanso (M42)", /subiu de 1 para 5\/12 PV/.test(rd) && /NÃO houve descanso/.test(rd), rd);
  t("a conta é tabela", !!DS.VEREDITO_DO_DESCANSO && DS.VEREDITO_DO_DESCANSO.longo.retorno === "PV e PM cheios" && !!DS.VEREDITO_DO_DESCANSO.porque);
  t("lixo não estoura", ofertaDoAcampamento(null, 0) !== undefined && typeof reciboDoDescanso({}) === "string" && typeof reciboDoDescanso() === "string");
}

sec("4. fichas e pessoas duplicadas (M3–M7, M53)");
{
  const reg = { Venceslau: { nome: "Venceslau", papel: "vendedor de rações", local: "o mercado, Bela do Rio" } };
  for (const nome of ["Sujeito de braço magro", "Vulto da faca", "Homem de lâmina"]) {
    const d = N.nomeComDono(nome, reg, { aqui: ["o mercado de Bela do Rio"] });
    t(`"${nome}" não vira ficha nova`, d.decisao !== "nova", J(d));
  }
  t("\"Venceslau\" continua a ser ele", N.nomeComDono("Venceslau", reg, {}).decisao !== "recusada");
  t("o nome próprio depois do substantivo comum ainda é nome (\"Mulher de Branco\")", N.ehDescritor("Mulher de Branco") === false);
  t("e o epíteto sozinho continua a ser alcunha (\"Vulto\")", N.ehDescritor("Vulto") === false);
  t("a régua é tabela", Array.isArray(N.GENTE_SEM_NOME) && N.GENTE_SEM_NOME.includes("sujeito") && N.GENTE_SEM_NOME.includes("vulto"));
  /* M3 — o mural pregou "Gualtério do Vale Fundo" com o Gualtério no grupo */
  const hist = OF.genteDaHistoria({ grupo: [{ nome: "Gualtério" }] });
  t("quem anda comigo entra na gente da história", hist.includes("Gualtério"), J(hist));
  t("e o mural não prega o homónimo dele (\"Gualtério do Vale Fundo\")", OF.ehDaHistoria("Gualtério do Vale Fundo", { historia: hist }) === true);
  t("lixo no grupo não estoura", Array.isArray(OF.genteDaHistoria({ grupo: [null, 3, "", {}] })));
}

sec("5. o sucesso por um fio diz o preço antes (M52)");
{
  const ctx = { personagem: { atributos: {} }, semente: "s11", lugar: "o Escudo Rachado" };
  const v = D.lerAcao("Arrasto o barril para longe do alçapão.", ctx);
  t("a frase da sessão: Atletismo, dif. 15", !!v && v.pericia === "atletismo" && v.dc === 15, J(v && { p: v.pericia, dc: v.dc }));
  const pago = v && D.desfechoDaMargem(v, { total: 15, dc: 15, sorte: () => 0.4 });
  t("15 = 15 é o sucesso pago (faixa \"mas\"), e paga PV", !!pago && pago.faixa === "mas" && pago.pele && pago.pele.dano > 0, J(pago));
  const risco = (v && v.escolha && v.escolha.risco) || "";
  t("o cartão diz que passar por um fio fere — antes do dado", /passar por um fio fere: até 6 PV/.test(risco), risco);
  t("e não diz \"falhar fere\" quando a falha seca não fere", !/^falhar fere/.test(risco), risco);
  const arm = D.escolhaDoTeste({ tipo: "teste", alvoDoCusto: "armadilha", dc: 15 });
  t("quando os dois lados ferem, diz os dois", /falhar ou passar por um fio fere/.test(arm.risco), arm.risco);
  const med = D.escolhaDoTeste({ tipo: "teste", alvoDoCusto: "medicina", dc: 13 });
  t("e quando o raspão não custa (sem meio), fica \"falhar\"", /^falhar deixa o corpo/.test(med.risco) && med.custaNoFio === false, med.risco);
  t("a régua é tabela", D.ESCOLHA_DO_TESTE.quando.fio === "passar por um fio" && D.ESCOLHA_DO_TESTE.quando.ambos === "falhar ou passar por um fio");
}

sec("6. o antagonista sem nome não é convite a dar-lhe um (M50–M56)");
{
  const ABERTURA = { principalId: "mis_principal", cidade: "Alto das Pedras", titulo: "O que O Escudo Rachado guarda",
    pista: { nome: "Berengária Passo Largo", papel: "taverneira", local: "O Escudo Rachado" },
    alvo: { feitio: "procurar", quem: "Berengária Passo Largo", onde: "O Escudo Rachado", origem: "Bela do Rio" } };
  const cobra = E.ESCADA_DA_ESCUTA.find((x) => x.id === "cobra");
  const linha = E.linhaDoRumo({ pedido: { doJogador: true }, degrau: cobra, passo: "x", semente: 1, mundo: { aqui: "em Alto das Pedras", abertura: ABERTURA, missoes: [], ato: 0, dia: 1 } });
  t("o degrau que cobra entra como fato, sem pedir \"o nome dito\"", /é fato: entra nesta resposta/.test(linha) && !/com o nome dito/.test(linha), linha);
  t("e diz que fica sem nome", /sem nome \(não lhe dê um\)/.test(linha), linha);
  const vem = E.ESCADA_DA_ESCUTA.find((x) => x.id === "vem_buscar");
  const lv = E.linhaDoRumo({ pedido: { doJogador: true }, degrau: vem, passo: "x", semente: 1, mundo: { aqui: "em Alto das Pedras", abertura: ABERTURA, missoes: [], ato: 0, dia: 1 } });
  t("quem traz nome (o \"vem buscar\") continua \"com o nome dito\"", /Berengária/.test(lv) && /com o nome dito/.test(lv), lv);
  t("a régua é tabela", Array.isArray(E.DEGRAU_EM_CENA.rumo.semNome) && E.DEGRAU_EM_CENA.rumo.semNome.includes("cobra"));
}

console.log(`\n${ok} ok · ${mal} falha(s)`);
if (mal) process.exit(1);
