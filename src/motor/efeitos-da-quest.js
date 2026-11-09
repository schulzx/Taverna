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
         { ordem: "relogios", ids, quanto, porque }  tiquear(null, { quanto,
                                                     porque, apenasIds: ids })
                                                     — o ponteiro, a linha e o
                                                     envelope do cheio (09/11)
         { ordem: "revelacao", quest, titulo, revelacao, tom }  (TE9) o momento da
                                                     recompensa: a lista de
                                                     revelacaoDoEspolio (a
                                                     ordem, a comparação, o
                                                     «Equipar já») — a paga
                                                     já entrou pelo motor;
                                                     tom (09/11): "coracao"
                                                     | "enredo", pelo tipo
                                                     da quest (tomDaRevelacao)
         { ordem: "calado", tipo, motivo }           sem órgão: vai ao calou
       A lista vazia quer dizer «nada a fazer»: o alvo já não está, ou a
       conta não muda nada. Nunca lança.

   AS QUATRO QUE ESTAVAM CALADAS (09/11, a pessoa: «terminar as quatro
   consequências caladas»):
     · relogio_regional — os relógios da região (RELOGIOS_DA_REGIAO): o
       mundo novo É uma região (regiao.js, MM17: tudo a um dia de marcha),
       e os relógios dela são os do mundo a agir — ameaça e caçada, menos o
       prazo de uma missão, o bando de uma fuga e o rebate da abertura;
     · favor e quem_e — já não vêm aqui: o motor das quests escreve-os no
       livro de factos (QUESTS_DO_TURNO.aplica), e o replay reprodu-los;
     · passo_do_plano e fim_do_plano — cada coisa que o passo muda
       (EFEITOS_DO_PLANO) liga-se ao órgão que já existe, ou cala com o
       motivo (MUDA_DO_PLANO). A postura não pede nada: deriva-se do plano
       a cada turno (leiturasDoPlano, que o prelúdio lê).

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
import { garantirRelogios } from "../relogios.js";
import { EFEITOS_DO_PLANO, fichaDoVilao } from "../plano-do-vilao.js";
import { FASES } from "../vilao.js";
import { revelacaoDoEspolio } from "../espolios.js";

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
    relogio_regional: "os relógios da região (RELOGIOS_DA_REGIAO), pelo tiquear de sempre (relogios.js, avancar)",
    passo_do_plano: "o que o passo muda, cada coisa pelo seu órgão ou calada com o motivo (MUDA_DO_PLANO)",
    fim_do_plano: "o que o fim muda, pela mesma tabela (MUDA_DO_PLANO), com a região inteira por alvo",
    /* TE9 (09/11): a paga já entrou (o motor aplica-a, para o replay a
       reproduzir); à tela fica o MOMENTO — a ordem, a comparação com o que
       o herói veste e o «Equipar já» (revelacaoDoEspolio, espolios.js) */
    espolio: "a revelação no fecho (revelacaoDoEspolio, espolios.js): a carta que vira é da TE10; a paga, o motor já a aplicou",
  }),
  /* 09/11: vazio — as quatro que aqui moravam ganharam órgão (o favor e o
     QUEM É no livro de factos, pelo motor; o relógio da região e o plano
     do vilão por esta peça). O que ainda cala está em MUDA_DO_PLANO. */
  calado: Object.freeze({}),
  soNarrador: Object.freeze(["desfecho_do_vilao", "reacao_do_vilao"]),
  /* 09/11 (os restos da fiação da TE10): o tom da cerimónia — «O QUE FICA»
     no coração — decidia-se no App pela peça ser uma lembrança, e a quest
     do coração que não deixava lembrança abria com «CONCLUÍDA». O tom é
     do TIPO da quest (o 2 é o coração), que a paga traz; o App lê-o. */
  tomDaRevelacao: Object.freeze({ 1: "enredo", 2: "coracao" }),
  semOrgao: "sem órgão conhecido",
  morte: Object.freeze({ linha: "{nome} morreu.", causa: "no fim de «{titulo}»" }),
});

/* ---------------- OS RELÓGIOS DA REGIÃO (09/11) ----------------
   Os relógios não têm região, e não precisam: o mundo novo É uma região só
   (regiao.js, MM17 — a base, os povoados e os lugares a um dia de marcha),
   e os seis relógios em jogo (MAX_RELOGIOS) são os dela. «O relógio da
   região anda» quer dizer: o mundo, a agir sozinho, chega-se mais perto.
   `tipos`: só os que enchem com o tempo (relogios.js: a oportunidade e a
   obra só enchem com o trabalho do herói — esperar não as adianta).
   `fora`: as fontes que não são a região — o prazo de uma missão (que
   falharia por uma quest alheia), o bando de uma fuga (persegue o herói,
   não a terra) e o rebate da abertura (manual, de uma cena só). Lidas pelo
   começo da `fonte`.
   `passo`: quanto anda o relógio quando um passo do plano o pede.
   `porque`: a causa que a linha do avanço mostra ao jogador (relogios.js,
   linhaDoAvanco — «todo avanço tem causa visível»); no passo é a obra
   dele, no fim a frase do fim, e estes são o recuo de quem não as traz. */
export const RELOGIOS_DA_REGIAO = Object.freeze({
  tipos: Object.freeze(["ameaca", "cacada"]),
  fora: Object.freeze(["missao:", "fuga:", "sino"]),
  passo: 1,
  porque: Object.freeze({
    quest: "o tempo correu, e a região não esperou",
    passo: "alguma coisa mudou na região, e não foi por acaso",
    fim: "a região já não é o que era",
  }),
});

/* ---------------- O QUE UM PASSO DO PLANO MUDA (09/11) ----------------
   Cada coisa de EFEITOS_DO_PLANO, e o órgão que já existe no motor para
   ela — ou o motivo de ficar calada. NENHUMA REGRA NASCE AQUI: o que não
   tem órgão cala, com o porquê escrito, para quem o for ligar.
   Os alvos que o passo traz: o lugar (`passo_N`, que o esqueleto põe), a
   região (o mundo novo inteiro) e o «amado» — o que ele mira no que o
   herói ama quando já sabe dele (escolherAlvo, vilao.js: a gente do grupo
   ou a cidade de onde o herói partiu). O fim não traz lugar: o alvo é a
   região inteira. */
export const MUDA_DO_PLANO = Object.freeze({
  relogio: Object.freeze({ orgao: "os relógios da região (RELOGIOS_DA_REGIAO) andam um ponto, com a obra do passo por causa; no fim, o que está mais perto de encher enche (§11.7: «um relógio regional enche»)" }),
  relacao: Object.freeze({ orgao: "quem ele mira no grupo (o «amado») perde um grau de confiança: o vínculo desce abaixo do marco que tinha, a régua da afeição da quest (afeicaoNoGrupo)",
    semAlvo: "a pessoa que muda de lado só a dá o «amado» do grupo, e só quando ele já sabe do herói; sem ela, o passo não diz quem — e quem não anda no grupo não tem vínculo que desça" }),
  postura: Object.freeze({ orgao: "derivada, nada a aplicar: a postura do mundo lê o plano a cada turno (leiturasDoPlano → snapshotDePosturas, motor/preludio-do-turno.js) e vira para a Sombra, ou para a Caçada quando ele já sabe o nome do herói" }),
  base: Object.freeze({ calado: "a base do mundo (mundo-base.js) não guarda dono de lugar — só a gente (situações, mortos) e o que se achou; o lugar do passo já é dele na pauta (oVilaoNaPauta, os lugares dele)" }),
  porta: Object.freeze({ calado: "nenhum órgão fecha um lugar ao herói, e o da gente (npcs.js) pede uma pessoa que o passo não dá" }),
  estrada: Object.freeze({ calado: "a viagem (viagem.js) mede o tempo e não cobra: não há preço de estrada que possa subir" }),
  perigo: Object.freeze({ calado: "os encontros sorteiam-se pelo bioma e pelo nível (encontros.js), e o perigo do trecho sai da semente (regiao.js): nada o guarda para subir" }),
  cativeiro: Object.freeze({ calado: "o único alvo de gente que o passo dá é do grupo, e levá-lo tiraria a ficha dele do grupo sem órgão que a guarde até ao resgate; sem alvo, o passo não diz quem" }),
});

/* ---------------- O PLANO NA POSTURA DO MUNDO (09/11) ----------------
   As leituras que snapshotDePosturas (motor/preludio-do-turno.js) junta às
   dele quando um passo cumprido do plano — ou o fim — muda a postura: o
   vilão novo não é a nemesis antiga, e sem isto a Sombra nunca chegava
   (posturas.js: «faseVilao ≥ 2 e o rosto por cair»). `faseMinima`: a fase
   que a postura vê com o passo cumprido (a da mão — é a Sombra); acima
   dela, a camada que o herói já alcançou (FASES, vilao.js, a mesma
   escala). `rosto`: a camada a partir da qual o rosto caiu. */
export const POSTURA_DO_PLANO = Object.freeze({ faseMinima: 2, rosto: "rosto", muda: "postura" });

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

/* os relógios da região, pela ordem da lista (RELOGIOS_DA_REGIAO). Só os que
   já têm id: garantirRelogios sortearia um ao que não tem, e a ordem não
   acharia o relógio que pede (nem daria o mesmo id duas vezes) */
function daRegiao(relogios) {
  const R = RELOGIOS_DA_REGIAO;
  return garantirRelogios(arr(relogios).filter((r) => obj(r) && typeof r.id === "string" && r.id)).filter((r) => R.tipos.includes(r.tipo) && r.cheios < r.segmentos && !R.fora.some((f) => String(r.fonte || "").startsWith(f)));
}
const ordemDosRelogios = (lista, quanto, porque) => (lista.length && quanto > 0 ? [{ ordem: "relogios", ids: lista.map((r) => r.id), quanto, porque }] : []);

/* o que um passo (ou o fim) muda, cada coisa pela tabela */
function oQueOPlanoMuda(ef, E) {
  const fim = ef.tipo === "fim_do_plano";
  const R = RELOGIOS_DA_REGIAO;
  const muda = [...new Set(arr(fim ? ef.efeitos : ef.muda).filter((m) => typeof m === "string"))];
  const texto = (x) => (typeof x === "string" && x.trim() ? x.trim() : "");
  const out = [];
  for (const m of muda) {
    const M = MUDA_DO_PLANO[m];
    const tipo = `${ef.tipo}·${m}`;
    if (!M || !EFEITOS_DO_PLANO[m]) { out.push({ ordem: "calado", tipo, motivo: EFEITOS_NA_TELA.semOrgao }); continue; }
    if (M.calado) { out.push({ ordem: "calado", tipo, motivo: M.calado }); continue; }
    if (m === "relogio") {
      const lista = daRegiao(E.relogios);
      if (!fim) { out.push(...ordemDosRelogios(lista, R.passo, texto(ef.obra) || R.porque.passo)); continue; }
      /* «um relógio regional enche»: o mais perto de encher (a ordem desempata) */
      const um = lista.reduce((a, r) => (!a || r.cheios / r.segmentos > a.cheios / a.segmentos ? r : a), null);
      if (um) out.push(...ordemDosRelogios([um], um.segmentos - um.cheios, texto(ef.frase) || R.porque.fim));
      continue;
    }
    if (m === "relacao") {
      const alvo = obj(ef.alvo);
      const g = !fim && alvo && alvo.campo === "pessoas" ? doGrupo(E, alvo.nome) : null;
      if (!g) { out.push({ ordem: "calado", tipo, motivo: M.semAlvo }); continue; }
      out.push(...afeicaoNoGrupo(g, -1));
      continue;
    }
    /* a postura: derivada (leiturasDoPlano), nada a aplicar */
  }
  return out;
}

/* ============================================================
   O PLANO NA POSTURA — leiturasDoPlano(espinha)
   → null | { faseVilao, rostoCaiu, heroiAlvoDoVilao }
   Só nos mundos novos (a espinha com esqueleto e o registo dele), e só
   quando um passo anunciado como cumprido (espinha.quests.passos) — ou o
   fim — traz a postura no que muda. Pura, e lê só a espinha: o prelúdio, o
   replay e o servidor dão a mesma postura. Um passo que um tenente caído
   desfez continua anunciado: a postura tem histerese (posturas.js) e o
   mundo não volta atrás de um dia para o outro.
   ============================================================ */
const ORDEM_DA_FASE = Object.freeze(Object.fromEntries(FASES.map((f) => [f.id, f.ordem])));
export function leiturasDoPlano(espinha) {
  try {
    const esp = obj(espinha);
    if (!esp || !obj(esp.esqueleto)) return null;
    const f = fichaDoVilao(esp);
    if (!f) return null;
    const P = POSTURA_DO_PLANO;
    const Q = garantirQuestsDaEspinha(esp.quests);
    const peloPasso = Q.passos.some((n) => arr((f.plano[n - 1] || {}).muda).includes(P.muda));
    const peloFim = Q.fim != null && !!f.fim && arr(f.fim.efeitos).includes(P.muda);
    if (!peloPasso && !peloFim) return null;
    const ordem = ORDEM_DA_FASE[f.registro.camada] || 0;
    return { faseVilao: Math.max(P.faseMinima, ordem), rostoCaiu: ordem >= ORDEM_DA_FASE[P.rosto], heroiAlvoDoVilao: !!f.registro.nomeDoHeroi };
  } catch { return null; }
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
    if (t === "relogio_regional") return ordemDosRelogios(daRegiao(E.relogios), n, RELOGIOS_DA_REGIAO.porque.quest);
    if (t === "passo_do_plano" || t === "fim_do_plano") return oQueOPlanoMuda(ef, E);
    if (t === "espolio") {
      const revelacao = obj(ef.paga) ? revelacaoDoEspolio(ef.paga, E.personagem, { emCombate: !!E.combate }) : [];
      const tom = T.tomDaRevelacao[obj(ef.paga) && ef.paga.tipo] || T.tomDaRevelacao[1];
      return revelacao.length ? [{ ordem: "revelacao", quest: typeof ef.quest === "string" ? ef.quest : "", titulo: typeof ef.titulo === "string" ? ef.titulo : "", revelacao, tom }] : [];
    }
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
