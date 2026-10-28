/* teste-sessao.mjs (Fase T3, trilha B · 28/10/2026) — a sessão como arquivo, provada

   src/sessao.js é o formato do arquivo de uma sessão (a semente, o save
   inicial e, por turno, o que entrou de fora: a frase, a sorte, o pedido,
   as respostas cruas do Narrador e do Cronista, o veredito do Juiz e o
   estado do fim do turno), o gravador puro que faz a linha de cada turno,
   o validador, e o replay que corre o motor outra vez com as respostas
   gravadas e diz onde o estado diverge e porquê.

   Esta suíte prova:
     1. o formato é tabela, e o validador a lê: cada campo obrigatório que
        falta é recusado com o caminho dele;
     2. o gravador: a diferença de cada turno refaz o estado byte a byte, e
        nem o lixo nem o arquivo recebido mudam por ele;
     3. o validador recusa o arquivo torto com o caminho do campo, e deixa
        passar o campo que não conhece (o arquivo de amanhã abre hoje);
     4. as três sessões de prova em disco (testes/sessao-s8.json, -s9,
        -s10, escritas por `jogar-em-node.mjs --gravar`) reproduzem turno a
        turno, e cada divergência é da parte do turno que ainda mora no App;
     5. determinismo: o mesmo arquivo dá o mesmo replay;
     6. a divergência plantada é apanhada no turno certo — na resposta do
        Narrador, no estado gravado, no juízo do Cronista e no veredito do
        Juiz;
     7. lixo não derruba;
     8. a dívida do App (AINDA_DO_APP, 28/10): o replay separa a divergência
        do motor (defeito) da do App (dívida, contada à parte), e a tabela
        só encolhe — campo novo nela quebra, e campo que já reproduz e
        continua nela também.

   Os arquivos em disco são o dourado do replay: se o motor mudar o que faz
   com estas respostas, a secção 4 fica vermelha — e a troca, se for
   querida, regera-se com `node jogar-em-node.mjs --gravar`, declarada. */
import fs from "node:fs";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (typeof cond === "function") { try { cond = cond(); } catch (e) { extra = String(e && e.message); cond = false; } }
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);
const J = JSON.stringify;
const copia = (x) => JSON.parse(J(x));

const {
  FORMATO_DA_SESSAO, CAMPOS_DA_SESSAO, PASSOS_DO_REPLAY, DONO_DO_CAMPO, FORA_DA_REGUA, AINDA_DO_APP,
  abrirASessao, linhaDaSessao, gravarOTurno, estadoNoTurno, validarASessao, reproduzirASessao,
} = await import("../src/sessao.js");
const { estadoDoSave, saveDoEstado, camposDoGrupo } = await import("../src/estado.js");

const ler = (f) => JSON.parse(fs.readFileSync(new URL("./" + f, import.meta.url), "utf8"));
const S10 = ler("sessao-s10.json"), S8 = ler("sessao-s8.json"), S9 = ler("sessao-s9.json");
/* o arquivo que o JOGO gravou (a fiação do App, 5199, Narrador falso, 28/10) */
const SN = ler("sessao-navegador.json");

/* um arquivo pequeno e válido, feito pelo próprio gravador */
const E0 = estadoDoSave({ personagem: { nome: "Ilsa", vida: 10, vidaMax: 10, moedas: 12, grupo: [] }, cidadeAtual: "Vau", npcs: {}, canone: {}, mensagens: [] });
const turnoDe = (E, k) => ({
  entrada: { frase: `faço a coisa ${k}` }, sorte: { ponto: `0|${k}|${2 * k}` },
  pedido: { pauta: `ONDE: em Vau\nturno ${k}`, envelopes: "" },
  narrador: { narrativa: `A coisa ${k} acontece.`, mudancas: {} },
  cronista: { proposta: {}, juizo: { aceito: {}, recusado: [], ditoPor: [] } },
  juiz: { resumo: { turno: k, dia: 0, achados: 0, por: {}, pauta: null, trechos: [] } },
  estado: E,
});
const pequeno = () => {
  let a = abrirASessao({ semente: "teste|sessao", estado: E0, origem: "a suíte" });
  let E = E0;
  const estados = [E0];
  E = { ...E, mensagens: [{ autor: "jogador", texto: "a" }] }; a = gravarOTurno(a, turnoDe(E, 1)); estados.push(E);
  E = { ...E, mensagens: [...E.mensagens, { autor: "mestre", texto: "b" }], npcs: { Brom: { nome: "Brom" } } }; a = gravarOTurno(a, turnoDe(E, 2)); estados.push(E);
  E = { ...E, npcs: { ...E.npcs, Dara: { nome: "Dara" } }, personagem: { ...E.personagem, moedas: 9 } }; a = gravarOTurno(a, turnoDe(E, 3)); estados.push(E);
  const { canone, ...semCanone } = E; E = { ...semCanone, npcs: { Dara: { nome: "Dara" }, Brom: { nome: "Brom" } } }; a = gravarOTurno(a, turnoDe(E, 4)); estados.push(E);
  return { a, estados };
};

/* ============================================================ */
sec("1. O FORMATO É TABELA, E O VALIDADOR A LÊ");
{
  t("o formato tem nome e versão (taverna-sessao, 1)", FORMATO_DA_SESSAO.formato === "taverna-sessao" && FORMATO_DA_SESSAO.versao === 1);
  t("a tabela descreve a cabeça, o turno e as sete partes do turno", ["cabeca", "turno", "entrada", "sorte", "pedido", "narrador", "cronista", "juiz", "estado"].every((p) => Array.isArray(CAMPOS_DA_SESSAO[p]) && CAMPOS_DA_SESSAO[p].length));
  /* MOVIDA (28/10, T3-B, o replay num caminho só): o turno ganhou `app`,
     opcional — o que um órgão do App fez no turno, quando quem grava o
     sabe. A intenção fica: os oito da ordem, obrigatórios e nesta ordem. */
  t("o turno leva o que a ordem pede: a entrada, a sorte, o pedido, o Narrador, o Cronista, o Juiz e o estado", J(CAMPOS_DA_SESSAO.turno.filter((c) => c.obrigatorio).map((c) => c.campo)) === J(["n", "entrada", "sorte", "pedido", "narrador", "cronista", "juiz", "estado"]));
  t("e, opcional, o que o App fez no turno (app, lista)", J(CAMPOS_DA_SESSAO.turno.filter((c) => !c.obrigatorio)) === J([{ campo: "app", tipo: "lista", obrigatorio: false }]));
  const { a } = pequeno();
  t("o arquivo que o gravador fez é válido", validarASessao(a).ok, J(validarASessao(a).erros));
  /* a tabela, lida de volta: tirar cada campo obrigatório dá um erro com o caminho dele */
  const faltas = [];
  for (const { campo, obrigatorio } of CAMPOS_DA_SESSAO.cabeca) {
    if (!obrigatorio) continue;
    const x = copia(a); delete x[campo];
    if (!validarASessao(x).erros.some((e) => e.caminho === campo && e.motivo === "falta")) faltas.push(campo);
  }
  for (const { campo, obrigatorio } of CAMPOS_DA_SESSAO.turno) {
    if (!obrigatorio) continue;
    const x = copia(a); delete x.turnos[1][campo];
    if (!validarASessao(x).erros.some((e) => e.caminho === `turnos[1].${campo}` && e.motivo === "falta")) faltas.push(`turnos[1].${campo}`);
  }
  for (const parte of ["sorte", "pedido", "narrador", "cronista", "juiz"]) {
    for (const { campo, obrigatorio } of CAMPOS_DA_SESSAO[parte]) {
      if (!obrigatorio) continue;
      const x = copia(a); delete x.turnos[2][parte][campo];
      if (!validarASessao(x).erros.some((e) => e.caminho === `turnos[2].${parte}.${campo}`)) faltas.push(`turnos[2].${parte}.${campo}`);
    }
  }
  t("cada campo obrigatório da tabela, tirado, é recusado com o caminho dele", faltas.length === 0, faltas.join(", "));
  t("os passos do replay são os do App, na ordem dele", J(PASSOS_DO_REPLAY.map((p) => p.passo)) === J(["o sítio pela frase", "o turno do Mestre", "o códex", "a chegada", "o Cronista"]) && PASSOS_DO_REPLAY.every((p) => typeof p.faz === "function" && p.de));
  t("fora da régua: o bastidor inteiro de estado.js e o relato", camposDoGrupo("bastidor").every((c) => FORA_DA_REGUA[c]) && FORA_DA_REGUA.mensagens && FORA_DA_REGUA.historico && !FORA_DA_REGUA.personagem && !FORA_DA_REGUA.npcs);
  /* MOVIDA (28/10, T3-B): o campo sem dono deixou de ser «é do App» — o que
     é do App está agora em AINDA_DO_APP, com o órgão; o que não está em
     nenhuma das duas tabelas é defeito até alguém o reclamar. */
  t("e todo campo tem dono (o que não está em nenhuma tabela é defeito «sem dono»)", typeof DONO_DO_CAMPO["*"] === "string" && /sem dono/.test(DONO_DO_CAMPO["*"]) && /defeito/.test(DONO_DO_CAMPO["*"]) && ["cidadeAtual", "lugar", "jornada", "npcs", "personagem", "combate"].every((c) => DONO_DO_CAMPO[c]));
}

sec("2. O GRAVADOR — a diferença refaz o estado, byte a byte");
{
  const { a, estados } = pequeno();
  const certos = estados.map((E, n) => J(estadoNoTurno(a, n)) === J(copia(saveDoEstado(E))));
  t(`cada um dos ${estados.length} estados volta igual, chave a chave e na mesma ordem`, certos.every(Boolean), J(certos));
  t("o relato que cresce vai como soma (só o que entrou)", J(a.turnos[1].estado.soma) === J({ mensagens: [{ autor: "mestre", texto: "b" }] }));
  t("a gente nova vai como chave posta (não o registo inteiro)", J(a.turnos[2].estado.chaves.npcs) === J({ poe: { Dara: { nome: "Dara" } } }));
  t("o campo que mudou de ordem vai inteiro (a diferença não refaz a ordem)", a.turnos[3].estado.troca && J(Object.keys(a.turnos[3].estado.troca.npcs)) === J(["Dara", "Brom"]));
  /* o campo que sai do estado: o save o põe de volta com o padrão (null), e a diferença diz isso */
  t("o campo que sai do estado volta com o padrão do save", estadoNoTurno(a, 4).canone === null && a.turnos[3].estado.troca && a.turnos[3].estado.troca.canone === null);
  t("e o turno que não muda nada no estado grava a diferença vazia", J(gravarOTurno(a, turnoDe(estados[4], 5)).turnos[4].estado) === "{}");
  t("as linhas são numeradas em ordem, sem buracos", a.turnos.map((x) => x.n).join(",") === "1,2,3,4");
  /* imutabilidade: o arquivo recebido e o turno recebido não mudam */
  const congela = (x) => { if (x && typeof x === "object") { Object.values(x).forEach(congela); Object.freeze(x); } return x; };
  const fixo = congela(copia(a)), tu = congela(copia(turnoDe(estados[4], 5)));
  let mexeu = false;
  try { gravarOTurno(fixo, tu); } catch { mexeu = true; }
  t("gravar não mexe no arquivo nem no turno recebidos (correm congelados)", !mexeu && gravarOTurno(fixo, tu).turnos.length === 5 && fixo.turnos.length === 4);
  /* o eco do Juiz: as narrações de antes já estão no arquivo */
  const comEco = gravarOTurno(a, { ...turnoDe(estados[4], 5), juiz: { resumo: { turno: 5 }, entrada: { frase: "x", antes: ["A coisa 3 acontece.", "A coisa 4 acontece."], gente: [] } } });
  const lj = comEco.turnos[4].juiz;
  t("a entrada do Juiz não repete as narrações que o arquivo já tem (guarda quantas são)", lj.antesDoArquivo === 2 && !("antes" in lj.entrada));
  const semEco = gravarOTurno(a, { ...turnoDe(estados[4], 5), juiz: { resumo: { turno: 5 }, entrada: { frase: "x", antes: ["outra coisa"], gente: [] } } });
  t("e guarda-as inteiras quando não são as do arquivo", J(semEco.turnos[4].juiz.entrada.antes) === J(["outra coisa"]) && !("antesDoArquivo" in semEco.turnos[4].juiz));
  /* lixo */
  let estourou = false;
  try { linhaDaSessao(null, null); linhaDaSessao({ entrada: 7, sorte: null, narrador: "x", cronista: [] }, {}); gravarOTurno(null, null); abrirASessao(null); } catch { estourou = true; }
  t("lixo no gravador não estoura", !estourou);
  const l = linhaDaSessao({ entrada: { frase: 3 }, narrador: { narrativa: null, mudancas: [] } }, { n: 0 });
  t("e vira o vazio de cada tipo (frase \"\", mudanças {}, cronista e juiz nulos, n = 1)", l.entrada.frase === "3" && l.narrador.narrativa === "" && J(l.narrador.mudancas) === "{}" && l.cronista === null && l.juiz === null && l.n === 1);
  t("o toque entra no lugar da frase", J(linhaDaSessao({ entrada: { toque: { tipo: "ir", para: "Forja" } } }).entrada) === J({ toque: { tipo: "ir", para: "Forja" } }));
}

sec("3. O VALIDADOR RECUSA O TORTO, COM O CAMINHO DO CAMPO");
{
  const { a } = pequeno();
  const torto = (nome, f, caminho, rx) => {
    const x = copia(a); f(x);
    const v = validarASessao(x);
    t(`${nome} → ${caminho}`, !v.ok && v.erros.some((e) => e.caminho === caminho && (!rx || rx.test(e.motivo))), J(v.erros.slice(0, 3)));
  };
  torto("outro formato", (x) => { x.formato = "outro"; }, "formato");
  torto("uma versão de amanhã", (x) => { x.versao = 2; }, "versao", /lê até a 1/);
  torto("a semente que não é texto", (x) => { x.semente = 42; }, "semente", /texto/);
  torto("a lista de turnos que não é lista", (x) => { x.turnos = {}; }, "turnos", /lista/);
  torto("um turno fora da ordem", (x) => { x.turnos[2].n = 7; }, "turnos[2].n", /turno 3/);
  torto("um turno que não é objeto", (x) => { x.turnos[1] = "turno"; }, "turnos[1]", /objeto/);
  torto("frase e toque ao mesmo tempo", (x) => { x.turnos[0].entrada.toque = { tipo: "ir" }; }, "turnos[0].entrada", /um ou outro/);
  torto("nem frase nem toque", (x) => { delete x.turnos[0].entrada.frase; }, "turnos[0].entrada", /nem frase/);
  torto("o ponto da sorte torto", (x) => { x.turnos[1].sorte.ponto = "ontem"; }, "turnos[1].sorte.ponto", /dia\|minuto\|falas/);
  torto("as mudanças que não são objeto", (x) => { x.turnos[3].narrador.mudancas = []; }, "turnos[3].narrador.mudancas", /objeto/);
  torto("os envelopes que não são texto", (x) => { x.turnos[3].pedido.envelopes = [1, 2]; }, "turnos[3].pedido.envelopes");
  torto("a chave posta num campo que não é objeto", (x) => { x.turnos[1].estado.chaves = { cidadeAtual: { poe: { a: 1 } } }; }, "turnos[1].estado.chaves.cidadeAtual", /não é objeto/);
  torto("a soma num campo que não é lista", (x) => { x.turnos[1].estado.soma = { npcs: [1] }; }, "turnos[1].estado.soma.npcs", /não é lista/);
  torto("o Juiz que pede mais narrações do que o arquivo tem", (x) => { x.turnos[1].juiz.antesDoArquivo = 5; }, "turnos[1].juiz.antesDoArquivo", /só tem 1/);
  torto("o que o App fez, sem órgão", (x) => { x.turnos[2].app = [{ campos: ["lugar"] }]; }, "turnos[2].app[0]", /órgão/);
  torto("o que o App fez, com campos que não são caminhos", (x) => { x.turnos[2].app = [{ orgao: "viajar", campos: "lugar" }]; }, "turnos[2].app[0].campos", /caminhos/);
  torto("o que o App fez, que não é lista", (x) => { x.turnos[2].app = { orgao: "viajar" }; }, "turnos[2].app", /lista/);
  const x = copia(a); x.futuro = { algo: 1 }; x.turnos[2].futuro = true; x.turnos[2].narrador.tom = "seco";
  t("o campo que o validador não conhece passa (o arquivo de amanhã abre hoje)", validarASessao(x).ok && J(reproduzirASessao(x).divergentes) === J(reproduzirASessao(a).divergentes));
  const r = reproduzirASessao({ ...copia(a), formato: "outro" });
  t("o replay de um arquivo inválido não corre: devolve os erros", r.valido === false && r.turnos.length === 0 && r.erros.length > 0);
  t("as três sessões de prova em disco são válidas", [S8, S9, S10].every((s) => validarASessao(s).ok));
}

sec("4. AS SESSÕES DE PROVA, REPRODUZIDAS TURNO A TURNO");
const R10 = reproduzirASessao(S10), R8 = reproduzirASessao(S8), R9 = reproduzirASessao(S9);
{
  for (const [ses, r] of [["s10", R10], ["s8", R8], ["s9", R9]]) console.log(`  ..  ${ses}: ${r.reproduzidos} de ${r.turnos.length} reproduzem; divergem ${r.divergentes.join(",")}`);
  /* MEDIDA (28/10, T3-B): 69 + 66 + 45 = 180 de 194. Os que divergem são o
     passo antes do Mestre (a viagem, a estrada, a saída de um sítio) na
     10.ª e os nomes que a pauta não ofereceu na 8.ª e na 9.ª — as duas
     coisas que o jogar-em-node também só faz pelo oráculo. Catraca: não
     desce; sobe quando o motor do oficial trouxer o `turno`. */
  t(`a 10.ª: ${R10.reproduzidos} de 77 turnos reproduzem (a medida de 28/10: 69)`, R10.turnos.length === 77 && R10.reproduzidos >= 69);
  t(`a 8.ª: ${R8.reproduzidos} de 70 (a medida de 28/10: 66)`, R8.turnos.length === 70 && R8.reproduzidos >= 66);
  t(`a 9.ª: ${R9.reproduzidos} de 47 (a medida de 28/10: 45)`, R9.turnos.length === 47 && R9.reproduzidos >= 45);
  /* MOVIDA (28/10, T3-B): a divergência destas três é a do oráculo, que o
     jogar-em-node põe no estado no lugar de um órgão do App — e a linha
     agora o diz (`app`). Deixou de estar em `diferencas` (que são só as do
     motor) e passou à dívida; a intenção fica: na 10.ª só onde o herói
     está, na 8.ª e na 9.ª só a gente do registo, e o motor sem defeito. */
  const raiz = (r) => [...new Set(r.turnos.filter((x) => !x.igual).flatMap((x) => x.divida.flatMap((d) => d.caminhos.map((c) => c.split(/[.[]/)[0]))))].sort();
  t("na 10.ª, o que diverge é só onde o herói está (a cidade, o sítio, a estrada)", raiz(R10).length > 0 && raiz(R10).every((c) => ["cidadeAtual", "lugar", "jornada"].includes(c)), J(raiz(R10)));
  t("na 8.ª e na 9.ª, só a gente do registo", J(raiz(R8)) === J(["npcs"]) && J(raiz(R9)) === J(["npcs"]), J([raiz(R8), raiz(R9)]));
  t("e o motor não tem defeito em nenhuma das três: toda divergência é dívida que a linha declara", [R10, R8, R9].every((r) => r.defeitos.length === 0 && r.turnos.filter((x) => !x.igual).every((x) => !x.diferencas.length && x.divida.length && x.divida.every((d) => d.de === "a linha"))), J([R10, R8, R9].map((r) => r.defeitos)));
  /* O QUE O MOTOR JOGA SOZINHO (soOMotor): reproduz, e nenhum órgão do App
     mexeu. MEDIDA (28/10, T3-B, o replay num caminho só): 68 + 62 + 45 =
     175, o número que o jogar-em-node media pelo seu leitor. A diferença
     para os 180 são os cinco que reproduzem com a ajuda declarada do App:
     os quatro da luta da 8.ª (os combatentes fora do estado) e o M69 da
     10.ª (o sítio que o App mudou e o Cronista repôs). Catraca: não desce. */
  t(`o motor sozinho: ${R10.soOMotor} + ${R8.soOMotor} + ${R9.soOMotor} = ${R10.soOMotor + R8.soOMotor + R9.soOMotor} (a medida de 28/10: 68 + 62 + 45 = 175)`, R10.soOMotor >= 68 && R8.soOMotor >= 62 && R9.soOMotor >= 45);
  const ajudados = (ses, r) => r.turnos.filter((x) => x.igual && x.app).map((x) => `${ses}#${x.n}`);
  const cinco = [...ajudados("s8", R8), ...ajudados("s9", R9), ...ajudados("s10", R10)];
  t("e a diferença para os reproduzidos são os cinco com a ajuda declarada do App: a luta da 8.ª e o M69 da 10.ª", J(cinco) === J(["s8#24", "s8#38", "s8#40", "s8#63", "s10#69"]) && R8.turnos.filter((x) => x.igual && x.app).every((x) => /a luta/.test(x.app[0].orgao)) && /moverParaLocal/.test(R10.turnos[68].app[0].orgao), J(cinco));
  const todos = [...R10.turnos, ...R8.turnos, ...R9.turnos];
  t("todo turno que diverge diz porquê, e o porquê aponta a parte do turno que é do App", todos.filter((x) => !x.igual).every((x) => x.porque.length && x.porque.every((p) => /\bApp\b/.test(p))));
  t("o juízo do Cronista sai igual em todos os 194 turnos", todos.every((x) => x.cronista && x.cronista.igual));
  t("e o Juiz, julgando outra vez a mesma prosa sobre a entrada gravada, dá o mesmo veredito nos 194", todos.every((x) => x.juiz && x.juiz.igual));
  t("nenhum passo do replay estourou", todos.every((x) => !x.calou.length), J(todos.filter((x) => x.calou.length).slice(0, 2)));
  /* encadeado: a corrida inteira a partir do save inicial */
  const E10 = reproduzirASessao(S10, { encadeado: true });
  t(`encadeada, a 10.ª corre até a primeira divergência do turno a turno (M${E10.primeira}) igual`, E10.primeira === R10.primeira && E10.turnos.slice(0, E10.primeira - 1).every((x) => x.igual));
}

sec("5. DETERMINISMO — o mesmo arquivo dá o mesmo replay");
{
  const antes = J(S10);
  const dois = reproduzirASessao(S10);
  t("duas corridas da 10.ª, o mesmo relatório byte a byte", J(dois) === J(R10));
  t("e a corrida encadeada também", J(reproduzirASessao(S8, { encadeado: true })) === J(reproduzirASessao(S8, { encadeado: true })));
  t("o arquivo lido não muda por ser reproduzido", J(S10) === antes);
  t("correr outra sessão no meio não muda esta (a sorte não vaza)", (() => { reproduzirASessao(S9); return J(reproduzirASessao(S10)) === J(R10); })());
}

sec("6. A DIVERGÊNCIA PLANTADA É APANHADA NO TURNO CERTO");
{
  const plantar = (arq, n, f) => { const x = copia(arq); f(x.turnos[n - 1]); return x; };
  const novas = (r, base) => r.divergentes.filter((n) => !base.divergentes.includes(n));
  /* (a) a resposta gravada não é a que o jogo teve: o Narrador deu quatro
     moedas. (Um valor que TIRA — moedas ou vida negativas — a poda do
     Narrador corta, E1: o Narrador só narra; o que fica é o ganho.) */
  const a = reproduzirASessao(plantar(S10, 30, (L) => { L.narrador.mudancas = { moedas: 4 }; }));
  const t30 = a.turnos[29];
  t("a resposta do Narrador trocada no turno 30 diverge no 30, e só nele", J(novas(a, R10)) === J([30]), J(novas(a, R10)));
  t("e diz o campo (a bolsa da ficha) e os dois valores", t30.diferencas.some((d) => d.caminho === "personagem.moedas" && Number(d.reproduzido) === Number(d.gravado) + 4), J(t30.diferencas));
  t("e o porquê é a ficha", t30.porque.some((p) => /^personagem: /.test(p)));
  /* (b) o estado gravado não é o que o motor dá: a ficha do turno 5 com outra vida */
  const b = reproduzirASessao(plantar(S10, 5, (L) => { L.estado.chaves = { ...(L.estado.chaves || {}), personagem: { poe: { vida: 3 } } }; }));
  t("o estado gravado adulterado no turno 5 diverge no 5, e só nele (o 6 parte do gravado)", J(novas(b, R10)) === J([5]) && b.turnos[4].diferencas.some((d) => d.caminho === "personagem.vida"), J(novas(b, R10)));
  /* (c) o Cronista julgado de outro modo */
  const c = reproduzirASessao(plantar(S8, 12, (L) => { L.cronista.juizo = { ...L.cronista.juizo, aceito: { lugar: "a cripta" } }; }));
  t("o juízo do Cronista gravado diferente no turno 12 da 8.ª é apanhado no 12", J(novas(c, R8)) === J([12]) && c.turnos[11].cronista.igual === false && c.turnos[11].porque.some((p) => /juízo do Cronista mudou/.test(p)));
  /* (d) o Juiz que mediu outra coisa */
  const d = reproduzirASessao(plantar(S9, 20, (L) => { L.juiz.resumo = { ...L.juiz.resumo, achados: L.juiz.resumo.achados + 1 }; }));
  t("o veredito do Juiz gravado diferente no turno 20 da 9.ª é apanhado no 20", J(novas(d, R9)) === J([20]) && d.turnos[19].juiz.igual === false && d.turnos[19].porque.some((p) => /veredito do Juiz mudou/.test(p)));
  /* (e) encadeado: a primeira divergência é a plantada (antes da primeira da sessão, M9) */
  const e = reproduzirASessao(plantar(S10, 4, (L) => { L.narrador.mudancas = { adicionar_itens: ["Corda de cânhamo"] }; }), { encadeado: true });
  t("encadeada, a 10.ª com a resposta trocada no turno 4 diverge primeiro no 4, na mochila", e.primeira === 4 && e.turnos[3].diferencas.some((d) => d.caminho === "personagem.inventario"), String(e.primeira));
  t("e, sem nada plantado, todo turno antes da primeira divergência da sessão reproduz", R10.turnos.slice(0, R10.primeira - 1).every((x) => x.igual) && R10.primeira === 9);
}

sec("7. LIXO NÃO DERRUBA");
{
  let estourou = false;
  try {
    for (const x of [null, undefined, 3, "x", [], {}, { turnos: "x" }, { formato: "taverna-sessao", versao: 1, semente: "s", inicio: {}, turnos: [null, 4] }]) { reproduzirASessao(x); validarASessao(x); estadoNoTurno(x, 2); }
  } catch { estourou = true; }
  t("arquivos de lixo: o replay, o validador e a reconstrução não estouram", !estourou);
  t("o arquivo que não é objeto é recusado no caminho da raiz", validarASessao(null).erros.some((e) => e.caminho === "" && /objeto/.test(e.motivo)));
  t("o estado de um arquivo de lixo é o vazio", J(estadoNoTurno(null, 3)) === "{}");
}

sec("8. A DÍVIDA DO APP — o defeito do motor e a dívida do App, contados à parte");
const RN = reproduzirASessao(SN);
{
  /* A TABELA SÓ ENCOLHE. A dívida medida em 28/10 (T3-B) sobre o arquivo que
     o jogo gravou: catorze campos que um órgão do App escreve em todo turno
     e nenhum passo do replay corre. Campo novo em AINDA_DO_APP quebra aqui
     — dívida nova é órgão novo no App, e órgão novo vai para o motor. Quando
     a trilha A trouxer um destes para o motor (e ele entrar em
     PASSOS_DO_REPLAY), o campo reproduz, a catraca da dívida paga quebra, e
     tira-se o campo da tabela E desta lista. */
  const DIVIDA_DE_28_10 = ["abertura", "chao", "compasso", "desdeMundo", "elencoMem", "escada", "escuta", "estante", "lugar.coord", "mesa", "minuto", "prometido", "registro", "turnosDeMundo"];
  const campos = AINDA_DO_APP.map((d) => d.campo);
  console.log(`  ..  a dívida do App: ${campos.length} campos — ${campos.join(", ")}`);
  const novos = campos.filter((c) => !DIVIDA_DE_28_10.includes(c));
  t(`a tabela só encolhe: nenhum campo que não estava na dívida de 28/10${novos.length ? " — novos: " + novos.join(", ") : ""}`, novos.length === 0);
  t("cada campo uma vez, com o órgão do App que o escreve e a data", new Set(campos).size === campos.length && AINDA_DO_APP.every((d) => typeof d.orgao === "string" && d.orgao.length > 10 && /^\d{2}\/\d{2}\/\d{4}$/.test(d.desde)));
  t("nenhum campo da dívida está fora da régua (o bastidor não é dívida, é bastidor)", campos.every((c) => !FORA_DA_REGUA[c.split(".")[0]]));
  /* a dívida paga não fica: todo campo da tabela ainda diverge no arquivo
     que o jogo gravou */
  const pagos = RN.divida.campos.filter((d) => !d.turnos.length).map((d) => d.campo);
  t(`e a tabela não guarda dívida paga: todo campo dela ainda diverge na sessão do jogo${pagos.length ? " — já reproduzem: " + pagos.join(", ") : ""}`, pagos.length === 0);
  for (const d of RN.divida.campos) console.log(`  ..    ${d.campo.padEnd(14)} turnos ${d.turnos.join(",") || "—"} · ${d.orgao.slice(0, 70)}`);
  /* e, com a dívida à parte, o motor reproduz o jogo: zero defeitos */
  t(`a sessão do jogo: ${RN.reproduzidos} de ${RN.turnos.length} reproduzem em tudo, e o motor não tem defeito em nenhum (a dívida à parte)`, RN.valido && RN.turnos.length === 3 && RN.defeitos.length === 0 && RN.turnos.every((x) => !x.diferencas.length && x.divida.length), J(RN.turnos.map((x) => x.diferencas.slice(0, 2))));
  t("e cada dívida diz o órgão, no porquê do turno", RN.turnos.every((x) => x.divida.every((d) => d.de === "a tabela" && x.porque.some((p) => p.startsWith(d.campo + ": ainda do App — ")))));
  t("a dívida tem a parte, não o campo inteiro: «lugar.coord» deixa o resto do lugar na régua do motor", () => {
    const x = copia(SN); const L = x.turnos[1];
    L.estado.troca = { ...L.estado.troca, lugar: { ...L.estado.troca.lugar, nome: "a casa errada" } };
    const r = reproduzirASessao(x);
    return J(r.defeitos) === J([2]) && r.turnos[1].diferencas.some((d) => d.caminho === "lugar.nome");
  });
  /* a divergência plantada num campo do motor, no arquivo do jogo, é defeito */
  const x = copia(SN); x.turnos[1].estado.chaves = { ...x.turnos[1].estado.chaves, personagem: { poe: { moedas: 999 } } };
  const rp = reproduzirASessao(x);
  t("a ficha adulterada no turno 2 do jogo é DEFEITO no 2, não dívida", J(rp.defeitos) === J([2]) && rp.turnos[1].diferencas.some((d) => d.caminho === "personagem.moedas") && rp.turnos[1].porque.some((p) => /^personagem: /.test(p)));
  /* o campo que nenhuma tabela reclama é defeito «sem dono» */
  const y = copia(SN); y.turnos[2].estado.troca = { ...y.turnos[2].estado.troca, campoDeAmanha: 1 };
  const ry = reproduzirASessao(y);
  t("o campo que nenhuma tabela reclama é defeito «sem dono», não dívida", J(ry.defeitos) === J([3]) && ry.turnos[2].porque.some((p) => /^campoDeAmanha: sem dono/.test(p)));
  /* a linha que declara o que o App fez: só os caminhos que ela nomeia */
  const z = copia(S9); z.turnos[9].app = [{ orgao: "outro órgão", campos: ["npcs.Brina"] }];
  const rz = reproduzirASessao(z);
  t("a linha que declara só uma parte deixa a outra no motor (s9#10: «npcs.Brina» declarada, «npcs.Brina Pedra» não)", J(rz.defeitos) === J([10]) && rz.turnos[9].diferencas.some((d) => d.caminho === "npcs.Brina Pedra") && rz.turnos[9].divida.some((d) => d.caminhos.includes("npcs.Brina")));
  const w = copia(S9); delete w.turnos[9].app;
  t("e sem a declaração, a mesma divergência é defeito", J(reproduzirASessao(w).defeitos) === J([10]));
  t("a declaração torta não passa no validador", () => { const k = copia(S9); k.turnos[9].app = [null, 3]; return !validarASessao(k).ok; });
  t("determinismo: a sessão do jogo, duas vezes, o mesmo relatório", J(reproduzirASessao(SN)) === J(RN));
}

console.log(`\nsessão como arquivo: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
