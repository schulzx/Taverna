/* teste-v4-cinta.mjs — a cinta com os anéis (V4, 25/09/2026)

   A cinta da pessoa (Figma `ffWFqD7TueSb88Mkeg9bhW`, `126:6`) com os desvios
   que o `jogo` mediu (`mente/v4-jogo.md`). O que esta suíte guarda, por ordem:
   1. AS CONTAS, em Node: o estado de um anel, o pior de um grupo, o nome de
      cada alvo, quem o toque abre, e QUEM CEDE quando a linha aperta — com
      os casos medidos do `jogo` a 375, a 320 e a 1280.
   2. AS MEDIDAS em tabela, e os pares de cor que decidem os estados.
   3. O MOVIMENTO: nada infinito, e tudo com saída no reduced-motion.
   4. A PEÇA E A FIAÇÃO, no texto: o anel vê-se a si mesmo, o grupo tem um
      alvo de 48, as invocadas não entram, o toque abre o Grupo no cartão.
   5. OS TRÊS DEFEITOS DO ANTES não voltam: nenhum companheiro na tela, a
      barra de PV a 0 px, a agonia sem fim. */
import { readFileSync } from "node:fs";
import { T, TIPOS, ALVOS, CINTA, ANEL, MUDOU_AGORA, FOLHA } from "../src/estilo.js";
import { estadoDoAnel, piorEstado, nomeDoCompanheiro, nomeDoCacho, quemAbrir, repartirACinta, textoDoPV, ESTADOS_DO_ANEL, GLIFOS } from "../src/glifos.js";
import { palavraDoPrazo } from "../src/hora-e-prazo.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? "\n      " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);
/* lê sem o CR: a suíte vale igual numa árvore em LF ou em CRLF */
const ler = (x) => readFileSync(x, "utf8").split(String.fromCharCode(13)).join("");
const UI = ler("../src/ui.jsx");
const APP = ler("../src/App.jsx");
const EST = ler("../src/estilo.js");
const trecho = (txt, ini, fim) => { const i = txt.indexOf(ini); return i < 0 ? "" : txt.slice(i, txt.indexOf(fim, i + ini.length)); };
const ANEL_TXT = trecho(UI, "export function Anel(", "export function DiscoDoGrupo(");
const GRUPO_TXT = trecho(UI, "export function GrupoNaCinta(", "\n}\n");
const CINTA_TXT = trecho(APP, "function ACinta(", "\n}\n");

/* ============================================================ */
sec("1. as contas da cinta — em Node");
{
  t("três estados parados, por ordem de gravidade", ESTADOS_DO_ANEL.join() === "calma,grave,tombado");
  t("PV cheio é calma", estadoDoAnel({ vida: 14, vidaMax: 14 }) === "calma");
  t("um terço é grave (a régua de v9.160, agora em ANEL.grave)", estadoDoAnel({ vida: 3, vidaMax: 10 }) === "grave" && estadoDoAnel({ vida: 4, vidaMax: 10 }) === "calma" && ANEL.grave === 1 / 3);
  t("vida 0 é tombado, e morrendo também (o que a ressurreição lê)", estadoDoAnel({ vida: 0, vidaMax: 10 }) === "tombado" && estadoDoAnel({ vida: 2, vidaMax: 10, morrendo: true }) === "tombado");
  t("nulo e lixo não lançam: calma", estadoDoAnel(null) === "calma" && estadoDoAnel("x") === "calma");
  t("o pior de uma lista manda (a lei do +N)", piorEstado(["calma", "grave"]) === "grave" && piorEstado(["grave", "tombado", "calma"]) === "tombado" && piorEstado([]) === "calma");
  const grupo = [{ nome: "Tomé", vida: 3, vidaMax: 10 }, { nome: "Ninha", vida: 0, vidaMax: 10, morrendo: true }, { nome: "Bram", vida: 9, vidaMax: 10 }];
  t("o nome de um companheiro diz o PV que o telefone não escreve", nomeDoCompanheiro(grupo[0]) === "Tomé · 3 de 10 PV");
  t("e quem tombou diz-se por palavra", nomeDoCompanheiro(grupo[1]) === "Ninha caiu");
  t("o nome do cacho diz quem está mal, do pior para o menos mal", nomeDoCacho(grupo) === "O grupo — Ninha caiu, Tomé em perigo");
  t("e sem ninguém mal é só «O grupo»", nomeDoCacho([grupo[2]]) === "O grupo");
  t("o toque abre o primeiro no pior estado (quem o aro assinalava)", quemAbrir(grupo) === "Ninha" && quemAbrir([grupo[2], grupo[0]]) === "Tomé");
  t("sem ninguém mal abre o primeiro; sem grupo, ninguém", quemAbrir([grupo[2]]) === "Bram" && quemAbrir([]) === null);
  t("o PV escrito na mesa: 14/14 PV, e caiu", textoDoPV({ vida: 14, vidaMax: 14 }) === "14/14 PV" && textoDoPV(grupo[1]) === "caiu");

  /* QUEM CEDE — os casos do `jogo` (§4), com as peças medidas por ele. */
  const tel = (largura, extra) => repartirACinta({ largura, mesa: false, heroi: 60, pilula: 125, glifo: 20, contadores: 54, espaco: 8, perto: 4, folga: 7, anel: 28, passo: 20, n: 4, ...extra });
  const a = tel(351);
  t(`375 · 4 companheiros e 1 prazo: cai o glifo, ficam 2 anéis e o disco +2 (${JSON.stringify(a)})`, a.glifo === false && a.aneis === 2 && a.disco === 2);
  const b = tel(351, { pilula: 174 });
  t(`375 · o pior caso (última noite, 174): cabe o disco sozinho, com folga (${JSON.stringify(b)})`, b.aneis === 0 && b.disco === 4 && 60 + 4 + 28 + 8 + 174 + 8 + 54 <= 351);
  const c = tel(351, { n: 0 });
  t("sozinha: o grupo ocupa zero e o glifo fica", c.aneis === 0 && c.disco === 0 && c.glifo === true);
  const d = tel(296, { pilula: 174 });
  t("320 · o pior caso não cabe nem com o disco — e o disco FICA (um perigo escondido é o defeito)", d.aneis === 0 && d.disco === 4);
  const e = tel(296, { pilula: 174 - 43 });
  t("320 · com `hoje` no lugar de `esta noite` (−43 px) o pior caso cabe", 60 + 4 + 28 + 8 + (174 - 43) + 8 + 54 <= 296 && e.disco === 4);
  const mesa = (largura, rotulos) => repartirACinta({ largura, mesa: true, heroi: 120, pilula: 260, glifo: 24, contadores: 120, espaco: 8, folga: 7, anel: 32, separacao: 37, entreAnelERotulo: 8, n: 4, rotulos });
  const f = mesa(1232, [70, 70, 70, 70]);
  t(`1280 · 4 companheiros: cabe tudo, com rótulos e glifo (${JSON.stringify(f)})`, f.aneis === 4 && f.rotulos === 4 && f.glifo === true);
  const g = mesa(900, [70, 70, 70, 70]);
  t(`mais estreito: cedem PRIMEIRO os rótulos, do último para o primeiro (${JSON.stringify(g)})`, g.aneis === 4 && g.rotulos < 4 && g.glifo === true);
  const h = mesa(560, [70, 70, 70, 70]);
  t(`e depois o glifo, e só então os anéis (${JSON.stringify(h)})`, h.rotulos === 0 && (h.glifo === false || h.aneis === 4));
  t("lixo não lança", JSON.stringify(repartirACinta(null)) === JSON.stringify({ aneis: 0, rotulos: 0, glifo: true, disco: 0 }) || repartirACinta(null).disco === 0);
}

/* ============================================================ */
sec("2. as medidas em tabela, e os pares que decidem");
{
  t("o herói 40, o companheiro 32 na mesa e 28 no telefone", ANEL.heroi === 40 && ANEL.mesa === 32 && ANEL.telefone === 28);
  t("o anel do herói cabe na cinta de 48 sem a fazer crescer", ANEL.heroi < CINTA.altura && CINTA.altura === 48);
  t("o rosto do herói é o de sempre (40 − 2 × (3 + 1) = 32)", ANEL.heroi - 2 * (ANEL.aro + ANEL.folga) === 32);
  t("a coroa cabe dentro da cinta: sobe 4 do anel, e o anel está a 4 do topo", (CINTA.altura - ANEL.heroi) / 2 - 4 >= 0);
  t("o cacho do telefone é UM alvo de pelo menos 48 — e quando é um anel só, a área invisível completa-o sem ocupar leiaute",
    /height: CINTA\.altura/.test(GRUPO_TXT) && ALVOS.piso === 48 && ANEL.telefone + CINTA.alvoAlem.esquerda + CINTA.alvoAlem.direita === ALVOS.piso
    && /\{itens === 1 && <span aria-hidden="true" className="absolute" style=\{\{ top: 0, bottom: 0, left: -CINTA\.alvoAlem\.esquerda, right: -CINTA\.alvoAlem\.direita \}\} \/>\}/.test(GRUPO_TXT)
    && 2 * ANEL.telefone - ANEL.sobreposicao >= ALVOS.piso);
  t("a área invisível só come espaço: à esquerda cabe nos 4 de perto e na folga do herói, à direita nos 8 de espaço",
    CINTA.alvoAlem.direita <= CINTA.espaco && CINTA.alvoAlem.esquerda - CINTA.perto <= 8);
  t("na mesa, cada retrato é o seu alvo de 48", /minWidth: ALVOS\.piso/.test(GRUPO_TXT));
  const L = (h) => { const n = parseInt(h.slice(1), 16); return [16, 8, 0].map((s) => ((n >> s) & 255) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)).reduce((a, c, i) => a + c * [0.2126, 0.7152, 0.0722][i], 0); };
  const cr = (a, b) => { const x = L(a), y = L(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const calmaGrave = cr(T.amber, T.danger);
  t(`calma × grave separam-se em cinzento (âmbar × perigo ${calmaGrave.toFixed(2)}:1, e não o ciano da v3)`, calmaGrave >= 1.5 && cr(T.mundo, T.danger) < calmaGrave);
  t(`o arco contra o trilho, nos dois estados (${cr(T.amber, T.panelSoft).toFixed(2)} · ${cr(T.danger, T.panelSoft).toFixed(2)}) ≥ 3`, cr(T.amber, T.panelSoft) >= 3 && cr(T.danger, T.panelSoft) >= 3);
  t(`o traço do tombado contra o trilho (${cr(T.ink, T.panelSoft).toFixed(2)}) ≥ 3 — lê-se em cinzento`, cr(T.ink, T.panelSoft) >= 3);
  t(`os contadores na cinta: ouro ${cr(T.amber, T.panel).toFixed(2)} · PM ${cr(T.violetSoft, T.panel).toFixed(2)} ≥ 4,5`, cr(T.amber, T.panel) >= 4.5 && cr(T.violetSoft, T.panel) >= 4.5);
  t(`a pílula: mundo sobre o erguido ${cr(T.mundo, T.panelSoft).toFixed(2)} ≥ 4,5`, cr(T.mundo, T.panelSoft) >= 4.5);
  t("a coroa existe na família e é a do nó (lucide:crown)", !!GLIFOS.coroa && GLIFOS.coroa.de === "lucide:crown" && /<Glifo nome="coroa"/.test(CINTA_TXT));
  t("`esta noite` diz-se `hoje` só onde a conta o tem, e só abaixo do corte", palavraDoPrazo(0, false, "noites", true) === "hoje" && palavraDoPrazo(0) === "esta noite" && palavraDoPrazo(0, false, "turnos", true) === "este turno" && CINTA.palavraCurtaAbaixoDe < 375);
}

/* ============================================================ */
sec("3. o movimento — nada infinito, e tudo com saída");
{
  t("a agonia pulsa três vezes e para", /\.tv-agonia \{ animation: tvAgonia \$\{MUDOU_AGORA\.pulso\}ms ease-in-out \$\{MUDOU_AGORA\.vezes\}; \}/.test(EST) && MUDOU_AGORA.vezes === 3);
  t("e nenhuma animação da cinta é infinita", !/tv-agonia[^}]*infinite|tvAnelPerdido[^}]*infinite/.test(FOLHA));
  const reduz = FOLHA.slice(FOLHA.indexOf("@media (prefers-reduced-motion: reduce)"));
  t("com reduced-motion: sem pulso, o arco salta, e o pedaço perdido fica parado a meia tinta",
    /\.tv-agonia, \.tv-anel-clarao \{ animation: none; \}/.test(reduz) &&/\.tv-anel-cresce \{ transition: none; \}/.test(reduz) && new RegExp(`\\.tv-anel-perdido \\{ animation: none; opacity: ${ANEL.alfaParado}; \\}`).test(reduz));
  t("ferir não anima o arco (salta); só crescer anima", /const cresce = !!antesRef\.current && frac > antesRef\.current\.frac;/.test(ANEL_TXT) && /className=\{cresce \? "tv-anel-cresce" : undefined\}/.test(ANEL_TXT));
  t("o pedaço perdido some sozinho, e o relógio morre com a peça", /setTimeout\(\(\) => setPerdido\(null\), ANEL\.perdido\)/.test(ANEL_TXT) && /clearTimeout\(relogioRef\.current\)/.test(ANEL_TXT));
  t("a peça não espera nada: sem estado de «a animar», sem bloquear clique", !/pointer-events: none;[^}]*tv-anel|disabled/.test(ANEL_TXT) && /pointer-events-none/.test(ANEL_TXT));
  t("a última noite pulsa ao chegar, e não ao montar", /if \(antes === false && cheio\) setPulso\(Date\.now\(\)\);/.test(UI));
}

/* ============================================================ */
sec("4. a peça e a fiação");
{
  t("o anel é aria-hidden — quem diz o PV por palavras é o alvo", /<span aria-hidden="true" className="relative inline-block shrink-0 rounded-full"/.test(ANEL_TXT));
  t("tombado não se diz pela cor: sem arco, rosto apagado, traço", /\{!tombado && \(/.test(ANEL_TXT) && /opacity: tombado \? ANEL\.apagado : 1/.test(ANEL_TXT) && /\{tombado && \(/.test(ANEL_TXT));
  t("as invocadas nunca entram na cinta", /\(personagem\.grupo \|\| \[\]\)\.filter\(\(g\) => g && !g\.invocada\)/.test(CINTA_TXT));
  t("o grupo vai na ordem de entrada (nenhuma ordenação na cinta)", !/\.sort\(/.test(GRUPO_TXT) && !/\.sort\(/.test(CINTA_TXT));
  t("o disco herda o pior do que esconde", /const pior = piorEstado\(escondidos\.map\(estadoDoAnel\)\)/.test(GRUPO_TXT) && /estado=\{pior\}/.test(GRUPO_TXT));
  t("o +N dos prazos também", /escondidoGrave \? T\.danger : T\.inkDim/.test(UI) && /const escondidoGrave = !!\(prazos && prazos\.slice\(1\)\.some\(\(p\) => p\.noites <= 1\)\)/.test(CINTA_TXT));
  t("o PM é só número (nenhuma barra) e só quando conta", /pm=\{comPM \? personagem\.mana : null\}/.test(CINTA_TXT) && !/BarraDeRecurso/.test(CINTA_TXT));
  t("o herói continua sendo a porta do alforje, com o mesmo nome", /aria-label=\{nomeDaPorta\} aria-haspopup="dialog" aria-expanded=\{!!alforjeAberto\}/.test(CINTA_TXT) && /<MarcaDaPorta estado=\{marcaDaPorta\} \/>/.test(CINTA_TXT));
  t("o toque num companheiro abre o Grupo no cartão dele", /setSubPedida\(\{ sub: "grupo", selo: Date\.now\(\), alvo: nome \}\);\s*setAba\("gestao"\);/.test(APP) && /data-membro=\{m\.nome\} tabIndex=\{-1\}/.test(APP) && /\? focarNoCartao : undefined/.test(APP));
  t("e com a janela de reação aberta não abre", /const abrirCompanheiro = \(nome\) => \{\s*try \{\s*if \(janelaReacao\) return;/.test(APP));
  t("a medida é da peça e a conta é de glifos.js — não há conta copiada no App", /useRepartoDaCinta\(grupo, mesa, chave\)/.test(CINTA_TXT) && !/function repartirACinta/.test(APP) && /repartirACinta\(\{/.test(UI));
  t("mede-se quando muda o que ocupa lugar, não a cada tecla", /React\.useLayoutEffect\(\(\) => \{ medir\.current\(\); \}, \[chave, mesa, n, reparto\.glifo, reparto\.aneis, reparto\.rotulos\]\)/.test(UI));
  t("e a medida nunca custa o turno", /catch \(e\) \{ \/\* sem medida, a cinta fica como está \*\/ \}/.test(UI));
}

/* ============================================================ */
sec("5. os três defeitos do antes não voltam");
{
  t("1 · os companheiros estão na tela principal (a cinta desenha o grupo)", /<GrupoNaCinta grupo=\{grupo\} reparto=\{reparto\} mesa=\{mesa\} aoAbrir=\{aoAbrirCompanheiro\} \/>/.test(CINTA_TXT));
  t("2 · a vida do herói não cede: é um arco, e não há barra com style inline a furar um hidden", /<Anel ente=\{personagem\}/.test(CINTA_TXT) && !/display: "inline-block"/.test(CINTA_TXT));
  t("3 · o pulso de agonia não é infinito", !/animation: tvAgonia[^;]*infinite/.test(EST));
}

console.log(`\nV4 · a cinta com os anéis: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
