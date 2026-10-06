/* ============================================================
   A LUZ E A SOMBRA (Fase MM · pedido de 06/10) — quem vê quem, no escuro

   A PERGUNTA DE MESA: *"baixo a tocha e escondo-me na sombra"*. O Matt
   responde sem pensar, porque sabe três coisas que o tabuleiro desta casa
   não sabia: onde há luz, quem a carrega, e quem enxerga sem ela.

   O DEFEITO QUE ESTE MÓDULO FECHA: a terceira sessão de prova
   (`mente/mm11-sessao-3.md`, J18) escreveu exatamente essa frase, numa luta
   de masmorra, com o Lobo a 12 m no vão da porta. O veredito (v9.353) foi
   "Não há onde sumir: Lobo tem você à vista, sem nada no meio" — certo pela
   regra que a casa tinha, e errado pelo mundo: a sala estava às escuras, a
   única luz era a tocha na mão do herói, e o lobo (5e: faro e ouvido, sem
   visão no escuro) não o veria com ela baixada. A grade sabia de paredes e
   de barris; de luz, nada.

   ---------------- O MODELO, EM QUATRO TABELAS ----------------

   1. `NIVEIS_DE_LUZ` — três degraus, do 5e: clara, penumbra, escuro.
   2. `AMBIENTE_DA_LUZ` — o degrau de fundo da cena, ANTES de qualquer fonte:
      a masmorra e a caverna são escuras; a taverna é acesa; o resto segue o
      céu (dia claro, noite em penumbra de luar, noite fechada escura).
   3. `FONTES_DE_LUZ` — o raio de cada fonte, em metros, no 5e: a tocha dá
      6 m de luz e mais 6 m de penumbra. Parede corta a luz como corta o
      olhar (`linhaDeVisao`).
   4. `VISAO_NO_ESCURO` — quem enxerga sem luz, e até onde: as raças do
      herói leem de `tracos.js` (o `efeito.veNoEscuro`, ao lado da frase da
      criação); os inimigos, desta tabela, pelo nome. Curta e honesta: o que
      não está aqui não enxerga no escuro.

   E A REGRA DE QUEM SE ESCONDE MORA EM `SOMBRA_QUE_ESCONDE`: no escuro, de
   qualquer distância; na penumbra, de quem está a 6 m ou mais (de perto,
   meia-luz ainda mostra um vulto); na luz, de ninguém. Quem enxerga no
   escuro, dentro do seu alcance, vê como se fosse dia: a sombra não o
   engana — só a cobertura física (`escondido.js`, que é quem decide).

   ---------------- O QUE NÃO É DESTE MÓDULO ----------------

   Decidir se o herói se esconde é de `escondido.js` — este módulo só diz,
   de um ponto, que luz o banha e quem o vê com clareza. A tela é do
   desenho: o mapa de luz não se desenha aqui, lê-se.

   ---------------- O SAVE: UM CAMPO NOVO, OPCIONAL ----------------

   O estado da tocha do herói na luta mora em `combate.tochaDoHeroi`
   ("baixada" | "acesa"; ausente = o padrão do lugar: acesa na masmorra com
   tochas, apagada fora). Campo novo dentro do combate, que já vai e volta
   no save inteiro; a versão antiga não o lê, e sem ele tudo se comporta
   como hoje.
   ============================================================ */

import { distanciaM, linhaDeVisao, garantirGrade } from "./grid.js";
import { veNoEscuroDeTraco } from "./tracos.js";
import { soODeclarado } from "./peneira.js";

/* ---------------- AS TABELAS ---------------- */

/* do mais escuro ao mais claro: a ordem é a conta (o maior índice vence) */
export const NIVEIS_DE_LUZ = ["escuro", "penumbra", "clara"];

/* O FUNDO DA CENA. `porCenario` manda sobre o céu: debaixo da terra não há
   dia, e uma taverna tem candeeiros acesos a qualquer hora. `noiteFechada`
   é a noite sem luar — chuva, tempestade, neblina tapam a lua. */
export const AMBIENTE_DA_LUZ = {
  masmorra: "escuro",
  porCenario: { masmorra: "escuro", caverna: "escuro", taverna: "clara" },
  dia: "clara",
  noite: "penumbra",
  noiteFechada: "escuro",
  climaQueFecha: /chuva|tempestade|neblina|nublad|nevoeiro|garoa/,
};

/* O RAIO DE CADA FONTE, do 5e (pés ÷ 3,33, no quadrado de 1,5 m): a tocha
   20 + 20 pés, a lanterna 30 + 30, a vela 5 + 5. A fogueira é a tocha do
   acampamento; a magia é o truque Luz (20 + 20). */
export const FONTES_DE_LUZ = {
  tocha: { nome: "tocha", brilhante: 6, penumbra: 6 },
  lanterna: { nome: "lanterna", brilhante: 9, penumbra: 9 },
  vela: { nome: "vela", brilhante: 1.5, penumbra: 1.5 },
  fogueira: { nome: "fogueira", brilhante: 6, penumbra: 6 },
  magia: { nome: "luz mágica", brilhante: 6, penumbra: 6 },
};

/* QUEM ENXERGA NO ESCURO, pelo nome do inimigo (minúsculas, sem acento).
   Do bestiário do 5e: visão no escuro de 18 m (60 pés) ou 36 m (120 pés);
   a gosma e o morcego "veem" sem olhos (percepção às cegas), e para a
   sombra é o mesmo — ela não os engana. O LOBO NÃO ESTÁ AQUI: no 5e caça
   por faro e ouvido, e é por isso que a frase da sessão funciona. */
export const VISAO_NO_ESCURO = {
  criaturas: [
    { rx: /\b(dragao|golem|lich|demonio|diabo|imp|drow)\b/, metros: 36 },
    { rx: /\b(goblin|hobgoblin|kobold|orc|gnoll|rato|morcego|aranha|esqueleto|zumbi|carnical|vampir|espectro|fantasma|ogro|troll|quimera|elemental|slime|gosma|coruja|gato|anao|duergar)\b/, metros: 18 },
  ],
  /* quem tem ficha (o herói, um companheiro com raça) lê de tracos.js */
  porTraco: true,
};

/* ONDE A SOMBRA ESCONDE: a partir de quantos metros o observador sem visão
   no escuro deixa de o ver com clareza. `null` = nunca (a luz mostra). */
export const SOMBRA_QUE_ESCONDE = { clara: null, penumbra: 6, escuro: 0 };

/* O GESTO DA LUZ: baixar a tocha atrás das costas, apagá-la, tapá-la — ou
   erguê-la de novo. Custa o que no 5e custa mexer num objeto que se tem na
   mão: nada da ação nem da bônus (`livre`). Por isso "baixo a tocha e
   escondo-me" é UMA ação: a do esconder. Lido sobre o que o herói
   DECLAROU (`soODeclarado`): "posso baixar a tocha?" não baixa nada. */
export const GESTO_DA_LUZ = {
  custo: "livre",
  baixar: /\b(baixo|apago|guardo|escondo|abafo|tapo|cubro|oculto|recolho)\s+(a\s+|o\s+|minha\s+|a minha\s+|meu\s+|o meu\s+)?(tocha|lanterna|vela|lampiao|candeeiro|luz)\b/,
  erguer: /\b(ergo|levanto|acendo|reacendo|destapo|descubro|empunho)\s+(a\s+|o\s+|minha\s+|a minha\s+|meu\s+|o meu\s+|uma\s+|um\s+)?(tocha|lanterna|vela|lampiao|candeeiro|luz)\b/,
};

/* ---------------- LEITURA ---------------- */

const NORM = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const posto = (e) => !!(e && e.x != null && e.y != null);
const nivelOk = (n) => (NIVEIS_DE_LUZ.includes(n) ? n : "clara");
const maisClaro = (a, b) => (NIVEIS_DE_LUZ.indexOf(a) >= NIVEIS_DE_LUZ.indexOf(b) ? a : b);

/* O fundo da cena. `ctx` = { emMasmorra, cenario, noite, clima }. */
export function ambienteDaCena(ctx) {
  const c = ctx && typeof ctx === "object" ? ctx : {};
  const A = AMBIENTE_DA_LUZ;
  if (c.emMasmorra) return A.masmorra;
  const fixo = A.porCenario[c.cenario];
  if (fixo) return fixo;
  if (!c.noite) return A.dia;
  return A.climaQueFecha.test(NORM(c.clima)) ? A.noiteFechada : A.noite;
}

/* Até quantos metros `ent` enxerga sem luz (0 = não enxerga). Um número
   explícito na entidade manda; depois a raça (tracos.js); depois o nome. */
export function veNoEscuro(ent) {
  if (!ent || typeof ent !== "object") return 0;
  const dado = Number(ent.veNoEscuro);
  if (ent.veNoEscuro != null && Number.isFinite(dado)) return Math.max(0, dado);
  if (VISAO_NO_ESCURO.porTraco && ent.raca) {
    const t = veNoEscuroDeTraco(ent);
    if (t > 0) return t;
  }
  const nome = NORM(`${ent.nome || ""}`);
  if (!nome) return 0;
  const achou = VISAO_NO_ESCURO.criaturas.find((c) => c.rx.test(nome));
  return achou ? achou.metros : 0;
}

/* A tocha do herói nesta luta: "acesa", "baixada" ou "sem" (não leva).
   `tochaDoHeroi` é o campo do combate; `tochas`, as que há para acender
   (as da masmorra lá dentro, as da mochila cá fora). */
export function estadoDaTocha(ctx) {
  const c = ctx && typeof ctx === "object" ? ctx : {};
  const tem = (Number(c.tochas) || 0) > 0;
  if (!tem) return "sem";
  if (c.tochaDoHeroi === "baixada") return "baixada";
  if (c.tochaDoHeroi === "acesa") return "acesa";
  return c.emMasmorra ? "acesa" : "sem";
}

/* O MAPA DE LUZ DA LUTA. Dados puros: o fundo, as fontes postas no
   tabuleiro (a tocha do herói, e quem mais traga `luz` declarada), o estado
   da tocha e os olhos do herói. Não guarda nada: refaz-se a cada pergunta,
   dos mesmos refs — nunca vai ao save. */
export function luzDaLuta(ctx) {
  const c = ctx && typeof ctx === "object" ? ctx : {};
  const g = garantirGrade(c.grade) ? c.grade : null;
  const ambiente = ambienteDaCena({ emMasmorra: c.emMasmorra, cenario: c.cenario || (g && g.cenario), noite: c.noite, clima: c.clima });
  const tocha = estadoDaTocha(c);
  const fontes = [];
  if (tocha === "acesa" && posto(c.heroi)) fontes.push({ x: c.heroi.x, y: c.heroi.y, tipo: "tocha", doHeroi: true });
  for (const e of [...(Array.isArray(c.aliados) ? c.aliados : []), ...(Array.isArray(c.inimigos) ? c.inimigos : [])]) {
    if (e && posto(e) && FONTES_DE_LUZ[e.luz] && !e.derrotado) fontes.push({ x: e.x, y: e.y, tipo: e.luz });
  }
  for (const f of Array.isArray(c.fontes) ? c.fontes : []) if (f && posto(f) && FONTES_DE_LUZ[f.tipo]) fontes.push({ x: f.x, y: f.y, tipo: f.tipo });
  return { ambiente, fontes, tocha, olhosDoHeroi: veNoEscuro(c.pers), grade: g };
}

/* A luz que banha um ponto: o fundo, ou a fonte mais forte que o alcança
   sem parede no meio. Sem mapa, "clara" — a regra de antes. */
export function luzEm(luz, ponto) {
  if (!luz || typeof luz !== "object") return "clara";
  let n = nivelOk(luz.ambiente);
  if (!posto(ponto)) return n;
  for (const f of Array.isArray(luz.fontes) ? luz.fontes : []) {
    const F = FONTES_DE_LUZ[f && f.tipo];
    if (!F || !posto(f)) continue;
    if (luz.grade && !linhaDeVisao(luz.grade, f, ponto)) continue;
    const d = distanciaM({ x: f.x, y: f.y }, { x: ponto.x, y: ponto.y });
    if (d <= F.brilhante) n = maisClaro(n, "clara");
    else if (d <= F.brilhante + F.penumbra) n = maisClaro(n, "penumbra");
  }
  return n;
}

/* POR QUE `quem` VÊ `alvo` COM CLAREZA: "luz" (a luz o mostra), "olhos"
   (só a visão no escuro o mostra) ou null (a sombra o esconde). Não olha
   paredes entre os dois: a linha de visão é pergunta do tabuleiro. */
export function porQueVe(luz, quem, alvo) {
  if (!luz || typeof luz !== "object") return "luz";
  if (!posto(quem) || !posto(alvo)) return "luz";
  const nivel = luzEm(luz, alvo);
  const d = distanciaM(quem, alvo);
  const limiar = SOMBRA_QUE_ESCONDE[nivel];
  if (limiar == null || d < limiar) return "luz";
  const olhos = veNoEscuro(quem);
  return olhos > 0 && d <= olhos ? "olhos" : null;
}

/* O mesmo mapa sem a tocha do herói — a pergunta "e se eu a baixar?". */
export function semATochaDoHeroi(luz) {
  if (!luz || typeof luz !== "object") return luz;
  return { ...luz, fontes: (Array.isArray(luz.fontes) ? luz.fontes : []).filter((f) => !(f && f.doHeroi)), tocha: luz.tocha === "acesa" ? "baixada" : luz.tocha };
}

/* ---------------- O GESTO ----------------
   Lê a frase e devolve o combate NOVO com a tocha baixada ou erguida.
   Nunca muta o recebido. `tochas` diz se há tocha para erguer. */
export function gestoDaLuz(texto) {
  let d = "";
  try { d = soODeclarado(texto); } catch { return null; }
  if (!d) return null;
  if (GESTO_DA_LUZ.baixar.test(d)) return "baixar";
  if (GESTO_DA_LUZ.erguer.test(d)) return "erguer";
  return null;
}
export function aplicarGestoDaLuz(combate, texto, opcoes) {
  const comb = combate && typeof combate === "object" ? combate : null;
  const { tochas = 0, emMasmorra = false } = opcoes || {};
  const gesto = gestoDaLuz(texto);
  if (!comb || !gesto) return { combate: comb, gesto: null };
  const antes = estadoDaTocha({ tochaDoHeroi: comb.tochaDoHeroi, tochas, emMasmorra });
  /* sem tocha na mão não há o que baixar; sem tocha nenhuma, o que erguer */
  if (antes === "sem" && (gesto === "baixar" || !((Number(tochas) || 0) > 0))) return { combate: comb, gesto: null };
  const novo = gesto === "baixar" ? "baixada" : "acesa";
  if (comb.tochaDoHeroi === novo) return { combate: comb, gesto };
  return { combate: { ...comb, tochaDoHeroi: novo }, gesto, custo: GESTO_DA_LUZ.custo };
}

/* ---------------- O QUE O MESTRE LÊ ----------------
   Uma linha, e só quando a luz muda a decisão: com tudo claro, nada. Diz o
   fundo, a tocha, quem do outro lado enxerga no escuro, e se eu enxergo —
   a resposta a "o lobo me vê?" e a "eu vejo o lobo?". */
export function luzParaPauta(luz, opcoes) {
  if (!luz || typeof luz !== "object") return "";
  const { heroi = null, inimigos = null } = opcoes || {};
  const aqui = posto(heroi) ? luzEm(luz, heroi) : nivelOk(luz.ambiente);
  if (nivelOk(luz.ambiente) === "clara" && aqui === "clara") return "";
  /* CURTA DE PROPÓSITO: a pauta de uma luta de masmorra já vive no teto
     (sessão 3: 1164 de 1400 antes da frase do golpe), e o corte é guloso —
     uma linha curta cabe na sobra que uma longa perde. */
  const PALAVRA = { escuro: "breu", penumbra: "meia-luz", clara: "luz" };
  const fundo = nivelOk(luz.ambiente) === "escuro" ? "Breu" : "Meia-luz";
  const F = FONTES_DE_LUZ.tocha;
  const tocha = luz.tocha === "acesa" ? `, salvo a minha tocha (luz ${F.brilhante} m, meia-luz até ${F.brilhante + F.penumbra} m)`
    : luz.tocha === "baixada" ? "; a minha tocha está baixada"
    : "; não levo luz";
  /* onde estou só se diz quando não é o fundo nem a minha tocha que o diz:
     a luz da tocha de outro, por exemplo — e é ela que me mostra */
  const onde = aqui === nivelOk(luz.ambiente) || (aqui === "clara" && luz.tocha === "acesa") ? "" : `; onde estou há ${PALAVRA[aqui]}`;
  const vivos = (Array.isArray(inimigos) ? inimigos : []).filter((e) => e && e.nome && !e.derrotado && !(e.vida != null && (Number(e.vida) || 0) <= 0));
  const nomes = [...new Set(vivos.map((e) => String(e.nome)))];
  const veem = nomes.filter((n) => veNoEscuro(vivos.find((e) => String(e.nome) === n)) > 0);
  const naoVeem = nomes.filter((n) => !veem.includes(n));
  const partes = [];
  if (veem.length) partes.push(`${veem.join(", ")} ${veem.length > 1 ? "veem" : "vê"} no escuro`);
  /* "Lobo não; eu não" só se lê com o verbo dito antes: sem quem veja no
     escuro, o verbo vai na primeira parte que nega */
  const comVerbo = !partes.length;
  if (naoVeem.length) partes.push(`${naoVeem.join(", ")} não${comVerbo ? (naoVeem.length > 1 ? " veem no escuro" : " vê no escuro") : ""}`);
  const olhos = Number(luz.olhosDoHeroi) || 0;
  partes.push(olhos > 0 ? `eu vejo no escuro até ${olhos} m` : comVerbo && !naoVeem.length ? "eu não vejo no escuro" : "eu não");
  return `${fundo}${tocha}${onde}. ${partes.join("; ")}.`;
}
