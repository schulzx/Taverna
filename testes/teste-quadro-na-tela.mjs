/* teste-quadro-na-tela.mjs (QQ · Q4, 14/11/2026) — a conta da peça do
   quadro da quest (src/quadro-na-tela.js) e a peça em si
   (src/painel-quadro.jsx), formas.md §QQ.

   O que se prova:
   1. o momento (cronogramaDaPista): a ordem dos passos de §QQ 4, os tempos
      lidos da tabela, a leitura por palavras com piso e teto, o teto
      absoluto de 4,5 s em qualquer carta, a antecipação só no mistério, a
      perda sem viragem (o pavio e, no último, o risco), o reduce (aparece,
      fica o tempo de ler, sai), e o salto que vai sempre ao voo;
   2. o estado que se vê de cada carta, os pavios, e a arrumação da gaveta
      sobre o CATÁLOGO INTEIRO (oQuadroDaQuest de verdade): a etapa de agora
      é a de verdade, e o fio segue as viradas;
   3. o carimbo (a palavra, o peso, a conta dos efeitos já multiplicados), o
      veredito antes do clique (a linha do caminho, as fichas do «se
      falhar» nas duas formas do motor) e o sinal (o número é do motor);
   4. o que o leitor de ecrã diz — e nenhuma palavra de mecanismo;
   5. a peça renderizada (React no servidor): os sete estados, o sinal que
      não existe sem número, a gaveta fechada que não ocupa nada, e o
      `juiz` que nunca chega ao ecrã. */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { buildSync } from "esbuild";
import { QUADRO_DA_TELA, CARIMBO_DO_PRECO, PALAVRAS_DO_QUADRO, MOVIMENTO_DO_DADO, REVELACAO_DO_ESPOLIO } from "../src/estilo.js";
import {
  estadoDaCarta, abreAlgo, paviosDaCarta, numeralDaEtapa, arrumarOQuadro, contaDoCarimbo, carimboDaCarta, linhaDoCaminho,
  fichasDoSeFalhar, sinalDoQuadro, estadoDoSinal, textoDoSinal, nomeDoSinal, palavrasDe, leituraDaPista, duracaoDaPista,
  cronogramaDaPista, passoAos, saltoDaPista, nomeDaCarta, falaDaPista,
} from "../src/quadro-na-tela.js";
import { oQuadroDaQuest, virarCarta, PRECO_DA_FALHA, CAMINHOS_DA_EXTRA, QUADRO_POR_ARCO } from "../src/quadro-da-quest.js";
import { BIBLIOTECA_DE_QUESTS, abrirQuest, PAPEIS_DA_QUEST } from "../src/biblioteca-de-quests.js";
import { garantirFactos } from "../src/livro-de-factos.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? "\n      " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const J = (x) => JSON.stringify(x);
const M = QUADRO_DA_TELA.momento;
const MECANISMO = /essencia|\bextra\b|queimad|\bcaminho|\bcarta\b|\bquadro\b|pre[cç]o|\betapa|\bjuiz\b|viravel|\bsobra\b|\bfutura\b/i;

/* ============================================================ */
sec("1. o momento — a carta que vira (§QQ 4)");
{
  const face = "o que Mécia dos Juncos sabe", de = "dito por Mécia";
  const simples = cronogramaDaPista({ face, de });
  t("fora do mistério, sem preço: sobe → vira (as duas metades) → leitura → voa", J(simples.map((p) => p.passo)) === J(["sobe", "viraA", "viraB", "leitura", "voa"]), J(simples));
  t("a carta sai de trás do dado aos 120 e sobe em 240, com a curva do dado", simples[0].de === 120 && simples[0].dura === 240 && M.sobe.curva === MOVIMENTO_DO_DADO.curva);
  t("a viragem é a do espólio (uma ação, uma forma): 160 + 160", M.vira === REVELACAO_DO_ESPOLIO.vira && simples[1].dura === 160 && simples[2].dura === 160);
  t("os passos encadeiam-se sem buraco nem sobreposição", simples.every((p, i) => i === 0 || p.de === simples[i - 1].de + simples[i - 1].dura));
  t("o voo dura 360 e é o último", simples[simples.length - 1].passo === "voa" && simples[simples.length - 1].dura === 360);

  t("a leitura: 250 ms por palavra da face, do `de` e da palavra do carimbo", leituraDaPista({ face: "a b c d e f g", de: "h i", carimbo: "VISTO" }) === 2500);
  t("com piso de 1 200", leituraDaPista({ face: "x" }) === 1200 && leituraDaPista({}) === 1200);
  t("e teto de 3 000", leituraDaPista({ face: "palavra ".repeat(40) }) === 3000);
  t("palavrasDe conta palavras e ignora espaços", palavrasDe("  o  que   Lopo sabe ") === 4 && palavrasDe(null) === 0);

  const mist = cronogramaDaPista({ face, de, carimbo: "VISTO", misterio: true });
  t("no mistério: a antecipação (treme 280) entre a subida e a viragem", J(mist.map((p) => p.passo)) === J(["sobe", "treme", "viraA", "viraB", "carimbo", "leitura", "voa"]) && mist[1].dura === 280);
  t("o carimbo do mistério cai em 260 (fora dele, 200)", mist[4].dura === 260 && cronogramaDaPista({ face, de, carimbo: "TARDE" }).find((p) => p.passo === "carimbo").dura === 200);
  t("sem preço, nenhum carimbo", !simples.some((p) => p.passo === "carimbo"));

  /* o teto absoluto, em qualquer carta: a soma ingénua no pior caso passaria */
  const longa = "palavra ".repeat(30);
  const pior = cronogramaDaPista({ face: longa, de: longa, carimbo: "A METADE", misterio: true });
  t("o pior caso (mistério, carimbo, leitura no teto) não passa dos 4,5 s", duracaoDaPista(pior) <= M.teto && M.teto === 4500, `dura ${duracaoDaPista(pior)}`);
  t("e é a leitura que cede (os movimentos ficam inteiros)", pior.find((p) => p.passo === "treme").dura === 280 && pior.find((p) => p.passo === "voa").dura === 360 && pior.find((p) => p.passo === "leitura").dura < M.leitura.teto);
  let maior = 0;
  for (const misterio of [false, true]) for (const carimbo of ["", "VISTO", "A METADE"]) for (let n = 0; n <= 20; n++) {
    const ps = cronogramaDaPista({ face: "p ".repeat(n), de: "q ".repeat(n), carimbo, misterio });
    maior = Math.max(maior, duracaoDaPista(ps));
    if (ps.some((p) => p.de < 0 || p.dura < 0)) maior = Infinity;
  }
  t("nenhuma combinação passa do teto, e nenhum tempo é negativo", maior <= M.teto, `maior ${maior}`);
  t("a face típica (6–9 palavras) dá 1,5–2,3 s de leitura", leituraDaPista({ face: "o que Mécia dos Juncos sabe" }) === 1500 && leituraDaPista({ face, de }) === 2250);

  /* a perda: não vira */
  const perda = cronogramaDaPista({ perdeu: true, misterio: false });
  t("a que se pode ganhar e falha: sobe de costas, um pavio apaga-se (400) e voa — sem viragem nem leitura",
    J(perda.map((p) => p.passo)) === J(["sobe", "pavio", "voa"]) && perda[1].dura === 400);
  const ultima = cronogramaDaPista({ perdeu: true, ultimo: true, misterio: true });
  t("se era o último pavio, o risco desenha-se (260) depois do pavio", J(ultima.map((p) => p.passo)) === J(["sobe", "treme", "pavio", "risca", "voa"]) && ultima[3].dura === 260);
  t("a perda ignora face e carimbo (não há nada para ler)", J(cronogramaDaPista({ perdeu: true, face, carimbo: "VISTO" })) === J(perda));

  /* o reduce */
  const red = cronogramaDaPista({ face, de, carimbo: "TARDE", misterio: true, reduzido: true });
  t("com reduce: aparece em 120, fica o mesmo tempo de leitura, sai em 120",
    J(red.map((p) => p.passo)) === J(["aparece", "leitura", "sai"]) && red[0].dura === MOVIMENTO_DO_DADO.semMovimento && red[2].dura === MOVIMENTO_DO_DADO.semMovimento
    && red[1].dura === leituraDaPista({ face, de, carimbo: "TARDE" }));
  t("o reduce não tem nenhum passo de movimento", !red.some((p) => ["sobe", "treme", "viraA", "viraB", "carimbo", "voa", "pavio", "risca"].includes(p.passo)));
  const redPerda = cronogramaDaPista({ perdeu: true, ultimo: true, reduzido: true });
  t("a perda com reduce fica o tempo que o pavio e o risco levariam", J(redPerda.map((p) => p.passo)) === J(["aparece", "fica", "sai"]) && redPerda[1].dura === M.pavio.apaga + M.pavio.risca);

  /* o salto */
  t("o salto vai ao voo", saltoDaPista(mist) === mist.find((p) => p.passo === "voa").de);
  t("e com reduce, à saída", saltoDaPista(red) === red[2].de);
  t("passoAos: nada antes dos 120, o passo certo a meio, e o fim", passoAos(simples, 0) === null && passoAos(simples, 130) === "sobe" && passoAos(simples, 400) === "viraA" && passoAos(simples, 99999) === "fim");
  t("o cronograma é puro: a mesma entrada dá o mesmo", J(cronogramaDaPista({ face, de, misterio: true })) === J(cronogramaDaPista({ face, de, misterio: true })));
  t("entrada inválida não lança", Array.isArray(cronogramaDaPista(null)) && duracaoDaPista(null) === 0 && passoAos(null, 1) === null);
}

/* ============================================================ */
sec("2. a carta, os pavios e a arrumação — sobre o catálogo inteiro");
{
  t("os sete estados pela forma", estadoDaCarta({ futura: true, estado: "costas" }) === "futura" && estadoDaCarta({ sobra: true, estado: "costas" }) === "sobra"
    && estadoDaCarta({ estado: "perdida" }) === "perdida" && estadoDaCarta({ estado: "preco" }) === "preco" && estadoDaCarta({ estado: "virada" }) === "virada"
    && estadoDaCarta({ estado: "costas", viravel: true }) === "aVirar" && estadoDaCarta({ estado: "costas" }) === "costas" && estadoDaCarta(null) === null);
  t("a futura, a perdida e a que não fez falta não abrem nada", !abreAlgo("futura") && !abreAlgo("perdida") && !abreAlgo("sobra") && abreAlgo("aVirar") && abreAlgo("costas") && abreAlgo("preco"));
  t("os pavios: um por caminho da tabela, aceso o que está aberto", J(paviosDaCarta({ tipo: "extra", estado: "costas", caminhos: [1, 2, 3] })) === J({ total: CAMINHOS_DA_EXTRA.length, acesos: 3 }));
  t("a que o caso pede não tem pavios", paviosDaCarta({ tipo: "essencial", caminhos: [1] }) === null);
  t("os numerais das etapas", numeralDaEtapa(1) === "I" && numeralDaEtapa(4) === "IV" && numeralDaEtapa(9) === "IX" && numeralDaEtapa(12) === "XII");

  const C = "Alto do Sal";
  const e0 = { npcs: {}, cidadeAtual: C, lugar: { nome: "Praça", cidade: C }, personagem: { nome: "Vera", grupo: [], inventario: [] }, dia: 1, npcTurno: 0, factos: garantirFactos(null), baseMundo: null };
  const amostras = [];
  for (const F of BIBLIOTECA_DE_QUESTS) {
    const papeis = {};
    for (const [k, d] of Object.entries(F.papeis)) {
      const tipo = (PAPEIS_DA_QUEST[d.de] || {}).tipo;
      papeis[k] = tipo === "lugar" ? { nome: `Casa ${k}`, cidade: C } : tipo === "item" ? { nome: `a coisa ${k}` } : { nome: `Pessoa ${k}` };
    }
    const R = abrirQuest(F, { estado: e0, papeis });
    if (!R) continue;
    F.etapas.forEach((etapa, idx) => {
      const antes = F.etapas.slice(0, idx);
      const reg = { ...R, feitas: Object.fromEntries(antes.map((e) => [e.id, { dia: 1 }])), acesas: Object.fromEntries([...antes, etapa].map((e) => [e.id, 1])) };
      for (const arco of ["misterio", "jornada"]) {
        const q = oQuadroDaQuest(reg, e0, { arco, semente: "QQ4|a" });
        if (q && q.cartas.length) amostras.push({ F, etapa, arco, q });
      }
    });
  }
  t(`o catálogo dá quadros para arrumar (${amostras.length})`, amostras.length > 50);
  const erradas = amostras.filter(({ etapa, q }) => {
    const a = arrumarOQuadro(q);
    const agora = a.etapas.find((e) => e.estado === "agora");
    const temDaEtapa = q.cartas.some((c) => c.etapa === etapa.id && !c.futura);
    return temDaEtapa && (!agora || agora.id !== etapa.id);
  });
  t("a etapa de agora da gaveta é a etapa acesa de verdade, em todo o catálogo", erradas.length === 0, erradas.slice(0, 3).map((x) => `${x.F.id}/${x.etapa.id}/${x.arco}`).join(", "));
  const ordem = amostras.every(({ q }) => {
    const a = arrumarOQuadro(q);
    const i = (e) => ["feita", "agora", "futura"].indexOf(e.estado);
    return a.etapas.every((e, k) => k === 0 || i(a.etapas[k - 1]) <= i(e));
  });
  t("as etapas vêm feitas → agora → por vir", ordem);
  t("as futuras só no mistério", amostras.filter((x) => x.arco !== "misterio").every(({ q }) => arrumarOQuadro(q).porVir === 0)
    && amostras.some((x) => x.arco === "misterio" && arrumarOQuadro(x.q).porVir > 0));
  t("a fila de fora do mistério são as cartas da etapa de agora", amostras.filter((x) => x.arco !== "misterio").every(({ q }) => {
    const a = arrumarOQuadro(q);
    return a.fila.every((c) => a.etapas.find((e) => e.estado === "agora").cartas.includes(c));
  }));
  t("as extra vão à parte, e só no tipo 1", amostras.every(({ F, q }) => arrumarOQuadro(q).extras.length === 0 || F.tipo === 1));

  /* o fio: pela ordem do dia, se o motor a der; senão, a do quadro */
  const q2 = { arco: "misterio", cartas: [
    { id: "a", etapa: "e1", estado: "virada", dia: 5 }, { id: "b", etapa: "e1", estado: "preco", dia: 2 },
    { id: "c", etapa: "e2", estado: "costas", viravel: true }, { id: "d", etapa: "e3", estado: "costas", futura: true },
  ] };
  const a2 = arrumarOQuadro(q2);
  t("o fio liga as viradas pela ordem em que viraram (o `dia`)", J(a2.fio) === J(["b", "a"]));
  t("sem `dia`, pela ordem do quadro", J(arrumarOQuadro({ cartas: q2.cartas.map(({ dia, ...c }) => c) }).fio) === J(["a", "b"]));
  t("no exemplo: I feita, II agora, III por vir", J(a2.etapas.map((e) => [e.numeral, e.estado])) === J([["I", "feita"], ["II", "agora"], ["III", "futura"]]) && a2.porVir === 1 && a2.misterio);
  t("quadro vazio ou nulo não lança", J(arrumarOQuadro(null).etapas) === "[]");

  /* A FORMA DE TELA (plano-quadro §12, aCartaNaTela): a lista branca da Q2b
     não traz `etapa` nem `arco` — traz `misterio`. Aqui o mapa é local, com
     os campos da §12, para a suíte não depender de um commit que ainda não
     subiu; quando o App ligar a forma de tela, a prova continua a mesma. */
  const naTela = (q) => ({ quest: q.quest, titulo: q.titulo, pergunta: q.pergunta, misterio: q.arco === "misterio",
    cartas: q.cartas.map((c) => ({ id: c.id, tipo: c.tipo, forma: c.forma, costas: c.costas, estado: c.estado, viravel: c.viravel, futura: c.futura, sobra: c.sobra,
      face: c.face, de: c.de, preco: c.preco, linha: c.linha, efeitos: null, caminhos: c.caminhos.map((k) => ({ id: k.id, diz: k.diz, seFalhar: [] })) })) });
  const mist = amostras.filter((x) => x.arco === "misterio").map((x) => arrumarOQuadro(naTela(x.q)));
  t("com a forma de tela, o mistério vem do booleano", mist.every((a) => a.misterio) && amostras.filter((x) => x.arco !== "misterio").every((x) => !arrumarOQuadro(naTela(x.q)).misterio));
  t("sem `etapa`, as cartas arrumam-se pelas marcas: feita (não fez falta) → agora → por vir", mist.every((a) => a.etapas.every((e) =>
    e.estado === "futura" ? e.cartas.every((c) => c.futura) : e.estado === "feita" ? e.cartas.every((c) => c.sobra) : e.cartas.every((c) => !c.futura && !c.sobra))));
  t("e há sempre uma de agora quando há carta de agora", mist.every((a) => a.etapas.some((e) => e.estado === "agora") || a.etapas.every((e) => e.estado !== "agora" && e.cartas.every((c) => c.futura || c.sobra))));
  t("a carta que se pode virar cai sempre em agora", mist.every((a) => a.etapas.every((e) => e.estado === "agora" || e.cartas.every((c) => !c.viravel))));
}

/* ============================================================ */
sec("3. o carimbo, o veredito antes do clique e o sinal");
{
  t("as chaves do carimbo são as do preço, nos dois sentidos", J(Object.keys(CARIMBO_DO_PRECO).sort()) === J(Object.keys(PRECO_DA_FALHA).sort()));
  t("a conta: as horas inteiras em horas", contaDoCarimbo([{ tipo: "minutos", n: 120 }]).texto === "−2 h" && contaDoCarimbo([{ tipo: "minutos", n: 240 }]).texto === "−4 h");
  t("os minutos que não são hora em minutos", contaDoCarimbo([{ tipo: "incompleta" }, { tipo: "minutos", n: 30 }]).texto === "−30 min" && contaDoCarimbo([{ tipo: "minutos", n: 60 }]).texto === "−1 h");
  t("as moedas com o glifo da moeda", J(contaDoCarimbo([{ tipo: "moedas", n: -30 }])) === J({ texto: "−30", moeda: true }));
  t("VISTO e PARTIDO não têm conta", contaDoCarimbo(PRECO_DA_FALHA.alerta.efeitos) === null && contaDoCarimbo(PRECO_DA_FALHA.danificado.efeitos) === null);
  const leve = carimboDaCarta({ preco: "tempo", efeitos: [{ tipo: "minutos", n: 240 }] });
  t("o carimbo leve (tempo): TARDE, relógio, −4 h", leve.palavra === "TARDE" && leve.glifo === "relogio" && !leve.pesado && leve.conta.texto === "−4 h");
  t("o pesado (alerta) e as marcas do rasgo e da racha", carimboDaCarta({ preco: "alerta" }).pesado && carimboDaCarta({ preco: "incompleta" }).marca === "rasgo" && carimboDaCarta({ preco: "danificado" }).marca === "racha");
  t("o peso é o do motor (PRECO_DA_FALHA.leve), não uma lista da tela", Object.keys(PRECO_DA_FALHA).every((id) => carimboDaCarta({ preco: id }).pesado === !PRECO_DA_FALHA[id].leve));
  t("o preço do momento (virarCarta) também serve", carimboDaCarta({}, { id: "cobra", efeitos: [{ tipo: "moedas", n: -30 }] }).conta.texto === "−30");
  t("sem preço, sem carimbo", carimboDaCarta({ estado: "virada" }) === null && carimboDaCarta({ preco: "inventado" }) === null);

  const l = linhaDoCaminho({ id: "revistar", diz: "revistar o celeiro dos Juncos", desafios: ["buscar"], pericias: ["percepcao", "investigacao", "percepcao"], minutos: 10, custa: { moedas: 10 } });
  t("o caminho: o verbo com maiúscula, as perícias pelo nome e os minutos", l.verbo === "Revistar o celeiro dos Juncos" && l.linha === "Percepção · Investigação · 10 min", J(l));
  t("o nome acessível do caminho (§QQ 4)", l.nome === "Escrever: revistar o celeiro dos Juncos. Percepção ou Investigação, 10 minutos. Custa 10 moedas.", l.nome);
  t("sem os campos novos do motor, a linha cala-se (nunca os calcula)", linhaDoCaminho({ id: "x", diz: "falar com ela", desafios: ["convencer"] }).linha === "");
  const f1 = fichasDoSeFalhar([{ seFalhar: ["tempo", "incompleta", "alerta"] }, { seFalhar: ["tempo"] }]);
  t("as fichas do «se falhar»: um preço por ficha, sem repetir", J(f1.map((f) => f.id)) === J(["tempo", "incompleta", "alerta"]) && f1[2].glifo === "olho" && f1[0].texto === "as horas vão-se nisso");
  const f2 = fichasDoSeFalhar([{ seFalhar: [{ id: "cobra", efeitos: [{ tipo: "moedas", n: -30 }] }] }]);
  t("com os efeitos do motor (§QQ 8, 4), a moeda do mistério escreve-se", f2[0].texto === "custa-te 30 moedas");
  t("sem eles, a frase cala o número (não o inventa)", fichasDoSeFalhar([{ seFalhar: ["cobra"] }])[0].texto === "custa-te moedas");

  t("sem `quadro.sinal`, sem sinal", sinalDoQuadro({ cartas: [] }) === null && sinalDoQuadro({ sinal: { sabe: 1, de: 0 } }) === null);
  const s = sinalDoQuadro({ sinal: { sabe: 2, de: 4 } });
  t("«2 de 4» na mesa, «2/4» no telefone", textoDoSinal(s) === "2 de 4" && textoDoSinal(s, true) === "2/4");
  t("os estados: repouso, novo, aceso (ganha à gota), completo", estadoDoSinal(s) === "repouso" && estadoDoSinal(s, { novo: true }) === "novo"
    && estadoDoSinal(s, { novo: true, aceso: true }) === "aceso" && estadoDoSinal({ sabe: 4, de: 4 }) === "completo" && estadoDoSinal(null) === null);
  t("o nome do sinal por extenso (§QQ 3)", nomeDoSinal(s, { novo: true }) === "Pistas: 2 de 4. Há uma nova. Abrir." && nomeDoSinal(s, { aberto: true }) === "Pistas: 2 de 4. Fechar.");
}

/* ============================================================ */
sec("4. o que o leitor de ecrã diz");
{
  t("costas: «Uma pessoa, por saber. Ver como se pode saber.»", nomeDaCarta({ estado: "costas", costas: "uma pessoa" }) === "Uma pessoa, por saber. Ver como se pode saber.");
  t("virada: «O que Mécia sabe, dito por Mécia.»", nomeDaCarta({ estado: "virada", face: "o que Mécia sabe", de: "dito por Mécia" }) === "O que Mécia sabe, dito por Mécia.");
  t("futura, perdida, não fez falta", nomeDaCarta({ futura: true, costas: "um lugar" }) === "Por vir: um lugar." && nomeDaCarta({ estado: "perdida", costas: "um lugar" }) === "Perdeu-se: um lugar."
    && nomeDaCarta({ sobra: true, costas: "um objeto" }) === "Não fez falta: um objeto.");
  t("com preço, a linha do preço vem atrás", nomeDaCarta({ estado: "preco", face: "x", de: "y", linha: PRECO_DA_FALHA.alerta.linha }).endsWith(PRECO_DA_FALHA.alerta.linha));
  t("a região viva diz a carta que vira", falaDaPista({ carta: { face: "o que Lopo, o sacristão, sabe", de: "arrancado a Lopo", linha: PRECO_DA_FALHA.alerta.linha } })
    === `Sabes agora o que Lopo, o sacristão, sabe — arrancado a Lopo. ${PRECO_DA_FALHA.alerta.linha}`);
  t("e a perda: o caminho que se fecha e os que restam", falaDaPista({ perdeu: "seguir", carta: { estado: "costas", caminhos: [1, 2] } }) === "Esse caminho fechou-se. Restam 2.");
  t("e o rasto perdido", falaDaPista({ perdeu: "seguir", carta: { estado: "perdida", caminhos: [], costas: "uma pessoa", sobre: "quem lhe faz o serviço" } }) === "Perdeu-se o rasto: quem lhe faz o serviço.");

  /* nenhuma palavra de mecanismo em nada do que a tela escreve */
  const escritos = [];
  const juntar = (o) => { for (const v of Object.values(o)) typeof v === "string" ? escritos.push(v) : v && typeof v === "object" ? juntar(v) : null; };
  juntar(PALAVRAS_DO_QUADRO);
  for (const k of Object.values(CARIMBO_DO_PRECO)) escritos.push(k.palavra, k.seFalhar);
  /* a exceção escrita: «Esse caminho fecha-se e não volta.» e «Esse caminho
     fechou-se.» são as frases que a §QQ 3 e a §QQ 4 decidiram, com a palavra
     em mundo (o caminho que se fecha, não «o caminho» do motor). A §QQ 1.7
     proíbe «caminho» — a contradição está dita ao desenho; até ele decidir,
     valem as duas frases da tabela e nenhuma outra. */
  const DECIDIDAS = [PALAVRAS_DO_QUADRO.fecha, PALAVRAS_DO_QUADRO.leitor.fechou];
  const maus = escritos.filter((s) => !DECIDIDAS.includes(s) && MECANISMO.test(s));
  t(`nenhuma das ${escritos.length} palavras da peça nomeia o mecanismo`, maus.length === 0, maus.join(" | "));
}

/* ============================================================ */
sec("5. a peça renderizada");
const AQUI = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(AQUI, "..", "src");
const ENTRADA = `
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CartaDePista, SinalDoQuadro, GavetaDoQuadro, CaminhosDaCarta, CartaLida, CarimboDoPreco, LequeDoQuadro, PistaQueVira } from "./painel-quadro.jsx";
export const html = (el) => renderToStaticMarkup(el);
export { React, CartaDePista, SinalDoQuadro, GavetaDoQuadro, CaminhosDaCarta, CartaLida, CarimboDoPreco, LequeDoQuadro, PistaQueVira };
`;
const saida = path.join(AQUI, `.tmp-painel-quadro-${process.pid}.mjs`);
buildSync({
  stdin: { contents: ENTRADA, resolveDir: SRC, loader: "jsx", sourcefile: "entrada-quadro.jsx" },
  bundle: true, format: "esm", platform: "node", outfile: saida, jsx: "transform", logLevel: "silent", external: ["react", "react-dom", "react-dom/server"],
  loader: { ".js": "jsx" }, define: { "process.env.NODE_ENV": '"production"' },
});
const R = await import(pathToFileURL(saida).href);
fs.rmSync(saida, { force: true });
const h = R.React.createElement;
const des = (s) => s.replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
const texto = (s) => des(s.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
const rotulos = (s) => [...s.matchAll(/aria-label="([^"]*)"/g)].map((m) => des(m[1]));
{
  const JUIZ = { nomes: ["Lopo Segredo"], cidade: "Cidade-Juiz", nasce: null, id: "npc-segredo" };
  const base = { id: "e1:consultou:x", tipo: "essencial", forma: "pessoa", costas: "uma pessoa", caminhos: [{ id: "falar", diz: "falar com ela", desafios: ["convencer"], seFalhar: ["tempo", "cobra"] }], juiz: JUIZ };
  const cartas = {
    costas: { ...base, estado: "costas" },
    aVirar: { ...base, estado: "costas", viravel: true },
    virada: { ...base, estado: "virada", face: "o que Mécia sabe", de: "dito por Mécia" },
    preco: { ...base, estado: "preco", face: "o que Mécia sabe", de: "dito por Mécia", preco: "tempo", linha: PRECO_DA_FALHA.tempo.linha },
    perdida: { ...base, tipo: "extra", estado: "perdida", caminhos: [] },
    futura: { ...base, estado: "costas", futura: true, caminhos: [] },
    sobra: { ...base, estado: "costas", sobra: true },
  };
  const htmls = Object.fromEntries(Object.entries(cartas).map(([k, c]) => [k, R.html(h(R.CartaDePista, { carta: c }))]));
  t("as sete cartas desenham-se", Object.values(htmls).every((x) => x.length > 50));
  t("a futura não é botão nem recebe foco", !/<button/.test(htmls.futura) && /aria-hidden="true"/.test(htmls.futura));
  t("a perdida e a que não fez falta só se leem (aria-disabled)", /aria-disabled="true"/.test(htmls.perdida) && /aria-disabled="true"/.test(htmls.sobra) && !/aria-disabled/.test(htmls.aVirar));
  t("a perdida leva o risco; a extra, os pavios", /<line/.test(htmls.perdida) && (htmls.perdida.match(/<circle/g) || []).length === CAMINHOS_DA_EXTRA.length);
  t("a com preço leva o carimbo: TARDE", texto(htmls.preco).includes("TARDE") && !texto(htmls.virada).includes("TARDE"));
  t("a que não fez falta diz-o", texto(htmls.sobra).includes(PALAVRAS_DO_QUADRO.naoFezFalta));
  const tudo = Object.values(htmls).join("\n");
  t("o `juiz` nunca chega ao ecrã (nem no texto, nem nos rótulos, nem nos atributos)", !/Lopo Segredo|Cidade-Juiz|npc-segredo/.test(tudo));
  const visto = Object.values(htmls).map((x) => texto(x) + " " + rotulos(x).join(" ")).join(" ");
  t("nenhuma palavra de mecanismo no que a carta mostra ou diz", !MECANISMO.test(visto), (visto.match(MECANISMO) || [])[0]);

  t("sem `quadro.sinal`, o sinal não existe (0 px)", R.html(h(R.SinalDoQuadro, { sinal: null })) === "");
  const sm = R.html(h(R.SinalDoQuadro, { sinal: { sabe: 2, de: 4 }, novo: true }));
  const st = R.html(h(R.SinalDoQuadro, { sinal: { sabe: 2, de: 4 }, telefone: true }));
  t("o sinal da mesa: PISTAS, «2 de 4», a gota, aria-expanded", texto(sm).includes("Pistas") && texto(sm).includes("2 de 4") && /aria-expanded="false"/.test(sm) && rotulos(sm)[0] === "Pistas: 2 de 4. Há uma nova. Abrir.");
  t("o do telefone: «2/4», sem rótulo", texto(st) === "2/4");

  t("a gaveta fechada não desenha nada", R.html(h(R.GavetaDoQuadro, { quadros: [{ quest: "q", titulo: "T", pergunta: "P?", cartas: [cartas.costas] }], aberta: false })) === "");
  const quadro = { quest: "q", titulo: "A capela sem velas", pergunta: "Quem levou as velas?", arco: "misterio", sinal: { sabe: 1, de: 3 },
    cartas: [{ ...cartas.virada, id: "a", etapa: "e1" }, { ...cartas.aVirar, id: "b", etapa: "e2" }, { ...cartas.futura, id: "c", etapa: "e3" }, { ...cartas.perdida, id: "x" }] };
  const g = R.html(h(R.GavetaDoQuadro, { quadros: [quadro], aberta: true }));
  t("a gaveta aberta: região com a pergunta no nome", /role="region"/.test(g) && rotulos(g).includes("Pistas: Quem levou as velas?"));
  t("no mistério: os numerais, «feita» / «agora», a conta do motor", texto(g).includes("II") && texto(g).includes("agora") && texto(g).includes("feita") && texto(g).includes("1 de 3"));
  t("a lista diz as que estão por vir", rotulos(g).includes("e mais 1 por vir"));
  t("só uma carta tem tabindex 0 (roving), e é a que se pode virar", (g.match(/tabindex="0"/gi) || []).length === 1 && /data-carta="b"[^>]*tabindex="0"|tabindex="0"[^>]*data-carta="b"/i.test(g.replace(/data-viravel="1" /g, "")) );
  const gv = texto(g) + " " + rotulos(g).join(" ");
  t("nenhuma palavra de mecanismo na gaveta", !MECANISMO.test(gv.replace("Quem levou as velas?", "")), (gv.match(MECANISMO) || [])[0]);
  t("e o juiz não passa", !/Lopo Segredo|Cidade-Juiz|npc-segredo/.test(g));
  const semEtapa = { ...quadro, arco: undefined, misterio: true, cartas: quadro.cartas.map(({ etapa, juiz, ...c }) => c) };
  const g2 = R.html(h(R.GavetaDoQuadro, { quadros: [semEtapa], aberta: true }));
  t("a gaveta abre com a forma de tela (sem `etapa`, `misterio` booleano): mistério, agora e por vir", /data-gaveta-do-quadro="misterio"/.test(g2) && texto(g2).includes("agora") && rotulos(g2).includes("e mais 1 por vir"));
  const fora = R.html(h(R.GavetaDoQuadro, { quadros: [{ ...semEtapa, misterio: false }], aberta: true }));
  t("fora do mistério, uma fila só (sem numerais)", /data-gaveta-do-quadro="fila"/.test(fora) && !texto(fora).includes(PALAVRAS_DO_QUADRO.agora));

  const c = R.html(h(R.CaminhosDaCarta, { carta: { ...cartas.aVirar, caminhos: [{ id: "pagar", diz: "pagar a quem sabe", desafios: ["convencer"], custa: { moedas: 10 }, pericias: ["persuasao"], minutos: 10, seFalhar: ["tempo", "cobra"] }] } }));
  t("os caminhos: «Como se pode saber», o verbo, a pena, a moeda", texto(c).includes(PALAVRAS_DO_QUADRO.saber) && texto(c).includes("Pagar a quem sabe") && texto(c).includes("10"));
  t("«Se falhar»: «Ficas a saber na mesma» e as fichas", texto(c).includes(PALAVRAS_DO_QUADRO.naMesma) && texto(c).includes("as horas vão-se nisso") && texto(c).includes("custa-te moedas"));
  const ce = R.html(h(R.CaminhosDaCarta, { carta: { ...cartas.aVirar, tipo: "extra", caminhos: [{ id: "a", diz: "perguntar por aí", desafios: ["convencer"] }, { id: "b", diz: "seguir", desafios: ["rastrear"] }] } }));
  t("na que se pode ganhar: o caminho que se fecha e «restam 2»", texto(ce).includes(PALAVRAS_DO_QUADRO.fecha) && texto(ce).includes("restam 2"));

  const p = R.html(h(R.PistaQueVira, { vira: { carta: cartas.virada, preco: null, perdeu: null } }));
  t("o momento desenha a carta com a região viva, e não lança em Node", /aria-live="polite"/.test(p) && /data-carta=/.test(p));
  t("e nada desenha sem `vira`", R.html(h(R.PistaQueVira, { vira: null })) === "");
}

/* o que a carta do motor traz é o que a peça lê: uma volta inteira com virarCarta */
{
  const C = "Alto do Sal";
  const e0 = { npcs: {}, cidadeAtual: C, lugar: { nome: "Praça", cidade: C }, personagem: { nome: "Vera", grupo: [], inventario: [] }, dia: 1, npcTurno: 0, factos: garantirFactos(null), baseMundo: null };
  let achou = null;
  for (const F of BIBLIOTECA_DE_QUESTS) {
    const papeis = {};
    for (const [k, d] of Object.entries(F.papeis)) {
      const tipo = (PAPEIS_DA_QUEST[d.de] || {}).tipo;
      papeis[k] = tipo === "lugar" ? { nome: `Casa ${k}`, cidade: C } : tipo === "item" ? { nome: `a coisa ${k}` } : { nome: `Pessoa ${k}` };
    }
    const R0 = abrirQuest(F, { estado: e0, papeis });
    const q = R0 && oQuadroDaQuest(R0, e0, { arco: "misterio", semente: "QQ4|v" });
    const c = q && q.cartas.find((x) => x.tipo === "essencial" && x.viravel);
    if (c) { achou = { q, c }; break; }
  }
  const cam = achou.c.caminhos[0];
  const v = virarCarta(achou.q, { desafio: cam.desafios[0], resultado: "falha", total: 2, dc: 15 }, { carta: achou.c.id, caminho: cam.id, memoria: null, dia: 3 });
  const k = carimboDaCarta(v.carta, v.preco);
  t("a carta que o motor vira com preço dá um carimbo com a palavra da tela", !!k && CARIMBO_DO_PRECO[v.preco.id].palavra === k.palavra);
  t("e a conta é a dos efeitos já multiplicados pelo mistério", (() => {
    const ef = v.preco.efeitos.find((e) => e.n != null && (e.tipo === "minutos" || e.tipo === "moedas"));
    return !ef ? k.conta === null : k.conta && k.conta.texto.includes(String(Math.abs(ef.n === 0 ? 0 : (ef.tipo === "minutos" && ef.n % 60 === 0 ? ef.n / 60 : ef.n))));
  })(), J(v.preco));
  t("o mistério dobra (o peso é do motor)", QUADRO_POR_ARCO.misterio.peso === 2);
  const fala = falaDaPista(v);
  t("a região viva diz a face e de onde veio, e a linha do preço", fala.startsWith("Sabes agora ") && fala.includes(v.carta.de) && fala.endsWith(v.preco.linha), fala);
  const ps = cronogramaDaPista({ face: v.carta.face, de: v.carta.de, carimbo: k.palavra, misterio: true });
  t("e o momento dela cabe no teto", duracaoDaPista(ps) <= M.teto);
}

console.log(`\n${ok} ok, ${mal} mal`);
if (mal) process.exit(1);
