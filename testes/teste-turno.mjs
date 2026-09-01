/* teste-turno.mjs (v9.61) — o mestre de código.
   A ordem do turno vira DADO, e por isso vira asserção. Os três bugs de
   ordem desta semana entram aqui como regressão nomeada.            */
import {
  PORTAS_DO_TURNO, portaPorId, decidirTurno, portasQueAbrem, garantirSinais,
  cascataDoTurno, proximaPorta, linhaDaDecisao,
} from "../src/turno.js";
import {
  consultar, chaveDoFato, garantirFatos, registrarFato, fatoValido, duracaoDoTipo,
  iniciativaDoMundo, podeIniciativa, envelopeDaIniciativa, linhaDaIniciativa,
  MOVIMENTOS_DO_MUNDO, RITMO_DO_MUNDO, envelopeDoOraculo, linhaDaConsulta, GRAUS,
  PERGUNTAS_DO_SISTEMA, perguntaDoSistemaPorId, perguntarPeloSistema,
  envelopeDaPerguntaDoSistema, linhaDaPerguntaDoSistema, calcularChance,
} from "../src/oraculo.js";

let ok = 0, mal = 0;
const t = (nome, cond) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome); } };
const sec = (s) => console.log("\n" + s);

sec("1. a ordem existe, é completa e termina em algum lugar");
{
  t("as portas têm id, pergunta e razão", PORTAS_DO_TURNO.every((p) => p.id && typeof p.quando === "function" && p.porque && p.porque.length > 20));
  t("os ids são únicos", new Set(PORTAS_DO_TURNO.map((p) => p.id)).size === PORTAS_DO_TURNO.length);
  t("a última porta abre sempre — nenhum turno fica sem dono", PORTAS_DO_TURNO[PORTAS_DO_TURNO.length - 1].quando({}) === true);
  t("e ela é a cena: ir ao Mestre é decisão, não resto", PORTAS_DO_TURNO[PORTAS_DO_TURNO.length - 1].id === "cena");
  t("sinal vazio não quebra", decidirTurno(null).id === "cena" && decidirTurno({}).id === "cena");
  t("portaPorId acha e recusa", portaPorId("desafio").id === "desafio" && portaPorId("voar") === null);
}

sec("2. REGRESSÃO — os três bugs de ordem desta semana");
{
  /* (1) "Vou até o Javali Cambaleante": tem verbo de partida E um alvo a pé.
     O resolver de destinos comia isto e respondia "não encontrei no que você
     conhece do mundo", matando o turno. */
  const d1 = decidirTurno({ querPartir: true, temAlvoLocal: true });
  t("alvo a pé + verbo de partida → desafio, nunca destino", d1.id === "desafio");
  t("e as duas portas de fato disputavam", portasQueAbrem({ querPartir: true, temAlvoLocal: true }).includes("destino"));
  t("sem alvo a pé, aí sim é destino", decidirTurno({ querPartir: true }).id === "destino");

  /* (2) e (3) o botão do mapa e o painel de Ações chamavam por fora. A porta
     não distingue teclado de botão — quem entra pelo mesmo sinal recebe a
     mesma decisão, e é isso que fecha as duas portas dos fundos. */
  const teclado = decidirTurno({ ehDesafio: true });
  const botao = decidirTurno({ ehDesafio: true });
  t("teclado e botão recebem a MESMA decisão", teclado.id === botao.id && teclado.id === "desafio");
}

sec("3. a precedência, uma a uma");
{
  const casos = [
    [{ ehComando: true, ehDesafio: true, ehConjuracao: true }, "comando", "'/' ganha de tudo"],
    [{ temEscolhaPendente: true, ehDesafio: true, querPartir: true }, "resposta", "a resposta a uma pergunta do sistema vem antes de tudo o mais"],
    [{ ehConjuracao: true, ehPortal: true, ehDesafio: true }, "conjurar", "magia nomeada ganha de heurística"],
    [{ ehPortal: true, ehPartidaPorNome: true }, "portal", "o portal existe para pular a estrada"],
    [{ ehEntradaEmMasmorra: true, ehPartidaPorNome: true }, "masmorra", "descer num covil não é abrir estrada"],
    [{ ehSeguirViagem: true, emViagem: true, querPartir: true }, "seguir", "quem está na estrada avança nela"],
    [{ ehPartidaPorNome: true, querPartir: true }, "partida", "o nome literal ganha da descrição"],
    [{ ehDesafio: true, querPartir: true, ehPerguntaAoMundo: true }, "desafio", "a ação declarada ganha da pergunta"],
    [{ ehPerguntaAoMundo: true }, "oraculo", "pergunta fechada é do oráculo"],
    [{ temMilagreArmado: true, temHabilidadesSelecionadas: true }, "milagre", "o milagre É o turno"],
    [{ temHabilidadesSelecionadas: true }, "habilidades", "o painel resolve o turno"],
    [{}, "cena", "o que não é regra é ficção"],
  ];
  for (const [sinais, esperado, porque] of casos) {
    const d = decidirTurno(sinais);
    t(`${esperado}: ${porque}`, d.id === esperado);
  }
}

sec("4. as portas que NÃO abrem quando não devem");
{
  t("seguir viagem exige estar em viagem", decidirTurno({ ehSeguirViagem: true }).id !== "seguir");
  t("o oráculo não rouba o turno no meio da luta", decidirTurno({ ehPerguntaAoMundo: true, emCombate: true }).id !== "oraculo");
  t("mas fora dela, sim", decidirTurno({ ehPerguntaAoMundo: true }).id === "oraculo");
  t("bloqueado não decide nada", decidirTurno({ ehDesafio: true, bloqueado: true }).id === "bloqueado");
  t("a decisão diz por que passou por cada porta", decidirTurno({ ehPerguntaAoMundo: true }).descartadas.includes("desafio"));
  t("e a linha de diagnóstico é legível", /turno → oraculo/.test(linhaDaDecisao(decidirTurno({ ehPerguntaAoMundo: true }))));
  t("sinais desconhecidos são ignorados, não confundidos", garantirSinais({ xyz: true }).texto === "");
}

sec("5. o mundo não pisca — o livro de fatos");
{
  const c1 = consultar("tem uma saída pelos fundos?", { lugar: "a taverna" }, { sorte: () => 0.1 });
  t("a primeira vez rola", c1.reusado === false && c1.rolo > 0);
  const fatos = registrarFato({}, c1.chave, c1, { dia: 3, cena: 1 });
  const c2 = consultar("tem uma saída pelos fundos?", { lugar: "a taverna", dia: 3, cena: 1 }, { sorte: () => 0.99, fatos });
  t("a segunda vez NÃO rola", c2.reusado === true && c2.rolo === 0);
  t("e devolve exatamente a mesma resposta", c2.grau.id === c1.grau.id);
  t("mesmo com um dado que daria o contrário", c2.grau.id === c1.grau.id);

  /* a mesma pergunta escrita de outro jeito é a mesma pergunta */
  t("'há saída pelos fundos?' é a mesma chave", chaveDoFato("tem uma saída pelos fundos?", "a taverna") === chaveDoFato("há saída pelos fundos?", "a taverna"));
  t("acento não cria duas realidades", chaveDoFato("o guarda é subornável?", "x") === chaveDoFato("O GUARDA E SUBORNAVEL?", "X"));
  t("mas outro LUGAR é outro fato", chaveDoFato("tem saída pelos fundos?", "a taverna") !== chaveDoFato("tem saída pelos fundos?", "o quartel"));
  t("e outra pergunta é outra chave", chaveDoFato("o guarda é subornável?", "x") !== chaveDoFato("o guarda está armado?", "x"));
}

sec("6. quanto tempo um fato dura");
{
  t("a forma do mundo é permanente", duracaoDoTipo("mundo").id === "permanente");
  t("a disposição de alguém vale pelo dia", duracaoDoTipo("social").id === "dia");
  t("onde está a patrulha vale pela cena", duracaoDoTipo("perigo").id === "cena");

  const perm = { grau: "sim", tipo: "mundo", duracao: "permanente", dia: 1, cena: 1 };
  t("o permanente sobrevive ao dia e à cena", fatoValido(perm, { dia: 99, cena: 99 }));
  const doDia = { grau: "sim", tipo: "social", duracao: "dia", dia: 3, cena: 1 };
  t("o do dia vale hoje", fatoValido(doDia, { dia: 3, cena: 7 }));
  t("e caduca amanhã", !fatoValido(doDia, { dia: 4, cena: 1 }));
  const daCena = { grau: "nao", tipo: "perigo", duracao: "cena", dia: 3, cena: 2 };
  t("o da cena vale nesta cena", fatoValido(daCena, { dia: 3, cena: 2 }));
  t("e caduca na seguinte", !fatoValido(daCena, { dia: 3, cena: 3 }));
  t("nulo nunca vale", !fatoValido(null, {}) && !fatoValido(undefined, {}));

  /* e o efeito disso na consulta: o social esquece, o mundo não */
  const c = consultar("o guarda é subornável?", { lugar: "o portão" }, { sorte: () => 0.1 });
  const f = registrarFato({}, c.chave, c, { dia: 3, cena: 1 });
  t("no mesmo dia, reusa", consultar("o guarda é subornável?", { lugar: "o portão", dia: 3, cena: 1 }, { fatos: f }).reusado);
  t("no dia seguinte, rola de novo", !consultar("o guarda é subornável?", { lugar: "o portão", dia: 4, cena: 1 }, { fatos: f }).reusado);
}

sec("7. o livro aguenta save sujo");
{
  t("vazio não quebra", Object.keys(garantirFatos(null)).length === 0);
  t("lixo é descartado", Object.keys(garantirFatos({ a: 1, b: "x", c: {}, d: { grau: "sim" } })).length === 1);
  t("o texto da pergunta é truncado — o save não pode inchar", garantirFatos({ k: { grau: "sim", pergunta: "x".repeat(500) } }).k.pergunta.length <= 160);
}

sec("8. o envelope do fato reusado");
{
  const c = consultar("tem uma saída pelos fundos?", { lugar: "a taverna" }, { sorte: () => 0.1 });
  const f = registrarFato({}, c.chave, c, { dia: 1, cena: 1 });
  const r = consultar("tem uma saída pelos fundos?", { lugar: "a taverna", dia: 1, cena: 1 }, { fatos: f });
  const env = envelopeDoOraculo(r);
  t("diz que já tinha sido respondida", /JÁ RESPONDIDA/.test(env));
  t("e que não houve rolagem nova", /não houve rolagem nova/.test(env));
  t("proíbe mudar a resposta", /NÃO mude a resposta/.test(env));
  t("e pede que não se redescubra com espanto", /sem redescobri-la com espanto/.test(env));
  /* v9.70: a linha da tela deixou de distinguir reuso de rolagem nova, e é
     de propósito — "o mundo já respondeu isto" é o motor explicando o
     próprio funcionamento. Para o jogador, a resposta é a mesma coisa das
     duas vezes, que é exatamente o ponto do livro de fatos. */
  t("a linha na tela mostra a resposta", new RegExp(r.grau.rotulo).test(linhaDaConsulta(r)));
  t("e não mostra mais a conta do motor", !/%|rolou|no fio/.test(linhaDaConsulta(r)));
  t("o envelope normal continua inteiro", /RESPONDIDA PELO SISTEMA/.test(envelopeDoOraculo(c)));
}

sec("9. a iniciativa do mundo — e a trava que a torna aceitável");
{
  t("todo movimento tem id, peso, condição e fio", MOVIMENTOS_DO_MUNDO.every((m) => m.id && m.peso > 0 && typeof m.quando === "function" && typeof m.fio === "function" && m.diz));
  t("os ids são únicos", new Set(MOVIMENTOS_DO_MUNDO.map((m) => m.id)).size === MOVIMENTOS_DO_MUNDO.length);

  /* a trava: sem fio aberto, o mundo não se mexe. É isto que impede o
     sistema de inventar trama — ele só escolhe entre o que já existe. */
  t("sem nada aberto, não há iniciativa", iniciativaDoMundo({ desdeUltima: 99 }, { sorte: () => 0.01 }) === null);
  const comFio = { desdeUltima: 99, relogioQuaseCheio: { nome: "A caçada do barão" } };
  const mv = iniciativaDoMundo(comFio, { sorte: () => 0.01 });
  t("com um relógio quase cheio, há", mv && mv.id === "relogio");
  t("e o fio é o que já existia, nomeado", mv && /caçada do barão/.test(mv.fio));

  /* ritmo: não interrompe o que já é cena do jogador */
  t("não se mexe no meio da luta", !podeIniciativa({ emCombate: true, desdeUltima: 99, relogioQuaseCheio: { nome: "x" } }));
  t("nem na masmorra", !podeIniciativa({ emMasmorra: true, desdeUltima: 99 }));
  t("nem na estrada", !podeIniciativa({ emViagem: true, desdeUltima: 99 }));
  t("nem antes da cadência", !podeIniciativa({ desdeUltima: 1 }));
  t("a cadência é larga de propósito", RITMO_DO_MUNDO.cada >= 5);

  /* frequência medida: a maior parte dos turnos NÃO tem iniciativa */
  let vezes = 0;
  for (let i = 0; i < 5000; i++) if (iniciativaDoMundo({ desdeUltima: 99, emCidade: true, relogioQuaseCheio: { nome: "x" } })) vezes++;
  const pct = (vezes / 5000) * 100;
  console.log(`      dos turnos ELEGÍVEIS, ${pct.toFixed(0)}% têm iniciativa`);
  t("nem todo turno elegível se mexe", pct < 60 && pct > 25);

  /* o relógio pesa mais que o boato — o fio que o jogo já disse que ia
     estourar tem prioridade sobre a cor de ambiente */
  const conta = { relogio: 0, boato: 0 };
  const ctx = { desdeUltima: 99, emCidade: true, relogioQuaseCheio: { nome: "x" } };
  for (let i = 0; i < 4000; i++) { const m = iniciativaDoMundo(ctx); if (m) conta[m.id] = (conta[m.id] || 0) + 1; }
  console.log(`      relógio ${conta.relogio} · boato ${conta.boato}`);
  t("o relógio ganha do boato", conta.relogio > conta.boato);
}

sec("10. o envelope da iniciativa proíbe inventar");
{
  const env = envelopeDaIniciativa({ id: "relogio", diz: "algo que já estava se fechando dá mais um passo", fio: "A caçada do barão" });
  t("diz que o fio já existe", /JÁ EXISTE no jogo/.test(env));
  t("proíbe trama nova", /NÃO invente uma trama nova/.test(env));
  t("proíbe abrir segundo fio", /NÃO abra um segundo fio/.test(env));
  t("proíbe resolver na hora", /NÃO resolva este aqui/.test(env));
  t("proíbe virar combate sozinho", /NÃO transforme isto num combate/.test(env));
  t("e exige entrelaçar, não colar ao lado", /ENTRELAÇADO/.test(env) && /não como parágrafo separado/.test(env));
  t("nulo não vira envelope", envelopeDaIniciativa(null) === "" && linhaDaIniciativa(null) === "");
}

sec("10b. as regras param de delegar — o sistema pergunta a si mesmo");
{
  /* ontem o envelope de barulho dizia "se houver alguém por perto, ELE OUVIU
     — isto é seu para narrar". Era o sistema pedindo à IA que decidisse um
     fato do mundo, e no pior lugar: a IA decide olhando a cena que quer. */
  t("o catálogo tem id, tipo, pergunta e os dois lados", PERGUNTAS_DO_SISTEMA.every((q) => q.id && q.tipo && typeof q.pergunta === "function" && q.seSim && q.seNao));
  t("os ids são únicos", new Set(PERGUNTAS_DO_SISTEMA.map((q) => q.id)).size === PERGUNTAS_DO_SISTEMA.length);
  t("id inventado devolve null", perguntaDoSistemaPorId("voar") === null && perguntarPeloSistema("voar", {}) === null);

  const cheio = perguntarPeloSistema("ouviram", { movimento: 3, lugar: "o salão" }, { sorte: () => 0.5 });
  const vazio = perguntarPeloSistema("ouviram", { movimento: 0, lugar: "a cripta" }, { sorte: () => 0.5 });
  console.log("      salão cheio " + cheio.chance + "% · cripta vazia " + vazio.chance + "%");
  t("num salão cheio é muito mais provável que ouçam", cheio.chance > vazio.chance + 30);
  t("e o motivo aparece, não só o número", cheio.porque.some((x) => /cheio de gente/.test(x)));
  t("a noite ajuda a esconder", perguntarPeloSistema("ouviram", { movimento: 2, noite: true }, { sorte: () => 0.5 }).chance < perguntarPeloSistema("ouviram", { movimento: 2 }, { sorte: () => 0.5 }).chance);

  /* O BUG QUE O TIPO FORÇADO EVITA: "alguém ouviu o barulho?" não tem palavra
     nenhuma da tabela de perigo. Sem forçar, cairia em "mundo" e viraria fato
     PERMANENTE — o corredor ficaria vazio para o resto da campanha. */
  t("a pergunta do barulho é de PERIGO, não do mundo", calcularChance("alguém ouviu o barulho?", { tipoForcado: "perigo" }).tipo === "perigo");
  t("e sem forçar cairia em mundo — que era o bug", calcularChance("alguém ouviu o barulho?", {}).tipo === "mundo");
  t("logo o fato dura só a CENA", duracaoDoTipo(perguntaDoSistemaPorId("ouviram").tipo).id === "cena");

  const env = envelopeDaPerguntaDoSistema(cheio, { oQue: "Eu fiz barulho ao arrombar a porta" });
  t("o envelope diz que quem perguntou foi o sistema", /PERGUNTADO PELO PRÓPRIO SISTEMA/.test(env));
  t("e que a resposta veio antes da cena", /decidido antes de você saber que cena viria/.test(env));
  t("proíbe mencionar a mecânica", /não mencione oráculo, chance, dado nem sistema/.test(env));
  t("e traz o que fazer com o lado que saiu", env.includes((/^sim/.test(cheio.grau.id) ? cheio.seSim : cheio.seNao).slice(0, 25)));
  t("nulo não vira envelope", envelopeDaPerguntaDoSistema(null) === "" && linhaDaPerguntaDoSistema(null) === "");

  /* e entra no MESMO livro de fatos: dois arrombamentos na mesma cena e no
     mesmo lugar não podem dar duas casas diferentes */
  const f = registrarFato({}, cheio.chave, cheio, { dia: 1, cena: 1 });
  const dnv = perguntarPeloSistema("ouviram", { movimento: 3, lugar: "o salão", dia: 1, cena: 1 }, { fatos: f, sorte: () => 0.99 });
  t("perguntada de novo na mesma cena, não rola", dnv.reusado === true);
  t("e a casa continua a mesma", dnv.grau.id === cheio.grau.id);
}

sec("10c. a testemunha: falhar em silêncio não é falhar em segredo");
{
  const dia = perguntarPeloSistema("viram", { movimento: 3 }, { sorte: () => 0.5 });
  const noite = perguntarPeloSistema("viram", { movimento: 3, noite: true }, { sorte: () => 0.5 });
  console.log("      visto de dia " + dia.chance + "% · de noite " + noite.chance + "%");
  t("de noite se vê muito menos", noite.chance < dia.chance - 10);
  t("num ermo vazio, quase ninguém vê", perguntarPeloSistema("viram", { movimento: 0 }, { sorte: () => 0.5 }).chance < dia.chance - 25);
  /* a noite pesa MAIS na vista do que no ouvido: escuro esconde o gesto,
     não o estrondo */
  const ouvidoDia = perguntarPeloSistema("ouviram", { movimento: 3 }, { sorte: () => 0.5 }).chance;
  const ouvidoNoite = perguntarPeloSistema("ouviram", { movimento: 3, noite: true }, { sorte: () => 0.5 }).chance;
  t("e pesa mais na vista do que no ouvido", (dia.chance - noite.chance) > (ouvidoDia - ouvidoNoite));
  t("o lado 'não' proíbe plantar testemunha depois", /sem plantar uma testemunha depois/.test(perguntaDoSistemaPorId("viram").seNao));
  t("e o lado 'sim' exige dizer o que a pessoa FAZ", /o que essa pessoa faz com o que viu/.test(perguntaDoSistemaPorId("viram").seSim));
}

sec("11. a regra que o Mestre recebe");
{
  /* v9.131: o TURNO_PROMPT morreu, e o que ele dizia subiu para a PRIMEIRA
     coisa que o Narrador lê. Ele era, palavra por palavra, o contrato de
     abertura — a mesma divisão, a mesma regra do envelope. Duas cópias da
     fronteira entre o sistema e quem narra é o começo de duas fronteiras.

     A prova continua sendo a mesma pergunta, no lugar novo: o contrato tem
     de dizer as quatro coisas que o bloco dizia. */
  const CONTRATO = (await import("../src/prompt.js")).montarSystemPrompt(
    "C", { genero: "Fantasia medieval" },
    { nome: "B", nivel: 1, atributos: { forca: 1, destreza: 1, vigor: 1, intelecto: 1, presenca: 1, percepcao: 1 } },
    {}, { elenco: [], cidades: [], tavernas: [] }, "", "", "", "", "", "", "", {});
  t("o bloco duplicado nao existe mais", !/QUEM DECIDE O QU/.test(CONTRATO));
  t("o Narrador sabe que nao e o Mestre", /O Mestre desta mesa não é você: é o sistema/.test(CONTRATO));
  t("explica o turno sem envelope", /SEM envelope: é cena/.test(CONTRATO));
  t("e a divisão de trabalho", /o sistema decide o QUE existe e o QUE acontece/.test(CONTRATO));
  t("sem tirar da IA o que ela faz bem", /CONTAR COMO ACONTECEU/.test(CONTRATO));
}

sec("12. A CASCATA (v9.63) — o que acontece quando a porta que ganhou recusa");
{
  const ids = PORTAS_DO_TURNO.map((p) => p.id);
  t("toda porta declara fase, executor e o que fazer se recusar",
    PORTAS_DO_TURNO.every((p) => (p.fase === "atalho" || p.fase === "turno") && p.faz && p.seRecusar));
  /* as duas fases não se misturam: o relógio do turno mora entre elas, e
     uma porta de atalho depois dele cobraria 45 minutos que não são dela */
  const primeiraDeTurno = PORTAS_DO_TURNO.findIndex((p) => p.fase === "turno");
  t("os atalhos vêm todos antes das portas de turno",
    PORTAS_DO_TURNO.every((p, i) => (i < primeiraDeTurno) === (p.fase === "atalho")));
  t("a fase de turno é milagre, habilidades e cena",
    PORTAS_DO_TURNO.filter((p) => p.fase === "turno").map((p) => p.id).join(",") === "milagre,habilidades,cena");
  /* um `seRecusar` que aponta para trás é um laço: o turno voltaria a uma
     porta que já recusou */
  t("todo seRecusar nomeado aponta para uma porta que vem DEPOIS",
    PORTAS_DO_TURNO.every((p, i) => ["seguinte", "cena"].includes(p.seRecusar) || ids.indexOf(p.seRecusar) > i));

  /* ---- REGRESSÃO: a recusa do desafio não pode virar estrada ---- */
  const javali = cascataDoTurno({ temAlvoLocal: true, querPartir: true });
  t("'vou até o Javali Cambaleante' ainda acorda o desafio e o destino",
    javali.atalhos.map((p) => p.id).join(",") === "desafio,destino");
  {
    const depois = proximaPorta(javali.atalhos, 0);
    t("mas o desafio recusando NÃO cai no destino — a estrada não recolhe o que sobra",
      depois >= javali.atalhos.length);
  }
  /* ---- e a recusa do desafio ainda alcança o oráculo ---- */
  {
    const c = cascataDoTurno({ ehDesafio: true, querPartir: true, ehPerguntaAoMundo: true });
    const depois = proximaPorta(c.atalhos, 0);
    t("com uma pergunta ao mundo aberta, a recusa do desafio cai no oráculo",
      c.atalhos[depois] && c.atalhos[depois].faz === "oraculo");
    t("e pula o destino no caminho", c.atalhos[depois].id === "oraculo" && depois > 1);
  }
  /* ---- REGRESSÃO: a divergência que a v9.61 deixou passar ----
     Com uma escolha pendente na tela, a tabela manda "resposta" ganhar de
     "conjurar" — e o arquivo fazia o contrário. Uma resposta que citasse o
     nome de uma magia lançava a magia em vez de responder à pergunta. */
  {
    const c = cascataDoTurno({ temEscolhaPendente: true, ehConjuracao: true });
    t("a resposta à pergunta age ANTES da conjuração", c.atalhos[0].faz === "movimento");
    t("e a conjuração continua logo atrás, se a resposta não for resposta",
      c.atalhos[proximaPorta(c.atalhos, 0)].faz === "conjurar");
  }
  /* ---- o executor de movimento é chamado UMA vez, nunca seis ---- */
  {
    const c = cascataDoTurno({ temEscolhaPendente: true, ehPortal: true, ehPartidaPorNome: true, querPartir: true });
    t("seis portas de viagem, um só executor na cascata",
      c.atalhos.filter((p) => p.faz === "movimento").length === 1);
    t("e é a primeira delas que fica", c.atalhos[0].id === "resposta");
  }
  /* ---- a fase de turno ---- */
  {
    const c = cascataDoTurno({ temMilagreArmado: true, temHabilidadesSelecionadas: true });
    t("o milagre é o trabalho do turno, não a sequência de habilidades", c.turno[0].faz === "milagre");
    t("nenhum atalho aparece na fase de turno", c.turno.every((p) => ["milagre", "habilidades", "cena"].includes(p.id)));
  }
  t("sem nada selecionado, o trabalho do turno é a cena", cascataDoTurno({}).turno[0].faz === "cena");
  t("a cena está sempre na fase de turno", cascataDoTurno({ ehComando: true }).turno.some((p) => p.faz === "cena"));
  t("cascata aguenta sinal nulo", cascataDoTurno(null).turno.length === 1);
  t("proximaPorta com lista vazia não estoura", proximaPorta([], 0) === 0 && proximaPorta(null, 3) === 0);

  /* ---- a decisão e a cascata contam a MESMA história ---- */
  {
    const casos = [
      { ehComando: true }, { temEscolhaPendente: true }, { ehConjuracao: true },
      { ehDesafio: true }, { querPartir: true }, { ehPerguntaAoMundo: true },
      { temAlvoLocal: true, querPartir: true }, { temMilagreArmado: true }, {},
    ];
    t("a primeira porta da cascata é sempre a porta que a decisão escolheu",
      casos.every((s) => {
        const c = cascataDoTurno(s);
        const primeira = (c.atalhos[0] || c.turno[0]).id;
        return primeira === decidirTurno(s).id;
      }));
  }
}

sec("13. HÁ O QUE TESTAR? — a pergunta que vem antes do dado (v9.64)");
{
  const meio = { sorte: () => 0.5 };
  t("as seis perguntas do sistema existem", PERGUNTAS_DO_SISTEMA.length === 6);
  t("e todas dizem ao Mestre o que fazer dos dois lados",
    PERGUNTAS_DO_SISTEMA.every((p) => p.seSim.length > 30 && p.seNao.length > 30));

  /* ESCUTAR: o que decide é quanta gente há ao alcance, não a cena */
  const salao = perguntarPeloSistema("haOQueOuvir", { movimento: 3 }, meio);
  const cripta = perguntarPeloSistema("haOQueOuvir", { movimento: 0 }, meio);
  console.log("      há o que ouvir: salão cheio " + salao.chance + "% · cripta vazia " + cripta.chance + "%");
  t("num salão cheio quase sempre há o que ouvir", salao.chance >= 70);
  t("numa cripta vazia, quase nunca", cripta.chance <= 25);
  t("e de madrugada se ouve menos", perguntarPeloSistema("haOQueOuvir", { movimento: 3, noite: true }, meio).chance < salao.chance);
  t("o lado 'não' proíbe o sussurro de consolo", /Não invente um sussurro/.test(perguntaDoSistemaPorId("haOQueOuvir").seNao));
  t("e o lado 'sim' proíbe adiantar o conteúdo", /não adiante o conteúdo antes do resultado/.test(perguntaDoSistemaPorId("haOQueOuvir").seSim));

  /* RASTRO: terra guarda pegada, pedra e chuva não */
  const campo = perguntarPeloSistema("haRastro", {}, meio);
  const rua = perguntarPeloSistema("haRastro", { emCidade: true }, meio);
  const molhado = perguntarPeloSistema("haRastro", { chuva: true }, meio);
  console.log("      há rastro: campo " + campo.chance + "% · rua " + rua.chance + "% · sob chuva " + molhado.chance + "%");
  t("em terra aberta há mais rastro que na rua", campo.chance > rua.chance + 25);
  t("e a chuva lava o chão", molhado.chance < campo.chance - 15);
  t("o lado 'não' proíbe a pegada de consolo", /Não plante uma pegada de consolo/.test(perguntaDoSistemaPorId("haRastro").seNao));

  /* as duas são de CENA, não do mundo: o corredor pode estar mudo agora e
     cheio daqui a uma hora — congelar isso para sempre seria pior que
     perguntar de novo */
  for (const id of ["haOQueOuvir", "haRastro", "vigiado"]) {
    t(`"${id}" dura uma cena, não a campanha`, duracaoDoTipo(perguntaDoSistemaPorId(id).tipo).id === "cena");
  }
  /* e a resposta é estável DENTRO da cena: dois heróis na mesma porta */
  {
    const fatos = garantirFatos({});
    const a = perguntarPeloSistema("haOQueOuvir", { movimento: 2, lugar: "o corredor", dia: 3, cena: 10 }, { sorte: () => 0.5, fatos });
    const f2 = registrarFato(fatos, a.chave, a, { dia: 3, cena: 10 });
    const b = perguntarPeloSistema("haOQueOuvir", { movimento: 2, lugar: "o corredor", dia: 3, cena: 10 }, { sorte: () => 0.99, fatos: f2 });
    t("perguntar duas vezes na mesma cena dá a mesma resposta", b.reusado === true && b.grau.id === a.grau.id);
  }

  /* VIGIADO: o que se guarda decide se há olhos */
  {
    const cofre = perguntarPeloSistema("vigiado", { valioso: true, emCidade: true }, meio);
    const ermo = perguntarPeloSistema("vigiado", {}, meio);
    console.log("      vigiado: cofre na cidade " + cofre.chance + "% · porta no ermo " + ermo.chance + "%");
    t("o que vale a pena é vigiado com mais frequência", cofre.chance > ermo.chance + 20);
  }
}

console.log(`\nturno + oráculo v9.64: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
