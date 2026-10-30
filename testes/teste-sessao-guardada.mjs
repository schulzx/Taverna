/* ============================================================
   A SESSÃO GUARDADA (T1-A, 7.ª fatia, 28/10/2026) — testes/teste-sessao-guardada.mjs

   `src/sessao-guardada.js` diz onde o arquivo da sessão mora e com que
   teto; o App grava-o turno a turno. Aqui: a tabela lida de volta, as
   quatro regras da casa (chave nova, o espaço do modo historia, o teto, e
   nunca lançar), a forma do turno que a fiação junta, a página que vira,
   e o arquivo que o jogo gravou de verdade — três turnos no 5199 com o
   Narrador falso (`sessao-navegador.json`) — lido pelo replay: válido, e
   tudo o que é do motor reproduz; o que diverge é só do App, e diz-se.
   ============================================================ */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { SESSAO_GUARDADA, chaveDaSessao, gravaNesteModo, estadoParaASessao, turnoParaASessao, guardarASessao, cederAoSave, paginasDaSessao } from "../src/sessao-guardada.js";
import { abrirASessao, gravarOTurno, validarASessao, reproduzirASessao, estadoNoTurno, virarAPagina, resumoDaSessao, paginaDesde } from "../src/sessao.js";
import { espacoDoSave, MODOS } from "../src/modos.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const obj = (x) => (x && typeof x === "object" && !Array.isArray(x) ? x : {});

sec("1 · a tabela, lida de volta");
t("é congelada, e tem chave, teto, modos, o que fica de fora e a origem", Object.isFrozen(SESSAO_GUARDADA) && typeof SESSAO_GUARDADA.sufixo === "string" && SESSAO_GUARDADA.sufixo.length > 0
  && Number.isInteger(SESSAO_GUARDADA.teto) && Array.isArray(SESSAO_GUARDADA.modos) && Array.isArray(SESSAO_GUARDADA.foraDoArquivo) && typeof SESSAO_GUARDADA.origem === "string");
t("o teto fica abaixo de um quinto do que um navegador dá a uma origem (5 MB)", SESSAO_GUARDADA.teto > 100000 && SESSAO_GUARDADA.teto <= 1000000);

sec("2 · as regras da casa");
const espacoHistoria = espacoDoSave("historia");
t("a chave é nova, ao lado do save do modo historia", chaveDaSessao(espacoHistoria) === `${espacoHistoria}${SESSAO_GUARDADA.sufixo}` && chaveDaSessao(espacoHistoria) !== espacoHistoria);
t("e nenhuma chave de save de modo algum é a da sessão", (Array.isArray(MODOS) ? MODOS : Object.values(MODOS)).every((m) => m && chaveDaSessao(espacoHistoria) !== m.espaco && chaveDaSessao(espacoHistoria) !== m.espacoAnterior));
t("só Uma Vida grava (o beta é ela)", gravaNesteModo("historia") && !gravaNesteModo("rapida") && !gravaNesteModo("duelo") && !gravaNesteModo(undefined));
{
  const r = { personagem: { nome: "Vera" }, mensagens: [{ autor: "mestre", texto: "x" }], historico: [1], dia: 3 };
  const e = estadoParaASessao(r);
  t("o estado da sessão não leva o relato, e não toca no retrato", !("mensagens" in e) && !("historico" in e) && e.dia === 3 && e.personagem === r.personagem && r.mensagens.length === 1);
}
t("nada aqui lança com lixo", (() => {
  try { estadoParaASessao(null); turnoParaASessao(null); guardarASessao(null); guardarASessao({ turnos: "torto" }); chaveDaSessao(null); gravaNesteModo(null, null); return true; } catch { return false; }
})());

sec("3 · o turno que a fiação junta");
{
  const comFrase = turnoParaASessao({ frase: "Vou ao poço.", lugaresDaqui: [{ nome: "o poço", onde: "dentro" }], ponto: "1|480|3", contagem: { salvaguarda: 0 }, casa: "s|1|480|3", pauta: "P", envelopes: "E", nomesAMao: [{ nome: "Ilka", genero: "ela" }], moeda: "escamas", narrador: { narrativa: "N", mudancas: {} }, cronista: { proposta: {}, juizo: null }, juiz: { resumo: { turno: 1 } } });
  t("a frase do jogador vai como frase, com os sítios dali", comFrase.entrada.frase === "Vou ao poço." && comFrase.entrada.lugaresDaqui.length === 1 && !comFrase.entrada.toque);
  t("a sorte, o pedido, a resposta, o Cronista e o Juiz", comFrase.sorte.ponto === "1|480|3" && comFrase.sorte.casa === "s|1|480|3" && comFrase.sorte.contagem.salvaguarda === 0
    && comFrase.pedido.pauta === "P" && comFrase.pedido.envelopes === "E" && comFrase.pedido.nomesAMao[0].nome === "Ilka" && comFrase.pedido.moeda === "escamas"
    && comFrase.narrador.narrativa === "N" && comFrase.cronista.proposta && comFrase.juiz.resumo.turno === 1);
  const toque = turnoParaASessao({ frase: "", conteudo: "[ABERTURA DA CAMPANHA] " + "x".repeat(900), ponto: "1|0|0" });
  t("sem frase do jogador, o envelope que subiu vai como toque (aparado)", toque.entrada.toque && toque.entrada.toque.conteudo.startsWith("[ABERTURA") && toque.entrada.toque.conteudo.length === 400 && toque.cronista === null && toque.juiz === null);
  /* 29/10 (a 13.ª): os sítios só vão onde o passo do sítio os lê — a frase
     do jogador que não é envelope. Num toque eram 3,5 mil caracteres mortos. */
  const sitios = [{ nome: "o poço", onde: "dentro" }];
  t("num toque, os sítios dali não vão (o passo do sítio não os lê)", !("lugaresDaqui" in turnoParaASessao({ frase: "", conteudo: "[RODADA] x", lugaresDaqui: sitios, ponto: "1|0|0" }).entrada));
  t("nem numa frase que é um envelope ([...])", !("lugaresDaqui" in turnoParaASessao({ frase: "[DESCANSO] x", lugaresDaqui: sitios, ponto: "1|0|0" }).entrada));
}

sec("4 · a página vira, e a de antes não se perde");
{
  /* MUDOU EM 29/10 (a 13.ª sessão). A asserção antiga dizia "a página vira:
     arquivo novo, sem turnos, que começa no fim do último" — e a fiação
     guardava SÓ esse arquivo novo: a 13.ª virou aos 21 turnos e perdeu-os
     todos, o T22 (o que provocou a virada) incluído. A intenção que fica:
     o arquivo novo é válido, cabe no teto e reproduz. O que muda: o último
     turno passa à página nova (que começa no estado de antes dele), a
     velha vai inteira em `anterior`, e a cabeça diz que página é. */
  let A = abrirASessao({ semente: "s|Fantasia medieval", estado: { personagem: { nome: "Vera", vida: 10 }, dia: 1 }, origem: "prova" });
  const juizDe = (i) => ({ resumo: { turno: i, dia: 1, achados: 0, por: {} }, entrada: { frase: "turno " + i, antes: Array.from({ length: i - 1 }, (_, k) => "narra " + (k + 1)).slice(-6), pauta: "" } });
  const turnoDe = (i, juiz) => ({ ...turnoParaASessao({ frase: "turno " + i, ponto: "1|" + i + "|" + i, pauta: "p".repeat(2000), narrador: { narrativa: "narra " + i, mudancas: {} }, ...(juiz ? { juiz } : {}) }), estado: { personagem: { nome: "Vera", vida: 10 - i }, dia: 1 } });
  for (let i = 1; i <= 3; i++) A = gravarOTurno(A, turnoDe(i, juizDe(i)));
  const cabe = guardarASessao(A, { ...SESSAO_GUARDADA, teto: 1e6 });
  t("abaixo do teto, guarda-se como está", cabe.texto === JSON.stringify(A) && !cabe.virou && cabe.arquivo === A);
  t("a terceira linha guardou só quantas narrações de eco lê (2), não o texto delas", A.turnos[2].juiz.antesDoArquivo === 2 && !("antes" in A.turnos[2].juiz.entrada));
  const teto = JSON.stringify(A).length - 10;
  const virou = guardarASessao(A, { ...SESSAO_GUARDADA, teto });
  const N = virou.arquivo;
  t("acima do teto, a página vira, e o turno que a virou é o primeiro da nova", virou.virou && N.turnos.length === 1 && N.turnos[0].n === 1 && N.turnos[0].entrada.frase === "turno 3");
  t("a nova começa no estado de antes dele, e acaba onde a inteira acabava", JSON.stringify(N.inicio) === JSON.stringify(estadoNoTurno(A, 2)) && JSON.stringify(estadoNoTurno(N, 1)) === JSON.stringify(estadoNoTurno(A, 3)));
  t("a linha que passou leva as narrações de eco inteiras (as da página velha)", !("antesDoArquivo" in N.turnos[0].juiz) && JSON.stringify(N.turnos[0].juiz.entrada.antes) === JSON.stringify(["narra 1", "narra 2"]));
  t("a de antes vai inteira, com os dois primeiros turnos", N.anterior && N.anterior.turnos.length === 2 && JSON.stringify(N.anterior.inicio) === JSON.stringify(A.inicio) && !("anterior" in N.anterior));
  t("a cabeça diz que página é e o que ficou para trás", N.virada && N.virada.pagina === 2 && N.virada.turnosAntes === 2 && N.virada.cortou === 0);
  t("o texto guardado é a página e a de antes, e lê-se de volta igual", JSON.stringify(JSON.parse(virou.texto)) === JSON.stringify(N) && JSON.stringify({ ...N, anterior: undefined }).length <= teto);
  t("as duas páginas são válidas, cada uma por si e juntas", validarASessao(N).ok && paginasDaSessao(N).length === 2 && paginasDaSessao(N).every((p) => validarASessao(p).ok && !("anterior" in p)));
  {
    /* o Juiz julga a linha que passou igual nas duas páginas: o eco é o mesmo */
    const inteira = reproduzirASessao(A, {}), nova = reproduzirASessao(paginasDaSessao(N)[1], {});
    t("o turno que passou reproduz igual na página nova e na inteira", nova.valido && JSON.stringify(nova.turnos[0].juiz) === JSON.stringify(inteira.turnos[2].juiz) && JSON.stringify(nova.turnos[0].diferencas) === JSON.stringify(inteira.turnos[2].diferencas));
  }
  /* a segunda virada: a página de antes da de antes é que se corta, e conta-se */
  let B = N;
  for (let i = 4; i <= 6; i++) B = gravarOTurno(B, turnoDe(i, null));
  const v2 = guardarASessao(B, { ...SESSAO_GUARDADA, teto });
  const N2 = v2.arquivo;
  t("na segunda virada, a de antes passa a ser a página 2, e a 1 conta-se como cortada", v2.virou && N2.virada.pagina === 3 && N2.virada.turnosAntes === 5 && N2.virada.cortou === 2
    && N2.anterior.turnos.length === 3 && N2.anterior.virada.pagina === 2 && N2.turnos.length === 1 && N2.turnos[0].entrada.frase === "turno 6");
  const semLugar = guardarASessao(B, { ...SESSAO_GUARDADA, teto, tetoDaAnterior: 100 });
  t("uma de antes que não cabe no teto dela não vai, e conta-se no corte", semLugar.virou && !("anterior" in semLugar.arquivo) && semLugar.arquivo.virada.cortou === 2 + 3 && validarASessao(semLugar.arquivo).ok);
  const nem = guardarASessao(A, { ...SESSAO_GUARDADA, teto: 50 });
  t("se nem a cabeça cabe, não se guarda nada (a fiação apaga a chave)", nem.texto === null && nem.virou);
  t("virarAPagina não lança com lixo, e uma página sem turnos não tem o que passar", virarAPagina(null) === null && virarAPagina({ turnos: [] }) === null && Array.isArray(paginasDaSessao(null)));
}

sec("4b · o que a linha levava a mais (a 13.ª sessão, IA real, 29/10)");
{
  /* A 13.ª virou a página aos 21 turnos: a cabeça pesava 96,8 mil e o turno
     28,1 mil, contra 41 mil e 14–15 mil medidos em 28/10. O que engordou foi
     a `fidelidade` — a conta do Juiz, que o estado levava inteira em cada
     linha (os últimos 24 vereditos com os trechos) e outra vez na cabeça.
     Ela é bastidor: o replay não a compara nem a escreve, e refaz-se das
     linhas (`resumoDaSessao` soma o `juiz.resumo` de cada uma). */
  t("a conta do Juiz fica de fora do estado da sessão", SESSAO_GUARDADA.foraDoArquivo.includes("fidelidade") && !("fidelidade" in estadoParaASessao({ fidelidade: { turnos: 3 }, dia: 1 })));
  const S13 = JSON.parse(fs.readFileSync(new URL("./sessao-s13.json", import.meta.url), "utf8"));
  const L = S13.turnos[0];
  const fim = estadoParaASessao(estadoNoTurno(S13, 1));
  let B = abrirASessao({ semente: S13.semente, mundo: S13.mundo, origem: S13.origem, estado: estadoParaASessao(S13.inicio) });
  B = gravarOTurno(B, { entrada: L.entrada, sorte: L.sorte, pedido: L.pedido, narrador: L.narrador, cronista: L.cronista, juiz: L.juiz, estado: fim });
  const J = (x) => JSON.stringify(x).length;
  const cab0 = J({ ...S13, turnos: [] }), cab1 = J({ ...B, turnos: [] }), lin0 = J(L), lin1 = J(B.turnos[0]);
  /* a primeira linha de uma página leva as narrações de eco inteiras; as
     seguintes só quantas são — o peso de uma linha corrente é sem elas */
  const eco = J(obj(obj(L.juiz).entrada).antes || []);
  /* MUDOU EM 29/10 (o teto da chave): a conta corria no teto da tabela, e
     o teto desceu de 600 para 400 mil (ver 4c). A intenção desta asserção
     é o que a conta do Juiz custava a uma página, e isso mede-se no teto
     com que a 13.ª correu — fica cravado aqui, com o nome de onde vem. A
     página no teto de hoje é provada em 4c. */
  const TETO_DA_13 = 600000;
  const porPagina0 = Math.floor((TETO_DA_13 - cab0) / (lin0 - eco)), porPagina1 = Math.floor((TETO_DA_13 - cab1) / (lin1 - eco));
  console.log("      a 13.ª: cabeça " + cab0 + " → " + cab1 + "; linha " + lin0 + " → " + lin1 + " (corrente " + (lin1 - eco) + "); turnos por página " + porPagina0 + " → " + porPagina1);
  t("a linha da 13.ª perde a conta do Juiz (7 mil caracteres) e mais nada", lin0 - lin1 > 6500 && !("fidelidade" in obj(B.turnos[0].estado.chaves)) && !("fidelidade" in obj(B.turnos[0].estado.troca)));
  t("a cabeça perde-a também", cab0 - cab1 > 6000);
  t("e a página (no teto da 13.ª) leva ~29 turnos, não os ~20 que a 13.ª teve", porPagina1 >= 28 && porPagina0 <= 21);
  const r0 = reproduzirASessao(S13, {}), r1 = reproduzirASessao(B, {});
  t("o replay do turno sai igual com e sem a conta (ela não é da régua)", r1.valido && JSON.stringify(r1.turnos.map((x) => [x.igual, x.defeito, x.diferencas, x.juiz])) === JSON.stringify(r0.turnos.map((x) => [x.igual, x.defeito, x.diferencas, x.juiz])));
  t("e o Juiz somado sobre a sessão é o mesmo", JSON.stringify(resumoDaSessao(B).juiz) === JSON.stringify(resumoDaSessao(S13).juiz));
}

sec("4c · o teto da chave: a página e a de antes, juntas (29/10)");
{
  /* A chave guarda a página e a de antes. Com 600 mil cada uma, chegava a
     1,19 milhão de caracteres (~2,4 MB em UTF-16), e o save divide o
     espaço da origem com ela. Agora fica em ~800 mil, e a de antes que não
     cabe poda-se pela frente — a cabeça e os últimos turnos inteiros. A
     medida é a linha da 13.ª (IA real), gravada turno a turno como a
     fiação faz, com o estado a ir e voltar (a diferença de cada linha é a
     do turno de verdade) e o eco do Juiz a apontar para o arquivo. */
  const S13 = JSON.parse(fs.readFileSync(new URL("./sessao-s13.json", import.meta.url), "utf8"));
  const L = S13.turnos[0];
  const ini = estadoParaASessao(S13.inicio), fim = estadoParaASessao(estadoNoTurno(S13, 1));
  const nEco = L.juiz.entrada.antes.length;
  const turnoDe = (i, narr) => ({ entrada: L.entrada, sorte: L.sorte, pedido: L.pedido, narrador: { ...L.narrador, narrativa: L.narrador.narrativa + " (" + i + ")" }, cronista: L.cronista,
    juiz: { ...L.juiz, entrada: { ...L.juiz.entrada, antes: narr.slice(-nEco) } }, estado: i % 2 ? fim : ini });
  const jogar = (n, cfg) => {
    let A = abrirASessao({ semente: S13.semente, mundo: S13.mundo, origem: S13.origem, estado: ini });
    let F = A, maior = 0, viradas = 0, ultimo = null;
    const narr = [];
    for (let i = 1; i <= n; i++) {
      const tu = turnoDe(i, narr);
      narr.push(tu.narrador.narrativa);
      A = gravarOTurno(A, tu); F = gravarOTurno(F, tu);
      const g = guardarASessao(A, cfg);
      A = g.arquivo;
      if (g.texto) { maior = Math.max(maior, g.texto.length); ultimo = g.texto; }
      if (g.virou) viradas++;
    }
    return { A, F, maior, viradas, ultimo };
  };
  const J = (x) => JSON.stringify(x).length;
  const pesoDaLinha = Math.max(...jogar(3, { ...SESSAO_GUARDADA, teto: 1e7 }).A.turnos.slice(1).map(J));
  t("a tabela divide a chave em ~800 mil: a página e a de antes", SESSAO_GUARDADA.teto + SESSAO_GUARDADA.tetoDaAnterior <= 800000 && SESSAO_GUARDADA.tetoDaAnterior >= SESSAO_GUARDADA.teto);
  const r = jogar(48, SESSAO_GUARDADA);
  console.log("      a chave cheia: " + r.maior + " caracteres em " + r.viradas + " viradas (era 1,19 milhão com 600 + 600); a linha " + pesoDaLinha);
  t("a chave cheia, medida com a linha da 13.ª, fica abaixo de 800 mil caracteres", r.viradas >= 2 && r.maior <= SESSAO_GUARDADA.teto + SESSAO_GUARDADA.tetoDaAnterior + 64 && r.maior <= 800064, String(r.maior));
  const [ant, ag] = paginasDaSessao(r.A);
  t("e a de antes vai inteira: cabia no teto um turno antes", ant && ag && r.A.virada.turnosAntes - r.A.virada.cortou === ant.turnos.length && J(ant) <= SESSAO_GUARDADA.tetoDaAnterior);
  {
    /* a janela que a chave tem SEMPRE é a de logo depois de uma virada:
       um turno na página e a de antes inteira */
    const porPagina = Math.floor((SESSAO_GUARDADA.teto - J({ ...r.A, turnos: [], virada: undefined, anterior: undefined })) / pesoDaLinha);
    t("e a janela mínima, depois de virar, é de mais de dez turnos", ant.turnos.length >= porPagina - 1 && porPagina >= 10, porPagina + " por página");
  }
  /* A PODA, no caminho em que a de antes não cabe: a tabela 600 + 200 (a
     primeira divisão pensada) faz a de antes passar do teto dela a cada
     virada */
  const cfgPoda = { ...SESSAO_GUARDADA, teto: 600000, tetoDaAnterior: 200000 };
  const p = jogar(30, cfgPoda);
  const [pa, pg] = paginasDaSessao(p.A);
  const desde = p.A.virada.turnosAntes - pa.turnos.length;
  t("a de antes que não cabe poda-se pela frente, e cabe no teto dela", p.viradas >= 1 && pa.turnos.length >= 1 && J(pa) <= cfgPoda.tetoDaAnterior && p.maior <= cfgPoda.teto + cfgPoda.tetoDaAnterior + 64);
  t("ficam os últimos turnos, colados à página de agora", desde > 0 && pa.turnos[pa.turnos.length - 1].narrador.narrativa === p.F.turnos[p.A.virada.turnosAntes - 1].narrador.narrativa
    && pg.turnos[0].narrador.narrativa === p.F.turnos[p.A.virada.turnosAntes].narrador.narrativa);
  t("e quantos cabem: mais um não caberia", J(pa) + pesoDaLinha > cfgPoda.tetoDaAnterior - 64);
  t("nenhuma linha vai a meio: cada uma é a do turno inteiro (só o número e o eco da primeira mudam)", pa.turnos.every((x, j) => {
    const o = p.F.turnos[desde + j];
    const sem = (y) => JSON.stringify({ ...y, n: 0, juiz: { ...y.juiz, antesDoArquivo: 0, entrada: { ...y.juiz.entrada, antes: 0 } } });
    return x.n === j + 1 && sem(x) === sem(o);
  }));
  t("a cabeça dela fica, e o início é o estado de antes do primeiro que ficou", pa.semente === S13.semente && JSON.stringify(pa.mundo) === JSON.stringify(S13.mundo) && pa.origem === S13.origem
    && JSON.stringify(pa.inicio) === JSON.stringify(estadoNoTurno(p.F, desde)));
  t("a virada dela soma o que se podou, e a de agora conta-o no corte", pa.virada.turnosAntes === desde && pa.virada.cortou === desde && p.A.virada.cortou === desde);
  t("a podada é válida, e reproduz igual aos mesmos turnos sem corte", validarASessao(pa).ok && (() => {
    const rp = reproduzirASessao(pa, {}), rf = reproduzirASessao({ ...p.F, turnos: p.F.turnos.slice(0, desde + pa.turnos.length) }, {});
    return rp.valido && rp.turnos.every((x, j) => JSON.stringify([x.igual, x.diferencas, x.juiz]) === JSON.stringify([rf.turnos[desde + j].igual, rf.turnos[desde + j].diferencas, rf.turnos[desde + j].juiz]));
  })());
  {
    /* o replay lê a de antes com --anterior, como a pessoa o corre */
    const tmp = path.join(os.tmpdir(), "taverna-sessao-podada-" + process.pid + ".json");
    fs.writeFileSync(tmp, p.ultimo);
    const cli = spawnSync(process.execPath, [fileURLToPath(new URL("./replay.mjs", import.meta.url)), tmp, "--anterior", "--resumo"], { encoding: "utf8" });
    try { fs.unlinkSync(tmp); } catch { /* o tmp é do sistema */ }
    t("o replay lê a de antes podada (--anterior)", cli.status !== 1 && String(cli.stdout).includes("· " + pa.turnos.length + " turnos ·") && String(cli.stdout).includes("a de antes vem junta"), String(cli.stdout).slice(0, 200) + String(cli.stderr).slice(0, 200));
  }
  t("paginaDesde não lança com lixo, e um corte que não deixa turno é null", paginaDesde(null, 0) === null && paginaDesde({ turnos: [] }, 0) === null && paginaDesde(p.F, p.F.turnos.length) === null && paginaDesde(p.F, -1) === null && paginaDesde(p.F, 1.5) === null);
  t("e paginaDesde(0) é a página inteira, renumerada igual", JSON.stringify(paginaDesde(p.F, 0).turnos.map((x) => x.narrador.narrativa)) === JSON.stringify(p.F.turnos.map((x) => x.narrador.narrativa)) && validarASessao(paginaDesde(p.F, 0)).ok);
}

sec("5 · o arquivo que o jogo gravou (5199, Narrador falso, 28/10)");
{
  /* três turnos de verdade: a abertura (um toque), "caminho pelas ruas" e
     "vou até o poço"; gravados pela fiação do App, tirados do localStorage */
  const A = JSON.parse(fs.readFileSync(new URL("./sessao-navegador.json", import.meta.url), "utf8"));
  const v = validarASessao(A);
  t("é válido, com três turnos", v.ok && A.turnos.length === 3, JSON.stringify(v.erros.slice(0, 3)));
  t("a cabeça leva a semente, o mundo e o estado sem o relato", A.semente === "Prova da Sessao|Fantasia medieval" && A.mundo && A.mundo.genero === "Fantasia medieval" && (A.inicio.mensagens || []).length === 0 && (A.inicio.historico || []).length === 0); /* o save v2 põe todo campo, e o relato vem vazio */
  t("a abertura entrou como toque, e as duas frases como frase", A.turnos[0].entrada.toque && A.turnos[1].entrada.frase === "Caminho pelas ruas da vila, devagar, olhando as casas." && A.turnos[2].entrada.frase === "Vou até o poço e bebo um pouco de água.");
  t("cada turno leva a sorte, a pauta, a resposta crua, o Cronista e o Juiz", A.turnos.every((L) => /^\d+\|\d+\|\d+$/.test(L.sorte.ponto) && L.sorte.casa && L.pedido.pauta.length > 500 && L.narrador.narrativa.length > 60 && L.cronista && L.juiz && L.juiz.resumo));
  const pesos = A.turnos.map((L) => JSON.stringify(L).length);
  console.log(`      o arquivo ${JSON.stringify(A).length} caracteres; a cabeça ${JSON.stringify(A).length - pesos.reduce((a, b) => a + b, 0)}; os turnos ${pesos.join(", ")}`);
  /* MUDOU EM 29/10 (o teto da chave): dizia "o arquivo é menos de um
     quinto do teto", o que a 600 mil era o mesmo que dezenas de turnos; a
     400 mil o quinto (80 mil) fica abaixo da cabeça e de três turnos (84,6
     mil). A intenção — cabem dezenas de turnos destes numa página — passa
     a contar-se em turnos, com o mais pesado dos três. */
  t("e cabe no teto com folga para dezenas de turnos", Math.floor((SESSAO_GUARDADA.teto - (JSON.stringify(A).length - pesos.reduce((a, b) => a + b, 0))) / Math.max(...pesos)) >= 20);
  const r = reproduzirASessao(A, {});
  t("o replay lê-o e corre os três turnos sem estourar", r.valido && r.turnos.length === 3 && r.turnos.every((x) => !x.calou.length));
  /* O QUE É DO MOTOR REPRODUZ. Cada divergência deste arquivo é de um
     campo que nenhum passo do replay escreve — a mesa, o compasso, a
     memória da gente, o chão, o relógio: a parte do turno que ainda mora no
     App (DONO_DO_CAMPO). A ficha, a gente, o cânone e o mapa saem iguais. */
  const DO_MOTOR = ["personagem", "npcs", "canone", "mapa", "cidadeAtual", "combate", "missoes", "baseMundo", "npcTurno"];
  const doMotor = r.turnos.flatMap((x) => x.diferencas.filter((d) => DO_MOTOR.includes(d.caminho.split(/[.[]/)[0])));
  t("nenhuma divergência num campo que o motor escreve", doMotor.length === 0, JSON.stringify(doMotor.slice(0, 3)));
  t("e toda divergência diz de quem é", r.turnos.every((x) => x.igual || x.porque.length > 0));
  console.log(`      ${r.reproduzidos} de ${r.turnos.length} turnos reproduzem; o que diverge: ${[...new Set(r.turnos.flatMap((x) => x.diferencas.map((d) => d.caminho.split(/[.[]/)[0])))].join(", ")}`);
}

sec("6 · a fiação no App");
{
  const APP = fs.readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8").replace(/\r\n/g, "\n");
  const C = APP.replace(/\/\*[\s\S]*?\*\//g, "");
  t("o App importa o gravador e onde guardar", /import \{ abrirASessao, gravarOTurno \} from "\.\/sessao\.js";/.test(C) && /from "\.\/sessao-guardada\.js";/.test(C));
  t("a linha grava-se depois do Cronista, numa fila, em calou", /\.then\(\(\) => Promise\.resolve\(doCronista\)\.catch\(\(\) => null\)\)\s*\.then\(\(\) => \{ try \{ gravarOTurnoDaSessao\(juntado\); \} catch \(e\) \{ calou\("a sessão \(o turno\)", e\); \} \}\);/.test(C));
  t("a escrita que falha apaga a chave da sessão, e só ela", /catch \(e\) \{ try \{ localStorage\.removeItem\(chave\); \} catch \{ *\} calou\("guardar a sessão", e\); \}/.test(C) && /const chave = chaveDaSessao\(chaveDoSave\(\)\);/.test(C));
}

sec("a sessão cede ao save (28/10): o arquivo do replay é bastidor, o save é do jogador");
{
  /* um armazém que enche como um navegador: conta caracteres e lança ao passar da cota */
  const armazem = (cota) => {
    const m = new Map();
    const usado = () => [...m].reduce((a, [k, v]) => a + k.length + v.length, 0);
    return {
      getItem: (k) => (m.has(k) ? m.get(k) : null),
      setItem: (k, v) => { const antes = m.get(k); m.set(k, String(v)); if (usado() > cota) { if (antes == null) m.delete(k); else m.set(k, antes); throw new Error("QuotaExceededError"); } },
      removeItem: (k) => { m.delete(k); },
    };
  };
  const esp = espacoHistoria;
  const A = armazem(1000);
  A.setItem(chaveDaSessao(esp), "s".repeat(700));
  let falhou = false; try { A.setItem(esp, "v".repeat(400)); } catch { falhou = true; }
  t("com a sessão cheia, o save não cabe (é o caso que se conserta)", falhou && A.getItem(esp) == null);
  t("cederAoSave larga a sessão e diz que largou", cederAoSave(A, esp) === true && A.getItem(chaveDaSessao(esp)) == null);
  let gravou = true; try { A.setItem(esp, "v".repeat(400)); } catch { gravou = false; }
  t("e o save, depois, cabe inteiro", gravou && A.getItem(esp).length === 400);
  t("sem sessão a largar, devolve false e não toca no save", cederAoSave(A, esp) === false && A.getItem(esp).length === 400);
  t("nunca apaga a chave do próprio save, nem com sufixo vazio", cederAoSave(A, esp, { ...SESSAO_GUARDADA, sufixo: "" }) === false && A.getItem(esp).length === 400);
  t("não lança com armazém nulo, torto, ou que estoura", cederAoSave(null, esp) === false && cederAoSave({}, esp) === false
    && cederAoSave({ getItem: () => { throw new Error("x"); }, removeItem: () => {} }, esp) === false);
  /* a fiação: o App cede a sessão antes de podar o histórico (lido no texto
     porque `salvar` mora no componente; sai quando o save for do motor) */
  const C = fs.readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8").replace(/\r\n/g, "\n").replace(/\/\*[\s\S]*?\*\//g, "");
  const iCede = C.indexOf("cederAoSave(localStorage, chaveDoSave())"), iPoda = C.indexOf("for (const n of [120, 60, 30])");
  t("o App cede a sessão antes de podar o histórico, em calou", iCede > 0 && iPoda > iCede && /if \(!gravou\) \{ try \{ if \(cederAoSave\(localStorage, chaveDoSave\(\)\)\) gravou = gravar\(historicoEnxuto\(250\)\); \} catch \(e\) \{ calou\(/.test(C));
}

console.log(`\na sessão guardada: ${ok} passaram, ${mal} falharam`);
if (mal) process.exit(1);
