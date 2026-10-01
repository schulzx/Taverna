/* teste-mm15-ligacao.mjs (Fase MM · MM15, etapa 3) — a ligação não é o Mestre

   A segunda sessão de prova (`mente/mm11-sessao-2.md`, defeito 1, T11) parou
   num 429 do portão: "Limite diário alcançado (500 chamadas)". Duas coisas
   saíram erradas na tela, e esta suíte prende as duas:

   1. A FRASE. Subiu "A porta não se abre para esta mão: o Mestre não conta
      esta história a quem bate assim" — que se lê como recusa do CONTEÚDO.
      A jogadora leu que fez uma coisa proibida; um jogador real reescreve,
      manda de novo, e gasta mais contra uma porta que abre sozinha.
   2. O RELÓGIO. O turno recusado andou de 08:40 para 08:50: cinco minutos
      de `MINUTOS_POR_TURNO` em `agirInterno` e cinco da caminhada registada
      por `moverParaLocal`, os dois ANTES de o Mestre responder.

   As secções:
     1. a tabela dos silêncios — cada falha na sua linha, e nenhuma acusa
     2. as quedas reais, encenadas pela linha que lança (429, 403, 5xx, rede,
        tempo, vazio) — todas "a ligação"
     3. a recusa verdadeira, preservada — e só quando TODOS recusaram
     4. a resposta sem narrativa, pelo que `extrairJSON` devolve de verdade
     5. o turno que não aconteceu — o T11 encenado: o relógio igual antes e
        depois; e a exceção de X3, os dados que já caíram
     6. a lista do que o turno anda, contra o App.jsx e o save de verdade
     7. lixo, `null`, imutabilidade, determinismo

   Os imports são por espaço de nomes: antes desta etapa os nomes novos não
   existem, e a suíte tem de falhar asserção a asserção, não num import. */
import { readFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

process.chdir(dirname(fileURLToPath(import.meta.url)));

const G = await import("../src/guardado.js");
const { extrairJSON } = await import("../src/json.js");
const { MINUTOS_POR_TURNO, horaTxt } = await import("../src/calendario.js");
const APP = readFileSync("../src/App.jsx", "utf8");
const PORTAO = readFileSync("../api/_portao.js", "utf8");
const NARRADOR = readFileSync("../api/narrador.js", "utf8");

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);
/* cada secção corre à parte: antes desta etapa os nomes novos não existem,
   e uma secção que estoura conta como UMA falha em vez de derrubar as outras */
const bloco = (corpo) => { try { corpo(); } catch (e) { t("a secção correu inteira", false, e.message); } };
const semAcento = (s) => String(s == null ? "" : s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/* A LINHA QUE LANÇA, reproduzida — a mesma de teste-guardado.mjs, porque é
   a mesma de `chamarModelo` (src/App.jsx): `data.erro` quando existe, o
   status só quando o corpo vem vazio, e as pistas do portão coladas. */
const erroDoNarrador = ({ erro, status, motivo, origem }) => {
  const pistas = [motivo, origem].filter(Boolean).join(" · ");
  return new Error((erro || `HTTP ${status}`) + (pistas ? ` (${pistas})` : ""));
};
const motivoDe = (q) => { try { throw erroDoNarrador(q); } catch (e) { return String(e.message); } };

/* AS FRASES QUE ACUSAM. Nenhuma linha de ligação pode soar a recusa —
   foi exatamente isso que o T11 mostrou. */
const ACUSA = [/nao conta esta historia/, /a quem bate/, /porta nao se abre/, /proib/, /recus/, /\bnao pode\b/, /esta mao/];

/* ============================================================ */
sec("1. A TABELA DOS SILÊNCIOS — cada falha na sua linha, e nenhuma acusa");
bloco(() => {
  const M = G.MOTIVOS_DO_SILENCIO;
  const NATUREZAS = ["ligacao", "conteudo", "jogo"];
  t("toda linha diz de quem foi (`natureza` ∈ ligação · conteúdo · jogo)",
    M.every((m) => NATUREZAS.includes(m.natureza)), M.filter((m) => !NATUREZAS.includes(m.natureza)).map((m) => m.id).join(","));
  const lig = M.filter((m) => m.natureza === "ligacao");
  t(`as ${lig.length} linhas de ligação dizem "a ligação", com essa palavra`,
    lig.every((m) => semAcento(m.casa).includes("ligacao") && (!m.casaComHora || semAcento(m.casaComHora).includes("ligacao"))),
    lig.filter((m) => !semAcento(m.casa).includes("ligacao")).map((m) => m.id).join(","));
  const acusam = [];
  for (const m of M) for (const txt of [m.casa, m.casaComHora].filter(Boolean)) {
    if (m.natureza === "conteudo") continue;
    for (const rx of ACUSA) if (rx.test(semAcento(txt))) acusam.push(`${m.id}: ${rx}`);
  }
  t("nenhuma linha que não é de conteúdo soa a recusa", acusam.length === 0, acusam.join("; "));
  t("a frase do T11 sumiu da tabela inteira",
    M.every((m) => !semAcento(m.casa).includes("nao conta esta historia") && !semAcento(m.casaComHora || "").includes("nao conta esta historia")));
  /* só a recusa verdadeira manda o jogador reescrever: é a única em que
     reescrever resolve */
  const reescrever = M.filter((m) => /de outro modo|de outro jeito|reescrev/.test(semAcento(m.casa))).map((m) => m.id);
  t("só a recusa de conteúdo manda dizer de outro modo", reescrever.join(",") === "conteudo", reescrever.join(","));
  t("há exatamente uma linha de conteúdo e uma de jogo",
    M.filter((m) => m.natureza === "conteudo").length === 1 && M.filter((m) => m.natureza === "jogo").length === 1);
  /* o teto e a origem já não dividem linha: um volta à hora certa, o
     outro não volta sozinho */
  const teto = M.find((m) => m.id === "teto_do_dia"), porta = M.find((m) => m.id === "porta_fechada");
  t("o teto e a porta fechada são duas linhas, com duas frases", !!teto && !!porta && teto.casa !== porta.casa);
  t("a frase do teto com hora tem o lugar da hora, e a sem hora não o tem",
    !!teto && /\bHORA\b/.test(teto.casaComHora) && !/\bHORA\b/.test(teto.casa));
  t("as linhas do turno (os destinos) também não acusam nem dizem o mecanismo",
    G.DESTINOS_DA_FALHA.every((d) => ACUSA.every((rx) => !rx.test(semAcento(d.linha)))
      && !/\b(erro|servidor|api|sistema|rede|falha|tentativa|snapshot|retrato|foto)\b/.test(semAcento(d.linha))));
  t("e as três linhas do turno são distintas e terminam em ponto",
    new Set(G.DESTINOS_DA_FALHA.map((d) => d.linha)).size === 3 && G.DESTINOS_DA_FALHA.every((d) => /[.!?]$/.test(d.linha)));
});

/* ============================================================ */
sec("2. AS QUEDAS REAIS, ENCENADAS — todas \"a ligação\"");
bloco(() => {
  /* O TETO E A ORIGEM SÃO LIDOS DO PORTÃO DE VERDADE, não copiados: se um
     dia `api/_portao.js` reescrever a frase, é aqui que se sabe. */
  const mTeto = PORTAO.match(/erro:\s*`(Limite di[^`]*)`/);
  const mOrigem = PORTAO.match(/erro:\s*"(Este endere[^"]*)"/);
  t("o portão ainda escreve as duas recusas que esta suíte encena", !!mTeto && !!mOrigem);
  const erroTeto = mTeto ? mTeto[1].replace("${t.teto}", "500") : "Limite diário alcançado (500 chamadas).";
  const erroOrigem = mOrigem ? mOrigem[1] : "Este endereço só responde ao jogo.";

  const QUEDAS = [
    { id: "teto_do_dia", onde: "T11 — o 429 do portão", q: { status: 429, erro: erroTeto } },
    { id: "porta_fechada", onde: "403 — sem origem", q: { status: 403, erro: erroOrigem, motivo: "sem origem", origem: "(nenhuma)" } },
    { id: "porta_fechada", onde: "403 — origem não autorizada", q: { status: 403, erro: erroOrigem, motivo: "origem não autorizada", origem: "https://copia.exemplo" } },
    { id: "provedor_caiu", onde: "500 cru", q: { status: 500 } },
    { id: "provedor_caiu", onde: "502 do roteador, todos caíram", q: { status: 502, erro: "Todos os provedores falharam — deepseek (deepseek-v4-pro: 503 (retentando…)) · gemini (gemini-3.1-pro-preview: 503)" } },
    { id: "provedor_caiu", onde: "503 cru", q: { status: 503 } },
    { id: "provedor_caiu", onde: "504 da Vercel (corpo que não é JSON)", q: { status: 504 } },
    { id: "sem_rede", onde: "rede caída (Chrome)", q: { erro: "Failed to fetch" } },
    { id: "sem_rede", onde: "rede caída (Safari)", q: { erro: "Load failed" } },
    { id: "tempo_esgotado", onde: "tempo esgotado", q: { erro: "The operation was aborted." } },
    { id: "provedor_caiu", onde: "vazio — DeepSeek mudo", q: { status: 502, erro: "Todos os provedores falharam — deepseek (resposta vazia)" } },
    { id: "provedor_caiu", onde: "vazio — Gemini sem texto nenhum", q: { status: 502, erro: "Todos os provedores falharam — gemini (sem texto (vazio))" } },
    { id: "provedor_caiu", onde: "ilegível — sem narrativa depois da segunda escrita", q: { erro: G.MOTIVO_SEM_NARRATIVA } },
    { id: "demanda", onde: "429 limpo do provedor", q: { status: 429 } },
    { id: "desconhecido", onde: "o que ninguém nomeou", q: { status: 418 } },
  ];
  for (const x of QUEDAS) {
    const motivo = motivoDe(x.q);
    const s = G.lerOSilencio(motivo);
    t(`${x.onde} → ${x.id}, ligação, e diz que foi a ligação`,
      s.id === x.id && s.natureza === "ligacao" && semAcento(s.casa).includes("ligacao") && ACUSA.every((rx) => !rx.test(semAcento(s.casa))),
      `veio ${s.id}/${s.natureza}: ${s.casa}`);
    t(`   e o técnico desce inteiro (${x.onde})`, s.tecnico === motivo);
  }

  /* o 429 do teto e o 403 da origem NÃO são recusa de conteúdo — é o
     pedido desta etapa, dito com todas as letras */
  const teto = G.lerOSilencio(motivoDe(QUEDAS[0].q));
  const origem = G.lerOSilencio(motivoDe(QUEDAS[1].q));
  t("o 429 do teto não é recusa de conteúdo", teto.natureza !== "conteudo" && teto.id !== "conteudo");
  t("o 403 da origem não é recusa de conteúdo", origem.natureza !== "conteudo" && origem.id !== "conteudo");
  t("o teto não oferece bater agora (a porta só abre à hora)", teto.podeTentar === false);

  /* A HORA DA VIRADA — o portão conta o dia em UTC, e a tela diz a hora
     LOCAL. "Meia-noite" no Brasil é às 21h. */
  t("o portão ainda conta o dia pelo relógio UTC (a virada da tabela é a dele)",
    /new Date\(\)\.toISOString\(\)\.slice\(0,\s*10\)/.test(PORTAO) && G.HORA_DA_VIRADA.horaUTC === 0);
  const comFuso = (f) => G.lerOSilencio(erroTeto, { fuso: f }).casa;
  t("Brasília (fuso 180): a mesa volta às 21h", comFuso(180).includes("às 21h do seu relógio"), comFuso(180));
  t("Lisboa no inverno (fuso 0): volta às 0h", comFuso(0).includes("às 0h do seu relógio"), comFuso(0));
  t("Índia (fuso −330): volta às 5h30", comFuso(-330).includes("às 5h30 do seu relógio"), comFuso(-330));
  t("Lisboa no verão (fuso −60): volta à 1h — e nada de hora 24", comFuso(-60).includes("às 1h do seu relógio"), comFuso(-60));
  for (const lixo of [undefined, null, "180", NaN, Infinity, 9999, {}]) {
    t(`fuso torto (${String(lixo)}) devolve a frase sem hora, e nunca "HORA" na tela`,
      comFuso(lixo) === G.MOTIVOS_DO_SILENCIO.find((m) => m.id === "teto_do_dia").casa && !/HORA/.test(comFuso(lixo)));
  }
  t("o fuso só mexe na linha do teto", G.lerOSilencio("Failed to fetch", { fuso: 180 }).casa === G.lerOSilencio("Failed to fetch").casa);
  t("e `guardarTurno` leva o fuso até à linha guardada",
    G.guardarTurno({ conteudo: "vou ao Fundo do Poço", motivo: erroTeto, fuso: 180 }).silencio.casa.includes("21h"));
});

/* ============================================================ */
sec("3. A RECUSA VERDADEIRA, PRESERVADA — e só quando todos recusaram");
bloco(() => {
  const conteudo = [
    ["Gemini barrado pelo filtro", "Todos os provedores falharam — gemini (sem texto (SAFETY))"],
    ["Gemini, conteúdo proibido", "Todos os provedores falharam — gemini (sem texto (PROHIBITED_CONTENT))"],
    ["DeepSeek 400 e Gemini, os dois pelo conteúdo",
      'Todos os provedores falharam — deepseek (deepseek-v4-flash: 400: {"error":{"message":"Content Exists Risk","type":"invalid_request_error"}}) · gemini (sem texto (SAFETY))'],
  ];
  for (const [onde, m] of conteudo) {
    const s = G.lerOSilencio(m);
    t(`${onde} → conteúdo, e diz para dizer de outro modo`, s.id === "conteudo" && s.natureza === "conteudo" && /de outro modo/.test(s.casa), `${s.id}`);
  }
  /* UM recusou pelo conteúdo, o OUTRO caiu: não é a frase do jogador */
  const misto = G.lerOSilencio("Todos os provedores falharam — deepseek (deepseek-v4-pro: 503) · gemini (sem texto (SAFETY))");
  t("um recusou e o outro caiu: é a ligação, não o conteúdo", misto.natureza === "ligacao" && misto.id === "provedor_caiu", misto.id);
  const semCredito = G.lerOSilencio('Todos os provedores falharam — deepseek (deepseek-v4-pro: 402: {"error":{"message":"Insufficient Balance"}}) · gemini (sem texto (SAFETY))');
  t("sem crédito num e filtro no outro: manda o crédito (é o que ninguém conserta insistindo)", semCredito.id === "sem_dinheiro");
  /* o Gemini que acaba sem texto por OUTRA razão continua ligação */
  t("sem texto por fim de tokens não é conteúdo", G.lerOSilencio("Todos os provedores falharam — gemini (sem texto (MAX_TOKENS))").id === "provedor_caiu");
  t("a recusa de conteúdo deixa insistir (o filtro julga a escrita, e a segunda pode passar)",
    G.lerOSilencio(conteudo[0][1]).podeTentar === true);
  /* o roteador ainda escreve as quedas como esta suíte as encena */
  t("o roteador ainda junta as quedas com \" · \" e o Gemini ainda diz `sem texto (…)`",
    NARRADOR.includes('tentativas.join(" · ")') && NARRADOR.includes("sem texto ("));
});

/* ============================================================ */
sec("4. A RESPOSTA SEM NARRATIVA — pelo que `extrairJSON` devolve de verdade");
bloco(() => {
  const CASOS = [
    ["texto vazio", "", true],
    ["JSON vazio", "{}", true],
    ["narrativa vazia", '{"narrativa":""}', true],
    ["só mudanças, sem narrativa", '{"mudancas":{"ouro":5}}', true],
    ["cerca de código e nada dentro", "```json\n```", true],
    ["narrativa de verdade", '{"narrativa":"A chuva bate no telhado do Último Gomo."}', false],
    ["prosa sem chaves (o modelo esqueceu o JSON)", "A chuva bate no telhado.", false],
  ];
  for (const [onde, bruto, esperado] of CASOS) {
    const r = extrairJSON(bruto);
    t(`${onde}: ${esperado ? "faltou" : "veio"} (${JSON.stringify(String(r.narrativa).slice(0, 30))})`, G.narrativaFaltou(r) === esperado);
  }
  for (const lixo of [null, undefined, {}, [], 42, "texto", { narrativa: 42 }, { narrativa: "   " }]) {
    t(`lixo (${JSON.stringify(lixo) ?? "undefined"}) conta como narrativa que faltou`, G.narrativaFaltou(lixo) === true);
  }
  t("as frases de recurso ainda estão em json.js (a tabela aponta para elas)",
    G.NARRATIVA_QUE_NAO_VEIO.prefixos.every((p) => readFileSync("../src/json.js", "utf8").includes(p)));
  t("o motivo que o App lança cai em provedor_caiu — ligação, com botão",
    G.lerOSilencio(G.MOTIVO_SEM_NARRATIVA).id === "provedor_caiu" && G.lerOSilencio(G.MOTIVO_SEM_NARRATIVA).podeTentar === true);
});

/* ============================================================ */
sec("5. O TURNO QUE NÃO ACONTECEU — o T11 encenado");
bloco(() => {
  /* O MUNDO ÀS 08:40, na taverna. É o retrato que o save gravaria. */
  const FRASE_T11 = "Deixo a chave no bolso, saio do Último Gomo e vou direita ao Fundo do Poço, a casa de banhos. À porta, antes de entrar, paro e olho: quem está de guarda, quantas saídas há, e se alguém me segue desde a taverna.";
  const antes = Object.freeze({
    minuto: 520, dia: 1,
    lugar: Object.freeze({ nome: "O Último Gomo" }), cidadeAtual: "Runa do Poço",
    personagem: Object.freeze({ nome: "Brites Ferrolho", vida: 24, tochas: 2 }),
    mensagens: Object.freeze([{ autor: "mestre", texto: "Otávio empurra-lhe a chave pelo balcão." }]),
    missoes: Object.freeze([]), raid: null, relogios: Object.freeze({ turno_mundo: 3 }),
    custo: Object.freeze({ chamadas: 34 }), provedor: "deepseek", provedores: Object.freeze(["deepseek"]),
    abasAbertas: Object.freeze(["ficha"]), guardado: null,
  });
  const inicio = G.fotografarOTurno({ frase: FRASE_T11, retrato: antes, soltos: { nota: "", oficina: null, sino: "" } });

  /* O QUE O TURNO FEZ ANTES DA CHAMADA, como o App faz hoje: os minutos
     de `agirInterno`, a caminhada de `moverParaLocal` (cinco, "dentro"), a
     linha do jogador na tela, a nota do movimento, o relógio do mundo. */
  const MINUTOS_DA_CAMINHADA = 5;
  const envio = G.fotografarOTurno({
    frase: "",
    retrato: { ...antes, minuto: antes.minuto + MINUTOS_POR_TURNO, mensagens: [...antes.mensagens, { autor: "jogador", texto: FRASE_T11 }], relogios: { turno_mundo: 4 } },
    soltos: { nota: "", oficina: null, sino: "o mundo se mexeu" },
  });
  const agora = {
    ...antes,
    minuto: antes.minuto + MINUTOS_POR_TURNO + MINUTOS_DA_CAMINHADA,
    lugar: { nome: "O Fundo do Poço" },
    mensagens: [...antes.mensagens, { autor: "jogador", texto: FRASE_T11 }, { autor: "sistema", texto: "📍 Você está no Fundo do Poço." }],
    relogios: { turno_mundo: 4 },
    /* as três chamadas do turno foram pagas: 34 → 37 */
    custo: { chamadas: 37 }, provedores: ["deepseek", "deepseek"],
  };
  t("a encenação reproduz o relógio do T11: 08:40 → 08:50",
    horaTxt(antes.minuto) === "08:40" && horaTxt(agora.minuto) === "08:50");

  const erroTeto = "Limite diário alcançado (500 chamadas). Ele volta a zero à meia-noite — e se você chegou aqui jogando de verdade, me avise: o teto sobe.";
  const d = G.destinoDaFalha({ motivo: erroTeto, conteudo: FRASE_T11, respondeu: false, emCombate: false, fuso: 180, inicio, envio });
  t("o T11 é turno que não houve", d.id === "turno_nao_houve", d.id);
  t("a linha é a do teto, com a hora de Brasília", d.silencio.id === "teto_do_dia" && d.silencio.casa.includes("21h"));
  t("e o turno diz que nada aconteceu", /Nada do que você fez chegou a acontecer/.test(d.linha));
  t("desfaz até ao INÍCIO do turno, com a foto do início", d.desfazer === "turno" && d.foto === inicio);
  t("a frase volta à caixa, crua, como a jogadora a escreveu", d.frase === FRASE_T11 && d.reenvio === "frase");
  t("e o turno não fica guardado (não há nada preso para contar)", d.guardar === false);
  t("sem botão: o teto não abre por insistência", d.podeTentar === false);

  const r = G.turnoNaoAconteceu(d.foto, agora);
  t("O RELÓGIO É IGUAL ANTES E DEPOIS DA FALHA", r.retrato.minuto === antes.minuto && horaTxt(r.retrato.minuto) === "08:40", horaTxt(r.retrato.minuto));
  t("o dia também", r.retrato.dia === antes.dia);
  t("o lugar volta à taverna (o passo que se desfez não fica registado)", r.retrato.lugar.nome === "O Último Gomo");
  t("a tela volta sem a linha do jogador e sem o 📍 — a frase não se duplica",
    r.retrato.mensagens.length === antes.mensagens.length && !r.retrato.mensagens.some((m) => m.autor === "jogador"));
  t("o relógio do mundo não tiquetaqueou", r.retrato.relogios.turno_mundo === 3);
  t("a nota volta vazia — nenhum \"[MOVIMENTO — REGISTRADO]\" de um passo que não houve", r.soltos.nota === "");
  t("os recursos ficam como estavam", r.retrato.personagem.tochas === 2 && r.retrato.personagem === antes.personagem);
  t("MAS o custo NÃO se desfaz: as três chamadas foram pagas", r.retrato.custo.chamadas === 37);
  t("nem a lista de quem respondeu, nem as abas da pessoa",
    r.retrato.provedores.length === 2 && r.retrato.abasAbertas === antes.abasAbertas);
  t("e a frase vem junto com o retrato", r.frase === FRASE_T11);

  /* O RELÓGIO É IGUAL EM TODA FALHA DE UM TURNO QUE NÃO ROLOU — não só no
     teto. É a promessa, dita para cada queda da secção 2. */
  const TODAS = ["Failed to fetch", "Load failed", "The operation was aborted.", "HTTP 500", "HTTP 502", "HTTP 503", "HTTP 504",
    "Este endereço só responde ao jogo. (sem origem · (nenhuma))", erroTeto, "Todos os provedores falharam — deepseek (resposta vazia)",
    G.MOTIVO_SEM_NARRATIVA, "HTTP 429", "HTTP 418", "Todos os provedores falharam — gemini (sem texto (SAFETY))"];
  const andou = [];
  for (const m of TODAS) {
    const dx = G.destinoDaFalha({ motivo: m, conteudo: FRASE_T11, inicio, envio });
    const rx = G.turnoNaoAconteceu(dx.foto, agora);
    if (!rx || rx.retrato.minuto !== antes.minuto || dx.frase !== FRASE_T11) andou.push(m.slice(0, 30));
  }
  t(`em todas as ${TODAS.length} falhas o relógio fica às 08:40 e a frase volta`, andou.length === 0, andou.join(" | "));

  /* A EXCEÇÃO DE X3 — OS DADOS QUE JÁ CAÍRAM. Um golpe resolvido antes da
     chamada NÃO se desfaz: desfazê-lo deixaria declarar de novo e rolar de
     novo. Desfaz-se só o que `enviar` andou por conta própria. */
  const golpe = "[COMBATE — RESOLVIDO PELO SISTEMA] Ataco o javali: rolei 17 (+4) contra 13 — acerto, 9 de dano. NARRE.";
  const posGolpe = { ...antes, minuto: 530, personagem: { ...antes.personagem, vida: 20 } };
  const envioGolpe = G.fotografarOTurno({ retrato: posGolpe, soltos: { nota: "" } });
  const dg = G.destinoDaFalha({ motivo: erroTeto, conteudo: golpe, emCombate: true, inicio, envio: envioGolpe });
  t("golpe resolvido: os dados já caíram", dg.id === "dados_ja_cairam");
  t("desfaz só até ao ENVIO (o golpe fica)", dg.desfazer === "envio" && dg.foto === envioGolpe);
  const rg = G.turnoNaoAconteceu(dg.foto, { ...posGolpe, minuto: 545, custo: { chamadas: 38 } });
  t("o dano do golpe fica — e o que `enviar` andou depois dele sai",
    rg.retrato.personagem.vida === 20 && rg.retrato.minuto === 530 && rg.retrato.custo.chamadas === 38);
  t("nenhuma frase volta à caixa; o reenvio é o do envelope guardado", dg.frase === "" && dg.reenvio === "envelope" && dg.guardar === true);
  t("E O BOTÃO APARECE MESMO COM O TETO — trava sem botão trancava a mesa para sempre", dg.podeTentar === true);
  t("com a linha certa para o turno", /dados decidiram/.test(dg.linha));

  /* O SELO NA NOTA do envio também conta: o ritual, a oportunidade */
  const envioRitual = G.fotografarOTurno({ retrato: posGolpe, soltos: { nota: "[RITUAL — RESOLVIDO PELO SISTEMA] conduzi Luz como ritual." } });
  t("frase crua com o ritual resolvido na nota: os dados já caíram",
    G.destinoDaFalha({ motivo: "Failed to fetch", conteudo: "acendo a luz", inicio, envio: envioRitual }).id === "dados_ja_cairam");
  const oportunidade = `recuo dois passos [ATAQUES DE OPORTUNIDADE — ROLADOS PELO SISTEMA] o javali errou`;
  t("selo no MEIO do envelope (a retirada com oportunidade) também conta",
    G.destinoDaFalha({ motivo: "Failed to fetch", conteudo: oportunidade, inicio, envio }).id === "dados_ja_cairam");
  t("na luta, mesmo a frase crua conta como rolada (a vez do mundo já rolou)",
    G.destinoDaFalha({ motivo: "Failed to fetch", conteudo: "fico em guarda", emCombate: true, inicio, envio }).id === "dados_ja_cairam");
  t("fora da luta, sem selo, com a nota só de REGISTRO: não houve turno",
    G.destinoDaFalha({ motivo: "Failed to fetch", conteudo: FRASE_T11, inicio,
      envio: G.fotografarOTurno({ retrato: antes, soltos: { nota: "[MOVIMENTO — REGISTRADO PELO SISTEMA] AGORA estou no Fundo do Poço." } }) }).id === "turno_nao_houve");

  /* O MESTRE RESPONDEU e o tropeço foi nosso: não é a ligação */
  const dr = G.destinoDaFalha({ motivo: "Cannot read properties of null (reading 'vida')", conteudo: FRASE_T11, respondeu: true, inicio, envio });
  t("respondeu e estourou depois: o destino é o do Mestre que respondeu", dr.id === "mestre_respondeu");
  t("a linha é a do tropeço — de jogo, e NÃO diz \"ligação\"", dr.silencio.id === "tropeco" && dr.natureza === "jogo" && !semAcento(dr.silencio.casa).includes("ligacao"));
  t("o técnico do tropeço desce inteiro", dr.silencio.tecnico === "Cannot read properties of null (reading 'vida')");
  t("desfaz até ao envio e reenvia o envelope", dr.desfazer === "envio" && dr.foto === envio && dr.reenvio === "envelope");

  /* SEM FOTO DO INÍCIO (um caminho que chama `enviar` sem ter fotografado
     o começo): desfaz-se menos, e NUNCA se inventa uma frase */
  const ds = G.destinoDaFalha({ motivo: "Failed to fetch", conteudo: "Vou até o Fundo do Poço.", envio });
  t("sem foto do início: cai para o envio, sem frase, reenvio do envelope guardado",
    ds.id === "turno_nao_houve" && ds.foto === envio && ds.desfazer === "envio" && ds.frase === "" && ds.reenvio === "envelope" && ds.guardar === true);
  const dv = G.destinoDaFalha({ motivo: "Failed to fetch", conteudo: "x", inicio: G.fotografarOTurno({ frase: "   ", retrato: antes }), envio });
  t("foto do início com frase em branco: idem (caixa com frase vazia não é devolver)", dv.foto === envio && dv.frase === "");
  /* A FOTO DO INÍCIO TEM DE SER DESTE TURNO. `agirInterno` fotografa antes
     de saber se o turno chega a `enviar`; uma foto que sobrou de um comando
     ou de uma recusa não pode desfazer o mundo de um envio que veio de
     outro caminho. A prova é o envelope começar pela frase da foto. */
  const velha = G.fotografarOTurno({ frase: "/ouro 50", retrato: { ...antes, minuto: 400 } });
  const dvelha = G.destinoDaFalha({ motivo: "Failed to fetch", conteudo: "Descanso uma hora à sombra.", inicio: velha, envio });
  t("foto do início que sobrou de outro turno é ignorada: desfaz só até ao envio",
    dvelha.foto === envio && dvelha.frase === "" && G.turnoNaoAconteceu(dvelha.foto, agora).retrato.minuto !== 400);
  const comCauda = `${FRASE_T11} [FESTIVAL — DIA DO SAL] Hoje é festa.`;
  t("o envelope do turno escrito (a frase à frente e os envelopes do sistema atrás) é o turno da foto",
    G.destinoDaFalha({ motivo: "Failed to fetch", conteudo: comCauda, inicio, envio }).foto === inicio);
  const dn = G.destinoDaFalha({ motivo: "Failed to fetch", conteudo: "x" });
  t("sem foto nenhuma: nada a desfazer, e o turno repor responde null",
    dn.desfazer === "nada" && dn.foto === null && G.turnoNaoAconteceu(dn.foto, agora) === null);
});

/* ============================================================ */
sec("6. O QUE O TURNO ANDA — contra o App.jsx e o save de verdade");
bloco(() => {
  /* o objeto que `salvar` grava é `{ ...retratoDoJogo(), ...extra }`
     (MM15 (3)) — o literal de verdade agora mora em `retratoDoJogo`, do
     `return {` ao `};` que o fecha. */
  const i0 = APP.indexOf("const retratoDoJogo = (");
  const iReturn = i0 >= 0 ? APP.indexOf("return {", i0) : -1;
  const i1 = iReturn >= 0 ? APP.indexOf("\n    };", iReturn) : -1;
  const SAVE = iReturn >= 0 && i1 > iReturn ? APP.slice(iReturn, i1) : "";
  t("achei o objeto que `retratoDoJogo` devolve (o que `salvar` grava)", SAVE.length > 500);
  const temNoSave = (c) => new RegExp("[\\s{,]" + c + "\\s*[:,]").test(SAVE);
  const fora = G.O_QUE_O_TURNO_ANDA.filter((l) => l.noSave && !temNoSave(l.campo)).map((l) => l.campo);
  t(`os ${G.O_QUE_O_TURNO_ANDA.filter((l) => l.noSave).length} campos que o turno anda estão no save (o retrato cobre-os)`, fora.length === 0, fora.join(","));
  const soltosNoSave = G.O_QUE_O_TURNO_ANDA.filter((l) => !l.noSave && temNoSave(l.campo)).map((l) => l.campo);
  t("e os soltos NÃO estão (por isso se fotografam à parte)", soltosNoSave.length === 0, soltosNoSave.join(","));
  const semRef = G.O_QUE_O_TURNO_ANDA.filter((l) => !new RegExp("const " + l.ref + " = useRef").test(APP)).map((l) => l.ref);
  t("cada ref da lista existe no App", semRef.length === 0, semRef.join(","));
  const quem = [...new Set(G.O_QUE_O_TURNO_ANDA.flatMap((l) => l.quem))];
  const semQuem = quem.filter((q) => !new RegExp("const " + q + " = |function " + q + "\\(").test(APP));
  t(`e cada uma das ${quem.length} funções que as movem ainda existe`, semQuem.length === 0, semQuem.join(","));
  const sobrevivemFora = G.SOBREVIVEM_AO_DESFEITO.filter((c) => !temNoSave(c));
  t("os campos que sobrevivem ao desfeito são campos do save de verdade", sobrevivemFora.length === 0, sobrevivemFora.join(","));
  t("e nenhum campo do mundo sobrevive ao desfeito",
    G.O_QUE_O_TURNO_ANDA.every((l) => !G.SOBREVIVEM_AO_DESFEITO.includes(l.campo)));

  /* ONDE O RELÓGIO ANDA HOJE — medido, é a razão desta etapa: em
     `agirInterno`, antes de `enviar`, e dentro de `enviar` antes da
     chamada ao Mestre. O desfeito existe porque isto é verdade. */
  const ag = APP.indexOf("const agirInterno = (texto) => {");
  const minutosAqui = APP.indexOf("avancarMinutos(MINUTOS_POR_TURNO)", ag);
  const primeiroEnviarDepois = APP.indexOf("fecharMeuTurno(persG, (rvG) => {", ag);
  t("hoje o relógio anda em `agirInterno` ANTES de o turno partir para o Mestre",
    ag > 0 && minutosAqui > ag && primeiroEnviarDepois > minutosAqui);
  const en = APP.indexOf("const enviar = useCallback(async (conteudo, persAtual, histBase) => {");
  const anda = APP.indexOf("talvezAndarNaCidade(conteudo);", en);
  const chama = APP.indexOf("await chamarMestre(systemRef.current, novoHist)", en);
  t("e dentro de `enviar` a caminhada anda ANTES da chamada ao Mestre", en > 0 && anda > en && chama > anda);
  t("são cinco minutos por turno escrito (a tabela do calendário)", MINUTOS_POR_TURNO === 5);
});

/* ============================================================ */
sec("7. LIXO, NULL, IMUTABILIDADE, DETERMINISMO");
bloco(() => {
  const LIXO = [null, undefined, 0, "", "texto", [], {}, 42, true];
  let estourou = "";
  for (const x of LIXO) {
    try {
      G.lerOSilencio(x, x); G.narrativaFaltou(x); G.fotografarOTurno(x);
      G.destinoDaFalha(x); G.turnoNaoAconteceu(x, x); G.turnoNaoAconteceu(G.fotografarOTurno({ retrato: {} }), x);
    } catch (e) { estourou += `${String(x)}: ${e.message}; `; }
  }
  t("nada estoura com lixo (o código roda no caminho de uma falha)", !estourou, estourou);
  const f = G.fotografarOTurno(null);
  t("foto de nada: sem retrato, sem frase, soltos vazios", f.retrato === null && f.frase === "" && Object.keys(f.soltos).length === 0);
  t("foto com retrato em lista não aceita a lista como retrato", G.fotografarOTurno({ retrato: [1, 2] }).retrato === null);
  const d0 = G.destinoDaFalha(null);
  t("destino de nada: o turno que não houve, sem foto, sem frase, com a linha do desconhecido",
    d0.id === "turno_nao_houve" && d0.desfazer === "nada" && d0.frase === "" && d0.silencio.id === "desconhecido");

  /* imutabilidade: a foto congela, e nada do que entra é mexido */
  const retrato = { minuto: 100, lugar: { nome: "A" }, custo: { chamadas: 1 } };
  const copia = JSON.stringify(retrato);
  const foto = G.fotografarOTurno({ frase: "vou", retrato, soltos: { nota: "n" } });
  retrato.minuto = 999;
  t("a foto não vê a mudança feita no objeto depois de tirada", foto.retrato.minuto === 100);
  retrato.minuto = 100;
  t("e a foto está congelada", Object.isFrozen(foto) && Object.isFrozen(foto.retrato) && Object.isFrozen(foto.soltos));
  const agoraObj = { minuto: 150, custo: { chamadas: 4 } };
  const agoraAntes = JSON.stringify(agoraObj);
  const rep = G.turnoNaoAconteceu(foto, agoraObj);
  t("repor não muta o retrato de agora nem a foto", JSON.stringify(agoraObj) === agoraAntes && JSON.stringify(foto.retrato) === copia);
  t("e o que devolve é novo e congelado", rep.retrato !== foto.retrato && Object.isFrozen(rep) && Object.isFrozen(rep.retrato));
  t("o campo que o turno criou não volta", !("novo" in G.turnoNaoAconteceu(foto, { novo: 1 }).retrato));

  /* determinismo: a mesma entrada dá a mesma saída, byte a byte */
  const ent = { motivo: "Limite diário alcançado (500 chamadas).", conteudo: "vou", fuso: 180, inicio: foto, envio: foto };
  t("mesma entrada, mesmo destino — byte a byte", JSON.stringify(G.destinoDaFalha(ent)) === JSON.stringify(G.destinoDaFalha(ent)));
  t("e a entrada do destino não foi mexida", ent.inicio === foto && ent.conteudo === "vou");

  /* o bloco novo não traz relógio nem sorte — o módulo inteiro continua
     sem eles (teste-guardado.mjs prova o arquivo; aqui, o bloco MM15) */
  const FONTE = readFileSync("../src/guardado.js", "utf8");
  const bloco = FONTE.slice(FONTE.indexOf("MM15 (3) — O TURNO QUE NÃO ACONTECEU")).replace(/\/\*[\s\S]*?\*\//g, "");
  t("o bloco MM15 não tem relógio, sorte, rede nem React",
    bloco.length > 1000 && !/Math\.random\s*\(|Date\.now\s*\(|new Date\s*\(|\bfetch\s*\(|localStorage|from "react/.test(bloco));
});

/* ============================================================ */
sec("8. A FIAÇÃO NO APP — por texto (fim de linha normalizado)");
bloco(() => {
  const A = APP.replace(/\r\n/g, "\n");

  /* O CATCH DE `enviar` CHAMA `destinoDaFalha` E `turnoNaoAconteceu` —
     é ali, e só ali, que a decisão do motor vira reposição de tela. */
  const iCatch = A.indexOf("} catch (e) {\n      /* MM15 (3): o valor de sempre");
  t("achei o catch de `enviar`", iCatch > 0);
  const janelaCatch = iCatch > 0 ? A.slice(iCatch, iCatch + 4000) : "";
  t("o catch chama `destinoDaFalha`", janelaCatch.includes("destinoDaFalha("));
  t("e chama `turnoNaoAconteceu`", janelaCatch.includes("turnoNaoAconteceu("));
  t("e aplica o retrato reposto por `aplicarRetrato`", janelaCatch.includes("aplicarRetrato(repos.retrato)"));

  /* `respondeu = true` SÓ DEPOIS do `await chamarMestre` — antes disso,
     uma queda ainda é a ligação, nunca o tropeço do app. */
  const iChamada = A.indexOf("await chamarMestre(systemRef.current, novoHist)");
  const iRespondeuDeclarado = A.indexOf("let respondeu = false;");
  const iRespondeu = A.indexOf("respondeu = true", iChamada);
  t("achei a chamada ao Mestre em `enviar`", iChamada > 0);
  t("existe `let respondeu = false` antes do `try`", iRespondeuDeclarado > 0 && iRespondeuDeclarado < iChamada);
  t("`respondeu = true` vem DEPOIS do `await chamarMestre`", iChamada > 0 && iRespondeu > iChamada);

  /* `salvar` GRAVA O MESMO RETRATO que a foto usa — a suíte do save prova
     o byte a byte; aqui só se prova que a fiação foi trocada de verdade. */
  t("existe `retratoDoJogo`", A.includes("const retratoDoJogo = "));
  t("`salvar` monta `dados` com `retratoDoJogo()` e `...extra`, sem reescrever o literal",
    A.includes("const dados = { ...retratoDoJogo(), ...extra };"));

  /* A FOTO, nos dois lugares em que um turno pode começar: o texto
     digitado (`agirInterno`, logo depois da trava) e o topo de `enviar`
     (a foto do envio, que existe mesmo quando não há foto do início). */
  const iAgirInterno = A.indexOf("const agirInterno = (texto) => {");
  t("achei `agirInterno`", iAgirInterno > 0);
  const iTrava = A.indexOf("if (travaODeclarar(guardadoRef.current)) { aMesaEspera(); return; }", iAgirInterno);
  t("achei a trava em `agirInterno`", iTrava > iAgirInterno);
  const depoisDaTrava = iTrava > 0 ? A.slice(iTrava, iTrava + 500) : "";
  t("logo depois da trava, `agirInterno` fotografa o início do turno",
    depoisDaTrava.includes("fotoInicioRef.current = fotografarOTurno("));
  const iEnviar = A.indexOf("const enviar = useCallback(async (conteudo, persAtual, histBase) => {");
  t("achei `enviar`", iEnviar > 0);
  const topoDoEnviar = iEnviar > 0 ? A.slice(iEnviar, iEnviar + 900) : "";
  t("no topo de `enviar` a foto do envio é tirada", topoDoEnviar.includes("fotoEnvio = fotografarOTurno("));

  /* `falha.linha` NA TELA, por baixo de `falha.casa` — a segunda metade
     do que o jogador lê, sem tirar `falha.casa`/`falha.podeTentar` de lá
     (o `check-guardado` continua a exigir os dois). */
  const iJsx = A.indexOf("{falha && !carregando && (");
  t("achei o JSX da falha", iJsx > 0);
  const jsxFalha = iJsx > 0 ? A.slice(iJsx, iJsx + 1600) : "";
  t("`falha.casa` continua na tela", jsxFalha.includes("falha.casa"));
  t("`falha.podeTentar` continua a decidir o botão", jsxFalha.includes("falha.podeTentar"));
  t("e `falha.linha` aparece por baixo, na mesma peça",
    jsxFalha.includes("falha.linha") && jsxFalha.indexOf("falha.casa") < jsxFalha.indexOf("falha.linha"));

  /* O RETENTAR: quando o turno não aconteceu, tentar de novo reescreve a
     MESMA frase pelo caminho comum (`agirInterno`) — nunca reenvia um
     envelope que o motor nunca chegou a montar. */
  t("`retentar` distingue o reenvio por frase do reenvio por envelope",
    A.includes('if (f.reenvio === "frase" && f.frase) { agirInterno(f.frase); return; }'));
});

console.log(`\nmm15-ligacao: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
