/* ============================================================
   O LANCE DO DADO (V3 · 16/11/2026) — src/lance-do-dado.js

   A máquina de estados do lance de fora da luta (formas.md §«A Mesa do
   Mestre · F2» §3), pura e provada em Node. A peça (painel-lance.jsx) só
   pinta o que daqui sai.

   O RESULTADO NUNCA SAI DAQUI. Chega pronto do sistema (o lance da bandeja,
   já com a semente: valor, mod, alvo, desfecho), antes do primeiro quadro.
   Isto só decide o TEATRO — que faces passam enquanto o dado rola, quanto
   ele gira, quando cada passo começa —, e decide-o a partir do resultado e
   do número do lance: mesma entrada, mesma sequência, em qualquer máquina.
   Zero Math.random, zero relógio.

   OS ESTADOS (a ordem é a do lance):
     repouso → chamado → saindo → rolando → pousado → somando → veredito →
     esperando → voltando → repouso
   «Mudar de ideia» volta do chamado ao repouso, sem dado. Pular (toque,
   Enter, Espaço) corta de saindo…somando para o veredito. Com reduced-motion,
   do chamado direto ao veredito.
   ============================================================ */
import { LANCE } from "./estilo.js";

export const ESTADOS_DO_LANCE = Object.freeze(["repouso", "chamado", "saindo", "rolando", "pousado", "somando", "veredito", "esperando", "voltando"]);

/* os estados que um toque pode pular (o teatro do voo e da soma) */
const PULAVEIS = new Set(["saindo", "rolando", "pousado", "somando"]);

/* A TRANSIÇÃO. `evento`: chamar | mudar | rolar | avancar | pular |
   narrou | tocar | fim. `ctx.reduzido` encurta o rolar ao veredito.
   Evento que não cabe no estado devolve o mesmo estado (nunca lança). */
export function proximoEstado(estado, evento, ctx = null) {
  const c = ctx && typeof ctx === "object" ? ctx : {};
  const e = ESTADOS_DO_LANCE.includes(estado) ? estado : "repouso";
  if (evento === "pular" && PULAVEIS.has(e)) return "veredito";
  switch (e) {
    case "repouso": return evento === "chamar" ? "chamado" : e;
    case "chamado":
      if (evento === "mudar") return "repouso";
      if (evento === "rolar") return c.reduzido ? "veredito" : "saindo";
      return e;
    case "saindo": return evento === "avancar" ? "rolando" : e;
    case "rolando": return evento === "avancar" ? "pousado" : e;
    case "pousado": return evento === "avancar" ? "somando" : e;
    case "somando": return evento === "avancar" ? "veredito" : e;
    case "veredito": return evento === "avancar" ? "esperando" : evento === "narrou" || evento === "tocar" ? "voltando" : e;
    case "esperando": return evento === "narrou" || evento === "tocar" ? "voltando" : e;
    case "voltando": return evento === "avancar" || evento === "fim" ? "repouso" : e;
    default: return e;
  }
}

/* O VEREDITO, como o sistema já o deu (lance.desfecho do motor da bandeja):
   critico → vinte (só com o 20 na face), desastre → um, sucesso → passou,
   falha → falhou; sem alvo, «livre». `margem` é o «por N» / «faltaram N». */
export function vereditoDoLance(lance) {
  const l = lance && typeof lance === "object" ? lance : {};
  const dado = (Array.isArray(l.dados) ? l.dados : []).find((d) => d && !d.posto) || {};
  const face = Math.trunc(Number(dado.valor != null ? dado.valor : l.valor) || 0);
  const mod = Math.trunc(Number(l.mod) || 0);
  const total = Number.isFinite(Number(l.total)) ? Math.trunc(Number(l.total)) : face + mod;
  const alvo = l.alvo == null || !Number.isFinite(Number(l.alvo)) ? null : Math.trunc(Number(l.alvo));
  const d = String(l.desfecho || "");
  const veredito = d === "critico" ? "vinte" : d === "desastre" ? "um" : d === "sucesso" ? "passou" : d === "falha" ? "falhou" : "livre";
  const margem = alvo == null ? null : veredito === "passou" || veredito === "vinte" ? Math.max(0, total - alvo) : Math.max(0, alvo - total);
  return Object.freeze({ face, mod, total, alvo, veredito, margem, natural: face === 20 ? 20 : face === 1 ? 1 : null, acima: veredito === "passou" || veredito === "vinte" });
}

/* um misturador inteiro (o mesmo par de multiplicações do resto da casa):
   o fio do teatro nasce do resultado e do número do lance */
function fio(semente) {
  let h = (Math.trunc(Number(semente) || 0) ^ 0x9e3779b9) >>> 0;
  return () => {
    h = Math.imul(h ^ (h >>> 16), 0x45d9f3b) >>> 0;
    h = Math.imul(h ^ (h >>> 16), 0x45d9f3b) >>> 0;
    h = (h ^ (h >>> 16)) >>> 0;
    return h / 4294967296;
  };
}
const sementeDoTeatro = (valor, faces, n) => (Math.trunc(Number(valor) || 0) * 7919) + (Math.trunc(Number(faces) || 20) * 104729) + (Math.trunc(Number(n) || 0) * 1299709);

/* AS FACES QUE PASSAM enquanto o dado rola: [{ em, face }], `em` em ms desde
   o início do rolar. A troca abranda (LANCE.rolar.trocas, a última repete);
   nenhuma face repete a anterior, e a ÚLTIMA é o resultado, mostrada no fim
   do rolar. Determinista: (valor, faces, n). */
export function facesDoRolar({ valor, faces = 20, n = 0, dura = LANCE.rolar.dura } = {}) {
  const lados = Math.max(2, Math.trunc(Number(faces) || 20)) === 100 ? 10 : Math.max(2, Math.trunc(Number(faces) || 20));
  const fim = Math.max(0, Math.trunc(Number(valor) || 1));
  const f = fio(sementeDoTeatro(fim, faces, n));
  const trocas = LANCE.rolar.trocas;
  const seq = [];
  let em = 0, i = 0, antes = null;
  while (em < dura) {
    let face = 1 + Math.floor(f() * lados);
    if (face === antes) face = (face % lados) + 1;
    seq.push({ em, face });
    antes = face;
    em += trocas[Math.min(i, trocas.length - 1)];
    i += 1;
  }
  /* a penúltima nunca é já o resultado (senão o pouso não muda nada) */
  const ult = seq.length - 1;
  if (ult >= 0 && seq[ult].face === fim) {
    let face = (fim % lados) + 1;
    if (ult > 0 && face === seq[ult - 1].face) face = (face % lados) + 1;
    seq[ult] = { em: seq[ult].em, face };
  }
  seq.push({ em: dura, face: fim });
  return seq;
}

/* O GIRO: quanto o dado roda no rolar (graus, de giro → 0), e para que lado
   — também do resultado. Fica em ±LANCE.rolar.giro ± 90. */
export function giroDoRolar({ valor, faces = 20, n = 0 } = {}) {
  const f = fio(sementeDoTeatro(valor, faces, n) + 17);
  const lado = f() < 0.5 ? -1 : 1;
  return lado * (LANCE.rolar.giro + Math.round((f() - 0.5) * 180));
}

/* O TEMPO DO LANCE: quando cada estado começa (ms desde o toque em «Rolar»).
   `mod` dá a soma (o bónus conta de unidade em unidade, até ao teto);
   `narrou` = a narração já chegou no pouso (a soma colapsa); `teto` = o
   terceiro quique (a narração ainda não chegou no fim do rolar);
   `reduzido` = tudo em LANCE.semMovimento. */
export function tempoDoLance({ mod = 0, narrou = false, teto = false, reduzido = false } = {}) {
  if (reduzido) {
    const v = LANCE.semMovimento;
    return Object.freeze({ saindo: 0, rolando: 0, pousado: 0, somando: 0, veredito: 0, esperando: v, face: 0, fim: v });
  }
  const sair = LANCE.sair.dura;
  const rolar = Math.min(LANCE.rolar.dura + (teto ? LANCE.rolarTeto : 0), LANCE.vooTeto - sair);
  const pousado = sair + rolar;
  const somando = pousado + LANCE.pousar.dura;
  const m = Math.abs(Math.trunc(Number(mod) || 0));
  const soma = narrou ? LANCE.soma.colapsada : Math.min(LANCE.soma.teto, LANCE.soma.bonus + (m ? LANCE.soma.passo * m : 0));
  const veredito = somando + soma;
  const esperando = veredito + LANCE.veredito;
  return Object.freeze({ saindo: 0, rolando: sair, pousado, somando, veredito, esperando, face: somando, fim: esperando });
}

/* A SOMA EM LETRA QUE CONTA: os passos do número que o jogador vê entre a
   face e o total («13», «14»), um por unidade do bónus, até ao teto de
   passos que cabe em LANCE.soma.teto. Sem bónus, só a face. */
export function passosDaSoma(face, mod = 0) {
  const v = Math.trunc(Number(face) || 0), m = Math.trunc(Number(mod) || 0);
  if (!m) return [v];
  const cabem = Math.max(1, Math.floor((LANCE.soma.teto - LANCE.soma.bonus) / LANCE.soma.passo));
  const n = Math.min(Math.abs(m), cabem);
  const out = [v];
  for (let i = 1; i <= n; i++) out.push(i === n ? v + m : v + Math.round((m * i) / n));
  return out;
}

/* O QUADRO DO VOO: os keyframes (só transform) do dado da bandeja ao centro
   da arena — de (dx, dy) até (0, 0) —, com os quiques de LANCE.rolar e o
   giro do resultado. `offset` em [0, 1] do voo inteiro (sair + rolar). */
export function quadrosDoVoo({ dx = 0, dy = 0, giro = LANCE.rolar.giro, escalaDe = 0.475, teto = false } = {}) {
  const S = LANCE.sair, R = LANCE.rolar;
  const voo = S.dura + R.dura + (teto ? LANCE.rolarTeto : 0);
  const o = (ms) => Math.round((ms / voo) * 1000) / 1000;
  const [q1, q2] = R.quiques;
  const tr = (x, y, r, sx = 1, sy = 1) => `translate(${Math.round(x)}px, ${Math.round(y)}px) rotate(${Math.round(r)}deg) scale(${sx}, ${sy})`;
  const q = [
    { offset: 0, transform: tr(dx, dy, 0, escalaDe, escalaDe) },
    { offset: o(S.dura), transform: tr(dx * 0.35, dy * 0.35 - S.sobe, S.gira + giro * 0.15, 1, 1) },
    { offset: o(S.dura + R.dura * 0.30), transform: tr(0, 0, giro * 0.45, 1, 0.94) },
    { offset: o(S.dura + R.dura * 0.48), transform: tr(0, -q1, giro * 0.25, 1, 1) },
    { offset: o(S.dura + R.dura * 0.66), transform: tr(0, 0, giro * 0.1, 1, 0.94) },
    { offset: o(S.dura + R.dura * 0.80), transform: tr(0, -q2, giro * 0.03, 1, 1) },
    { offset: o(S.dura + R.dura), transform: tr(0, 0, 0, 1, 1) },
  ];
  if (teto) {
    q.splice(q.length - 1, 0, { offset: o(S.dura + R.dura + LANCE.rolarTeto * 0.5), transform: tr(0, -LANCE.quiqueDoTeto, 0, 1, 1) });
    q[q.length - 1] = { offset: 1, transform: tr(0, 0, 0, 1, 1) };
  }
  return q;
}

/* O QUE O LEITOR DE ECRÃ OUVE, uma vez, no fim: «Percepção: 14 contra 13,
   passou». */
const PALAVRA = Object.freeze({ passou: "passou", falhou: "falhou", vinte: "20 natural, passou", um: "1 natural, falhou", livre: "" });
export function fraseDoVeredito(lance, rotulo = "") {
  const v = vereditoDoLance(lance);
  const nome = String(rotulo || (lance && lance.rotulo) || "").trim();
  const conta = v.alvo == null ? `${v.total}` : `${v.total} contra ${v.alvo}`;
  return [nome ? `${nome}: ${conta}` : conta, PALAVRA[v.veredito]].filter(Boolean).join(", ");
}

/* A LETRA DO VEREDITO na página (PASSOU / FALHOU, e a margem em palavras) */
export const PALAVRAS_DO_LANCE = Object.freeze({
  passou: "PASSOU", falhou: "FALHOU", vinte: "20 NATURAL", um: "1 NATURAL",
  precisa: "PRECISA DE", por: (n) => `por ${n}`, faltaram: (n) => (n === 1 ? "faltou 1" : `faltaram ${n}`),
  pede: "O MESTRE PEDE UM DADO", rola: "O MESTRE ROLA", escreve: "o Mestre escreve…",
  rolar: "ROLAR", mudar: "Mudar de ideia", continuar: "Continuar", refazer: "Refazer",
  fio: "POR UM FIO", paga: "e paga", porUmFio: "por um fio",
});
