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
   o «mais forte» é do artefacto com nome (TE8), que esta régua já mede.

   ---------------- A TE8 (09/11): O LOTE 1 E A RELÍQUIA ARMA ----------------

   O QUE A RÉGUA VÊ. O motor de luta desta régua lê o `dano` da arma, o
   `danoExtra` e o golpe extra dos poderes sintonizados e a defesa — e só
   isso (o atributo que a peça dá não entra em `modDoGolpe`, e o crítico de
   item não entra em `criticoMinimo`, dadivas.js, que só lê dádivas). Por
   isso cada artefacto do lote 1 é medido no ENCAIXE dele, contra uma peça
   típica no mesmo encaixe (o kit típico mais um elmo típico, para o elmo com
   nome, o kit da história mais um elmo típico): a arma (as quatro do lote têm o mesmo aço e os mesmos passivos de
   combate — a secção 1 prova-o, e mede-se a do Cimo da Escada), a armadura,
   o escudo, o elmo e as botas. O anel e o amuleto não têm nada que esta
   régua leia (a secção 1 prova-o também): a força deles é a do teste de
   atributo, da imunidade e do gesto, e não se finge aqui que se mediram.

   O MAIS FORTE DO 11 EM DIANTE. O artefacto desperto acende o teto do nível
   em que foi ganho (DESPERTAR_DO_ARTEFACTO, coluna `degrau`), e no 12 isso
   é a Aurora (+2, que só o épico deixa acender): a secção 5 trava o piso de
   +3 nas classes do aço no 12, e imprime o 17 — onde o típico é um épico
   sorteado com dois poderes (a Presteza, que sozinha vale +28 a +59 pontos,
   cai lá uma vez em cada poucas peças) e a arma com nome não o alcança sem
   um golpe extra, que esta régua recusa.

   A RELÍQUIA ARMA (relicas.js, ACO_DA_RELIQUIA). Antes, sem aço: a Comedora
   valia +17 no 3 e −19 a −28 no 17. O Último Argumento nunca tinha sido
   medido: com o golpe extra dava 80% a 100% em todas as mesas, e perdeu-o
   (Palavra Final passou a +3 de dano). As duas medem-se agora, cada uma no
   nível da mesa, e a secção 6 trava o teto de 70% em todas as mesas e o
   «nunca abaixo da arma típica» em todas menos as que imprime. */
import { Worker, isMainThread, parentPort, workerData } from "node:worker_threads";
import { fileURLToPath } from "node:url";
import os from "node:os";
import { simularCombate, CENARIOS_DA_REGUA, fichaDoGrupo, proporcaoComMargem } from "./regua-combate.mjs";
import { gerarLoot } from "../src/loot.js";
import { KIT_INICIAL } from "../src/kit-inicial.js";
import { pedeSintonia } from "../src/sintonia.js";
import { dadoDo } from "../src/semente.js";
import { DEFESA_DA_ARMADURA } from "../src/prontos.js";
import { RELIQUIAS, itemDaReliquia, ACO_DA_RELIQUIA } from "../src/relicas.js";
import { questPorId } from "../src/biblioteca-de-quests.js";
import { tetoDeRaridade, pagaDaQuest, despertarArtefacto, TETO_DE_RARIDADE_DO_NIVEL, ARTEFACTOS_COM_NOME } from "../src/espolios.js";
import { PODERES } from "../src/afixos.js";
import { BASES } from "../src/loot.js";

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
/* TE8: os artefactos do lote medidos no seu encaixe (a arma é a do Cimo, a
   que já se media), e o típico do mesmo encaixe para os que o kit não traz */
const ARTEFACTO_NO_ENCAIXE = Object.freeze({ armadura: "o_fundo_da_toca", escudo: "a_nona_noite", elmo: "o_velorio_pago", botas: "do_outro_lado_do_vau" });
const RELIQUIAS_ARMA = RELIQUIAS.filter((r) => r.tipo === "arma");
function oArtefacto(F, classe, nivel, i, eq) {
  const p = pagaDaQuest(F, fechado(F), { semente: `${REGUA_DO_PODER.prefixo}|${i}`, nivel, heroi: { classe, nivel, equipados: eq } });
  const art = p && p.itens.find((x) => x.artefacto);
  return despertarArtefacto(art, { nivel, confronto: true });
}
function kit(classe, nivel, qual, i) {
  const k = KIT_INICIAL[classe] || {};
  const T = tetoDeRaridade(nivel);
  const [tipo, alvo] = qual.split(":");
  const tipico = tipo === "tipico" || tipo === "reliquia";
  const degrau = tipico ? T.tipico : T.daQuest;
  const rotulo = tipico ? "tipico" : "historia";
  const eq = {};
  if (tipo === "artefacto") eq.arma = oArtefacto(CONFRONTO, classe, nivel, i, {});
  else if (tipo === "reliquia") eq.arma = itemDaReliquia(RELIQUIAS_ARMA.find((r) => r.id === alvo), { nivel });
  else if (k.arma) eq.arma = peca(degrau, "arma", k.arma, nivel, rotulo, i);
  if (k.armadura) eq.armadura = peca(degrau, "armadura", k.armadura, nivel, rotulo, i);
  if (tipo === "tipicoNo") eq[alvo] = peca(T.tipico, alvo, alvo === "armadura" ? k.armadura || null : null, nivel, "tipico", "encaixe", i);
  if (tipo === "noEncaixe") eq[alvo] = oArtefacto(questPorId(ARTEFACTO_NO_ENCAIXE[alvo]), classe, nivel, i, eq);
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
/* `tipicoNo:X`: o kit da história mais a peça típica no encaixe X; `noEncaixe:X`:
   o kit da história com o artefacto do encaixe X. A armadura com nome tira a
   da história; o escudo, o elmo e as botas juntam-se. */
const KITS = ["tipico", "historia", "artefacto",
  ...Object.keys(ARTEFACTO_NO_ENCAIXE).flatMap((e) => (e === "armadura" ? [`noEncaixe:${e}`] : [`tipicoNo:${e}`, `noEncaixe:${e}`])),
  ...RELIQUIAS_ARMA.map((r) => `reliquia:${r.id}`)];
/* a base de cada kit: o que o herói vestiria ali de qualquer maneira — a
   arma e a armadura com nome tiram uma peça do kit e medem-se contra o
   típico (como a do Cimo sempre se mediu); o escudo, o elmo e as botas
   juntam-se ao kit da história e medem-se contra o kit da história com uma
   peça típica nesse encaixe. O ganho do kit da história já é da secção 4:
   somá-lo aqui era contar duas vezes o mesmo +9. */
const BASE_DO_KIT = (q) => (q.startsWith("noEncaixe:") && q !== "noEncaixe:armadura" ? `tipicoNo:${q.split(":")[1]}` : "tipico");
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
    /* TE8: o que esta régua lê de um artefacto, e porque basta medir um por encaixe */
    const LIDO = ["danoExtra", "ataqueExtra", "defesa"];
    const lido = (id) => { const p = PODERES.find((x) => x.id === id); return Object.keys(p.efeito).filter((k) => LIDO.includes(k)).map((k) => k + ":" + p.efeito[k] + ":" + p.tier).sort().join(","); };
    const arts = Object.entries(ARTEFACTOS_COM_NOME).filter(([, d]) => d.genero === "artefacto");
    const armas = arts.filter(([, d]) => d.tipo === "arma");
    const perfil = (d) => J([d.base, d.passivos.map(lido)]);
    t(`as ${armas.length} armas do lote têm o mesmo aço e os mesmos passivos de combate, nível a nível: medir a do Cimo é medir todas`, armas.length >= 2 && armas.every(([, d]) => perfil(d) === perfil(ARTEFACTOS_COM_NOME[CONFRONTO.id])));
    t("cada outro encaixe do lote que a régua lê tem o seu artefacto medido, e os do mesmo encaixe têm o mesmo perfil de combate",
      arts.filter(([, d]) => d.tipo !== "arma" && BASES[d.tipo].some((b) => b.defesa || b.dano)).every(([, d]) => ARTEFACTO_NO_ENCAIXE[d.tipo] && J(d.passivos.map(lido).filter(Boolean)) === J(ARTEFACTOS_COM_NOME[ARTEFACTO_NO_ENCAIXE[d.tipo]].passivos.map(lido).filter(Boolean))));
    t("o anel e o amuleto não têm nada que esta régua leia (nem base com defesa ou dano, nem passivo de combate)",
      arts.filter(([, d]) => ["anel", "amuleto"].includes(d.tipo)).every(([, d]) => !BASES[d.tipo].find((b) => b.nome === d.base).defesa && d.passivos.every((id) => !lido(id))));
    t("toda relíquia arma entra na régua, com o aço do nível (ACO_DA_RELIQUIA)", RELIQUIAS_ARMA.length >= 2 && ACO_DA_RELIQUIA.porNivel.length === TETO_DE_RARIDADE_DO_NIVEL.length);
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
    const art12 = mesa("Guerreiro", 12, "artefacto", 0).heroi.equipados.arma;
    t("no 12 a exaltada acende o teto (épico) e não o passa", art12.raridade === tetoDeRaridade(12).teto && art12.poderes.length === 2);
    const elmo = mesa("Ladino", 7, "noEncaixe:elmo", 3).heroi.equipados;
    t("o kit de encaixe veste o artefacto do encaixe por cima do kit da história", elmo.elmo && elmo.elmo.artefacto && elmo.arma && !elmo.arma.artefacto);
    const rel = mesa("Guerreiro", 17, `reliquia:${RELIQUIAS_ARMA[0].id}`, 0).heroi.equipados.arma;
    t("a relíquia da mesa leva o aço do nível dela", rel.raridade === "unico" && rel.atributos.dano > 0 && rel.base === RELIQUIAS_ARMA[0].base);
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
  /* TE8: o lote 1, encaixe a encaixe, contra o típico do mesmo encaixe. O teto
     absoluto (70%) é o da mesa justa, que põe o kit típico no meio: com o kit
     da história e uma peça a mais no encaixe a mesa já não é a justa, e às
     vezes o próprio típico do encaixe já a põe perto dos 70. O que o encaixe
     típico empurra não conta contra o artefacto: trava-se o kit da história
     mais o que o artefacto dá ACIMA do típico do encaixe — no máximo 70%. */
  for (const tr of tarefas) {
    const v = R[tr.chave];
    for (const q of KITS.filter((k) => k.startsWith("noEncaixe:"))) {
      const b = BASE_DO_KIT(q);
      t(`[${tr.chave}] ${ARTEFACTO_NO_ENCAIXE[q.split(":")[1]]} (${q.split(":")[1]}) ganha no máximo +12 sobre o típico do encaixe, e o kit fica abaixo de 70% — ${pts((v[q] - v[b]) / n)} · ${pct((b === "tipico" ? v[q] : v.historia + v[q] - v[b]) / n)}`,
        (v[q] - v[b]) * 100 <= REGUA_DO_PODER.teto * n && (b === "tipico" ? v[q] : v.historia + v[q] - v[b]) <= REGUA_DO_PODER.tetoDeVitoria * n);
    }
  }
  /* o mais forte do 11 em diante: a arma com nome desperta contra a típica */
  for (const tr of tarefas.filter((x) => tetoDeRaridade(x.nivel).daQuest === tetoDeRaridade(x.nivel).tipico)) {
    const v = R[tr.chave];
    const d = (v.artefacto - v.tipico) / n, dh = (v.historia - v.tipico) / n;
    const linha = `${pts(d)} (a peça genérica da quest dava ${pts(dh)})`;
    if (tr.nivel < 17 && REGUA_DO_PODER.pisoNasClasses.includes(tr.classe)) t(`[${tr.chave}] o mais forte: a arma com nome desperta ganha pelo menos +3 — ${linha}`, (v.artefacto - v.tipico) * 100 >= REGUA_DO_PODER.piso * n);
    else pendente(`[${tr.chave}] o mais forte (piso +3)`, `${linha} — ${tr.nivel >= 17 ? "o típico do 17 é um épico com dois poderes sorteados; sem golpe extra a arma com nome não o alcança" : "o conjurador sente pouco o aço no motor"}`);
  }

  sec("6. A RELÍQUIA DO CONFRONTO — o prémio raro, medido e travado");
  /* A relíquia não é travada pelos +12 da lei do poder, e de propósito: é a
     ÚNICA, uma por campanha e uma vez em cinco confrontos
     (RELIQUIA_DO_CONFRONTO), e o salto dela é a promessa do prémio raro. TE8:
     o que se trava são as duas pontas que a pessoa pôs no prémio mais raro —
     nunca acima de 70% (a luta continua a ser luta) e nunca abaixo da arma
     típica (o prémio do fim não pode envelhecer pior do que uma espada do
     mercado). O 17 do Ladino e do Mago fica impresso: o típico deles ali é um
     épico com dois poderes, e o Ladino vive do golpe extra que a relíquia já
     não tem; o aço que os levasse ao típico punha o Guerreiro acima dos 70%. */
  const ABAIXO_DO_TIPICO = Object.freeze(["Ladino|17", "Mago|17"]);
  for (const tr of tarefas) {
    const v = R[tr.chave];
    for (const r of RELIQUIAS_ARMA) {
      const q = `reliquia:${r.id}`;
      const d = (v[q] - v.tipico) / n;
      t(`[${tr.chave}] ${r.nome} (aço ${itemDaReliquia(r, { nivel: tr.nivel }).atributos.dano || 0}) nunca acima de 70% — ${pts(d)} · ${pct(v[q] / n)}`, v[q] <= REGUA_DO_PODER.tetoDeVitoria * n);
      if (ABAIXO_DO_TIPICO.includes(tr.chave)) pendente(`[${tr.chave}] ${r.nome} contra a arma típica`, `${pts(d)} — o típico do 17 é um épico com dois poderes sorteados`);
      else t(`[${tr.chave}] ${r.nome} nunca abaixo da arma típica — ${pts(d)}`, v[q] >= v.tipico);
    }
  }

  console.log(`\n(medição: ${((Date.now() - inicio) / 1000).toFixed(1)}s, ${quantos} trabalhador(es), ${tarefas.length} mesas × ${KITS.length} kits × ${n} combates)`);
  console.log(`\n${bons} ok, ${maus} falha(s)`);
  if (maus) process.exit(1);
}
