/* teste-mm7-atiradores.mjs (Fase MM · MM7) — os atiradores atiram

   A prova de `src/atirador.js`, do posto do atirador em `grid.js`
   (`moverInimigos`), do disparo em `combate.js` (`turnoDosInimigos`), do
   repertório de quem atira em `aflicoes.js`, da voz da intenção em
   `adversario.js` — e da fiação que liga tudo isso no `App.jsx`. As
   perguntas de mesa que esta etapa responde:
     "o arqueiro vem para cima de mim?"                    → §1, §2, §3
     "se eu colar nele, ele ainda atira?"                  → §4, §11
     "escondido atrás da carroça, ele me acerta?"          → §5
     "o soldado continua a vir?"                           → §6
     "com que golpe ele me acerta?"                        → §7
     "o que o Mestre ouve do arqueiro?"                    → §8
   a medida da luta antes e depois, fixada como catraca (§10, §12), e a
   fiação do golpe de oportunidade no recuo, por texto do App (§13).

   UMA NOTA DE HISTÓRIA, para a intenção sobreviver: a primeira versão desta
   suíte (backend, 83 asserções, §0–§10) foi sobrescrita por engano antes do
   commit, e a mão `frontend` reconstruiu-a com as três camadas que hoje são
   §11–§13 (motor de perto, sonda ao vivo, fiação por texto). Esta é a
   junção das duas: as dez secções do motor voltaram, e as três da frontend
   ficaram como ela as escreveu — a §13 é a única prova de que o App liga
   `m.provoca` ao golpe do herói, e não pode enfraquecer.

   Nenhum `Math.random` decide uma asserção: o posto é determinístico e o
   golpe roda sob a sorte travada da régua. */
import { readFileSync } from "node:fs";
import { QUEM_ATACA_DE_LONGE, atacaDeLonge, mantemDistancia, POSTURA_DO_ATIRADOR } from "../src/atirador.js";
import {
  montarGrade, moverInimigos, distanciaM, linhaDeVisao, temCobertura, custosDe, ocupacaoDe,
  alcanceNatural, METROS_POR_FAIXA, METROS_POR_QUADRADO,
} from "../src/grid.js";
import { turnoDosInimigos } from "../src/combate.js";
import { completarInimigo } from "../src/bestiario.js";
import { GOLPES_DE_LONGE, GOLPES_POR_ELEMENTO, golpeDeLonge, golpesDeCriatura, PORTADORES } from "../src/aflicoes.js";
import { garantirLuta, intencaoDaVez, linhaDaLuta, envelopeDaVirada, INTENCOES, VOZ_DE_QUEM_ATIRA } from "../src/adversario.js";
import { ALCANCES } from "../src/golpe.js";
import { DISPARO_NA_FUGA } from "../src/fuga.js";
import { nascerEscondido, oculto } from "../src/escondido.js";
import { perfilDe } from "../src/danos.js";
import { comSorteTravada } from "./regua-combate.mjs";
import {
  carregar, sondarAtiradores, lutaDosAtiradores, LUTAS_DOS_ATIRADORES,
  RETRATO_DOS_ATIRADORES, LIMITE_DOS_ATIRADORES, AMOSTRA_DOS_ATIRADORES,
} from "./sonda-dos-atiradores.mjs";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra !== "" ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);

/* campo aberto 18x12: as linhas 0 a 2 são a encosta (cobertura), o resto é
   estrada descoberta; nenhuma parede */
const campoAberto = montarGrade({ local: "campo aberto", bioma: "planicie" });
/* masmorra 7x18: paredes em x 0-1 e 5-6 das linhas 7 a 10 — a porta é o meio */
const masm = montarGrade({ emMasmorra: true });
const umAtirador = (x, y, extra = {}) => ({ nome: "Atirador", ameaca: "comum", nivel: 5, vida: 20, vidaMax: 20, defesa: 13, condicoes: [], x, y, ...extra });
const umSoldado = (x, y) => ({ nome: "Soldado", ameaca: "comum", nivel: 5, vida: 20, vidaMax: 20, defesa: 12, condicoes: [], x, y });
const ficha = (extra = {}) => ({ nome: "Vera", classe: "Guerreiro", nivel: 5, vida: 40, vidaMax: 40, atributos: { destreza: 2 }, condicoes: [], ...extra });
const semCusto = (d) => Math.floor(d / METROS_POR_FAIXA) < POSTURA_DO_ATIRADOR.faixasSemCusto;

/* ============================================================ */
sec("0. as tabelas e as duas perguntas de nome");
{
  t("a tabela de nomes tem as duas famílias e a do desc", ["arma", "magia", "descrito"].every((id) => QUEM_ATACA_DE_LONGE.some((q) => q.id === id)));
  t("o teto da arma de longe é um número só: posto, golpe e fuga",
    POSTURA_DO_ATIRADOR.alcanceM === 36 && ALCANCES.armaDeLonge === POSTURA_DO_ATIRADOR.alcanceM && DISPARO_NA_FUGA.alcance === POSTURA_DO_ATIRADOR.alcanceM);
  t("a faixa longa da fuga continua a metade (18 m)", DISPARO_NA_FUGA.longaAcimaDe === 18);
  t("o posto aceita a faixa que não paga penalidade (uma)", POSTURA_DO_ATIRADOR.faixasSemCusto === 1);
  /* a cobertura tem de vencer o pior desvio dentro da faixa mais o passo
     inteiro — é o que faz "preferindo cobertura" ser regra (§3) */
  const W = POSTURA_DO_ATIRADOR.pesos;
  const piorDesvio = (POSTURA_DO_ATIRADOR.faixasSemCusto * METROS_POR_FAIXA - METROS_POR_QUADRADO) - 2 * METROS_POR_QUADRADO;
  t("a cobertura vale mais do que o pior desvio mais o passo de 9 m", W.cobertura > piorDesvio * W.ideal + 9 * W.passo, `${W.cobertura} vs ${piorDesvio * W.ideal + 9 * W.passo}`);
  t("atacaDeLonge: Atirador, Arqueiro, Mago, Lich sim; Soldado e Cultista não",
    ["Atirador", "Arqueiro Goblin", "Mago", "Lich"].every((n) => atacaDeLonge({ nome: n })) && ["Soldado", "Cultista"].every((n) => !atacaDeLonge({ nome: n })));
  t("mantemDistancia: o inimigo com ameaça que o nome chama de atirador", mantemDistancia({ nome: "Atirador", ameaca: "comum" }));
  t("mantemDistancia: o companheiro chamado Mago (sem ameaça) NÃO — a régua tem um", !mantemDistancia({ nome: "Mago", vida: 30 }));
  t("mantemDistancia: a ficha que declara `distancia` sempre", mantemDistancia({ nome: "Autômato Sentinela", distancia: true }));
  t("lixo não mantém distância", [null, undefined, 0, "Atirador", {}].every((x) => mantemDistancia(x) === false));
}

/* ============================================================ */
sec("1. quem já está no posto não se mexe");
{
  const heroi = { nome: "Vera", x: 9, y: 8 };
  const a = umAtirador(9, 4);                    // 6 m, estrada aberta, vê
  const r = moverInimigos(campoAberto, [a], heroi, [heroi]);
  t("a 6 m, vendo o herói e sem ninguém colado: fica", r.movimentos.length === 0 && r.inimigos[0].x === 9 && r.inimigos[0].y === 4);
  t("e é a mesma referência (nada foi copiado à toa)", r.inimigos[0] === a);
  const acoes = comSorteTravada("mm7|posto", () => turnoDosInimigos({ inimigos: [a], jogador: ficha(), grade: campoAberto, heroi, rodada: 1 }));
  t("e dispara dali", acoes.length === 1 && acoes[0].deLonge === true && acoes[0].metros === 6);
  t("sem desvantagem (ninguém colado, faixa sem custo)", acoes[0].r.modo == null);
}

/* ============================================================ */
sec("2. longe demais: vem até à faixa, e nunca cola");
{
  const heroi = { nome: "Vera", x: 9, y: 10 };
  const a = umAtirador(2, 2);                    // 12 m: vê, mas paga −2
  const r = moverInimigos(campoAberto, [a], heroi, [heroi]);
  const d = distanciaM(r.inimigos[0], heroi);
  t("anda até à faixa sem custo", semCusto(d), d);
  t("e para longe do corpo a corpo", d > alcanceNatural(heroi), d);
  t("o movimento não é recuo nem provoca", !r.movimentos[0].recua && !r.movimentos[0].provoca);
  /* o mesmo com um soldado: esse vem colar, é o lutador de perto */
  const s = moverInimigos(campoAberto, [umSoldado(2, 2)], heroi, [heroi]);
  t("o soldado no mesmo lugar chega mais perto do que o atirador", distanciaM(s.inimigos[0], heroi) < d);
}

/* ============================================================ */
sec("3. sem ver, anda para ver — e prefere cobertura");
{
  /* masmorra: o herói no fundo da sala, o atirador no corredor atrás da
     parede. Ele não o vê de onde está. */
  const heroi = { nome: "Vera", x: 0, y: 13 };
  const a = umAtirador(0, 4);
  t("de partida, a parede corta a vista", !linhaDeVisao(masm, a, heroi));
  const r = moverInimigos(masm, [a], heroi, [heroi]);
  const novo = r.inimigos[0];
  t("depois do passo, vê o herói", linhaDeVisao(masm, novo, heroi), `${novo.x},${novo.y}`);
  t("e não acaba colado", distanciaM(novo, heroi) > METROS_POR_QUADRADO);

  /* campo aberto: da estrada, a encosta (linhas 0-2) é cobertura e fica ao
     alcance do passo. Entre as casas de onde se dispara sem custo, havendo
     uma coberta, o posto é coberto. */
  const h2 = { nome: "Vera", x: 12, y: 5 };
  const b = umAtirador(2, 4);                    // 15 m: vê, paga −2 → move
  const r2 = moverInimigos(campoAberto, [b], h2, [h2]);
  const p2 = r2.inimigos[0];
  const custos = custosDe(campoAberto, b, { ocupados: ocupacaoDe([h2], b) });
  const boas = [...custos.keys()].map((k) => k.split(",").map(Number))
    .filter(([x, y]) => { const q = { ...b, x, y }; const d = distanciaM(q, h2); return semCusto(d) && d > METROS_POR_QUADRADO && linhaDeVisao(campoAberto, q, h2); });
  t("há casas cobertas entre as boas (o caso é honesto)", boas.some(([x, y]) => temCobertura(campoAberto, x, y)));
  t("e o posto escolhido é coberto", temCobertura(campoAberto, p2.x, p2.y), `${p2.x},${p2.y}`);
  t("e dispara sem custo dali", semCusto(distanciaM(p2, h2)));
}

/* ============================================================ */
sec("4. colado: recua (e provoca) e dispara; encurralado, dispara com desvantagem");
{
  const heroi = { nome: "Vera", x: 9, y: 10 };
  const a = umAtirador(9, 9);                    // colado
  const r = moverInimigos(campoAberto, [a], heroi, [heroi]);
  const m = r.movimentos[0] || {};
  const novo = r.inimigos[0];
  t("recua", !!m.recua && distanciaM(novo, heroi) > distanciaM(a, heroi));
  t("e o recuo provoca o golpe de oportunidade (saiu do alcance do herói)", m.provoca === true);
  t("sem colar noutro sítio, na faixa sem custo", distanciaM(novo, heroi) > METROS_POR_QUADRADO && semCusto(distanciaM(novo, heroi)));
  t("o movimento diz quanto andou, em metros", Number.isFinite(m.metros) && m.metros > 0);
  const acoes = comSorteTravada("mm7|recuo", () => turnoDosInimigos({ inimigos: [novo], jogador: ficha(), grade: campoAberto, heroi, rodada: 1 }));
  t("e dispara do posto novo, sem desvantagem", acoes.length === 1 && acoes[0].deLonge && acoes[0].r.modo == null);

  /* encurralado: canto do campo, o herói e dois companheiros à volta */
  const h2 = { nome: "Vera", x: 1, y: 10 };
  const al = [{ nome: "Bram", x: 0, y: 10 }, { nome: "Odo", x: 1, y: 11 }];
  const b = umAtirador(0, 11);
  const r2 = moverInimigos(campoAberto, [b], h2, [h2, ...al]);
  t("sem casa livre, fica", r2.movimentos.length === 0 && r2.inimigos[0] === b);
  const grupo = al.map((x) => ({ nome: x.nome, vida: 20, vidaMax: 20, condicoes: [] }));
  const ac2 = comSorteTravada("mm7|canto", () => turnoDosInimigos({ inimigos: [b], jogador: ficha(), grupo, grade: campoAberto, heroi: h2, aliados: al, rodada: 1 }));
  t("e dispara com desvantagem (5e: hostil a um quadrado)", ac2.length === 1 && ac2[0].r.modo === "desvantagem", ac2[0] && ac2[0].r.modo);
  /* quem perdeu a ação não prende o arqueiro: o 5e pede um hostil que não esteja incapacitado */
  const atordoados = grupo.map((g) => ({ ...g, condicoes: [{ id: "atordoado", nome: "Atordoado", turnos: 2 }] }));
  const heroiCaido = ficha({ vida: 0 });
  const ac3 = comSorteTravada("mm7|canto2", () => turnoDosInimigos({ inimigos: [b], jogador: heroiCaido, grupo: atordoados, grade: campoAberto, heroi: h2, aliados: al, rodada: 1 }));
  t("colado a quem caiu ou está atordoado, sem desvantagem", ac3.every((x) => x.r.modo == null), ac3.map((x) => x.r.modo).join(","));
}

/* ============================================================ */
sec("5. quem não vê o herói não dispara nele");
{
  /* o herói escondido na encosta (cobertura), com um total que a
     Percepção passiva do atirador não bate */
  const heroi = { nome: "Vera", x: 9, y: 1 };
  const a = umAtirador(9, 6);                    // 7,5 m, na estrada
  const ns = nascerEscondido(ficha(), { total: 30, grade: campoAberto, heroi, inimigos: [a] });
  t("o herói está escondido do atirador (MM6)", ns.ok && oculto(ns.pers, a, { grade: campoAberto, heroi }));
  const aliados = [{ nome: "Bram", x: 12, y: 8 }];
  const grupo = [{ nome: "Bram", vida: 20, vidaMax: 20, condicoes: [] }];
  let todasNoBram = true, alguma = 0;
  for (let i = 0; i < 12; i++) {
    const ac = comSorteTravada(`mm7|oculto|${i}`, () => turnoDosInimigos({ inimigos: [a], jogador: ns.pers, grupo, grade: campoAberto, heroi, aliados, rodada: 1 }));
    for (const x of ac) { alguma++; if (x.alvoRef !== "grupo") todasNoBram = false; }
  }
  t("com outro alvo à vista, todo disparo vai nele (12 sementes)", alguma > 0 && todasNoBram);
  const so = comSorteTravada("mm7|oculto|so", () => turnoDosInimigos({ inimigos: [a], jogador: ns.pers, grade: campoAberto, heroi, rodada: 1 }));
  t("sozinho, dispara no quadrado — com desvantagem, o golpe às cegas de MM6", so.length === 1 && so[0].alvoRef === "jogador" && so[0].r.modo === "desvantagem");
  /* o lutador de perto não muda de alvo: a regra é de quem mira */
  const s = umSoldado(9, 2);
  const nsS = nascerEscondido(ficha(), { total: 30, grade: campoAberto, heroi, inimigos: [s] });
  const acS = comSorteTravada("mm7|oculto|soldado", () => turnoDosInimigos({ inimigos: [s], jogador: nsS.pers, grade: campoAberto, heroi, rodada: 1 }));
  t("o soldado colado continua a bater no herói escondido, às cegas (MM6)",
    nsS.ok && acS.length === 1 && acS[0].alvoRef === "jogador" && acS[0].r.modo === "desvantagem", acS[0] && acS[0].r.modo);
}

/* ============================================================ */
sec("6. o lutador de perto continua a avançar (regressão), e sem grade nada muda");
{
  const heroi = { nome: "Vera", x: 9, y: 10 };
  const s = umSoldado(9, 2);
  const r = moverInimigos(campoAberto, [s], heroi, [heroi]);
  t("o soldado anda para o herói", distanciaM(r.inimigos[0], heroi) < distanciaM(s, heroi));
  t("e o movimento dele não traz as marcas do atirador", !("recua" in r.movimentos[0]) && !("provoca" in r.movimentos[0]));
  const colado = umSoldado(9, 9);
  t("colado, fica (regra de sempre)", moverInimigos(campoAberto, [colado], heroi, [heroi]).movimentos.length === 0);
  const ac = comSorteTravada("mm7|soldado", () => turnoDosInimigos({ inimigos: [colado], jogador: ficha(), grade: campoAberto, heroi, rodada: 1 }));
  t("e bate de perto: sem `deLonge`", ac.length === 1 && !("deLonge" in ac[0]));
  t("com o golpe do catálogo de sempre", golpesDeCriatura("Soldado", perfilDe(colado).ataque, "comum").includes(ac[0].golpeNome));
  const longe = comSorteTravada("mm7|soldado2", () => turnoDosInimigos({ inimigos: [s], jogador: ficha(), grade: campoAberto, heroi, rodada: 1 }));
  t("longe, o soldado não alcança e não bate", longe.length === 0);
  /* sem grade, nada muda para ninguém — a regra de ouro de grid.js */
  const semG = moverInimigos(null, [umAtirador(1, 1)], heroi, [heroi]);
  t("sem grade, o atirador não se mexe (nem nada se mexe)", semG.movimentos.length === 0);
  const acSem = comSorteTravada("mm7|semgrade", () => turnoDosInimigos({ inimigos: [umAtirador(1, 1)], jogador: ficha(), rodada: 1 }));
  t("sem grade, o atirador dispara sem penalidade nem desvantagem", acSem.length === 1 && acSem[0].r.modo == null && acSem[0].r.bonus === 3);
  t("sem grade, a ação não inventa lugar (nem `metros`)", acSem.length === 1 && !("metros" in acSem[0]) && acSem[0].deLonge === true);
  /* o companheiro chamado Mago continua a andar como sempre andou */
  const inimigo = umSoldado(9, 2);
  const mago = { nome: "Mago", x: 9, y: 9, vida: 30, i: 0 };
  const mvA = moverInimigos(campoAberto, [mago], inimigo, [heroi, inimigo]);
  t("o companheiro Mago vem para o inimigo (não fica para trás pelo nome)", distanciaM(mvA.inimigos[0], inimigo) < distanciaM(mago, inimigo));
  t("e o passo dele não traz as marcas do atirador", mvA.movimentos.every((x) => !("recua" in x) && !("provoca" in x)));
}

/* ============================================================ */
sec("7. o repertório de quem atira — golpeDeLonge");
{
  const heroi = { nome: "Vera", x: 9, y: 8 };
  const a = umAtirador(9, 4);
  const ac = comSorteTravada("mm7|golpe", () => turnoDosInimigos({ inimigos: [a], jogador: ficha(), grade: campoAberto, heroi, rodada: 1 }));
  t("o Atirador dispara do catálogo de longe", GOLPES_DE_LONGE.fisico.includes(ac[0].golpeNome), ac[0].golpeNome);
  t("e nunca mais com golpe de encostar (Rasteira, Marretada…)", !GOLPES_POR_ELEMENTO.fisico.includes(ac[0].golpeNome));
  t("o disparo físico não carrega aflição nenhuma", GOLPES_DE_LONGE.fisico.every((n) => !PORTADORES.some((p) => p.re.test(n))));
  t("nenhum disparo de longe dá efeito a quem o lança nem ao bando dele", Object.values(GOLPES_DE_LONGE).flat().every((n) => !PORTADORES.some((p) => p.alvo !== "alvo" && p.re.test(n))));
  t("todo elemento do catálogo de perto tem o seu de longe", Object.keys(GOLPES_POR_ELEMENTO).every((el) => (GOLPES_DE_LONGE[el] || []).length >= 2));
  t("o Mago dispara magia", GOLPES_DE_LONGE.arcano.includes(golpeDeLonge("Mago", "arcano", "comum", 0)));
  t("o repertório tem o tamanho do de perto (1 a 3 pela ameaça)",
    new Set([0, 1, 2, 3, 4, 5].map((i) => golpeDeLonge("Atirador", "fisico", "fraco", i))).size === 1
    && new Set([0, 1, 2, 3, 4, 5].map((i) => golpeDeLonge("Atirador", "fisico", "lendario", i))).size <= 3);
  t("determinístico: o mesmo atirador, os mesmos disparos", golpeDeLonge("Atirador", "fisico", "elite", 1) === golpeDeLonge("Atirador", "fisico", "elite", 1));
  t("elemento desconhecido cai no físico, lixo não estoura", GOLPES_DE_LONGE.fisico.includes(golpeDeLonge("X", "nada", "comum", 0)) && typeof golpeDeLonge(null, null, null, null) === "string");
}

/* ============================================================ */
sec("8. a voz da intenção: o arqueiro não avança (nos dois sentidos)");
{
  const RX_ENCOSTAR = /avan[cç]|cerc|bater|bate em|empurr|prender|arrancar/i;
  const precisam = INTENCOES.filter((i) => RX_ENCOSTAR.test(i.quer)).map((i) => i.id);
  const faltam = precisam.filter((id) => !VOZ_DE_QUEM_ATIRA[id]);
  t("toda intenção de encostar tem a voz de quem atira", faltam.length === 0, faltam.join(", "));
  const falam = Object.entries(VOZ_DE_QUEM_ATIRA).filter(([, v]) => RX_ENCOSTAR.test(v)).map(([k]) => k);
  t("e nenhuma voz de quem atira fala de encostar", falam.length === 0, falam.join(", "));
  t("toda voz é de uma intenção que existe", Object.keys(VOZ_DE_QUEM_ATIRA).every((id) => INTENCOES.some((i) => i.id === id)));
  t("garantirLuta sabe quem fala de longe, pelo nome", garantirLuta({ nome: "Atirador" }).deLonge === true && garantirLuta({ nome: "Soldado" }).deLonge === false);
  t("o campo explícito manda sobre o nome", garantirLuta({ nome: "Soldado", deLonge: true }).deLonge === true && garantirLuta({ nome: "Atirador", deLonge: false }).deLonge === false);
  t("lixo não é de longe", garantirLuta(null).deLonge === false);

  const s = { nome: "Atirador", ameaca: "comum", quantos: 3, quantosEram: 3, quantosDoOutroLado: 1, minhaVida: 1, heroiVida: 1, rodada: 1, saidas: 2 };
  const v = intencaoDaVez(s);
  const alvos = [{ ref: "jogador", nome: "Vera", vida: 40, vidaMax: 40, nivel: 5, heroi: true, perto: true }];
  const lin = linhaDaLuta(s, alvos);
  t("a linha do arqueiro usa a voz de quem atira", !!VOZ_DE_QUEM_ATIRA[v.intencao.id] && lin.includes(VOZ_DE_QUEM_ATIRA[v.intencao.id]), lin);
  t("e não diz que ele avança nem cerca", !RX_ENCOSTAR.test(lin.replace(/^[^:]*:/, "")), lin);
  const linS = linhaDaLuta({ ...s, nome: "Soldado" }, alvos);
  t("a do soldado, na mesma situação, é a de sempre", linS.includes(v.intencao.quer), linS);
  t("a eleição não mudou: mesma intenção, mesmo alvo", intencaoDaVez({ ...s, nome: "Soldado" }).intencao.id === v.intencao.id);
  /* a virada fala pela mesma voz */
  const env = envelopeDaVirada({ ...s, minhaVida: 0.2 }, { antes: "aguentar" });
  t("a virada de um arqueiro também não o põe a bater", !env || !/bater em quem estiver mais perto/.test(env), env);
}

/* ============================================================ */
sec("9. determinismo e imutabilidade");
{
  const heroi = { nome: "Vera", x: 9, y: 10 };
  const um = moverInimigos(campoAberto, [umAtirador(9, 9), umAtirador(3, 3, { nome: "Arqueiro" })], heroi, [heroi]);
  const dois = moverInimigos(campoAberto, [umAtirador(9, 9), umAtirador(3, 3, { nome: "Arqueiro" })], heroi, [heroi]);
  t("o mesmo tabuleiro dá o mesmo posto", JSON.stringify(um) === JSON.stringify(dois));
  const entra = [umAtirador(9, 9)];
  const copia = JSON.stringify(entra);
  moverInimigos(campoAberto, entra, heroi, [heroi]);
  t("e não muta o que recebeu", JSON.stringify(entra) === copia);
  const M = await carregar();
  const l1 = lutaDosAtiradores(M, "dupla", "mm7|det|3"), l2 = lutaDosAtiradores(M, "dupla", "mm7|det|3");
  t("a mesma semente dá a mesma luta", JSON.stringify(l1) === JSON.stringify(l2));
}

/* ============================================================ */
sec("10. a catraca: a luta fica diferente, não mais dura nem mais mole (140 lutas)");
{
  const M = await carregar();
  const m = sondarAtiradores(M, { n: RETRATO_DOS_ATIRADORES.n });
  const A = RETRATO_DOS_ATIRADORES.antes, D = RETRATO_DOS_ATIRADORES.depois;
  for (const c of Object.keys(D)) {
    const x = m[c];
    console.log(`      ${c.padEnd(11)} dano no herói ${x.dano.toFixed(2)} (retrato ${D[c].dano}, antes ${A[c].dano}) · grupo ${x.danoGrupo.toFixed(2)} · vitória ${(x.vitoria * 100).toFixed(1)}% · rodadas ${x.rodadas.toFixed(2)} · disparos ${x.disparos.toFixed(2)} · recuos ${x.recuos.toFixed(2)}`);
    t(`${c}: a medida bate com o retrato (±2%)`, Math.abs(x.dano / D[c].dano - 1) <= 0.02, x.dano.toFixed(2));
    const varia = x.dano / A[c].dano - 1;
    t(`${c}: o dano no herói fica a menos de ${LIMITE_DOS_ATIRADORES.variacao * 100}% do antes (${(varia * 100).toFixed(1)}%)`, Math.abs(varia) < LIMITE_DOS_ATIRADORES.variacao);
    t(`${c}: a vitória não cai mais de 2 pontos`, x.vitoria >= A[c].vitoria - 0.02, x.vitoria);
    t(`${c}: os atiradores disparam de verdade`, x.disparos > 1);
  }
  t("bando: o dano no grupo também fica perto do antes", Math.abs(m.bando.danoGrupo / A.bando.danoGrupo - 1) < LIMITE_DOS_ATIRADORES.variacao);
  t("o recuo acontece e é cobrado (a fiação da §13)", m.dupla.recuos > 0.5 && m.dupla.oportunidades > 0.5);
  t("sem o golpe de oportunidade no recuo, o conjurador passaria do limite",
    RETRATO_DOS_ATIRADORES.semOportunidade.conjurador.dano / A.conjurador.dano - 1 > LIMITE_DOS_ATIRADORES.variacao);
  t("a amostra do retrato é a da sonda", RETRATO_DOS_ATIRADORES.n === AMOSTRA_DOS_ATIRADORES.n);
}

/* ============================================================
   11. O MOTOR, DE PERTO — turnoDosInimigos sabe quem atira e quem golpeia
   ============================================================ */
sec("11. quem mantém distância dispara; quem está colado paga a desvantagem");
{
  const campo = montarGrade({ local: "campo aberto", bioma: "planicie" });
  const heroi = { nome: "Herói", x: 5, y: 5, vida: 30, condicoes: [] };
  const atirador = (x, y) => ({ ...completarInimigo({ nome: "Atirador", ameaca: "comum", nivel: 3 }, 3), x, y, condicoes: [], derrotado: false });
  const soldado = (x, y) => ({ ...completarInimigo({ nome: "Soldado", ameaca: "comum", nivel: 3 }, 3), x, y, condicoes: [], derrotado: false });

  /* de longe, sem ninguém colado nele: dispara com `deLonge`, sem
     desvantagem forçada (a `oculto`/`estaInvisivel` também não entram aqui). */
  const deLonge = turnoDosInimigos({ inimigos: [atirador(5, 15)], jogador: heroi, grade: campo, heroi, aliados: [], rodada: 1 });
  t("a ação carrega `deLonge`", deLonge.length > 0 && deLonge.every((a) => a.deLonge === true));
  t("sem ninguém colado, não força desvantagem", deLonge.every((a) => a.r.modo !== "desvantagem"));

  /* colado (a um quadrado do herói) e disparando mesmo assim: a regra do
     5e cobra desvantagem — é o preço que faz o recuo de MM7 valer a pena. */
  const colado = turnoDosInimigos({ inimigos: [atirador(5, 6)], jogador: heroi, grade: campo, heroi, aliados: [], rodada: 1 });
  t("colado, o atirador ainda dispara (`deLonge`)", colado.length > 0 && colado.every((a) => a.deLonge === true));
  t("...mas com desvantagem — o preço de atirar às cegas de perto", colado.every((a) => a.r.modo === "desvantagem"));

  /* quem luta de perto nunca carrega `deLonge`, e colado não é penalidade
     extra para ele — a desvantagem de MM7 é só de quem atira. */
  const perto = turnoDosInimigos({ inimigos: [soldado(5, 6)], jogador: heroi, grade: campo, heroi, aliados: [], rodada: 1 });
  t("o Soldado colado não carrega `deLonge`", perto.length > 0 && perto.every((a) => !a.deLonge));
  t("...nem desvantagem forçada (a regra é só de quem atira)", perto.every((a) => a.r.modo !== "desvantagem"));
}

/* ============================================================
   12. O MOTOR, DE LONGE — a sonda: a luta ficou diferente, não pior
   ============================================================ */
sec("12. a medida — 140 lutas, e o golpe de oportunidade que fecha a conta");
{
  t("o retrato é de 140 lutas, nos três cenários", RETRATO_DOS_ATIRADORES.n === 140
    && Object.keys(LUTAS_DOS_ATIRADORES).every((c) => RETRATO_DOS_ATIRADORES.antes[c] && RETRATO_DOS_ATIRADORES.depois[c]));

  for (const c of Object.keys(LUTAS_DOS_ATIRADORES)) {
    const antes = RETRATO_DOS_ATIRADORES.antes[c].dano, depois = RETRATO_DOS_ATIRADORES.depois[c].dano;
    const variacao = Math.abs(depois - antes) / antes;
    t(`${c}: o dano no herói varia ${(variacao * 100).toFixed(1)}% — dentro do limite de ${(LIMITE_DOS_ATIRADORES.variacao * 100).toFixed(0)}%`,
      variacao < LIMITE_DOS_ATIRADORES.variacao);
  }

  /* O GOLPE DE OPORTUNIDADE NÃO É ENFEITE. Sem ele, o conjurador recua para
     lançar de novo sem pagar nada por dar as costas — e o dano no herói
     estoura o limite que os outros dois cenários cumprem com folga. */
  const antesConj = RETRATO_DOS_ATIRADORES.antes.conjurador.dano;
  const variacaoSemOp = (RETRATO_DOS_ATIRADORES.semOportunidade.conjurador.dano - antesConj) / antesConj;
  t(`sem o golpe de oportunidade, o conjurador passa do limite (+${(variacaoSemOp * 100).toFixed(0)}%) — a fiação da seção 3 não é opcional`,
    variacaoSemOp > LIMITE_DOS_ATIRADORES.variacao);
  const variacaoDuplaSemOp = Math.abs(RETRATO_DOS_ATIRADORES.semOportunidade.dupla.dano - RETRATO_DOS_ATIRADORES.antes.dupla.dano) / RETRATO_DOS_ATIRADORES.antes.dupla.dano;
  t("nos outros dois cenários o golpe de oportunidade pesa menos (o atirador comum tem menos motivo para recuar)",
    variacaoDuplaSemOp < variacaoSemOp);

  /* determinismo: a mesma semente dá a mesma luta, em qualquer máquina */
  const M = await carregar();
  const a = JSON.stringify(lutaDosAtiradores(M, "dupla", "mm7prova|3"));
  const b = JSON.stringify(lutaDosAtiradores(M, "dupla", "mm7prova|3"));
  t("determinismo: a mesma semente dá a mesma luta", a === b);

  /* uma amostra ao vivo, menor que o retrato (40 contra 140) para caber no
     `npm test` — com folga extra no limite, porque amostra pequena tem
     mais ruído do que 140 lutas. */
  console.log(`      (medindo ${Object.keys(LUTAS_DOS_ATIRADORES).length * 40 * 2} lutas ao vivo — pode levar alguns segundos)`);
  const folga = LIMITE_DOS_ATIRADORES.variacao + 0.15;
  const vivoComOp = sondarAtiradores(M, { n: 40, prefixo: "mm7ao-vivo-com" });
  const vivoSemOp = sondarAtiradores(M, { n: 40, prefixo: "mm7ao-vivo-sem", comOportunidade: false });
  for (const c of Object.keys(LUTAS_DOS_ATIRADORES)) {
    const variacaoViva = Math.abs(vivoComOp[c].dano - RETRATO_DOS_ATIRADORES.antes[c].dano) / RETRATO_DOS_ATIRADORES.antes[c].dano;
    t(`${c} ao vivo, com o golpe de oportunidade: ainda perto do retrato (${(variacaoViva * 100).toFixed(1)}%, folga ${(folga * 100).toFixed(0)}%)`,
      variacaoViva < folga);
  }
  t("ao vivo, tirar o golpe de oportunidade do conjurador não melhora o dano no herói",
    vivoSemOp.conjurador.dano >= vivoComOp.conjurador.dano - 1.5);
  t("ao vivo, os recuos e os disparos acontecem de fato (o cenário exercitou a regra)",
    vivoComOp.conjurador.recuos > 0 && vivoComOp.conjurador.disparos > 0 && vivoComOp.dupla.disparos > 0);
}

/* ============================================================
   13. A FIAÇÃO NO App.jsx (frontend, MM7) — prova por texto

   O motor acima roda em Node, sem React; esta seção prova que o App.jsx de
   fato liga `m.provoca` ao golpe de oportunidade do herói, no mesmo molde
   de `teste-mm6-escondido.mjs` §12: lê o arquivo como TEXTO e ancora em
   CONTEÚDO que só existe se a fiação de fato ligou o motor — nunca em
   número de linha.
   ============================================================ */
sec("13. a fiação no App.jsx");
{
  /* o fim de linha é normalizado: com core.autocrlf, uma cópia fresca do
     repositório (git archive, o so-o-meu.sh, outra máquina) traz o App.jsx
     em CRLF, e uma âncora de várias linhas só bateria em LF. */
  const APP = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8").replace(/\r\n/g, "\n");

  sec("13.1. o auxiliar comum — `golpeDeOportunidadeDoHeroi`");
  {
    t("existe, e antes de `resolverRevide`",
      /const golpeDeOportunidadeDoHeroi = \(persBase, alvo, aliadosOp, grade, heroi\) => \{/.test(APP));
    const posAux = APP.indexOf("const golpeDeOportunidadeDoHeroi =");
    const posRevide = APP.indexOf("const resolverRevide = (persBase, aoTerminar) => {");
    t("definido antes de `resolverRevide` (está no escopo dele)", posAux > -1 && posRevide > -1 && posAux < posRevide);
    /* os DOIS ramos chamam o auxiliar — nunca copiam a conta de novo */
    const chamadas = APP.match(/golpeDeOportunidadeDoHeroi\(persBase, \w+, aliadosOp, [\w.]+, [\w.]+\)/g) || [];
    t("chamado nos dois ramos (fuga e recuo), sem cópia da conta", chamadas.length === 2);
    t("a fuga chama com a posição de `combPos`",
      /golpeDeOportunidadeDoHeroi\(persBase, e, aliadosOp, combPos\.grade, combPos\.heroi\)/.test(APP));
    t("o recuo chama com a posição já movida (`gradeAtual`/`lugarHeroi`)",
      /golpeDeOportunidadeDoHeroi\(persBase, alvo, aliadosOp, gradeAtual, lugarHeroi\)/.test(APP));
    /* a fórmula em si só existe UMA vez no arquivo — dentro do auxiliar */
    const formula = (APP.match(/Math\.round\(danoDe\(persBase, false\) \/ 2\), vfOp \? \{ furtivo: vfOp\.soma \} : null\)/g) || []).length;
    t("a fórmula do dano de oportunidade não foi duplicada", formula === 1);
  }

  sec("13.2. o recuo provoca — `resolverRevide` trata `m.provoca`");
  {
    t("filtra os movimentos que provocaram", /mv\.movimentos\.filter\(\(x\) => x\.provoca\)/.test(APP));
    t("só reage o herói vivo e sem `perdeAcao`",
      /\(persBase\.vida \|\| 0\) > 0 && !mecanicaDe\(persBase\.condicoes \|\| \[\]\)\.perdeAcao/.test(APP));
    t("acha o alvo já movido em `combPos.inimigos`",
      /const alvo = \(combPos\.inimigos \|\| \[\]\)\.find\(\(x\) => x\.nome === m\.nome && !x\.derrotado && \(x\.vida \|\| 0\) > 0\)/.test(APP));
    t("uma linha de chat nomeia o golpe de oportunidade do recuo",
      /`\$\{alvo\.nome\} recua para disparar e leva o seu golpe de oportunidade: \$\{r\.dano\} de dano/.test(APP));
    /* QUEM RECUA NÃO FUGIU: `fugiu` é exclusivo de quem sai da luta fugindo
       (querFugir); o atirador baleado ao recuar continua na mesa, só cai
       `derrotado` se o golpe o matar. */
    const iniRecuo = APP.indexOf("for (const m of mv.movimentos.filter((x) => x.provoca)) {");
    const fimRecuo = APP.indexOf("notaRecuo = recuos.length");
    const blocoRecuo = APP.slice(iniRecuo, fimRecuo);
    t("o bloco do recuo existe e foi isolado para a checagem", iniRecuo > -1 && fimRecuo > iniRecuo && blocoRecuo.length > 100);
    t("...e não escreve `fugiu` em canto nenhum dele", !/fugiu:/.test(blocoRecuo));
    t("quem sobrevive ao recuo só perde vida (fica na luta)",
      /combPos\.inimigos\.map\(\(x\) => \(x\.nome !== alvo\.nome \? x : \(morreu \? \{ \.\.\.x, vida: pv, derrotado: true \} : \{ \.\.\.x, vida: pv \}\)\)\)/.test(APP));
    /* se o golpe de oportunidade derrubar todo mundo, fecha a luta — igual
       ao ramo das fugas, e SEM levantar o cartão do golpe final (MM3): ele
       só existe em `aplicarGolpeDoJogador`, nunca em golpe de oportunidade */
    t("todos caindo ao recuar fecha a luta, como a fuga",
      /const pRecuo = fecharSeTodosCairam\(persBase\);\s*\n\s*if \(pRecuo\) \{/.test(APP));
    t("a nota do recuo viaja ao lado de `notaFuga`, nunca sozinha",
      /\$\{notaFuga\}\$\{notaRecuo\} Turno dos inimigos/.test(APP));
    t("`notaRecuo` nasce vazia, antes do passo dos inimigos", /let notaRecuo = "";/.test(APP));
  }

  sec("13.3. a linha do passo diz a verdade — `linhaDePasso`");
  {
    t("recua quando `m.recua`, avança quando não",
      /const linhaDePasso = \(m\) => \(m\.de === m\.para\s*\n\s*\? `👣 \$\{m\.nome\} \$\{m\.recua \? "recua" : "avança"\} \$\{Math\.max\(1, Math\.round\(m\.metros \|\| 0\)\)\} m — ainda \$\{m\.para\}`/.test(APP));
  }

  sec("13.4. o cartão do golpe final (MM3) fica onde sempre esteve");
  {
    /* `decidirGolpeFinal`/`setGolpeFinalPendente` só existem dentro de
       `aplicarGolpeDoJogador` — nem a fuga nem o recuo os chamam. Golpe de
       oportunidade não é o golpe do jogador; poupar é uma escolha da AÇÃO
       dele, e nem `querFugir` nem o recuo do atirador são isso. */
    const posQuerFugir = APP.indexOf("for (const e of vivos.filter((x) => querFugir(x))) {");
    const posFimRecuo = APP.indexOf("notaRecuo = recuos.length");
    const fugaAoRecuo = APP.slice(posQuerFugir, posFimRecuo > -1 ? posFimRecuo : posQuerFugir + 4000);
    t("nem a fuga nem o recuo perguntam `setGolpeFinalPendente`", posQuerFugir > -1 && !/setGolpeFinalPendente/.test(fugaAoRecuo));
    t("nem chamam `decidirGolpeFinal`", !/decidirGolpeFinal/.test(fugaAoRecuo));
  }
}

console.log(`\nmm7 atiradores (motor + sonda + fiação): ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
