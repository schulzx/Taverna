/* ============================================================
   REAÇÕES (v9.5) — o que o herói faz FORA do próprio turno

   No 5e e no BG3 metade da tensão do combate mora aqui: o golpe
   vem, e você tem uma janela para aparar, se esquivar, erguer um
   escudo arcano ou revidar. A Taverna já tinha o RECURSO de
   reação (uma por rodada) e nunca o usava.

   Como tudo mais: o catálogo diz quem tem o quê, o SISTEMA decide
   se vale a pena e rola o dado, e o Mestre recebe o resultado
   pronto para narrar. Uma por rodada, e só quando faz diferença —
   não se gasta reação para aparar um arranhão.
   ============================================================ */

import { perfilCombate } from "./combate.js";

/* ---------------- O CATÁLOGO ----------------
   `gatilho`: "sofre_dano" (quando um golpe acerta) | "inimigo_erra" (quando
   um golpe passa longe) | "inimigo_cai" (quando um inimigo tomba).
   `exige`: perfil de combate, ou uma habilidade na ficha.
   O sistema usa a PRIMEIRA da lista que se aplicar — a ordem é a prioridade. */
export const REACOES = [
  /* v9.47: CONTRAMÁGICA. "Cancela a magia de um inimigo" era a promessa, e
     ela não cabia no turno do herói: no instante em que ele age, nenhum
     inimigo declarou magia nenhuma. Cabe AQUI — reação é justamente o que
     acontece fora do próprio turno, e a única janela em que uma magia
     inimiga existe é a que está chegando.

     PRIMEIRA da lista, e a ordem é a regra: `escolherReacao` devolve a
     primeira que se aplica, e cancelar é melhor do que aparar. Só morde o
     que é mágico — contramágica não para uma machadada —, então quem não
     está sob magia cai no Escudo Arcano da linha seguinte, como antes. */
  {
    id: "contramagia", nome: "Contramágica", icone: "🚫", gatilho: "sofre_dano",
    exigeTipo: [], soMagia: true, pm: 3, corta: 1, minDano: 4,
    desc: "Desfaz a magia inimiga no ar, antes de ela terminar.",
    narrar: "corta o gesto do conjurador no meio e a magia se desfaz sem chegar",
  },
  {
    id: "escudo_arcano", nome: "Escudo Arcano", icone: "🛡", gatilho: "sofre_dano",
    exigeTipo: ["conjurador"], pm: 2, corta: 0.6, minDano: 6,
    desc: "Uma barreira instantânea absorve a maior parte do golpe.",
    narrar: "ergue uma barreira de energia no último instante",
  },
  {
    id: "aparar", nome: "Aparar", icone: "⚔", gatilho: "sofre_dano",
    exigeTipo: ["marcial", "misto"], pm: 0, corta: 0.5, minDano: 5,
    desc: "Desvia a lâmina com a própria arma e reduz o estrago pela metade.",
    narrar: "gira a arma e apara o golpe de raspão",
  },
  {
    id: "esquiva_agil", nome: "Esquiva Ágil", icone: "💨", gatilho: "sofre_dano",
    exigeTipo: ["furtivo"], pm: 0, corta: 1, minDano: 4, chance: 0.6,
    desc: "Sai da linha do golpe — quando dá certo, o dano é zero.",
    narrar: "dobra o corpo e o golpe passa raspando",
  },
  {
    id: "contra_ataque", nome: "Contra-ataque", icone: "🗡", gatilho: "inimigo_erra",
    exigeTipo: ["marcial", "misto", "furtivo"], pm: 0, contraAtaca: true, chance: 0.55,
    desc: "O inimigo errou e abriu a guarda: a resposta vem na mesma batida.",
    narrar: "aproveita a brecha e revida antes que o inimigo recupere a guarda",
  },
  {
    id: "oportunidade", nome: "Ataque de Oportunidade", icone: "⚡", gatilho: "inimigo_cai",
    exigeTipo: ["marcial", "misto", "furtivo", "conjurador"], pm: 0, contraAtaca: true, chance: 0.4,
    desc: "Um inimigo tomba e outro se descuida — o golpe emenda.",
    narrar: "emenda o movimento no inimigo seguinte",
  },
];

export const reacaoPorId = (id) => REACOES.find((r) => r.id === id) || null;

/* Quais reações este herói tem, na ordem de prioridade. Sai do perfil de
   combate da classe (marcial apara, conjurador ergue escudo, furtivo esquiva)
   e de habilidades da ficha com o mesmo nome. */
export function reacoesDe(pers) {
  const tipo = perfilCombate(pers && pers.classe).tipo;
  const nomesFicha = new Set(((pers && pers.habilidades) || []).map((h) => (typeof h === "string" ? h : h.nome || "").toLowerCase()));
  return REACOES.filter((r) => (r.exigeTipo || []).includes(tipo) || nomesFicha.has(r.nome.toLowerCase()));
}

/* ---------------- A DECISÃO ----------------
   Vale gastar a reação agora? O sistema é econômico de propósito: aparar um
   arranhão desperdiça o recurso que salvaria a vida no golpe seguinte. */
export function escolherReacao({ pers, gatilho, dano = 0, temReacao = true, tipoDano = "fisico" }) {
  if (!temReacao || !pers) return null;
  const candidatas = reacoesDe(pers).filter((r) => r.gatilho === gatilho);
  for (const r of candidatas) {
    if ((r.pm || 0) > (pers.mana || 0)) continue;
    /* v9.47: reação que só morde magia não morde uma machadada. */
    if (r.soMagia && (!tipoDano || tipoDano === "fisico")) continue;
    if (gatilho === "sofre_dano") {
      const limite = Math.max(r.minDano || 0, Math.round((pers.vidaMax || 20) * 0.08));
      if (dano < limite) continue;      // golpe pequeno não merece a reação
    }
    if (r.chance != null && Math.random() > r.chance) continue;
    return r;
  }
  return null;
}

/* Resolve a reação escolhida. Devolve o quanto o dano foi cortado (ou o
   contra-ataque a executar) + os textos prontos. */
export function resolverReacao(reacao, { pers, dano = 0, atacante = "", alvoContra = "" }) {
  if (!reacao) return null;
  const base = {
    reacao, pm: reacao.pm || 0,
    texto: "", nota: "", danoFinal: dano, cortou: 0, contraAtaca: !!reacao.contraAtaca,
  };
  if (reacao.gatilho === "sofre_dano") {
    const cortou = Math.min(dano, Math.round(dano * (reacao.corta || 0)));
    return {
      ...base,
      danoFinal: Math.max(0, dano - cortou), cortou,
      texto: `${reacao.icone} REAÇÃO — ${reacao.nome}: ${cortou >= dano ? "o golpe não te acerta" : `${cortou} de dano evitado`} (${dano} → ${Math.max(0, dano - cortou)})${reacao.pm ? ` · −${reacao.pm} PM` : ""}`,
      nota: `[REAÇÃO — RESOLVIDA PELO SISTEMA] Usei ${reacao.nome} contra o golpe de ${atacante}: ${cortou >= dano ? "o ataque não me acertou de verdade" : `evitei ${cortou} de dano (levei ${Math.max(0, dano - cortou)} em vez de ${dano})`}. Narre o instante — ${reacao.narrar} — e trate os números como fato, sem recalcular.`,
    };
  }
  return {
    ...base,
    texto: `${reacao.icone} REAÇÃO — ${reacao.nome}${alvoContra ? ` em ${alvoContra}` : ""}`,
    nota: `[REAÇÃO — RESOLVIDA PELO SISTEMA] ${reacao.nome}: ${reacao.narrar}${alvoContra ? ` (contra ${alvoContra})` : ""}. O resultado do golpe extra vem no envelope de combate — narre o gesto, não invente dano.`,
  };
}

/* ---------------- O REVIDE CHEGA AO CORPO (MM14) ----------------
   O contra-ataque da reação era rolado, contado ao Narrador ("acertou
   Esqueleto: 5 de dano, ele está com 3 de 8") e APAGADO no mesmo instante:
   `tentarReacaoNoGolpe` (App) escrevia o dano no ref do combate, e o turno
   dos inimigos, que tem a sua própria cópia do campo (`combPos`) como
   autoridade, publicava essa cópia no fim da rodada por cima do revide. Na
   sessão de prova (MM11) foi 2 em 2: o Mestre narrou um peito fendido num
   esqueleto que o tabuleiro dizia inteiro, 8 de 8.

   Esta é a conta que o laço aplica à SUA cópia do campo, no mesmo formato
   da linha do App que já a fazia (vida, `derrotado`, `ultimoDano`).
   `revide` é `{ alvo, dano }` — o nome de quem abriu a guarda e o dano
   que o revide rolou. Lista NOVA quando o revide morde; a recebida fica
   intacta. Sem mordida — revide de lixo, dano zero ou torto, alvo que não
   está de pé — devolve a MESMA lista: nada a aplicar não é estado novo.
   Um corpo já caído não é ferido outra vez nem levantado. */
export function revideNoCampo(inimigos, revide) {
  if (!Array.isArray(inimigos)) return inimigos;
  const rv = revide && typeof revide === "object" ? revide : null;
  const dano = rv ? Number(rv.dano) : NaN;
  if (!rv || rv.alvo == null || !Number.isFinite(dano) || dano <= 0) return inimigos;
  const i = inimigos.findIndex((e) => e && typeof e === "object" && e.nome === rv.alvo && !e.derrotado && Number(e.vida) > 0);
  if (i < 0) return inimigos;
  const e = inimigos[i];
  const pv = Math.max(0, Number(e.vida) - dano);
  return inimigos.map((x, k) => (k !== i ? x : { ...x, vida: pv, derrotado: pv <= 0, ultimoDano: dano }));
}

export function resumoReacoesPrompt(pers) {
  const rs = reacoesDe(pers);
  if (!rs.length) return "";
  return `REAÇÕES DISPONÍVEIS (uma por rodada, decididas e roladas pelo SISTEMA fora do meu turno — você nunca as invoca nem inventa): ${rs.map((r) => `${r.icone} ${r.nome} (${r.desc})`).join(" · ")}.`;
}

export const REACOES_PROMPT = `REAÇÕES (v9.5 — o sistema decide, você narra):
- Fora do próprio turno o herói pode reagir uma vez por rodada: aparar, erguer escudo arcano, esquivar ou revidar. QUEM DECIDE É O SISTEMA, pelo catálogo e pelo tamanho do golpe — você nunca declara uma reação, nunca a nega e nunca inventa uma nova.
- Quando uma reação acontecer, o envelope traz "[REAÇÃO — RESOLVIDA PELO SISTEMA]" com o número já aplicado. Narre o instante (a lâmina que apara, a barreira que acende, o corpo que se dobra) e siga — sem recalcular dano e sem transformar isso em turno extra.`;
