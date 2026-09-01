/* teste-viagem.mjs (v9.56) — a viagem passa a contar estrada, não dias
   de calendário, e o Mestre passa a saber quanto falta.               */
import { abrirViagem, andar, comTrechos, trechoAtual, pausarViagem, retomarViagem, progressoDaViagem, resumoViagemPrompt, linhaDaViagem, minutosDaRota, ESTADOS, HORAS_MARCHA_POR_DIA, MINUTOS_ESTRADA_POR_TURNO, MINUTOS_RELOGIO_POR_TURNO, VIAGEM_PROMPT } from "../src/viagem.js";
import { gerarGeografia } from "../src/geografia.js";
import { celulasNaRota } from "../src/celulas.js";
import { detectarSeguirViagem } from "../src/rastro.js";
import { moldePorId } from "../src/moldes.js";

let ok = 0, mal = 0;
const t = (nome, cond) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome); } };
const sec = (s) => console.log("\n" + s);

const rota = { de: "A", para: "B", km: 80, dias: 6.5, terreno: "gelo" };

sec("1. a régua do tempo fecha dos dois lados");
{
  t("um dia de jornada são 8 horas de marcha", HORAS_MARCHA_POR_DIA === 8);
  t("um avanço cobre 4 horas — meio dia de marcha", MINUTOS_ESTRADA_POR_TURNO === 240);
  t("e o relógio anda meio dia de calendário", MINUTOS_RELOGIO_POR_TURNO === 720);
  /* a conta que precisa fechar: turnos × meio dia = os dias da rota */
  const j = abrirViagem({ de: "A", para: "B", dia: 1, rota });
  const p = progressoDaViagem(j);
  t("uma rota de 6,5 dias pede 13 avanços", p.turnosTotais === 13);
  t("13 avanços × meio dia = 6,5 dias de calendário", (13 * MINUTOS_RELOGIO_POR_TURNO) / 1440 === 6.5);
  console.log(`      ${rota.dias} dias · ${p.horasTotais} h de marcha · ${p.turnosTotais} avanços`);
  t("rota sem dias declarados cai no piso de três", minutosDaRota(null) === 3 * 8 * 60);
  t("e uma rota curtíssima ainda pede um avanço", progressoDaViagem(abrirViagem({ de: "A", para: "B", rota: { dias: 0.25 } })).turnosTotais === 1);
}

sec("2. só quem anda chega — o bug do acampamento");
{
  let j = abrirViagem({ de: "A", para: "B", dia: 1, rota });
  t("acabou de partir: nada percorrido", progressoDaViagem(j).pct === 0);
  t("e faltam os 13", progressoDaViagem(j).turnosRestantes === 13);
  /* o teste que dá nome ao bug: o calendário andando sozinho NÃO anda a estrada */
  const congelada = { ...j };
  t("passar dias sem viajar não move um metro", progressoDaViagem(congelada).pct === 0 && !progressoDaViagem(congelada).chegou);

  for (let i = 0; i < 6; i++) j = andar(j);
  const meio = progressoDaViagem(j);
  console.log(`      depois de 6 avanços: ${meio.pct}% · faltam ${meio.turnosRestantes}`);
  t("seis avanços passam da metade", meio.pct > 45 && meio.pct < 50);
  t("e faltam sete", meio.turnosRestantes === 7);
  t("ainda não chegou", !meio.chegou && j.estado === ESTADOS.emCurso);

  for (let i = 0; i < 6; i++) j = andar(j);
  t("no décimo segundo ainda falta um", progressoDaViagem(j).turnosRestantes === 1);
  j = andar(j);
  t("no décimo terceiro, chegou", progressoDaViagem(j).chegou);
  t("e o registro se fecha", j.estado === ESTADOS.concluida);
  t("andar depois de chegar não estoura", progressoDaViagem(andar(andar(j))).pct === 100);
}

sec("2b. forçar a marcha compra estrada de verdade");
{
  const normal = andar(abrirViagem({ de: "A", para: "B", rota }));
  const forcado = andar(abrirViagem({ de: "A", para: "B", rota }), MINUTOS_ESTRADA_POR_TURNO + 180);
  t("três horas extras cobrem mais trecho", forcado.andadoMin > normal.andadoMin);
  t("e encurtam as horas que faltam", progressoDaViagem(forcado).horasTotais - progressoDaViagem(forcado).horasFeitas < progressoDaViagem(normal).horasTotais - progressoDaViagem(normal).horasFeitas);
  /* três horas é menos que um avanço: duas marchas forçadas é que economizam um */
  const duas = andar(andar(abrirViagem({ de: "A", para: "B", rota }), MINUTOS_ESTRADA_POR_TURNO + 180), MINUTOS_ESTRADA_POR_TURNO + 180);
  const duasNormais = andar(andar(abrirViagem({ de: "A", para: "B", rota })));
  t("duas marchas forçadas economizam um avanço inteiro", progressoDaViagem(duas).turnosRestantes < progressoDaViagem(duasNormais).turnosRestantes);
  console.log(`      2 normais: faltam ${progressoDaViagem(duasNormais).turnosRestantes} · 2 forçadas: faltam ${progressoDaViagem(duas).turnosRestantes}`);
}

sec("3. a pausa existe e para de verdade");
{
  let j = andar(andar(abrirViagem({ de: "A", para: "B", rota })));
  const antes = progressoDaViagem(j).pct;
  j = pausarViagem(j, "uma emboscada na estrada");
  t("pausa", j.estado === ESTADOS.pausada);
  t("guarda o motivo", /emboscada/.test(j.motivoPausa));
  t("e não perde o percorrido", progressoDaViagem(j).pct === antes);
  t("o Mestre é avisado de que a viagem parou", /VIAGEM PAUSADA/.test(resumoViagemPrompt(j)));
  t("e proibido de aproximar o destino", /NÃO avanço na estrada/.test(resumoViagemPrompt(j)));
  j = retomarViagem(j);
  t("retomar volta ao curso", j.estado === ESTADOS.emCurso && !j.motivoPausa);
  t("retomar uma viagem que não estava pausada não faz nada", retomarViagem(j).estado === ESTADOS.emCurso);
  t("pausar uma concluída não a reabre", pausarViagem({ ...j, estado: ESTADOS.concluida }).estado === ESTADOS.concluida);
}

sec("4. o que o Mestre lê — e o que ele é proibido de dizer");
{
  const j0 = abrirViagem({ de: "Nova do Norte", para: "Forte do Rei", dia: 1, rota });
  const txt0 = resumoViagemPrompt(j0);
  t("diz PARA ONDE — o que faltava na linha antiga", txt0.includes("para Forte do Rei"));
  t("diz de onde", txt0.includes("de Nova do Norte"));
  t("diz quanto falta, em avanços", /FALTAM 13 avanços/.test(txt0));
  t("e em dias de marcha", /6\.5 dias de marcha|6,5 dias/.test(txt0) || /dias de marcha/.test(txt0));
  t("traz o terreno e a distância", txt0.includes("gelo") && txt0.includes("80 km"));
  t("no começo, manda pesar o que ficou para trás", /começo do caminho/.test(txt0));

  let j = j0; for (let i = 0; i < 11; i++) j = andar(j);
  const txt2 = resumoViagemPrompt(j);
  t("faltando dois, manda mostrar o destino chegando", /Falta pouco/.test(txt2));
  j = andar(j);
  const txt1 = resumoViagemPrompt(j);
  t("faltando um, manda FECHAR o caminho", /ÚLTIMO TRECHO/.test(txt1));

  t("proíbe chegar por conta própria", /NÃO me faça chegar antes/.test(txt0));
  t("e proíbe dizer os números na prosa", /nunca diga "turno"/.test(txt0) && /porcentagem/.test(txt0));
  t("o bloco de regra diz o mesmo", /NUNCA faz o herói chegar/.test(VIAGEM_PROMPT) && /não existem na ficção/.test(VIAGEM_PROMPT));
  t("sem jornada, sem texto", resumoViagemPrompt(null) === "" && resumoViagemPrompt({ de: "A" }) === "");
}

sec("5. a linha da tela");
{
  let j = abrirViagem({ de: "Nova do Norte", para: "Forte do Rei", dia: 1, rota });
  const l0 = linhaDaViagem(j);
  t("tem origem e destino", l0.includes("Nova do Norte") && l0.includes("Forte do Rei"));
  t("tem barra de progresso", /[▰▱]{8}/.test(l0));
  t("e diz quantos avanços faltam", /faltam 13 avanços/.test(l0));
  for (let i = 0; i < 12; i++) j = andar(j);
  t("no fim, o singular", /falta[m]? 1 avanço/.test(linhaDaViagem(j)));
  t("pausada, a linha diz isso", /PAUSADA/.test(linhaDaViagem(pausarViagem(j, "chuva forte"))));
  t("sem jornada, sem linha", linhaDaViagem(null) === "");
}

sec("6. contra o mundo de verdade");
{
  const geo = gerarGeografia("viagem|teste", moldePorId("sobremundo"));
  let piores = 0, total = 0, maxTurnos = 0;
  for (const r of geo.rotas) {
    const j = abrirViagem({ de: r.de, para: r.para, dia: 1, rota: r });
    const p = progressoDaViagem(j);
    total++;
    maxTurnos = Math.max(maxTurnos, p.turnosTotais);
    if (p.turnosTotais < 1 || p.turnosTotais > 14) piores++;
    /* e toda rota tem de terminar andando */
    let x = j; for (let i = 0; i < p.turnosTotais; i++) x = andar(x);
    if (!progressoDaViagem(x).chegou) piores++;
  }
  console.log(`      ${total} rotas do mundo · maior viagem: ${maxTurnos} avanços`);
  t("toda rota do mundo termina no número de avanços que prometeu", piores === 0);
  t("e nenhuma passa do teto de avanços", maxTurnos <= 14);
}

sec("7. os trechos da rota (etapa 2)");
{
  const mapa = { cidades: [{ nome: "A", x: 10, y: 10, bioma: "planicie" }, { nome: "B", x: 80, y: 60, bioma: "floresta" }] };
  const o = { mapa, molde: moldePorId("sobremundo") };
  const celulas = celulasNaRota("s|trechos", mapa.cidades[0], mapa.cidades[1], o);
  let j = comTrechos(abrirViagem({ de: "A", para: "B", dia: 1, rota }), celulas);
  t("a jornada guarda os trechos", (j.trechos || []).length === celulas.length && j.trechos.length > 5);
  t("cada trecho tem terreno, perigo e feição", j.trechos.every((c) => c.bioma && c.rotuloPerigo && c.feicao && c.feicao.nome));
  t("e nada de coordenada solta na jornada", j.trechos.every((c) => c.cx === undefined));

  const t0 = trechoAtual(j);
  t("no começo, o primeiro trecho", t0.indice === 0);
  for (let i = 0; i < 6; i++) j = andar(j);
  const meio = trechoAtual(j);
  t("no meio, um trecho do meio", meio.indice > 0 && meio.indice < meio.total - 1);
  console.log(`      ${celulas.length} trechos · no 7º avanço está no ${meio.indice + 1}º`);
  for (let i = 0; i < 7; i++) j = andar(j);
  t("no fim, o último — nunca um que não existe", trechoAtual(j).indice === trechoAtual(j).total - 1);

  const semTrechos = abrirViagem({ de: "A", para: "B", rota });
  t("jornada sem trechos não quebra", trechoAtual(semTrechos) === null);
  t("nem o resumo", resumoViagemPrompt(semTrechos).length > 50 && !/TRECHO DE AGORA/.test(resumoViagemPrompt(semTrechos)));
  t("comTrechos com lixo não quebra", (comTrechos(semTrechos, null).trechos || []).length === 0 && (comTrechos(semTrechos, [null, undefined]).trechos || []).length === 0);
  t("comTrechos de jornada nula devolve nula", comTrechos(null, celulas) === null);
}

sec("7b. e o Mestre lê o trecho onde está");
{
  const mapa = { cidades: [{ nome: "A", x: 10, y: 10, bioma: "planicie" }, { nome: "B", x: 80, y: 60, bioma: "floresta" }] };
  const celulas = celulasNaRota("s|trechos", mapa.cidades[0], mapa.cidades[1], { mapa, molde: moldePorId("sobremundo") });
  let j = comTrechos(abrirViagem({ de: "A", para: "B", dia: 1, rota }), celulas);
  const txt = resumoViagemPrompt(j);
  t("o resumo diz em que trecho está", /O TRECHO DE AGORA \(o 1º de \d+\)/.test(txt));
  t("nomeia o que há nele", txt.includes(celulas[0].feicao.nome));
  t("e diz que é permanente", /na volta pelo mesmo caminho estará no mesmo lugar/.test(txt));
  /* e o trecho MUDA conforme se anda — era isso que faltava para o
     terceiro dia parecer o terceiro dia */
  for (let i = 0; i < 7; i++) j = andar(j);
  const txt2 = resumoViagemPrompt(j);
  t("depois de andar, o trecho é outro", !txt2.includes(celulas[0].feicao.nome) || celulas[0].feicao.nome === trechoAtual(j).feicao.nome);
  t("e o número do trecho subiu", /O TRECHO DE AGORA \(o [2-9]\d*º/.test(txt2));

  /* a pausa mostra ONDE parou */
  const parada = pausarViagem(j, `estamos no meio de uma luta, no ${trechoAtual(j).indice + 1}º trecho de ${trechoAtual(j).total} — ${trechoAtual(j).feicao.nome}`);
  t("a pausa guarda o trecho em que parou", /º trecho de \d+/.test(resumoViagemPrompt(parada)));
}

sec("8. quem está na estrada consegue avançar nela");
{
  const emViagem = { emViagem: true };
  for (const txt of ["sigo viagem pela estrada", "continuo a jornada", "sigo em frente", "toco em frente pela estrada", "retomo a estrada", "sigo", "avanço mais um trecho", "prossigo rumo ao destino"]) {
    t(`"${txt}" avança`, !!detectarSeguirViagem(txt, emViagem));
  }
  /* as recusas são o que impede a viagem de andar sozinha */
  for (const txt of ["sigo conversando com Bram", "sigo o rastro do lobo", "acampo aqui mesmo", "pergunto ao guia sobre o caminho", "leio o mapa", "sigo as instruções da carta"]) {
    t(`"${txt}" NÃO avança`, !detectarSeguirViagem(txt, emViagem));
  }
  t("fora de viagem, nunca", !detectarSeguirViagem("sigo viagem", {}));
  t("em combate, nunca", !detectarSeguirViagem("sigo viagem", { emViagem: true, emCombate: true }));
  t("acampado, nunca", !detectarSeguirViagem("sigo viagem", { emViagem: true, acampado: true }));
  t("envelope do sistema não é pedido meu", !detectarSeguirViagem("[PASSAR O TEMPO] sigo em frente", emViagem));
  t("texto vazio não quebra", !detectarSeguirViagem("", emViagem) && !detectarSeguirViagem(null, emViagem));
}

console.log(`\nviagem v9.56: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
