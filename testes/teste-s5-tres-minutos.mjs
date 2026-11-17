/* teste-s5-tres-minutos.mjs (15/11/2026, S5 — os três primeiros minutos)

   A sessão de 15/11 (mente/lancamento/sessao-de-hoje.md) mostrou quatro
   defeitos antes do terceiro minuto de jogo, e cada um tem aqui a catraca:

   §1 a fraqueza do vilão não é a resposta do primeiro Saberes — em 1000
      mundos, a carta da fraqueza nunca se vira antes da camada da mão
      (quadro-da-quest.js, FRAQUEZA_NO_QUADRO);
   §2 a terra onde o herói nasce não paga XP (feito-do-sistema.js);
   §3 nenhuma conquista no turno zero — o que se traz de casa não é feito
      (conquistas.js, o berço);
   §4 a abertura termina com três portas tocáveis do sistema
      (propostas-da-abertura.js), e a fiação no App. */
import fs from "node:fs";
import { osQuadrosDoEstado, aCartaDoTeste, FRAQUEZA_NO_QUADRO } from "../src/quadro-da-quest.js";
import { FASES } from "../src/vilao.js";
import { garantirHistoria } from "../src/historia.js";
import { garantirFactos, idDoLugar } from "../src/livro-de-factos.js";
import { oTurnoDasQuests } from "../src/motor/quests-do-turno.js";
import { esqueletoDaCampanha, comOEsqueleto } from "../src/esqueleto.js";
import { gerarGeografia } from "../src/geografia.js";
import { estenderEspinha } from "../src/saga.js";
import { nucleoDaCampanha } from "../src/nucleo.js";
import { chefesDoMundo } from "../src/mundo-base.js";
import { osFactosDoTurno, oFeitoDoTurno } from "../src/feito-do-sistema.js";
import { SABER_DO_HEROI } from "../src/motor/o-mestre-chama.js";
import { avaliarConquistas, oBercoDasConquistas, BERCO_DAS_CONQUISTAS } from "../src/conquistas.js";
import { asPropostasDaAbertura, PROPOSTAS_DA_ABERTURA, oRumoDaBusca } from "../src/propostas-da-abertura.js";

let bons = 0, maus = 0;
const t = (n, c, extra) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const J = (x) => JSON.stringify(x);
const APP = fs.readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");

const ESTRUTURAS = ["misterio", "jornada"];
const ANTECEDENTES = ["soldado", "erudito", "acolito", "ladrao", "ferreiro"];
function mundoDe(i) {
  const semente = "S5|" + i;
  const mundo = { semente };
  const mapa = gerarGeografia(semente, null, null);
  const estrutura = ESTRUTURAS[i % ESTRUTURAS.length];
  const antecedente = ANTECEDENTES[i % ANTECEDENTES.length];
  const cidadeInicial = mapa.cidades[0].nome;
  const espinha0 = estenderEspinha({ semente, mapa, estrutura, cidadeInicial, antecedente, dia: 1 });
  const nucleo = nucleoDaCampanha(semente, mapa, { espinha: espinha0, antecedente, grupo: [] });
  const esq = esqueletoDaCampanha({ semente, mapa, espinha: espinha0, antecedente, cidadeInicial, nucleo, chefes: chefesDoMundo(semente, mapa) });
  let E = { espinha: comOEsqueleto(espinha0, esq), historia: garantirHistoria({ estrutura, etapa: 0 }), mapa, cidadeAtual: cidadeInicial, lugar: null, jornada: null, personagem: { nome: "Vera", grupo: [], inventario: [], moedas: 100 }, npcs: {}, canone: {}, factos: garantirFactos(null), saber: [], dia: 1, npcTurno: 0 };
  const r = oTurnoDasQuests(E, { mundo });
  if (r) E = { ...E, ...r.estado };
  return { E, mundo, cidadeInicial };
}
const comACamada = (E, camada) => {
  const fio = E.espinha && E.espinha.fio;
  if (!fio || !fio.vilao) return null;
  return { ...E, espinha: { ...E.espinha, fio: { ...fio, vilao: { ...fio.vilao, camada } } } };
};

/* ============================================================ */
sec("§1 a fraqueza do vilão nunca é a resposta antes da camada da mão (1000 mundos)");
{
  const ordem = (id) => (FASES.find((f) => f.id === id) || { ordem: -1 }).ordem;
  t("a camada da tabela existe em FASES e não é a primeira", ordem(FRAQUEZA_NO_QUADRO.desdeACamada) >= 1, FRAQUEZA_NO_QUADRO.desdeACamada);
  const N = 1000;
  let comFraqueza = 0, vazou = 0, juizVazou = 0, abriuNaMao = 0, mundosComVilao = 0;
  const exemplos = [];
  for (let i = 0; i < N; i++) {
    const { E, mundo, cidadeInicial } = mundoDe(i);
    const fio = (E.espinha && E.espinha.fio) || {};
    if (fio.vilao) mundosComVilao++;
    const qs = osQuadrosDoEstado(E, { mundo });
    for (const q of qs) {
      const fr = q.cartas.find((c) => c.id === "extra:fraqueza");
      if (!fr) continue;
      comFraqueza++;
      if (fr.viravel || (fr.caminhos || []).length || fr.estado === "virada") { vazou++; if (exemplos.length < 3) exemplos.push(`S5|${i}`); }
    }
    /* o 1.º Saberes da sessão: «o que é que eu sei sobre <a alcunha>?» —
       com sucesso, sobre o vilão pelo nome, pela alcunha e pelo título */
    for (const sobre of [fio.antagonista, fio.titulo, "o que o pode derrubar", "a fraqueza dele"].filter((x) => typeof x === "string" && x)) {
      const j = aCartaDoTeste(qs, { id: "lembrar", passou: true, total: 20, dc: 13, sobre, frase: `o que é que eu sei sobre ${sobre}?` }, { cidade: cidadeInicial });
      if (j && j.carta === "extra:fraqueza") juizVazou++;
    }
    /* e a porta abre-se na camada da mão (amostra: um em cada dez) */
    if (i % 10 === 0) {
      const E2 = comACamada(E, FRAQUEZA_NO_QUADRO.desdeACamada);
      if (E2) for (const q of osQuadrosDoEstado(E2, { mundo })) {
        const fr = q.cartas.find((c) => c.id === "extra:fraqueza");
        if (fr && fr.viravel && fr.caminhos.length) abriuNaMao++;
      }
    }
  }
  t(`os mundos de prova têm vilão (${mundosComVilao} de ${N})`, mundosComVilao > N / 2);
  t(`a carta da fraqueza apareceu em quadros de abertura (${comFraqueza})`, comFraqueza > 50);
  t("em nenhum deles se vira, nem tem caminho, antes da camada", vazou === 0, exemplos.join(" "));
  t("o juiz do teste nunca escolhe a fraqueza para um Saberes antes da camada", juizVazou === 0, String(juizVazou));
  t(`na camada da mão a carta abre-se (${abriuNaMao} mundos da amostra)`, abriuNaMao > 0);
}

/* ============================================================ */
sec("§2 a terra onde o herói nasce não paga XP");
{
  const { E, cidadeInicial } = mundoDe(1);
  const outra = E.mapa.cidades.find((c) => c.nome !== cidadeInicial).nome;
  const terraNaEspinha = SABER_DO_HEROI.terraNaEspinha.map((cam) => cam.reduce((x, k) => (x && typeof x === "object" ? x[k] : undefined), E.espinha)).find(Boolean);
  t("a espinha guarda a cidade onde a campanha nasce", terraNaEspinha === cidadeInicial, `${terraNaEspinha} / ${cidadeInicial}`);
  const esteve = { de: 1, ate: 1 };
  const factos = { lugares: { [idDoLugar(null, { cidade: cidadeInicial })]: { esteve } }, pessoas: {} };
  const memoria = { v: 1, dia: 1, pequenos: 0, vistos: [], testes: [] };
  const f1 = osFactosDoTurno({ factos, espinha: E.espinha, cidade: cidadeInicial });
  t("a terra natal não é um facto que paga", !f1.some((f) => f.fonte === "cidade"), J(f1));
  t("logo, no 1.º turno sem gesto, 0 XP", oFeitoDoTurno(f1, memoria, { dia: 1 }) === null);
  const factos2 = { lugares: { ...factos.lugares, [idDoLugar(null, { cidade: outra })]: { esteve } }, pessoas: {} };
  const f2 = osFactosDoTurno({ factos: factos2, espinha: E.espinha, cidade: outra });
  const pago = oFeitoDoTurno(f2, memoria, { dia: 1 });
  t("uma terra nova de verdade continua a pagar", pago && pago.fonte === "cidade", J(pago));
  t("a terra dita pela entrada também cala", !osFactosDoTurno({ factos, terra: cidadeInicial }).some((f) => f.fonte === "cidade"));
  t("sem terra conhecida, como antes", osFactosDoTurno({ factos }).some((f) => f.fonte === "cidade"));
  t("lixo não estoura", Array.isArray(osFactosDoTurno({ factos, espinha: { fio: null, esqueleto: 7 } })));
}

/* ============================================================ */
sec("§3 nenhuma conquista no turno zero");
{
  /* o herói da sessão: o companheiro de armas já amigo (vínculo 50), gente
     no registo e moedas na bolsa — tudo trazido de casa */
  const casa = { vinculoAmizade: 1, vinculoProfundo: 0, companheiros: 1, npcs: 6, moedas: 120, fama: 0, nivel: 1, inimigosDerrotados: 0 };
  t("sem o berço, o turno zero dava conquistas (o defeito)", avaliarConquistas(casa, {}).length > 0);
  const berco = oBercoDasConquistas(casa, null, { jogou: false });
  t("o berço lê só os contadores da tabela", Object.keys(berco).sort().join() === [...BERCO_DAS_CONQUISTAS.descontar].sort().join());
  t("com o berço, o turno zero não dá nenhuma", avaliarConquistas(casa, {}, berco).length === 0, J(avaliarConquistas(casa, {}, berco).map((c) => c.id)));
  t("depois de agir, o berço fica o que era", oBercoDasConquistas({ ...casa, npcs: 40 }, berco, { jogou: true }) === berco);
  t("antes de agir, o berço acompanha a abertura", oBercoDasConquistas({ ...casa, companheiros: 2 }, berco, { jogou: false }).companheiros === 2);
  t("save antigo já jogado e sem berço: nenhum desconto", oBercoDasConquistas(casa, null, { jogou: true }) === null);
  const ganhou = avaliarConquistas({ ...casa, vinculoAmizade: 2 }, {}, berco).map((c) => c.id);
  t("a amizade ganha depois conta (Ombro Amigo)", ganhou.includes("vinculo_amizade"), J(ganhou));
  t("o feito de luta não é descontado", avaliarConquistas({ ...casa, inimigosDerrotados: 1 }, {}, berco).some((c) => c.id === "primeiro_sangue"));
  t("lixo não estoura", Array.isArray(avaliarConquistas(null, null, "x")) && oBercoDasConquistas(null, null, null) !== null);
  t("o App guarda e lê o berço", /oBercoDasConquistas\(stats, berco, \{ jogou \}\)/.test(APP) && /avaliarConquistas\(stats, conqRef\.current\.desbloqueadas, berco\)/.test(APP));
}

/* ============================================================ */
sec("§4 a abertura termina com três portas tocáveis");
{
  const passos = [{ quest: "q", lugares: [{ nome: "Malho das Cinzas", cidade: "Monte Profundo" }], candidatos: { pessoa: [{ nome: "Nolan Olho-de-Corvo" }] } }];
  const emCena = [{ tipo: "pessoa", nome: "Nolan o Silencioso", comigo: true }, { tipo: "pessoa", nome: "Cedric" }, { tipo: "lugar", nome: "a praça" }];
  const ps = asPropostasDaAbertura({ passos, emCena, grupo: ["Nolan o Silencioso"], riscos: ["Forte de Gelo Fundo"], cidade: "Monte Profundo" });
  t("três portas, na ordem da tabela", ps.length === 3 && ps.map((p) => p.tipo).join() === PROPOSTAS_DA_ABERTURA.ordem.join(), J(ps));
  t("o passo da quest: ir ao lugar da etapa", ps[0].verbo === "Ir até Malho das Cinzas" && ps[0].frase === "Vou até Malho das Cinzas.");
  t("a pessoa em cena não é do grupo", ps[1].verbo === "Falar com Cedric");
  t("o risco à vista: a masmorra perto", ps[2].verbo === "Explorar Forte de Gelo Fundo" && ps[2].frase === "Vou até Forte de Gelo Fundo."); /* S6b (15/11): o risco é ir lá (dado e preço), não perguntar */
  t("cada porta é uma frase do jogador (o toque passa pelo campo)", ps.every((p) => typeof p.frase === "string" && p.frase.length > 4));
  t("ids distintos", new Set(ps.map((p) => p.id)).size === 3);
  t("depois do primeiro gesto, nenhuma", asPropostasDaAbertura({ passos, emCena, riscos: ["X"], jogou: true }).length === 0);
  const ja = asPropostasDaAbertura({ passos, emCena: [], aqui: "Malho das Cinzas" });
  t("o lugar onde já se está não é para onde ir — vai a pessoa do passo", ja[0] && ja[0].verbo === "Procurar Nolan Olho-de-Corvo", J(ja));
  const nada = asPropostasDaAbertura({});
  t("sem nada do mundo, ainda há uma porta: olhar à volta", nada.length === 1 && nada[0].verbo === PROPOSTAS_DA_ABERTURA.semNome.verbo);
  t("lixo não estoura", Array.isArray(asPropostasDaAbertura(null)) && Array.isArray(asPropostasDaAbertura({ passos: 7, emCena: "x", riscos: [null] })));
  const PALAVRAS = /\b(proposta|sugest|quest|passo|sistema|mecanismo)\b/i;
  t("o sistema não fala de si nos verbos", ps.every((p) => !PALAVRAS.test(p.verbo)));
  /* a fiação: a soleira lê as portas, e o toque passa pela proposta da frase */
  /* S7c (17/11): o import ganhou oRumoDaBusca ao lado — a asserção aceita a lista; a intenção (o App lê a abertura) fica */
  t("o App importa asPropostasDaAbertura", /import \{ asPropostasDaAbertura(, [A-Za-z]+)* \} from "\.\/propostas-da-abertura\.js"/.test(APP));
  t("as portas entram na soleira, dentro de calou", /asPropostasDaAbertura\(\{[\s\S]{0,400}\}\);[\s\S]{0,900}calou\("S5 · as portas da abertura"/.test(APP));
  t("o toque passa por proporAFrase e partirOTurno", /if \(proporAFrase\(p\.frase\)\) return;\s*partirOTurno\(p\.frase\);/.test(APP));
  t("as três ficam à vista, sem «+N»", /secundario: vivas\.length > 1 && !daAbertura/.test(APP));
}

/* S7c (17/11): O RUMO DA BUSCA — a sessão jogada não viu «Ir até Roda dos Punhos» depois da abertura */
{
  const passoCovil = { quest: "o_que_desce_ao_anoitecer", etapa: "fera", lugares: [], confronto: { papel: "fera", nome: "Quimera", quem: "o que desce ao anoitecer", covil: { nome: "Roda dos Punhos", cidade: "Doca Seca" } } };
  const r = oRumoDaBusca({ passos: [passoCovil], aqui: "Feira Velha", cidade: "Doca Seca" });
  t("S7c · o covil conhecido vira a porta «Ir até Roda dos Punhos», pela frase da abertura", r && r.verbo === "Ir até Roda dos Punhos" && r.frase === "Vou até Roda dos Punhos." && r.tipo === "rumo", JSON.stringify(r));
  t("S7c · um lugar da etapa (estar em / esteve) também", oRumoDaBusca({ passos: [{ lugares: [{ nome: "Curral da Ladeira", cidade: "Doca Seca" }] }], aqui: "" , cidade: "Doca Seca" }).verbo === "Ir até Curral da Ladeira");
  t("S7c · some ao chegar", oRumoDaBusca({ passos: [passoCovil], aqui: "Roda dos Punhos", cidade: "Doca Seca" }) === null);
  t("S7c · uma por vez: só o primeiro passo com lugar", oRumoDaBusca({ passos: [{ lugares: [] }, passoCovil, { lugares: [{ nome: "Outro Sítio" }] }], aqui: "" }).verbo === "Ir até Roda dos Punhos");
  t("S7c · na luta e na estrada, nada; lixo, nada", oRumoDaBusca({ passos: [passoCovil], emLuta: true }) === null && oRumoDaBusca({ passos: [passoCovil], naEstrada: true }) === null && oRumoDaBusca(null) === null && oRumoDaBusca({ passos: "x" }) === null);
}

console.log(`\n${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
