/* ============================================================
   AS PEÇAS · O CALOR E O RELÓGIO (17/11/2026, Fase A da prova) — src/pecas/calor.js

   As duas decisões da pessoa que dão número ao aquecimento:
   · «até que uma ação do player (ou conjunto de ações, caso ele já esteja
     preso na etapa há muito tempo) o leve para a solução» — o CALOR: cada
     frase que aponta para uma solução aquece-a; cheia, o Mestre abre-a (o
     dado aparece sem o jogador adivinhar a palavra), e o calor que sobra é
     bónus no dado (quem interpretou antes rola melhor);
   · «prefiro que o mundo cobre com preço» — o RELÓGIO: cada aquecimento
     gasta tempo do mundo; cheio, o mundo cobra (um preço da tabela do
     quadro), e a etapa reabre pior, com uma solução forçada à vista.

   A memória de cada peça vive em `estado.pecas[quest|etapa]` (campo novo,
   aditivo, ignorado por quem não o conhece): { calor, relogio, cobrou,
   abertas, forcada, pior }. Substituída, nunca mutada.

   PURO E DETERMINÍSTICO. Nenhuma sorte.
   ============================================================ */
import { PRECO_DA_FALHA } from "../quadro-da-quest.js";
import { SITUACAO_DA_CD } from "../desafios.js";
import { VANTAGEM_DA_SETA } from "./moldes.js";

const obj = (x) => (x && typeof x === "object" && !Array.isArray(x) ? x : null);
const arr = (x) => (Array.isArray(x) ? x : []);
const inteiro = (x) => (Number.isFinite(Number(x)) ? Math.trunc(Number(x)) : 0);
const deltaDaSituacao = (SITUACAO_DA_CD.find((s) => s.id === "escuro") || { delta: 2 }).delta;

/* ---------------- OS NÚMEROS ---------------- */
export const CALOR_DAS_PECAS = Object.freeze({
  /* cada frase que aponta para uma solução aquece-a um passo — a frase que
     aponta para duas aquece as duas (é o desempate sem pergunta) */
  porAquecimento: 1,
  /* a frase que nomeia o alvo da solução (a pessoa, o sítio) aponta com
     mais força: um passo a mais */
  porNomear: 1,
  /* três passos abrem a solução: é a régua da ordem de 04/11 — «um dado a
     cada dois ou três turnos fora da luta». Quem conversa três turnos na
     mesma direção recebe o dado no terceiro, sem adivinhar a palavra */
  cheio: 3,
  /* o calor acima do primeiro passo vira bónus, um por passo, até ao teto
     da emboscada (VANTAGEM_DA_SETA): o melhor que a situação dá é o mesmo
     que o melhor que a interpretação dá */
  bonusPorPasso: 1,
  tetoDoBonus: VANTAGEM_DA_SETA.emboscada,
  porque: "o calor é o «conjunto de ações» da pessoa, em número",
});

export const RELOGIO_DAS_PECAS = Object.freeze({
  /* o que gasta o relógio: cada aquecimento, e cada falha que deixa a
     etapa aberta (o mundo não espera por quem tenta e erra). A saída livre
     (ir, descansar, comprar) gasta o relógio do mundo, não o da etapa */
  porAquecimento: 1,
  porFalhaQueContinua: 1,
  /* o tamanho do relógio pela temperatura da quest: na brasa ninguém do
     vilão está à vista e o mundo anda devagar: 2 × cheio + 2, e o jogador
     que só conversa vê duas soluções abrirem antes de o mundo cobrar. Cada
     grau acima tira um; no incêndio, 2 × cheio − 1 ainda abre uma e meia */
  porTemperatura: Object.freeze({ brasa: 8, chama: 7, fogueira: 6, incendio: 5 }),
  /* a etapa reaberta fica pior pelo degrau com que a casa pesa a situação
     (SITUACAO_DA_CD: o escuro e a chuva somam 2) — guardado na memória
     (`pior`), e somado ao dado pelo encaixe */
  pioraDc: deltaDaSituacao,
  /* e o pior tem teto: dois degraus da situação (a chuva e o escuro
     juntos). Sem teto, a terceira cobrança punha a CD fora do d20, e a
     etapa ficava presa pelo próprio relógio que existe para a soltar */
  tetoDoPior: 2 * deltaDaSituacao,
  /* à segunda cobrança o mundo não espera mais: a forçada rola-se sozinha
     (a besta vem a você; a testemunha vem dizer o que viu, a preço). É o
     que garante que ninguém fica preso numa etapa, nem quem nunca age */
  impoeNa: 2,
  porque: "quem trava paga: o relógio é o teto do aquecimento (as-pecas.md §6.1)",
});

/* o preço do relógio, pelo facto que a etapa espera — sempre um id de
   PRECO_DA_FALHA (o quadro aplica-o pelas portas que já existem) */
export const PRECO_DO_RELOGIO = Object.freeze({
  derrotou: "alerta", encontrou: "alerta", poupou: "alerta",
  descobriu: "alerta",
  conversou: "tempo", consultou: "tempo", conheceu: "tempo", afeicao: "tempo", acompanha: "tempo",
  esteve: "tempo", esta_em: "tempo", tem: "tempo", escolheu: "tempo",
});

/* o que o mundo faz quando cobra: o evento (dado para o Narrador — ele
   narra; isto não é prosa de tela) */
export const EVENTO_DO_RELOGIO = Object.freeze({
  derrotou: "{nome} age outra vez enquanto você hesita",
  encontrou: "{nome} muda de covil, e volta a descer",
  poupou: "{nome} age outra vez enquanto você hesita",
  descobriu: "o rasto em {nome} esfria, e alguém nota quem andou a perguntar",
  conversou: "{nome} cansa-se de esperar e fecha-se",
  consultou: "{nome} cansa-se de esperar e fecha-se",
  conheceu: "{nome} deixa a cidade por uns dias",
  afeicao: "{nome} esfria com a demora",
  acompanha: "{nome} parte sem você",
  esteve: "o caminho até {nome} fecha-se com a noite",
  esta_em: "o caminho até {nome} fecha-se com a noite",
  tem: "{nome} muda de mãos",
  escolheu: "a decisão adiada pesa a quem espera",
});

/* ---------------- O RELÓGIO DE UMA PEÇA ---------------- */
export function relogioDaPeca(ficha, etapa, excecao) {
  const F = obj(ficha) || {};
  const ex = obj(obj(excecao) && excecao.relogio) || {};
  const cheio = inteiro(ex.cheio) > 0 ? inteiro(ex.cheio) : RELOGIO_DAS_PECAS.porTemperatura[F.temperatura] || RELOGIO_DAS_PECAS.porTemperatura.brasa;
  return { cheio, porAquecimento: RELOGIO_DAS_PECAS.porAquecimento };
}

/* ---------------- A MEMÓRIA ---------------- */
export const chaveDaPeca = (peca) => `${peca && peca.quest}|${peca && peca.etapa}`;
export function garantirMemoria(m) {
  const o = obj(m) || {};
  const calor = {};
  for (const [k, v] of Object.entries(obj(o.calor) || {})) if (inteiro(v) > 0) calor[k] = inteiro(v);
  const abertas = {};
  for (const [k, v] of Object.entries(obj(o.abertas) || {})) abertas[k] = inteiro(v);
  return {
    calor, abertas,
    relogio: Math.max(0, inteiro(o.relogio)),
    cobrou: Math.max(0, inteiro(o.cobrou)),
    pior: Math.max(0, inteiro(o.pior)),
    forcada: typeof o.forcada === "string" ? o.forcada : null,
    queimadas: arr(o.queimadas).filter((x) => typeof x === "string"),
    falhas: Object.fromEntries(Object.entries(obj(o.falhas) || {}).filter(([, v]) => inteiro(v) > 0).map(([k, v]) => [k, inteiro(v)])),
  };
}
export const memoriaDe = (estado, peca) => garantirMemoria(obj(obj(estado) && estado.pecas) ? estado.pecas[chaveDaPeca(peca)] : null);
export function comMemoria(estado, peca, memoria) {
  const E = obj(estado) || {};
  return { ...E, pecas: { ...(obj(E.pecas) || {}), [chaveDaPeca(peca)]: garantirMemoria(memoria) } };
}

/* ---------------- AQUECER ----------------
   aquecer(memoria, peca, { esquenta, nomeadas }) → { memoria, abriu }
   `esquenta`: os ids das soluções para onde a frase aponta; `nomeadas`:
   as que a frase aponta pelo nome do alvo. `abriu`: as que encheram agora
   — o Mestre abre-as (o dado aparece no turno seguinte). O relógio anda
   um passo por aquecimento, aponte a frase para algo ou não. */
export function aquecer(memoria, peca, leitura) {
  const m = garantirMemoria(memoria);
  const l = obj(leitura) || {};
  const validas = new Set(arr(peca && peca.solucoes).map((s) => s.id));
  const nomeadas = new Set(arr(l.nomeadas));
  const calor = { ...m.calor };
  const abriu = [];
  for (const id of arr(l.esquenta)) {
    if (!validas.has(id)) continue;
    const antes = calor[id] || 0;
    calor[id] = antes + CALOR_DAS_PECAS.porAquecimento + (nomeadas.has(id) ? CALOR_DAS_PECAS.porNomear : 0);
    if (antes < CALOR_DAS_PECAS.cheio && calor[id] >= CALOR_DAS_PECAS.cheio && m.abertas[id] == null) abriu.push(id);
  }
  const abertas = { ...m.abertas };
  for (const id of abriu) abertas[id] = 0;
  return { memoria: { ...m, calor, abertas, relogio: m.relogio + RELOGIO_DAS_PECAS.porAquecimento }, abriu };
}

/* o bónus que o calor dá ao dado de uma solução */
export function bonusDoCalor(memoria, id) {
  const c = garantirMemoria(memoria).calor[id] || 0;
  return Math.min(CALOR_DAS_PECAS.tetoDoBonus, Math.max(0, c - 1) * CALOR_DAS_PECAS.bonusPorPasso);
}

export const relogioCheio = (memoria, peca) => garantirMemoria(memoria).relogio >= ((peca && peca.relogio && peca.relogio.cheio) || RELOGIO_DAS_PECAS.porTemperatura.brasa);

/* ---------------- O MUNDO COBRA ----------------
   oMundoCobra(peca, estado) → null (o relógio ainda não encheu) | {
     evento: { facto, diz }, preco: { id, linha, efeitos }, forcada,
     memoria, peca }
   A solução forçada: das que fecham e estão à vista, primeiro as que
   escrevem o facto nas duas faces (o sucesso, e a falha com preço) — o
   mundo que vem cobrar traz o desfecho, bom ou caro —, depois a que menos
   falhou, e dessas a mais quente (a ordem do molde desempata); sem
   nenhuma à vista, a primeira que fecha. A etapa REABRE: o que tinha
   queimado volta a poder tentar-se — pior (`pior`), mas aberto. É o que
   impede a etapa de ficar sem caminho depois de tudo falhar.
   A peça devolvida é a mesma etapa, pior: a memória guarda `pior` (todo
   dado sobe `pioraDc`, pelo encaixe), e a forçada fica à vista e aberta —
   o jogador vê o caminho, e paga por ter esperado. `impoe`: à cobrança
   `impoeNa`, a forçada rola-se sem esperar pelo jogador. */
export function oMundoCobra(peca, estado) {
  if (!obj(peca) || !arr(peca.solucoes).length) return null;
  const m = memoriaDe(estado, peca);
  if (!relogioCheio(m, peca)) return null;
  const fecham = peca.solucoes.filter((s) => s.fecha);
  const quente = (s) => m.calor[s.id] || 0;
  const vista = fecham.filter((s) => s.aVista);
  const pool = vista.length ? vista : fecham;
  const falhou = (s) => (m.falhas[s.id] || 0) + (m.queimadas.includes(s.id) ? 1 : 0);
  const duasFaces = (s) => (s.falha && s.falha.escreve ? 0 : 1);
  const forcada = [...pool].sort((a, b) => duasFaces(a) - duasFaces(b) || falhou(a) - falhou(b) || quente(b) - quente(a) || peca.solucoes.indexOf(a) - peca.solucoes.indexOf(b))[0] || null;
  const facto = forcada && forcada.fatos[0] ? forcada.fatos[0][0] : (peca.faltam[0] || [""])[0];
  const precoId = PRECO_DO_RELOGIO[facto] || "tempo";
  const P = PRECO_DA_FALHA[precoId];
  const nome = forcada ? forcada.alvo.nome : "";
  const pior = Math.min(RELOGIO_DAS_PECAS.tetoDoPior, m.pior + RELOGIO_DAS_PECAS.pioraDc);
  const memoria = { ...m, relogio: 0, cobrou: m.cobrou + 1, pior, queimadas: [], forcada: forcada ? forcada.id : null, abertas: forcada ? { ...m.abertas, [forcada.id]: 0 } : m.abertas };
  const evento = obj(peca.evento) && typeof peca.evento[facto] === "string" ? peca.evento[facto] : EVENTO_DO_RELOGIO[facto] || "";
  const piorada = Object.freeze({
    ...peca,
    solucoes: Object.freeze(peca.solucoes.map((s) => (forcada && s.id === forcada.id ? Object.freeze({ ...s, aVista: true, forcada: true }) : s))),
  });
  return {
    evento: { facto, diz: evento.replace("{nome}", nome || "quem se esperava") },
    preco: { id: precoId, linha: P.linha, efeitos: P.efeitos.map((e) => ({ ...e })) },
    forcada: forcada ? forcada.id : null,
    impoe: memoria.cobrou >= RELOGIO_DAS_PECAS.impoeNa,
    memoria,
    peca: piorada,
  };
}
