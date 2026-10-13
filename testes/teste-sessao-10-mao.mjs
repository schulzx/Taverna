/* teste-sessao-10-mao.mjs — a mão da 10.ª sessão de prova (13/10)

   `mente/mm11-sessao-10.md` ("O dinheiro", "Os defeitos" 2, 3, 4 e 9, "Os
   3 consertos"), cada conserto preso ao que a sessão deu de verdade — as
   frases do jogador (M6, M17, M45, M49, M65) e a prosa do Mestre (M6, M45).
   Falha na árvore de antes (v9.454) e passa na de depois:

     1. a frase que paga: "pago os dois cobres" (com "Ele devolve a carta"
        na prosa) e "conto vinte e três … e pago …, e peço que me diga onde
        posso encontrá-lo" davam 0; "Pago a dívida de Perrin: vinte e três
        moedas" também (cobranca.js);
     2. a viagem lida de palavras: "Sigo com Saoirse para o sul, até o
        Rossio Torto" abria uma jornada sem destino (+4 h), e a jornada sem
        destino ficava aberta e o mapa oferecia "Partir · 0 h" (rastro.js,
        viagem.js, mapa-vivo.js);
     3. o teste que ninguém pediu: "pois estou desarmada" rolava "desarmar a
        armadilha" dif. 18 numa ferraria, e o teste não dizia o risco nem
        deixava desistir (desafios.js);
     4. "durmo até o amanhecer", escrito, não chegava ao descanso
        (descanso.js). */
let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => { if (typeof cond === "function") { try { cond = cond(); } catch (e) { extra = String(e && e.message); cond = false; } } if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? "  → " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const S = "../src/";
const J = JSON.stringify;

const C = await import(S + "cobranca.js");
const R = await import(S + "rastro.js");
const V = await import(S + "viagem.js");
const MV = await import(S + "mapa-vivo.js");
const D = await import(S + "desafios.js");
const DS = await import(S + "descanso.js");
/* o que esta etapa trouxe, lido com rede: na árvore de antes falta, e a
   suíte tem de FALHAR asserção a asserção — não estourar na primeira */
const descansoDaFrase = DS.descansoDaFrase || (() => null);
const escolhaDoTeste = D.escolhaDoTeste || (() => null);

/* ---------------- o que a sessão deu ---------------- */
/* M6 — a frase e a prosa (o registo, resposta 12) */
const J6 = "Sento no balcão, peço uma caneca de cerveja a Godfrey e pago os dois cobres. Depois mostro a carta sem assinatura e pergunto o que ele sabe do Rossio Torto.";
const M6 = "A mulher de cabelo preto curto se afasta sem responder, e o silêncio dela é uma resposta inteira. Você se senta no banco mais próximo do balcão, e Godfrey enche uma caneca de cerveja sem que você precise pedir, o líquido dourado espumando na borda. Você desliza dois cobres sobre o balcão, e ele os faz sumir num gesto rápido, sem olhar para o dinheiro.\n— Cerveja antes de negócio. — Ele apoia os cotovelos na madeira gasta, as escamas verdes brilhando à luz do fogo. — Agora, me fala dessa carta que você não larga.\nVocê desdobra o papel, e ele inclina a cabeça para ler, os olhos estreitando-se.\n— O Rossio Torto... — O nome sai da boca dele como uma pedra caindo num poço. — Isso é um nome que não se diz por aqui. — Ele passa a língua nos dentes, pensativo. — Nyla Punho-de-Pedra guarda esse lugar. E se você quer entrar, é com ela que tem de falar.\nEle devolve a carta, e por um instante o barulho da taverna parece se afastar.\n— Mas eu não sei o que tem lá dentro. Só sei que é o tipo de coisa que faz gente sumir sem deixar rastro. — Ele abaixa a voz, e as palavras se misturam ao estalido da lenha.\n— Você tem ideia do que está procurando? — A pergunta fica no ar, e a cerveja espuma devagar na caneca, como se estivesse esperando a sua resposta.";
/* M45 — a frase e a prosa (resposta 93) */
const J45 = "Digo ao taverneiro que eu sei o que isso quer dizer. Conto vinte e três moedas na mão dele e pago a dívida de Perrin, e peço que me diga onde posso encontrá-lo.";
const M45 = "Você despeja as moedas na palma do taverneiro, uma a uma, e o som fino de cada queda se mistura ao tamborilar da chuva. Ele as conta duas vezes, devagar, depois deposita tudo num pote de barro atrás do balcão. — Vinte e três. — O draconato de escamas cor de cobre velho encosta o pote na prateleira, entre dois jarros. — Perrin disse que você faria isso. Não disse quando. — Ele passa um pano pelo balcão, sem pressa, e o tecido úmido deixa um rastro limpo na madeira. — Foi pra ferraria de Nova clara. Saiu faz três dias, a pé. A essa hora, ou está lá, ou a dívida já o engoliu no caminho. — Ele se apoia no balcão, e os olhos reptilianos não piscam. — Por que carregar a dívida dos outros, forasteira?";
/* M17, M49, M65 — as frases */
const J17 = "Respondo que viemos falar com Nyla Punho-de-Pedra, a guardiã do Rossio Torto. Sigo com Saoirse para o sul, até o Rossio Torto, e procuro por ela.";
const J49 = "Aceito os catres junto ao fogo. Deito, de bota e com a faca à mão, e durmo até o amanhecer.";
const J65 = "Digo à capanga que fique com Dolmen e que diga ao Rei que a sargenta chegou. Entro em Nova clara com Saoirse, procuro a ferraria e compro uma arma boa, pois estou desarmada. Pago o que o ferreiro pedir.";
const debito = (narr, pedido, bolsa = 161) => C.oQueFaltaDebitar(narr, undefined, { bolsa, envelopes: "", pedido, moeda: "cobres" }).moedas;

sec("1. a frase que paga lê só a oração do verbo de pagar (M6, M45)");
{
  t("M6: \"pago os dois cobres\" debita 2, com \"Ele devolve a carta\" na prosa (era: 0)", debito(M6, J6, 15) === 2, String(debito(M6, J6, 15)));
  t("M45: \"conto vinte e três … e pago …, e peço que me diga onde posso encontrá-lo\" debita 23 (era: 0)", debito(M45, J45) === 23, String(debito(M45, J45)));
  /* as seis frases da tabela (deb3.mjs), contra uma prosa neutra */
  const neutra = "Ele guarda o pote.";
  for (const [f, n] of [
    ["Conto vinte e três moedas na mão dele e pago a dívida de Perrin.", 23],
    ["Conto vinte e três moedas na mão dele e pago a dívida de Perrin, e peço que me diga onde posso encontrá-lo.", 23],
    ["Digo ao taverneiro que eu sei o que isso quer dizer. Conto vinte e três moedas na mão dele e pago a dívida de Perrin.", 23],
    ["Pago vinte e três moedas ao taverneiro.", 23],
    ["Conto 23 moedas na mão dele e pago.", 23],
    ["Pago a dívida de Perrin: vinte e três moedas.", 23],
  ]) t(`"${f.slice(0, 70)}" debita ${n}`, debito(neutra, f) === n, String(debito(neutra, f)));
  /* as travas continuam, DENTRO da oração do pagamento */
  for (const f of ["Se ele aceitar, pago dois cobres.", "Pago dois cobres?", "Ofereço dois cobres.", "Pago dois cobres se ele aceitar.",
    "Não pago os dois cobres.", "Posso pagar dois cobres?", "Pago dois cobres, se ele quiser.", "Caso ele aceite, conto dez moedas e pago."])
    t(`a trava continua: "${f}" não debita`, debito(neutra, f) === 0, String(debito(neutra, f)));
  t("o \"se\" da pergunta indireta, noutra oração, não trava (\"…e pergunto se ele viu Nyla\")", debito(neutra, "Pago dois cobres e pergunto se ele viu Nyla.") === 2);
  /* a recusa da cena é sobre o dinheiro */
  for (const n of ["Ele empurra as moedas de volta.", "Ele recusa o seu dinheiro com um gesto.", "É por conta da casa, diz ele.",
    "Você estende os cobres. Ele os devolve sem contar.", "Você estende os dois cobres e ele os devolve."])
    t(`a cena que recusa o dinheiro ainda recusa: "${n}"`, debito(n, "Pago os dois cobres.") === 0);
  t("a carta devolvida não é dinheiro recusado", debito("Ele devolve a carta e guarda as moedas.", "Pago os dois cobres.") === 2);
  t("as regras são tabela (ORACAO_DO_PAGAMENTO, RECUSA_DA_CENA, PAGAR_COM_DOIS_PONTOS)",
    !!C.ORACAO_DO_PAGAMENTO && C.ORACAO_DO_PAGAMENTO.condicao.includes("se") && !!C.RECUSA_DA_CENA && C.RECUSA_DA_CENA.gestos.includes("devolve") && C.RECUSA_DA_CENA.dinheiro.includes("cobres") && !!C.PAGAR_COM_DOIS_PONTOS && C.PAGAR_COM_DOIS_PONTOS.verbos.includes("pago"));
  t("a prosa do Narrador continua lida pela frase inteira (\"Você paga dez moedas e não recebe troco\" não debita)", C.lerGastos("Você paga dez moedas e não recebe troco.").moedas === 0);
  t("lixo não quebra", C.oQueFaltaDebitar(null, null, { pedido: null }).moedas === 0 && C.lerGastos(null, { oracao: true }).moedas === 0);
}

sec("2. a viagem só com destino (M17) — e a jornada sem destino fecha já");
{
  const CIDADES = ["Monte Rasa", "Nova Profundo", "Torre Rasa", "Nova clara", "Ponto Rasa"];
  const ctx17 = { cidadeAtual: "Nova Profundo", cidades: CIDADES, lugar: { nome: "O Rossio Torto", cidade: "Nova Profundo", distancia: "dentro" } };
  t("M17: \"Sigo com Saoirse para o sul, até o Rossio Torto\" não abre estrada (era: jornada sem destino, +4 h)", R.detectarPartida(J17, ctx17) === null, J(R.detectarPartida(J17, ctx17)));
  t("sem lugar registado também não", R.detectarPartida(J17, { cidadeAtual: "Nova Profundo", cidades: CIDADES }) === null);
  t("a direção sozinha não parte (\"tomo a estrada rumo ao sul\")", R.detectarPartida("Tomo a estrada rumo ao sul.", ctx17) === null);
  t("com o destino nomeado depois de \"até\", parte para ele", (R.detectarPartida("Sigo para o sul, até Nova clara.", ctx17) || {}).destino === "Nova clara");
  t("e a partida com a cidade nomeada continua a dar destino", (R.detectarPartida("Partimos agora para Monte Rasa.", ctx17) || {}).destino === "Monte Rasa");
  /* o M23 da sessão foi escrito NA estrada sem destino: "voltamos agora para Monte Rasa" deu-lhe o destino */
  t("na estrada sem destino, a frase do M23 dá o destino", (R.detectarSeguirViagem("Voltamos agora para Monte Rasa.", { cidadeAtual: "Nova Profundo", cidades: CIDADES, emViagem: true, jornada: V.abrirViagem({ de: "Nova Profundo", para: "" }) }) || {}).destino === "Monte Rasa");
  t("a regra é tabela (PARTIDA_SEM_DESTINO.abre = false, com o porquê)", !!R.PARTIDA_SEM_DESTINO && R.PARTIDA_SEM_DESTINO.abre === false && !!R.PARTIDA_SEM_DESTINO.porque);
  /* a jornada que a sessão deixou aberta: Nova Profundo → "", 240 de 1.440 min */
  const j17 = { ...V.abrirViagem({ de: "Nova Profundo", para: "", dia: 1 }), andadoMin: 240 };
  const fechada = V.jornadaSemDestino(j17);
  t("a jornada sem destino a meio fecha JÁ na cidade de onde saiu (era: mais 20 h de estrada)", fechada && fechada.para === "Nova Profundo" && fechada.semDestino === true, J(fechada && { para: fechada.para, andadoMin: fechada.andadoMin, totalMin: fechada.totalMin }));
  t("…com o andado como o trecho inteiro, e chega", fechada && fechada.totalMin === 240 && fechada.andadoMin === 240 && !!(V.progressoDaViagem(fechada) || {}).chegou);
  t("imutável: a jornada recebida não muda", j17.para === "" && j17.totalMin === 1440 && !("semDestino" in j17));
  t("a regra é tabela (JORNADA_SEM_DESTINO.espera = false)", V.JORNADA_SEM_DESTINO && V.JORNADA_SEM_DESTINO.espera === false);
  t("com destino, nada muda", V.jornadaSemDestino({ ...j17, para: "Monte Rasa" }).para === "Monte Rasa" && V.jornadaSemDestino({ ...j17, para: "Monte Rasa" }).totalMin === 1440);
  /* o mapa nunca oferece uma partida de zero horas */
  const mapa = {
    cidades: [{ nome: "Monte Rasa", x: 0, y: 0, bioma: "planicie" }, { nome: "Nova Profundo", x: 2, y: 3, bioma: "planicie" }],
    rotas: [{ de: "Monte Rasa", para: "Nova Profundo", dias: 0.5 }],
    regiao: { base: { nome: "Monte Rasa" }, povoados: [{ nome: "Nova Profundo", horas: 4 }], lugares: [] },
  };
  let dados = null;
  try { dados = MV.dadosDoMapaVivo(mapa, { cidadeAtual: "Nova Profundo", jornada: null, dia: 1, minuto: 600, semente: "s10" }); } catch (e) { dados = null; }
  const nos = (dados && dados.nos) || [];
  const base = nos.find((n) => n.nome === "Monte Rasa");
  t("o mapa monta (fixture)", nos.length >= 2, J(nos.map((n) => n.nome)));
  t("a base não fica a \"0 h\" de si mesma: horasDaBase = null (era: 0 → \"Partir · 0 h de estrada\")", !!base && base.horasDaBase === null, J(base && base.horasDaBase));
  t("nenhum nó oferece zero horas", nos.every((n) => n.horasDaBase == null || n.horasDaBase > 0));
}

sec("3. o teste que o jogador não pediu (M65)");
{
  const ferraria = { personagem: { nivel: 1 }, semente: "s10", lugar: "a ferraria", tentativas: {}, dia: 2 };
  const v65 = D.lerAcao(J65, ferraria);
  t("M65: \"pois estou desarmada\" não rola teste (era: \"desarmar a armadilha\", dif. 18 → 11 PV)", !v65 || v65.tipo !== "teste", J(v65 && { tipo: v65.tipo, rotulo: v65.rotulo, dc: v65.dc }));
  for (const f of ["Estou desarmada.", "Estou cansado.", "Estou muito cansada e sento.", "Sou cuidadosa.", "Continuo escondida atrás do balcão."]) {
    const v = D.lerAcao(f, ferraria);
    t(`estado não é ação: "${f}"`, !v || v.tipo !== "teste", J(v && v.rotulo));
  }
  t("o gerúndio fica: \"estou escalando o muro\" não se apaga (a regra é tabela)", !!D.ESTADO_NAO_E_ACAO && D.ESTADO_NAO_E_ACAO.naoMascara.test("escalando") && !D.ESTADO_NAO_E_ACAO.naoMascara.test("desarmada"));
  /* desarmar pede o verbo com o objeto, e o objeto em cena */
  const semArmadilha = D.lerAcao("Desarmo a armadilha da porta.", ferraria);
  t("sem armadilha conhecida em cena, \"desarmo a armadilha\" não rola", !semArmadilha || semArmadilha.id !== "desarmar", J(semArmadilha && semArmadilha.id));
  const naCripta = { ...ferraria, lugar: "a cripta", objetoEmCena: (o) => o === "armadilha" };
  const comArmadilha = D.lerAcao("Desarmo a armadilha da porta.", naCripta);
  t("com a armadilha em cena, rola (Prestidigitação)", !!comArmadilha && comArmadilha.id === "desarmar" && comArmadilha.pericia === "prestidigitacao");
  t("…e \"estou desarmada\" diante dela continua a não rolar", (() => { const v = D.lerAcao("Estou desarmada e recuo.", naCripta); return !v || v.id !== "desarmar"; })());
  t("\"desarmo o guarda\" não é a armadilha", (() => { const v = D.lerAcao("Desarmo o guarda.", naCripta); return !v || v.id !== "desarmar"; })());
  t("o objeto é tabela (OBJETO_DO_TESTE.armadilha; desarmar.precisaDe)", !!D.OBJETO_DO_TESTE && !!D.OBJETO_DO_TESTE.armadilha && (D.DESAFIOS.find((d) => d.id === "desarmar") || {}).precisaDe === "armadilha");
  t("o objetoEmCena que estoura não rola nada", (() => { const v = D.lerAcao("Desarmo a armadilha.", { ...ferraria, objetoEmCena: () => { throw new Error("x"); } }); return !v || v.id !== "desarmar"; })());
  /* o veredito antes do dado: rolar ou desistir, e o risco em pele */
  const e = comArmadilha && comArmadilha.escolha;
  t("o teste chega com a escolha: rolar ou \"Não era isso\" (desistir sem rolar)", !!e && e.rolar === D.ESCOLHA_DO_TESTE.rolar && e.desistir === D.ESCOLHA_DO_TESTE.desistir && e.podeDesistir === true, J(e));
  t("e o risco em pele dito antes: dif. 18 morde 2d6 → \"até 12 PV\"", !!e && e.danoMax === 12 && /12 PV/.test(e.risco), J(e));
  const esc = escolhaDoTeste(D.lerAcao("Escalo o muro.", naCripta));
  t("a escalada diz a queda antes (metros e PV)", !!esc && esc.cai === true && /m: até \d+ PV/.test(esc.risco), J(esc));
  t("lixo não quebra", escolhaDoTeste(null) === null && escolhaDoTeste({ tipo: "livre" }) === null && D.lerAcao(null, null) === null);
}

sec("4. \"durmo até o amanhecer\", escrito, é o descanso do botão (M49)");
{
  const d49 = descansoDaFrase(J49);
  t("M49: \"…e durmo até o amanhecer\" pede o descanso LONGO (era: nada — o relógio ficou nas 23 h)", !!d49 && d49.tipo === "longo" && d49.ate === "ate o amanhecer", J(d49));
  for (const [f, tipo] of [["Durmo um pouco.", "curto"], ["Descanso até de manhã.", "longo"], ["Pernoitamos na estalagem.", "longo"], ["Paro para descansar.", "curto"], ["Deito-me para dormir.", "longo"], ["Tiro um cochilo.", "curto"]])
    t(`"${f}" → ${tipo}`, (descansoDaFrase(f) || {}).tipo === tipo, J(descansoDaFrase(f)));
  for (const f of ["Posso dormir aqui?", "Não durmo, fico de vigia.", "Finjo dormir e espero.", "Deixo Saoirse dormir e vigio.", "Antes de dormir, tranco a porta.",
    "Digo: \"vou dormir\" e saio.", "Passo a noite em claro.", "Descanso a mão no punho da espada.", "Se ele deixar, durmo aqui.", "Saoirse dorme."])
    t(`não é o herói a dormir agora: "${f}"`, descansoDaFrase(f) === null, J(descansoDaFrase(f)));
  t("na luta ninguém dorme", descansoDaFrase("Durmo.", { emCombate: true }) === null);
  t("o envelope do sistema não é pedido meu", descansoDaFrase("[PASSAR O TEMPO — 8 horas] durmo") === null);
  t("a régua é tabela (DESCANSO_DA_FRASE)", !!DS.DESCANSO_DA_FRASE && DS.DESCANSO_DA_FRASE.longo.includes("durmo") && DS.DESCANSO_DA_FRASE.daNoite.includes("ate o amanhecer"));
  t("lixo não quebra", descansoDaFrase(null) === null && descansoDaFrase("", null) === null && descansoDaFrase(undefined, undefined) === null);
}

console.log(`\n${ok} ok · ${mal} falha(s)`);
if (mal) process.exit(1);
