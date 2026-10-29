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
   O 5.º, A ABERTURA; o 6.º, A VIAGEM. O 7.º, O FIO DA HISTÓRIA: as quatro
   notas do turno com que o diretor empurra a cena (o marco, os rumores da
   chave, o mundo que vem buscar, a virada), o teto do interlúdio na pauta e
   a luta da chave que o sistema já abriu. O 8.º, A FICHA (A FORMAÇÃO): as
   sete notas do que o jogador mudou na própria ficha (o nível, as perícias,
   o atributo, a habilidade, as duas especializações, o caminho refeito). O
   9.º junta-lhe o que o sistema resolveu: o combate, o sucesso automático, a
   volta dos mortos e a nota do recrutamento. O 10.º, as doze notas [INFO] do
   inventário, do grupo e do save. O 11.º, O MUNDO QUE ANDA: o festival, os
   dois boatos, os eventos de reino e o que o descanso longo acorda (o arco
   global e a etapa, o fio local e o que expirou, a quest, a divindade e o
   evento divino). O 12.º, OS PODERES: a invocação, o sacrifício, a metamagia,
   o efeito aplicado, o milagre e a forma dele, o despertar, as magias de
   função (identificar, localizar), as habilidades do turno e as invocações
   que se desfazem.
   ============================================================ */
import fs from "node:fs";
import { N_CASOS } from "./combate-casos.mjs";
import { recorteDosEnvelopes, blocoComoFuncao, correrOBloco, fotoDoEnvelope, fotoGuardada, AMOSTRA, casosDosEnvelopes, BLOCOS } from "./envelopes-bloco.mjs";
import { oRodapeDoTurno, aCabecaDoRodape, aFormaDaqui, ORDEM_DO_RODAPE, RODAPE_DO_SISTEMA, A_FORMA_DAQUI, SO_ISSO, ENVELOPES_DA_MASMORRA, oEnvelopeDaMasmorra, ENVELOPES_DO_CORREIO, oEnvelopeDoCorreio, ENVELOPES_DO_ACAMPAMENTO, oEnvelopeDoAcampamento, ENVELOPES_DA_ABERTURA, oEnvelopeDaAbertura, ENVELOPES_DA_VIAGEM, oEnvelopeDaViagem, ENVELOPES_DO_FIO, oEnvelopeDoFio, ENVELOPES_DA_FICHA, oEnvelopeDaFicha, ENVELOPES_DO_MUNDO, oEnvelopeDoMundo, ENVELOPES_DOS_PODERES, oEnvelopeDosPoderes } from "../src/motor/envelopes-do-turno.js";
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

sec("10 · a viagem: os casos percorrem o que o texto decide, e a prova morde");
{
  const V = HOJE.viagemTrecho.map((f) => f.texto);
  const M = (b) => HOJE[b].map((f) => f.texto[0][0]);
  const conta = (xs, s) => xs.filter((x) => x.includes(s)).length;
  t(`o trecho até à boca, o último (${conta(V, "Este trecho termina diante da entrada da Cripta")}) e não (${conta(V, "Estou a caminho da entrada")}); até à cidade, o último (${conta(V, "Este trecho termina em Coroa Alta")}) e não (${conta(V, "Estou a caminho de Coroa Alta")}); sem destino na jornada, com o dito (${conta(V, "Estou a caminho de Agulha de Sal — aproxime-me")}) e sem (${conta(V, "Se eu estiver a caminho")})`,
    ["Este trecho termina diante da entrada", "Estou a caminho da entrada", "Este trecho termina em Coroa Alta", "Estou a caminho de Coroa Alta", "Estou a caminho de Agulha de Sal — aproxime-me", "Se eu estiver a caminho"].every((s) => conta(V, s) >= 20)
    && conta(V, "entrada do Poço das Celas") >= 10 && conta(V, "entrada da Cripta do Corvo") >= 10);
  t(`com meio (${conta(V, "(seguimos de ")}) e sem; as notas do fim na ordem`, conta(V, "(seguimos de ") >= 100 && conta(V, "(seguimos de ") < N_CASOS
    && V.every((x) => { const p = ["[MARCHA]", "[ERMOS]", "[AMBULANTE]", "[TEMPO +1h]"].map((s) => x.indexOf(s)).filter((n) => n >= 0); return p.every((n, j) => !j || n > p[j - 1]); }));
  const P = M("viagemPassarOTempo");
  t(`passar o tempo dentro de um lugar (${conta(P, "EU CONTINUO EM ")}) e fora, com o clima (${conta(P, "[CLIMA]")}) e o reino (${conta(P, "[REINO]")}) cheios e vazios`,
    conta(P, "EU CONTINUO EM O MOINHO VELHO") >= 20 && conta(P, "EU CONTINUO EM ") < N_CASOS && ["[CLIMA]", "[REINO]"].every((s) => conta(P, s) >= 60 && conta(P, s) < N_CASOS));
  const E2 = M("viagemErmos");
  t(`o forrageamento que achou (${conta(E2, "Consegui ")}) e o que não; nada colhido (${conta(E2, "bolsa:  —")}), uma e duas colheitas (${conta(E2, "; ")}); fecha com o escopo`,
    conta(E2, "Consegui ") >= 100 && conta(E2, "Não encontrei") >= 60 && conta(E2, "bolsa:  —") >= 60 && conta(E2, "Musgo (pavio); Pedra-ume (tinta)") >= 60 && E2.every((x) => x.endsWith(SO_ISSO)));
  const F = HOJE.viagemEmboscada.map((f) => f.texto);
  t(`a emboscada com nota (${conta(F, "\n[EMBOSCADA]")}) e sem, com o bando em minúsculas`, conta(F, "\n[EMBOSCADA]") >= 60 && F.every((x) => !x.includes("Os Lobos")) && conta(F, "os lobos do vau") >= 100);
  t("as duas partidas: o mapa com a ficha do render, a escolha com a viva (e sem ela)", new Set(HOJE.viagemPartidaMapa.map((f) => f.texto[0][1])).size === 1 && new Set(HOJE.viagemPartidaEscolha.map((f) => f.texto[0][1])).size === 2);
  t("a forma de cada envelope está na tabela, e a que não está estoura", Object.keys(ENVELOPES_DA_VIAGEM).length === 6 && (() => { try { oEnvelopeDaViagem("nenhuma", {}); return false; } catch { return true; } })());
  const E = oEnvelopeDaViagem;
  const mordidas = [
    ["viagemPartidaMapa", "a partida pelo mapa com outro destino", { oEnvelopeDaViagem: (q, d) => E(q, { ...d, destino: "lugar nenhum" }) }],
    ["viagemPartidaEscolha", "a escolha que diz mapa", { oEnvelopeDaViagem: (q, d) => E("partidaMapa", d) }],
    ["viagemTrecho", "o último trecho até à boca lido como o do meio", { oEnvelopeDaViagem: (q, d) => E(q, { ...d, ultimoTrecho: false }) }],
    ["viagemTrecho", "o último trecho até à cidade lido como o do meio", { oEnvelopeDaViagem: (q, d) => E(q, { ...d, ultimoTrechoCidade: false }) }],
    ["viagemTrecho", "o meio esquecido", { oEnvelopeDaViagem: (q, d) => E(q, { ...d, meio: null }) }],
    ["viagemTrecho", "a boca sem a preposição", { oEnvelopeDaViagem: (q, d) => E(q, d).replace(/entrada d[aoe]s? /g, "entrada ") }],
    ["viagemTrecho", "o ritmo sem as minúsculas", { oEnvelopeDaViagem: (q, d) => E(q, { ...d, ritmo: { ...d.ritmo, nome: { toLowerCase: () => d.ritmo.nome } } }) }],
    ["viagemPassarOTempo", "o tempo que passa na cidade", { oEnvelopeDaViagem: (q, d) => E(q, { ...d, lugar: null }) }],
    ["viagemPassarOTempo", "o clima e o reino trocados", { oEnvelopeDaViagem: (q, d) => E(q, { ...d, clima: d.reino, reino: d.clima }) }],
    ["viagemErmos", "o forrageamento sempre achado", { oEnvelopeDaViagem: (q, d) => E(q, { ...d, achou: true }) }],
    ["viagemErmos", "as colheitas sem a descrição", { oEnvelopeDaViagem: (q, d) => E(q, { ...d, colhidos: d.colhidos.map((c) => ({ ...c, desc: "?" })) }) }],
    ["viagemEmboscada", "a emboscada sem a nota", { oEnvelopeDaViagem: (q, d) => E(q, { ...d, nota: "" }) }],
  ];
  for (const [b, nome, troca] of mordidas) {
    const n = divergem(b, fotosDeHoje(b, troca));
    t(`${nome}: ${n} casos mudam`, n > 0);
  }
}

sec("11 · o fio da história: os casos percorrem o que o texto decide, e a prova morde");
{
  const N = (b) => HOJE[b].map((f) => f.texto);
  const conta = (xs, s) => xs.filter((x) => x.includes(s)).length;
  /* as quatro notas: a nota do turno vazia e já com outra à frente (a nova entra na linha de baixo) */
  const notas = ["fioMarco", "fioRumores", "fioMundo", "fioVirada"];
  t("as quatro notas entram sozinhas e abaixo da que já havia", notas.every((b) => { const X = N(b); return conta(X, "[NOTA] já havia\n[") >= 80 && X.filter((x) => x && !x.startsWith("[NOTA]")).length >= 60; }));
  const R = N("fioRumores");
  t(`os rumores nenhum (${R.filter((x) => x === "" || x === "[NOTA] já havia").length}), um (${conta(R, "] Brann venceu Iolanda.")}) e dois (${conta(R, "] a Garra caiu; o Rubro sangra.")})`,
    R.filter((x) => x === "" || x === "[NOTA] já havia").length >= 60 && conta(R, "] Brann venceu Iolanda.") >= 60 && conta(R, "] a Garra caiu; o Rubro sangra.") >= 60);
  const M = N("fioMundo");
  t("o mundo vai buscar em cada degrau da escada, com o que o mundo diz", [1, 2, 3, 4].every((d) => conta(M, "degrau " + d + "] ") >= 40) && conta(M, "] a ponte cai.") >= 100 && conta(M, "] um mensageiro bate à porta.") >= 100);
  const V = N("fioVirada");
  t(`a virada com nenhum (${conta(V, "semeado: .")}), um (${conta(V, "semeado: Iris some.")}) e dois passos (${conta(V, "Iris some; a guarda chega.")}), e o nome da forma`,
    conta(V, "semeado: .") >= 60 && conta(V, "semeado: Iris some.") >= 60 && conta(V, "Iris some; a guarda chega.") >= 60 && conta(V, "[A VIRADA — <revelacaoDe ") >= 100);
  const I = HOJE.fioInterludio.map((f) => f.texto);
  t("o interlúdio entra na pauta como momento, depois da chave e do rival", I.every((p) => p.length === 1 && p[0][0] === "momento" && p[0][1].endsWith(" " + oEnvelopeDoFio("interludioDoTorneio"))));
  const L = HOJE.fioLutaDaChave.map((f) => f.texto[0]);
  t("a luta da chave com o nome do rival, para a ficha viva e (sem ela) a do render", conta(L.map((x) => x[0]), "] Iolanda da Garra entra na arena") >= 100 && conta(L.map((x) => x[0]), "] Brann entra na arena") >= 100 && new Set(L.map((x) => x[1])).size === 2);
  t("a forma de cada envelope está na tabela, e a que não está estoura", Object.keys(ENVELOPES_DO_FIO).length === 6 && (() => { try { oEnvelopeDoFio("nenhuma", {}); return false; } catch { return true; } })() && (() => { try { oEnvelopeDoFio("constructor", {}); return false; } catch { return true; } })());
  const E = oEnvelopeDoFio;
  const mordidas = [
    ["fioMarco", "o marco que não manda resolver a pendência", { oEnvelopeDoFio: (q, d) => E(q, d).replace("RESOLVA a pendencia em uma frase e ", "") }],
    ["fioRumores", "os rumores separados por vírgula", { oEnvelopeDoFio: (q, d) => E(q, d).replace("; ", ", ") }],
    ["fioMundo", "o degrau da escada perdido", { oEnvelopeDoFio: (q, d) => E(q, { ...d, degrau: 1 }) }],
    ["fioVirada", "a virada sem os passos do dia seguinte", { oEnvelopeDoFio: (q, d) => E(q, { ...d, passos: [] }) }],
    ["fioVirada", "a virada que dá o nome cru da forma", { oEnvelopeDoFio: (q, d) => E(q, { ...d, revelacao: "traidor" }) }],
    ["fioInterludio", "o interlúdio que deixa inventar lutas", { oEnvelopeDoFio: (q, d) => E(q, d).replace(" Nao invente lutas: a luta acontece quando o jogador entrar nela.", "") }],
    ["fioLutaDaChave", "a luta da chave sem o nome do rival", { oEnvelopeDoFio: (q, d) => E(q, { ...d, quem: "o rival" }) }],
    ["fioLutaDaChave", "a luta que manda abrir o combate", { oEnvelopeDoFio: (q, d) => E(q, d).replace(" O SISTEMA ja abriu o combate.", "") }],
  ];
  for (const [b, nome, troca] of mordidas) {
    const n = divergem(b, fotosDeHoje(b, troca));
    t(`${nome}: ${n} casos mudam`, n > 0);
  }
}

sec("12 · a ficha (a formação): os casos percorrem o que o texto decide, e a prova morde");
{
  const N = (b) => HOJE[b].map((f) => f.texto);
  const conta = (xs, s) => xs.filter((x) => x.includes(s)).length;
  const B = ["fichaNivel", "fichaPericias", "fichaAtributo", "fichaHabilidade", "fichaSubclasse", "fichaEspecializacao", "fichaRefazer"];
  /* o nível troca a nota do turno inteira (a de antes não fica); as outras seis entram abaixo da que já havia */
  t("o nível troca a nota; as outras seis entram sozinhas e abaixo da que já havia", N("fichaNivel").every((x) => x.startsWith("[FICHA — ")) && B.slice(1).every((b) => { const X = N(b); return conta(X, "[NOTA] já havia\n[") >= 100 && X.filter((x) => !x.startsWith("[NOTA]")).length >= 100; }));
  t("o nível de cada degrau", [2, 3, 4, 5, 6, 7, 8, 9, 10].every((n) => conta(N("fichaNivel"), "Subi para o nível " + n + ".") >= 20));
  t("o atributo de cada nome, com o valor", ["Força", "Sabedoria", "Carisma", "Destreza"].every((a) => conta(N("fichaAtributo"), "Fortaleci " + a + " (agora +") >= 50) && [1, 2, 3, 4, 5].every((v) => conta(N("fichaAtributo"), "(agora +" + v + ")") >= 40));
  const H = N("fichaHabilidade");
  t(`a habilidade que abre outro caminho (${conta(H, ", abrindo TAMBÉM o caminho de ")}), com o nome da classe vazio (${conta(H, "o caminho de  — sou ")}), e a que não abre (${H.filter((x) => !x.includes("abrindo")).length})`,
    conta(H, ", abrindo TAMBÉM o caminho de Mago — sou ") >= 20 && conta(H, "o caminho de  — sou ") >= 10 && H.filter((x) => !x.includes("abrindo")).length >= 100 && ["Guerreiro", "Clérigo", "Bardo"].every((c) => conta(H, "— sou " + c + " e ") >= 10));
  t("as duas especializações, de cada nome e classe", ["Campeão", "Domínio da Luz"].every((n) => conta(N("fichaSubclasse"), "especialização \"" + n + "\" dentro de ") >= 100) && ["Mestre de Armas", "Lâmina Gêmea", "Erudito"].every((n) => conta(N("fichaEspecializacao"), "\"" + n + "\"") >= 80) && conta(N("fichaSubclasse"), "dentro de .") >= 60);
  /* MOVIDA (28/10, o 9.º grupo): a tabela da ficha cresceu com o que o sistema resolveu (§13 conta
     as onze); aqui fica a prova de que as sete da formação estão nela, pelo nome */
  t("a forma de cada envelope está na tabela, e a que não está estoura", ["subiDeNivel", "pericias", "atributo", "habilidade", "subclasse", "especializacao", "refazerCaminho"].every((q) => Object.hasOwn(ENVELOPES_DA_FICHA, q)) && (() => { try { oEnvelopeDaFicha("nenhuma", {}); return false; } catch { return true; } })() && (() => { try { oEnvelopeDaFicha("constructor", {}); return false; } catch { return true; } })());
  const E = oEnvelopeDaFicha;
  const mordidas = [
    ["fichaNivel", "o nível de um degrau acima", { oEnvelopeDaFicha: (q, d) => E(q, { ...d, nivel: d.nivel + 1 }) }],
    ["fichaPericias", "as perícias que deixam abrir cena", { oEnvelopeDaFicha: (q, d) => E(q, d).replace("não abra cena, ", "") }],
    ["fichaAtributo", "o atributo sem o sinal do valor", { oEnvelopeDaFicha: (q, d) => E(q, d).replace("(agora +", "(agora ") }],
    ["fichaHabilidade", "a habilidade que nunca abre caminho", { oEnvelopeDaFicha: (q, d) => E(q, { ...d, eraNova: false }) }],
    ["fichaHabilidade", "a classe de antes trocada pela nova", { oEnvelopeDaFicha: (q, d) => E(q, { ...d, classe: d.classeNome }) }],
    ["fichaSubclasse", "a especialização dentro de outra classe", { oEnvelopeDaFicha: (q, d) => E(q, { ...d, classeNome: "Mago" }) }],
    ["fichaEspecializacao", "a especialização sem a obsessão", { oEnvelopeDaFicha: (q, d) => E(q, d).replace(": é a obsessão em que me tornei referência.", ".") }],
    ["fichaRefazer", "o caminho refeito com o efeito por aplicar", { oEnvelopeDaFicha: (q, d) => E(q, d).replace(" — mas o efeito mecânico já está aplicado", "") }],
  ];
  for (const [b, nome, troca] of mordidas) {
    const n = divergem(b, fotosDeHoje(b, troca));
    t(`${nome}: ${n} casos mudam`, n > 0);
  }
}

sec("13 · a ficha (o que o sistema resolveu): os casos percorrem o que o texto decide, e a prova morde");
{
  const M = (b) => HOJE[b].map((f) => f.texto[0][0]);
  const conta = (xs, s) => xs.filter((x) => x.includes(s)).length;
  const C = M("fichaCombate");
  t(`o combate com o resumo dos inimigos (${conta(C, "aplicado. Lobo caiu;")}) e sem (${conta(C, "aplicado. NÃO recalcule")}), de cada desfecho, e a ação declarada no fim`,
    conta(C, "aplicado. Lobo caiu;") >= 100 && conta(C, "aplicado. NÃO recalcule") >= 100 && ["três golpes", "dois acertos e um erro", "um golpe só"].every((d) => conta(C, "sequência de " + d + ".") >= 80) && C.every((x) => x.endsWith("Ação declarada: ataco o lobo") || x.endsWith("Ação declarada: giro a lança e avanço")));
  const S2 = M("fichaSucesso");
  t(`o sucesso automático com o motivo (${conta(S2, "\"pular o muro\":")}) e sem ele ou vazio, que diz ação (${conta(S2, "\"ação\":")}); fecha com o escopo`,
    conta(S2, "\"pular o muro\":") >= 60 && conta(S2, "\"ação\":") >= 130 && [8, 14].every((n) => conta(S2, "(dificuldade " + n + " vs") >= 30) && S2.every((x) => x.endsWith(SO_ISSO)));
  const V = M("fichaVolta");
  t(`a volta pela fé (${conta(V, "pela minha própria fé")}) e pelo ouro (${conta(V, "pagando o preço em ouro")}), da 1.ª à 4.ª vez, com a cicatriz e o que ela é`,
    conta(V, "pela minha própria fé") >= 80 && conta(V, "pagando o preço em ouro") >= 160 && [1, 2, 3, 4].every((n) => conta(V, "Foi a " + n + "ª vez.") >= 60) && conta(V, "Mão Fria — a mão esquerda não aquece") >= 50);
  const P = HOJE.fichaRecrutamento.map((f) => f.texto);
  t("o recrutamento de cada companheiro, com o nível e os PV", ["Iris", "Bruna Ferro", "Noé"].every((n) => conta(P, "] " + n + " agora FAZ PARTE") >= 80) && conta(P, "(nível 6, ") >= 40 && conta(P, ", 20 PV — ") >= 40);
  /* MOVIDA (28/10, o 10.º grupo): a tabela da ficha cresceu com as notas [INFO] (§14 conta as
     vinte e três); aqui ficam as quatro do que o sistema resolveu, pelo nome */
  t("as quatro formas novas estão na tabela da ficha", ["combateResolvido", "sucessoAutomatico", "voltaDosMortos", "recrutamento"].every((q) => Object.hasOwn(ENVELOPES_DA_FICHA, q)));
  const E = oEnvelopeDaFicha;
  const mordidas = [
    ["fichaCombate", "o combate sem o resumo dos inimigos", { oEnvelopeDaFicha: (q, d) => E(q, { ...d, resumoInimigos: "" }) }],
    ["fichaCombate", "o combate que deixa recalcular", { oEnvelopeDaFicha: (q, d) => E(q, d).replace("NÃO recalcule nem mude números — ", "") }],
    ["fichaSucesso", "o sucesso sem o patamar", { oEnvelopeDaFicha: (q, d) => E(q, d).replace("trivial para meu patamar", "fácil") }],
    ["fichaSucesso", "o sucesso sem o escopo", { oEnvelopeDaFicha: (q, d) => E(q, d).replace(SO_ISSO, "") }],
    ["fichaVolta", "a fé lida como ouro", { oEnvelopeDaFicha: (q, d) => E(q, { ...d, via: "ouro" }) }],
    ["fichaVolta", "a cicatriz sem o que ela é", { oEnvelopeDaFicha: (q, d) => E(q, { ...d, descricao: "" }) }],
    ["fichaRecrutamento", "o recrutamento sem os PV", { oEnvelopeDaFicha: (q, d) => E(q, { ...d, vidaMax: 0 }) }],
    ["fichaRecrutamento", "o recrutamento que manda pedir o grupo_adicionar", { oEnvelopeDaFicha: (q, d) => E(q, d).replace(", você não precisa mandar \"grupo_adicionar\"", "") }],
  ];
  for (const [b, nome, troca] of mordidas) {
    const n = divergem(b, fotosDeHoje(b, troca));
    t(`${nome}: ${n} casos mudam`, n > 0);
  }
}

sec("14 · a ficha (as notas [INFO]): os casos percorrem o que o texto decide, e a prova morde");
{
  const N = (b) => HOJE[b].map((f) => f.texto);
  const conta = (xs, s) => xs.filter((x) => x.includes(s)).length;
  const B = ["infoDescarteItem", "infoDescarteEquip", "infoEquipou", "infoForjou", "infoContrato", "infoDecreto", "infoAgoraE", "infoSaiu", "infoGuilda", "infoRecalFicha", "infoRecalMundo", "infoTransferiu"];
  /* quem muda de raça ou classe troca a nota inteira; as outras onze entram abaixo da que já havia */
  t("a mudança de raça ou classe troca a nota; as outras onze entram abaixo da que já havia", N("infoAgoraE").every((x) => x.startsWith("[INFO] ")) && B.filter((b) => b !== "infoAgoraE").every((b) => { const X = N(b); return conta(X, "[NOTA] já havia\n[INFO] ") >= 100 && X.filter((x) => x.startsWith("[INFO] ")).length >= 100; }));
  const F = N("infoForjou");
  t(`o item forjado com poder (${conta(F, ", +1 de fogo).")}) e sem (${F.filter((x) => /\((raro|epico|comum)\)\.$/.test(x)).length})`, conta(F, ", +1 de fogo).") >= 60 && F.filter((x) => /\((raro|epico|comum)\)\.$/.test(x)).length >= 150);
  const G = N("infoAgoraE");
  t(`quem agora é: a parte vazia não entra (${conta(G, "agora é Mago")}), com e sem profissão (${conta(G, ", profissão ferreira.")})`, conta(G, "agora é Elfo, Mago") >= 20 && conta(G, "agora é Mago") >= 20 && conta(G, "Guerreiro, Campeão") >= 15 && G.every((x) => !x.includes(", ,") && !x.includes("é ,")) && conta(G, ", profissão ferreira.") >= 80 && G.filter((x) => !x.includes("profissão")).length >= 150);
  const P = N("infoRecalFicha");
  t(`a recalibração com dádivas (${conta(P, " dádivas épicas")}) e sem`, conta(P, ", 2 dádivas épicas") >= 60 && conta(P, ", 1 dádivas épicas") >= 60 && P.filter((x) => !x.includes("dádivas")).length >= 130);
  t("o que se transfere de onde para onde, e quem sai do grupo, duas vezes pelo nome", conta(N("infoTransferiu"), "\"Poção de Cura\" de a mochila para ") >= 60 && conta(N("infoTransferiu"), " para Noé.") >= 60 && conta(N("infoSaiu"), "Greta saiu do meu grupo (removido pelo jogador). Reflita isso na narrativa: Greta não viaja") >= 80);
  t("as doze formas novas estão na tabela da ficha, que agora tem vinte e três", Object.keys(ENVELOPES_DA_FICHA).length === 23 && ["descarteItem", "descarteEquipamento", "equipouCompanheiro", "forjou", "abandonouContrato", "retirouDecreto", "agoraE", "saiuDoGrupo", "guildaCresceu", "recalibrouAFicha", "recalibrouOMundo", "transferiu"].every((q) => Object.hasOwn(ENVELOPES_DA_FICHA, q)));
  const E = oEnvelopeDaFicha;
  const mordidas = [
    ["infoDescarteItem", "o item descartado dito equipamento", { oEnvelopeDaFicha: (q, d) => E("descarteEquipamento", d) }],
    ["infoDescarteEquip", "o equipamento descartado sem o nome", { oEnvelopeDaFicha: (q, d) => E(q, { ...d, nome: "algo" }) }],
    ["infoEquipou", "o companheiro trocado pelo item", { oEnvelopeDaFicha: (q, d) => E(q, { ...d, quem: d.item, item: d.quem }) }],
    ["infoForjou", "o item forjado sem o poder", { oEnvelopeDaFicha: (q, d) => E(q, { ...d, poder: null }) }],
    ["infoContrato", "o contrato abandonado que ainda existe", { oEnvelopeDaFicha: (q, d) => E(q, d).replace(" — ele não existe mais para mim", "") }],
    ["infoDecreto", "o decreto retirado sem a recompensa devolvida", { oEnvelopeDaFicha: (q, d) => E(q, d).replace(" A recompensa foi devolvida.", "") }],
    ["infoAgoraE", "a parte vazia que ocupa lugar", { oEnvelopeDaFicha: (q, d) => E(q, { ...d, partes: d.partes.map((x) => x || "?") }) }],
    ["infoSaiu", "quem sai e ainda viaja", { oEnvelopeDaFicha: (q, d) => E(q, d).replace(/ Reflita isso na narrativa: .*$/, "") }],
    ["infoGuilda", "a guilda um nível acima", { oEnvelopeDaFicha: (q, d) => E(q, { ...d, nivel: d.nivel + 1 }) }],
    ["infoRecalFicha", "a recalibração sem as dádivas", { oEnvelopeDaFicha: (q, d) => E(q, { ...d, dadivas: 0 }) }],
    ["infoRecalMundo", "a recalibração do mundo que não é verdade", { oEnvelopeDaFicha: (q, d) => E(q, d).replace(" Trate os registros atuais como verdade.", "") }],
    ["infoTransferiu", "a transferência ao contrário", { oEnvelopeDaFicha: (q, d) => E(q, { ...d, de: d.para, para: d.de }) }],
  ];
  for (const [b, nome, troca] of mordidas) {
    const n = divergem(b, fotosDeHoje(b, troca));
    t(`${nome}: ${n} casos mudam`, n > 0);
  }
}

sec("15 · o mundo que anda: os casos percorrem o que o texto decide, e a prova morde");
{
  /* o festival e as partes do descanso devolvem a lista; os boatos, a nota; o reino, o envelope */
  const N = (b) => HOJE[b].flatMap((f) => (Array.isArray(f.texto) ? f.texto : [f.texto]));
  const conta = (xs, s) => xs.filter((x) => x.includes(s)).length;
  t("os dois boatos entram abaixo da nota que já havia, e cada um com a sua cauda", ["mundoRumor", "mundoRumorDeLonge"].every((b) => conta(N(b), "[NOTA] já havia\n[RUMOR] ") >= 130 && N(b).filter((x) => x.startsWith("[RUMOR] ")).length >= 130) && conta(N("mundoRumor"), "— e decida se ele é só fumaça") === 275 && conta(N("mundoRumorDeLonge"), "— e decida") === 0);
  const F = N("mundoFestival");
  t(`o festival de cada nome, em maiúsculas na marca (${conta(F, "[FESTIVAL — NOITE DAS LANTERNAS]")})`, F.length === 275 && conta(F, "[FESTIVAL — DIA DO SAL] ") >= 80 && conta(F, "[FESTIVAL — FESTA DA COLHEITA] ") >= 80 && conta(F, "é festa da colheita: ") >= 80);
  const R = HOJE.mundoReino.map((f) => f.texto);
  const linhasR = R.flatMap((x) => x.split("\n")).filter((x) => x.startsWith("[EVENTO DE REINO"));
  t(`o reino sem evento (${R.filter((x) => !x.includes("[EVENTO DE REINO")).length}), com um e com dois, e o correio do dia atrás`, R.filter((x) => !x.includes("[EVENTO DE REINO")).length >= 80 && R.filter((x) => x.split("[EVENTO DE REINO").length === 3).length >= 80 && conta(R, "\n[CORREIO] a\n[CORREIO] b") >= 80 && R.filter((x) => x === "").length >= 20);
  t(`cada delta com o sinal (${conta(linhasR, "felicidade -8")} negativos), e o zero não ocupa lugar`, conta(linhasR, "felicidade +5") >= 40 && conta(linhasR, "felicidade -8") >= 40 && conta(linhasR, "população -12") >= 40 && conta(linhasR, "cofre +40") >= 30 && linhasR.every((x) => !/(felicidade|população|cofre) \+?0\b/.test(x) && !x.includes(", ,") && !x.includes("(, ")) && conta(linhasR, "sistema () —") >= 5);
  t(`o povo à beira da revolta (${conta(linhasR, "à beira da revolta")}) e não`, conta(linhasR, ". ATENÇÃO: o povo está à beira da revolta") >= 40 && linhasR.filter((x) => x.endsWith("narre como vida do reino.")).length >= 100);
  const Q = N("mundoLocalExpirado");
  t(`nenhum, um e dois fios expirados (${Q.length} linhas em 275 casos)`, HOJE.mundoLocalExpirado.filter((f) => f.texto.length === 0).length >= 80 && HOJE.mundoLocalExpirado.filter((f) => f.texto.length === 2).length >= 80);
  const G = N("mundoGlobalAvancou");
  t("a etapa do arco que escalou é a de cada degrau, contada de 1", conta(G, "· ETAPA 1/3] A situação regional ESCALOU: os campeões chegam ") >= 80 && conta(G, "· ETAPA 3/3] A situação regional ESCALOU: a final ") >= 80 && conta(N("mundoGlobalNovo"), "ETAPA 1/2 agora: o primeiro porto fecha ") >= 120);
  const V = N("mundoDivindade");
  t(`a divindade com o lugar forte (${conta(V, ", forte em o Vau.")}) e sem, de cada grau`, conta(V, ", forte em o Vau.") >= 80 && V.filter((x) => !x.includes("forte em")).length >= 170 && [3, 7, 12, 18].every((g) => conta(V, "— GD " + g + " (") >= 60));
  t("a quest de cada fase do arco, e o fio local com o dia em que expira", ["abertura", "meio", "climax"].every((f) => conta(N("mundoQuest"), "[QUEST GERADA PELO SISTEMA — fase \"" + f + "\" do arco]") >= 90) && conta(N("mundoLocalNovo"), "até o dia 11, o fio") >= 25);
  t("as onze formas estão na tabela do mundo", Object.keys(ENVELOPES_DO_MUNDO).length === 11 && ["festival", "rumor", "rumorDeLonge", "eventoDeReino", "globalNovo", "globalAvancou", "localNovo", "localExpirado", "questGerada", "divindadeSeRevela", "eventoDivino"].every((q) => Object.hasOwn(ENVELOPES_DO_MUNDO, q)));
  const E = oEnvelopeDoMundo;
  const mordidas = [
    ["mundoFestival", "o festival com a descrição no lugar do nome", { oEnvelopeDoMundo: (q, d) => E(q, { ...d, nome: d.descricao }) }],
    ["mundoRumor", "o boato do dia com a cauda do de longe", { oEnvelopeDoMundo: (q, d) => E("rumorDeLonge", d) }],
    ["mundoRumorDeLonge", "o boato de longe com a cauda do do dia", { oEnvelopeDoMundo: (q, d) => E("rumor", d) }],
    ["mundoReino", "o reino que perde o sinal da felicidade", { oEnvelopeDoMundo: (q, d) => E(q, { ...d, felDelta: Math.abs(d.felDelta || 0) }) }],
    ["mundoReino", "o reino que esquece a revolta", { oEnvelopeDoMundo: (q, d) => E(q, { ...d, soSeInfeliz: false }) }],
    ["mundoGlobalNovo", "o arco global que começa na 2.ª etapa", { oEnvelopeDoMundo: (q, d) => E(q, { ...d, etapas: d.etapas.slice(1).concat("?") }) }],
    ["mundoGlobalAvancou", "a etapa que escalou contada de 0", { oEnvelopeDoMundo: (q, d) => E(q, { ...d, etapa: d.etapa - 1 }) }],
    ["mundoLocalNovo", "o fio local sem o dia em que expira", { oEnvelopeDoMundo: (q, d) => E(q, d).replace(/ O jogador pode ignorar.*$/, "") }],
    ["mundoLocalExpirado", "o fio expirado que se resolveu com o herói", { oEnvelopeDoMundo: (q, d) => E(q, d).replace(" SEM a minha intervenção", "") }],
    ["mundoQuest", "a quest da fase errada", { oEnvelopeDoMundo: (q, d) => E(q, { ...d, fase: "abertura" }) }],
    ["mundoDivindade", "a divindade sem o lugar forte", { oEnvelopeDoMundo: (q, d) => E(q, { ...d, lugar: undefined }) }],
    ["mundoEventoDivino", "o evento divino sem o gancho", { oEnvelopeDoMundo: (q, d) => E(q, { ...d, gancho: "" }) }],
  ];
  for (const [b, nome, troca] of mordidas) {
    const n = divergem(b, fotosDeHoje(b, troca));
    t(`${nome}: ${n} casos mudam`, n > 0);
  }
}

sec("16 · os poderes: os casos percorrem o que o texto decide, e a prova morde");
{
  /* as quatro notas de objeto e as do turno devolvem o texto; o milagre, o despertar, as magias e as habilidades, o que se enviou */
  const N = (b) => HOJE[b].flatMap((f) => (Array.isArray(f.texto) ? f.texto.map((e) => (Array.isArray(e) ? e[0] : e)) : [f.texto]));
  const conta = (xs, s) => xs.filter((x) => x.includes(s)).length;
  const NOTAS = ["poderMilagreComo", "poderIdentificarNota", "poderLocalizarNota", "poderEncerradasAoVencer", "poderEncerradasNaFuga", "poderEncerradaNoRevide"];
  t("as notas do turno entram abaixo da que já havia", NOTAS.every((b) => conta(N(b), "[NOTA] já havia\n[") >= 130 && N(b).filter((x) => /^\[[A-ZÀ-Ú]/.test(x)).length >= 130));
  const I = N("poderInvocacao");
  t(`a invocação de uma criatura (${conta(I, "É uma criatura")}) e de duas (${conta(I, "Elas são criaturas")})`, conta(I, "trouxe Lobo Espectral: ") >= 120 && conta(I, "trouxe Lobo Espectral, Corvo de Cinza: ") >= 120 && conta(I, "o turno dela.") >= 120 && conta(I, "não as fira e não as desfaça") >= 120);
  const E2 = N("poderEfeito");
  t(`o efeito em mim e no grupo, e o bônus só do que é físico (${conta(E2, "o que é físico")}) ou mágico (${conta(E2, "o que é mágico")})`, conta(E2, "deixou eu e meu grupo ") >= 80 && conta(E2, "deixou eu ") >= 170 && conta(E2, "o que é físico") >= 20 && conta(E2, "o que é mágico") >= 20 && E2.filter((x) => !x.includes("bônus de dano")).length >= 150);
  const L = N("poderLocalizarNota");
  t(`o localizar dentro (${conta(L, "A magia apontou: ")}) e fora do alcance, pelo alcance dito e pelo raio`, conta(L, "A magia apontou: ") >= 120 && conta(L, "que é de 5000 m.") >= 30 && conta(L, "que é de 3000 m.") >= 20 && conta(L, "que é de 8000 m.") >= 20);
  t("o identificar diz o alvo pelo nome e pelo item", conta(N("poderIdentificarNota"), "a ficha exata de \"Lâmina de Osso\"") >= 130 && conta(N("poderIdentificar"), "sobre Anel da Brasa. ") >= 130);
  const H = N("poderHabilidades"), H1 = N("poderHabilidade");
  t(`as habilidades resolvidas (${conta(H, "[HABILIDADES — RESOLVIDAS")}) e declaradas (${conta(H, "[HABILIDADES] ")}), com o que veio depois e a cauda de tempo`, conta(H, "[HABILIDADES — RESOLVIDAS PELO SISTEMA]") >= 170 && conta(H, "[HABILIDADES] ") >= 80 && conta(H, " O lobo ataca e erra.") >= 100 && conta(H, "passaram 6 segundos.") >= 30);
  t(`a habilidade resolvida (${conta(H1, "[HABILIDADE — RESOLVIDA")}) e declarada, com e sem descrição`, conta(H1, "[HABILIDADE — RESOLVIDA PELO SISTEMA]") >= 120 && conta(H1, "[HABILIDADE] ") >= 120 && conta(H1, "PM). cura 1d8 Ação:") >= 20 && conta(H1, "PM).  Ação:") >= 40);
  t("as invocações que se desfazem, uma e várias", ["poderEncerradasAoVencer", "poderEncerradasNaFuga"].every((b) => conta(N(b), "se desfizeram. Não as mencione") >= 120 && conta(N(b), "se desfez. Não a mencione") >= 120) && conta(N("poderEncerradaNoRevide"), "elas não estão mais no campo, e não voltam.") >= 120);
  t("as dezoito formas estão na tabela dos poderes", Object.keys(ENVELOPES_DOS_PODERES).length === 18);
  const P = oEnvelopeDosPoderes;
  const mordidas = [
    ["poderInvocacao", "a invocação que conta as criaturas ao contrário", { oEnvelopeDosPoderes: (q, d) => P(q, { ...d, um: !d.um }) }],
    ["poderSacrificio", "o sacrifício que devolve um PM a mais", { oEnvelopeDosPoderes: (q, d) => P(q, { ...d, pm: d.pm + 1 }) }],
    ["poderMetamagia", "a metamagia com o rótulo no lugar do que diz", { oEnvelopeDosPoderes: (q, d) => P(q, { ...d, diz: d.rotulo }) }],
    ["poderEfeito", "o efeito que esquece que o bônus soma no golpe", { oEnvelopeDosPoderes: (q, d) => P(q, { ...d, somaNoGolpe: false }) }],
    ["poderMilagreComo", "a forma do milagre sem o como", { oEnvelopeDosPoderes: (q, d) => P(q, { ...d, comoUso: "" }) }],
    ["poderMilagre", "o milagre sem o escopo do turno", { oEnvelopeDosPoderes: (q, d) => P(q, d).replace(SO_ISSO, "") }],
    ["poderDespertar", "o despertar com o nível no lugar dos fiéis", { oEnvelopeDosPoderes: (q, d) => P(q, { ...d, fieis: d.nivel }) }],
    ["poderIdentificarNota", "o identificar que não diz o alvo", { oEnvelopeDosPoderes: (q, d) => P(q, { ...d, alvo: "?" }) }],
    ["poderIdentificar", "o identificar sem a frase do jogador", { oEnvelopeDosPoderes: (q, d) => P(q, { ...d, acao: "" }) }],
    ["poderLocalizarSem", "o localizar sem o motivo do silêncio", { oEnvelopeDosPoderes: (q, d) => P(q, { ...d, motivo: "" }) }],
    ["poderLocalizarNota", "o alcance trocado (dentro por fora)", { oEnvelopeDosPoderes: (q, d) => P(q, { ...d, dentro: !d.dentro }) }],
    ["poderLocalizar", "o localizar sem o nome da magia", { oEnvelopeDosPoderes: (q, d) => P(q, { ...d, magia: "" }) }],
    ["poderHabilidades", "as habilidades resolvidas sem o que veio depois", { oEnvelopeDosPoderes: (q, d) => P(q, q === "habilidadesResolvidas" ? { ...d, depois: "" } : d) }],
    ["poderHabilidades", "as declaradas sem a cauda de tempo", { oEnvelopeDosPoderes: (q, d) => P(q, q === "habilidadesDeclaradas" ? { ...d, extraTempo: "" } : d) }],
    ["poderHabilidade", "a resolvida que diz o custo errado", { oEnvelopeDosPoderes: (q, d) => P(q, q === "habilidadeResolvida" ? { ...d, custo: d.custo + 1 } : d) }],
    ["poderHabilidade", "a declarada sem a descrição", { oEnvelopeDosPoderes: (q, d) => P(q, q === "habilidadeDeclarada" ? { ...d, descricao: "" } : d) }],
    ["poderEncerradasAoVencer", "o fim da luta que só desfaz a primeira", { oEnvelopeDosPoderes: (q, d) => P(q, { ...d, sumiram: d.sumiram.slice(0, 1) }) }],
    ["poderEncerradasNaFuga", "a fuga que só desfaz a primeira", { oEnvelopeDosPoderes: (q, d) => P(q, { ...d, sumiram: d.sumiram.slice(0, 1) }) }],
    ["poderEncerradaNoRevide", "o prazo que só desfaz a primeira", { oEnvelopeDosPoderes: (q, d) => P(q, { ...d, sumiram: d.sumiram.slice(0, 1) }) }],
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
