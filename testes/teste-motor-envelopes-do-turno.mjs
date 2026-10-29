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
   O 13.º, O MERCADO E A BOLSA: a compra, o mapa comprado, a pechincha, a
   venda, o consumível usado e a peça equipada sem treino.
   O 14.º, O DOMÍNIO: o decreto aceito e os três desfechos com que ele volta,
   o imposto, as duas obras, o governador, a revolta, a reivindicação e o
   tratado.
   O 15.º, O TEMPO E A NOITE: o clima que vira ao passar o tempo e durante a
   noite, o sonho e o onde acordo.
   O 16.º, A FÉ E AS CASAS: o ingresso numa guilda e a guilda fundada, a fé
   que muda de cidade, o templo erguido e a ascensão recalibrada.
   O 17.º, O CAMINHO: o regresso às ruas, o deslocamento no tabuleiro, a
   chegada ao fim da estrada e o destino que o mapa não tem.
   E DO 17.º, A MASMORRA QUE FALTAVA: a entrada e a armadilha que se sofreu,
   na tabela da masmorra.
   O 18.º, A GENTE E A HISTÓRIA: o companheiro que foi embora, a missão
   perdida, a relação formal e a que o meu jeito mudou, e o arco novo.
   O 19.º, O TURNO DO JOGADOR: a pergunta ao Mestre no meio da luta, a frase
   que o descanso já resolveu e o teste que eu rolei.
   O 20.º, AS MAGIAS DE FUNÇÃO: reviver, a cura, a condição desfeita e a
   magia que fica ativa por turnos, na tabela dos poderes.
   O 21.º, O CORPO NA LUTA: o revide, o fogo amigo, o ritual, as duas caudas
   da retirada, a vitória, as três vezes que o corpo não caiu, o golpe
   aguentado, a queda de altura e a raid que acabou.
   O 22.º, O DESFECHO DAS HABILIDADES: a linha de cada alvo dentro de
   [HABILIDADES — RESOLVIDAS] — o golpe, a geminada, a área, o meu grupo na
   minha área, a condição, a drenagem, o imune, o erro, a colheita e a
   execução, com os [CAIU…] que eram a última voz do Mestre no App.
   ============================================================ */
import fs from "node:fs";
import { N_CASOS } from "./combate-casos.mjs";
import { recorteDosEnvelopes, blocoComoFuncao, correrOBloco, fotoDoEnvelope, fotoGuardada, douradoGuardado, douradoLido, AMOSTRA, casosDosEnvelopes, BLOCOS } from "./envelopes-bloco.mjs";
import { oRodapeDoTurno, aCabecaDoRodape, aFormaDaqui, ORDEM_DO_RODAPE, RODAPE_DO_SISTEMA, A_FORMA_DAQUI, SO_ISSO, ENVELOPES_DA_MASMORRA, oEnvelopeDaMasmorra, ENVELOPES_DO_CORREIO, oEnvelopeDoCorreio, ENVELOPES_DO_ACAMPAMENTO, oEnvelopeDoAcampamento, ENVELOPES_DA_ABERTURA, oEnvelopeDaAbertura, ENVELOPES_DA_VIAGEM, oEnvelopeDaViagem, ENVELOPES_DO_FIO, oEnvelopeDoFio, ENVELOPES_DA_FICHA, oEnvelopeDaFicha, ENVELOPES_DO_MUNDO, oEnvelopeDoMundo, ENVELOPES_DOS_PODERES, oEnvelopeDosPoderes, ENVELOPES_DO_MERCADO, oEnvelopeDoMercado, ENVELOPES_DO_DOMINIO, oEnvelopeDoDominio, ENVELOPES_DO_TEMPO, oEnvelopeDoTempo, ENVELOPES_DA_FE, oEnvelopeDaFe, ENVELOPES_DO_CAMINHO, oEnvelopeDoCaminho, ENVELOPES_DA_GENTE, oEnvelopeDaGente, ENVELOPES_DO_JOGADOR, oEnvelopeDoJogador, ENVELOPES_DO_CORPO, oEnvelopeDoCorpo, ENVELOPES_DO_DESFECHO, oEnvelopeDoDesfecho } from "../src/motor/envelopes-do-turno.js";
import { formaDaCidade } from "../src/geografia.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
/* o arquivo guarda cada sítio em dicionário (ver douradoGuardado); D é o que
   ele guardava antes — a foto de cada caso —, e é contra isso que tudo compara */
const GUARDADO = JSON.parse(fs.readFileSync(new URL("./envelopes-dourado.json", import.meta.url), "utf8"));
const D = { ...GUARDADO, blocos: Object.fromEntries(Object.entries(GUARDADO.blocos).map(([b, g]) => [b, douradoLido(g)])) };
const APP = fs.readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8").replace(/\r\n/g, "\n");
const igual = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const casos = casosDosEnvelopes(N_CASOS);
/* (trilha A, 29/10) DOIS SÍTIOS MUDARAM-SE COM A PAUTA. O interlúdio do torneio
   (fioInterludio) morava no corpo de `pautaDoTurno`, e a nota do companheiro
   que vai embora (genteCompanheiro) em `aliadoVaiEmbora`, que só a pauta
   chamava; as duas saíram do App para src/motor/pauta-do-turno.js, à letra.
   Já não há o que recortar do App de hoje, e o texto do motor não se lê
   (teste-assercoes-de-texto) — o mesmo código está provado lá, byte a byte
   contra o recorte do App, em teste-motor-pauta-do-turno.mjs (275 casos; o
   aliado que vai embora em 5, com a nota nos refs do fim). O dourado dos dois
   fica (o lado de ANTES continua a gerá-lo); o lado de HOJE corre os outros. */
const NA_PAUTA_DO_MOTOR = ["fioInterludio", "genteCompanheiro"];
/* (trilha A, 29/10, o pedido no motor) o RODAPÉ foi pelo mesmo caminho: o
   sítio era o trecho de `enviar` da pauta ao system, que é hoje
   src/motor/pedido-do-turno.js, à letra — provado byte a byte contra o recorte
   do App (o rodapé inteiro dentro do pedido à rede, e a mordida «o rodapé à
   meia-noite») em teste-motor-pedido-do-turno.mjs, 275 casos. O dourado dele
   fica; o lado de HOJE já não tem o que recortar. */
const NO_PEDIDO_DO_MOTOR = ["rodape"];
/* (trilha A, 29/10, o prelúdio no motor) SEIS SÍTIOS FORAM COM O PRELÚDIO
   (viagemEmboscada, fioMarco, fioRumores, fioMundo, fioVirada, caminhoChegada:
   o porquê e as funções em envelopes-bloco.mjs, SITIOS_DO_PRELUDIO). Ao
   contrário dos três de cima, o lado de HOJE continua a corrê-los: o sítio
   vem do texto guardado do App de 374ddca, e as formas das tabelas da viagem,
   do fio e do caminho seguem cobertas e mordidas aqui. */
const BLOCOS_DE_HOJE = BLOCOS.filter((b) => !NA_PAUTA_DO_MOTOR.includes(b) && !NO_PEDIDO_DO_MOTOR.includes(b));
const recorte = Object.assign({}, ...BLOCOS_DE_HOJE.map((b) => recorteDosEnvelopes(APP, { novo: true, so: b })));
const hoje = Object.fromEntries(BLOCOS_DE_HOJE.map((b) => [b, blocoComoFuncao(recorte[b])]));
const fotosDeHoje = (bloco, troca) => casos.map((k) => fotoDoEnvelope(correrOBloco(hoje[bloco], k, { novo: true, troca, bloco })));
/* o dourado guarda o hash e o comprimento (o texto só na amostra): as fotos de
   hoje passam pela mesma fotoGuardada antes de comparar */
const guardadas = (novas) => novas.map((f, i) => fotoGuardada(f, i));
const divergem = (bloco, novas) => guardadas(novas).filter((f, i) => !igual(f, D.blocos[bloco][i])).length;
/* as fotos de hoje com o texto inteiro, uma vez por sítio. As secções que contam
   o que os casos percorrem leem-nas a ELAS (o dourado já não traz o texto): é o
   mesmo texto, porque a secção 1 prova caso a caso que o hash e o comprimento de
   hoje são os de antes */
const HOJE = Object.fromEntries(BLOCOS_DE_HOJE.map((b) => [b, fotosDeHoje(b)]));

sec("1 · cada grupo, byte a byte contra o App de antes");
{
  const { SITIOS_DO_PRELUDIO } = await import("./envelopes-bloco.mjs");
  const guardados = Object.keys(SITIOS_DO_PRELUDIO.sitios);
  const voltaram = guardados.filter((b) => APP.includes(SITIOS_DO_PRELUDIO.sitios[b]));
  t(`os ${guardados.length} sítios guardados do prelúdio (${SITIOS_DO_PRELUDIO.commit}) já não estão no App${voltaram.length ? " — voltaram: " + voltaram.join(", ") : ""}`, guardados.length === 6 && voltaram.length === 0);
  /* e o da missão perdida, que foi com o conferente (SITIOS_DO_DEPOIS) */
  const { SITIOS_DO_DEPOIS } = await import("./envelopes-bloco.mjs");
  const doDepois = Object.keys(SITIOS_DO_DEPOIS.sitios);
  const voltou = doDepois.filter((b) => APP.includes(SITIOS_DO_DEPOIS.sitios[b]));
  t(`o sítio guardado do conferente (${SITIOS_DO_DEPOIS.commit}) já não está no App${voltou.length ? " — voltou: " + voltou.join(", ") : ""}`, doDepois.length === 1 && voltou.length === 0);
}
t(`o dourado tem ${N_CASOS} casos em cada grupo, e o commit de antes de cada um`, BLOCOS.every((b) => (D.blocos[b] || []).length === N_CASOS && D.antes[b]));
t(`o dourado guarda o hash e o comprimento de cada caso, e o texto só nos ${AMOSTRA} primeiros`, BLOCOS.every((b) => D.blocos[b].every((f, i) => /^[0-9a-f]{32}$/.test(f.h) && Number.isInteger(f.n) && ("texto" in f) === (i < AMOSTRA))));
t("o dicionário de cada sítio: cada foto distinta uma vez só, todas usadas, e guardar o lido devolve o guardado", BLOCOS.every((b) => { const g = GUARDADO.blocos[b]; const vistos = new Set(g.caso); return new Set(g.fotos.map((f) => JSON.stringify(f))).size === g.fotos.length && vistos.size === g.fotos.length && JSON.stringify(douradoGuardado(D.blocos[b])) === JSON.stringify(g); }));
for (const bloco of BLOCOS_DE_HOJE) {
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

/* retirada (trilha A, 29/10): a secção 2, «o rodapé: os casos percorrem o que o
   texto decide» (a noite e o dia, quem despertou, a forma daqui, o tabuleiro só
   na luta, o calou do onde se procura, as peças vazias), contava sobre as fotos
   de HOJE do rodapé, e o sítio mudou-se com o pedido para o motor
   (NO_PEDIDO_DO_MOTOR, acima): o mesmo texto vai inteiro no pedido à rede que
   teste-motor-pedido-do-turno.mjs compara byte a byte; as peças continuam
   provadas direto na secção 3. */

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

/* retirada (trilha A, 29/10): a secção 4, «a prova morde» — seis mordidas das
   peças do rodapé (a ordem trocada, a peça vazia com linha, o espaço da
   ascensão, a noite, a água e o aperto da forma) dentro do sítio de HOJE do
   App; o sítio mudou-se com o pedido para o motor (NO_PEDIDO_DO_MOTOR, acima).
   O que as mordidas guardavam — que o rodapé é o das peças, na ordem da tabela
   — guardam-no a secção 3 (as 25 peças na ordem, sem peças só a cabeça, a forma
   da aldeia) e o pedido byte a byte da suíte do pedido. */

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
  /* 7 → 9 (29/10, 17.º grupo): a entrada e a armadilha que se sofreu eram da masmorra e
     nenhum inventário as viu; entraram nesta tabela, e a secção 22 prova-as */
  t("a forma de cada envelope está na tabela, e a que não está estoura", /* 9 → 10 em 29/10: a tabela ganhou oQueDaArmadilha, o sujeito da salvaguarda que saiu do App (secção 28) */ Object.keys(ENVELOPES_DA_MASMORRA).length === 10 && (() => { try { oEnvelopeDaMasmorra("nenhuma", {}); return false; } catch { return true; } })());
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
  /* movida (29/10/2026, o «nA»): pedia "EU CONTINUO EM O MOINHO VELHO", o defeito à letra; o
     conserto declarado contrai o artigo do lugar ("NO MOINHO VELHO") */
  t(`passar o tempo dentro de um lugar (${conta(P, "EU CONTINUO ")}) e fora, com o clima (${conta(P, "[CLIMA]")}) e o reino (${conta(P, "[REINO]")}) cheios e vazios`,
    conta(P, "EU CONTINUO NO MOINHO VELHO") >= 20 && conta(P, "EU CONTINUO ") < N_CASOS && !P.some((x) => /EU CONTINUO EM (O|A|OS|AS) /.test(x)) && ["[CLIMA]", "[REINO]"].every((s) => conta(P, s) >= 60 && conta(P, s) < N_CASOS));
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
  /* retirada (trilha A, 29/10): «o interlúdio entra na pauta como momento» — o sítio mudou-se com a pauta para o motor (ver NA_PAUTA_DO_MOTOR, acima) */
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
    /* (trilha A, 29/10) sem a mordida do interlúdio: o sítio mudou-se com a pauta para o motor (NA_PAUTA_DO_MOTOR) */
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
  /* movida (29/10/2026, o «nA»): pedia ", forte em o Vau.", o defeito à letra; o conserto
     declarado contrai o artigo do lugar (", forte no Vau.") */
  t(`a divindade com o lugar forte (${conta(V, ", forte no Vau.")}) e sem, de cada grau`, conta(V, ", forte no Vau.") >= 80 && V.filter((x) => !/, forte (em|no|na|nos|nas) /.test(x)).length >= 170 && [3, 7, 12, 18].every((g) => conta(V, "— GD " + g + " (") >= 60));
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
  /* 18 → 22 (29/10, 20.º grupo): as quatro magias de função que ficaram no App (reviver, a
     cura, a condição desfeita, a magia ativa) entraram nesta tabela, onde já moravam o
     identificar e o localizar; a secção 25 prova-as */
  t("as vinte e duas formas estão na tabela dos poderes", Object.keys(ENVELOPES_DOS_PODERES).length === 22);
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

sec("17 · o mercado e a bolsa: os casos percorrem o que o texto decide, e a prova morde");
{
  /* as seis são notas do turno: o sítio devolve a nota */
  const N = (b) => HOJE[b].map((f) => f.texto);
  const conta = (xs, s) => xs.filter((x) => x.includes(s)).length;
  const MERCADO = ["mercadoEquipou", "mercadoConsumivel", "mercadoMapa", "mercadoCompra", "mercadoPechincha", "mercadoVenda"];
  t("as seis notas entram abaixo da que já havia", MERCADO.every((b) => conta(N(b), "[NOTA] já havia\n[") >= 130 && N(b).filter((x) => /^\[[A-ZÀ-Ú]/.test(x)).length >= 130));
  const E = N("mercadoEquipou");
  t("a peça sem treino com uma penalidade (" + conta(E, ": desvantagem em Furtividade.") + ") e com duas, ditas em fila", conta(E, ": desvantagem em Furtividade. É fato") >= 120 && conta(E, ": -2 no ataque; sem magia. É fato") >= 120);
  const C = N("mercadoConsumivel");
  t("o consumível em paz e na luta (" + conta(C, "Abrir a bolsa NÃO gastou meu turno") + "), e o recibo sem o ícone da frente", conta(C, "Abrir a bolsa NÃO gastou meu turno") >= 120 && C.filter((x) => !x.includes("Abrir a bolsa")).length >= 120 && conta(C, ". recuperei 8 PV. O número") >= 60 && C.every((x) => !x.includes("🧪") && !x.includes("✨")));
  const M = N("mercadoMapa");
  t("o mapa que não abre nada (" + M.filter((x) => !x.includes("Agora conheço")).length + "), um lugar e dois", M.filter((x) => !x.includes("Agora conheço")).length >= 80 && conta(M, " Agora conheço Vau — pode falar") >= 80 && conta(M, " Agora conheço Vau, Porto Sal — pode falar") >= 80);
  t("a compra e a venda dizem o preço de cada caso", conta(N("mercadoCompra"), "de Ondine, a cartógrafa por ◉ ") >= 120 && N("mercadoVenda").every((x, i) => x.includes("por ◉ " + (1 + (i % 17)) + ". O item saiu")));
  t("a pechincha que baixa e a que não", conta(N("mercadoPechincha"), "e ele baixou o preço para ◉ 9. Narre") >= 60 && conta(N("mercadoPechincha"), "e ele não cedeu um cobre. Narre") >= 60);
  t("as seis formas estão na tabela do mercado", Object.keys(ENVELOPES_DO_MERCADO).length === 6 && ["equipouSemTreino", "consumivel", "mapaComprado", "compra", "pechincha", "venda"].every((q) => Object.hasOwn(ENVELOPES_DO_MERCADO, q)));
  const P = oEnvelopeDoMercado;
  const mordidas = [
    ["mercadoEquipou", "a peça que só diz a primeira penalidade", { oEnvelopeDoMercado: (q, d) => P(q, { ...d, penalidades: d.penalidades.slice(0, 1) }) }],
    ["mercadoConsumivel", "o consumível que esquece a luta", { oEnvelopeDoMercado: (q, d) => P(q, { ...d, comb: null }) }],
    ["mercadoMapa", "o mapa que não diz o que abriu", { oEnvelopeDoMercado: (q, d) => P(q, { ...d, novas: [] }) }],
    ["mercadoCompra", "a compra com o vendedor no lugar do item", { oEnvelopeDoMercado: (q, d) => P(q, { ...d, item: d.vendedor }) }],
    ["mercadoPechincha", "a pechincha sem o desfecho", { oEnvelopeDoMercado: (q, d) => P(q, { ...d, desfecho: "?" }) }],
    ["mercadoVenda", "a venda de um cobre a mais", { oEnvelopeDoMercado: (q, d) => P(q, { ...d, valor: d.valor + 1 }) }],
  ];
  for (const [b, nome, troca] of mordidas) {
    const n = divergem(b, fotosDeHoje(b, troca));
    t(nome + ": " + n + " casos mudam", n > 0);
  }
}

sec("18 · o domínio: os casos percorrem o que o texto decide, e a prova morde");
{
  /* as onze são notas do turno: o sítio devolve a nota */
  const N = (b) => HOJE[b].map((f) => f.texto);
  const conta = (xs, s) => xs.filter((x) => x.includes(s)).length;
  const P0 = oEnvelopeDoDominio;
  const DOMINIO = ["dominioDecretoAceito", "dominioDizimado", "dominioFracasso", "dominioCumprido", "dominioObraPronta", "dominioRevolta", "dominioImposto", "dominioObraIniciada", "dominioGovernador", "dominioReivindicacao", "dominioTratado"];
  t("as onze notas entram abaixo da que já havia", DOMINIO.every((b) => conta(N(b), "[NOTA] já havia\n[") >= 130 && N(b).filter((x) => /^\[[A-ZÀ-Ú]/.test(x)).length >= 130));
  const A = N("dominioDecretoAceito");
  t("o decreto aceito pelo bando de um (" + conta(A, "(Brann, força ") + ") e de três, com a força e a recompensa retida", conta(A, "(Brann, força ") >= 120 && conta(A, "(Brann, Kael, Sef, força ") >= 120 && A.every((x, i) => x.includes("Recompensa de ◉ " + (20 + (i % 50)) + " já está retida")));
  const C = N("dominioCumprido");
  t("o cumprido sem baixas e com (" + conta(C, "CUMPRIDO COM BAIXAS]") + "), com os mortos ditos e o retorno ensanguentado", conta(C, "CUMPRIDO COM BAIXAS]") >= 80 && conta(C, "[DECRETO — DESFECHO: CUMPRIDO] ") >= 150 && conta(C, " (Kael, Sef morreram no serviço)") >= 80 && conta(C, "Narre o retorno ensanguentado") >= 150 && conta(C, "Narre o retorno triunfal") >= 80);
  t("o de mandar matar traz a represália (" + conta(C, "mandei matar alguém") + "), o de outro tipo não", conta(C, "mandei matar alguém") >= 80 && C.filter((x) => !x.includes("mandei matar")).length >= 150);
  t("os dois desfechos que devolvem a recompensa dizem o bando e o alvo", ["dominioDizimado", "dominioFracasso"].every((b) => conta(N(b), "A Garra Cinza ") >= 130 && conta(N(b), "sobre \"Mestre Ulm\"") >= 80 && conta(N(b), "A recompensa voltou ao meu bolso.") === 275));
  /* O BANDO TEM GÊNERO (29/10/2026, trilha A). Os casos do dourado só têm «Companhia do
     Sal» e «Garra Cinza», ambas no feminino — a troca não muda nenhuma foto e lá não se
     prova. Prova-se aqui, chamando as quatro formas com um nome de cada lado: com o motor
     de antes (o «A ${bando}» à letra) as duas primeiras ficam vermelhas — «A Bando do
     Javali inteira morreu», «pela Bando» —, com o de hoje verdes. A terceira guarda o
     outro lado: o feminino e o nome que a tabela não conhece dizem o que sempre disseram. */
  const dec = (bando) => ({ aceito: P0("decretoAceito", { alvo: "Mestre Ulm", bando, membros: [{ nome: "Brann" }], forca: 4, descricao: "Tragam-no.", recompensa: 30 }), dizimado: P0("decretoDizimado", { bando, alvo: "Mestre Ulm" }), fracasso: P0("decretoFracasso", { bando, alvo: "Mestre Ulm" }), cumprido: P0("decretoCumprido", { baixas: false, alvo: "Mestre Ulm", bando, mortos: [], descricao: "Tragam-no.", recompensa: 30, tipo: "limpar" }) });
  const bj = dec("Bando do Javali");
  t("o Bando do Javali no masculino: «O Bando do Javali (», «inteiro morreu», «voltou vivo, envergonhado»", bj.aceito.includes("] O Bando do Javali (Brann, força 4)") && bj.dizimado.includes("] O Bando do Javali inteiro morreu") && bj.fracasso.includes("] O Bando do Javali não conseguiu") && bj.fracasso.includes("e voltou vivo, envergonhado ("), bj.dizimado.slice(0, 90));
  t("o cumprido «pelo Bando do Javali», e nenhum «A Bando» nem «pela Bando» nas quatro", bj.cumprido.includes("foi CUMPRIDO pelo Bando do Javali.") && Object.values(bj).every((x) => !/\bA Bando\b|pela Bando|inteira morreu|viva, envergonhada/.test(x)), bj.cumprido.slice(40, 120));
  const cs = dec("Companhia do Sal"), gc = dec("Garra Cinza");
  t("e o feminino de sempre não muda: a Companhia do Sal e a Garra Cinza (que a tabela não conhece)", [[cs, "Companhia do Sal"], [gc, "Garra Cinza"]].every(([x, n]) => x.aceito.includes("] A " + n + " (Brann,") && x.dizimado.includes("] A " + n + " inteira morreu") && x.fracasso.includes("e voltou viva, envergonhada (") && x.cumprido.includes("foi CUMPRIDO pela " + n + ".")));
  /* o lado do App: a tela dos decretos (o aceito, o líder, os três desfechos, a morte do
     alvo) diz o bando pela mesma peça — nenhum «a ${grupo.bando}» de artigo fixo sobra */
  const DECRETOS_APP = APP.slice(APP.indexOf("const processarDecretos = (pers, msgs) => {"), APP.indexOf("const processarDecretos = (pers, msgs) => {") + 6000);
  t("o App diz o bando pela peça: ditosDoBando no laço, e nenhum artigo fixo à frente de grupo.bando", DECRETOS_APP.includes("const db = ditosDoBando(grupo.bando);") && !/(\b[AaO]|da|pela|do|pelo) \$\{grupo\.bando\}/.test(DECRETOS_APP));
  t("a obra iniciada diz o efeito e o prazo, e a pronta o nome", N("dominioObraIniciada").every((x, i) => x.includes(" Leva " + (4 + (i % 11)) + " dias.")) && conta(N("dominioObraIniciada"), ": +5% de fé. Leva") >= 130 && conta(N("dominioObraPronta"), "ficou pronta: a muralha.") >= 130);
  t("a revolta, a reivindicação e o tratado dizem os seus números e nomes", N("dominioRevolta").every((x, i) => x.includes("depois de " + (3 + (i % 6)) + " dias de fúria")) && conta(N("dominioReivindicacao"), "A Casa Funda reivindicou ") >= 130 && conta(N("dominioTratado"), "a Liga do Norte firmou ") >= 130);
  t("as onze formas estão na tabela do domínio", Object.keys(ENVELOPES_DO_DOMINIO).length === 11 && ["decretoAceito", "decretoDizimado", "decretoFracasso", "decretoCumprido", "obraConcluida", "revolta", "imposto", "obraIniciada", "governador", "reivindicacao", "tratado"].every((q) => Object.hasOwn(ENVELOPES_DO_DOMINIO, q)));
  const P = oEnvelopeDoDominio;
  const mordidas = [
    ["dominioDecretoAceito", "o decreto aceito que só diz o primeiro do bando", { oEnvelopeDoDominio: (q, d) => P(q, { ...d, membros: d.membros.slice(0, 1) }) }],
    ["dominioDizimado", "o dizimado com o alvo no lugar do bando", { oEnvelopeDoDominio: (q, d) => P(q, { ...d, bando: d.alvo }) }],
    ["dominioFracasso", "o fracasso que diz o desfecho do dizimado", { oEnvelopeDoDominio: (q, d) => P("decretoDizimado", d) }],
    ["dominioCumprido", "o cumprido que esquece as baixas", { oEnvelopeDoDominio: (q, d) => P(q, { ...d, baixas: false }) }],
    ["dominioCumprido", "o cumprido que esquece os mortos", { oEnvelopeDoDominio: (q, d) => P(q, { ...d, mortos: [] }) }],
    ["dominioCumprido", "o cumprido que nunca é de mandar matar", { oEnvelopeDoDominio: (q, d) => P(q, { ...d, tipo: "limpar" }) }],
    ["dominioObraPronta", "a obra pronta com a cidade no lugar da obra", { oEnvelopeDoDominio: (q, d) => P(q, { ...d, obra: d.cidade }) }],
    ["dominioRevolta", "a revolta de um dia a menos", { oEnvelopeDoDominio: (q, d) => P(q, { ...d, dias: d.dias - 1 }) }],
    ["dominioImposto", "o imposto sem o nome", { oEnvelopeDoDominio: (q, d) => P(q, { ...d, imposto: "" }) }],
    ["dominioObraIniciada", "a obra iniciada sem o efeito", { oEnvelopeDoDominio: (q, d) => P(q, { ...d, efeito: "?" }) }],
    ["dominioGovernador", "o governador de outra cidade", { oEnvelopeDoDominio: (q, d) => P(q, { ...d, cidade: "Lugar Nenhum" }) }],
    ["dominioReivindicacao", "a reivindicação de um dia a mais", { oEnvelopeDoDominio: (q, d) => P(q, { ...d, dias: d.dias + 1 }) }],
    ["dominioTratado", "o tratado sem o pacto", { oEnvelopeDoDominio: (q, d) => P(q, { ...d, pacto: "" }) }],
  ];
  for (const [b, nome, troca] of mordidas) {
    const n = divergem(b, fotosDeHoje(b, troca));
    t(nome + ": " + n + " casos mudam", n > 0);
  }
}

sec("19 · o tempo e a noite: os casos percorrem o que o texto decide, e a prova morde");
{
  /* as quatro são caudas de outro envelope: o sítio devolve a linha (ou "") */
  const N = (b) => HOJE[b].map((f) => f.texto);
  const conta = (xs, s) => xs.filter((x) => x.includes(s)).length;
  const P1 = N("tempoClimaAoPassar"), P2 = N("tempoClimaDaNoite");
  t("o clima que não virou não ocupa linha (" + P1.filter((x) => x === "").length + "), e o que virou abre com a quebra", [P1, P2].every((P) => P.filter((x) => x === "").length >= 90 && P.filter((x) => x.startsWith("\n[CLIMA] O tempo virou")).length >= 180));
  t("ao passar o tempo o clima pede a cena; na noite, não", conta(P1, "— as estradas viram lama. Use isso na cena.") >= 90 && P2.every((x) => !x.includes("Use isso na cena")) && conta(P2, "durante a noite: agora está neblina — não se vê a dez passos.") >= 90);
  const S = N("tempoSonho");
  t("o sonho sem condição (" + S.filter((x) => !x.includes("(acordei")).length + "), inspirado e perturbado", S.filter((x) => !x.includes("(acordei")).length >= 80 && conta(S, "(acordei INSPIRADO — condição já aplicada pelo sistema)") >= 80 && conta(S, "(acordei PERTURBADO — condição já aplicada pelo sistema)") >= 80 && S.every((x) => x.startsWith("\n[SONHO] O sonho desta noite: \"")));
  const O = N("tempoOndeAcordo");
  t("o onde acordo só com a jornada e sem a masmorra que cala (" + O.filter((x) => x).length + ")", O.filter((x) => x === "").length >= 130 && O.filter((x) => x.startsWith("\n[ONDE ACORDO] Eu ainda estou EM VIAGEM (em ")).length >= 100);
  t("as quatro formas estão na tabela do tempo", Object.keys(ENVELOPES_DO_TEMPO).length === 4 && ["climaAoPassar", "climaDaNoite", "sonho", "ondeAcordo"].every((q) => Object.hasOwn(ENVELOPES_DO_TEMPO, q)));
  const P = oEnvelopeDoTempo;
  const mordidas = [
    ["tempoClimaAoPassar", "o clima de passar o tempo com a cauda da noite", { oEnvelopeDoTempo: (q, d) => P("climaDaNoite", d) }],
    ["tempoClimaDaNoite", "o clima da noite com a nota no lugar do rótulo", { oEnvelopeDoTempo: (q, d) => P(q, { ...d, rotulo: d.nota }) }],
    ["tempoSonho", "o sonho que esquece a condição", { oEnvelopeDoTempo: (q, d) => P(q, { ...d, efeito: undefined }) }],
    ["tempoOndeAcordo", "o onde acordo sem o lugar", { oEnvelopeDoTempo: (q, d) => P(q, { ...d, local: "?" }) }],
  ];
  for (const [b, nome, troca] of mordidas) {
    const n = divergem(b, fotosDeHoje(b, troca));
    t(nome + ": " + n + " casos mudam", n > 0);
  }
}

sec("20 · a fé e as casas: os casos percorrem o que o texto decide, e a prova morde");
{
  /* as cinco são notas do turno: o sítio devolve a nota */
  const N = (b) => HOJE[b].map((f) => f.texto);
  const conta = (xs, s) => xs.filter((x) => x.includes(s)).length;
  const FE = ["feGuilda", "feGuildaFundada", "feNaGeografia", "feTemplo", "feAscensao"];
  t("as cinco notas entram abaixo da que já havia", FE.every((b) => conta(N(b), "[NOTA] já havia\n[") >= 130 && N(b).filter((x) => /^\[[A-ZÀ-Ú]/.test(x)).length >= 130));
  const G = N("feGuilda");
  /* movida (29/10/2026, o «nA»): pedia «Fui aceito nA Mão Cinzenta», o texto do App de antes
     à letra — era o defeito, e o dourado o guardava. O conserto foi declarado (a secção 27 e o
     gerador do dourado, que faz a mesma troca no código de lá): o artigo do nome contrai com o
     «em», e o nome sem artigo segue com o «a » de sempre ("na Casa do Sal") */
  t("a guilda: o artigo do nome contrai com o «em» (" + conta(G, "Fui aceito na Mão Cinzenta como") + "), o nome sem artigo ganha o «a », com o posto e o mestre", conta(G, "Fui aceito na Mão Cinzenta como Aprendiz.") >= 80 && !G.some((x) => x.includes("nA ")) && conta(G, "Fui aceito na Casa do Sal como Aprendiz.") >= 80 && conta(G, "Velho Brann me recebeu.") >= 130);
  const F = N("feGuildaFundada");
  t("a guilda fundada diz o nome, o ofício e a sede", conta(F, "de escribas, com sede em ") >= 130 && conta(F, "Abri a minha propria casa: Ordem da Ponte, de ") >= 80 && conta(F, ", com sede em Porto Sal.") >= 130);
  const Geo = N("feNaGeografia");
  t("a fé que subiu manda mostrar a recepção (" + conta(Geo, "mostre isso na primeira cena") + "), a que recuou fala dos rivais (" + conta(Geo, "sacerdotes rivais") + ")", conta(Geo, "daqui em diante o povo de Agulha ajoelha à passagem — mostre isso na primeira cena que se passar lá.") >= 40 && conta(Geo, "a devoção recuou em Vau — sacerdotes rivais ganharam espaço e o povo esfriou.") >= 40 && Geo.every((x, i) => x.includes("(" + (10 + (i % 80)) + "% de devoção ao herói)")));
  const Tp = N("feTemplo");
  t("o templo diz o nome em minúscula, o custo e a fé", conta(Tp, "Um grande templo em nome do herói foi construído em Torre Funda") >= 60 && Tp.every((x, i) => x.includes("pago do cofre (◉ " + (100 + 7 * (i % 30)) + ")") && x.includes("subiu para " + (5 + (i % 90)) + "%")));
  const As = N("feAscensao");
  t("a ascensão de cada grau, e o domínio e o patrono só quando há (" + conta(As, ", domínio a tempestade") + ", " + conta(As, ", patrono Ondra") + ")", new Set(As.map((x) => x.match(/GD \d \(([^)]+)\)/)[1])).size === 5 && conta(As, ", domínio a tempestade") >= 80 && As.filter((x) => !x.includes("domínio")).length >= 160 && conta(As, ", patrono Ondra") >= 130 && As.filter((x) => !x.includes("patrono")).length >= 130);
  t("as cinco formas estão na tabela da fé", Object.keys(ENVELOPES_DA_FE).length === 5 && ["guilda", "guildaFundada", "feNaGeografia", "templo", "ascensao"].every((q) => Object.hasOwn(ENVELOPES_DA_FE, q)));
  const P = oEnvelopeDaFe;
  const mordidas = [
    ["feGuilda", "a guilda com o mestre no lugar do posto", { oEnvelopeDaFe: (q, d) => P(q, { ...d, posto: d.mestre }) }],
    ["feGuildaFundada", "a guilda fundada sem a sede", { oEnvelopeDaFe: (q, d) => P(q, { ...d, sede: "?" }) }],
    ["feNaGeografia", "a fé que sempre sobe", { oEnvelopeDaFe: (q, d) => P(q, { ...d, subiu: true }) }],
    ["feTemplo", "o templo de graça", { oEnvelopeDaFe: (q, d) => P(q, { ...d, custo: 0 }) }],
    ["feAscensao", "a ascensão que esquece o patrono", { oEnvelopeDaFe: (q, d) => P(q, { ...d, patrono: null }) }],
  ];
  for (const [b, nome, troca] of mordidas) {
    const n = divergem(b, fotosDeHoje(b, troca));
    t(nome + ": " + n + " casos mudam", n > 0);
  }
}

sec("21 · o caminho: os casos percorrem o que o texto decide, e a prova morde");
{
  /* as quatro são notas do turno: o sítio devolve a nota */
  const N = (b) => HOJE[b].map((f) => f.texto);
  const conta = (xs, s) => xs.filter((x) => x.includes(s)).length;
  const CAMINHO = ["caminhoMovRegistrado", "caminhoMovResolvido", "caminhoChegada", "caminhoDestino"];
  t("as quatro notas entram abaixo da que já havia", CAMINHO.every((b) => conta(N(b), "[NOTA] já havia\n[") >= 130 && N(b).filter((x) => /^\[[A-ZÀ-Ú]/.test(x)).length >= 130));
  const R = N("caminhoMovRegistrado");
  t("o regresso diz de onde saí, com a preposição, e a cidade", conta(R, "Eu saí do moinho velho e AGORA estou de volta às ruas de ") >= 50 && conta(R, "às ruas de Agulha de Sal.") >= 130 && new Set(R.map((x) => x.match(/Eu saí (.*) e AGORA/)[1])).size >= 3);
  const M = N("caminhoMovResolvido");
  /* movida (29/10/2026, o «nA»): pedia "dentro de a praça" e "de o beco", o defeito à letra; o
     conserto declarado contrai o artigo dos lugares da cena */
  t("o deslocamento dentro do mesmo lugar (" + conta(M, "Eu me desloquei dentro da praça") + ") e de um para outro, e quem tentou me acertar (" + conta(M, "tentou me acertar na saída") + ")", conta(M, "Eu me desloquei dentro da praça") >= 50 && conta(M, "Eu me desloquei do beco para a ponte") >= 50 && conta(M, ", e o Corvo, Greta tentou me acertar na saída.") >= 80 && M.filter((x) => !x.includes("tentou me acertar")).length >= 80);
  const C = N("caminhoChegada");
  t("a chegada diz os dias e o destino", C.every((x, i) => x.includes("A estrada acabou: " + [0.5, 1, 3.5, 12][(i >> 1) % 4] + " dias de marcha") && x.includes("eu ESTOU em " + ["Vau", "Torre Funda"][i % 2] + ", dentro dela.")));
  const Dn = N("caminhoDestino");
  t("o destino que o mapa não tem: a mesma nota em todos os casos, com a regra na linha de baixo", new Set(Dn.map((x) => x.replace("[NOTA] já havia\n", ""))).size === 1 && Dn.every((x) => x.includes(" continuo exatamente onde estava.\nREGRA DESTE ENVELOPE (obrigatória): ")));
  t("as quatro formas estão na tabela do caminho", Object.keys(ENVELOPES_DO_CAMINHO).length === 4 && ["movimentoRegistrado", "movimentoResolvido", "chegada", "destinoNaoReconhecido"].every((q) => Object.hasOwn(ENVELOPES_DO_CAMINHO, q)));
  const P = oEnvelopeDoCaminho;
  const mordidas = [
    ["caminhoMovRegistrado", "o regresso sem o de onde", { oEnvelopeDoCaminho: (q, d) => P(q, { ...d, de: "?" }) }],
    ["caminhoMovResolvido", "o deslocamento que esquece quem tentou acertar", { oEnvelopeDoCaminho: (q, d) => P(q, { ...d, colados: [] }) }],
    ["caminhoChegada", "a chegada de um dia só", { oEnvelopeDoCaminho: (q, d) => P(q, { ...d, dias: 1 }) }],
    ["caminhoDestino", "o destino com a nota do regresso", { oEnvelopeDoCaminho: () => P("movimentoRegistrado", { de: "do nada", cidade: "Vau" }) }],
  ];
  for (const [b, nome, troca] of mordidas) {
    const n = divergem(b, fotosDeHoje(b, troca));
    t(nome + ": " + n + " casos mudam", n > 0);
  }
}

sec("22 · a masmorra, o que faltava: a entrada e a armadilha que se sofreu");
{
  const conta = (xs, s) => xs.filter((x) => x.includes(s)).length;
  /* a entrada devolve o envelope; a armadilha sofrida, o que enviou */
  const E = HOJE.entradaDaMasmorra.map((f) => f.texto);
  const A = HOJE.armadilhaSofridaNaMasmorra.map((f) => f.texto[0][0]);
  const nua = E.filter((x) => x.startsWith("[MASMORRA — ENTRADA")).length;
  t("a entrada com o vestido e o veredito à frente, com um só, e sem nenhum (" + nua + ")", nua >= 50 && conta(E, "[VESTIDO] Visto a cota de malha. [DIFICULDADE] a masmorra \"") >= 50 && E.filter((x) => x.startsWith("[DIFICULDADE] a masmorra \"")).length >= 50 && E.filter((x) => x.startsWith("[VESTIDO] Visto a cota de malha. [MASMORRA")).length >= 50);
  t("a planta: as câmaras, os níveis e as tochas de cada caso", E.every((x, i) => x.includes("O SISTEMA gerou a planta: " + (3 + (i % 6)) + " câmaras em ") && x.includes("Levo " + (i % 7) + " tochas")) && new Set(E.map((x) => x.match(/câmaras em (\d+) níveis/)[1])).size >= 3);
  t("perto de uma cidade só quando há (" + conta(E, " (perto de ") + "), e o tempo extra no fim", conta(E, "costurando com a cena atual (perto de Vau).") >= 80 && conta(E, "costurando com a cena atual. Mencione") >= 80 && conta(E, "escolher a passagem. [+1 tocha]") >= 180);
  t("a armadilha sofrida: a salvaguarda por cima e a sala por baixo, com e sem o depois", A.every((x) => /^\[SALVAGUARDA (passou|falhou|nenhuma)\] A armadilha \(/.test(x) && x.includes("\n[MASMORRA — ")) && conta(A, "Narre o susto e o estado em que fico. [DEPOIS]") >= 130 && conta(A, "NO ESCURO] Narre o susto") >= 130);
  t("as duas formas novas estão na tabela da masmorra", ["entrada", "armadilhaSofrida"].every((q) => Object.hasOwn(ENVELOPES_DA_MASMORRA, q)));
  const P = oEnvelopeDaMasmorra;
  const mordidas = [
    ["entradaDaMasmorra", "a entrada que esquece o veredito", { oEnvelopeDaMasmorra: (q, d) => P(q, { ...d, dificuldade: "" }) }],
    ["entradaDaMasmorra", "a entrada sem as tochas", { oEnvelopeDaMasmorra: (q, d) => P(q, { ...d, tochas: 0 }) }],
    ["armadilhaSofridaNaMasmorra", "a armadilha sem a salvaguarda", { oEnvelopeDaMasmorra: (q, d) => P(q, { ...d, salvaguarda: "" }) }],
  ];
  for (const [b, nome, troca] of mordidas) {
    const n = divergem(b, fotosDeHoje(b, troca));
    t(nome + ": " + n + " casos mudam", n > 0);
  }
}

sec("23 · a gente e a história: os casos percorrem o que o texto decide, e a prova morde");
{
  /* quatro são notas do turno (o sítio devolve a nota); a relação mudada é a cauda do env */
  const N = (b) => HOJE[b].map((f) => f.texto);
  const conta = (xs, s) => xs.filter((x) => x.includes(s)).length;
  /* (trilha A, 29/10) três notas: a do companheiro mudou-se com a pauta para o motor (NA_PAUTA_DO_MOTOR) */
  const NOTAS = ["genteMissaoPerdida", "genteRelacaoFormal", "genteNovoArco"];
  t("as quatro notas entram abaixo da que já havia", NOTAS.every((b) => conta(N(b), "[NOTA] já havia\n[") >= 130 && N(b).filter((x) => /^\[[A-ZÀ-Ú]/.test(x)).length >= 130));
  /* retirada (trilha A, 29/10): «quem foi embora, nas duas vezes que a nota o diz» — o sítio mudou-se com a pauta para o motor (NA_PAUTA_DO_MOTOR) */
  const M = N("genteMissaoPerdida");
  t("a missão perdida diz o título entre aspas e o motivo", conta(M, "\"O selo de Vau\" fracassou: o refém morreu.") >= 60 && conta(M, "\"Resgatar a filha do moleiro\" fracassou: o prazo venceu.") >= 60 && M.every((x) => x.includes("nao ofereca uma segunda chance")));
  const F = N("genteRelacaoFormal");
  t("a relação formal em maiúscula, e o cônjuge só quando é (" + conta(F, " — CÔNJUGE: somos casados") + ")", conta(F, "minha relação com Bruna Voss é CÔNJUGE — CÔNJUGE: somos casados") >= 40 && conta(F, " é ALIADA. Registre no cânone") >= 80 && conta(F, " é RIVAL. Registre no cânone") >= 80 && conta(F, " — CÔNJUGE: somos casados") <= 100);
  const R = N("genteRelacaoMudada");
  t("a relação mudada é a cauda do env, numa linha abaixo, com o rótulo em maiúscula", R.every((x) => /^\[PERÍCIA — RESOLVIDA PELO SISTEMA\] [^\n]+\n\[RELAÇÃO — MUDADA PELO SISTEMA\] /.test(x)) && conta(R, "o taberneiro agora me vê como DESCONFIADO.") >= 30 && new Set(R.map((x) => x.match(/me vê como ([A-Z]+)\./)[1])).size === 3);
  const A = N("genteNovoArco");
  t("o arco novo diz o nome e a direção da 1.ª etapa", conta(A, "[NOVO ARCO ESCOLHIDO PELO JOGADOR: Os Cinco Atos] NÃO reinicie o mundo") >= 130 && conta(A, "Direção do momento em que ele recomeça: Abra com a perda. Trabalhe com") >= 130);
  t("as cinco formas estão na tabela da gente", Object.keys(ENVELOPES_DA_GENTE).length === 5 && ["companheiroFoiEmbora", "missaoPerdida", "relacaoFormal", "relacaoMudada", "novoArco"].every((q) => Object.hasOwn(ENVELOPES_DA_GENTE, q)));
  const P = oEnvelopeDaGente;
  const mordidas = [
    /* (trilha A, 29/10) sem a mordida do companheiro: o sítio mudou-se com a pauta para o motor (NA_PAUTA_DO_MOTOR) */
    ["genteMissaoPerdida", "a missão perdida sem o motivo", { oEnvelopeDaGente: (q, d) => P(q, { ...d, motivo: "" }) }],
    ["genteRelacaoFormal", "a relação formal que casa todo mundo", { oEnvelopeDaGente: (q, d) => P(q, { ...d, relacao: "conjuge" }) }],
    ["genteRelacaoMudada", "a relação mudada que esquece o rótulo", { oEnvelopeDaGente: (q, d) => P(q, { ...d, rotulo: "Aliado" }) }],
    ["genteNovoArco", "o arco novo sem a direção", { oEnvelopeDaGente: (q, d) => P(q, { ...d, instrucao: "" }) }],
  ];
  for (const [b, nome, troca] of mordidas) {
    const n = divergem(b, fotosDeHoje(b, troca));
    t(nome + ": " + n + " casos mudam", n > 0);
  }
}

sec("24 · o turno do jogador: os casos percorrem o que o texto decide, e a prova morde");
{
  const conta = (xs, s) => xs.filter((x) => x.includes(s)).length;
  /* a pergunta e a rolagem devolvem o que enviaram; o que escrevi, a nota */
  const Pg = HOJE.vezPergunta.map((f) => f.texto[0]);
  t("a pergunta: a minha frase à frente, o aviso atrás, e vai para a ficha viva quando há (" + Pg.filter((x) => x[1] === "Vera viva").length + ")", Pg.every((x, i) => x[0] === ["Quem está mais perto de mim?", "o \"chefe\" ainda respira?", "dormir até o sol nascer"][i % 3] + " [PERGUNTA AO MESTRE — não é ação: a vez continua minha e ninguém se move; responda pelo que o tabuleiro diz]") && Pg.filter((x) => x[1] === "Vera viva").length >= 150 && Pg.filter((x) => x[1] === "Vera do render").length >= 60);
  const E = HOJE.vezEscrevi.map((f) => f.texto);
  t("o que escrevi entra abaixo da nota que já havia, com a frase entre aspas", conta(E, "[NOTA] já havia\n[O QUE EU ESCREVI] \"") >= 130 && E.filter((x) => x.startsWith("[O QUE EU ESCREVI] \"")).length >= 130 && conta(E, "\"o \"chefe\" ainda respira?\" — o descanso já foi resolvido pelo sistema; a frase acontece dentro dele.") >= 80);
  const Ro = HOJE.vezRolagem.map((f) => f.texto[0]);
  const T = Ro.map((x) => x[0]);
  t("a rolagem com o refazer à frente (" + conta(T, "[SEGUNDO FÔLEGO] refiz o dado.\n[ROLAGEM]") + ") e sem, para o ref ou para quem renderiza", conta(T, "[SEGUNDO FÔLEGO] refiz o dado.\n[ROLAGEM] Teste de ") >= 130 && T.filter((x) => x.startsWith("[ROLAGEM] Teste de ")).length >= 130 && Ro.filter((x) => x[1] === "Vera do ref").length >= 130 && Ro.filter((x) => x[1] === "Vera do render").length >= 130);
  t("a sorte quando não há atributo, e o motivo entre parênteses", conta(T, "Teste de sorte (") >= 80 && conta(T, "Teste de Força (arrombar a porta)") >= 40 && conta(T, "Teste de Percepção (ler os vestígios)") >= 40);
  /* os casos com as duas (a mesma conta de vezDoCaso): a vantagem tem de pesar */
  const ambas = (i) => ((i >> 2) % 3 === 1 || (i >> 4) % 3 === 2) && ((i >> 2) % 3 === 2 || (i >> 3) % 4 === 3);
  const comV = conta(T, ") (com vantagem): rolei"), comD = conta(T, ") (com desvantagem): rolei");
  /* sem nenhuma das duas o teste vai sem marca: 48 dos 275 casos (a conta de vezDoCaso) */
  const semMarca = T.filter((x) => /\): rolei /.test(x) && !/\((com vantagem|com desvantagem)\): rolei/.test(x)).length;
  t("a vantagem pesa sobre a desvantagem quando há as duas (" + comV + " com, " + comD + " contra), e sem nenhuma o teste vai sem marca (" + semMarca + ")", comV >= 60 && comD >= 40 && semMarca >= 40 &&HOJE.vezRolagem.filter((f, i) => ambas(i)).length >= 10 && HOJE.vezRolagem.every((f, i) => !ambas(i) || f.texto[0][0].includes("(com vantagem): rolei")));
  t("os buffs e a dificuldade só quando há (" + conta(T, ", dificuldade ") + ")", conta(T, " (+2 de Bênção), total ") >= 130 && conta(T, ", dificuldade 12. Resultado: ") >= 60 && conta(T, ", dificuldade 15. Resultado: ") >= 60 && T.filter((x) => !x.includes(", dificuldade ")).length >= 60);
  t("as três formas estão na tabela do jogador", Object.keys(ENVELOPES_DO_JOGADOR).length === 3 && ["perguntaAoMestre", "oQueEuEscrevi", "rolagem"].every((q) => Object.hasOwn(ENVELOPES_DO_JOGADOR, q)));
  const P = oEnvelopeDoJogador;
  const mordidas = [
    ["vezPergunta", "a pergunta que perde a minha frase", { oEnvelopeDoJogador: (q, d) => P(q, { ...d, acao: "" }) }],
    ["vezEscrevi", "o que escrevi com a frase de outro", { oEnvelopeDoJogador: (q, d) => P(q, { ...d, acao: "nada" }) }],
    ["vezRolagem", "a rolagem que esquece a desvantagem", { oEnvelopeDoJogador: (q, d) => P(q, { ...d, desvantagem: false }) }],
    ["vezRolagem", "a rolagem sem a dificuldade", { oEnvelopeDoJogador: (q, d) => P(q, { ...d, dc: null }) }],
    ["vezRolagem", "a rolagem que esquece os buffs", { oEnvelopeDoJogador: (q, d) => P(q, { ...d, notaBuff: "" }) }],
  ];
  for (const [b, nome, troca] of mordidas) {
    const n = divergem(b, fotosDeHoje(b, troca));
    t(nome + ": " + n + " casos mudam", n > 0);
  }
}

sec("25 · as magias de função: os casos percorrem o que o texto decide, e a prova morde");
{
  const conta = (xs, s) => xs.filter((x) => x.includes(s)).length;
  const R = HOJE.funcaoReviver.map((f) => f.texto);
  t("reviver: abaixo da nota que já havia, o nome da magia em maiúscula (com o acento) e quem voltou", conta(R, "[NOTA] já havia\n[") >= 130 && R.filter((x) => x.startsWith("[")).length >= 130 && conta(R, "[REVIVER — APLICADO PELO SISTEMA] Corvo voltou dos mortos") >= 40 && conta(R, "[RESTAURAÇÃO MENOR — APLICADO PELO SISTEMA] Sarna voltou dos mortos") >= 40);
  const C = HOJE.funcaoCura.map((f) => f.texto[0]);
  t("a cura: o nome à letra, os PV recuperados, a minha frase no fim, e vai para quem pagou", C.every((x) => /^\[(Reviver|Restauração Menor|Luz) — CURA APLICADA PELO SISTEMA\] Recuperei \d+ PV e o grupo também\. Não recalcule; narre o alívio\. (toco a ferida|conjuro sobre o "chefe")$/.test(x[0])) && conta(C.map((x) => x[0]), "Recuperei 11 PV") >= 25 && C.filter((x) => x[1] === "Vera paga").length >= 130 && C.filter((x) => x[1] === "Vera do pers").length >= 130);
  const D = HOJE.funcaoCondicao.map((f) => f.texto[0]);
  t("a condição desfeita: a linha do módulo inteira, o veto, a minha frase no fim", D.every((x) => /^\[(Reviver|Restauração Menor|Luz) — JÁ APLICADA PELO SISTEMA\] (O veneno saiu do meu corpo\.|Sarna já não está cega\.) Isso é fato e já está na minha tela: .* Narre o gesto e o alívio em UMA frase\. (toco a ferida|conjuro sobre o "chefe")$/.test(x[0])) && conta(D.map((x) => x[0]), "Sarna já não está cega. Isso é fato") >= 130);
  const A = HOJE.funcaoAtiva.map((f) => f.texto);
  t("a magia ativa: o nome em maiúscula, os turnos contados, a descrição à letra (e vazia quando não há)", conta(A, "[LUZ — ATIVO, CONTADO PELO SISTEMA] A magia está em vigor por ") >= 80 && conta(A, " por 6 turnos: O corpo flutua acima do chão. Trate como fato") >= 10 && conta(A, " turnos:  Trate como fato") >= 80 && conta(A, "[NOTA] já havia\n[") >= 130);
  t("as vinte e duas formas estão na tabela dos poderes, e as quatro novas entre elas", Object.keys(ENVELOPES_DOS_PODERES).length === 22 && ["reviverAplicado", "curaAplicada", "condicaoDesfeita", "magiaAtiva"].every((q) => Object.hasOwn(ENVELOPES_DOS_PODERES, q)));
  const P = oEnvelopeDosPoderes;
  const mordidas = [
    ["funcaoReviver", "reviver que traz outro de volta", { oEnvelopeDosPoderes: (q, d) => P(q, { ...d, alvo: "Ninguém" }) }],
    ["funcaoReviver", "reviver que esquece a maiúscula do acento", { oEnvelopeDosPoderes: (q, d) => P(q, { ...d, magia: d.magia.normalize("NFD").replace(/[̀-ͯ]/g, "") }) }],
    ["funcaoCura", "a cura que não diz quanto", { oEnvelopeDosPoderes: (q, d) => P(q, { ...d, cura: 0 }) }],
    ["funcaoCura", "a cura que perde a minha frase", { oEnvelopeDosPoderes: (q, d) => P(q, { ...d, acao: "" }) }],
    ["funcaoCondicao", "a condição sem a linha do módulo", { oEnvelopeDosPoderes: (q, d) => P(q, { ...d, linha: "" }) }],
    ["funcaoAtiva", "a magia ativa com um turno a mais", { oEnvelopeDosPoderes: (q, d) => P(q, { ...d, turnos: d.turnos + 1 }) }],
    ["funcaoAtiva", "a magia ativa sem a descrição", { oEnvelopeDosPoderes: (q, d) => P(q, { ...d, descricao: "" }) }],
  ];
  for (const [b, nome, troca] of mordidas) {
    const n = divergem(b, fotosDeHoje(b, troca));
    t(nome + ": " + n + " casos mudam", n > 0);
  }
}

sec("26 · o corpo na luta: os casos percorrem o que o texto decide, e a prova morde");
{
  /* os limiares (medidos em 29/10/2026 sobre os 275 casos, no App do 21.º grupo): cada um é
     o maior entre o do molde e o piso de 90% do que os casos dão, para morder sem quebrar à
     toa. O que os casos dão: o revide 46 · 23 · 92 · 137; o fogo amigo 46 · 20; o ritual 45 ·
     139; os ataques de oportunidade 138 · 137 · 21; a vitória 92 nada · 183 ficou · 70 · 92
     masmorra · 183 sem masmorra · 42 resumo vazio; a fuga 142 vazias · 45 · 88; a dádiva 23;
     a queda segurada 137; a fúria 137; aguentei 92 · 183 · 27; a queda de altura 46 · 46; a
     raid 69 · 46 · 91. Onde o molde já pedia mais de 90% (130 de 137, 180 de 183), ficou o do
     molde. */
  const conta = (xs, s) => xs.filter((x) => x.includes(s)).length;
  const tx = (b) => HOJE[b].map((f) => f.texto);
  const Rv = tx("corpoRevide");
  t("o revide: o que acertou diz o dano e a vida que ficou (" + conta(Rv, "Meu contra-ataque acertou ") + "), o que errou passou de raspão (" + conta(Rv, "passou de raspão em ") + ")", conta(Rv, "Meu contra-ataque acertou Ogro: 6 de dano (ele está com ") >= 41 && conta(Rv, "acertou Lobo Cinzento: 11 de dano (ele está com 0 de 18).") >= 20 && conta(Rv, "Meu contra-ataque passou de raspão em ") >= 82 && conta(Rv, "[NOTA] já havia\n[REAÇÃO — REVIDE RESOLVIDO PELO SISTEMA] ") >= 130);
  const Fa = tx("corpoFogoAmigo");
  t("o fogo amigo: a área, quem ela pegou e quanto cada um pagou", conta(Fa, "A área de \"Bola de Fogo\" pegou Corvo, Sarna, do meu próprio grupo") >= 41 && conta(Fa, "pegou Corvo, do meu próprio grupo, e o sistema já cobrou 8 de dano de cada.") >= 18);
  const Ri = tx("corpoRitual");
  t("o ritual: a magia e os minutos que custou", conta(Ri, "Círculo de Proteção não estava preparada, então eu a conduzi como ritual: 60 minutos de preparo") >= 40 && conta(Ri, ": 10 minutos de preparo") >= 130);
  const Op = tx("corpoOportunidade");
  t("os ataques de oportunidade: cada golpe com quem o deu, o que acertou e o que errou, e o dano no total", Op.every((x) => x.startsWith(" [ATAQUES DE OPORTUNIDADE — ROLADOS PELO SISTEMA] Ao me afastar, dei as costas: ")) && conta(Op, "dei as costas: Lobo acertou (4). Levei ") >= 130 && conta(Op, "dei as costas: Lobo errou; Ogro acertou (7). Levei ") >= 130 && conta(Op, "Levei 12 de dano no total") >= 18);
  const Vi = tx("corpoVitoria");
  const nada = conta(Vi, " Nada de aproveitável ficou no chão — não invente achados."), ficou = conta(Vi, " FICOU CAÍDO no chão, entre os corpos: ");
  t("a vitória: as moedas e o XP, o que ficou no chão (" + ficou + ") ou nada (" + nada + "), e a masmorra concluída quando foi", Vi.every((x) => /\[VITÓRIA — sistema já aplicou \+\d+ moedas e \+\d+ XP\] NÃO envie moedas nem xp\./.test(x)) && nada >= 82 && ficou >= 164 && conta(Vi, "entre os corpos: Adaga, Couro de Lobo.") >= 63 && conta(Vi, " A MASMORRA FOI CONCLUÍDA") >= 82 && Vi.filter((x) => !x.includes("A MASMORRA FOI CONCLUÍDA")).length >= 164);
  t("a vitória diz que ficou algo mesmo quando o resumo vem vazio (" + conta(Vi, "entre os corpos: . ") + ")", conta(Vi, "entre os corpos: . Você pode MOSTRAR") >= 37);
  const Fu = tx("corpoFuga");
  t("o custo da fuga: nada sem resultado ou sem linha (" + Fu.filter((x) => x === "").length + "), e cada golpe e disparo quando houve", Fu.filter((x) => x === "").length >= 127 && conta(Fu, " [FUGA — CUSTO ROLADO PELO SISTEMA] Ao dar as costas: Ogro (golpe) acertou (5). Levei ") >= 40 && conta(Fu, "Ao dar as costas: Arqueiro (disparo) errou; Ogro (golpe) acertou (8). Levei ") >= 79 && Fu.every((x) => x === "" || x.endsWith("de dano no total e já está aplicado — NÃO recalcule.")));
  const Da = tx("corpoDadiva"), Qs = tx("corpoQuedaSegurada"), Fr = tx("corpoFuria");
  t("as três vezes que o corpo não caiu: a dádiva com a vida que voltou, quem me segurou, e a fúria", conta(Da, "voltei na mesma hora com 7 PV: é a dádiva") >= 20 && conta(Qs, "O golpe me levaria a 0 e \"Teimosia do Anão\" me segurou de pé com 1 PV.") >= 130 && Fr.every((x) => x.endsWith("[FÚRIA PERSISTENTE — APLICADA PELO SISTEMA] O golpe me levaria a 0 e eu fiquei de pé com 1 PV: é o traço da minha origem, e ele só faz isso uma vez por descanso longo. NÃO me trate como caído. Narre o corpo que se recusa — o joelho que trava, o ar que volta pelos dentes —, e deixe claro que agora qualquer coisa me derruba.")) && conta(Fr, "[NOTA] já havia\n[FÚRIA") >= 130);
  const Ag = tx("corpoAguentei");
  t("aguentei o golpe: de quem (e do oponente sem nome, " + conta(Ag, "O golpe de meu oponente me pegou") + "), quanto seria e quanto custou", conta(Ag, "O golpe de Ogro me pegou de raspão: em vez de ") >= 82 && conta(Ag, "O golpe de meu oponente me pegou de raspão: ") >= 180 && conta(Ag, "em vez de 13, custou 6.") >= 24);
  const Qa = tx("corpoQuedaAltura");
  t("a queda de altura: a salvaguarda à frente, os metros, o motivo quando há (e o espaço quando não), o dano cobrado", Qa.every((x) => /^\[SALVAGUARDA (passou|falhou|nenhuma)\] A queda de (3|9|18) metros · (true|false) · \d+ → \d+\n\[QUEDA — RESOLVIDA PELO SISTEMA\] Eu caí (3|9|18) metros /.test(x)) && conta(Qa, "Eu caí 9 metros ao tentar escalar a muralha e o sistema já cobrou: ") >= 41 && conta(Qa, "Eu caí 3 metros  e o sistema já cobrou: ") >= 41);
  const Rd = tx("corpoRaid");
  t("a raid: o chefe que caiu ou o chamado que acabou, quem não voltou, e a dispersão", conta(Rd, "] o Wyrm de Cinza caiu, e caiu pela mão do herói. ") >= 62 && conta(Rd, "] O chamado acabou sem a coisa cair. Ninguém ficou para trás.") >= 41 && conta(Rd, "Não voltaram: Bran, Ísis — e não voltam mesmo.") >= 81);
  /* 12 → 13 em 29/10: a tabela ganhou oQueDaQueda, o sujeito da salvaguarda da queda que saiu do App (secção 28) */
  t("as doze formas estão na tabela do corpo, e a do que veio contra mim", Object.keys(ENVELOPES_DO_CORPO).length === 13 && ["revide", "fogoAmigo", "ritual", "ataquesDeOportunidade", "vitoria", "custoDaFuga", "dadivaDaRecuperacao", "quedaSegurada", "furiaPersistente", "aguenteiOGolpe", "quedaDeAltura", "raidEncerrada"].every((q) => Object.hasOwn(ENVELOPES_DO_CORPO, q)));
  const P = oEnvelopeDoCorpo;
  const m = (f) => ({ oEnvelopeDoCorpo: (q, d) => P(q, f(d)) });
  const mordidas = [
    ["corpoRevide", "o revide que esquece a vida que ficou", m((d) => ({ ...d, pv: 99 }))],
    ["corpoFogoAmigo", "o fogo amigo que cobra outro tanto", m((d) => ({ ...d, meio: d.meio + 1 }))],
    ["corpoRitual", "o ritual sem os minutos", m((d) => ({ ...d, minutos: 0 }))],
    ["corpoOportunidade", "os ataques de oportunidade que perdem um golpe", m((d) => ({ ...d, ops: d.ops.slice(1) }))],
    ["corpoVitoria", "a vitória que só olha o resumo", m((d) => ({ ...d, caidos: d.chao.length }))],
    ["corpoVitoria", "a vitória que esquece a masmorra", m((d) => ({ ...d, masmorraConcluida: false }))],
    ["corpoFuga", "o custo da fuga com outro dano", m((d) => ({ ...d, dano: d.dano + 1 }))],
    ["corpoDadiva", "a dádiva que devolve outra vida", m((d) => ({ ...d, volta: d.volta + 1 }))],
    ["corpoQuedaSegurada", "a queda segurada por ninguém", m((d) => ({ ...d, quemSegura: "" }))],
    ["corpoFuria", "a fúria que diz outra coisa", { oEnvelopeDoCorpo: (q, d) => P(q, d).replace("descanso longo", "dia") }],
    ["corpoAguentei", "aguentei o golpe sem o que devolvi", m((d) => ({ ...d, devolve: 0 }))],
    ["corpoQuedaAltura", "a queda sem o motivo", m((d) => ({ ...d, motivo: "" }))],
    ["corpoRaid", "a raid que esquece os mortos", m((d) => ({ ...d, mortos: [] }))],
  ];
  for (const [b, nome, troca] of mordidas) {
    const n = divergem(b, fotosDeHoje(b, troca));
    t(nome + ": " + n + " casos mudam", n > 0);
  }
}

sec("27 · o «nA»: a preposição diante do nome que abre por artigo");
{
  /* O conserto declarado (29/10/2026). Os nomes do mundo nascem com artigo — as casas de
     guildas.js (420 em 420), as bancas de mercado.js (NOMES_LOJA_A), os lugares do mapa e da
     cena, uma cidade em 420 ("A Fronteira") — e o molde dava "Fui aceito nA Mão Cinzenta",
     "Comprei de A Bigorna Torta", "fugir de A Cripta Funda", "A A Mão Cinzenta reivindicou".
     Esta secção chama as formas com esses nomes: com o motor de antes do conserto ela fica
     vermelha (provado nesse dia), com o de hoje fica verde. A última linha guarda o outro lado:
     o nome sem artigo passa igual, e o indefinido não contrai. */
  const guilda = (nome) => oEnvelopeDaFe("guilda", { nome, posto: "Aprendiz", mestre: "Velho Brann" });
  t("a guilda: na Mão Cinzenta, no Salão Manco, nos Punhos de Sal — e na Casa do Sal, como antes", guilda("A Mão Cinzenta").includes("Fui aceito na Mão Cinzenta como Aprendiz.") && guilda("O Salão Manco").includes("Fui aceito no Salão Manco como") && guilda("Os Punhos de Sal").includes("Fui aceito nos Punhos de Sal como") && guilda("Casa do Sal").includes("Fui aceito na Casa do Sal como"), guilda("A Mão Cinzenta").slice(0, 90));
  const reiv = (casa) => oEnvelopeDoDominio("reivindicacao", { casa, cidade: "Vau", dias: 3 });
  t("a casa que reivindica abre a frase com o artigo dela (e «A» quando o nome não o traz)", reiv("O Salão Manco").includes("] O Salão Manco reivindicou Vau;") && reiv("A Mão Cinzenta").includes("] A Mão Cinzenta reivindicou Vau;") && reiv("Casa do Sal").includes("] A Casa do Sal reivindicou Vau;"), reiv("A Mão Cinzenta").slice(0, 90));
  const compra = oEnvelopeDoMercado("compra", { item: "Corda", vendedor: "A Bigorna Torta", preco: 3 });
  const mapa = oEnvelopeDoMercado("mapaComprado", { regiao: "as Terras Altas", vendedor: "O Cálice Dourado", preco: 9, novas: [] });
  t("a banca e a região: da Bigorna Torta, das Terras Altas do Cálice Dourado", compra.includes("Comprei \"Corda\" da Bigorna Torta por") && mapa.includes("Comprei o mapa das Terras Altas do Cálice Dourado por"), compra.slice(0, 90));
  const obra = (cidade) => oEnvelopeDoDominio("obraConcluida", { cidade, obra: "a muralha" });
  t("a cidade que abre por artigo: Na Fronteira (a maiúscula da preposição passa), na Fronteira", obra("A Fronteira").includes("] Na Fronteira ficou pronta:") && oEnvelopeDoDominio("imposto", { imposto: "leve", cidade: "A Fronteira" }).includes("Mandei cobrar imposto leve na Fronteira.") && oEnvelopeDaFe("templo", { templo: "Santuário", cidade: "A Fronteira", custo: 50, fe: 30 }).includes("foi construído na Fronteira,"), obra("A Fronteira").slice(0, 90));
  const mov = (nomeDe, nomePara) => oEnvelopeDoCaminho("movimentoResolvido", { nomeDe, nomePara, colados: [] });
  t("a masmorra do mapa, os lugares da cena e a chegada", oEnvelopeDaMasmorra("fuga", { masmorra: "A Cripta Funda" }).includes("fugir da Cripta Funda antes do fim") && mov("o salão", "a cozinha").includes("Eu me desloquei do salão para a cozinha") && mov("o salão", "o salão").includes("Eu me desloquei dentro do salão") && oEnvelopeDoCaminho("chegada", { dias: 2, destino: "A Fronteira" }).includes("eu ESTOU na Fronteira, dentro dela."), mov("o salão", "a cozinha").slice(0, 90));
  const carta = oEnvelopeDoCorreio("carta", { para: "A Ordem do Vácuo", icone: "✉", nome: "Carta", oferta: 0, mensagem: "" });
  t("a carta à facção: Enviei à Ordem do Vácuo, a reação da Ordem do Vácuo", carta.includes("Enviei à Ordem do Vácuo:") && carta.includes("a reação da Ordem do Vácuo agora."), carta.slice(0, 90));
  const fundada = oEnvelopeDaFe("guildaFundada", { nome: "Ordem da Ponte", oficio: "o que se faz sem testemunha", sede: "A Fronteira" });
  t("o ofício e a sede: do que se faz sem testemunha, com sede na Fronteira", fundada.includes("Ordem da Ponte, do que se faz sem testemunha, com sede na Fronteira."), fundada.slice(0, 120));
  t("e o texto que já estava certo não muda: o nome sem artigo passa igual, o indefinido não contrai", obra("Thornhaven").includes("] Em Thornhaven ficou pronta:") && oEnvelopeDoCaminho("chegada", { dias: 2, destino: "uma estalagem em Vau" }).includes("eu ESTOU em uma estalagem em Vau, dentro dela.") && mov("Ponte", "Vau").includes("Eu me desloquei de Ponte para Vau") && oEnvelopeDoMercado("compra", { item: "Corda", vendedor: "Ondina", preco: 3 }).includes("\"Corda\" de Ondina por"));
}

sec("28 · o que veio contra mim: o sujeito da salvaguarda sai do App");
{
  /* Os dois últimos pedaços de voz do Mestre nos envelopes resolvidos do App (29/10/2026):
     o argumento oQue de envelopeDaSalvaguarda na queda de altura e na armadilha sofrida. É o
     sujeito da frase que o motor monta («X veio contra mim»), logo voz. Os textos são os de
     antes à letra (os 275 casos dos blocos corpoQuedaAltura e armadilhaSofridaNaMasmorra
     batem com o dourado); aqui prova-se que o App passa pela forma: mexer nela muda o texto. */
  t("as duas formas estão nas tabelas", Object.hasOwn(ENVELOPES_DO_CORPO, "oQueDaQueda") && Object.hasOwn(ENVELOPES_DA_MASMORRA, "oQueDaArmadilha"));
  const C = oEnvelopeDoCorpo, M = oEnvelopeDaMasmorra;
  const mordidas = [
    ["corpoQuedaAltura", "a queda que diz outra altura", { oEnvelopeDoCorpo: (q, d) => C(q, q === "oQueDaQueda" ? { ...d, metros: d.metros + 1 } : d) }],
    ["corpoQuedaAltura", "a queda sem quem veio contra mim", { oEnvelopeDoCorpo: (q, d) => (q === "oQueDaQueda" ? "" : C(q, d)) }],
    ["armadilhaSofridaNaMasmorra", "a armadilha sem o nome", { oEnvelopeDaMasmorra: (q, d) => M(q, q === "oQueDaArmadilha" ? { ...d, nomeArmadilha: "" } : d) }],
    ["armadilhaSofridaNaMasmorra", "a armadilha sem quem veio contra mim", { oEnvelopeDaMasmorra: (q, d) => (q === "oQueDaArmadilha" ? "" : M(q, d)) }],
  ];
  for (const [b, nome, troca] of mordidas) {
    const n = divergem(b, fotosDeHoje(b, troca));
    t(nome + ": " + n + " casos mudam", n > 0);
  }
}

sec("29 · o desfecho das habilidades: os casos percorrem o que o texto decide, e a prova morde");
{
  /* O 22.º grupo (29/10/2026, trilha A). A linha de cada alvo que vai dentro de
     [HABILIDADES — RESOLVIDAS] morava no App, com os cinco [CAIU…] — a última voz do
     Mestre nos envelopes. Sai a peça inteira (as dez formas da resolução de uma
     habilidade ofensiva), e o App só junta as linhas com "; ". Os 275 casos dos dez
     sítios batem byte a byte com o App de 44a4695 (secção 1); aqui, o que os casos
     percorrem, e as mordidas. */
  const L = (b) => HOJE[b].map((f) => f.texto);
  const ult = (b) => L(b).map((x) => (Array.isArray(x) ? x[x.length - 1] : x));
  const conta = (xs, s) => xs.filter((x) => String(x).includes(s)).length;
  const DESF = ["desfechoColheita", "desfechoExecucao", "desfechoGolpe", "desfechoGeminada", "desfechoArea", "desfechoFogoAmigo", "desfechoCondicao", "desfechoDrenou", "desfechoImune", "desfechoErrou"];
  t("as dez formas estão na tabela do desfecho", Object.keys(ENVELOPES_DO_DESFECHO).length === 10 && ["golpe", "geminada", "area", "fogoAmigo", "condicao", "drenou", "imune", "errou", "colheita", "execucao"].every((q) => Object.hasOwn(ENVELOPES_DO_DESFECHO, q)));
  t("as oito linhas entram no fim da lista, depois da que já havia", DESF.slice(2).every((b) => L(b).every((x, i) => Array.isArray(x) && x.length === 1 + (i % 2) && (i % 2 === 0 || x[0] === "Corvo — 3 de dano pela área"))));
  const G = ult("desfechoGolpe");
  t("o golpe: o crítico (" + conta(G, "CRÍTICO, ") + "), o acerto e a resistência parcial, com o d20 contra a CA", conta(G, "CRÍTICO, ") >= 80 && conta(G, " — resistiu parcialmente (d20=") >= 80 && G.every((x, i) => x.includes(" vs " + (10 + (i % 6)) + ")")));
  t("o golpe: o bônus só quando há (" + conta(G, "+3=") + "/" + conta(G, "+5=") + "), e o [CAIU] de quem foi a 0 (" + conta(G, " [CAIU]") + ")", conta(G, "+3=") >= 80 && conta(G, "+5=") >= 80 && G.filter((x) => /\(d20=\d+=\d+ vs/.test(x)).length >= 80 && conta(G, " [CAIU]") >= 80 && G.filter((x) => !x.includes("[CAIU]")).length >= 150);
  t("a geminada e a área dizem o dano e o [CAIU] de quem caiu", conta(ult("desfechoGeminada"), "de dano pela magia GEMINADA [CAIU]") >= 130 && conta(ult("desfechoGeminada"), "pela magia GEMINADA") === 275 && conta(ult("desfechoArea"), "de dano pela área [CAIU]") >= 80 && conta(ult("desfechoArea"), "de dano pela área") === 275);
  t("o meu grupo na minha área: um e dois, com a metade e a habilidade", conta(ult("desfechoFogoAmigo"), "Corvo, Sarna apanhou ") >= 130 && ult("desfechoFogoAmigo").every((x, i) => x.includes(" apanhou " + (2 + (i % 7)) + " de ") && x.endsWith(", o meu próprio ataque"))); /* movida (29/10, o conserto do artigo): pedia " da minha própria ", o defeito à letra */
  const C = ult("desfechoCondicao");
  t("a condição aplicada e a resistida, em minúsculas", conta(C, " ficou queimado") + conta(C, " ficou alento") + conta(C, " ficou cego") >= 130 && conta(C, " resistiu e não ficou ") >= 130 && !C.some((x) => /ficou [A-Z]|resistiu à /.test(x))); /* movida (29/10, o conserto do artigo): pedia " resistiu à ", o defeito à letra */
  t("a drenagem, o imune de cada degrau e o erro desastroso", ult("desfechoDrenou").every((x, i) => x === "drenei " + (1 + (i % 9)) + " PV") && ult("desfechoImune").every((x, i) => x.includes("IMUNE (GD " + (3 + (i % 4)) + " contra meu GD " + (i % 3) + ":")) && conta(ult("desfechoErrou"), " — erro desastroso (d20=") >= 130 && conta(ult("desfechoErrou"), " — errou (d20=") >= 130);
  const K = L("desfechoColheita");
  t("a colheita de ninguém (" + conta(K, "NÃO derrubou ninguém") + "), de um e de dois, cada um com o seu [CAIU — …]", conta(K, "NÃO derrubou ninguém") >= 80 && conta(K, "Ogro [CAIU — estava abaixo de ") >= 150 && conta(K, "]; Lobo Cinzento [CAIU — estava abaixo de ") >= 80);
  t("a execução diz a habilidade, o limiar e a vida que o alvo tinha", L("desfechoExecucao").every((x, i) => x.includes(" executa quem está abaixo de ") && x.endsWith("ele estava com " + (2 + (i % 7)) + " de " + [30, 18][(i >> 2) % 2] + "]")));
  /* O CONSERTO DO ARTIGO (29/10, trilha A): nenhuma forma do desfecho põe artigo
     fixo diante de um nome com gênero — sobre o catálogo INTEIRO: as 23 condições
     de condicoes.js, aplicadas e resistidas, e as magias de área do grimório no meu
     grupo na minha área. Antes do conserto: as 23 condições e as 29 magias caíam
     aqui (a frase com artigo fixo). */
  {
    const { CONDICOES: CONDICOES_DO_CATALOGO, criarCondicao } = await import("../src/condicoes.js");
    const { MAGIAS: MAGIAS_DO_GRIMORIO, ehArea: ehAreaDoGrimorio } = await import("../src/grimorio.js");
    const condicoes = Object.values(CONDICOES_DO_CATALOGO).map((c) => criarCondicao(c.id).nome);
    const resistidas = condicoes.map((nome) => oEnvelopeDoDesfecho("condicao", { alvo: "Corvo", aplicou: false, condicao: nome }));
    const aplicadas = condicoes.map((nome) => oEnvelopeDoDesfecho("condicao", { alvo: "Corvo", aplicou: true, condicao: nome }));
    t(`as ${condicoes.length} condições do catálogo, resistidas, sem artigo diante do nome (${resistidas.filter((x) => / (à|ao|a|o) [a-zà-ú]+$/.test(x)).length} com)`,
      condicoes.length === 23 && resistidas.every((x, i) => x === "Corvo resistiu e não ficou " + condicoes[i].toLowerCase()) && aplicadas.every((x, i) => x === "Corvo ficou " + condicoes[i].toLowerCase()));
    const areas = MAGIAS_DO_GRIMORIO.filter((m) => ehAreaDoGrimorio(m)).map((m) => m.nome);
    const fogo = areas.map((h) => oEnvelopeDoDesfecho("fogoAmigo", { lista: "Sarna", meio: 3, habilidade: h }));
    t(`as ${areas.length} magias de área do grimório no fogo amigo, sem artigo nem «própria» diante do nome`,
      areas.length >= 25 && fogo.every((x, i) => x === "Sarna apanhou 3 de " + areas[i] + ", o meu próprio ataque") && !fogo.some((x) => /\b(da|do|das|dos) minha|própria /.test(x)));
  }
  const P = oEnvelopeDoDesfecho;
  const mordidas = [
    ["desfechoGolpe", "o crítico dito como acerto", { oEnvelopeDoDesfecho: (q, d) => P(q, { ...d, resultado: d.resultado === "critico" ? "acerta" : d.resultado }) }],
    ["desfechoGolpe", "o golpe que esquece quem caiu", { oEnvelopeDoDesfecho: (q, d) => P(q, { ...d, caiu: false }) }],
    ["desfechoGolpe", "o golpe sem o bônus", { oEnvelopeDoDesfecho: (q, d) => P(q, { ...d, bonus: 0 }) }],
    ["desfechoGeminada", "a geminada que esquece quem caiu", { oEnvelopeDoDesfecho: (q, d) => P(q, { ...d, caiu: false }) }],
    ["desfechoArea", "a área que derruba todos", { oEnvelopeDoDesfecho: (q, d) => P(q, { ...d, caiu: true }) }],
    ["desfechoFogoAmigo", "o fogo amigo de dano inteiro", { oEnvelopeDoDesfecho: (q, d) => P(q, { ...d, meio: d.meio * 2 }) }],
    ["desfechoCondicao", "a condição sempre aplicada", { oEnvelopeDoDesfecho: (q, d) => P(q, { ...d, aplicou: true }) }],
    ["desfechoDrenou", "a drenagem de um a mais", { oEnvelopeDoDesfecho: (q, d) => P(q, { ...d, cura: d.cura + 1 }) }],
    ["desfechoImune", "o imune com os degraus trocados", { oEnvelopeDoDesfecho: (q, d) => P(q, { ...d, gdAlvo: d.gdMeu, gdMeu: d.gdAlvo }) }],
    ["desfechoErrou", "o erro que nunca é desastroso", { oEnvelopeDoDesfecho: (q, d) => P(q, { ...d, desastre: false }) }],
    ["desfechoColheita", "a colheita que só diz o primeiro", { oEnvelopeDoDesfecho: (q, d) => P(q, { ...d, nomes: d.nomes.slice(0, 1) }) }],
    ["desfechoExecucao", "a execução com a vida cheia", { oEnvelopeDoDesfecho: (q, d) => P(q, { ...d, vida: d.vidaMax }) }],
  ];
  for (const [b, nome, troca] of mordidas) {
    const n = divergem(b, fotosDeHoje(b, troca));
    t(nome + ": " + n + " casos mudam", n > 0);
  }
  /* o lado do App: os [CAIU…] e as linhas de dano já não moram lá — a resolução chama a peça */
  t("o App não escreve mais nenhum [CAIU", !APP.includes("[CAIU"));
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
