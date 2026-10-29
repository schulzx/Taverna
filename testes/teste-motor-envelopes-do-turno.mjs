/* ============================================================
   OS ENVELOPES DO TURNO, NO MOTOR (Fase T2, trilha A, 28/10/2026) — testes/teste-motor-envelopes-do-turno.mjs

   Os textos que o App embrulhava à volta da frase do jogador saem, um
   grupo de cada vez, para src/motor/envelopes-do-turno.js. Aqui cada grupo
   é provado byte a byte contra o de antes: `envelopes-dourado.json` é o
   que o App do commit de antes de cada grupo montou — o sítio recortado à
   letra — sobre os 275 casos de `envelopes-bloco.mjs`; e esta suíte
   recorta do App de HOJE o mesmo sítio e corre-o, com as peças do motor,
   sobre os mesmos casos.

   E a prova tem de morder: a ordem das peças trocada, a peça vazia que
   ocupa linha, o espaço da ascensão perdido, a noite esquecida, a forma da
   cidade sem a água — as fotos TÊM de divergir.

   O 1.º grupo é o RODAPÉ DO SISTEMA (o relógio, o lugar, o inviolável e as
   25 peças do estado vivo). O 2.º, A MASMORRA: as sete linhas que dizem ao Narrador o
   que o sistema já resolveu numa sala (a armadilha disparada, contornada e
   vista, o tesouro, o santuário, a busca) e a fuga, com o SO_ISSO. O 3.º,
   O CORREIO E O DOMÍNIO: o decreto pregado, a carta enviada e a petição
   respondida. O 4.º, O ACAMPAMENTO E A FOGUEIRA: o fim do acampamento com e
   sem descanso, as três da noite à volta do fogo e as duas portas do coração.
   ============================================================ */
import fs from "node:fs";
import { N_CASOS } from "./combate-casos.mjs";
import { recorteDosEnvelopes, blocoComoFuncao, correrOBloco, fotoDoEnvelope, fotoGuardada, AMOSTRA, casosDosEnvelopes, BLOCOS } from "./envelopes-bloco.mjs";
import { oRodapeDoTurno, aCabecaDoRodape, aFormaDaqui, ORDEM_DO_RODAPE, RODAPE_DO_SISTEMA, A_FORMA_DAQUI, SO_ISSO, ENVELOPES_DA_MASMORRA, oEnvelopeDaMasmorra, ENVELOPES_DO_CORREIO, oEnvelopeDoCorreio, ENVELOPES_DO_ACAMPAMENTO, oEnvelopeDoAcampamento, ENVELOPES_DA_ABERTURA, oEnvelopeDaAbertura } from "../src/motor/envelopes-do-turno.js";
import { formaDaCidade } from "../src/geografia.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const D = JSON.parse(fs.readFileSync(new URL("./envelopes-dourado.json", import.meta.url), "utf8"));
const APP = fs.readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8").replace(/\r\n/g, "\n");
const igual = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const casos = casosDosEnvelopes(N_CASOS);
const recorte = recorteDosEnvelopes(APP, { novo: true });
const hoje = Object.fromEntries(BLOCOS.map((b) => [b, blocoComoFuncao(recorte[b])]));
const fotosDeHoje = (bloco, troca) => casos.map((k) => fotoDoEnvelope(correrOBloco(hoje[bloco], k, { novo: true, troca, bloco })));
/* o dourado guarda o hash e o comprimento (o texto só na amostra): as fotos de
   hoje passam pela mesma fotoGuardada antes de comparar */
const guardadas = (novas) => novas.map((f, i) => fotoGuardada(f, i));
const divergem = (bloco, novas) => guardadas(novas).filter((f, i) => !igual(f, D.blocos[bloco][i])).length;
/* as fotos de hoje com o texto inteiro, uma vez por sítio. As secções que contam
   o que os casos percorrem leem-nas a ELAS (o dourado já não traz o texto): é o
   mesmo texto, porque a secção 1 prova caso a caso que o hash e o comprimento de
   hoje são os de antes */
const HOJE = Object.fromEntries(BLOCOS.map((b) => [b, fotosDeHoje(b)]));

sec("1 · cada grupo, byte a byte contra o App de antes");
t(`o dourado tem ${N_CASOS} casos em cada grupo, e o commit de antes de cada um`, BLOCOS.every((b) => (D.blocos[b] || []).length === N_CASOS && D.antes[b]));
t(`o dourado guarda o hash e o comprimento de cada caso, e o texto só nos ${AMOSTRA} primeiros`, BLOCOS.every((b) => D.blocos[b].every((f, i) => /^[0-9a-f]{32}$/.test(f.h) && Number.isInteger(f.n) && ("texto" in f) === (i < AMOSTRA))));
for (const bloco of BLOCOS) {
  const fotos = D.blocos[bloco];
  const cheias = HOJE[bloco];
  const novas = guardadas(cheias);
  const batem = novas.filter((f, i) => igual(f, fotos[i])).length;
  const primeira = novas.findIndex((f, i) => !igual(f, fotos[i]));
  t(`${bloco}: ${batem}/${N_CASOS} iguais ao App de ${D.antes[bloco]}`, batem === N_CASOS, primeira >= 0 ? `o caso ${primeira} diverge: ${JSON.stringify(cheias[primeira]).slice(0, 300)} | antes ${JSON.stringify(fotos[primeira]).slice(0, 300)}` : "");
  t(`${bloco}: determinista`, igual(fotosDeHoje(bloco).slice(0, 60), cheias.slice(0, 60)));
  t(`${bloco}: nenhum nome sem dublê, antes ou hoje`, [...fotos, ...novas].every((f) => !f.faltas.length), [...new Set(novas.flatMap((f) => f.faltas))].join(", "));
  t(`${bloco}: nenhum caso estoura`, [...fotos, ...novas].every((f) => !f.erro), (novas.find((f) => f.erro) || {}).erro);
  /* o teto do prompt é sagrado: o maior texto de hoje não passa do de antes */
  const tam = (f) => f.n;
  const maior = (xs) => Math.max(...xs.map(tam));
  t(`${bloco}: nenhum char a mais (o maior: ${maior(fotos)} antes, ${maior(novas)} hoje)`, maior(novas) <= maior(fotos) && novas.every((f, i) => tam(f) === tam(fotos[i])));
}

sec("2 · o rodapé: os casos percorrem o que o texto decide");
{
  const R = HOJE.rodape;
  const conta = (fn) => R.filter(fn).length;
  const noite = conta((f) => f.texto.includes(RODAPE_DO_SISTEMA.noite + ","));
  const desperto = conta((f, i) => casos[i].divindade && casos[i].divindade.despertar);
  const ascVazia = conta((f) => f.texto.includes("já estava. \n") || / $/.test(f.texto.split("\n")[0]));
  const forma = conta((f) => f.texto.includes(A_FORMA_DAQUI.abre));
  const agua = conta((f) => f.texto.includes(A_FORMA_DAQUI.agua));
  const aperto = conta((f) => f.texto.includes(A_FORMA_DAQUI.aperto));
  const semMuro = conta((f) => f.texto.includes(A_FORMA_DAQUI.semMuro));
  const comMuro = conta((f) => f.texto.includes("A defesa é "));
  const luta = conta((f) => f.texto.includes("<resumoGridPrompt"));
  const calados = conta((f) => f.calados.length);
  const linhas = R.map((f) => f.texto.split("\n").length);
  t(`a noite (${noite}) e o dia (${N_CASOS - noite})`, noite >= 40 && N_CASOS - noite >= 40);
  t(`quem despertou (${desperto}), e o resumo vazio com o espaço à frente (${ascVazia})`, desperto >= 60 && ascVazia >= 5);
  t(`a forma daqui (${forma}): sem muro ${semMuro}, com muro ${comMuro}, a água ${agua}, o aperto ${aperto}`, forma >= 30 && semMuro >= 5 && comMuro >= 10 && agua >= 3 && aperto >= 3);
  t(`o tabuleiro só na luta (${luta})`, luta >= 10 && R.every((f, i) => !f.texto.includes("<resumoGridPrompt") || casos[i].combate));
  t(`o calou do "onde se procura" (${calados})`, calados >= 5);
  t(`peças vazias não ocupam linha: de ${Math.min(...linhas)} a ${Math.max(...linhas)} linhas`, Math.min(...linhas) < Math.max(...linhas) && R.every((f) => !f.texto.endsWith("\n")));
}

sec("3 · as peças, direto (o que o motor exporta)");
{
  const cab = { dia: 1, minuto: 1300, local: "em Ponte do Martelo", ascensao: false };
  t("a cabeça: o relógio, a noite, a estação, o lugar e o inviolável, nesta ordem",
    /^\[RODAPÉ DO SISTEMA\] Agora: .+ \(dia 1\), 21:40 \(noite\), .+\. Local: em Ponte do Martelo\. Inviolável: \(1\)/.test(aCabecaDoRodape(cab)));
  t("quem não despertou: nada depois do inviolável", aCabecaDoRodape(cab).endsWith("já estava."));
  t("quem despertou com o resumo vazio: o espaço fica (como no App)", aCabecaDoRodape({ ...cab, ascensao: "" }).endsWith("já estava. "));
  t("as 25 peças, cada uma na sua linha e na ordem da tabela", oRodapeDoTurno(cab, Object.fromEntries(ORDEM_DO_RODAPE.map((k) => [k, k]))).split("\n").slice(1).join(",") === ORDEM_DO_RODAPE.join(",") && ORDEM_DO_RODAPE.length === 25);
  t("sem peças, só a cabeça", oRodapeDoTurno(cab, null) === aCabecaDoRodape(cab));
  const aldeia = { nome: "Vau", populacao: 100 };
  t("a forma da aldeia: sem muralha", aFormaDaqui(aldeia) === `${A_FORMA_DAQUI.abre}Vau é ${formaDaCidade(aldeia).nota}. ${A_FORMA_DAQUI.semMuro}`);
}

sec("4 · a prova morde");
{
  const B = "rodape";
  const juntar = (cab, P, ordem) => aCabecaDoRodape(cab) + ordem.map((k) => (P[k] ? `\n${P[k]}` : "")).join("");
  const trocadas = [...ORDEM_DO_RODAPE]; [trocadas[3], trocadas[4]] = [trocadas[4], trocadas[3]];
  const mordidas = [
    ["a ordem das peças trocada (a cena depois da proficiência)", { oRodapeDoTurno: (c, P) => juntar(c, P || {}, trocadas) }],
    ["a peça vazia ocupa linha", { oRodapeDoTurno: (c, P) => aCabecaDoRodape(c) + ORDEM_DO_RODAPE.map((k) => `\n${(P || {})[k] || ""}`).join("") }],
    ["o espaço da ascensão vazia perdido", { oRodapeDoTurno: (c, P) => oRodapeDoTurno({ ...c, ascensao: c.ascensao || false }, P) }],
    ["a noite esquecida", { oRodapeDoTurno: (c, P) => oRodapeDoTurno(c, P).replace(RODAPE_DO_SISTEMA.noite + ",", ",") }],
    ["a forma da cidade sem a água", { aFormaDaqui: (c) => aFormaDaqui(c).replace(A_FORMA_DAQUI.agua, "") }],
    ["a forma da cidade sem o aperto", { aFormaDaqui: (c) => aFormaDaqui(c).replace(A_FORMA_DAQUI.aperto, "") }],
  ];
  for (const [nome, troca] of mordidas) {
    const n = divergem(B, fotosDeHoje(B, troca));
    t(`${nome}: ${n} casos mudam`, n > 0);
  }
}

sec("5 · a masmorra: os casos percorrem o que o texto decide, e a prova morde");
{
  const M = (b) => HOJE[b].map((f) => f.texto[0][0]);
  const conta = (b, s) => M(b).filter((x) => x.includes(s)).length;
  t(`a busca que achou (${conta("masmorraBusca", "ENCONTREI")}) e a que não (${conta("masmorraBusca", "Nada encontrado")}), com e sem a CD`, conta("masmorraBusca", "ENCONTREI") >= 40 && conta("masmorraBusca", "Nada encontrado") >= 40 && conta("masmorraBusca", " vs ") >= 40 && conta("masmorraBusca", " vs ") < N_CASOS);
  t("a busca fecha com o escopo deste turno", M("masmorraBusca").every((x) => x.endsWith(SO_ISSO)) && SO_ISSO.startsWith(" ESCOPO DESTE TURNO"));
  t(`a salvaguarda passada, falhada e nenhuma (${conta("masmorraArmadilha", "(passou)")}/${conta("masmorraArmadilha", "(falhou)")})`, conta("masmorraArmadilha", "(passou)") >= 40 && conta("masmorraArmadilha", "(falhou)") >= 40 && conta("masmorraArmadilha", "salvaguarda") < N_CASOS);
  t(`o tesouro com item (${conta("masmorraTesouro", "o item")}), com poder (${conta("masmorraTesouro", ", +1")}) e sem item`, conta("masmorraTesouro", "o item") >= 40 && conta("masmorraTesouro", ", +1") >= 20 && conta("masmorraTesouro", "o item") < N_CASOS);
  t(`a armadilha sem nome vira "uma armadilha" (${conta("masmorraContornada", "(uma armadilha)")})`, conta("masmorraContornada", "(uma armadilha)") >= 40 && conta("masmorraAVista", "(uma armadilha)") >= 40);
  t(`a vista leva o aviso só quando ninguém a viu antes (${conta("masmorraAVista", "[AVISO")})`, conta("masmorraAVista", "[AVISO") >= 20 && conta("masmorraAVista", "[AVISO") < conta("masmorraTesouro", "[AVISO"));
  t("a forma de cada envelope está na tabela, e a que não está estoura", Object.keys(ENVELOPES_DA_MASMORRA).length === 7 && (() => { try { oEnvelopeDaMasmorra("nenhuma", {}); return false; } catch { return true; } })());
  const mordidas = [
    ["masmorraBusca", "a busca sem o escopo", { oEnvelopeDaMasmorra: (q, d) => oEnvelopeDaMasmorra(q, d).replace(SO_ISSO, "") }],
    ["masmorraBusca", "a busca que lê o achado em vez do achou", { oEnvelopeDaMasmorra: (q, d) => oEnvelopeDaMasmorra(q, { ...d, achou: !!d.achado }) }],
    ["masmorraArmadilha", "a salvaguarda sempre passada", { oEnvelopeDaMasmorra: (q, d) => oEnvelopeDaMasmorra(q, { ...d, salva: d.salva && { passou: true } }) }],
    ["masmorraContornada", "a armadilha sem nome sem o \"uma armadilha\"", { oEnvelopeDaMasmorra: (q, d) => oEnvelopeDaMasmorra(q, { ...d, nomeArmadilha: d.nomeArmadilha || "?" }) }],
    ["masmorraTesouro", "o item sem o poder", { oEnvelopeDaMasmorra: (q, d) => oEnvelopeDaMasmorra(q, { ...d, item: d.item && { nome: d.item.nome, raridade: d.item.raridade } }) }],
    ["masmorraSantuario", "o santuário sem o tempo", { oEnvelopeDaMasmorra: (q, d) => oEnvelopeDaMasmorra(q, { ...d, tempo: "" }) }],
    ["masmorraFuga", "a fuga com outro nome", { oEnvelopeDaMasmorra: (q, d) => oEnvelopeDaMasmorra(q, { masmorra: "a masmorra" }) }],
    ["masmorraAVista", "a vista com o aviso sempre", { oEnvelopeDaMasmorra: (q, d) => oEnvelopeDaMasmorra(q, { ...d, aviso: d.aviso || " [AVISO: há um segredo]" }) }],
  ];
  for (const [b, nome, troca] of mordidas) {
    const n = divergem(b, fotosDeHoje(b, troca));
    t(`${nome}: ${n} casos mudam`, n > 0);
  }
}

sec("6 · o correio e o domínio: os casos percorrem o que o texto decide, e a prova morde");
{
  const M = (b) => HOJE[b].map((f) => f.texto[0][0]);
  const conta = (b, s) => M(b).filter((x) => x.includes(s)).length;
  const quem = (b) => new Set(HOJE[b].map((f) => f.texto[0][1])).size;
  t("os três fecham com o escopo deste turno", ["correioDecreto", "correioCarta", "correioPeticao"].every((b) => M(b).every((x) => x.endsWith(SO_ISSO))));
  t(`o decreto de cada tipo, em maiúsculas (${new Set(M("correioDecreto").map((x) => x.split("]")[0])).size} cabeçalhos), e o que não existe cai no de reserva`,
    new Set(M("correioDecreto").map((x) => x.split("]")[0])).size === 5 && conta("correioDecreto", "— CAÇAR UMA CRIATURA]") > conta("correioDecreto", "— ESCOLTAR UMA CARAVANA]"));
  t(`a carta com oferta (${conta("correioCarta", "com oferta de")}) e sem; com mensagem (${conta("correioCarta", "Diz a carta:")}) e sem`,
    conta("correioCarta", "com oferta de") >= 60 && conta("correioCarta", "com oferta de") < N_CASOS && conta("correioCarta", "Diz a carta:") >= 60 && conta("correioCarta", "Diz a carta:") < N_CASOS);
  t(`a petição aceita (${conta("correioPeticao", "ACEITEI")}) e recusada (${conta("correioPeticao", "RECUSEI")}); a nota (${conta("correioPeticao", "Consequência")}); as moedas a entrar (${conta("correioPeticao", "Moedas: +")}) e a sair (${conta("correioPeticao", "Moedas: -")})`,
    conta("correioPeticao", "ACEITEI") >= 100 && conta("correioPeticao", "RECUSEI") >= 100 && conta("correioPeticao", "Consequência") >= 60 && conta("correioPeticao", "Consequência") < N_CASOS && conta("correioPeticao", "Moedas: +") >= 30 && conta("correioPeticao", "Moedas: -") >= 30);
  t("a petição vai com a ficha viva, e sem ela com a do render; o decreto, com a do render", quem("correioPeticao") === 2 && quem("correioDecreto") === 1);
  t("a forma de cada envelope está na tabela, e a que não está estoura", Object.keys(ENVELOPES_DO_CORREIO).length === 3 && (() => { try { oEnvelopeDoCorreio("nenhuma", {}); return false; } catch { return true; } })());
  const mordidas = [
    ["correioDecreto", "o tipo do decreto sem as maiúsculas", { oEnvelopeDoCorreio: (q, d) => oEnvelopeDoCorreio(q, { ...d, rotulo: { toUpperCase: () => d.rotulo } }) }],
    ["correioDecreto", "a recompensa esquecida", { oEnvelopeDoCorreio: (q, d) => oEnvelopeDoCorreio(q, { ...d, recompensa: 0 }) }],
    ["correioCarta", "a carta sem a mensagem", { oEnvelopeDoCorreio: (q, d) => oEnvelopeDoCorreio(q, { ...d, mensagem: "" }) }],
    ["correioCarta", "a carta com a oferta sempre", { oEnvelopeDoCorreio: (q, d) => oEnvelopeDoCorreio(q, { ...d, oferta: d.oferta || 10 }) }],
    ["correioPeticao", "a petição sempre aceita", { oEnvelopeDoCorreio: (q, d) => oEnvelopeDoCorreio(q, { ...d, aceite: true }) }],
    ["correioPeticao", "as moedas sem o sinal", { oEnvelopeDoCorreio: (q, d) => oEnvelopeDoCorreio(q, { ...d, moedas: d.moedas && Math.abs(d.moedas) }) }],
    ["correioPeticao", "a reação de outro", { oEnvelopeDoCorreio: (q, d) => oEnvelopeDoCorreio(q, { ...d, de: "alguém" }) }],
  ];
  for (const [b, nome, troca] of mordidas) {
    const n = divergem(b, fotosDeHoje(b, troca));
    t(`${nome}: ${n} casos mudam`, n > 0);
  }
}

sec("7 · o acampamento e a fogueira: os casos percorrem o que o texto decide, e a prova morde");
{
  const M = (b) => HOJE[b].map((f) => f.texto[0][0]);
  const conta = (b, s) => M(b).filter((x) => x.includes(s)).length;
  const quem = (b) => new Set(HOJE[b].map((f) => f.texto[0][1])).size;
  t(`o descanso curto (${conta("acampDescansado", "DESCANSO CURTO]")}) e o longo (${conta("acampDescansado", "DESCANSO LONGO]")}); a frase da manhã à frente (${M("acampDescansado").filter((x) => !x.startsWith("[")).length}) e sem ela`,
    conta("acampDescansado", "DESCANSO CURTO]") >= 100 && conta("acampDescansado", "DESCANSO LONGO]") >= 100 && M("acampDescansado").filter((x) => !x.startsWith("[")).length >= 50 && M("acampDescansado").filter((x) => x.startsWith("[")).length >= 150);
  const cauda = ["[ONDE ACORDO]", "[CLIMA]", "[REINO]", "[GUARDA]", "[SONHO]", "[EVENTOS]"];
  t("as notas do fim do descanso, cada uma cheia e vazia, e na ordem em que chegam",
    cauda.every((c) => conta("acampDescansado", c) >= 60 && conta("acampDescansado", c) < N_CASOS)
    && M("acampDescansado").every((x) => { const p = cauda.map((c) => x.indexOf(c)).filter((n) => n >= 0); return p.every((n, j) => !j || n > p[j - 1]); }));
  t(`levantar sem descanso: o reino (${conta("acampSemDescanso", "[REINO]")}) e sem ele; os vinte minutos`, conta("acampSemDescanso", "[REINO]") >= 60 && conta("acampSemDescanso", "[REINO]") < N_CASOS && conta("acampSemDescanso", "(20 minutos)") === N_CASOS);
  t(`a resposta ao coração: aceito (${conta("coracaoResposta", "Eu aceito")}), recuso (${conta("coracaoResposta", "Eu recuso")}), o porquê (${conta("coracaoResposta", "porquê.")}) e a que não está na tabela (${conta("coracaoResposta", "]  Narre")})`,
    ["Eu aceito", "Eu recuso", "porquê.", "]  Narre"].every((x) => conta("coracaoResposta", x) >= 50));
  t("com SO_ISSO o que responde a um gesto e fica na cena; sem ele o que fecha a noite e o dilema", ["fogoSentar", "coracaoResposta"].every((b) => M(b).every((x) => x.endsWith(SO_ISSO))) && ["fogoDecisao", "fogoFicar", "coracaoDecisao", "acampSemDescanso", "acampDescansado"].every((b) => M(b).every((x) => !x.includes(SO_ISSO))));
  t("a ficha viva e a do render (a resposta, o sentar); a da luta e a paga (a decisão)", quem("coracaoResposta") === 2 && quem("fogoSentar") === 2 && quem("coracaoDecisao") === 2);
  t("a forma de cada envelope está na tabela, e a que não está estoura", Object.keys(ENVELOPES_DO_ACAMPAMENTO).length === 7 && (() => { try { oEnvelopeDoAcampamento("nenhuma", {}); return false; } catch { return true; } })());
  const E = oEnvelopeDoAcampamento;
  const mordidas = [
    ["acampDescansado", "a frase da manhã perdida", { oEnvelopeDoAcampamento: (q, d) => E(q, { ...d, antes: "" }) }],
    ["acampDescansado", "as notas do fim fora de ordem", { oEnvelopeDoAcampamento: (q, d) => E(q, { ...d, cauda: [...d.cauda].reverse() }) }],
    ["acampDescansado", "o tipo do descanso sem as maiúsculas", { oEnvelopeDoAcampamento: (q, d) => E(q, { ...d, tipo: { toUpperCase: () => d.tipo } }) }],
    ["acampSemDescanso", "o reino esquecido", { oEnvelopeDoAcampamento: (q, d) => E(q, { ...d, reino: "" }) }],
    ["acampSemDescanso", "o recibo de outro", { oEnvelopeDoAcampamento: (q, d) => E(q, { ...d, recibo: "NÃO houve cura — PV e PM continuam exatamente como estavam." }) }],
    ["fogoSentar", "o sentar sem o escopo", { oEnvelopeDoAcampamento: (q, d) => E(q, d).replace(SO_ISSO, "") }],
    ["fogoDecisao", "o preço trocado pelo verbo", { oEnvelopeDoAcampamento: (q, d) => E(q, { ...d, preco: d.verbo }) }],
    ["fogoFicar", "ficar com outro", { oEnvelopeDoAcampamento: (q, d) => E(q, { quem: "alguém" }) }],
    ["coracaoResposta", "a resposta sempre aceita", { oEnvelopeDoAcampamento: (q, d) => E(q, { ...d, resposta: "aceitou" }) }],
    ["coracaoDecisao", "a decisão sem o preço", { oEnvelopeDoAcampamento: (q, d) => E(q, { ...d, preco: "" }) }],
  ];
  for (const [b, nome, troca] of mordidas) {
    const n = divergem(b, fotosDeHoje(b, troca));
    t(`${nome}: ${n} casos mudam`, n > 0);
  }
}

sec("9 · a abertura: os casos percorrem o que o texto decide, e a prova morde");
{
  const C = HOJE.aberturaCampanha.map((f) => f.texto);
  const R = HOJE.aberturaRetomada.map((f) => f.texto[0][0]);
  const conta = (xs, s) => xs.filter((x) => x.includes(s)).length;
  t(`a campanha sem habilidades (${conta(C, "SISTEMA: nenhuma —")}), com uma e com várias (${conta(C, "Bênção, Luz")}), na ordem das quatro partes`,
    conta(C, "SISTEMA: nenhuma —") >= 100 && conta(C, "SISTEMA: Golpe Feroz —") >= 50 && conta(C, "SISTEMA: Bênção, Luz, Escudo da Fé —") >= 50
    && C.every((x) => { const p = ["1) O MUNDO", "2) ONDE", "3) QUEM", "4) O PRIMEIRO FIO"].map((s) => x.indexOf(s)); return p.every((n, j) => n >= 0 && (!j || n > p[j - 1])); }));
  t(`a retomada pelo recap que vale (${R.filter((x) => x.startsWith("<envelopeDaRetomada")).length}) e a do texto fixo, com o nome da campanha`,
    R.filter((x) => x.startsWith("<envelopeDaRetomada")).length >= 30 && conta(R, "[RETOMADA] Voltei a \"") >= 100 && new Set(R.filter((x) => x.startsWith("[RETOMADA]"))).size >= 3);
  t("o capítulo: a mesma linha nos dois sítios, para o herói de cada um", HOJE.aberturaCapitulo.every((f) => f.texto[0][0] === oEnvelopeDaAbertura("capitulo")) && HOJE.aberturaCapituloNovo.every((f) => f.texto[0][1] === "Vera do capítulo"));
  t("a forma de cada envelope está na tabela, e a que não está estoura", Object.keys(ENVELOPES_DA_ABERTURA).length === 3 && (() => { try { oEnvelopeDaAbertura("nenhuma", {}); return false; } catch { return true; } })());
  const E = oEnvelopeDaAbertura;
  const mordidas = [
    ["aberturaCampanha", "a campanha sem a lista das habilidades", { oEnvelopeDaAbertura: (q, d) => E(q, { ...d, habs: "nenhuma" }) }],
    ["aberturaCampanha", "a campanha na 1.ª pessoa", { oEnvelopeDaAbertura: (q, d) => E(q, d).replace("2ª pessoa", "1ª pessoa") }],
    ["aberturaCapitulo", "o capítulo sem o envelope de cima", { oEnvelopeDaAbertura: (q, d) => E(q, d).replace(" conforme o envelope acima", "") }],
    ["aberturaCapituloNovo", "o capítulo novo com outro selo", { oEnvelopeDaAbertura: (q, d) => E(q, d).replace("[ABERTURA DE CAPÍTULO]", "[CAPÍTULO]") }],
    ["aberturaRetomada", "a retomada sem o nome", { oEnvelopeDaAbertura: (q, d) => E(q, { ...d, campanha: "a aventura" }) }],
    ["aberturaRetomada", "a retomada que deixa o tempo passar", { oEnvelopeDaAbertura: (q, d) => E(q, d).replace(" não faça o tempo passar e", "") }],
  ];
  for (const [b, nome, troca] of mordidas) {
    const n = divergem(b, fotosDeHoje(b, troca));
    t(`${nome}: ${n} casos mudam`, n > 0);
  }
}

sec("8 · a chave da tabela é da tabela, nunca do protótipo");
{
  /* o conserto declarado (28/10/2026): a frase da resposta ao coração saía de
     um objeto literal indexado pela resposta, e uma chave herdada ("constructor",
     "toString") tirava texto do protótipo — no App de antes ia ao Narrador
     "function Object() { [native code] }", no motor de 640c39f a ficha de quem
     pede ("Iris"). Hoje a chave que não é da tabela vai sem frase, como a
     "outra" que nunca esteve lá. Nos 275 casos nenhuma resposta é herdada, por
     isso o dourado não se mexe; este é o caso que ele não cobre. */
  const E = oEnvelopeDoAcampamento;
  const semFrase = E("respostaAoCoracao", { nome: "Iris", resposta: "outra" });
  t("a resposta herdada vai sem frase, como a que não está na tabela", ["constructor", "toString", "__proto__", "hasOwnProperty"].every((r) => E("respostaAoCoracao", { nome: "Iris", resposta: r }) === semFrase), E("respostaAoCoracao", { nome: "Iris", resposta: "constructor" }).slice(0, 80));
  const estoura = (f) => { try { f(); return false; } catch { return true; } };
  t("a forma herdada não é forma: os envelopes estouram com \"constructor\" e \"toString\"",
    ["constructor", "toString"].every((q) => estoura(() => oEnvelopeDaMasmorra(q, {})) && estoura(() => oEnvelopeDoCorreio(q, {})) && estoura(() => E(q, {}))));
}

console.log(`\n${ok} ok, ${mal} falhas`);
if (mal) process.exit(1);
