/* ============================================================
   OS EFEITOS DAS QUESTS QUE SÓ A TELA APLICA (08/11/2026, Fase BQ · BQ7b)
   — src/motor/efeitos-da-quest.js

   O motor das quests (motor/quests-do-turno.js) aplica as consequências
   cujo estado é dele — a bolsa, o livro do vilão, as premissas, o laço do
   registo — e devolve as outras como EFEITOS PARA A TELA. Na BQ7 caíam
   todas em `calou` menos o vínculo. Esta peça diz, para cada uma, O QUE O
   ÓRGÃO QUE JÁ EXISTE TEM DE FAZER: a conta é daqui (pura, provada em Node,
   testes/teste-bq7-app.mjs), e o App só executa a ordem pelo órgão de
   sempre. NENHUMA REGRA NASCE AQUI: o efeito que não tem órgão fica calado,
   com o motivo escrito na tabela, para quem o for ligar saber o que falta.

     oQueOEfeitoPede(efeito, estado) → [ordem]
       `efeito`: um dos EFEITOS PARA A TELA de quests-do-turno.js;
       `estado`: o da peça das quests (o App: estadoDasQuests — personagem,
       npcs, factos, espinha, baseMundo, dia).
       Cada ordem, e o órgão que a executa no App:
         { ordem: "vinculo", nome, pontos }          aplicarVinculo
         { ordem: "minutos", n }                     avancarMinutos (o relógio)
         { ordem: "livro", afeicoes: [{ quem, grau }] }  anotarNoLivro (anotarTurno)
         { ordem: "npcs", npcs }                     o registo novo (o laço)
         { ordem: "situacao", nome, situacao }      porSituacao (mundo-base.js)
         { ordem: "morte", nome, causa, linha }     a saída do grupo, a morte
                                                     do sistema (aMorteDoAlvo)
                                                     e o nome riscado (matar)
         { ordem: "calado", tipo, motivo }           sem órgão: vai ao calou
       A lista vazia quer dizer «nada a fazer»: o alvo já não está, ou a
       conta não muda nada. Nunca lança.

   A MORTE só sai daqui com três provas, todas no estado: o registo da quest
   TERMINOU (`terminada`, o tipo 2 — EFEITOS_DA_QUEST.morte.so é «desfecho»),
   o desfecho em que terminou traz a morte DESTA pessoa (pelo papel), e ela
   ainda anda no grupo. Um efeito de morte que chegasse sem isto (um save
   mexido, um motor torto) não mata ninguém.
   ============================================================ */
import { proximoMarco, MARCOS_VINCULO, VINCULO_INICIAL } from "../vinculos.js";
import { afeicaoAlcancada, grauDeAfeicao } from "../livro-de-factos.js";
import { garantirLaco, firmarLaco, afrouxarLaco } from "../npcs.js";
import { SITUACOES } from "../mundo-base.js";
import { RELOGIO_DO_DIA } from "./tempo-do-turno.js";
import { questPorId } from "../biblioteca-de-quests.js";
import { garantirQuestsDaEspinha } from "./quests-do-turno.js";

/* ---------------- A TABELA (se é texto de regra, é tabela) ----------------
   `orgao`: onde cada efeito ligado mora (para quem lê, e a suíte confere que
   todo efeito da tela tem aqui um órgão, um motivo ou a nota de que só vai
   ao Narrador). `calado`: o que precisaria de regra nova, e porquê.
   `soNarrador`: o que o motor já pôs nas notas do turno e não muda o mundo.
   `morte`: a linha da tela e a causa que fica na ficha do registo. */
export const EFEITOS_NA_TELA = Object.freeze({
  orgao: Object.freeze({
    vinculo: "aplicarVinculo (motor/combate-do-turno.js, osVinculos)",
    marco: "aplicarVinculo até ao próximo marco (vinculos.js, proximoMarco)",
    afeicao: "o livro de factos (anotarTurno, afeicoes) e o laço (npcs.js, firmarLaco · afrouxarLaco); no grupo, o vínculo até ao marco",
    situacao: "porSituacao (mundo-base.js)",
    dia: "o relógio (avancarMinutos; RELOGIO_DO_DIA, motor/tempo-do-turno.js)",
    morte: "a saída do grupo, a morte por decisão do sistema (aMorteDoAlvo) e o nome riscado (mundo-base.js, matar)",
  }),
  calado: Object.freeze({
    relogio_regional: "os relógios (relogios.js) não têm região: escolher quais andam seria regra nova",
    favor: "nenhum órgão guarda o favor que um lugar fica a dever ao herói",
    quem_e: "a QUEM É sai do núcleo (nucleo.js), que não guarda linhas; e as notas do registo o Cronista reescreve",
    passo_do_plano: "o que o passo muda (EFEITOS_DO_PLANO) não traz alvo que o mundo aceite: o «amado» é gente do grupo, e o lugar é um papel",
    fim_do_plano: "os efeitos do fim (EFEITOS_DO_PLANO) não trazem alvo; a frase e o tom já vão ao Narrador",
  }),
  soNarrador: Object.freeze(["desfecho_do_vilao", "reacao_do_vilao"]),
  semOrgao: "sem órgão conhecido",
  morte: Object.freeze({ linha: "{nome} morreu.", causa: "no fim de «{titulo}»" }),
});

/* ---------------- utilidades ---------------- */
const obj = (x) => (x && typeof x === "object" && !Array.isArray(x) ? x : null);
const arr = (x) => (Array.isArray(x) ? x : []);
const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
const encher = (modelo, v) => String(modelo).replace(/\{(\w+)\}/g, (m, k) => (v[k] != null ? String(v[k]) : m));
const vinculoDe = (g) => (Number.isFinite(Number(g && g.vinculo)) ? Number(g.vinculo) : VINCULO_INICIAL);
/* quem anda no grupo (a invocação não é gente do coração) */
const doGrupo = (E, nome) => {
  const n = norm(nome);
  if (!n) return null;
  return arr(obj(E.personagem) && E.personagem.grupo).find((g) => g && !g.invocada && norm(g.nome) === n) || null;
};
const chaveNoRegisto = (npcs, nome) => {
  const n = norm(nome);
  return n ? Object.keys(npcs).find((k) => norm(k) === n) || null : null;
};

/* o companheiro tem a afeição pelo marco do vínculo (grauDeAfeicao, a régua
   da planta §3): subir N graus é chegar ao marco de cima; descer, ficar um
   ponto abaixo do marco que se perde */
function afeicaoNoGrupo(g, n) {
  const v = vinculoDe(g);
  const grau = grauDeAfeicao({ vinculo: v });
  const alvo = Math.max(0, Math.min(MARCOS_VINCULO.length, grau + n));
  let para = v;
  if (n > 0 && alvo > 0) para = Math.max(v, MARCOS_VINCULO[alvo - 1].valor);
  if (n < 0 && alvo < MARCOS_VINCULO.length) para = Math.min(v, MARCOS_VINCULO[alvo].valor - 1);
  return para !== v ? [{ ordem: "vinculo", nome: g.nome, pontos: para - v }] : [];
}

/* quem não anda no grupo: o grau alcançado entra no livro (é o que a
   condição «afeicao» lê, com o laço vivo), e o laço que existe aperta ou
   afrouxa um passo por grau. Sem laço não se cria nenhum (o tipo seria
   regra nova); um laço rompido não se reata por confiança (reatar é outra
   decisão, a de firmarLaco por onda). Descer não apaga o livro: o grau
   que se alcançou alcançou-se. */
function afeicaoFora(E, alvo, nome, n) {
  const npcs = obj(E.npcs) || {};
  const k = chaveNoRegisto(npcs, nome);
  const laco = k ? garantirLaco(npcs[k].laco) : null;
  const out = [];
  if (n > 0) {
    const id = typeof alvo.id === "string" ? alvo.id : "";
    const noLivro = id ? afeicaoAlcancada(E.factos, id) : 0;
    const vivo = laco ? grauDeAfeicao({ laco }) : 0;
    const grau = Math.min(MARCOS_VINCULO.length, Math.max(noLivro, vivo) + n);
    if (grau > noLivro) out.push({ ordem: "livro", afeicoes: [{ quem: nome, grau }] });
  }
  if (k && laco && (n < 0 || !laco.rompido)) {
    const dia = Number.isInteger(E.dia) ? E.dia : 0;
    let x = npcs[k];
    for (let i = 0; i < Math.abs(n); i++) x = n > 0 ? firmarLaco(x, laco.tipo, dia) : afrouxarLaco(x);
    if (x !== npcs[k]) out.push({ ordem: "npcs", npcs: { ...npcs, [k]: x } });
  }
  return out;
}

/* a morte só com as três provas do cabeçalho */
function aMorteProvada(E, ef, g) {
  const Q = garantirQuestsDaEspinha(obj(E.espinha) && E.espinha.quests);
  const R = Q.registos.find((r) => r && r.id === ef.quest) || null;
  if (!R || R.estado !== "terminada" || typeof R.desfecho !== "string") return null;
  const F = questPorId(R.id);
  const d = F ? arr(F.desfechos).find((x) => x && x.id === R.desfecho) : null;
  const papeis = obj(R.papeis) || {};
  const dele = d && arr(d.efeitos).some((e) => e && e.tipo === "morte" && norm((obj(papeis[e.papel]) || {}).nome) === norm(g.nome));
  return dele ? F : null;
}

export function oQueOEfeitoPede(efeito, estado) {
  try {
    const ef = obj(efeito);
    if (!ef || typeof ef.tipo !== "string") return [];
    const E = obj(estado) || {};
    const t = ef.tipo;
    const T = EFEITOS_NA_TELA;
    if (T.calado[t]) return [{ ordem: "calado", tipo: t, motivo: T.calado[t] }];
    if (T.soNarrador.includes(t)) return [];
    const alvo = obj(ef.alvo) || {};
    const nome = typeof alvo.nome === "string" ? alvo.nome.trim() : "";
    const n = Number.isInteger(ef.n) ? ef.n : 0;
    if (t === "vinculo") {
      const g = doGrupo(E, nome);
      return g && n ? [{ ordem: "vinculo", nome: g.nome, pontos: n }] : [];
    }
    if (t === "marco") {
      const g = doGrupo(E, nome);
      if (!g) return [];
      const v = vinculoDe(g);
      const p = proximoMarco(v);
      return p && p.valor > v ? [{ ordem: "vinculo", nome: g.nome, pontos: p.valor - v }] : [];
    }
    if (t === "afeicao") {
      if (!nome || !n) return [];
      const g = doGrupo(E, nome);
      return g ? afeicaoNoGrupo(g, n) : afeicaoFora(E, alvo, nome, n);
    }
    if (t === "situacao") {
      /* a morta não entra por aqui: a morte tem uma porta só (a de baixo) */
      const s = ef.situacao;
      return nome && Object.values(SITUACOES).includes(s) && s !== SITUACOES.morta ? [{ ordem: "situacao", nome, situacao: s }] : [];
    }
    if (t === "dia") return n > 0 ? [{ ordem: "minutos", n: n * RELOGIO_DO_DIA.minutosDoDia }] : [];
    if (t === "morte") {
      const g = doGrupo(E, nome);
      if (!g) return [];
      const F = aMorteProvada(E, ef, g);
      if (!F) return [];
      return [{ ordem: "morte", nome: g.nome, causa: encher(T.morte.causa, { titulo: F.titulo }), linha: encher(T.morte.linha, { nome: g.nome }) }];
    }
    return [{ ordem: "calado", tipo: t, motivo: T.semOrgao }];
  } catch {
    return [];
  }
}
