/* teste-sessao-7.mjs — MM-C, os consertos da 7.ª sessão de prova (11/10)

   `mente/mm11-sessao-7.md`, "Os 3 consertos de maior efeito", cada um preso
   pela FRASE REAL da sessão — a do jogador ou a do Mestre —, de modo que
   esta suíte falha na árvore de antes (v9.416) e passa na de depois:

     1. "me volto para Lia" não é partida, e a chegada que o sistema inferiu
        não paga missão (M50–M51: +57 moedas, +89 XP, prosa e sistema em
        cidades diferentes);
     2. a revelação do elo cai — pelo confronto com as duas pistas (M55, sem
        o nome, no dia da crise de Tônia) e pela fogueira, por convite (a
        proposta aprovada): as duas portas, a mesma verdade, uma só vez;
     3. o alvo armado que o Mestre mostra existe (M20, M61), e o lado
        "duelo" do cartão diz com quem é a luta (M59–M61);
     e o favor que já é pedido do núcleo não ganha cartaz no mural (M27). */
let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => { if (typeof cond === "function") { try { cond = cond(); } catch (e) { extra = String(e && e.message); cond = false; } } if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? "  → " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const J = (x) => JSON.stringify(x);
const S = "../src/";

const R = await import(S + "rastro.js");
const RV = await import(S + "resolver.js");
const M = await import(S + "missoes.js");
const A = await import(S + "agressao.js");
const CR = await import(S + "crime.js");
const ST = await import(S + "subtramas.js");
const NU = await import(S + "nucleo.js");
const { gerarGeografia } = await import(S + "geografia.js");
const { estenderEspinha } = await import(S + "saga.js");
const { MOLDES } = await import(S + "moldes.js");
const { guildasDoMundo } = await import(S + "guildas.js");
const { elencoDoMundo } = await import(S + "elenco.js");
const { abrirAbertura } = await import(S + "abertura.js");
const { companheiroInicial } = await import(S + "companheiro-inicial.js");
/* o que esta etapa trouxe, lido com rede: na árvore de antes falta, e a
   suíte tem de FALHAR asserção a asserção — não estourar na primeira */
const NAO_E_PARTIDA = R.NAO_E_PARTIDA || { rx: /$^/ };
const DESTINO_NA_ORACAO = RV.DESTINO_NA_ORACAO || { genericos: [], verbo: /$^/ };
const CHEGADA_INFERIDA = M.CHEGADA_INFERIDA || { naoFecham: [] };
const chegadaConfirmada = M.chegadaConfirmada || (() => null);
const CONFRONTO = { semNome: {}, ...(ST.CONFRONTO || {}) };
const REVELACAO_AO_FOGO = ST.REVELACAO_AO_FOGO || {};
const PESSOA_NA_PROSA = A.PESSOA_NA_PROSA || { cabecas: [], armas: [] };
const pessoaMostrada = A.pessoaMostrada || (() => "faltou");
const alvoPrometido = A.alvoPrometido || (() => ({}));
const LUTA_PROMETIDA = A.LUTA_PROMETIDA || {};
const favorJaPedido = ST.favorJaPedido || (() => null);

/* ============================================================ */
sec("1a. virar-se para alguém não é partir (M50)");
const M50 = "Digo a Jaco que não vou confiar em ninguém aqui. Depois me volto para Lia e aponto a pena queimada na mão dela: o verso que você cantou e essa pena no seu caderno vêm do mesmo lugar. Você servia a quem mandou aquele homem… Diga o nome dele.";
const MAPA = { cidades: [
  { nome: "Sul Molhado", descoberta: true, x: 10, y: 10, porte: "porto" },
  { nome: "Quebrado do Leste", descoberta: true, x: 30, y: 12, porte: "porto" },
] };
/* o que o App passa ao resolver (`pistasDoCanone`): o cânone guarda o Peixe
   Cego com tipo "lugar", e Jaco e Hilda moram em Sul Molhado */
const EXTRA = [
  { cidade: "Sul Molhado", termos: ["O Peixe Cego", "estalagem", "lugar"], porque: "O Peixe Cego está lá" },
  { cidade: "Sul Molhado", termos: ["Jaco Faro", "pescador"], porque: "Jaco Faro mora lá" },
  { cidade: "Sul Molhado", termos: ["Hilda", "taverneira"], porque: "Hilda mora lá" },
];
{
  const r = RV.resolverLugar(M50, MAPA, { extra: EXTRA, excluir: "Quebrado do Leste" });
  t("M50: a frase real NÃO resolve destino (era «Entendi … como Sul Molhado»)", r.tipo !== "achei", J(r.escolha && r.escolha.cidade));
  t("…e diz a quem chama que não era partida (`naoParte`), para não ir o envelope de destino", r.naoParte === true);
  t("e a porta de nome também não parte com ela", R.detectarPartida(M50, { cidades: ["Sul Molhado", "Quebrado do Leste"], cidadeAtual: "Quebrado do Leste" }) === null);
  t("a régua é tabela, lida de volta", NAO_E_PARTIDA.rx.test("me volto para lia") && NAO_E_PARTIDA.rx.test("viro-me para ela") && NAO_E_PARTIDA.rx.test("volto os olhos para o mar") && !NAO_E_PARTIDA.rx.test("volto para sul molhado"));
  /* o que continua a partir */
  t("«volto para Sul Molhado» continua a resolver", (RV.resolverLugar("volto para Sul Molhado", MAPA, { excluir: "Quebrado do Leste" }).escolha || {}).cidade.nome === "Sul Molhado");
  t("«me volto para Lia e sigo para Sul Molhado» parte — a oração do verbo manda", (RV.resolverLugar("me volto para Lia e sigo para Sul Molhado", MAPA, { excluir: "Quebrado do Leste" }).escolha || { cidade: {} }).cidade.nome === "Sul Molhado");
  t("e pelo que o cânone sabe, na oração do verbo: «vou para onde Hilda mora»", (RV.resolverLugar("vou para onde Hilda mora", MAPA, { extra: EXTRA, excluir: "Quebrado do Leste" }).escolha || { cidade: {} }).cidade.nome === "Sul Molhado");
  /* o termo de classe não aponta cidade, e o termo casa por palavra inteira */
  t("«lugar» (a classe do cânone) não é pista de destino", RV.resolverLugar("vou ao mesmo lugar de sempre", MAPA, { extra: EXTRA, excluir: "Quebrado do Leste" }).tipo === "nada");
  t("os genéricos são tabela", DESTINO_NA_ORACAO.genericos.includes("lugar") && DESTINO_NA_ORACAO.verbo.test("volto para"));
  t("o destino noutra oração não conta: «parto já e conto a Lia da estalagem»", RV.resolverLugar("parto já e conto a Lia da estalagem", MAPA, { extra: EXTRA, excluir: "Quebrado do Leste" }).tipo === "nada");
  t("sem verbo nenhum (só a descrição), a frase inteira, como sempre", (RV.resolverLugar("o porto onde está a estalagem", MAPA, { extra: EXTRA, excluir: "Quebrado do Leste" }).escolha || { cidade: {} }).cidade.nome === "Sul Molhado");
  t("lixo não estoura", RV.resolverLugar(null, MAPA).tipo === "nada" && RV.resolverLugar("me volto para", null).tipo === "nada");
}

sec("1b. a chegada que o sistema inferiu não paga missão (M51)");
{
  const palavra = M.criarMissao({ titulo: "A palavra dada a Jaco Faro", tipo: "favor", etapas: [{ tipo: "ir_a", alvo: "Sul Molhado" }], id: "jaco", status: "ativa" });
  const inferida = M.conferir([palavra], { cidadeAtual: "Sul Molhado", chegadaInferida: "Sul Molhado" });
  t("M51: chegada inferida — «A palavra dada a Jaco Faro» NÃO fecha (era +57 moedas, +89 XP)", inferida.concluidas.length === 0 && inferida.avancos.length === 0);
  t("e o estado que volta é o mesmo (nada marcado feito)", !inferida.missoes[0].etapas[0].feito);
  const deFacto = M.conferir([palavra], { cidadeAtual: "Sul Molhado" });
  t("chegada de facto (sem a marca): fecha, como sempre", deFacto.concluidas.length === 1);
  const outra = M.conferir([palavra], { cidadeAtual: "Sul Molhado", chegadaInferida: "Quebrado do Leste" });
  t("a marca de outra cidade não trava esta", outra.concluidas.length === 1);
  const levar = M.criarMissao({ titulo: "A carta para Sal Morto", tipo: "favor", etapas: [{ tipo: "levar_a", alvo: "Sal Morto", item: "carta" }], id: "carta", status: "ativa" });
  t("levar_a também espera a chegada de facto", M.conferir([levar], { cidadeAtual: "Sal Morto", chegadaInferida: "Sal Morto", inventario: ["carta"] }).concluidas.length === 0
    && M.conferir([levar], { cidadeAtual: "Sal Morto", inventario: ["carta"] }).concluidas.length === 1);
  t("o que não é chegada não espera: derrotar fecha com a marca posta", M.conferir([M.criarMissao({ titulo: "x", etapas: [{ tipo: "derrotar", alvo: "lobo" }], id: "l", status: "ativa" })], { cidadeAtual: "Sul Molhado", chegadaInferida: "Sul Molhado", derrotados: ["lobo"] }).concluidas.length === 1);
  t("a tabela diz quem espera", CHEGADA_INFERIDA.naoFecham.includes("ir_a") && CHEGADA_INFERIDA.naoFecham.includes("levar_a"));
  /* o que confirma: o jogador nomeia a cidade ou um lugar dela */
  t("M51 «digo a Lia que fico aqui no galpão até a maré baixa» não confirma Sul Molhado", chegadaConfirmada("digo a Lia que fico aqui no galpão até a maré baixa", "Sul Molhado", ["O Peixe Cego"]) === false);
  t("«entro no Peixe Cego» confirma (um lugar dela)", chegadaConfirmada("Entro no Peixe Cego e peço um caldo", "Sul Molhado", ["O Peixe Cego"]) === true);
  t("«ando pelas ruas de Sul Molhado» confirma (a cidade)", chegadaConfirmada("ando pelas ruas de Sul Molhado", "Sul Molhado") === true);
  t("o envelope do sistema não é frase do jogador; lixo é falso", chegadaConfirmada("[CHEGADA] Sul Molhado", "Sul Molhado") === false && chegadaConfirmada(null, null) === false && chegadaConfirmada("Sul", "Sul Molhado", null) === false);
}

/* ============================================================
   2. a revelação do elo — um mundo do antecedente "artista" (o da sessão),
   com as duas pistas como a sessão as viu
   ============================================================ */
const G = "Fantasia medieval";
function mundo(i) {
  const Mo = MOLDES[i % MOLDES.length];
  const semente = `Sessao7|${i}`;
  const mapa = gerarGeografia(semente, Mo);
  const cidade = mapa.cidades[0].nome;
  const guildas = guildasDoMundo(semente, mapa, G, null);
  const antecedente = "artista";
  const espinha = estenderEspinha({ semente, mapa, genero: G, molde: Mo, estrutura: "jornada", cidadeInicial: cidade, antecedente, dia: 1 });
  const ab = abrirAbertura({ semente, mapa, cidade, espinha, estrutura: "jornada", antecedente, genero: G, molde: Mo, nivel: 1, dia: 1 });
  const ci = ab && ab.abertura ? companheiroInicial({ semente, mapa, genero: G, molde: Mo, espinha, guildas, cidade, antecedente, heroi: { nome: "Dornel", nivel: 1, classe: "Bardo" }, abertura: ab.abertura }) : null;
  const elenco = elencoDoMundo(semente, mapa, { genero: G, molde: Mo, espinha, guildas });
  const nucleo = NU.nucleoDaCampanha(semente, mapa, { genero: G, molde: Mo, espinha, guildas, antecedente, grupo: ci ? [ci.comp] : [], elenco });
  return { semente, mapa, espinha, elenco, nucleo };
}
const PISTAS_DA_SESSAO = [
  "trauteia a canção do herói com um verso que o herói nunca ouviu",
  "o caderno da pauta, com uma pena queimada na ponta no lugar da assinatura",
];
let W = null;
for (let i = 0; i < 40 && !W; i++) {
  const w = mundo(i);
  const elo = w.nucleo.pessoas.find((p) => p.papel === "elo");
  const outro = w.nucleo.pessoas.find((p) => p.papel !== "elo" && p.papel !== "vilao");
  if (!elo || !outro || elo.revelaNoAto !== 0) continue;
  const pessoas = w.nucleo.pessoas.map((p) => (p === elo ? { ...p, ficha: { ...p.ficha, esconde: { ...p.ficha.esconde, pistas: PISTAS_DA_SESSAO.map((o) => ({ o })) } } } : p));
  const nucleo = { ...w.nucleo, pessoas };
  W = { ...w, nucleo, subs: ST.subtramasDoNucleo(nucleo, { semente: w.semente, espinha: w.espinha, elenco: w.elenco }), elo: pessoas.find((p) => p.papel === "elo"), outro };
}
const ctxDe = (extra = {}) => ({ semente: W.semente, espinha: W.espinha, elenco: W.elenco, subtramas: W.subs, ...extra });
const congelar = (o) => { if (o && typeof o === "object") { Object.freeze(o); for (const v of Object.values(o)) congelar(v); } return o; };

sec("2a. o confronto com as duas pistas, sem o nome (M55)");
const M55 = "entro no galpão… ponho diante dela o verso e a pena queimada. Digo que isso é a marca de quem ela serve, e quero o nome";
t("há um mundo da sessão (elo que revela no ato 0, e mais alguém)", !!W);
if (W) {
  const elo = W.elo;
  const duas = congelar({ v: 1, arcos: { [elo.nome]: { pedido: 1, pistas: [2, 2] } } });
  const r = ST.avancarCoracao(duas, W.nucleo, ctxDe({ dia: 3, ato: 0, turno: 55, emCena: [elo.nome, W.outro.nome], frase: M55 }));
  t("M55: a frase real (\"diante DELA o verso e a pena queimada\") traz a revelação", r.batida && r.batida.tipo === "revelacao", J(r.batida));
  t("…em frase fechada, inteira, na voz do elo", /é fato: entra nesta resposta, dito por (ele|ela), inteiro\)/.test(r.linha) && r.linha.startsWith(elo.nome) && r.linha.length <= ST.LINHA_DO_CORACAO.max, r.linha);
  t("…e grava a verdade no arco (crise no dia, no ato 0)", r.coracao.arcos[elo.nome].crise === 3 && r.coracao.arcos[elo.nome].ato === 0);
  t("…marcada como ganha pelo jogador (`porConfronto`)", r.batida && r.batida.porConfronto === true);
  /* M52: a crise de Tônia caiu nesse mesmo dia */
  const comCrise = congelar({ v: 1, arcos: { [elo.nome]: { pedido: 1, pistas: [2, 2] }, [W.outro.nome]: { pedido: 1, crise: 3 } } });
  const r2 = ST.avancarCoracao(comCrise, W.nucleo, ctxDe({ dia: 3, ato: 0, turno: 55, emCena: [elo.nome], frase: M55 }));
  t("M52+M55: com a crise de outra pessoa no MESMO dia, a revelação ganha pelo confronto cai na mesma", r2.batida && r2.batida.tipo === "revelacao", J(r2.batida));
  t("a regra é tabela (CONFRONTO.semNome, CONFRONTO.furaODia)", CONFRONTO.semNome.pistas === 2 && CONFRONTO.furaODia === true);
  /* o que continua a não ser confronto */
  const r3 = ST.avancarCoracao(duas, W.nucleo, ctxDe({ dia: 3, ato: 0, turno: 55, emCena: [elo.nome], frase: "de onde vem esse verso?" }));
  t("uma pista só, sem o nome: não é confronto (\"de onde vem esse verso?\")", !r3.batida || r3.batida.tipo !== "revelacao");
  const r4 = ST.avancarCoracao(duas, W.nucleo, ctxDe({ dia: 3, ato: 0, turno: 55, emCena: [W.outro.nome], frase: M55 }));
  t("o elo fora de cena: as duas provas não são confronto a ninguém", !r4.batida || r4.batida.tipo !== "revelacao" || r4.batida.nome !== elo.nome);
  const umaSo = { v: 1, arcos: { [elo.nome]: { pedido: 1, pistas: [2] } } };
  const r5 = ST.avancarCoracao(umaSo, W.nucleo, ctxDe({ dia: 3, ato: 0, turno: 55, emCena: [elo.nome], frase: M55 }));
  t("com uma pista vista só, a frase das duas não força nada (o nome não foi dito)", !r5.batida || r5.batida.tipo !== "revelacao");
  /* M50, com o nome: era o turno que a viagem fantasma engoliu */
  const nome1 = elo.nome.split(" ")[0];
  const r6 = ST.avancarCoracao(duas, W.nucleo, ctxDe({ dia: 2, ato: 0, turno: 50, emCena: [elo.nome], frase: `Depois me volto para ${nome1} e aponto a pena queimada na mão dela: o verso que você cantou e essa pena vêm do mesmo lugar. Diga o nome dele.` }));
  t("M50, com o nome dela: a revelação cai (e já não há viagem que a engula)", r6.batida && r6.batida.tipo === "revelacao");
}

sec("2b. a fogueira é a segunda porta — por convite, a mesma verdade, uma só vez");
if (W) {
  const elo = W.elo;
  const duas = congelar({ v: 1, arcos: { [elo.nome]: { pedido: 1, pistas: [2, 2] } } });
  const roda = ST.quemAoFogo(W.nucleo, ctxDe({ coracao: duas, presentes: [elo.nome, W.outro.nome], dia: 3, ato: 0 }));
  const naRoda = roda.find((x) => x.pessoa === elo.nome);
  t("com as duas pistas vistas, o elo à roda tem o gesto de quem vai dizer uma coisa (nunca qual)", naRoda && naRoda.gesto === REVELACAO_AO_FOGO.gesto && naRoda.revela === true && naRoda.batida === "revelacao", J(naRoda));
  t("e a roda sabe ler a voz dele (\"ficha\": tem voz, clicável)", naRoda && naRoda.voz === "ficha");
  const s = ST.sentarAoFogo(duas, W.nucleo, elo.nome, ctxDe({ dia: 3, ato: 0 }));
  t("sentar-se ao lado dele traz a revelação, inteira, na voz dele", s.revela === true && /é fato: entra nesta resposta, dito por (ele|ela), inteiro/.test(s.linha) && s.linha.startsWith(elo.nome) && s.linha.length <= ST.LINHA_DO_CORACAO.max, s.linha);
  t("a linha da fogueira é a mesma verdade da do confronto (o mesmo segredo)", (() => {
    const c = ST.avancarCoracao(duas, W.nucleo, ctxDe({ dia: 3, ato: 0, turno: 55, emCena: [elo.nome], frase: M55 }));
    const segredo = (l) => l.slice(l.indexOf("): ") + 3);
    return c.linha && segredo(s.linha) === segredo(c.linha);
  })());
  t("grava o mesmo que o confronto: crise no dia, no ato, e a noite conta", s.coracao.arcos[elo.nome].crise === 3 && s.coracao.arcos[elo.nome].ato === 0 && s.coracao.arcos[elo.nome].noites === 1);
  t("o coração recebido não muda", duas.arcos[elo.nome].crise === undefined);
  /* uma só vez, pelas duas portas */
  const depoisDoFogo = ST.avancarCoracao(s.coracao, W.nucleo, ctxDe({ dia: 4, ato: 0, turno: 60, emCena: [elo.nome], frase: M55 }));
  t("depois da fogueira, o confronto já não revela outra vez", !depoisDoFogo.batida || depoisDoFogo.batida.tipo !== "revelacao");
  const conf = ST.avancarCoracao(duas, W.nucleo, ctxDe({ dia: 3, ato: 0, turno: 55, emCena: [elo.nome], frase: M55 }));
  const depoisDoConfronto = ST.sentarAoFogo(conf.coracao, W.nucleo, elo.nome, ctxDe({ dia: 3, ato: 0 }));
  t("depois do confronto, a fogueira já não revela outra vez", depoisDoConfronto.revela === false && !/inteiro/.test(depoisDoConfronto.linha));
  const umaSo = { v: 1, arcos: { [elo.nome]: { pedido: 1, pistas: [2] } } };
  t("com uma pista só, a fogueira não revela (conta a ficha, como antes)", ST.sentarAoFogo(umaSo, W.nucleo, elo.nome, ctxDe({ dia: 3, ato: 0 })).revela === false);
  const outraJa = ST.sentarAoFogo(duas, W.nucleo, elo.nome, ctxDe({ dia: 3, ato: 0, reveladas: [{ nome: W.outro.nome, ato: 0 }] }));
  t("com outra revelação já caída neste ato, a fogueira espera (revelacaoPermitida)", outraJa.revela === false);
  t("a manhã sabe dizê-lo", ST.fraseDaManha({ tipo: REVELACAO_AO_FOGO.manha, nome: elo.nome, genero: elo.genero }).includes(elo.nome) && /confessou ao pé do fogo/.test(ST.fraseDaManha({ tipo: "revelacao", nome: elo.nome })));
}

/* ============================================================ */
sec("3a. a pessoa armada que o Mestre mostra existe (M20, M61)");
const PRESENTES = [{ nome: "Tônia Lodoso" }, { nome: "Jaco Faro" }, { nome: "Lia Cinzela" }, { nome: "Marlo", papel: "camarada de Tônia, acusador" }];
{
  const m18 = ["Tônia, num beco: — Não era para você me achar assim. Jaco, ofegante: — Tem dois carregando tocha na ladeira do porto."];
  const a20 = A.lerAgressao("Mando Tônia ficar atrás de mim. Avanço com Jaco e ataco o homem da tocha.", { presentes: PRESENTES, grupo: [{ nome: "Jaco Faro" }], mostrado: m18 });
  t("M20: \"ataco o homem da tocha\" abre a luta contra quem o Mestre mostrou (era «a ladeira está vazia»)", a20 && a20.tipo === "agressao" && a20.nome === "Homem da tocha", J(a20));
  t("…não contra Tônia nem Jaco, citados noutra oração", a20 && !/T[ôo]nia|Jaco/.test(a20.nome));
  t("…e não é crime: quem o Mestre armou à frente do herói não é vítima", a20 && a20.armadoNaProsa === true && CR.lerCrime(a20, { npcs: {}, presentes: PRESENTES, grupo: [] }) === null);
  const m60 = ["— Então o bardo fala por ela? Pois que fale com a lâmina, não com a língua. O pescador de barba ruiva tira uma faca de pesca do cinto. Lia: — No meu telhado não. Lá fora, na lama. E sem faca."];
  const a61 = A.lerAgressao("Aceito o desafio. Saio para a lama, sem faca, como Lia mandou, e ataco o pescador de barba ruiva com os punhos.", { presentes: PRESENTES, grupo: [], mostrado: m60 });
  t("M61: \"ataco o pescador de barba ruiva\" abre a luta (era [SEM ALVO NO REGISTRO])", a61 && a61.tipo === "agressao" && a61.nome === "Pescador de barba ruiva", J(a61));
  t("…com a ameaça de gente comum", a61 && a61.ameaca === "comum");
  /* a trava da casa continua: o jogador não escreve o inimigo */
  t("sem arma nem ameaça na prosa, a pessoa não vira alvo", A.lerAgressao("ataco o velho", { presentes: PRESENTES, mostrado: ["Um velho dorme na esquina, enrolado num xale."] }).tipo === "semAlvoConhecido");
  t("a gente que o Mestre não mostrou não vira alvo", A.lerAgressao("ataco o soldado", { presentes: PRESENTES, mostrado: m60 }).tipo === "semAlvoConhecido");
  t("sem as falas do Mestre, tudo como antes", A.lerAgressao("ataco o homem da tocha", { presentes: PRESENTES }).tipo === "semAlvoConhecido");
  t("o bicho mostrado continua a vir antes", A.lerAgressao("ataco o cão sem pelo", { presentes: PRESENTES, mostrado: ["Um cão sem pelo rosna atrás do homem da faca."] }).criatura === true);
  t("o nome do registo na oração do golpe continua a mandar", A.lerAgressao("ataco Marlo", { presentes: PRESENTES, mostrado: m60 }).nome === "Marlo");
  t("a tabela é lida de volta", PESSOA_NA_PROSA.cabecas.includes("pescador") && PESSOA_NA_PROSA.armas.includes("tocha"));
  t("lixo não estoura", pessoaMostrada(null, null) === null && pessoaMostrada("ataco o homem", []) === null);
}

sec("3b. o lado \"duelo\" do cartão diz com quem é a luta (M59–M61)");
{
  let achado = null;
  for (let i = 0; i < 80 && !achado; i++) {
    const w = mundo(i + 100);
    const subs = ST.subtramasDoNucleo(w.nucleo, { semente: w.semente, espinha: w.espinha, elenco: w.elenco });
    const inst = subs.find((s) => s.escolha && s.escolha.lados.some((l) => l.id === "defender"));
    if (inst) achado = { w, subs, inst };
  }
  t("há um mundo com a decisão do camarada (Defender / Deixá-la confessar)", !!achado);
  if (achado) {
    const { w, subs, inst } = achado;
    const posta = congelar({ v: 1, arcos: { [inst.nome]: { pedido: 1, crise: 3, posta: 4 } } });
    const ctx = { semente: w.semente, espinha: w.espinha, elenco: w.elenco, subtramas: subs, dia: 4, ato: 0 };
    const sem = ST.escolherLado(posta, w.nucleo, inst.nome, "defender", ctx);
    /* E1 (12/10): o nome deixou de ser o papel ("Velho camarada"): o arco
       a_guerra dá à figura um nome do banco do mundo desde a linha da crise
       (FIGURA_DO_ARCO), e é esse o combatente quando o registo e a prosa
       calam. A intenção fica: sem registo, a luta tem nome e ameaça. */
    t("Defender: a luta prometida vem com nome e ameaça, mesmo sem registo (era «sem alvo»)", sem.luta && inst.figura && sem.luta.nome === inst.figura.nome && sem.luta.deOnde === "figura" && sem.luta.ameaca && sem.luta.duelo === true, J(sem.luta));
    const comMarlo = ST.escolherLado(posta, w.nucleo, inst.nome, "defender", { ...ctx, presentes: PRESENTES });
    t("com o camarada no registo da cena (o Marlo do Cronista), a luta é com ele", comMarlo.luta && comMarlo.luta.nome === "Marlo" && comMarlo.luta.deOnde === "registo", J(comMarlo.luta));
    const pelaProsa = ST.escolherLado(posta, w.nucleo, inst.nome, "defender", { ...ctx, mostrado: ["Perto da meia-noite, um velho camarada de Tônia aparece na soleira, pingando."] });
    t("sem registo, pelo que o Mestre mostrou: «Camarada de Tônia»", pelaProsa.luta && pelaProsa.luta.nome === "Camarada de Tônia", J(pelaProsa.luta));
    t("o efeito continua o mesmo (o duelo contra o velho camarada)", sem.efeitos.some((e) => e.tipo === "duelo" && e.contra === "o velho camarada"));
    const conf = ST.escolherLado(posta, w.nucleo, inst.nome, "confessar", ctx);
    t("o lado sem luta não traz luta", conf.luta === null);
    t("o coração recebido não muda", posta.arcos[inst.nome].escolha === undefined);
  }
  t("alvoPrometido nunca devolve vazio", alvoPrometido(null).nome && alvoPrometido("", {}).nome && alvoPrometido("os homens do credor").nome === "Homens do credor");
  t("a sombra luta com a ameaça da tabela", alvoPrometido("a Mulher Sem Nome", { sombra: true }).ameaca === LUTA_PROMETIDA.sombra);
}

sec("4. um favor, uma forma: o mural não repete o pedido do núcleo (M26–M27)");
if (W) {
  const quem = W.outro;
  const pediu = { v: 1, arcos: { [quem.nome]: { pedido: 2, resposta: "aceitou" } } };
  t("M27: quem do núcleo já pediu não ganha cartaz para o mesmo favor", favorJaPedido(quem.nome, pediu, W.nucleo) === quem.nome);
  t("…pelo primeiro nome, ou com o papel atrás da vírgula", favorJaPedido(quem.nome.split(" ")[0], pediu, W.nucleo) === quem.nome && favorJaPedido(`${quem.nome}, a do balcão`, pediu, W.nucleo) === quem.nome);
  t("antes do pedido, o mural é livre", favorJaPedido(quem.nome, { v: 1, arcos: {} }, W.nucleo) === "");
  t("quem não é do núcleo, livre; lixo, livre", favorJaPedido("Otto", pediu, W.nucleo) === "" && favorJaPedido(null, null, null) === "");
}

sec("5. a fiação no App (frontend, 12/10) — o motor só vale se o jogo o chamar");
{
  /* O motor desta etapa (v9.418) estava provado e ninguém o chamava: a
     viagem fantasma, a chegada que paga, a luta que o lado promete e o
     favor em dobro no mural continuavam vivos no jogo. Estas asserções
     leem o App como texto — não provam a regra (isso é das secções acima),
     provam que a porta está ligada e protegida. */
  const { readFileSync } = await import("node:fs");
  const app = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
  t("querPartir recusa virar-se para alguém (NAO_E_PARTIDA)", /RX_QUER_PARTIR\.test\(t\) && !NAO_E_PARTIDA\.rx\.test\(t\)/.test(app));
  t("o naoParte do resolver segue a cascata sem o envelope de destino", /if \(r && r\.naoParte\) return false;\s*\n\s*if \(r\.tipo === "achei"\)/.test(app));
  t("a viagem que o resolver achou vai marcada como inferida", app.includes('viajar(nome, { origem: "frase", inferida: true });'));
  t("a jornada nova marca a inferência e apaga a chegada anterior", /jornadaInferidaRef\.current = opcoes && opcoes\.inferida \? String\(alvo \|\| ""\) : "";\s*\n\s*chegadaInferidaRef\.current = "";/.test(app));
  t("a chegada guarda a cidade só quando a jornada era inferida", app.includes('chegadaInferidaRef.current = jornadaInferidaRef.current && jornadaInferidaRef.current === j.para ? j.para : "";'));
  t("o mundo das missões leva chegadaInferida", app.includes('chegadaInferida: chegadaInferidaRef.current || "",'));
  t("a frase do jogador que nomeia a cidade confirma a chegada", /chegadaConfirmada\(acao, ci, lugaresDaqui\(\)/.test(app));
  t("a fogueira com revela: manhã de revelação e o Livro pago", app.includes('const tipo = r.revela ? "revelacao"') && /if \(r\.revela\) pagarSementesDoElo\(\);/.test(app));
  t("os dois cliques de lado levam presentes e mostrado ao motor", (app.match(/\.\.\.contextoDaLutaPrometida\(\)/g) || []).length === 2);
  t("o lado que promete luta abre-a (no cartão e à fogueira)", /const naLuta = r\.luta \? abrirLutaPrometida\(r\.luta, pago\) : pago;/.test(app) && /if \(r\.luta\) abrirLutaPrometida\(r\.luta, personagemRef\.current \|\| pers\);/.test(app));
  t("a luta prometida abre pela porta do combate, e nunca por cima de outra", /if \(!luta \|\| !luta\.nome \|\| combateRef\.current\) return pers;\s*\n\s*const ab = abrirCombate\(\[\{ nome: luta\.nome, ameaca: luta\.ameaca \}\], \{ pers \}\);/.test(app));
  t("o mural não prega o favor que o núcleo já pediu", /semPedido = !favorJaPedido\(cartaz\.dador, coracaoRef\.current, nucleoAgora\(\)\);[^\n]*calou/.test(app) && app.includes("if (semHomonimo && semPedido && pregarNoMural(cartaz)) {"));
}

console.log(`\nsessão 7: ${ok} passaram, ${mal} falharam`);
if (mal) process.exit(1);
