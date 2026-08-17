/* ============================================================
   A VIAGEM COMO REGISTRO (v9.56) — o relógio da estrada

   A jornada existia desde a v9.29 e guardava quatro coisas: de onde,
   para onde, em que dia partiu e em que meio. Nenhuma delas dizia
   QUANTO ANDOU. E o que o Mestre recebia, turno após turno, era:

     "EM VIAGEM desde Nova do Norte (desde o dia 7) — não estou em
      cidade nenhuma"

   Repare no que não está aí: o destino. Nem para onde, nem quanto
   falta, nem quanto já se andou. Ele sabia que o herói estava na
   estrada e nada mais — e por isso escrevia "a estrada segue" turno
   após turno, sem escalar nada, porque não tinha como saber que o
   terceiro dia é diferente do primeiro.

   E havia um erro de aritmética embaixo disso. A chegada era medida em
   DIAS DE CALENDÁRIO — `dia_atual − dia_da_partida ≥ dias_da_rota` — e
   o avanço era em HORAS DE ESTRADA. Os dois relógios não são o mesmo:
   acampar cinco dias numa clareira, sem andar um metro, fazia o herói
   CHEGAR. O tempo passava, logo a viagem acontecia.

   Aqui a viagem passa a contar o que de fato importa: ESTRADA
   PERCORRIDA. Só andar anda. E como cada turno de estrada é uma fração
   fixa da jornada, "faltam dois turnos" sai exato, de graça — que era o
   número que o Mestre precisava para saber quando apertar.

   A RÉGUA DO TEMPO, e ela precisa fechar dos dois lados:

     · um dia de jornada tem OITO horas de marcha — ninguém caminha
       vinte e quatro;
     · um turno de estrada cobre QUATRO dessas horas, ou seja, meio dia
       de marcha;
     · logo o relógio avança MEIO DIA por turno, e uma rota de 6,5 dias
       leva treze turnos e gasta 6,5 dias de calendário.

   Antes desta versão o relógio andava quatro horas por turno enquanto a
   chegada cobrava dias inteiros: as duas contas discordavam, e a
   discordância era o bug.
   ============================================================ */

export const HORAS_MARCHA_POR_DIA = 8;
export const MINUTOS_ESTRADA_POR_TURNO = 240;      // 4 h de marcha efetiva
export const MINUTOS_RELOGIO_POR_TURNO = 720;      // meio dia de calendário
/* Um dia de calendário tem três meios-dias de marcha (8 h de estrada em 24). */
export const RELOGIO_POR_ESTRADA = (24 * 60) / (HORAS_MARCHA_POR_DIA * 60);

/* ---------------- O TETO DE AVANÇOS (v9.56) ----------------
   Medido ao ligar a conta pela primeira vez: o gerador produz rotas de até
   37 dias de marcha, e a 4 h por avanço isso davam SETENTA E CINCO cliques
   para atravessar o mapa. O modelo antigo escondia o número — bastava o
   calendário andar, e acampar contava —, então ninguém tinha visto.

   A saída não é encurtar o mundo: é fazer o PASSO crescer com a viagem. Um
   trecho curto se anda em meios-dias; uma travessia épica se anda em
   semanas, e o avanço passa a valer o que a jornada pede. Assim a viagem
   mais longa do mundo cabe em quatorze avanços, e o relógio continua
   fechando com a estrada, porque os dois saem do mesmo número. */
export const TETO_DE_AVANCOS = 14;

export const ESTADOS = { emCurso: "em_curso", pausada: "pausada", concluida: "concluida" };

/* `Number(null)` é 0 e `Number.isFinite(0)` é verdadeiro: sem tratar o nulo
   antes, uma rota sem dias declarados virava uma rota de zero minutos —
   viagem que termina no instante em que começa. */
const num = (v, padrao = 0) => (v === null || v === undefined || v === "" || !Number.isFinite(Number(v)) ? padrao : Number(v));

/* Quantos minutos de estrada uma rota inteira pede. Rota sem dias
   declarados vale três dias — o mesmo piso honesto de sempre. */
export function minutosDaRota(dias) {
  return Math.max(60, Math.round(Math.max(0.25, num(dias, 3)) * HORAS_MARCHA_POR_DIA * 60));
}

export function abrirViagem({ de, para, dia = 0, meio = "", rota = null }) {
  const dias = rota ? num(rota.dias, 3) : 3;
  return {
    de: de || "a última parada",
    para: para || "",
    meio: meio || "",
    desde: dia,                       // dia da partida (a tela e o save já usavam)
    km: rota ? num(rota.km, 0) : 0,
    terreno: (rota && rota.terreno) || "",
    dias,
    totalMin: minutosDaRota(dias),
    andadoMin: 0,
    estado: ESTADOS.emCurso,
    motivoPausa: "",
  };
}

/* Quanto de estrada um avanço cobre NESTA jornada, e quanto de relógio ele
   custa. Os dois saem do mesmo número, e é por isso que não podem discordar. */
export function minutosPorAvanco(jornada) {
  const total = Math.max(60, num(jornada && jornada.totalMin, minutosDaRota(jornada && jornada.dias)));
  return Math.max(MINUTOS_ESTRADA_POR_TURNO, Math.ceil(total / TETO_DE_AVANCOS));
}
export function relogioDoAvanco(jornada) {
  return Math.round(minutosPorAvanco(jornada) * RELOGIO_POR_ESTRADA);
}

/* Andou. `minutos` é ESTRADA, não relógio — quem passa a noite acampado
   avança o calendário e não avança um metro, que é exatamente a
   distinção que faltava. */
export function andar(jornada, minutos = null) {
  if (!jornada) return jornada;
  minutos = minutos === null ? minutosPorAvanco(jornada) : minutos;
  const andadoMin = Math.min(jornada.totalMin, Math.max(0, num(jornada.andadoMin) + Math.max(0, num(minutos))));
  const chegou = andadoMin >= jornada.totalMin;
  return { ...jornada, andadoMin, estado: chegou ? ESTADOS.concluida : ESTADOS.emCurso, motivoPausa: "" };
}

/* A emboscada no meio da estrada PARA a viagem — e isso existe para que
   o herói não "continue viajando" enquanto luta. Retomar é explícito. */
export function pausarViagem(jornada, motivo = "algo cortou o caminho") {
  if (!jornada || jornada.estado === ESTADOS.concluida) return jornada;
  return { ...jornada, estado: ESTADOS.pausada, motivoPausa: String(motivo || "") };
}
export function retomarViagem(jornada) {
  if (!jornada || jornada.estado !== ESTADOS.pausada) return jornada;
  return { ...jornada, estado: ESTADOS.emCurso, motivoPausa: "" };
}

/* ---------------- O PROGRESSO ----------------
   Tudo o que o Mestre e a tela precisam saber, calculado num lugar só. */
export function progressoDaViagem(jornada) {
  if (!jornada || !jornada.para) return null;
  const total = Math.max(1, num(jornada.totalMin, minutosDaRota(jornada.dias)));
  const feito = Math.min(total, Math.max(0, num(jornada.andadoMin)));
  const faltamMin = total - feito;
  const passo = minutosPorAvanco(jornada);
  const turnosRestantes = Math.ceil(faltamMin / passo);
  const fracao = feito / total;
  return {
    fracao,
    pct: Math.round(fracao * 100),
    turnosRestantes,
    turnosTotais: Math.ceil(total / passo),
    minutosDoAvanco: passo,
    horasFeitas: Math.round(feito / 60),
    horasTotais: Math.round(total / 60),
    diasRestantes: Math.round((faltamMin / 60 / HORAS_MARCHA_POR_DIA) * 10) / 10,
    kmFeitos: jornada.km ? Math.round(jornada.km * fracao) : 0,
    kmTotais: num(jornada.km, 0),
    chegou: faltamMin <= 0,
    estado: jornada.estado || ESTADOS.emCurso,
  };
}

/* ============================================================
   OS TRECHOS DA ROTA (etapa 2)

   Uma viagem de treze avanços passava por um espaço que, do ponto de
   vista do sistema, era liso: a mesma estrada do começo ao fim. As
   células do ermo (v9.54) já sabiam desenhar o caminho — que terreno,
   que perigo, que feição — e ninguém as pendurava na jornada.

   Aqui a rota passa a ter TRECHOS. Cada avanço cai num deles, e o
   Mestre recebe o trecho ATUAL com o nome do que há nele. O ganho não é
   cosmético: é o que faz o terceiro dia parecer o terceiro dia, e é o
   que faz a volta pelo mesmo caminho reencontrar as mesmas coisas.

   A lista chega pronta de fora — este arquivo não sabe o que é uma
   célula, e não deveria: ele sabe onde a viagem está, e quem sabe o que
   há lá é `celulas.js`.
   ============================================================ */

export function comTrechos(jornada, trechos) {
  if (!jornada) return jornada;
  const lista = (Array.isArray(trechos) ? trechos : []).filter(Boolean);
  return { ...jornada, trechos: lista.map((c) => ({ id: c.id, bioma: c.bioma, perigo: c.perigo, rotuloPerigo: c.rotuloPerigo, feicao: c.feicao })) };
}

/* Em qual trecho a viagem está agora. A fração já é o progresso, então
   o trecho é uma divisão simples — e o `min` existe porque quem chega
   ao fim está no último trecho, não num que não existe. */
export function trechoAtual(jornada) {
  const t = (jornada && jornada.trechos) || [];
  if (!t.length) return null;
  const p = progressoDaViagem(jornada);
  if (!p) return null;
  const i = Math.min(t.length - 1, Math.floor(p.fracao * t.length));
  return { ...t[i], indice: i, total: t.length };
}

/* ---------------- OS TEXTOS ----------------
   "Turno" é palavra do SISTEMA e o Mestre não pode dizê-la na prosa: ele
   recebe o número para saber onde apertar o ritmo, e traduz em ficção. O
   mesmo vale para quilômetro e para porcentagem. */
export function resumoViagemPrompt(jornada) {
  const p = progressoDaViagem(jornada);
  if (!p) return "";
  if (p.estado === ESTADOS.pausada) {
    return `VIAGEM PAUSADA (do sistema): eu ia de ${jornada.de} para ${jornada.para} e ${jornada.motivoPausa || "algo cortou o caminho"}. Já cobri ${p.pct}% do trecho. Enquanto isto não se resolver eu NÃO avanço na estrada — não me faça chegar a lugar nenhum e não descreva o destino no horizonte.`;
  }
  const perto = p.turnosRestantes <= 1
    ? "ESTE É O ÚLTIMO TRECHO: no próximo avanço eu chego. Feche o caminho — o cheiro do destino, a estrada ficando movimentada, os primeiros telhados."
    : p.turnosRestantes === 2
      ? "Falta pouco: comece a mostrar o destino se aproximando (tráfego na estrada, marcos, o que se ouve dizer de lá)."
      : p.fracao < 0.2
        ? "Ainda é o começo do caminho: o que ficou para trás pesa mais do que o que vem pela frente."
        : "Meio do caminho: nem a partida nem a chegada — é aqui que a estrada cansa e é aqui que ela surpreende.";
  const tr = trechoAtual(jornada);
  const ondeAgora = tr
    ? `\n- O TRECHO DE AGORA (o ${tr.indice + 1}º de ${tr.total}): ${tr.rotuloPerigo}. Há aqui ${tr.feicao.nome} — ${tr.feicao.desc}. Isto EXISTE e é permanente: na volta pelo mesmo caminho estará no mesmo lugar. Use se couber; não invente outro lugar por cima dele.`
    : "";
  return `EM VIAGEM (do sistema — números exatos, obedeça): de ${jornada.de} para ${jornada.para}${jornada.meio ? `, de ${jornada.meio}` : ""}${jornada.terreno ? `, por ${jornada.terreno}` : ""}. Percorrido: ${p.pct}% do trecho (${p.horasFeitas} de ${p.horasTotais} horas de marcha${p.kmTotais ? `, ${p.kmFeitos} de ${p.kmTotais} km` : ""}). FALTAM ${p.turnosRestantes} ${p.turnosRestantes === 1 ? "avanço" : "avanços"} de estrada (${p.diasRestantes} ${p.diasRestantes === 1 ? "dia" : "dias"} de marcha).${ondeAgora}
- ${perto}
- NÃO me faça chegar antes: quem registra a chegada é o sistema, e ele avisa. Enquanto faltar avanço, a cena acontece NO CAMINHO.
- E nunca diga "turno", "avanço de estrada", porcentagem ou quilômetro na narração: esses números são meus, não da ficção. Traduza em imagem — a luz do dia, o cansaço, o que já dá para ver ao longe.`;
}

/* A linha da tela: curta, com barra. O jogador quer saber quanto falta
   sem ler um parágrafo. */
export function linhaDaViagem(jornada) {
  const p = progressoDaViagem(jornada);
  if (!p) return "";
  if (p.estado === ESTADOS.pausada) return `🧭 ${jornada.de} → ${jornada.para} · PAUSADA (${p.pct}%) — ${jornada.motivoPausa}`;
  if (p.chegou) return `🧭 ${jornada.de} → ${jornada.para} · chegando`;
  const cheias = Math.max(0, Math.min(8, Math.round(p.fracao * 8)));
  return `🧭 ${jornada.de} → ${jornada.para} · ${"▰".repeat(cheias)}${"▱".repeat(8 - cheias)} ${p.pct}% · faltam ${p.turnosRestantes} ${p.turnosRestantes === 1 ? "avanço" : "avanços"}`;
}

export const VIAGEM_PROMPT = `VIAGEM (v9.56 — o sistema mede, você narra):
- Enquanto o herói estiver na estrada, você recebe QUANTO já foi percorrido e QUANTOS avanços faltam. Use isso para dosar o ritmo: o começo do caminho não é o fim dele, e o último trecho deve cheirar a chegada.
- Você NUNCA faz o herói chegar. A chegada é registrada pelo sistema e vem anunciada; até lá, toda cena acontece no caminho, por mais que a ficção pareça pedir o portão.
- Os números da viagem (avanços, porcentagem, quilômetros, horas de marcha) são do SISTEMA e não existem na ficção. Nunca os diga: traduza em imagem — a luz mudando, os pés, o que já se avista.
- Se a viagem estiver PAUSADA, ela está parada de verdade: nada de avançar no trecho enquanto o que a interrompeu não se resolver.`;
