/* A RÉGUA DO PODER (09/11/2026, Fase TE · TE7) — o kit da história contra o kit típico

   A pessoa, 09/11: *«além da ótima história ele precisa da recompensa e da
   sensação de ficar mais forte».* A planta (mente/plano-temperatura-e-
   espolios.md, §2.3) pôs essa sensação num intervalo medido, e é esta suíte
   que o mede: o equipamento ganho na história GANHA de +3 a +12 pontos de
   vitória acima do equipamento típico do nível, e NUNCA passa de 70% no
   cenário justo. Dois lados, e os dois mordem: abaixo de +3 o prémio não se
   sente; acima de +12 (ou de 70%) a luta deixa de ser luta. Anda ANTES da
   TE9: sem ela, nenhum item da história sobe.

   ---------------- PORQUE O CENÁRIO JUSTO DA CASA NÃO SERVIA ----------------

   A régua de Uma Vida (`regua-combate.mjs`) tem o seu `justo` — mas com o
   Adversário ligado (o jogo de hoje) ele mede 1,4% a 2,4% de vitória, e
   `teste-regua.mjs` já o diz como dívida de balanceamento (DENTE 1,
   pendente desde N1b). Num cenário onde o grupo perde 98 vezes em 100 não há
   «+3 pontos» para ver; e é um só herói (Guerreiro de nível 5). Esta régua
   precisava de MAIS: o nível e a classe a variar. O mínimo que a fez medir,
   e nada além dele:
     1. `regua-combate.mjs#fichaDoHeroi` passou a aceitar `equipados` (as
        PEÇAS inteiras, com bónus e poderes) e `sintonizados`; ausentes, a
        conta de sempre — a secção 2 prova-o byte a byte;
     2. o golpe do herói passou a somar o PODER DA PEÇA pelas três portas do
        App (golpe extra, dano fixo, crítico mais largo — dadivas.js); sem
        isto o «Sede, +2» da peça não existia na régua. O herói dos cenários
        da casa não tem poderes: soma 0, 0 e 20, e mede o que media;
     3. uma MESA JUSTA por classe e nível (`MESA_JUSTA`, abaixo): o mesmo
        grupo da casa (vestido como o jogo o veste), e do outro lado da mesa
        o que põe o kit TÍPICO dessa classe naquele nível no meio — a faixa
        de 35% a 65% da arena. É a calibragem do `justo` original (variar SÓ
        o outro lado da mesa), refeita para vinte mesas em vez de uma.

   ---------------- OS KITS ----------------

   As peças são SORTEADAS, uma por combate (a semente do combate sorteia a
   peça): o poder de um item de quest é uma distribuição, não um exemplar —
   medido com UM exemplar, o mesmo kit dava −5 ou +48 pontos conforme o
   poder que caía. O típico: arma e armadura da classe (`KIT_INICIAL`) no
   degrau `tipico` do nível; o da história: as mesmas, no degrau `daQuest`
   (`TETO_DE_RARIDADE_DO_NIVEL`, espolios.js); o do artefacto: a arma é o
   artefacto com nome do confronto (`pagaDaQuest` do Cimo da Escada), EXALTADO
   (os dois passivos), e a armadura a da história. Tudo pelas portas do jogo
   (`gerarLoot`, `pagaDaQuest`, `despertarArtefacto`) — a régua não fabrica
   peça nenhuma à mão.

   ---------------- O QUE A RÉGUA MUDOU ----------------

   Medida no teto do DMG, a peça de quest passava os +12 do nível 11 em
   diante em TODAS as classes (+14 a +25), e no 7 o artefacto um degrau acima
   do teto dava +21 a +26. Por isso a coluna `daQuest` fica um degrau abaixo
   do teto do 11 em diante, e o artefacto não passa o degrau da quest (os
   números estão no cabeçalho de espolios.js). Consequência honesta, e é a
   linha pendente da secção 4: do 11 em diante a peça de quest e a típica
   são do MESMO degrau, e o piso de +3 não se cumpre por peça genérica — ali
   o «mais forte» é do artefacto com nome (TE8), que esta régua já mede. */
import { Worker, isMainThread, parentPort, workerData } from "node:worker_threads";
import { fileURLToPath } from "node:url";
import os from "node:os";
import { simularCombate, CENARIOS_DA_REGUA, fichaDoGrupo, proporcaoComMargem } from "./regua-combate.mjs";
import { gerarLoot } from "../src/loot.js";
import { KIT_INICIAL } from "../src/kit-inicial.js";
import { pedeSintonia } from "../src/sintonia.js";
import { dadoDo } from "../src/semente.js";
import { DEFESA_DA_ARMADURA } from "../src/prontos.js";
import { RELIQUIAS, itemDaReliquia } from "../src/relicas.js";
import { questPorId } from "../src/biblioteca-de-quests.js";
import { tetoDeRaridade, pagaDaQuest, despertarArtefacto, TETO_DE_RARIDADE_DO_NIVEL } from "../src/espolios.js";

/* ============================================================
   AS TABELAS
   ============================================================ */

/* A LEI DO PODER: o piso e o teto do ganho, em pontos de vitória, e o teto
   absoluto no cenário justo. `sementes`: combates por kit e por mesa (os
   mesmos nos três kits — a diferença medida é só a peça). */
/* `pisoNasClasses`: onde o piso morde. O conjurador luta com a magia, e a
   arma e a armadura pesam-lhe pouco no motor (medido: a Clériga +1,7 no 3 e
   +8,0 no 7, o Mago +3,3 e +3,0 — o ruído de 300 combates é ±4): o prémio
   dele é o acessório e o XP (o saber), não o aço. Para ele vale o TETO, que é
   o que protege a luta; o piso imprime-se, pendente. */
const REGUA_DO_PODER = Object.freeze({ piso: 3, teto: 12, tetoDeVitoria: 0.7, faixaDoTipico: Object.freeze([0.35, 0.65]), sementes: 300, prefixo: "poder",
  pisoNasClasses: Object.freeze(["Guerreiro", "Ladino", "Caçador"]) });

/* O HERÓI DE CADA CLASSE: os atributos da criação, o principal em 3. Cinco
   classes, uma por modo de lutar: o corpo a corpo pesado (Guerreiro), o
   ágil (Ladino), o de longe (Caçador), quem cura (Clérigo), quem conjura
   (Mago). Os níveis: um por faixa da tabela do teto. */
const HEROI_DA_CLASSE = Object.freeze({
  Guerreiro: { forca: 3, destreza: 2, vigor: 3, intelecto: 0, presenca: 1, percepcao: 1 },
  Ladino: { forca: 1, destreza: 3, vigor: 2, intelecto: 1, presenca: 2, percepcao: 2 },
  Caçador: { forca: 1, destreza: 3, vigor: 2, intelecto: 1, presenca: 0, percepcao: 3 },
  Clérigo: { forca: 2, destreza: 1, vigor: 3, intelecto: 1, presenca: 3, percepcao: 1 },
  Mago: { forca: 0, destreza: 2, vigor: 2, intelecto: 3, presenca: 1, percepcao: 2 },
});
const NIVEIS_DA_REGUA = Object.freeze([3, 7, 12, 17]);

/* A MESA JUSTA de cada classe e nível: o outro lado da mesa que põe o kit
   típico no meio (busca por bissecção no nível do inimigo, para cada
   ameaça e quantidade, 200 sementes; o escolhido é o mais perto de 50%).
   Calibrado em 09/11 com o motor de hoje — se o combate mudar, a secção 3
   diz qual mesa saiu da faixa, e recalibra-se aqui. */
const MESA_JUSTA = Object.freeze({
  "Guerreiro|3": { ameaca: "elite", quantos: 4, nivel: 1 },
  "Ladino|3": { ameaca: "elite", quantos: 3, nivel: 2 },
  "Caçador|3": { ameaca: "elite", quantos: 2, nivel: 5 },
  "Clérigo|3": { ameaca: "lendario", quantos: 5, nivel: 1 },
  "Mago|3": { ameaca: "lendario", quantos: 5, nivel: 1 },
  "Guerreiro|7": { ameaca: "elite", quantos: 4, nivel: 6 },
  "Ladino|7": { ameaca: "lendario", quantos: 3, nivel: 3 },
  "Caçador|7": { ameaca: "elite", quantos: 3, nivel: 10 },
  "Clérigo|7": { ameaca: "lendario", quantos: 5, nivel: 5 },
  "Mago|7": { ameaca: "lendario", quantos: 4, nivel: 6 },
  "Guerreiro|12": { ameaca: "lendario", quantos: 2, nivel: 17 },
  "Ladino|12": { ameaca: "lendario", quantos: 2, nivel: 16 },
  "Caçador|12": { ameaca: "lendario", quantos: 2, nivel: 16 },
  "Clérigo|12": { ameaca: "lendario", quantos: 4, nivel: 15 },
  "Mago|12": { ameaca: "lendario", quantos: 4, nivel: 14 },
  "Guerreiro|17": { ameaca: "lendario", quantos: 3, nivel: 18 },
  "Ladino|17": { ameaca: "elite", quantos: 5, nivel: 20 },
  "Caçador|17": { ameaca: "lendario", quantos: 3, nivel: 18 },
  "Clérigo|17": { ameaca: "lendario", quantos: 5, nivel: 19 },
  "Mago|17": { ameaca: "lendario", quantos: 5, nivel: 17 },
});

/* ============================================================
   A MESA E OS KITS — as portas do jogo, nada à mão
   ============================================================ */
const CONFRONTO = questPorId("o_cimo_da_escada");
function fechado(F) {
  const feitas = {};
  for (const e of F.etapas) feitas[e.id] = { dia: 1, ramo: Array.isArray(e.ramos) ? e.ramos[0] : null, variante: null };
  return { id: F.id, tipo: F.tipo, inicio: 0, ultimoAvanco: 1, papeis: {}, feitas, escolhas: {}, acesas: {}, reviravoltas: [], consequencias: [], estado: "concluida", motivo: "etapas", desfecho: null, fecho: null, fechouEm: 1 };
}
const peca = (raridade, tipo, base, nivel, ...sem) => gerarLoot(raridade, { tipo, nivel, base, rnd: dadoDo("regua-do-poder", tipo, nivel, ...sem) });
function kit(classe, nivel, qual, i) {
  const k = KIT_INICIAL[classe] || {};
  const T = tetoDeRaridade(nivel);
  const degrau = qual === "tipico" ? T.tipico : T.daQuest;
  const eq = {};
  if (qual === "artefacto") {
    const p = pagaDaQuest(CONFRONTO, fechado(CONFRONTO), { semente: `${REGUA_DO_PODER.prefixo}|${i}`, nivel, heroi: { classe, nivel, equipados: {} } });
    const art = p && p.itens.find((x) => x.artefacto);
    eq.arma = despertarArtefacto(art, { nivel, confronto: true });
  } else if (qual === "reliquia") {
    eq.arma = itemDaReliquia(RELIQUIAS.find((r) => r.tipo === "arma"));
  } else if (k.arma) eq.arma = peca(degrau, "arma", k.arma, nivel, qual, i);
  if (k.armadura) eq.armadura = peca(qual === "reliquia" ? T.tipico : degrau, "armadura", k.armadura, nivel, qual === "tipico" || qual === "reliquia" ? "tipico" : "historia", i);
  return { equipados: eq, sintonizados: Object.values(eq).filter(pedeSintonia).map((x) => x.nome).slice(0, 3) };
}
function mesa(classe, nivel, qual, i) {
  const casa = CENARIOS_DA_REGUA.justo;
  return {
    id: `poder:${classe}:${nivel}`, tetoDeRodadas: casa.tetoDeRodadas,
    heroi: { nome: "Herói", classe, nivel, vigor: HEROI_DA_CLASSE[classe].vigor, atributos: { ...HEROI_DA_CLASSE[classe] }, ...kit(classe, nivel, qual, i) },
    /* o grupo da casa, vestido como o jogo o veste (sem `semKit`) */
    grupo: casa.grupo.map((g) => ({ ...g, nivel, semKit: false })),
    inimigos: { base: "Adversário", ...MESA_JUSTA[`${classe}|${nivel}`] },
  };
}
const KITS = ["tipico", "historia", "artefacto", "reliquia"];
function medirMesa(classe, nivel, n) {
  const v = Object.fromEntries(KITS.map((q) => [q, 0]));
  for (let i = 0; i < n; i++) for (const q of KITS) v[q] += simularCombate(mesa(classe, nivel, q, i), `${REGUA_DO_PODER.prefixo}|${i}`).vitoria;
  return v;
}

/* ---------------- o trabalhador: uma mesa por mensagem ---------------- */
if (!isMainThread && workerData && workerData.reguaDoPoder) {
  parentPort.on("message", (m) => {
    try { parentPort.postMessage({ chave: m.chave, v: medirMesa(m.classe, m.nivel, m.n) }); }
    catch (e) { parentPort.postMessage({ chave: m.chave, erro: String((e && e.stack) || e) }); }
  });
}

if (isMainThread) {
  let bons = 0, maus = 0;
  const t = (nome, cond, extra = "") => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? "  — " + extra : "")); } };
  const pendente = (nome, linha) => console.log("  ··  " + nome + " — " + linha + "  (medido, não travado)");
  const sec = (s) => console.log("\n" + s);
  const J = (x) => JSON.stringify(x);
  const inicio = Date.now();

  sec("1. AS TABELAS");
  {
    const classes = Object.keys(HEROI_DA_CLASSE);
    t("toda classe da régua tem kit no jogo", classes.every((c) => KIT_INICIAL[c] && KIT_INICIAL[c].arma));
    t("há uma mesa justa para cada classe e nível", classes.every((c) => NIVEIS_DA_REGUA.every((n) => MESA_JUSTA[`${c}|${n}`])) && Object.keys(MESA_JUSTA).length === classes.length * NIVEIS_DA_REGUA.length);
    t("um nível por faixa da tabela do teto", TETO_DE_RARIDADE_DO_NIVEL.every((f, i) => NIVEIS_DA_REGUA.some((n) => n <= f.ate && n > (i ? TETO_DE_RARIDADE_DO_NIVEL[i - 1].ate : 0))));
    t("a lei: +3 a +12, e nunca acima de 70%", REGUA_DO_PODER.piso === 3 && REGUA_DO_PODER.teto === 12 && REGUA_DO_PODER.tetoDeVitoria === 0.7);
    t("a faixa do típico é a da arena (35% a 65%)", J(REGUA_DO_PODER.faixaDoTipico) === J([0.35, 0.65]));
  }

  sec("2. A PORTA NOVA DA RÉGUA — a peça inteira, e o que já se media não muda");
  {
    const casa = CENARIOS_DA_REGUA.justo;
    const h = casa.heroi;
    const mesmasPecas = { ...casa, heroi: { ...h, equipados: {
      arma: { nome: h.arma, tipo: "arma" },
      armadura: { nome: h.armadura, tipo: "armadura", atributos: { defesa: DEFESA_DA_ARMADURA[h.armadura] || 1 } },
      escudo: { nome: h.escudo, tipo: "escudo", atributos: { defesa: DEFESA_DA_ARMADURA[h.escudo] || 1 } },
    } } };
    const iguais = Array.from({ length: 20 }, (_, i) => J(simularCombate("justo", "umavida|" + i)) === J(simularCombate(mesmasPecas, "umavida|" + i))).every(Boolean);
    t("vestir as mesmas peças por `equipados` mede byte a byte o que os nomes mediam", iguais);
    t("o cenário recebido não é mutado", J(mesmasPecas.heroi.equipados.arma) === J({ nome: h.arma, tipo: "arma" }));
    const sede = { nome: "Lâmina de Prova", base: "Espada Longa", tipo: "arma", raridade: "raro", atributos: { dano: 2 }, poderes: [{ id: "sede", nome: "Sede", efeito: { danoExtra: 2 } }] };
    const com = (sint) => ({ ...casa, heroi: { ...h, equipados: { arma: sede }, sintonizados: sint } });
    let dSint = 0, dDorme = 0;
    for (let i = 0; i < 100; i++) { dSint += simularCombate(com([sede.nome]), "pp|" + i).danoDesferido; dDorme += simularCombate(com([]), "pp|" + i).danoDesferido; }
    t("o poder da peça entra no golpe (Sede, +2) — e só sintonizado, como no jogo", dSint > dDorme, `${dSint} contra ${dDorme}`);
    t("o grupo da mesa é o da casa, vestido como o jogo o veste", fichaDoGrupo(mesa("Guerreiro", 7, "tipico", 0)).every((g) => g.equipados && g.equipados.arma));
    const a = mesa("Ladino", 7, "historia", 5), b = mesa("Ladino", 7, "historia", 5);
    t("o kit é da semente: a mesma mesa, as mesmas peças", J(a) === J(b) && J(simularCombate(a, "poder|5")) === J(simularCombate(b, "poder|5")));
    t("e cada combate sorteia a sua peça (é uma distribuição, não um exemplar)", J(mesa("Ladino", 7, "historia", 5).heroi.equipados) !== J(mesa("Ladino", 7, "historia", 6).heroi.equipados));
    const art = mesa("Guerreiro", 7, "artefacto", 0).heroi.equipados.arma;
    t("o kit do artefacto usa a peça com nome do jogo, exaltada, no degrau da quest", art && art.artefacto && art.artefacto.estado === "exaltado" && art.raridade === tetoDeRaridade(7).daQuest && art.poderes.length === 2);
  }

  /* ---------------- a medição, repartida por trabalhadores ---------------- */
  const tarefas = Object.keys(HEROI_DA_CLASSE).flatMap((classe) => NIVEIS_DA_REGUA.map((nivel) => ({ chave: `${classe}|${nivel}`, classe, nivel, n: REGUA_DO_PODER.sementes })));
  const quantos = Math.max(1, Math.min(4, (os.cpus() || []).length - 1));
  const R = {};
  await new Promise((resolve, reject) => {
    const fila = [...tarefas];
    let vivos = 0;
    for (let w = 0; w < quantos; w++) {
      const wk = new Worker(fileURLToPath(import.meta.url), { workerData: { reguaDoPoder: true } });
      vivos++;
      const proxima = () => { const x = fila.shift(); if (x) wk.postMessage(x); else { wk.terminate(); if (--vivos === 0) resolve(); } };
      wk.on("message", (m) => { if (m.erro) { reject(new Error(m.erro)); return; } R[m.chave] = m.v; proxima(); });
      wk.on("error", reject);
      proxima();
    }
  });
  const n = REGUA_DO_PODER.sementes;
  const pct = (x) => (x * 100).toFixed(1) + "%";
  const pts = (x) => (x >= 0 ? "+" : "") + (x * 100).toFixed(1);

  sec("3. AS MESAS JUSTAS — o kit típico no meio, em cada classe e nível");
  for (const tr of tarefas) {
    const v = R[tr.chave];
    const tip = v.tipico / n;
    const m = proporcaoComMargem(v.tipico, n);
    t(`[${tr.chave}] o típico (${tetoDeRaridade(tr.nivel).tipico}) fica entre 35% e 65% — ${pct(tip)} ± ${(m.margem * 100).toFixed(1)}`, tip >= REGUA_DO_PODER.faixaDoTipico[0] && tip <= REGUA_DO_PODER.faixaDoTipico[1]);
  }

  sec("4. A LEI DO PODER — o kit da história sente-se e não quebra");
  for (const tr of tarefas) {
    const v = R[tr.chave];
    const tip = v.tipico / n, his = v.historia / n;
    const d = his - tip;
    const T = tetoDeRaridade(tr.nivel);
    /* as contas em combates inteiros (k de n), não em frações: 0,03 em vírgula
       flutuante não é sempre >= 0,03 */
    const ganho = v.historia - v.tipico;
    t(`[${tr.chave}] sem inflação: a história (${T.daQuest}) ganha no máximo +12 e fica abaixo de 70% — ${pts(d)} · ${pct(his)}`, ganho * 100 <= REGUA_DO_PODER.teto * n && v.historia <= REGUA_DO_PODER.tetoDeVitoria * n);
    if (T.daQuest !== T.tipico && REGUA_DO_PODER.pisoNasClasses.includes(tr.classe)) {
      t(`[${tr.chave}] sentido: a história ganha pelo menos +3 — ${pts(d)}`, ganho * 100 >= REGUA_DO_PODER.piso * n);
    } else if (T.daQuest !== T.tipico) {
      pendente(`[${tr.chave}] sentido (piso +3)`, `${pts(d)} — o conjurador sente pouco o aço no motor; o prémio dele é o acessório e o XP`);
    } else {
      /* Do 11 em diante a peça de quest é do degrau do típico (o teto do DMG
         quebrava a luta: TETO_DE_RARIDADE_DO_NIVEL, coluna daQuest). O piso
         não se cumpre por peça genérica, e fingir que sim seria uma asserção
         sem nada a medir; o «mais forte» destes níveis é o artefacto (TE8),
         medido abaixo. Pendente escrito, não esquecido. */
      pendente(`[${tr.chave}] sentido (piso +3)`, `${pts(d)} — a peça de quest é do degrau do típico (${T.tipico}) neste nível; o ganho é do artefacto`);
    }
  }

  sec("5. O ARTEFACTO COM NOME, exaltado — nenhuma recompensa quebra a luta");
  for (const tr of tarefas) {
    const v = R[tr.chave];
    const tip = v.tipico / n, art = v.artefacto / n;
    t(`[${tr.chave}] o artefacto exaltado ganha no máximo +12 e fica abaixo de 70% — ${pts(art - tip)} · ${pct(art)}`, (v.artefacto - v.tipico) * 100 <= REGUA_DO_PODER.teto * n && v.artefacto <= REGUA_DO_PODER.tetoDeVitoria * n);
  }

  sec("6. A RELÍQUIA DO CONFRONTO — o prémio raro, medido");
  for (const tr of tarefas) {
    const v = R[tr.chave];
    const tip = v.tipico / n, rel = v.reliquia / n;
    pendente(`[${tr.chave}] ${RELIQUIAS.find((r) => r.tipo === "arma").nome} na mão, o resto típico`, `${pts(rel - tip)} · ${pct(rel)}`);
  }
  /* A relíquia não é travada pela lei do poder, e de propósito: é a ÚNICA,
     uma por campanha e uma vez em cinco confrontos (RELIQUIA_DO_CONFRONTO),
     e o salto dela é a promessa do prémio raro. O que fica travado é que ela
     não cai fora do confronto nem duas vezes (teste-espolios.mjs, §5). O
     número fica impresso em todo `npm test` para quem a rever. */

  console.log(`\n(medição: ${((Date.now() - inicio) / 1000).toFixed(1)}s, ${quantos} trabalhador(es), ${tarefas.length} mesas × ${KITS.length} kits × ${n} combates)`);
  console.log(`\n${bons} ok, ${maus} falha(s)`);
  if (maus) process.exit(1);
}
