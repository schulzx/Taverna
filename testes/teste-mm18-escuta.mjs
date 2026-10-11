/* O MESTRE QUE ESCUTA (Fase MM, MM18) — reage, responde, e só depois empurra

   A queixa da pessoa depois da 4.ª sessão de prova (11/10): "o mestre não
   parece estar interessado em reagir ou responder o player e sim somente
   em sair jogando informações". E o limite que ela pôs: reagir não pode
   tirar a história do rumo — quem só faz perguntas soltas é levado ao
   destino, e o mundo vem buscá-lo quando empaca.

   Esta suíte guarda as três partes: o que vai ao Narrador num turno (no
   máximo um empurrão, e o que toca o fio primeiro), a escada por turnos
   sem avanço, e os órgãos que já estão ligados e mudaram de conduta (o
   Intérprete numa pergunta, a pauta, as chaves da Mesa Posta, as fichas
   que respondiam à pergunta errada, o prompt). Os casos são do registo da
   4.ª sessão (mente/mm11-sessao-4.md). */

const RAIZ = "../src/";
const E = await import(RAIZ + "escuta.js");
const I = await import(RAIZ + "interprete.js");
const P = await import(RAIZ + "pauta.js");
const M = await import(RAIZ + "mesa-posta.js");
const A = await import(RAIZ + "abertura.js");
const EN = await import(RAIZ + "encalhe.js");
const G = await import(RAIZ + "gente-por-dentro.js");
const C = await import(RAIZ + "cidade-por-dentro.js");
const { readFileSync } = await import("node:fs");
const PROMPT = readFileSync("../src/prompt.js", "utf8");

let bons = 0, maus = 0;
const t = (nome, cond, extra) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const congelado = (o) => JSON.stringify(o);

/* o fio da 4.ª sessão: a pista, o alvo e a origem do perigo */
const ABERTURA = A.garantirAbertura({
  principalId: "mis_principal", cidade: "Alto do Sal", chegada: "à porta", razao: "uma carta", sabe: "Inocência",
  historia: "a 8 horas fica Muralha Quebrada de Silêncio", titulo: "O rasto de Noé Laminado",
  pista: { nome: "Inocência Bordão", papel: "músico de canto", local: "Sino Quieto" },
  alvo: { feitio: "procurar", quem: "Noé Laminado", onde: "Rua dos Retalhos", alvo: "", origem: "Muralha Quebrada de Silêncio" },
});
const MISSOES = [{ id: "mis_principal", titulo: "O rasto de Noé Laminado", tipo: "principal", status: "ativa",
  etapas: [{ tipo: "falar_com", alvo: "Inocência Bordão", onde: "Sino Quieto" }, { tipo: "falar_com", alvo: "Noé Laminado", onde: "Rua dos Retalhos" }] }];
const FIO = E.fioDaHistoria({ abertura: ABERTURA, missoes: MISSOES });

sec("1. o pedido: o que o jogador fez, lido uma vez");
{
  const p = E.lerOPedido("Olho para o Euzébio: \"De onde é que a gente se conhece, afinal? E por que é que tu vieste comigo?\"");
  t("uma frase com \"?\" pergunta, e é do jogador", p.doJogador && p.pergunta);
  t("as perguntas saem uma a uma", p.perguntas.length === 2 && /De onde/.test(p.perguntas[0]), JSON.stringify(p.perguntas));
  const a = E.lerOPedido("Respiro fundo e conto a verdade a Inocência.");
  t("um ato sem pergunta é do jogador e não pergunta", a.doJogador && !a.pergunta && a.perguntas.length === 0);
  t("o envelope do sistema não é do jogador", !E.lerOPedido("[CORREIO — PETIÇÃO RECEBIDA] A Câmara pede auxílio?").doJogador);
  t("lixo não quebra", !E.lerOPedido(null).doJogador && !E.lerOPedido({}).doJogador && !E.lerOPedido("").doJogador);
  t("no máximo PERGUNTAS_LIDAS", E.lerOPedido("a? b? c? d? e?").perguntas.length === E.PERGUNTAS_LIDAS);
}

sec("2. os empurrões, pelos cabeçalhos que a 4.ª sessão mandou");
{
  const empurra = ["[PREPARAÇÃO — DECISÃO DO SISTEMA] Comece a preparar um JULGAMENTO", "[APERTA — DECISÃO DO SISTEMA] x", "[A UM PASSO — DECISÃO DO SISTEMA] x",
    "[AGORA — DECISÃO DO SISTEMA] x", "[O QUE FICOU — DECISÃO DO SISTEMA] x", "[A FORMA DESTA CENA — ESCOLHIDA PELO SISTEMA] x",
    "[TRABALHO PREGADO NO MURAL — PELO SISTEMA] x", "[QUEST GERADA PELO SISTEMA — fase \"abertura\" do arco] x",
    "[EVENTO GLOBAL — NOVO ARCO MAIOR: O TORNEIO DAS COROAS] x", "[O MUNDO SE MEXE — ESCOLHIDO PELO SISTEMA] x",
    "[O PASSADO VOLTA — ESCOLHIDO PELO SISTEMA] x", "[O MUNDO LEMBROU — CANON] x", "[RUMOR] x", "[CORREIO — PETIÇÃO RECEBIDA] x",
    "[SONHO] x", "[RELÓGIO ABERTO — REGISTRADO PELO SISTEMA] x", "[NESTE MUNDO — O LUGAR PERIGOSO] x"];
  t("os 17 cabeçalhos que puxam história são empurrão", empurra.every((x) => E.empurraoDe(x)), empurra.filter((x) => !E.empurraoDe(x)).join(" | "));
  const fatos = ["[PROCURA — RESOLVIDA PELO SISTEMA] x", "[MOVIMENTO — REGISTRADO PELO SISTEMA] x", "[VIAGEM — tudo rolado pelas tabelas do app] x",
    "[CHEGADA À BOCA — REGISTRADA PELO SISTEMA] x", "[COMBATE — RESOLVIDO PELO SISTEMA] x", "[CORREÇÃO DO SISTEMA — QUEM ESTÁ ONDE] x",
    "[GUARDA DE CONTINUIDADE — LEMBRETE DE REGRA] x", "[CLIMA] x", "[ACAMPAMENTO — O SÍTIO É DO SISTEMA] x", "[FIM DO ACAMPAMENTO — DESCANSO LONGO] x"];
  t("os fatos do turno nunca são empurrão", fatos.every((x) => !E.empurraoDe(x)), fatos.filter((x) => E.empurraoDe(x)).join(" | "));
  t("o sino que tocou e o mundo que vem buscar não são empurrão: são o topo da escada",
    !E.empurraoDe("[RELÓGIO COMPLETO — ACONTECIMENTO DO SISTEMA] x") && !E.empurraoDe("[O MUNDO VAI BUSCAR — encalhe, degrau 2] x"));
  t("toda linha da tabela diz de que módulo vem e se pode esperar",
    E.EMPURROES.every((x) => x.de && typeof x.adia === "boolean" && x.peso > 0));
  t("o que fala de um AGORA não espera (o compasso, a forma)", !E.EMPURROES.find((x) => x.id === "compasso").adia && !E.EMPURROES.find((x) => x.id === "forma").adia);
}

sec("3. escutar o turno: no máximo um empurrão, e o que toca o fio primeiro");
{
  /* a chamada 53 (T23): seis envelopes, quatro deles a puxar história */
  const envs = [
    "[RELÓGIO ABERTO — REGISTRADO PELO SISTEMA] Começou a contar: \"O Torneio das Coroas\"",
    "[FIM DO ACAMPAMENTO — DESCANSO LONGO] Levantamos acampamento",
    "[CLIMA] O tempo virou",
    "[SONHO] O sonho desta noite",
    "[EVENTO GLOBAL — NOVO ARCO MAIOR: O TORNEIO DAS COROAS] O SISTEMA sorteou",
    "[QUEST GERADA PELO SISTEMA — fase \"abertura\" do arco] Nova missão secundária: \"O pedido de Ondine\"",
  ];
  const antes = congelado(envs);
  const r = E.escutarOTurno({ envelopes: envs, fio: FIO, semAvanco: 0 });
  t("quatro empurrões contados", r.empurroes === 4);
  t("no degrau da escuta fica UM", r.ficam.filter((x) => E.empurraoDe(x)).length === 1);
  t("os fatos ficam todos", r.ficam.includes(envs[1]) && r.ficam.includes(envs[2]));
  t("a ordem é a de chegada", r.ficam.indexOf(envs[1]) < r.ficam.indexOf(envs[2]));
  t("o que pode esperar espera; o resto cai", r.adiados.length + r.cortados.length === 3 && r.cortados.includes(envs[3]));
  t("não muta o recebido", congelado(envs) === antes);
  /* a chamada 47 (T20): o passado que volta traz Inocência — é do fio, e ganha do mais pesado */
  const ponte = "[O PASSADO VOLTA — ESCOLHIDO PELO SISTEMA] alguém que você conheceu reaparece: Inocência.";
  const r2 = E.escutarOTurno({ envelopes: ["[APERTA — DECISÃO DO SISTEMA] A simpatia vira convite", ponte], fio: FIO, semAvanco: 0 });
  t("entre um peso 3 solto e um peso 2 que toca o fio, fica o do fio (a ponte)", r2.ficam.includes(ponte) && r2.ficam.length === 1);
  t("degrau 3 deixa dois", E.escutarOTurno({ envelopes: envs, fio: FIO, semAvanco: 10 }).ficam.filter((x) => E.empurraoDe(x)).length === 2);
  t("lixo devolve vazio", E.escutarOTurno({ envelopes: null }).ficam.length === 0 && E.escutarOTurno().empurroes === 0);
}

sec("4. o fio da história, e quem o toca");
{
  t("o fio traz a pista, o alvo e a origem", ["Inocência Bordão", "Noé Laminado", "Muralha Quebrada de Silêncio"].every((n) => FIO.some((f) => f.nome === n)));
  t("e o lugar das etapas por fazer", FIO.some((f) => f.nome === "Rua dos Retalhos"));
  t("\"O que sabes de Noé Laminado?\" toca o fio", E.tocaOFio("O que sabes de Noé Laminado, e onde ele está?", FIO));
  t("\"Procuro Inocência\" toca pelo primeiro nome", E.tocaOFio("Vim. Procuro Inocência, a que canta.", FIO));
  t("\"a Muralha Quebrada\" toca pelas duas primeiras palavras", E.tocaOFio("Quanto tempo leva a pé até à Muralha Quebrada?", FIO));
  t("\"a muralha da cidade\" não toca (uma palavra de um lugar não é o lugar)", !E.tocaOFio("Olho a muralha da cidade", FIO));
  t("a resma de papel não toca", !E.tocaOFio("Pergunto quanto custa uma resma e um frasco de tinta.", FIO));
  t("missão feita ou que se recusa não é fio", !E.fioDaHistoria({ missoes: [{ titulo: "x", tipo: "contrato", status: "ativa", etapas: [{ tipo: "ir_a", alvo: "Campo Trêmulo" }] }] }).length);
  t("lixo devolve fio vazio", E.fioDaHistoria(null).length === 0 && !E.tocaOFio("Noé", null));
}

sec("5. a escada por turnos: o mundo anda quando o jogador empaca");
{
  t("a escada sobe: 0 · 4 · 7 · 10", E.ESCADA_DA_ESCUTA.map((d) => d.desde).join(",") === "0,4,7,10");
  t("cada degrau aponta um degrau do encalhe que existe", E.ESCADA_DA_ESCUTA.every((d) => d.encalhe === 0 || EN.intervencoesDoDegrau(d.encalhe).length > 0));
  t("degrauDaEscuta", E.degrauDaEscuta(0).id === "escuta" && E.degrauDaEscuta(4).id === "sinal" && E.degrauDaEscuta(8).id === "vem_buscar" && E.degrauDaEscuta(99).id === "cobra");
  t("lixo é o degrau zero", E.degrauDaEscuta(null).n === 0 && E.degrauDaEscuta(-3).n === 0);
  /* os turnos do jogador na 4.ª sessão, J2 a J11, pela ordem */
  const frases = [
    "De onde é que a gente se conhece, afinal?",
    "Procuro Inocência Bordão, o músico de canto. Quem manda de facto nesta cidade?",
    "O que sabes de Noé Laminado, e onde ele está?",
    "Pago a bebida e vou ao Mercado da Cinza perguntar quanto custa uma resma.",
    "Conto a verdade: fui escriba de um culto.",
    "Abro caminho até ao coreto e pergunto de que é acusado o Caetano.",
    "Subo os degraus e peço que se confira a balança do cambista.",
    "Fico na praça a ver o que fazem com a corda.",
    "Olho as bancas uma a uma.",
    "Pergunto no Livro Morto se há registo de Noé Laminado.",
  ];
  let e = E.garantirEscuta(null);
  const seq = [];
  for (const f of frases) { e = E.andarAEscuta(e, { pedido: E.lerOPedido(f), fio: FIO }); seq.push(e.semAvanco); }
  t("o desvio do julgamento conta, e tocar Noé zera", seq.join(",") === "1,0,0,1,2,3,4,5,6,0", seq.join(","));
  t("ao quarto turno fora do fio, o mundo dá um sinal", E.degrauDaEscuta(4).id === "sinal");
  const s = E.andarAEscuta({ semAvanco: 3, etapas: 0 }, { pedido: E.lerOPedido("Olho as bancas."), fio: FIO, etapas: 1 });
  t("uma etapa feita é avanço, mesmo sem tocar o fio", s.semAvanco === 0 && s.etapas === 1);
  const m = E.andarAEscuta({ semAvanco: 3, marcos: 2 }, { pedido: E.lerOPedido("Olho as bancas."), fio: FIO, marcos: 3 });
  t("um marco da espinha também", m.semAvanco === 0 && m.marcos === 3);
  const sis = E.andarAEscuta({ semAvanco: 5 }, { pedido: E.lerOPedido("[CLIMA] chove"), fio: FIO });
  t("o turno do sistema não conta", sis.semAvanco === 5);
  const luta = E.andarAEscuta({ semAvanco: 3 }, { pedido: E.lerOPedido("Seguro a ação e observo."), fio: FIO, pausa: true });
  t("a luta não sobe a escada (quem luta está a jogar)", luta.semAvanco === 3);
  t("lixo não quebra e começa em zero", E.garantirEscuta(null).semAvanco === 0 && E.andarAEscuta(null, null).semAvanco === 0);
}

sec("6. o que segura o mundo: numa pergunta, o compasso e a forma esperam");
{
  const perg = E.lerOPedido("Quantas chaves são?");
  t("pergunta no degrau da escuta segura", E.seguraOMundo(perg, E.degrauDaEscuta(0)));
  t("pergunta com o jogador empacado não segura (o mundo vem buscá-lo)", !E.seguraOMundo(perg, E.degrauDaEscuta(4)));
  t("um ato não segura", !E.seguraOMundo(E.lerOPedido("Entro na botica."), E.degrauDaEscuta(0)));
  t("o turno do sistema não segura", !E.seguraOMundo(E.lerOPedido("[RUMOR] x?"), E.degrauDaEscuta(0)));
  t("a regra mora na tabela", E.SEGURA_O_MUNDO.naPergunta === true && E.SEGURA_O_MUNDO.ateODegrau === 0);
}

sec("7. o rumo: responder primeiro, depois uma ponte para o passo");
{
  const passo = A.proximoPasso({ abertura: ABERTURA, missoes: MISSOES });
  t("o próximo passo existe na fixture", !!passo, passo);
  const l0 = E.linhaDoRumo({ pedido: E.lerOPedido("De onde nos conhecemos?"), degrau: E.degrauDaEscuta(0), passo });
  t("numa pergunta, responder primeiro", l0.startsWith(E.RUMOS.pergunta));
  t("e uma ponte só, para o passo", l0.includes(passo) && /uma coisa só/.test(l0));
  const la = E.linhaDoRumo({ pedido: E.lerOPedido("Entro na botica."), degrau: E.degrauDaEscuta(0), passo });
  t("num ato, reagir primeiro", la.startsWith(E.RUMOS.ato));
  const l1 = E.linhaDoRumo({ pedido: E.lerOPedido("Olho as bancas."), degrau: E.degrauDaEscuta(4), passo, semente: 2 });
  t("empacado, o sinal sai do encalhe", EN.intervencoesDoDegrau(1).some((iv) => l1.includes(iv.diz)), l1);
  const l3 = E.linhaDoRumo({ pedido: E.lerOPedido("Olho as bancas."), degrau: E.degrauDaEscuta(10), passo, semente: 1 });
  t("e no topo o mundo cobra", EN.intervencoesDoDegrau(3).some((iv) => l3.includes(iv.diz)));
  const semPasso = E.linhaDoRumo({ pedido: E.lerOPedido("De onde?"), degrau: E.degrauDaEscuta(0), passo: "" });
  t("sem passo, só o primeiro tempo — nunca inventa destino", semPasso === E.RUMOS.pergunta);
  const todas = [l0, la, l1, l3].join(" ").toLowerCase();
  const bast = A.PALAVRAS_DE_BASTIDOR.filter((w) => new RegExp(`\\b${w}\\b`).test(todas));
  t("nenhuma palavra de bastidor no rumo", bast.length === 0, bast.join(","));
  t("o rumo cabe na pauta sem a devorar (< 300)", [l0, la, l1, l3].every((x) => x.length < 300), [l0, l1, l3].map((x) => x.length).join(","));
  t("lixo devolve vazio", E.linhaDoRumo() === "" && E.linhaDoRumo(null) === "");
}

sec("7b. os envelopes um a um, o avanço contado, e o adiado que só espera uma vez");
{
  const nota = "[RUMOR] um boato\n[O PASSADO VOLTA — ESCOLHIDO PELO SISTEMA] Inocência reaparece.\nREGRA DESTE ENVELOPE (obrigatória): traga-o [narre como: leve]\n[CLIMA] chove";
  const ps = E.separarEnvelopes(nota);
  t("três envelopes, e a regra fica com o seu", ps.length === 3 && /REGRA DESTE ENVELOPE/.test(ps[1]) && /\[narre como: leve\]/.test(ps[1]), JSON.stringify(ps));
  t("lixo devolve vazio", E.separarEnvelopes(null).length === 0);
  const esp = { atos: [{ marcos: [{ feito: true }, { feito: false }] }, { marcos: [{ feito: true }] }] };
  const ms = [...MISSOES.map((m) => ({ ...m, etapas: [{ ...m.etapas[0], feito: true }, m.etapas[1]] })),
    { titulo: "um bico", tipo: "contrato", status: "ativa", etapas: [{ tipo: "ir_a", alvo: "x", feito: true }] }];
  const av = E.contarOAvanco({ missoes: ms, espinha: esp });
  t("conta as etapas do fio (não as do mural) e os marcos", av.etapas === 1 && av.marcos === 2, JSON.stringify(av));
  t("lixo conta zero", E.contarOAvanco(null).etapas === 0 && E.contarOAvanco(null).marcos === 0);
  const rumor = "[RUMOR] um boato";
  const envs = ["[APERTA — DECISÃO DO SISTEMA] x", rumor];
  const r1 = E.escutarOTurno({ envelopes: envs, fio: [], semAvanco: 0 });
  t("o boato que perde espera", r1.adiados.includes(rumor));
  const r2 = E.escutarOTurno({ envelopes: envs, fio: [], semAvanco: 0, adiadosAntes: r1.adiados });
  t("e se perde outra vez, cai", !r2.adiados.includes(rumor) && r2.cortados.includes(rumor));
}

sec("8. a frase do jogador fecha o pedido");
{
  t("o fecho traz a etiqueta e a frase", E.fechoDoPedido(E.lerOPedido("Quantas chaves?")) === `${E.ETIQUETA_DO_PEDIDO}\nQuantas chaves?`);
  t("a etiqueta é bastidor (entre colchetes)", /^\[.*\]$/.test(E.ETIQUETA_DO_PEDIDO));
  t("o turno do sistema não tem fecho", E.fechoDoPedido(E.lerOPedido("[CLIMA] x")) === "" && E.fechoDoPedido(null) === "");
}

sec("9. o Intérprete, quando me perguntam (falhava antes: J2, J9, J12)");
{
  t("\"O que sabes de Noé?\" é pedi (era NADA)", I.atoDoTexto("O que sabes de Noé Laminado?") === "pedi");
  t("\"Pago a bebida… quanto custa?\" é pedi (era PAGUEI)", I.atoDoTexto("Pago a bebida e pergunto ao vendedor: quanto custa?") === "pedi");
  t("a ameaça com pergunta continua ameaça", I.atoDoTexto("Ameaço o guarda: onde está ele?") === "ameacei");
  t("pagar sem pergunta continua pagar", I.atoDoTexto("pago a bebida") === "paguei");
  t("a tabela diz o que a pergunta vence", I.ATOS_QUE_A_PERGUNTA_VENCE.includes("paguei") && !I.ATOS_QUE_A_PERGUNTA_VENCE.includes("ameacei"));
  const gente = [
    { nome: "Euzébio", ato: "pedi", euDevo: true, laco: "divida", forcaDoLaco: 2, ehCompanheiro: true, quer: "aprender a ler", quantosEscutam: 2 },
    { nome: "Inocência Bordão", ato: "pedi", quer: "guardar o quarto", sabeDeMim: true, quantosEscutam: 2, relacao: "neutro" },
    { nome: "Caetano Bronze", ato: "pedi", quer: "ir embora", quantosEscutam: 2, relacao: "desconhecido", primeiraVez: true },
  ];
  let maxLinhas = 0, esquivas = 0;
  for (let i = 0; i < 300; i++) {
    let k = i * 9301 + 49297;
    const sorte = () => ((k = (k * 9301 + 49297) % 233280) / 233280);
    const r = I.paraPauta(gente, { sorte });
    maxLinhas = Math.max(maxLinhas, r.linhas.length);
    esquivas += r.marcas.filter((m) => I.QUANDO_ME_PERGUNTAM.nunca.includes(m.id)).length;
  }
  t("numa pergunta, uma pessoa só age (em 300 sorteios)", maxLinhas === I.QUANDO_ME_PERGUNTAM.quantas, String(maxLinhas));
  t("e nunca com um movimento de não responder", esquivas === 0, String(esquivas));
  const semPergunta = gente.map((p) => ({ ...p, ato: "nada" }));
  t("sem pergunta, a cena tem as três pessoas de sempre", I.paraPauta(semPergunta, { sorte: () => 0.5 }).linhas.length === 3);
  t("todo id vetado existe no acervo", I.QUANDO_ME_PERGUNTAM.nunca.every((id) => I.movimentoPorId(id)));
  t("o segredo tocado ainda pode mudar de assunto (não responder com motivo)", !I.QUANDO_ME_PERGUNTAM.nunca.includes("muda_de_assunto"));
}

sec("10. a pauta: o rumo, o cabeçalho e a pergunta que passa à frente");
{
  const rumo = P.secaoPorId("rumo");
  t("a secção O RUMO existe, e é a última na leitura", rumo && P.SECOES[P.SECOES.length - 1].id === "rumo" && rumo.rotulo === "O RUMO");
  t("corta depois dos cinco primeiros vetos e antes da planta e da economia",
    rumo.prio > P.secaoPorId("naoPode").prio + 0.4 && rumo.prio < P.secaoPorId("masmorra").prio && rumo.prio < P.secaoPorId("economia").prio);
  const txt = P.textoDaPauta(P.porNaPauta(null, "rumo", "responda primeiro ao que perguntei"), { turno: 3 });
  t("o cabeçalho manda abrir pelo que eu fiz", /Abra pelo que eu fiz ou perguntei e conte COMO/.test(txt));
  t("e a linha do rumo chega", /O RUMO\s+responda primeiro/.test(txt));
  const cidade = P.porNaPauta(P.porNaPauta(P.porNaPauta(null, "onde", "em Alto do Sal"), "economia", "Alto do Sal é de corte. Cheira a cera, tinta e perfume caro."), "cidade", "hoje: dia de feira");
  t("sem pergunta, a economia da praça fica", !!P.cederNaCena(cidade, {}).economia);
  const comPergunta = P.porNaPauta(cidade, "pergunta", "pouso: quarto comum ◉ 4 a noite");
  const cedida = P.cederNaCena(comPergunta, {});
  t("numa pergunta respondida, a economia, a rua e a vizinhança cedem (J6)", !cedida.economia && !cedida.cidade && !!cedida.pergunta && !!cedida.onde);
  t("a regra mora na tabela", P.SECOES_QUE_CEDEM.pergunta.includes("economia"));
}

sec("11. a Mesa Posta deixa de apostar no que ninguém fez");
{
  const falsos = [
    ["Vou à Muralha Quebrada de Silêncio, procurar o que Norberto escondeu.", "J22"],
    ["Saio com Euzébio para a rua e encosto-o à parede.", "J12"],
    ["Sento no banco e tiro a carta sem assinatura do bolso.", "J4"],
    ["Parto a pé, e deixo a mulher de capa verde seguir connosco.", "J14"],
    ["O que é que a Muralha quer de ti, Noé Laminado?", "J20"],
    ["Pergunto quem acusa Caetano Bronze, batedor de carteiras.", "J9"],
  ];
  for (const [f, j] of falsos) t(`${j}: "${f.slice(0, 40)}…" não casa`, M.situacaoQueCasa(f) === null, (M.situacaoQueCasa(f) || {}).id);
  t("\"escalo a muralha do castelo\" continua a casar", (M.situacaoQueCasa("escalo a muralha do castelo") || {}).id === "escalar_muralha");
  t("\"sigo-o pela feira\" casa", (M.situacaoQueCasa("sigo-o pela feira, de longe") || {}).id === "seguir_feira");
  t("\"tento roubar a chave\" casa", (M.situacaoQueCasa("tento roubar a chave do carcereiro") || {}).id === "palmear_chave");
}

sec("12. as fichas que respondiam à pergunta errada");
{
  const passado = G.PERGUNTAS_DA_GENTE.find((x) => x.id === "passado").rx;
  t("\"quanto tempo leva a pé daqui\" não é o passado de quem ouve (J6)", !passado.test("quanto tempo leva a pe daqui ate a muralha"));
  t("\"há quanto tempo tocas aqui\" continua a ser", passado.test("ha quanto tempo tocas aqui"));
  t("\"quanto tempo ele está cá\" continua a ser", passado.test("quanto tempo ele esta ca"));
  const dist = C.PERGUNTAS_DA_CIDADE.find((x) => x.id === "distancia").rx;
  t("e a cidade responde a distância", dist.test("quanto tempo leva a pe daqui ate a muralha"));
  const rec = C.PERGUNTAS_DA_CIDADE.find((x) => x.id === "reconhecer").rx;
  t("\"reconheço esta letra\" não pergunta pela porta (J4)", !rec.test("reconheco esta letra"));
  t("\"como se reconhece quem é bem-vindo\" pergunta", rec.test("como se reconhece quem e bem-vindo"));
  const gir = C.PERGUNTAS_DA_CIDADE.find((x) => x.id === "giria").rx;
  t("\"se me chamam para me perdoar\" não pergunta a gíria (J8)", !gir.test("nao sei se me chamam para me perdoar"));
  t("\"como chamam os de fora\" pergunta", gir.test("como chamam os de fora"));
}

sec("13. o prompt: primeiro eu, e o mundo não se injeta sozinho");
{
  t("a regra PRIMEIRO EU está no ofício da cena", /- PRIMEIRO EU\. A narração abre pela reação ao que eu fiz ou disse/.test(PROMPT));
  t("\"ninguém está ali só para responder ao herói\" saiu", !/Ninguém está ali só para responder ao herói/.test(PROMPT));
  t("o turno do mundo não manda injetar sem o jogador provocar", !/Injete isso sem esperar o jogador provocar/.test(PROMPT) && /QUANDO isso acontece é do sistema/.test(PROMPT));
  t("o guia de cena deixou de fechar TODA narração com saídas", !/feche cada narração com as SAÍDAS/.test(PROMPT) && /POR DENTRO \(quem responde, o que o fato toca\)/.test(PROMPT));
}

console.log(`\n${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
