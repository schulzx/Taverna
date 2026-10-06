/* O COMO CHEGA (MM16 nº 5) — a frase do golpe final chega ao Mestre

   O DEFEITO, nas palavras da 3.ª sessão de prova (mente/mm11-sessao-3.md,
   defeito 5): *"o 'como' não chega — 0 de 2, e 0 de 5 em três sessões"*. No
   M21 o herói escreveu que esganava o lobo "com o antebraço"; no M30 a
   Iracema "quebra-lhe o pescoço com o calcanhar", escrito ao teclado com o
   contador a 129/240. As duas escolhas chegaram ao Narrador (o DESFECHO com
   o fato), as duas frases não — e a MM14 (v9.334) já tinha posto a frase na
   seção DESFECHO, de prio 2, justamente para isto.

   A CAUSA, PROVADA COM O REGISTO DA SESSÃO (registo-s3.jsonl, as 69
   chamadas): as pautas enviadas nas chamadas 45 (M21) e 68 (M30) remontam-se
   BYTE A BYTE com `textoDaPauta` a partir das linhas que lá estão (seção 1
   abaixo, com os textos verbatim). Somando a linha da cena, o texto que sai
   é o MESMO — o corte a tirava:

     M30: cabeça 293 + ONDE (80+31+213+278, prio 1,0..1,3) + fato 89 = 1164;
          + cena 287 = 1451 > 1400. Pulada; A GENTE (prio 6) entrou.
     M21: 1149 + cena 310 = 1459 > 1400. Pulada; A GENTE e ANTES entraram.

   O que pesou: a 4.ª linha do ONDE, 264 caracteres da economia de Vau
   Fincado ("cheira a cera, tinta e perfume caro") a meio de uma luta numa
   masmorra, com prio 1,3 — à frente do DESFECHO (2). O caminho do App está
   inteiro (o cartão → `responderGolpeFinal`/`responderGolpeFinalComp` →
   `envelopeDoGolpeFinal` → `golpeFinalEnvelopeRef` → `golpeFinalNaPauta`):
   o fato do MESMO envelope chegou nas duas chamadas, e a frase vai no mesmo
   envelope que ele. A MM14 provou a frase com um ONDE só do Geógrafo, sem a
   economia — o turno de prova não era o turno jogado.

   O CONSERTO, que esta suíte guarda: o DESFECHO e o veto de quem caiu são de
   FERRO (`PRIO_DE_FERRO`, abaixo de toda prio; a primeira linha do ONDE
   também, e ganha no empate), e a economia da cidade virou seção própria
   que CEDE por tabela (`SECOES_QUE_CEDEM`) em luta, masmorra e arredores.

   Antes do conserto esta suíte FALHA nas seções 1, 2, 3 e 5 (as frases da
   sessão não chegam; nas 500 cenas semeadas a frase cai em boa parte delas).
   Depois, 100%. Determinística: toda sorte entra por semente. */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { hashSemente, rng } from "../src/semente.js";
import * as P from "../src/pauta.js";
import { aplicarEscolha, envelopeDoGolpeFinal, golpeFinalNaPauta, TETO_DA_CENA_DO_JOGADOR } from "../src/golpe-final.js";

const { textoDaPauta, porNaPauta, garantirPauta, SECOES, TETO_DA_PAUTA } = P;
const AQUI = dirname(fileURLToPath(import.meta.url));

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);

/* ============================================================
   AS DUAS PAUTAS DA SESSÃO, verbatim do registo
   ============================================================ */
const ONDE_DA_CAMARA = (comporta) => [
  "em câmara das correntes · calor opressivo · (aqui isto é um forte)",
  "⌖ O13 74,0 · 61,0",
  comporta,
];
const ECONOMIA_DE_VAU = "Vau Fincado é de corte: vive do que os outros trazem para vender aqui. Cheira a cera, tinta e perfume caro. Aqui sobra relíquia e papel, e sai barato. Por aqui tudo passa — falta pouca coisa. Estação: Primavera. Não faça abundar o que falta nem faltar o que sobra.";
const SESSAO = {
  M21: {
    chamada: 45, turno: 19, enviada: 1369, heroi: "Tobias Varzim",
    frase: "Agarro o lobo pelo cachaço quando ele salta, rolo com ele no chão e aperto-lhe a garganta com o antebraço até a pata quebrada parar de arranhar a pedra.",
    onde: ONDE_DA_CAMARA("comporta: brigar de perto, um de cada vez, e usar o próprio corpo como porta; esconder o que se faz com as mãos; segurar a passagem sozinho, e obrigar a conversa a acabar aqui"),
    gente: "Iracema Sousa diz que isto vai voltar, e não diz quando",
    antes: "hoje, o posto da estrada (Iracema Sousa, Iracema, Lourdes, Lourdes Ferreira): \"Sem arco, então.\" Compro tochas e viro-me para a Iracema: \"Não vamos esperar pela…",
    naoPode: "o lugar não comporta: cercar por vários lados, correr, recuar sem virar as costas; ter certeza de quem é quem do outro lado do lugar; fugir sem passar por quem está no caminho",
  },
  M30: {
    chamada: 68, turno: 24, enviada: 1212, heroi: "Iracema Sousa",
    frase: "Iracema deixa-o vir, gira por baixo da mordida e quebra-lhe o pescoço com o calcanhar, num estalo seco que a câmara inteira ouve.",
    onde: ONDE_DA_CAMARA("comporta: brigar de perto, um de cada vez, e usar o próprio corpo como porta; sumir sem se esforçar, passar por quem está a dois passos; segurar a passagem sozinho, e obrigar a conversa a acabar aqui"),
    gente: "Iracema Sousa conta a coisa inteira, e conta de uma vez",
    antes: "",
    naoPode: "o lugar não comporta: cercar por vários lados, correr, recuar sem virar as costas; mirar de longe, reconhecer um rosto, ler; fugir sem passar por quem está no caminho",
  },
};
/* A pauta como o App de hoje a monta: a economia ainda como 4.ª linha do
   ONDE (`porNaPauta(p, "onde", envelopeDoComercio(...))`). */
const pautaDaSessao = (s, { economiaNoOnde = true } = {}) => {
  let p = porNaPauta({}, "onde", ...s.onde, economiaNoOnde ? ECONOMIA_DE_VAU : "");
  if (!economiaNoOnde) p = porNaPauta(p, "economia", ECONOMIA_DE_VAU);
  p = porNaPauta(p, "gente", s.gente);
  p = porNaPauta(p, "antes", s.antes);
  return porNaPauta(p, "naoPode", s.naoPode);
};
const lobo = (escolha) => aplicarEscolha({ nome: "Lobo", vida: 1 }, escolha, { semente: "mm16" });
const envDe = (s, frase, escolha = "letal") => envelopeDoGolpeFinal({ alvo: lobo(escolha), escolha, heroi: s.heroi, comoFez: frase });

/* ============================================================ */
sec("1. AS DUAS FRASES DA SESSÃO, nas pautas que foram enviadas");
for (const [m, s] of Object.entries(SESSAO)) {
  /* a reconstrução: a mesma pauta, só com o fato (o que chegou) */
  const soFato = textoDaPauta(golpeFinalNaPauta(pautaDaSessao(s), envDe(s, "")), { turno: s.turno });
  t(`${m}: a pauta remontada tem o tamanho da enviada na chamada ${s.chamada} (${soFato.length}/${s.enviada})`, soFato.length === s.enviada);
  t(`${m}: e traz o fato do DESFECHO, como a enviada`, soFato.includes(`DESFECHO  ${s.heroi} deu o golpe final em Lobo, e foi para matar`));
  /* e a frase escrita, pelo mesmo caminho */
  const env = envDe(s, s.frase);
  const com = textoDaPauta(golpeFinalNaPauta(pautaDaSessao(s), env), { turno: s.turno });
  t(`${m}: a frase escrita chega inteira (${s.frase.length} caracteres)`, com.includes(s.frase), `pauta ${com.length}`);
  t(`${m}: o fato também`, com.includes(env.acabou[0]));
  t(`${m}: e o lugar (a 1.ª linha do ONDE) fica`, com.includes(s.onde[0]));
  t(`${m}: dentro do teto (${com.length}/${TETO_DA_PAUTA})`, com.length <= TETO_DA_PAUTA && TETO_DA_PAUTA === 1400);
  /* poupando: o veto de quem caiu chega junto */
  const envP = envDe(s, s.frase, "nao_letal");
  const comP = textoDaPauta(golpeFinalNaPauta(pautaDaSessao(s), envP), { turno: s.turno });
  t(`${m}, poupando: a frase, o fato e o veto de quem caiu chegam`,
    comP.includes(s.frase) && comP.includes(envP.acabou[0]) && envP.naoPode.length === 1 && comP.includes(envP.naoPode[0]));
}

/* ============================================================ */
sec("2. O TETO DA CENA DO JOGADOR — 240 caracteres chegam inteiros");
{
  const base = "Iracema deixa-o vir, gira por baixo da mordida e quebra-lhe o pescoço com o calcanhar, num estalo seco que a câmara inteira ouve, ";
  let frase = base;
  while (frase.length < TETO_DA_CENA_DO_JOGADOR) frase += "e o eco volta das correntes ";
  frase = frase.slice(0, TETO_DA_CENA_DO_JOGADOR - 1).trimEnd() + ".";
  while (frase.length < TETO_DA_CENA_DO_JOGADOR) frase = "E " + frase.charAt(0).toLowerCase() + frase.slice(1);
  frase = frase.slice(0, TETO_DA_CENA_DO_JOGADOR);
  t(`a frase de prova tem exatamente o teto (${frase.length})`, frase.length === TETO_DA_CENA_DO_JOGADOR);
  for (const [m, s] of Object.entries(SESSAO)) for (const escolha of ["letal", "nao_letal"]) {
    const env = envDe(s, frase, escolha);
    const txt = textoDaPauta(golpeFinalNaPauta(pautaDaSessao(s), env), { turno: s.turno });
    t(`${m}, ${escolha}: os 240 chegam sem corte nem reticências`, txt.includes(`“${frase}”`) && env.naoPode.every((v) => txt.includes(v)) && txt.length <= TETO_DA_PAUTA);
  }
}

/* ============================================================
   3. N CENAS SEMEADAS — masmorra, luta, companheira, pauta no teto
   ============================================================ */
sec("3. 500 CENAS DE LUTA SEMEADAS — a frase chega em 100%");
const PALAVRAS = "agarro o lobo pelo cachaço rolo com ele no chão aperto a garganta com antebraço até pata quebrada parar de arranhar pedra giro por baixo da mordida quebro pescoço calcanhar estalo seco câmara inteira ouve desço lâmina pela nuca seguro antes de bater e grito nome do meu pai".split(" ");
const NOMES_HEROI = ["Tobias Varzim", "Iracema Sousa", "Lyra", "Ingrid Quebra-Escudos", "Bram"];
const NOMES_ALVO = ["Lobo", "Bandido", "Esqueleto", "Vorgath, o Carrasco das Sete Colinas", "Caititu de armadura"];
const texto = (r, min, max) => {
  const alvo = min + Math.floor(r() * (max - min + 1));
  let s = "";
  while (s.length < alvo) s += (s ? " " : "") + PALAVRAS[Math.floor(r() * PALAVRAS.length)];
  /* aparado: `garantirPauta` normaliza espaços, e a prova compara o texto como ele fica */
  return s.slice(0, alvo).trim();
};
const talvez = (r, p) => r() < p;
/* uma pauta de luta como as que o App monta hoje: o ONDE com o lugar, as
   coordenadas, o que o espaço comporta e a economia da cidade (e, às vezes,
   o domínio e a guilda), os vetos do Geógrafo, a gente, o contra, o momento,
   a fala, o antes. `ligado` = a fiação nova do App (economia na seção dela,
   e a cena a ceder). */
function cenaSemeada(i, { ligado }) {
  const r = rng(hashSemente(`como-chega|${i}`));
  const economia = texto(r, 200, 300);
  const onde = [texto(r, 40, 95), texto(r, 15, 25), "comporta: " + texto(r, 110, 210)];
  if (!ligado) onde.push(economia);
  if (talvez(r, 0.3)) onde.push(texto(r, 80, 160));
  if (talvez(r, 0.2)) onde.push(texto(r, 60, 140));
  let p = porNaPauta({}, "onde", ...onde);
  if (ligado) p = porNaPauta(p, "economia", economia);
  p = porNaPauta(p, "naoPode", ...Array.from({ length: 1 + Math.floor(r() * 3) }, () => texto(r, 80, 200)));
  for (const [id, pr, min, max] of [["gente", 0.8, 40, 120], ["contra", 0.6, 50, 130], ["momento", 0.4, 60, 160],
    ["fala", 0.35, 60, 200], ["antes", 0.7, 100, 180], ["acabou", 0.3, 60, 150], ["daqui", 0.3, 100, 180],
    ["mundo", 0.3, 100, 200], ["peso", 0.1, 80, 160], ["quem", 0.3, 30, 90]]) if (talvez(r, pr)) p = porNaPauta(p, id, texto(r, min, max));
  /* o golpe final do turno: o herói (com a frase dele, até acima do teto),
     e às vezes também a queda de um companheiro na mesma rodada */
  const escolha = talvez(r, 0.4) ? "nao_letal" : "letal";
  const heroi = NOMES_HEROI[Math.floor(r() * NOMES_HEROI.length)];
  const alvo = aplicarEscolha({ nome: NOMES_ALVO[Math.floor(r() * NOMES_ALVO.length)], vida: 2 }, escolha, { semente: `mm16|${i}` });
  const env = envelopeDoGolpeFinal({ alvo, escolha, heroi, comoFez: texto(r, 1, 300) });
  let junto = env;
  if (talvez(r, 0.25)) {
    const e2 = envelopeDoGolpeFinal({ alvo: aplicarEscolha({ nome: "Bandido", vida: 1 }, escolha, { semente: `mm16b|${i}` }), escolha, heroi: "Iracema Sousa" });
    junto = { acabou: [...env.acabou, ...e2.acabou], naoPode: [...env.naoPode, ...e2.naoPode] };
  }
  p = golpeFinalNaPauta(p, junto);
  if (ligado && typeof P.cederNaCena === "function") p = P.cederNaCena(p, { luta: true, masmorra: true });
  return { p, env, junto, onde0: onde[0], economia };
}
const N = 500;
for (const ligado of [false, true]) {
  let chega = 0, fato = 0, veto = 0, lugar = 0, teto = 0, semEconomia = 0;
  for (let i = 0; i < N; i++) {
    const { p, env, junto, onde0, economia } = cenaSemeada(i, { ligado });
    const txt = textoDaPauta(p, { turno: i + 1 });
    if (env.acabou[1] && txt.includes(env.acabou[1])) chega++;
    if (junto.acabou.filter((l) => !/nas palavras do jogador/.test(l)).every((l) => txt.includes(l))) fato++;
    if (junto.naoPode.every((l) => txt.includes(l))) veto++;
    if (txt.includes(onde0)) lugar++;
    if (txt.length <= TETO_DA_PAUTA) teto++;
    if (!txt.includes(economia)) semEconomia++;
  }
  const como = ligado ? "com a fiação nova (economia cede)" : "com o App de hoje (economia no ONDE)";
  t(`${como}: a frase do herói chega inteira em ${chega}/${N}`, chega === N);
  t(`${como}: todo fato de quem caiu chega (${fato}/${N})`, fato === N);
  t(`${como}: todo veto de quem caiu chega (${veto}/${N})`, veto === N);
  t(`${como}: a 1.ª linha do ONDE nunca cai (${lugar}/${N})`, lugar === N);
  t(`${como}: e o teto nunca passa (${teto}/${N})`, teto === N);
  if (ligado) t(`${como}: a economia da cidade não chega a nenhuma luta (${semEconomia}/${N})`, semEconomia === N);
}

/* ============================================================ */
sec("4. O FERRO, na tabela");
{
  const sP = (id) => SECOES.find((s) => s.id === id);
  const F = P.PRIO_DE_FERRO;
  t("PRIO_DE_FERRO existe e é a menor de todas", typeof F === "number" && F > 0 && SECOES.filter((s) => !["desfecho", "vetoDoDesfecho"].includes(s.id)).every((s) => s.prio > F));
  t("o DESFECHO é de ferro", sP("desfecho") && sP("desfecho").prio === F);
  t("o veto de quem caiu tem seção própria, de ferro, com o rótulo do NÃO PODE, logo antes dele",
    sP("vetoDoDesfecho") && sP("vetoDoDesfecho").prio === F && sP("vetoDoDesfecho").rotulo === sP("naoPode").rotulo
    && SECOES.indexOf(sP("vetoDoDesfecho")) + 1 === SECOES.indexOf(sP("naoPode")));
  t("a 1.ª linha do ONDE é de ferro, e o ONDE vem antes do DESFECHO na lista (ganha o empate)",
    sP("onde").ferro === 1 && SECOES.indexOf(sP("onde")) < SECOES.indexOf(sP("desfecho")));
  /* o pior dos piores: dois golpes no mesmo turno, os dois com frase no teto,
     nomes de 36 letras, poupando — a pauta inteira cheia de linhas longas.
     O lugar fica, a primeira frase fica, todo fato e todo veto ficam. */
  let cheia = {};
  for (const s of SECOES) if (!["desfecho", "vetoDoDesfecho"].includes(s.id)) cheia = porNaPauta(cheia, s.id, `${s.id} linha ` + "x".repeat(200), `${s.id} outra ` + "y".repeat(200));
  const longa = ("desço a lâmina pela nuca dele e seguro-o antes de bater no chão ").repeat(6);
  const nome = "Vorgath, o Carrasco das Sete Colinas";
  const e1 = envelopeDoGolpeFinal({ alvo: aplicarEscolha({ nome, vida: 1 }, "nao_letal", { semente: 1 }), escolha: "nao_letal", heroi: "Ingrid Quebra-Escudos", comoFez: longa });
  const e2 = envelopeDoGolpeFinal({ alvo: aplicarEscolha({ nome: nome + "!", vida: 1 }, "nao_letal", { semente: 2 }), escolha: "nao_letal", heroi: "Iracema Sousa", comoFez: longa });
  const env = { acabou: [...e1.acabou, ...e2.acabou], naoPode: [...e1.naoPode, ...e2.naoPode] };
  const txt = textoDaPauta(golpeFinalNaPauta(cheia, env));
  /* O QUE CEDE AQUI, escrito: o 2.º fato (prio 0,7) vem depois da 1.ª frase
     (0,6) e, neste caso absurdo, não cabe. É de propósito: o fato de quem
     caiu pela mão do companheiro também viaja na mensagem do turno ("abate,
     CAIU"), e o veto dele (de ferro, 0,6) fica — a frase do jogador só
     existe aqui. Nas 500 lutas semeadas (seção 3), com 1 em 4 trazendo a
     queda do companheiro, nenhum fato cede. */
  t(`pior dos piores: o lugar, a 1.ª frase, o 1.º fato e os dois vetos (${txt.length}/${TETO_DA_PAUTA})`,
    txt.includes("onde linha ") && txt.includes(e1.acabou[1]) && [e1.acabou[0], ...env.naoPode].every((l) => txt.includes(l)) && txt.length <= TETO_DA_PAUTA);
  console.log(`      (o 2.º fato ${txt.includes(e2.acabou[0]) ? "entra" : "cede"}; a 2.ª frase ${txt.includes(e2.acabou[1]) ? "entra" : "cede"})`);
}

/* ============================================================ */
sec("5. O QUE CEDE ONDE — a tabela e a porta");
{
  const T = P.SECOES_QUE_CEDEM;
  const ceder = P.cederNaCena;
  t("a tabela existe, com luta, masmorra e arredores", !!T && ["luta", "masmorra", "arredores"].every((k) => Array.isArray(T[k]) && T[k].length));
  t("toda seção da tabela existe em SECOES", !!T && Object.values(T).flat().every((id) => SECOES.some((s) => s.id === id)));
  t("a economia cede nas três", !!T && ["luta", "masmorra", "arredores"].every((k) => T[k].includes("economia")));
  t("nenhuma seção de ferro, nem o ONDE, nem o veto cede em lugar nenhum", !!T && Object.values(T).flat().every((id) => !["onde", "desfecho", "vetoDoDesfecho", "naoPode", "fala"].includes(id)));
  if (typeof ceder === "function") {
    const s = SESSAO.M30;
    const base = pautaDaSessao(s, { economiaNoOnde: false });
    const copia = JSON.stringify(base);
    const naLuta = ceder(base, { luta: true, masmorra: true });
    t("na luta, a economia sai", !naLuta.economia && !!base.economia);
    t("a pauta recebida fica intacta", JSON.stringify(base) === copia);
    t("na cidade (sem condição), nada sai", JSON.stringify(ceder(base, {})) === JSON.stringify(garantirPauta(base)));
    t("lixo não tira nada", [null, undefined, 3, "luta", []].every((x) => JSON.stringify(ceder(base, x)) === JSON.stringify(garantirPauta(base))));
    t("pauta de lixo vira pauta válida", JSON.stringify(ceder(null, { luta: true })) === "{}");
    t("a condição de fora da tabela não tira nada", JSON.stringify(ceder(base, { inventada: true })) === JSON.stringify(garantirPauta(base)));
    /* e na cidade a economia continua a ler-se como linha do ONDE */
    const naCidade = textoDaPauta(porNaPauta(porNaPauta({}, "onde", "na praça de Vau Fincado"), "economia", ECONOMIA_DE_VAU));
    t("na cidade a economia sai no bloco do ONDE, sem rótulo novo", naCidade.includes("ONDE      na praça de Vau Fincado\n          " + ECONOMIA_DE_VAU));
    /* e o veto de quem caiu sai no bloco do NÃO PODE, à frente */
    const env = envDe(s, "", "nao_letal");
    const tv = textoDaPauta(golpeFinalNaPauta(base, env));
    t("o veto de quem caiu abre o bloco do NÃO PODE, e o rótulo aparece uma vez só",
      tv.includes(`NÃO PODE  ${env.naoPode[0]}\n          ${s.naoPode}`) && tv.split("NÃO PODE ").length === 2);
  } else t("cederNaCena existe", false);
}

/* ============================================================ */
sec("6. A FIAÇÃO NO App E O CARTÃO NO ECRÃ (texto, corpo por âncora)");
{
  const ler = (f) => readFileSync(join(AQUI, "..", "src", f), "utf8").replace(/\r\n/g, "\n");
  const APP = ler("App.jsx");
  const TEL = ler("painel-batalha.jsx");
  /* o corpo pela âncora da declaração até o fim da função — nunca por
     número de linha, que anda a cada ciclo que toca o App */
  const DECL = 'const pautaDoTurno = (acaoDoTurno = "") => {';
  const i = APP.indexOf(DECL);
  const corpo = i < 0 ? "" : APP.slice(i, APP.indexOf("\n  };\n", i));
  t("pautaDoTurno existe no App", corpo.length > 0);
  t("o App importa cederNaCena de ./pauta.js", /import \{[^}]*\bcederNaCena\b[^}]*\} from "\.\/pauta\.js"/.test(APP));
  /* a seções 3 e 5 provam o motor; isto prova que o App o USA. Sem esta
     linha a economia volta a ser 4.ª linha do ONDE (prio 1,3) e o defeito
     da sessão 3 volta inteiro, com as suítes do motor verdes. */
  t('a economia vai na seção dela ("economia", não "onde")',
    /porNaPauta\(p, "economia", envelopeDoComercio\(/.test(corpo) && !/porNaPauta\(p, "onde", envelopeDoComercio\(/.test(APP));
  /* e a cena cede: luta, masmorra e fora dos muros, dentro de try/catch
     (nunca pode custar o turno), e DEPOIS de tudo posto — ceder antes de
     montar não tiraria nada */
  const iCeder = corpo.indexOf("cederNaCena(p, {");
  t("pautaDoTurno chama cederNaCena com a luta, a masmorra e os arredores",
    iCeder > 0 && /cederNaCena\(p, \{ luta: !!combateRef\.current, masmorra: !!masmorraRef\.current, arredores: fora \}\)/.test(corpo));
  t("…em try/catch, pelo calou",
    /try \{[^}]*cederNaCena\(p, \{[^}]*\}\);\s*\} catch \(e\) \{ calou\("cederNaCena", e\); \}/.test(corpo));
  t("…e é a última coisa antes do return (o que vem depois não cederia)",
    iCeder > 0 && corpo.indexOf("return p;", iCeder) > iCeder && !/porNaPauta\(/.test(corpo.slice(iCeder)));
  /* fora dos muros é o mesmo sinal de `ondeSeProcura`: sem cidade, ou lugar
     marcado `arredores`. `lugarRef` sozinho seria verdadeiro numa taberna. */
  t("arredores = sem cidade, ou lugar com distancia \"arredores\"",
    /const fora = !cidadeAtualRef\.current \|\| !!\(lugarRef\.current && lugarRef\.current\.distancia === "arredores"\);/.test(corpo));

  /* O CARTÃO. Ancorado na linha do veredito com `bottom: 100%`, num ecrã de
     310 px o topo ficava em y −85 e o foco não rolava: o "como" escrevia-se
     às cegas. O golpe final não tem relógio — vai NO FLUXO (prop `decisao`),
     no lugar dos verbos; a reação (K3, com relógio) continua sobreposta. */
  t("o cartão do golpe final já não vai no slot da reação",
    /const reacaoDaBatalha = \(emBatalha && janelaReacao \?/.test(APP) && !/reacaoDaBatalha = golpeFinalDaBatalha/.test(APP));
  t("vai pela prop decisao", /decisao=\{golpeFinalDaBatalha\}/.test(APP));
  t("a TelaDeBatalha desenha a decisão no fluxo, no lugar da fileira de verbos",
    /\) : p\.decisao \? \(/.test(TEL) && TEL.indexOf(") : p.decisao ? (") < TEL.indexOf("<FileiraDeVerbos verbos="));
  t("o lugar da decisão não é absoluto (nasce no fluxo, visível)",
    (() => { const k = TEL.indexOf(") : p.decisao ? ("); const bloco = TEL.slice(k, TEL.indexOf("<FileiraDeVerbos verbos=", k)); return k > 0 && !/position: "absolute"/.test(bloco) && /\{p\.decisao\}/.test(bloco); })());
  t("enquanto ela espera, o texto livre sai (um `como?` só no ecrã)", /\{!p\.decisao && <div className="flex items-center gap-2 rounded-lg px-2 shrink-0"/.test(TEL));
  /* o foco vai ao campo SEM rolar (no 1.º quadro a tela ainda não sabe se é
     telefone, e o rolar ficava preso: a 374 × 310 o cartão abria rolado 47 px);
     quem rola, se faltar ecrã, é a tela, depois de saber o tamanho */
  const GF = ler("painel-golpe-final.jsx");
  t("o campo do cartão recebe o foco sem rolar", /focus\(\{ preventScroll: true \}\)/.test(GF));
  t("e a tela o traz à vista depois de saber se é telefone",
    /scrollIntoView\(\{ block: "nearest" \}\)/.test(TEL) && /\}, \[esperando, noTelefone\]\);/.test(TEL));
  /* enquanto o cartão espera, os controles do turno (parados) devolvem a
     altura: medido a 374 × 310, só assim campo, contador e os dois botões
     cabem sem rolar */
  t("os controles do turno saem enquanto a decisão espera (a vez, o veredito, a tira no telefone)",
    /\{!esperando && <FaixaDaVez /.test(TEL) && /\{!esperando && <LinhaDoVeredito /.test(TEL) && /\{!\(esperando && noTelefone\) && lateral\}/.test(TEL));
}

console.log(`\ncomo chega (MM16 nº 5): ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
