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
        -s10, escritas por `gravar-sessoes-de-prova.mjs`) reproduzem turno a
        turno, e cada divergência é da parte do turno que ainda mora no App;
     5. determinismo: o mesmo arquivo dá o mesmo replay;
     6. a divergência plantada é apanhada no turno certo — na resposta do
        Narrador, no estado gravado, no juízo do Cronista e no veredito do
        Juiz;
     7. lixo não derruba;
     8. a dívida do App (AINDA_DO_APP, 28/10): o replay separa a divergência
        do motor (defeito) da do App (dívida, contada à parte), e a tabela
        só encolhe — campo novo nela quebra, e campo que já reproduz e
        continua nela também;
     9. o resumo para uma pessoa ler (resumoDaSessao, replay.mjs --resumo):
        as contas do relatório, os defeitos, a dívida e o Juiz somado.

   Os arquivos em disco são o dourado do replay: se o motor mudar o que faz
   com estas respostas, a secção 4 fica vermelha — e a troca, se for
   querida, regera-se com `node gravar-sessoes-de-prova.mjs --escrever`,
   declarada. */
import fs from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (typeof cond === "function") { try { cond = cond(); } catch (e) { extra = String(e && e.message); cond = false; } }
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);
const J = JSON.stringify;
const copia = (x) => JSON.parse(J(x));
const ehLista = Array.isArray;

const {
  FORMATO_DA_SESSAO, CAMPOS_DA_SESSAO, PASSOS_DO_REPLAY, DONO_DO_CAMPO, FORA_DA_REGUA, AINDA_DO_APP,
  PORTAS_DO_CRONISTA_NO_REPLAY, EFEITO_DO_CRONISTA_NO_REPLAY,
  abrirASessao, linhaDaSessao, gravarOTurno, estadoNoTurno, validarASessao, reproduzirASessao, correrOTurno, resumoDaSessao,
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
  /* MOVIDA (28/10, T3-B, o replay num caminho só): entrou, entre o sítio e
     o Mestre, a porta do passo que ainda é do App (viajar, moverParaLocal)
     — o replay não o corre; o gravador das sessões de prova passa por ela o
     oráculo. A intenção fica: os passos do App, na ordem dele.
     MOVIDA OUTRA VEZ (28/10, a 8.ª fatia ligada ao replay): à frente de
     todos entrou o mundo, o chão e a escuta (motor/antes-do-mestre.js), que
     o App corre no agirInterno e no começo do enviar, antes do sítio pela
     frase. A porta do App deixou de ser o 2.º passo; procura-se pelo nome,
     para a asserção não depender da posição.
     MOVIDA A TERCEIRA VEZ (28/10, o tempo do turno no motor, trilha A
     v9.532): entre o mundo e o sítio entrou o tempo da ação — no App, o
     MINUTOS_POR_TURNO do agirInterno vem antes do enviar. A intenção fica.
     MOVIDA A QUARTA VEZ (29/10, Fase 4, trilha B: o 1.º órgão do depois no
     servidor): entre a chegada e o Cronista entrou o trabalho daqui — no
     App, `oferecerTrabalhoDaqui` corre depois do Juiz e do conferente e
     antes do Cronista. Só corre com `servidor: true` (secção 4c).
     MOVIDA A QUINTA VEZ (29/10, Fase 4, trilha B: o 2.º órgão do depois):
     entre a chegada e o trabalho daqui entrou o conferente das missões —
     no App, `pers = conferirAsMissoes(pers)` corre depois do Juiz e ANTES
     de `oferecerTrabalhoDaqui`. Corre no replay também (secção 4d). */
  t("os passos do replay são os do App, na ordem dele", J(PASSOS_DO_REPLAY.map((p) => p.passo)) === J(["o mundo, o chão e a escuta", "o tempo da ação", "o sítio pela frase", "o passo antes do Mestre", "o turno do Mestre", "o códex", "a chegada", "as missões", "o trabalho daqui", "o Cronista"]) && PASSOS_DO_REPLAY.every((p) => typeof p.faz === "function" && p.de));
  t("e a porta do App diz que é do App, e é a única", /^App /.test(PASSOS_DO_REPLAY.find((p) => p.passo === "o passo antes do Mestre").de) && PASSOS_DO_REPLAY.filter((p) => /^App /.test(p.de)).length === 1);
  t("e o passo do motor antes do Mestre não leva o nome da porta (o `calou` e o oráculo dizem-na por ele)", PASSOS_DO_REPLAY.filter((p) => /antes do Mestre/.test(p.passo)).length === 1);
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
  /* MOVIDA (28/10, trilha B: o passo «o Cronista» do replay chama a peça
     do jogo, oAceitoDoCronista, no lugar da miniatura), com o motivo: a
     miniatura registava todo nome que o juízo aceitava, e a peça passa-o
     por nomeComDono — que hoje recusa quatro nomes que o Cronista daquele
     jogo registou: dois descritores (s9#41, s10#43) e dois com o apelido
     do herói (s9#47, s10#57). O gravador põe-nos no estado pelo oráculo e a
     linha declara-o; s9#41, s9#47 e s10#43 deixam de reproduzir. E o M69 da
     10.ª também: a régua do jogo (registrarOLugar) mantém o lugar que já
     está quando o Cronista diz o mesmo sítio, e a miniatura refazia-o pelo
     nome. A medida nova é 67 + 66 + 43 = 176; a catraca fica, dela. */
  t(`a 10.ª: ${R10.reproduzidos} de 77 turnos reproduzem (a medida de 28/10, com a peça do Cronista: 67)`, R10.turnos.length === 77 && R10.reproduzidos >= 67);
  t(`a 8.ª: ${R8.reproduzidos} de 70 (a medida de 28/10: 66)`, R8.turnos.length === 70 && R8.reproduzidos >= 66);
  t(`a 9.ª: ${R9.reproduzidos} de 47 (a medida de 28/10, com a peça do Cronista: 43)`, R9.turnos.length === 47 && R9.reproduzidos >= 43);
  /* MOVIDA (28/10, T3-B): a divergência destas três é a do oráculo, que o
     gravador das sessões de prova põe no estado no lugar de um órgão do App — e a linha
     agora o diz (`app`). Deixou de estar em `diferencas` (que são só as do
     motor) e passou à dívida; a intenção fica: na 10.ª só onde o herói
     está, na 8.ª e na 9.ª só a gente do registo, e o motor sem defeito. */
  const raiz = (r) => [...new Set(r.turnos.filter((x) => !x.igual).flatMap((x) => x.divida.flatMap((d) => d.caminhos.map((c) => c.split(/[.[]/)[0]))))].sort();
  /* MOVIDA (28/10, a peça do Cronista): na 10.ª também a gente — os dois
     nomes que o Cronista de então registou e o de hoje recusa (s10#43, #57).
     MOVIDA (29/10, o save aberto como o load): com o mundo na cabeça o códex
     revela a gente da base da cidade onde o herói está, e nos dois turnos em
     que o viajar do App o pôs noutra cidade (s10#23, #57) a gente revelada
     muda com ela — a linha declara-o na viagem (baseMundo.revelados, e a
     Saoirse de Nova clara em npcs). A intenção fica: só onde o herói está e
     o que isso arrasta. */
  t("na 10.ª, o que diverge é onde o herói está (a cidade, o sítio, a estrada), a gente da base que a cidade revela, e o nome que o Cronista de então registou", raiz(R10).length > 0 && raiz(R10).every((c) => ["cidadeAtual", "lugar", "jornada", "npcs", "baseMundo"].includes(c)) && R10.turnos.filter((x) => x.divida.some((d) => d.campo.startsWith("npcs"))).every((x) => x.app.some((a) => /Cronista do jogo de então/.test(a.orgao))), J(raiz(R10)));
  t("na 8.ª e na 9.ª, só a gente do registo", J(raiz(R8)) === J(["npcs"]) && J(raiz(R9)) === J(["npcs"]), J([raiz(R8), raiz(R9)]));
  /* MOVIDA (28/10): o M69 diverge também em «lugar.coord», que a tabela dá
     a moverParaLocal — o órgão que a linha do M69 já declara */
  t("e o motor não tem defeito em nenhuma das três: toda divergência é dívida que a linha declara (e, no M69, a coordenada do mesmo moverParaLocal, pela tabela)", [R10, R8, R9].every((r) => r.defeitos.length === 0 && r.turnos.filter((x) => !x.igual).every((x) => !x.diferencas.length && x.divida.length && x.divida.some((d) => d.de === "a linha") && x.divida.every((d) => d.de === "a linha" || (d.de === "a tabela" && d.campo === "lugar.coord")))), J([R10, R8, R9].map((r) => r.defeitos)));
  /* O QUE O MOTOR JOGA SOZINHO (soOMotor): reproduz, e nenhum órgão do App
     mexeu. MEDIDA (28/10, T3-B, o replay num caminho só): 68 + 62 + 45 =
     175, o número que o jogar-em-node media pelo seu leitor. A diferença
     para os 180 são os cinco que reproduzem com a ajuda declarada do App:
     os quatro da luta da 8.ª (os combatentes fora do estado) e o M69 da
     10.ª (o sítio que o App mudou e o Cronista repôs). Catraca: não desce. */
  /* MOVIDA (28/10, a peça do Cronista): 175 → 172 — os três turnos do nome
     recusado (s9#41, s9#47, s10#43) eram do motor sozinho e agora a linha
     declara o oráculo; e o M69, que reproduzia com a ajuda do App, diverge.
     Ficam os quatro da luta da 8.ª. */
  t(`o motor sozinho: ${R10.soOMotor} + ${R8.soOMotor} + ${R9.soOMotor} = ${R10.soOMotor + R8.soOMotor + R9.soOMotor} (a medida de 28/10, com a peça do Cronista: 67 + 62 + 43 = 172)`, R10.soOMotor >= 67 && R8.soOMotor >= 62 && R9.soOMotor >= 43);
  const ajudados = (ses, r) => r.turnos.filter((x) => x.igual && x.app).map((x) => `${ses}#${x.n}`);
  const quatro = [...ajudados("s8", R8), ...ajudados("s9", R9), ...ajudados("s10", R10)];
  t("e a diferença para os reproduzidos são os quatro com a ajuda declarada do App: a luta da 8.ª", J(quatro) === J(["s8#24", "s8#38", "s8#40", "s8#63"]) && R8.turnos.filter((x) => x.igual && x.app).every((x) => /a luta/.test(x.app[0].orgao)), J(quatro));
  const todos = [...R10.turnos, ...R8.turnos, ...R9.turnos];
  t("todo turno que diverge diz porquê, e o porquê aponta a parte do turno que é do App", todos.filter((x) => !x.igual).every((x) => x.porque.length && x.porque.every((p) => /\bApp\b/.test(p))));
  t("o juízo do Cronista sai igual em todos os 194 turnos", todos.every((x) => x.cronista && x.cronista.igual));
  t("e o Juiz, julgando outra vez a mesma prosa sobre a entrada gravada, dá o mesmo veredito nos 194", todos.every((x) => x.juiz && x.juiz.igual));
  t("nenhum passo do replay estourou", todos.every((x) => !x.calou.length), J(todos.filter((x) => x.calou.length).slice(0, 2)));
  /* encadeado: a corrida inteira a partir do save inicial */
  const E10 = reproduzirASessao(S10, { encadeado: true });
  t(`encadeada, a 10.ª corre até a primeira divergência do turno a turno (M${E10.primeira}) igual`, E10.primeira === R10.primeira && E10.turnos.slice(0, E10.primeira - 1).every((x) => x.igual));
}

sec("4b. UM TURNO, CORRIDO — o passo que o replay e o gravador dividem");
{
  /* correrOTurno é cada linha do replay, e é com ele que o gravador das
     sessões de prova escreve os arquivos: um caminho só */
  const L = S10.turnos[3], antes = estadoNoTurno(S10, 3);
  const um = correrOTurno(antes, L, { semente: S10.semente, narracoes: [] });
  t("a linha 4 da 10.ª, corrida sozinha, dá o estado gravado dela (o sítio pela frase: a Cabra Trêmula)", J(um.estado.lugar) === J(estadoNoTurno(S10, 4).lugar) && um.estado.lugar.nome === "Cabra Trêmula" && !um.calou.length);
  t("e o juízo do Cronista é o que a linha guarda", J(um.juizo) === J(L.cronista.juizo));
  /* a porta do App: o replay nunca a passa; quem a passa muda o turno */
  let viu = null;
  const comPorta = correrOTurno(antes, L, { semente: S10.semente, doApp: { antesDoMestre: (E) => { viu = E.lugar && E.lugar.nome; return { ...E, cidadeAtual: "Nova Profundo" }; } } });
  t("a porta do passo antes do Mestre recebe o estado depois do sítio pela frase, e o que ela devolve segue o turno", viu === "Cabra Trêmula" && comPorta.estado.cidadeAtual === "Nova Profundo");
  const porta = correrOTurno(antes, L, { semente: S10.semente, doApp: { antesDoMestre: () => { throw new Error("a porta caiu"); } } });
  t("e a porta que estoura não leva o turno: fica em calou, com o nome do passo", porta.calou.some((c) => c.passo === "o passo antes do Mestre" && /a porta caiu/.test(c.erro)) && J(porta.estado.lugar) === J(um.estado.lugar));
  let estourou = false;
  try { for (const x of [null, undefined, 3, {}]) { correrOTurno(x, x, x); correrOTurno({}, { sorte: null, narrador: 7 }, { doApp: null }); } } catch { estourou = true; }
  t("lixo no turno corrido não estoura", !estourou);
  const congela = (x) => { if (x && typeof x === "object") { Object.values(x).forEach(congela); Object.freeze(x); } return x; };
  t("e não mexe no estado nem na linha recebidos (correm congelados)", () => { correrOTurno(congela(copia(antes)), congela(copia(L)), { semente: S10.semente }); return true; });
}

sec("4c. O MURAL NO REPLAY E NO SERVIDOR — a porta do Cronista e o trabalho daqui (29/10, Fase 4, trilha B)");
{
  /* A porta pregarNoMural que o Cronista chama deixou de ser dublê: é a da
     fábrica dos órgãos do depois (motor/depois-do-turno.js), sobre o estado
     do replay. Nos 194 turnos das sessões de prova o Cronista nunca a chama
     (a medida do replay fica 176/194 e 172 — secção 4); aqui, um turno
     montado em que alguém pede um serviço. */
  const Em = estadoDoSave({ personagem: { nome: "Íris Vantel", grupo: [], nivel: 2 }, cidadeAtual: "Monte Rasa", mapa: { cidades: [{ nome: "Monte Rasa", populacao: 800 }] }, npcs: {}, canone: {}, dia: 4, abertura: { legado: true }, missoes: [], mural: [] });
  const narr = "Na praça de Monte Rasa, Varek Duro aproxima-se com o chapéu na mão: — Preciso que alguém leve esta carta ao moinho velho antes do anoitecer. Pago bem, quinze moedas.";
  const Lm = { n: 1, entrada: { frase: "Ouço o homem." }, sorte: { ponto: "4|0|0" }, pedido: { pauta: "", envelopes: "" }, narrador: { narrativa: narr, mudancas: {} },
    cronista: { proposta: { pessoas: [{ nome: "Varek Duro", papel: "moleiro", genero: "ele" }], missao_oferecida: { titulo: "A carta do moinho", tipo: "favor", dador: "Varek Duro", descricao: "levar a carta ao moinho velho", paga: 15, prazo: 0, etapas: [{ tipo: "ir_a", alvo: "Monte Rasa", quantos: 1 }] } } } };
  const rr = correrOTurno(Em, Lm, { semente: "teste|mural" });
  const doVarek = (e) => (e.mural || []).filter((c) => c.dador === "Varek Duro");
  t("o cartaz do Cronista entra no mural pela porta do motor, com a data do dia (a dublê não pregava)", doVarek(rr.estado).length === 1 && doVarek(rr.estado)[0].titulo === "A carta do moinho" && doVarek(rr.estado)[0].pregadoEm === 4, J(rr.estado.mural));
  t("e a porta já não aparece como dublê chamada (não há dívida dela)", !rr.portas.some((p) => p.porta === "pregarNoMural") && PORTAS_DO_CRONISTA_NO_REPLAY.pregarNoMural.de === "motor");
  t("no replay o mundo não oferece (sem o dia do último trabalho, que o save não guarda), e a nota fica de fora", (rr.estado.mural || []).length === 1 && !("nota" in rr.estado) && !("ultimoTrabalhoDia" in rr.estado));
  const dois = correrOTurno({ ...Em, mural: rr.estado.mural }, Lm, { semente: "teste|mural" });
  t("o mesmo cartaz duas vezes não prega (a porta única do mural)", doVarek(dois.estado).length === 1);
  /* no servidor: o mundo oferece ANTES do Cronista (a ordem do App), e o
     recado dos dois vai à nota */
  const rs = correrOTurno(Em, Lm, { semente: "teste|mural", servidor: true });
  const oferecido = (rs.estado.mural || []).find((c) => c.oferecido && c.dador !== "Varek Duro");
  t("no servidor, o mundo prega o seu trabalho e o Cronista o dele, nessa ordem", !!oferecido && (rs.estado.mural || []).length === 2 && rs.estado.mural[rs.estado.mural.length - 1].dador === "Varek Duro", J((rs.estado.mural || []).map((c) => c.dador)));
  t("o dia do último trabalho e o aviso que espera a cena ficam no estado (o eco os leva)", rs.estado.ultimoTrabalhoDia === 4 && J(rs.estado.trabalhoPendente) === J([`📋 ${oferecido && oferecido.dador} tem um trabalho no mural.`]));
  const recados = String(rs.estado.nota || "").split(/\r?\n/).filter((l) => /TRABALHO PREGADO NO MURAL/.test(l));
  t("e a nota leva os dois recados ao Narrador, o do mundo primeiro", recados.length === 2 && recados[0].includes(oferecido && oferecido.dador) && recados[1].includes("Varek Duro"), J(rs.estado.nota));
  t("o servidor corre duas vezes igual", J(correrOTurno(Em, Lm, { semente: "teste|mural", servidor: true })) === J(rs));
}

sec("4d. O CONFERENTE DAS MISSÕES, A FÉ E O ARCO NO REPLAY — e a queda a zero (29/10, Fase 4, trilha B)");
{
  /* O 2.º órgão do depois (motor/depois-do-turno.js#conferirAsMissoes, a
     peça da trilha A) corre no passo «as missões», no sítio do App — depois
     da chegada, antes do trabalho daqui —, no replay e no servidor; e as
     portas do Cronista ganharFe, marcarNoArco e conferirCom são as da mesma
     fábrica. Nos 194 turnos das sessões de prova nenhuma missão anda e
     ninguém cai a zero (a medida fica 176/194 e 172 — secção 4); aqui, um
     turno montado: uma missão que a chegada cumpre e uma conversa que o
     Cronista viu. */
  const passo = PASSOS_DO_REPLAY.find((p) => p.passo === "as missões");
  t("o passo «as missões» diz que corre a peça do conferente", !!passo && /conferirAsMissoes/.test(passo.de));
  t("e as três portas do Cronista são do motor, sem campos de dívida", ["ganharFe", "marcarNoArco", "conferirCom"].every((n) => PORTAS_DO_CRONISTA_NO_REPLAY[n].de === "motor" && !PORTAS_DO_CRONISTA_NO_REPLAY[n].campos.length));
  const Eq = estadoDoSave({ personagem: { nome: "Íris Vantel", nivel: 1, moedas: 10, xp: 0, vida: 9, vidaMax: 9, grupo: [] }, cidadeAtual: "Monte Rasa", mapa: { cidades: [{ nome: "Monte Rasa", populacao: 800 }] }, npcs: {}, canone: {}, dia: 4,
    missoes: [
      { id: "m1", titulo: "A carta do moinho", tipo: "favor", dador: "Varek Duro", status: "ativa", etapas: [{ tipo: "ir_a", alvo: "Monte Rasa" }], recompensa: { moedas: 30, xp: 50 } },
      { id: "m2", titulo: "Falar com a moleira", tipo: "favor", dador: "Varek Duro", status: "ativa", etapas: [{ tipo: "falar_com", alvo: "Odete Moleira" }], recompensa: { moedas: 5, xp: 10 } },
    ] });
  const narr = "A praça de Monte Rasa murmura ao fim da tarde. Odete Moleira acena da porta do moinho e diz que a farinha chegou molhada outra vez este mês.";
  const Lq = { n: 1, entrada: { frase: "Falo com a moleira." }, sorte: { ponto: "4|0|0" }, pedido: { pauta: "", envelopes: "" }, narrador: { narrativa: narr, mudancas: {} } };
  const st = (e) => (e.missoes || []).map((m) => m.status).join(",");
  const r1 = correrOTurno(Eq, Lq, { semente: "teste|missoes" });
  t("no replay, a chegada cumpre a missão: concluída, a paga na ficha (◉ 10 → 40, 0 → 50 XP), o contrato contado, o arco marcado", st(r1.estado) === "concluida,ativa" && r1.estado.personagem.moedas === 40 && r1.estado.personagem.xp === 50 && r1.estado.contadores.contratosConcluidos === 1 && r1.estado.historia.feitos.some((f) => /A carta do moinho/.test(f)), J([st(r1.estado), r1.estado.personagem, r1.estado.historia]));
  t("e as linhas do conferente vão à tela, na ordem do App (o avanço, a paga)", J(r1.tela.linhas.slice(-2)) === J(["🧭 A carta do moinho: Chegar a Monte Rasa ✓ (1/1)", "🤝 MISSÃO CONCLUÍDA: A carta do moinho — +30 moedas · +50 XP"]), J(r1.tela.linhas));
  t("no replay a nota ao Narrador fica de fora, e nada que não seja do save entra (a contagem da sorte, a conversa)", !("nota" in r1.estado) && !("contagemDaSorte" in r1.estado) && !("falouCom" in r1.estado) && !r1.calou.length && !r1.calouDoDepois.length);
  const r1s = correrOTurno(Eq, Lq, { semente: "teste|missoes", servidor: true, so: "depois" });
  t("no servidor, o mesmo, e a nota leva o recado da missão paga ao turno seguinte", st(r1s.estado) === "concluida,ativa" && /MISSÃO CONCLUÍDA — RECONHECIDA E PAGA PELO SISTEMA/.test(String(r1s.estado.nota || "")), J(r1s.estado.nota));
  /* a conversa que o Cronista viu: a porta conferirCom, da fábrica */
  const Lc2 = { ...Lq, cronista: { proposta: { pessoas: [{ nome: "Odete Moleira", papel: "moleira", genero: "ela" }], falou_com: ["Odete Moleira"] } } };
  const r2 = correrOTurno(Eq, Lc2, { semente: "teste|missoes" });
  t("a conversa do Cronista confere a missão de falar (conferirCom do motor; a dublê devolvia a ficha e não conferia)", st(r2.estado) === "concluida,concluida" && r2.estado.personagem.moedas === 45 && !r2.portas.some((p) => p.porta === "conferirCom"), J([st(r2.estado), r2.portas]));
  t("e as linhas do Cronista voltam na tela, depois das do turno", J(r2.tela.linhas.slice(-2)) === J(["💬 Falar com a moleira: Encontrar Odete Moleira ✓ (1/1)", "🤝 MISSÃO CONCLUÍDA: Falar com a moleira — +5 moedas · +10 XP"]), J(r2.tela.linhas));
  t("o conferente corre duas vezes igual, e o estado recebido não muda", J(correrOTurno(Eq, Lc2, { semente: "teste|missoes" })) === J(r2) && st(Eq) === "ativa,ativa");
  /* a queda a zero (motor/entrega-do-turno.js#aQueda): o herói chega ao
     fim do turno a 0 PV (o golpe que a cena deu); no App, `resolverQueda`
     logo depois da chegada. Antes, o servidor devolvia-o a 0 PV, de pé. */
  const Lz = { ...Lq, narrador: { narrativa: "O golpe do salteador entra fundo e Íris cai de joelhos na lama da praça, sem fôlego, o mundo a girar.", mudancas: {} } };
  const Ez = { ...Eq, missoes: [], personagem: { ...Eq.personagem, vida: 0 } };
  const rz = correrOTurno(Ez, Lz, { semente: "teste|queda", servidor: true, so: "depois" });
  const pz = rz.estado.personagem;
  t("a 0 PV o herói cai e rola o teste de morte (morrendo, com a rolagem); a linha vai à tela e o recado à nota", pz.vida === 0 && pz.morrendo === true && pz.morte && Array.isArray(pz.morte.rolagens) && pz.morte.rolagens.length === 1 && /QUEDA — RESOLVIDA PELO SISTEMA|morte|caído/i.test(String(rz.estado.nota || "")) && rz.tela.linhas.length > 0, J([pz, rz.tela.linhas, rz.estado.nota]));
  t("e a queda corre duas vezes igual (a sorte do turno, o evento «morte»)", J(correrOTurno(Ez, Lz, { semente: "teste|queda", servidor: true, so: "depois" })) === J(rz));
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
     tira-se o campo da tabela E desta lista.
     PAGOS (28/10, a 8.ª fatia ligada ao replay): abertura, chao, escuta e
     turnosDeMundo — o mundo, o chão e a escuta (motor/antes-do-mestre.js)
     entraram em PASSOS_DO_REPLAY. Ficam dez.
     PAGOS (28/10, o tempo do turno no motor, trilha A v9.532): minuto e
     lugar.coord — o tempo da ação e o passo na cidade
     (motor/tempo-do-turno.js) entraram em PASSOS_DO_REPLAY, e o passo leva a
     coordenada que o sítio gravado traz. Ficam oito. */
  const DIVIDA_DE_28_10 = ["compasso", "desdeMundo", "elencoMem", "escada", "estante", "mesa", "prometido", "registro"];
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
  /* MOVIDA (28/10, o tempo do turno no motor): o título dizia «a dívida tem
     a parte, não o campo inteiro: lugar.coord deixa o resto do lugar na
     régua» — a lugar.coord foi paga, e o lugar inteiro está agora na régua
     do motor. A intenção fica: o nome errado do lugar é defeito. */
  t("o lugar está na régua do motor: o nome errado é defeito, não dívida", () => {
    const x = copia(SN); const L = x.turnos[1];
    L.estado.troca = { ...L.estado.troca, lugar: { ...L.estado.troca.lugar, nome: "a casa errada" } };
    const r = reproduzirASessao(x);
    /* MOVIDA (28/10, o mundo, o chão e a escuta no replay): era «defeito no
       2, e só nele». O 3 parte do estado gravado do 2 — o plantado —, e o
       passo novo LÊ o lugar: o chão assina a cena com ele e o sino marca-o
       como visitado. Logo o 3 diverge também, e só nessas duas coisas. A
       intenção fica: a dívida «lugar.coord» não esconde o nome do lugar. */
    return J(r.defeitos) === J([2, 3]) && r.turnos[1].diferencas.some((d) => d.caminho === "lugar.nome")
      && r.turnos[2].diferencas.every((d) => /^(chao\.cena|abertura\.visitados)/.test(d.caminho));
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

sec("9. O RESUMO — para uma pessoa ler (replay.mjs --resumo)");
{
  const { CLASSES_DO_JUIZ } = await import("../src/motor/juiz-do-turno.js");
  const rn = resumoDaSessao(SN, RN);
  t("as contas são as do relatório: reproduzidos, sozinho, e nenhum defeito", rn.valido && rn.turnos === 3 && rn.reproduzidos === RN.reproduzidos && rn.soOMotor === RN.soOMotor && rn.defeitos.length === 0);
  t("a dívida da sessão do jogo: os campos da tabela (oito, desde o tempo do turno), cada um com os turnos e o órgão", rn.divida.campos.length === AINDA_DO_APP.length && rn.divida.campos.every((d) => d.turnos.length && d.orgao) && rn.divida.doTurno.length === 0);
  t("sem o relatório, corre o replay e dá o mesmo", J(resumoDaSessao(SN)) === J(rn));
  /* o Juiz somado: a conta do jogo (somarAFidelidade), por classe */
  const r8 = resumoDaSessao(S8, R8);
  const somaMao = Object.fromEntries([...CLASSES_DO_JUIZ.map((c) => c.classe), "pauta"].map((k) => [k, S8.turnos.reduce((a, L) => a + (Number(L.juiz.resumo.por[k]) || 0), 0)]));
  t(`o Juiz da 8.ª somado: ${r8.juiz.achados} achados em ${r8.juiz.julgados} turnos, por classe como a soma à mão`, J(r8.juiz.por) === J(somaMao) && r8.juiz.achados === S8.turnos.reduce((a, L) => a + L.juiz.resumo.achados, 0) && r8.juiz.limpos === S8.turnos.filter((L) => L.juiz.resumo.achados === 0).length && r8.juiz.julgados === 70, J([r8.juiz, somaMao]));
  t("e o veredito julgado outra vez sai igual em todos", r8.juiz.iguais === 70 && r8.juiz.rejulgados === 70);
  t("a dívida que as linhas declaram, turno a turno: os quatro nomes à mão divergem, as quatro lutas reproduzem", J(r8.divida.doTurno.map((d) => [d.n, d.divergiu])) === J([[6, true], [7, true], [11, true], [18, true], [24, false], [38, false], [40, false], [63, false]]));
  /* o defeito plantado aparece turno a turno, com o porquê do motor (e só ele) */
  const x = copia(SN); x.turnos[1].estado.chaves = { ...x.turnos[1].estado.chaves, personagem: { poe: { moedas: 999 } } };
  const rx = resumoDaSessao(x);
  t("o defeito plantado sai no resumo, no turno dele, com o campo e o porquê do motor (sem as linhas da dívida)", rx.defeitos.length === 1 && rx.defeitos[0].n === 2 && rx.defeitos[0].diferencas.some((d) => d.caminho === "personagem.moedas") && rx.defeitos[0].porque.length && rx.defeitos[0].porque.every((p) => !/ainda do App/.test(p)));
  t("o arquivo inválido dá o resumo vazio com os erros", (() => { const v = resumoDaSessao({ formato: "outro" }); return v.valido === false && v.erros.length > 0 && v.turnos === 0 && v.juiz.julgados === 0; })());
  let estourou = false;
  try { for (const k of [null, undefined, 3, "x", {}, []]) { resumoDaSessao(k); resumoDaSessao(k, k); } } catch { estourou = true; }
  t("lixo no resumo não estoura", !estourou);
  /* o executável: as quatro partes, para uma pessoa */
  const cli = spawnSync(process.execPath, [fileURLToPath(new URL("./replay.mjs", import.meta.url)), fileURLToPath(new URL("./sessao-navegador.json", import.meta.url)), "--resumo"], { encoding: "utf8" });
  const saida = String(cli.stdout || "");
  t("replay.mjs --resumo imprime as quatro partes e sai 0 (o motor sem defeito)", cli.status === 0 && ["O QUE REPRODUZ", "O MOTOR", "A DÍVIDA DO APP", "O JUIZ"].every((p) => saida.includes(p)) && /0 de 3 saem iguais/.test(saida) && /nenhum defeito/.test(saida) && /prometido/.test(saida), saida.slice(0, 200) + String(cli.stderr || "").slice(0, 200));
}

sec("10. O CRONISTA DO REPLAY É A PEÇA DO JOGO — oAceitoDoCronista, com as portas declaradas");
{
  /* 28/10 (trilha B): o passo «o Cronista» aplicava o aceito numa
     miniatura (a gente, o cânone e o lugar, cada um à sua maneira). Passa a
     chamar a peça que o App chama (motor/cronista-do-turno.js), com o
     estado do replay, e as portas do App que ainda não são motor entram
     como dublês declarados: não escrevem, gravam a chamada, e o que o App
     escreveu por elas é dívida da porta, não defeito. */
  const passo = PASSOS_DO_REPLAY.find((p) => p.passo === "o Cronista");
  t("o passo «o Cronista» diz que corre a peça do jogo", !!passo && /oAceitoDoCronista/.test(passo.de) && /julgarOCronista/.test(passo.de));
  const fonte = fs.readFileSync(new URL("../src/sessao.js", import.meta.url), "utf8");
  t("e a miniatura saiu do replay (nenhum segundo Cronista)", !/function aplicarOAceito/.test(fonte) && /oAceitoDoCronista\(/.test(fonte));
  /* toda porta que a peça chama tem linha na tabela: a porta sem dublê
     estouraria dentro da secção dela, e a secção cala — o replay perdia-a
     em silêncio. Provado JOGANDO (a catraca de teste-assercoes-de-texto:
     nenhuma suíte lê o texto de src/motor/): os 275 casos do dourado do
     Cronista (cronista-bloco.mjs, que percorrem todas as secções), cada um
     julgado e aplicado com um contexto que acusa o nome que a tabela não
     tem. */
  const { casosDoCronista } = await import("./cronista-bloco.mjs");
  const { julgarOCronista } = await import("../src/motor/cronista.js");
  const { oAceitoDoCronista } = await import("../src/motor/cronista-do-turno.js");
  const VALORES = new Set(["ler", "aplicar", "pers", "narrativa", "testeDoTurno", "rolagem"]);
  const pedidas = new Set(), semLinha = new Set();
  for (const k of casosDoCronista(275)) {
    let E = { ...k };
    const base = { ler: () => E, aplicar: (efs) => { for (const ef of efs) if (EFEITO_DO_CRONISTA_NO_REPLAY[ef.tipo]) E = { ...E, [EFEITO_DO_CRONISTA_NO_REPLAY[ef.tipo].campo]: ef[EFEITO_DO_CRONISTA_NO_REPLAY[ef.tipo].chave] }; }, pers: k.personagem, narrativa: k.narrativa, testeDoTurno: k.testeDoTurno, rolagem: k.rolagem };
    const ctx = new Proxy(base, { get: (o, nome) => {
      if (typeof nome !== "string" || VALORES.has(nome)) return o[nome];
      pedidas.add(nome);
      if (!PORTAS_DO_CRONISTA_NO_REPLAY[nome]) semLinha.add(nome);
      return (x) => (nome === "conferirCom" ? x : nome === "ganharFe" ? [] : nome === "fichaDeCompanheiro" ? { nome: x, nivel: 1, vida: 10, vidaMax: 10 } : null);
    } });
    try { const j = julgarOCronista(E, k.proposta, { narrativa: k.narrativa, pedido: k.doTurno.frase, envelopes: k.doTurno.envelopes }); oAceitoDoCronista(j.aceito, j.recusado, k.proposta, ctx); } catch { /* a peça nunca lança; se lançar, a suíte dela acusa */ }
  }
  t(`toda porta que a peça pede nos 275 casos (${pedidas.size}) tem linha em PORTAS_DO_CRONISTA_NO_REPLAY${semLinha.size ? " — sem linha: " + [...semLinha].join(", ") : ""}`, pedidas.size >= 10 && semLinha.size === 0, [...pedidas].join(","));
  t("cada linha diz se é motor ou dublê, os campos que o App escreve por ela e o porquê", Object.values(PORTAS_DO_CRONISTA_NO_REPLAY).every((x) => ["motor", "dublê"].includes(x.de) && Array.isArray(x.campos) && typeof x.porque === "string" && x.porque.length > 10) && Object.values(PORTAS_DO_CRONISTA_NO_REPLAY).filter((x) => x.de === "motor").every((x) => !x.campos.length));
  t("e todo efeito da peça que é estado tem campo (o resto — a nota, o calou, a lista — não é estado)", Object.values(EFEITO_DO_CRONISTA_NO_REPLAY).every((x) => typeof x.campo === "string" && typeof x.chave === "string") && !EFEITO_DO_CRONISTA_NO_REPLAY.nota && !EFEITO_DO_CRONISTA_NO_REPLAY.quests);

  /* um turno, corrido: o que a peça faz e a miniatura não fazia */
  const Ec = estadoDoSave({ personagem: { nome: "Íris Vantel", grupo: [] }, cidadeAtual: "Monte Rasa", mapa: { cidades: [{ nome: "Monte Rasa", populacao: 800 }] }, npcs: {}, canone: {}, dia: 4, divindade: { despertar: true } });
  const narr = "O taberneiro baixa a voz: \"Dizem que o Berço de Ossos ainda pulsa sob a colina.\" Ao balcão, Varek Duro limpa a lâmina e o Homem da carroça espera o troco. A praça de Monte Rasa murmura o nome de Íris como prece.";
  const Lc = { n: 1, entrada: { frase: "Pergunto pelo Berço." }, sorte: { ponto: "4|0|0" }, pedido: { pauta: "", envelopes: "" }, narrador: { narrativa: narr, mudancas: {} },
    cronista: { proposta: {
      canone: { "Berço de Ossos": { tipo: "artefato", descricao: "o disco que pulsa" } },
      pessoas: [{ nome: "Varek Duro", papel: "mercenário", genero: "ele" }, { nome: "Homem da carroça", papel: "carroceiro", genero: "ele" }],
      fe: { fieis: 10, pf: 1, motivo: "a praça reza" },
      promessas: [{ tipo: "frase", texto: "o Berço ainda pulsa sob a colina", quem: "o taberneiro" }],
    } } };
  const rc = correrOTurno(Ec, Lc, { semente: "teste|cronista" });
  const Ef = rc.estado;
  t("o cânone guarda a marca do que só foi dito, e o dia em que entrou (registradoDia: a peça)", !!(Ef.canone["Berço de Ossos"] && Ef.canone["Berço de Ossos"].dito) && Ef.canone["Berço de Ossos"].registradoDia === 4, J(Ef.canone));
  t("a gente entra pela ficha do jogo: o gênero do registo («ele» → «homem») e o turno em que se viu", !!Ef.npcs["Varek Duro"] && Ef.npcs["Varek Duro"].genero === "homem" && Number.isInteger(Ef.npcs["Varek Duro"].ultimaVez), J(Ef.npcs["Varek Duro"]));
  t("e o descritor não vira nome (nomeComDono, como no jogo; a miniatura registava-o)", !Ef.npcs["Homem da carroça"], J(Object.keys(Ef.npcs)));
  t("a promessa dita entra no Livro (guardarSementes: a miniatura não tinha o Livro)", ehLista(Ef.prometido && Ef.prometido.sementes) && Ef.prometido.sementes.some((x) => /Berço/.test(x.texto)), J(Ef.prometido));
  /* MOVIDA (29/10, Fase 4, trilha B): a fé era dublê e não contava; passou
     a ser a porta da fábrica dos órgãos do depois (ganharFe, à letra do
     App), e conta. A intenção — o que a porta faz no replay é o que se diz
     dela na tabela — fica: agora a tabela diz «motor», e a divindade anda. */
  t("a fé chama a porta do motor, e a fé conta (os fiéis do deus desperto; nenhuma dublê da fé)", !rc.portas.some((x) => x.porta === "ganharFe") && PORTAS_DO_CRONISTA_NO_REPLAY.ganharFe.de === "motor" && Number(Ef.divindade.fieis) > Number(Ec.divindade.fieis || 0), J([rc.portas, Ef.divindade]));
  t("nenhuma secção calou, nenhum passo estourou", !rc.calou.length && !rc.calouDoCronista.length, J([rc.calou, rc.calouDoCronista]));
  t("e corre duas vezes igual (determinismo)", J(correrOTurno(Ec, Lc, { semente: "teste|cronista" })) === J(rc));

  /* a dívida da porta: o que o App escreveu por uma porta-dublê, no turno
     em que ela foi chamada.
     MOVIDA (29/10, Fase 4, trilha B): a porta era a fé, que deixou de ser
     dublê; a régua prova-se agora com a que resta chamada nestes turnos —
     sincronizarNemesis, que o Cronista chama quando a gente do registo muda
     (os 13 chamados das sessões de prova). A intenção é a mesma: o campo que
     o App escreveu pela porta é dívida dela, e sem a porta é defeito. */
  const juizo = rc.juizo;
  const arqDe = (proposta, estado) => {
    let a = abrirASessao({ semente: "teste|cronista", estado: Ec, origem: "a suíte" });
    return gravarOTurno(a, { ...Lc, cronista: { proposta, juizo: proposta === Lc.cronista.proposta ? juizo : correrOTurno(Ec, { ...Lc, cronista: { proposta } }, { semente: "teste|cronista" }).juizo }, juiz: null, estado });
  };
  const nemDoApp = { nome: "Varek Duro", status: "derrotada" };
  const comNem = { ...Ef, nemesis: nemDoApp };
  const rp = reproduzirASessao(arqDe(Lc.cronista.proposta, comNem));
  const d1 = rp.turnos[0];
  t("o que o App escreveu por uma porta-dublê (a nêmesis) é dívida «a porta», não defeito", rp.valido && !rp.defeitos.length && d1.divida.some((d) => d.de === "a porta" && d.campo === "nemesis") && d1.porque.some((x) => /sincronizarNemesis/.test(x) && /\bApp\b/.test(x)), J(d1 && [d1.diferencas, d1.divida, d1.porque]));
  t("e o turno guarda as portas que o Cronista chamou", !!d1.portas && d1.portas.some((x) => x.porta === "sincronizarNemesis"));
  const semGente = { ...Lc.cronista.proposta }; delete semGente.pessoas;
  const rq = reproduzirASessao(arqDe(semGente, { ...correrOTurno(Ec, { ...Lc, cronista: { proposta: semGente } }, { semente: "teste|cronista" }).estado, nemesis: nemDoApp }));
  t("sem a porta chamada, a mesma divergência é defeito do motor", J(rq.defeitos) === J([1]) && rq.turnos[0].diferencas.some((d) => d.caminho.startsWith("nemesis")), J(rq.turnos[0] && rq.turnos[0].diferencas));

  /* O JUIZ CORRIGE NO REPLAY (v9.531): o App passa o aceito por
     canoneSemInvencao antes da peça; a linha grava o juízo CRU, e o replay
     refaz a correção do veredito que julga outra vez (a narração e a
     entrada gravadas). Sem isto, a sessão nova divergia no cânone nos ~3%
     de turnos com invenção. */
  const { entradaDoJuiz } = await import("../src/motor/juiz-do-turno.js");
  const FOTO = { personagem: { nome: "Vera", grupo: [] }, npcs: {}, mapa: { cidades: [{ nome: "Buraco Norte" }] }, cidadeAtual: "Buraco Norte", lugar: { nome: "a praça" }, narracoes: [], mundo: { semente: "prova|Fantasia medieval", genero: "Fantasia medieval" } };
  const PROSA = "O boticário ergue o frasco. Atrás dele, uma velha a quem chamam Fiandeira tece junto à Ponte das Cinzas, e não levanta os olhos.";
  const Ej = estadoDoSave({ personagem: FOTO.personagem, npcs: {}, canone: {}, mapa: FOTO.mapa, cidadeAtual: FOTO.cidadeAtual, lugar: null, dia: 2 });
  const Lj = { n: 1, entrada: { frase: "Olho em volta." }, sorte: { ponto: "2|0|0" }, pedido: { pauta: "", envelopes: "" }, narrador: { narrativa: PROSA, mudancas: {} },
    cronista: { proposta: { canone: { Fiandeira: { tipo: "pessoa", descricao: "a velha que tece" }, "Coroa de Sal": { tipo: "artefato", descricao: "a coroa do rei" } } } },
    juiz: { entrada: entradaDoJuiz(FOTO, { frase: "Olho em volta.", pauta: "" }), resumo: { turno: 1, dia: 2 } } };
  const rj = correrOTurno(Ej, Lj, { semente: "teste|juiz" });
  t("o nome que o Juiz deu por inventado neste turno não entra no cânone do replay (como no App)", !("Fiandeira" in rj.estado.canone) && rj.tirados.some((x) => x.nome === "Fiandeira"), J([Object.keys(rj.estado.canone), rj.tirados]));
  t("e o juízo que a linha guarda continua o cru (é ele que se compara com o gravado)", !!(rj.juizo && rj.juizo.aceito.canone && "Fiandeira" in rj.juizo.aceito.canone));
  const semJuiz = correrOTurno(Ej, { ...Lj, juiz: null }, { semente: "teste|juiz" });
  t("MORDE: sem o veredito da linha, a invenção entra como verdade imutável", "Fiandeira" in semJuiz.estado.canone && !semJuiz.tirados.length);
  const cego = correrOTurno(Ej, { ...Lj, juiz: { ...Lj.juiz, entrada: { ...Lj.juiz.entrada, papeis: [] } } }, { semente: "teste|juiz" });
  t("e o Juiz cego (a entrada sem os papéis do mundo — as sessões de prova) não tira nada", "Fiandeira" in cego.estado.canone && !cego.tirados.length);
}

sec("11. O TEMPO DO TURNO NO REPLAY — e o estado sem relógio continua sem ele");
{
  /* O tempo da ação e o passo na cidade (motor/tempo-do-turno.js, trilha A
     v9.532) correm no replay. A SEMÂNTICA, decidida aqui (28/10, trilha B):
     um estado SEM `minuto` continua sem ele depois dos dois passos. As
     sessões de prova foram gravadas de registos que não guardavam o
     relógio; criar a hora no replay inventaria o que ninguém marcou, e a
     régua do replay é o que se jogou. O lugar anda na mesma: o passo na
     cidade não depende do relógio. Com relógio, os minutos andam pela
     tabela (MINUTOS_POR_TURNO, TEMPO_DA_CAMINHADA). */
  const { MINUTOS_POR_TURNO } = await import("../src/calendario.js");
  const { TEMPO_DA_CAMINHADA } = await import("../src/motor/tempo-do-turno.js");
  const passo = (nome) => PASSOS_DO_REPLAY.find((p) => p.passo === nome);
  const tempo = passo("o tempo da ação"), sitio = passo("o sítio pela frase");
  const L = { entrada: { frase: "Vou até a forja do Tomas.", lugaresDaqui: [{ nome: "a forja do Tomas", onde: "dentro" }] } };
  const semRelogio = { cidadeAtual: "Buraco Norte", dia: 2, mapa: { cidades: [{ nome: "Buraco Norte" }] }, lugar: { nome: "a praça" }, personagem: { nome: "Marga" } };
  const a1 = tempo.faz(semRelogio, L), a2 = sitio.faz(a1, L);
  t("o estado sem relógio continua sem relógio depois do tempo da ação e do passo na cidade", !("minuto" in a1) && !("minuto" in a2), J({ a1: a1.minuto, a2: a2.minuto }));
  t("e o dia não se mexe sem relógio", a2.dia === 2);
  t("mas o lugar anda: o passo na cidade não depende do relógio", !!a2.lugar && a2.lugar.nome === "a forja do Tomas", J(a2.lugar));
  t("e os passos não mutam o recebido", !("minuto" in semRelogio) && semRelogio.lugar.nome === "a praça");
  const comRelogio = { ...semRelogio, minuto: 600 };
  const b1 = tempo.faz(comRelogio, L), b2 = sitio.faz(b1, L);
  t(`com relógio, a ação custa os minutos da tabela (${MINUTOS_POR_TURNO})`, b1.minuto === 600 + MINUTOS_POR_TURNO, String(b1.minuto));
  t(`e a caminhada dentro da cidade, os dela (${TEMPO_DA_CAMINHADA.dentro})`, b2.minuto === 600 + MINUTOS_POR_TURNO + TEMPO_DA_CAMINHADA.dentro && b2.lugar.nome === "a forja do Tomas", String(b2.minuto));
  t("a frase que é toque (a que abre com «[») não custa tempo", tempo.faz(comRelogio, { entrada: { frase: "[olhar]" } }).minuto === 600);
}

console.log(`\nsessão como arquivo: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
