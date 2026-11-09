/* teste-batalha-na-tela.mjs (CB, 09/11/2026) — a batalha na tela, formas.md
   §CB: a conta pura (src/batalha-na-tela.js) e as peças renderizadas de
   verdade (ui.jsx, grade-de-batalha.jsx, painel-batalha.jsx,
   painel-encontro.jsx, painel-bandeja.jsx).

   O JSX não corre em Node: a suíte empacota um ponto de entrada com o
   esbuild (o mesmo que o vite usa) e lê o HTML de renderToStaticMarkup,
   como teste-painel-espolio. A janela é de mentira (matchMedia pela
   largura que cada secção pede).

   Prova:
   1. a previsão sobre o alvo: os sete estados de §CB 3, o arredondamento
      (nunca casas decimais), e as 20 faces do d20 com a legenda;
   2. a intenção: os quatro tipos do motor, o alvo escondido («→ ?»), a
      caveira só a partir de 0,25, e as chaves da tabela iguais às do motor;
   3. as casas marcadas: o sopro pinta as casas da área com a chama, o
      caminho desenha a linha, o golpe livre e o destino;
   4. o número do golpe: o crítico diferente (maior, âmbar, «CRÍTICO»), o
      erro baço, o golpe em ti a perigo, a soma de cada desfecho ≤ 400;
   5. o fecho: o chip da queda do meio, e o véu do último;
   6. o encontro: as seis escolhas pela ordem do motor, e perante um
      lendário a fuga à vista (CERTO, em musgo, nunca esbatida) e o lutar
      com o aviso;
   7. as três colunas sem rolar a 1905, 1366 e 1024; o telefone com 99
      casas e a câmara que enquadra quem importa;
   8. os rótulos acessíveis (a pílula, a casa do alvo, a fila, a economia,
      o cartão do encontro, as faces);
   9. o d20 do golpe na bandeja, com as faces que acertam. */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { buildSync } from "esbuild";
import {
  T, PREVISAO_DO_GOLPE, INTENCAO_NA_MESA, GOLPE_SENTIDO, BATALHA_EM_TRES, FECHO_DA_QUEDA, CARTAO_DO_ENCONTRO, FILA_DA_VEZ, ECONOMIA_DA_VEZ, CAMINHO_NO_CHAO,
} from "../src/estilo.js";
import {
  pilulaDaPrevisao, golpePorExtenso, pilulaDaIntencao, variacaoDoGolpe, somaDoGolpe, geometriaDaMesa, camaraDoTelefone,
  pipsDaEconomia, filaDaVez, chipDaQueda, linhaDaEscolha, faixaDaAmeaca, chipDoAvistamento, botaoDoEncontro, avisoDaArea,
} from "../src/batalha-na-tela.js";
import { INTENCAO_DO_INIMIGO } from "../src/intencao.js";
import { facesQueAcertam } from "../src/previsao.js";
import { eventoDoGolpe } from "../src/combate.js";
import { oEncontroNaEstrada, escolhasDoEncontro, avistar, ESCOLHAS_DO_ENCONTRO } from "../src/encontro-na-estrada.js";
import { faixaDaVez } from "../src/tela-de-batalha.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? "\n      " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const J = (x) => JSON.stringify(x);
const AQUI = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(AQUI, "..", "src");

/* uma previsão como previsaoDoHeroi a devolve (as faces pela regra do motor) */
const PREV = {
  alvo: "Bandido", chance: 0.7812, chanceCritico: 0.05, modo: null, bonus: 6, defesa: 12,
  dano: { min: 6, medio: 9.5, max: 13 }, danoCritico: { min: 7, medio: 14, max: 21 }, danoEsperado: 7.4,
  abate: 0.12, abateNoTurno: 0.4012, cobertura: 0, golpes: 1, faces: facesQueAcertam(6, 12, 20), criticoEm: 20,
};

/* ============================================================ */
sec("1. a previsão do golpe sobre o alvo (§CB 3)");
{
  const v = pilulaDaPrevisao(PREV);
  t("ao alcance com 40% de abate: abate-possivel, «78%», «6–13», «40%»", v.estado === "abate-possivel" && v.chance === 78 && v.dano === "6–13" && v.abate === 40, J(v));
  t("a chance arredonda ao inteiro: nunca as casas decimais da conta", Number.isInteger(v.chance) && !/\./.test(String(v.chance)));
  t("abaixo de 0,05 é alcance (sem caveira)", pilulaDaPrevisao({ ...PREV, abateNoTurno: 0.04 }).estado === "alcance" && pilulaDaPrevisao({ ...PREV, abateNoTurno: 0.04 }).abate === null);
  t("de 0,995 para cima é abate-certo, com o aro de perigo", (() => { const x = pilulaDaPrevisao({ ...PREV, abateNoTurno: 0.996 }); return x.estado === "abate-certo" && x.abateCerto && x.aroLetal; })());
  t("os limiares são os da tabela (0,05 e 0,995)", PREVISAO_DO_GOLPE.abatePossivel === 0.05 && PREVISAO_DO_GOLPE.abateCerto === 0.995);
  t("com cobertura: coberto, com o −N", (() => { const x = pilulaDaPrevisao({ ...PREV, abateNoTurno: 0.01, cobertura: 2 }); return x.estado === "coberto" && x.coberto === 2; })());
  t("andar antes de golpear: anda-e-ataca, com os metros", (() => { const x = pilulaDaPrevisao({ ...PREV, golpesLivres: { quem: [] } }, { caminho: { metros: 7.5 } }); return x.estado === "anda-e-ataca" && x.anda === "7,5 m"; })());
  t("o caminho que provoca golpe livre: golpe-livre, aro de perigo", (() => { const x = pilulaDaPrevisao({ ...PREV, golpesLivres: { quem: [{ nome: "Bandido", chance: 0.5, dano: { min: 4, max: 9 } }] } }, { caminho: { metros: 7.5 } }); return x.estado === "golpe-livre" && x.aroLetal; })());
  t("sem linha de vista: sem número nenhum", (() => { const x = pilulaDaPrevisao({ ...PREV, semVista: true }); return x.estado === "sem-vista" && x.chance === null && x.dano === null; })());
  t("sem previsão, a pílula cala-se", pilulaDaPrevisao(null) === null);
  const g = golpePorExtenso(PREV);
  t("o teu golpe: as 20 faces, acesas as que acertam (6 a 20 com +6 contra 12)", g.faces.length === 20 && g.faces.filter((f) => f.acerta).map((f) => f.n).join(",") === "6,7,8,9,10,11,12,13,14,15,16,17,18,19,20");
  t("a legenda em coisa de mesa: «acertas com 6 ou mais no dado · o 20 é crítico»", g.legenda === "acertas com 6 ou mais no dado · o 20 é crítico", g.legenda);
  t("o crítico em 19 diz «19–20 é crítico»", golpePorExtenso({ ...PREV, faces: facesQueAcertam(6, 12, 19), criticoEm: 19 }).legenda.endsWith("19–20 é crítico"));
  t("sem as faces do motor, a fileira cala-se (null), o resto fica", (() => { const x = golpePorExtenso({ ...PREV, faces: undefined }); return x.faces === null && x.legenda === null && x.chance === 78; })());
  t("o dano com a média por extenso («9,5»), o abate e o crítico", g.dano.texto === "6–13" && g.dano.medio === "9,5" && g.abate === 40 && g.critico.chance === 5 && g.critico.dano === "7–21");
}

/* ============================================================ */
sec("2. a intenção do inimigo (§CB 4)");
{
  t("as chaves da tabela são os tipos do motor (INTENCAO_DO_INIMIGO.tipos)",
    J(Object.keys(INTENCAO_NA_MESA.glifo).sort()) === J([...INTENCAO_DO_INIMIGO.tipos].sort()) && J(Object.keys(INTENCAO_NA_MESA.cor).sort()) === J([...INTENCAO_DO_INIMIGO.tipos].sort()));
  t("as cores são tintas de T (perigo para atacar e sopro)", INTENCAO_NA_MESA.cor.atacar === T.danger && INTENCAO_NA_MESA.cor.sopro === T.danger && INTENCAO_NA_MESA.cor.aproximar === T.inkMeio && INTENCAO_NA_MESA.cor.fugir === T.inkDim);
  const at = pilulaDaIntencao({ tipo: "atacar", alvo: "Bran", golpes: 1, dano: { min: 7, max: 12 }, abate: 0.1, area: null });
  t("atacar: espadas, «7–12», o alvo, sem caveira abaixo de 0,25", at.glifo === "espadas" && at.texto === "7–12" && at.alvo === "Bran" && !at.letal);
  const esc = pilulaDaIntencao({ tipo: "atacar", alvo: null, golpes: 1, dano: { min: 7, max: 12 }, abate: null, area: null });
  t("a mente brilhante esconde o alvo, nunca o tipo («→ ?»)", esc.tipo === "atacar" && esc.alvoEscondido && esc.alvo === null);
  const let_ = pilulaDaIntencao({ tipo: "atacar", alvo: "Bran", golpes: 2, dano: { min: 7, max: 12 }, abate: 0.35, area: null });
  t("de 0,25 para cima, a caveira e «35%»", let_.letal && let_.abate === 35 && INTENCAO_NA_MESA.abateQueSeAnuncia === 0.25);
  const so = pilulaDaIntencao({ tipo: "sopro", alvo: "Bran", golpes: 1, dano: { min: 14, max: 24 }, abate: 0.2, area: Array.from({ length: 9 }, (_, i) => ({ x: i, y: 0 })) });
  t("sopro: a chama, «14–24 · 9 casas»", so.glifo === "chama" && so.texto === "14–24 · 9 casas");
  t("aproximar: «vem · 9 m»", pilulaDaIntencao({ tipo: "aproximar", alvo: "Bran", golpes: 0, dano: null, abate: null, area: null }, { distanciaM: 9 }).texto === "vem · 9 m");
  t("fugir: «foge»", pilulaDaIntencao({ tipo: "fugir", alvo: null, golpes: 0, dano: null, abate: null, area: null }).texto === "foge");
  t("todo tipo tem glifo e texto (e rótulo para quem ouve)", INTENCAO_DO_INIMIGO.tipos.every((tp) => { const x = pilulaDaIntencao({ tipo: tp, alvo: "Bran", dano: { min: 1, max: 2 }, area: [{ x: 0, y: 0 }] }, { distanciaM: 3 }); return x && x.glifo && x.texto && x.rotulo; }));
}

/* ============================================================ */
sec("4. o golpe sentido: o número, a variante e o tempo (§CB 5)");
{
  const r = (resultado, dano, extra = {}) => ({ tipo: "ataque", atacante: "Bran", alvo: "Bandido", resultado, dano, d20: 15, bonus: 6, total: 21, ca: 12, critico: resultado === "critico", ...extra });
  const acerto = variacaoDoGolpe(eventoDoGolpe(r("acerta", 8), { vidaAntes: 20, vidaMax: 20, lado: "heroi" }), { heroi: "Bran" });
  const critico = variacaoDoGolpe(eventoDoGolpe(r("critico", 16), { vidaAntes: 30, vidaMax: 30, lado: "heroi" }), { heroi: "Bran" });
  const erro = variacaoDoGolpe(eventoDoGolpe(r("erra", 0), { vidaAntes: 20, vidaMax: 20, lado: "heroi" }), { heroi: "Bran" });
  const queda = variacaoDoGolpe(eventoDoGolpe(r("acerta", 9), { vidaAntes: 8, vidaMax: 8, lado: "heroi" }), { heroi: "Bran" });
  const emTi = variacaoDoGolpe(eventoDoGolpe({ ...r("acerta", 9), atacante: "Bandido", alvo: "Bran" }, { vidaAntes: 28, vidaMax: 28, lado: "inimigo" }), { heroi: "Bran" });
  t("o acerto: «-8», 32, tom dano, 380 ms", acerto.variante === "acerto" && acerto.texto === "-8" && acerto.tamanho === GOLPE_SENTIDO.numero.dano && acerto.soma === 380);
  t("O CRÍTICO É DIFERENTE: maior (44), âmbar, «CRÍTICO», a mesa treme", critico.variante === "critico" && critico.tamanho === GOLPE_SENTIDO.numero.critico && critico.tamanho > acerto.tamanho && critico.tom === "critico" && critico.etiqueta === "CRÍTICO" && critico.mesa);
  t("o erro: «errou», baço, sem pausa (160 ms de desvio)", erro.variante === "erro" && erro.texto === "errou" && erro.tom === "erro" && erro.classes.pausa === null && erro.classes.tremor === "tv-golpe-desvia" && erro.soma === 160);
  t("a queda: afunda, 390 ms", queda.variante === "abate" && queda.classes.afunda === "tv-golpe-afunda" && queda.soma === 390);
  t("em ti: o número a perigo; a moldura só com um quarto do PV ou mais", emTi.emTi && emTi.tom === "emTi" && emTi.borda === true && GOLPE_SENTIDO.emTi.peso === 0.25);
  t("em ti, um arranhão não acende a moldura", variacaoDoGolpe(eventoDoGolpe({ ...r("acerta", 2), atacante: "Bandido", alvo: "Bran" }, { vidaAntes: 28, vidaMax: 28, lado: "inimigo" }), { heroi: "Bran" }).borda === false);
  t("a régua dos 400 ms: pausa + tremor + assenta ≤ teto, em cada desfecho", ["acerto", "critico", "abate", "erro"].every((v) => somaDoGolpe(v) <= GOLPE_SENTIDO.teto), ["acerto", "critico", "abate", "erro"].map((v) => `${v} ${somaDoGolpe(v)}`).join(" · "));
  t("o imune e o impedido dizem-se por palavra", variacaoDoGolpe({ tipo: "golpe", desfecho: "imune", dano: 0, alvo: "x" }).texto === "imune" && variacaoDoGolpe({ tipo: "golpe", desfecho: "impedido", dano: 0, alvo: "x" }).texto === "impedido");
  t("o número fica o golpe, a leitura (900) e o esvanecer (200)", acerto.dura === 380 + GOLPE_SENTIDO.leitura + GOLPE_SENTIDO.esvai);
}

/* ============================================================ */
sec("5. o fecho (§CB 6)");
{
  const c = chipDaQueda("Bandido", "nao_letal");
  t("a queda do meio: «Bandido cai · poupado», e o outro lado é «matar»", c.texto === "Bandido cai · poupado" && c.outro === "matar" && c.outraEscolha === "letal");
  t("depois do primeiro «matar», a lembrada é matar: o chip oferece poupar", chipDaQueda("Bandido", "letal").outro === "poupar");
  t("o chip fica 4 s, e o véu do último é a 45 %", FECHO_DA_QUEDA.chip === 4000 && FECHO_DA_QUEDA.veuDoUltimo === 0.45);
}

/* ============================================================ */
sec("6. o encontro na estrada (§CB 7)");
const DRAGAO = { tipo: "perigo", criatura: "Dragão Ancião", ameaca: "lendario", quantos: 1, nivelRef: 16, perigo: "mortal", importante: true };
const BANDIDO = { tipo: "perigo", criatura: "Bandido", ameaca: "comum", quantos: 1, nivelRef: 2, perigo: "baixo" };
const naEscolha = (enc, quemViu) => {
  const s = oEncontroNaEstrada(enc, { pers: { nivel: 3, atributos: {}, grupo: [] }, dia: 1, trecho: "A>B" });
  return s.fase === "escolha" ? { ...s, quemViu } : avistar(s, { d20: quemViu === "heroi" ? 20 : 1, sorte: () => 0.99 });
};
const LENDA = naEscolha(DRAGAO, "heroi");
const ESC_LENDA = escolhasDoEncontro(LENDA, { bonus: { furtividade: 3, sobrevivencia: 1, persuasao: 1, atletismo: 2 }, moedas: 100 });
{
  t("o estado chega à escolha", LENDA && LENDA.fase === "escolha");
  const linhas = ESC_LENDA.map((v) => linhaDaEscolha(v, LENDA, {}));
  t("as seis escolhas, pela ordem do motor", linhas.length === 6 && J(linhas.map((l) => l.id)) === J(ESCOLHAS_DO_ENCONTRO.ordem));
  const fuga = linhas.find((l) => l.id === "fugir");
  t("PERANTE A LENDA A FUGA VÊ-SE: fuga-segura, «CERTO», tocável, «ainda não te viu: recuar é seguro»", fuga.estado === "fuga-segura" && fuga.chance === "CERTO" && fuga.tocavel && fuga.falha === "ainda não te viu: recuar é seguro", J(fuga));
  const lutar = linhas.find((l) => l.id === "lutar");
  t("lutar perante a lenda: lutar-lenda, «Isto não é um encontro. É uma lenda.»", lutar.estado === "lutar-lenda" && lutar.falha === "Isto não é um encontro. É uma lenda.");
  const neg = linhas.find((l) => l.id === "negociar");
  t("cada linha diz a perícia e a CD, a chance e o que custa falhar", neg.pericia === "Persuasão" && neg.cd === 17 && /%$/.test(neg.chance) && /^se falhar: /.test(neg.falha), J(neg));
  t("o custo: as horas, e o tributo em moedas", linhas.find((l) => l.id === "evitar").horas === 2 && neg.moedas === 70);
  t("o botão diz a escolha e o preço («Esconder-se · N% · 1 h»)", /^Esconder-se · \d+% · 1 h$/.test(botaoDoEncontro(linhas.find((l) => l.id === "esconder"))), botaoDoEncontro(linhas.find((l) => l.id === "esconder")));
  t("a faixa da lenda: «Uma lenda · foge disto»; sem número de capacidade", faixaDaAmeaca(LENDA).tipo === "lenda" && !/\d/.test(faixaDaAmeaca(LENDA).texto));
  t("o chip: «ainda não te viu»", chipDoAvistamento(LENDA).texto === "ainda não te viu" && !chipDoAvistamento(LENDA).visto);
  const VIU = naEscolha(BANDIDO, "eles");
  const lv = escolhasDoEncontro(VIU, { bonus: {}, moedas: 0 }).map((v) => linhaDaEscolha(v, VIU, {}));
  const escondeVisto = lv.find((l) => l.id === "esconder");
  t("já te viu: esconder-se impedida, chance «—», o porquê no lugar do falhar, e não se esbate (continua lá)", escondeVisto.estado === "impedida" && escondeVisto.chance === "—" && escondeVisto.falha === "já te viu" && lv.length === 6);
  t("sem moedas: negociar impedida com «faltam moedas»", lv.find((l) => l.id === "negociar").falha === "faltam moedas");
  t("o chip: «já te viu»", chipDoAvistamento(VIU).visto);
  t("a escolhida acende (aro âmbar 3)", linhaDaEscolha(ESC_LENDA[1], LENDA, { escolhida: "esconder" }).estado === "escolhida" && CARTAO_DO_ENCONTRO.linha.aroEscolhida === 3);
  t("a entrada na mesa: 1 200 ms, véu 0–300, cresce 300–800, mesa 800–1 200", CARTAO_DO_ENCONTRO.entrada.total === 1200 && J(CARTAO_DO_ENCONTRO.entrada.veu) === "[0,300]" && J(CARTAO_DO_ENCONTRO.entrada.mesa) === "[800,1200]");
}

/* ============================================================ */
sec("7. as três colunas, sem rolar; o telefone com 99 casas (§CB 2, §CB 9, §CB 16.2)");
{
  /* §CB 16.2: a tabela de medidas da mesa que cabe. Era «casa 51» a 1905:
     o 51 do quadro 344:156 não pagava o Pé do campo (32 + fio + aro) nem a
     fila de 90 (a tabela dizia 84), e a tela real deu 42. Com a conta que
     fecha, 49 com rato e 48 com toque — e 48 é um alvo de dedo inteiro. */
  const g1905 = geometriaDaMesa({ largura: 1905, altura: 1000 });
  const g1905t = geometriaDaMesa({ largura: 1905, altura: 1000, grosso: true });
  t("1905 × 1000: três colunas de 470, centro 869, janela 713, casa 49 (rato) e 48 (toque), 196/196 sem rolar, com pip",
    g1905.arranjo === "tres" && g1905.coluna === 470 && g1905.centro === 869 && g1905.campo.altura === 713 && g1905.casa === 49 && g1905t.casa === 48
    && g1905.cabe && g1905t.cabe && g1905.casasAVista === 196 && g1905.comPip, J(g1905));
  /* a 1366 a casa continua 34 com rato, mas agora CABE: a tela real rolava
     com a casa no piso de 32 (a conta antiga não tinha o veredito, o pé nem
     os verbos em duas linhas). As colunas ficam a 321 e o centro a 660. */
  const g1366 = geometriaDaMesa({ largura: 1366, altura: 768 });
  const g1366t = geometriaDaMesa({ largura: 1366, altura: 768, grosso: true });
  t("1366 × 768: três colunas de 321, centro 660 com pip, janela 501, casa 34 (rato) e 33 (toque), cabe",
    g1366.arranjo === "tres" && g1366.coluna === 321 && g1366.centro === 660 && g1366.comPip && g1366.campo.altura === 501
    && g1366.casa === 34 && g1366t.casa === 33 && g1366.cabe && g1366t.cabe, J(g1366));
  const g1024 = geometriaDaMesa({ largura: 1024, altura: 768 });
  const g1024t = geometriaDaMesa({ largura: 1024, altura: 768, grosso: true });
  t("1024 × 768: duas colunas (Tu a 320; Eles em gaveta), centro 656 sem pip, casa 34 (rato) e 33 (toque), cabe",
    g1024.arranjo === "duas" && g1024.coluna === 320 && g1024.centro === 656 && !g1024.comPip && g1024.casa === 34 && g1024t.casa === 33 && g1024.cabe && g1024t.cabe, J(g1024));
  t("o centro nunca desce do piso dos seis gestos sem pip (540)", [1024, 1100, 1280, 1366, 1439].every((l) => geometriaDaMesa({ largura: l, altura: 768 }).centro >= BATALHA_EM_TRES.centroMinimo));
  t("nunca abaixo do piso do rato (32) nem acima de 64", [g1905, g1366, g1024, g1905t, g1366t, g1024t].every((g) => g.casa >= BATALHA_EM_TRES.casaMinima && g.casa <= BATALHA_EM_TRES.casaMaxima));
  t("a barra mede 106 com rato e 122 com toque (a diferença é o ponteiro, não a largura)",
    g1905.campo.altura - g1905t.campo.altura === 2 * (BATALHA_EM_TRES.verbo.grosso - BATALHA_EM_TRES.verbo.fino) && BATALHA_EM_TRES.verbo.fino === 40 && BATALHA_EM_TRES.verbo.grosso === 48);
  /* §CB 16.2, o telefone: a casa deixou de ser 40 fixa — é o que cabe na
     janela de 9 × 11 (o alvo), entre 32 e 40. A 812 continua 40 e 99 casas;
     a 760 (o navegador com as barras) desce a 36 e vê 110. */
  const tel = geometriaDaMesa({ largura: 375, altura: 812 });
  t("375 × 812: o telefone, janela 361 × 453, casa 40, 9 × 11 = 99 casas (era 35, e 70 na tela real)", tel.arranjo === "telefone" && tel.casa === 40 && tel.casasAVista === 99 && tel.campo.largura === 361 && tel.campo.altura === 453, J(tel));
  const tel760 = geometriaDaMesa({ largura: 375, altura: 760 });
  t("375 × 760: janela 401, casa 36, 10 × 11 = 110 casas", tel760.casa === 36 && tel760.casasAVista === 110 && tel760.campo.altura === 401, J(tel760));
  const camT = camaraDoTelefone({ colunas: 14, linhas: 14, heroi: { x: 5, y: 7 }, alvo: { x: 6, y: 8 }, importa: [], larguraUtil: 361, alturaUtil: 401 });
  t("a câmara conta com a mesma casa da geometria (36, 10 × 11), sem a calha a descontar", camT.casa === 36 && J(camT.janela) === "[10,11]", J(camT));
  const cam = camaraDoTelefone({ colunas: 14, linhas: 14, heroi: { x: 5, y: 7 }, alvo: { x: 6, y: 8 }, importa: [] });
  t("a câmara enquadra o herói e o alvo a 40, 9 × 11", cam.casa === 40 && J(cam.janela) === "[9,11]" && cam.casasAVista === 99 && cam.marcadores.length === 0, J(cam));
  t("e o herói e o alvo cabem na janela", cam.x0 <= 5 && 6 < cam.x0 + 9 && cam.y0 <= 7 && 8 < cam.y0 + 11);
  const larga = camaraDoTelefone({ colunas: 14, linhas: 14, heroi: { x: 2, y: 2 }, alvo: { x: 3, y: 3 }, importa: [{ nome: "Dragão", x: 10, y: 4 }] });
  t("quem não cabe em 9 × 11 faz a casa descer a 32 (11 × 13)", larga.casa === 32 && J(larga.janela) === "[11,13]", J(larga));
  const longe = camaraDoTelefone({ colunas: 18, linhas: 14, heroi: { x: 1, y: 1 }, alvo: { x: 2, y: 2 }, importa: [{ nome: "Goblin", x: 16, y: 12 }] });
  t("nem assim: o herói e o alvo ficam, e o outro ganha o marcador na borda com a distância", longe.marcadores.length === 1 && longe.marcadores[0].nome === "Goblin" && longe.marcadores[0].distanciaM === 22.5, J(longe));
}

/* ============================================================ */
sec("8. a economia, a fila e o aviso da área (§CB 8, §CB 2)");
{
  const pips = pipsDaEconomia({ acao: 1, extra: 1 }, { reacao: true }, { emJogo: "acao" });
  t("● ação, ▲ bónus, ◆ reação; o recurso do verbo apontado fica em jogo", J(pips.map((p) => p.recurso)) === J(["acao", "bonus", "reacao"]) && pips[0].estado === "emJogo" && pips[1].estado === "livre");
  t("gasto: só o aro", pipsDaEconomia({ acao: 0, extra: 0 }, { reacao: false }, { acaoBonus: true }).every((p) => p.estado === "gasto"));
  t("quem não tem ação bónus não vê o pip dela", pipsDaEconomia({ acao: 1, extra: 0 }, null, {}).length === 1);
  t("a forma diz o recurso: as medidas da tabela", ECONOMIA_DA_VEZ.acao === 16 && ECONOMIA_DA_VEZ.reacao === 12 && ECONOMIA_DA_VEZ.emJogo === 0.35);
  const comb = { rodada: 3, ordem: [{ nome: "Bran", iniciativa: 15 }, { nome: "Bandido", iniciativa: 12 }, { nome: "Lobo", iniciativa: 9 }], inimigos: [{ nome: "Bandido", vida: 8, vidaMax: 8 }, { nome: "Lobo", vida: 0, vidaMax: 6, derrotado: true }] };
  const f = filaDaVez(faixaDaVez(comb, "Bran"), comb);
  t("a fila: a vez é o herói, quem caiu volta a 30 %, e «R4» abre a seguinte", f.rostos[0].estado === "vez" && f.rostos.some((r) => r.nome === "Lobo" && r.estado === "caido") && f.rodadaSeguinte === 4 && f.proximo.nome === "Bran");
  t("os tamanhos da fila: 56 a vez, 40 os outros; 44 e 34 no telefone", FILA_DA_VEZ.vez === 56 && FILA_DA_VEZ.espera === 40 && FILA_DA_VEZ.telefone.vez === 44 && FILA_DA_VEZ.caido === 0.3 && FILA_DA_VEZ.agiu === 0.45);
  const area = [{ x: 4, y: 4 }, { x: 5, y: 4 }, { x: 4, y: 5 }, { x: 5, y: 5 }, { x: 3, y: 4 }, { x: 3, y: 5 }, { x: 4, y: 3 }, { x: 5, y: 3 }, { x: 3, y: 3 }];
  const av = avisoDaArea({ x: 4, y: 4 }, [{ inimigo: "Dragão Jovem", vista: { tipo: "sopro", dano: { min: 14, max: 24 }, area } }], { colunas: 14, linhas: 14 });
  t("dentro do sopro: «Estás na área do sopro do Dragão Jovem (14–24). Sai duas casas para escapar.»", av && av.texto === "Estás na área do sopro do Dragão Jovem (14–24). Sai duas casas para escapar.", av && av.texto);
  t("fora da área, nenhum aviso", avisoDaArea({ x: 9, y: 9 }, [{ inimigo: "Dragão Jovem", vista: { tipo: "sopro", area } }], {}) === null);
}

/* ============================================================
   AS PEÇAS, RENDERIZADAS
   ============================================================ */
const ENTRADA = `
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { PilulaDaPrevisao, PilulaDaIntencao, Economia, PipDoRecurso, FacesDoD20 } from "./ui.jsx";
import { GridDeBatalha } from "./grade-de-batalha.jsx";
import { TelaDeBatalha } from "./painel-batalha.jsx";
import { CartaoDoEncontro, LinhaDaEscolha, FaixaDaAmeaca, SinalNaFolha, EntradaNaMesa } from "./painel-encontro.jsx";
import { Bandeja } from "./painel-bandeja.jsx";
export const html = (el) => renderToStaticMarkup(el);
export { React, PilulaDaPrevisao, PilulaDaIntencao, Economia, PipDoRecurso, FacesDoD20, GridDeBatalha, TelaDeBatalha, CartaoDoEncontro, LinhaDaEscolha, FaixaDaAmeaca, SinalNaFolha, EntradaNaMesa, Bandeja };
`;
const saida = path.join(AQUI, `.tmp-batalha-na-tela-${process.pid}.mjs`);
buildSync({
  stdin: { contents: ENTRADA, resolveDir: SRC, loader: "jsx", sourcefile: "entrada-batalha.jsx" },
  bundle: true, format: "esm", platform: "node", outfile: saida, jsx: "automatic", logLevel: "silent", external: ["react", "react-dom", "react-dom/server", "react/jsx-runtime"],
  loader: { ".png": "dataurl", ".jpg": "dataurl", ".webp": "dataurl", ".svg": "dataurl" },
});
let R;
try { R = await import(pathToFileURL(saida).href); } finally { try { fs.unlinkSync(saida); } catch { /* fica */ } }
const h = (C, p) => R.React.createElement(C, p);
const janela = (largura, reduce = false) => {
  globalThis.window = {
    innerWidth: largura, innerHeight: 900,
    matchMedia: (q) => {
      const max = /max-width:\s*(\d+)px/.exec(q);
      return { matches: q.includes("reduce") ? reduce : max ? largura <= Number(max[1]) : false, addEventListener() {}, removeEventListener() {} };
    },
    addEventListener() {}, removeEventListener() {},
  };
};
const texto = (s) => s.replace(/<[^>]+>/g, " ").replace(/&#x27;/g, "'").replace(/&quot;/g, "\"").replace(/&amp;/g, "&").replace(/\s+/g, " ");

/* a mesa de prova: uma praça 14 × 14, o herói, dois bandidos e um dragão */
const GRADE = { largura: 14, altura: 14, cenario: "praça", regioes: [{ nome: "no meio da praça", x0: 0, y0: 0, x1: 13, y1: 13 }], paredes: [], dificil: [], cobertura: [] };
const COMBATE = {
  rodada: 2, grade: GRADE, heroi: { nome: "Bran", x: 5, y: 7 },
  inimigos: [
    { nome: "Bandido", vida: 8, vidaMax: 8, x: 6, y: 8, ameaca: "comum" },
    { nome: "Dragão Jovem", vida: 61, vidaMax: 61, x: 9, y: 2, ameaca: "elite", tamanho: "grande" },
    { nome: "Lobo", vida: 0, vidaMax: 6, x: 2, y: 2, derrotado: true },
  ],
  aliados: [], ordem: [{ nome: "Bran", iniciativa: 15 }, { nome: "Bandido", iniciativa: 12 }, { nome: "Dragão Jovem", iniciativa: 10 }],
  economia: { acao: 1, extra: 1 }, recursos: { acao: true, bonus: true, reacao: true, movimento: true }, log: [],
};
const SOPRO = Array.from({ length: 9 }, (_, i) => ({ x: 4 + (i % 3), y: 6 + Math.floor(i / 3) }));
const INTENCOES = [
  { inimigo: "Bandido", vista: { tipo: "atacar", alvo: "Bran", golpes: 1, dano: { min: 7, max: 12 }, abate: 0.1, area: null } },
  { inimigo: "Dragão Jovem", vista: { tipo: "sopro", alvo: "Bran", golpes: 1, dano: { min: 14, max: 24 }, abate: 0.2, area: SOPRO } },
];
const HEROI = { nome: "Bran", classe: "Guerreiro", nivel: 3, vida: 20, vidaMax: 28, mana: 6, manaMax: 6, condicoes: [] };

/* ============================================================ */
sec("3 · 8. as peças: a pílula, a intenção, as casas marcadas, os rótulos");
{
  janela(1905);
  const p = R.html(h(R.PilulaDaPrevisao, { previsao: PREV }));
  t("a pílula da previsão tem nome acessível com a chance, o dano e o abate", /role="img"/.test(p) && /aria-label="Bandido: 78% de acertar, 6 a 13 de dano, 40% de o abater"/.test(p), p.slice(0, 200));
  t("e mostra «78%», «6–13» e «40%», a 32 de alto, aro âmbar", texto(p).includes("78%") && texto(p).includes("6–13") && texto(p).includes("40%") && p.includes(`height:${PREVISAO_DO_GOLPE.alto}px`));
  const certo = R.html(h(R.PilulaDaPrevisao, { previsao: { ...PREV, abateNoTurno: 1 } }));
  t("o abate certo leva a etiqueta ABATE", texto(certo).includes("ABATE"));
  const sv = R.html(h(R.PilulaDaPrevisao, { previsao: { ...PREV, semVista: true } }));
  t("sem linha de vista: o olho e a frase, sem número", texto(sv).includes("sem linha de vista") && !texto(sv).includes("%"));
  const i = R.html(h(R.PilulaDaIntencao, { vista: INTENCOES[1].vista }));
  t("a intenção tem nome acessível («vai soprar sobre 9 casas…») e «14–24 · 9 casas»", /aria-label="vai soprar sobre 9 casas, 14 a 24 de dano"/.test(i) && texto(i).includes("14–24 · 9 casas"), i.slice(0, 220));
  const ie = R.html(h(R.PilulaDaIntencao, { vista: { tipo: "atacar", alvo: null, dano: { min: 7, max: 12 } } }));
  t("o alvo escondido diz «→ ?»", texto(ie).includes("→") && texto(ie).includes("?"));
  const e = R.html(h(R.Economia, { economia: { acao: 1, extra: 1 }, recursos: { reacao: true }, emJogo: "acao", passoM: 6, passoTotal: 9 }));
  t("a economia diz-se a quem ouve («ação em jogo, bónus livre, reação livre, 6 de 9 m de passo»)", /aria-label="ação em jogo, bónus livre, reação livre, 6 de 9 m de passo"/.test(e), e.slice(0, 200));
  t("o pip em jogo é tracejado (3/2)", e.includes(`stroke-dasharray="${ECONOMIA_DA_VEZ.tracejado.join(" ")}"`));
  const fc = R.html(h(R.FacesDoD20, { faces: golpePorExtenso(PREV).faces, rotulo: golpePorExtenso(PREV).legenda }));
  t("as faces: 20 casas, 15 acesas, com o rótulo da legenda", (fc.match(/<span aria-hidden="true"/g) || []).length === 20 && /aria-label="acertas com 6 ou mais no dado · o 20 é crítico"/.test(fc));

  const g = R.html(h(R.GridDeBatalha, { combate: COMBATE, heroiFicha: HEROI, previsaoDoGolpe: PREV, intencoes: INTENCOES, ladoFixo: 32, larguraDaJanela: 869, alturaDaJanela: 740, tetoDoLado: 64,
    caminho: { pontos: [{ x: 5, y: 7 }, { x: 6, y: 7 }, { x: 7, y: 8 }], metros: 3, sobraM: 6, golpeLivreEm: [{ x: 6, y: 7 }] }, heroiNome: "Bran", aoTocarInimigo: () => {} }));
  t("A PREVISÃO POUSA SOBRE O ALVO: a pílula na camada de cima do tabuleiro", g.includes("de acertar") && texto(g).includes("78%"));
  /* a casa mede 51 (869 × 740 de janela, 14 × 14): o tracejado em píxeis de tela vira casas ÷ 51 */
  const emCasas = (lista) => `stroke-dasharray="${lista.map((n) => n / 51).join(" ")}"`;
  const quantos = (s) => g.split(s).length - 1;
  t("o alvo ganha o anel tracejado âmbar (6/4)", quantos(emCasas(PREVISAO_DO_GOLPE.anelDoAlvo.tracejado)) === 1);
  t("a seta do ataque, tracejada (5/4), do Bandido ao Bran", quantos(emCasas(INTENCAO_NA_MESA.seta.tracejado)) === 1);
  t("A INTENÇÃO no canto da ficha: as duas pílulas (o Bandido e o Dragão)", (g.match(/vai atacar Bran/g) || []).length === 1 && (g.match(/vai soprar/g) || []).length === 1);
  t("AS CASAS MARCADAS: as nove casas do sopro e a do golpe livre, com o aro tracejado (4/3)", quantos(emCasas(INTENCAO_NA_MESA.area.tracejado)) === 10, String(quantos(emCasas(INTENCAO_NA_MESA.area.tracejado))));
  t("e o destino com o aro tracejado (5/3)", quantos(emCasas(CAMINHO_NO_CHAO.destino.tracejado)) === 1);
  t("a casa do alvo diz a previsão no nome acessível", /aria-label="G9 · Bandido, 8 de 8 PV[^"]*78% de acertar, 6 a 13 de dano, 40% de o abater"/.test(g), (g.match(/aria-label="G9[^"]*"/) || [""])[0]);
  t("o caminho no chão: o rótulo «3 m · sobra 6» junto ao destino", texto(g).includes("3 m · sobra 6"));
  t("o caminho desenha a linha pelos centros, traço 3", g.includes(`<path d="M5.5 7.5 L6.5 7.5 L7.5 8.5" fill="none" stroke="${T.amber}" stroke-width="${CAMINHO_NO_CHAO.traco / 51}"`));
  t("os glifos desenhados na casa: as nove chamas, as espadas do golpe livre e a caveira de quem caiu", (g.match(/scale\(0\.01[0-9]*\)/g) || []).length >= 11);
  t("o inimigo diz «toque para prever o golpe» a quem ouve", /aria-label="J3[^"]*Dragão Jovem[^"]*toque para prever o golpe"/.test(g), (g.match(/aria-label="J3[^"]*"/) || [""])[0]);
  const gv = R.html(h(R.GridDeBatalha, { combate: COMBATE, heroiFicha: HEROI, veuDoUltimo: "Bandido", ladoFixo: 32, larguraDaJanela: 869, alturaDaJanela: 740 }));
  t("o véu do último: quatro faixas a 45 % à volta da casa dele, e o anel âmbar", (gv.match(/background:rgba\(\d+, ?\d+, ?\d+, ?0\.45\)/g) || []).length === 4 || (gv.split("0.45").length - 1) >= 4);
  const gr = R.html(h(R.GridDeBatalha, { combate: COMBATE, heroiFicha: HEROI, reguaPresa: true, ladoFixo: 40, larguraDaJanela: 361 }));
  t("a régua presa no telefone: as letras e os números colados à janela (sticky)", (gr.match(/position:sticky/g) || []).length >= 3);
}

/* ============================================================ */
sec("6 · 8. o encontro, renderizado");
{
  janela(1905);
  const c = R.html(h(R.CartaoDoEncontro, { estado: LENDA, escolhas: ESC_LENDA, pergunta: "Uma sombra enorme no céu. O que fazes?", escolhida: "esconder" }));
  t("o cartão é um diálogo com nome, e o rótulo «Na estrada · um encontro»", /role="dialog" aria-label="Na estrada: Dragão Ancião"/.test(c) && texto(c).includes("Na estrada · um encontro"));
  t("as seis linhas são rádios num grupo «O que fazes»", /role="radiogroup" aria-label="O que fazes"/.test(c) && (c.match(/role="radio"/g) || []).length === 6);
  t("a fuga à vista perante a lenda: «CERTO», em musgo, tocável", texto(c).includes("CERTO") && c.includes(`color:${T.musgoNoPergaminho}`) && /role="radio" aria-checked="false" tabindex="0" aria-label="Voltar atrás/.test(c));
  t("e lutar com a faixa «Isto não é um encontro. É uma lenda.»", texto(c).includes("Isto não é um encontro. É uma lenda."));
  t("o botão diz a escolha e o preço («Esconder-se · N% · 1 h»)", /Esconder-se · \d+% · 1 h/.test(texto(c)));
  t("a faixa da lenda e o chip «ainda não te viu»", texto(c).includes("Uma lenda · foge disto") && texto(c).includes("ainda não te viu"));
  t("a carta do retrato a 300 × 380 (o retrato que a pessoa elogiou)", c.includes(`width="${CARTAO_DO_ENCONTRO.cartao.carta[0]}" height="${CARTAO_DO_ENCONTRO.cartao.carta[1]}"`));
  t("o campo continua aberto («ou escreve o que fazes»)", texto(c).includes("ou escreve o que fazes"));
  janela(375);
  const ct = R.html(h(R.CartaoDoEncontro, { estado: LENDA, escolhas: ESC_LENDA, telefone: true }));
  t("no telefone: a folha de 363 com o retrato 84, as seis linhas e o rodapé", ct.includes(`max-width:${CARTAO_DO_ENCONTRO.folha.largura}px`) && (ct.match(/role="radio"/g) || []).length === 6 && ct.includes(`width="${CARTAO_DO_ENCONTRO.rosto}"`));
  const sn = R.html(h(R.SinalNaFolha, { sinal: { tipo: "sombra", frase: "uma sombra passa sobre a estrada" } }));
  t("o sinal na folha: o caixilho tracejado e a frase em itálico", /role="note"/.test(sn) && sn.includes("dashed") && texto(sn).includes("uma sombra passa sobre a estrada"));
  const fx = R.html(h(R.FaixaDaAmeaca, { estado: { quantos: 3 } }));
  t("a faixa à vista diz quantos são, por palavra", texto(fx).includes("À vista · são 3"));
  const en = R.html(h(R.EntradaNaMesa, { ente: { nome: "Dragão Ancião" }, aoFim: () => {} }));
  t("a entrada na mesa é pulável: um botão «toque para saltar», com o véu, o retrato e a mesa", /role="button"[^>]*aria-label="A luta começa — toque para saltar"/.test(en) && en.includes("tv-entrada-veu") && en.includes("tv-entrada-cresce"));
}

/* ============================================================ */
sec("7 · 8. a tela da batalha: as três colunas e o telefone");
{
  janela(1905);
  const tela = R.html(h(R.TelaDeBatalha, { combate: COMBATE, personagem: HEROI, grupo: [], mensagens: [], previsaoDoGolpe: PREV, intencoes: INTENCOES, passoM: 6, passoTotal: 9, lugar: "Baixo da Fonte" }));
  t("a coluna Tu: «A tua vez», o nome, a economia", texto(tela).includes("A tua vez") && texto(tela).includes("Bran") && /aria-label="ação livre, bónus livre, reação livre, 6 de 9 m de passo"/.test(tela));
  t("O TEU GOLPE por extenso, com as faces e a legenda", /aria-label="O teu golpe contra Bandido"/.test(tela) && texto(tela).includes("acertas com 6 ou mais no dado"));
  t("o aviso da área (o herói está dentro do sopro)", texto(tela).includes("Estás na área do sopro do Dragão Jovem (14–24)"));
  t("a coluna Eles: «Nesta rodada, eles vão», com a intenção de cada um", /aria-label="Eles"/.test(tela) && texto(tela).includes("Nesta rodada, eles vão") && (tela.match(/vai atacar Bran/g) || []).length >= 2);
  t("a fila da vez diz de quem é a vez a quem ouve («agora: Bran»)", /role="group" aria-label="agora: Bran"/.test(tela));
  t("a pílula «AGORA:» aposentou-se", !/>AGORA:|agora: Bran<\/span>/.test(tela));
  t("o Atacar diz a chance («· 78%»)", texto(tela).includes("Atacar · 78%"));
  janela(375);
  const tel = R.html(h(R.TelaDeBatalha, { combate: COMBATE, personagem: HEROI, grupo: [], mensagens: [], previsaoDoGolpe: PREV, intencoes: INTENCOES, passoM: 6, passoTotal: 9 }));
  t("no telefone: «A tua vez · Bran» no canto, sem a coluna Eles", texto(tel).includes("A tua vez") && !/aria-label="Eles"/.test(tel));
  t("A FOLHA DA PREVISÃO sobe: «Atacar · 78%», «Cancelar», e o segundo toque também confirma", /role="dialog" aria-label="O teu golpe contra Bandido"/.test(tel) && texto(tel).includes("Atacar · 78%") && texto(tel).includes("Cancelar") && texto(tel).includes("tocar de novo em Bandido também confirma"));
  t("os três números grandes (Acerto, Dano, Abate)", texto(tel).includes("78%") && texto(tel).includes("6–13") && texto(tel).includes("40%"));
}

/* ============================================================ */
sec("9. o d20 do golpe na bandeja (§CB 15)");
{
  janela(1905, true);
  const l = { n: 1, rotulo: "Golpe → Bandido", dados: [{ faces: 20, valor: 14, papel: "teste" }], mod: 6, total: 20, alvo: 12, desfecho: "sucesso", golpe: true, acertam: facesQueAcertam(6, 12, 20), criticoEm: 20, jaRolou: false };
  const b = R.html(h(R.Bandeja, { lancamentos: [l] }));
  t("a bandeja acende as faces que acertam, com a legenda «acertas com 6 ou mais»", /aria-label="acertas com 6 ou mais no dado · o 20 é crítico"/.test(b));
  t("pousado, a face que saiu fica marcada (o 14)", /outline:2px solid/.test(b));
  t("o relógio do dado do golpe é a tabela (600 ms), e não é CSS", GOLPE_SENTIDO.dadoNaBandeja === 600);
}

console.log(`\nbatalha na tela (CB): ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
