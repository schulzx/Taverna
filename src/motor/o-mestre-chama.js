/* ============================================================
   O MESTRE CHAMA O DADO (Fase MC, MC2 · 10/11/2026)

   A 18.ª sessão: a luta já era jogo; os dados fora dela eram ritual. A
   frase do jogador virava teste, o dado rolava sozinho, e o resultado
   chegava dentro da narração — o jogador nunca via o momento em que podia
   perder. Numa mesa, entre a frase e o dado há uma linha: «Sobrevivência.
   Precisa de 14. Se a chuva apagou o rasto, perdes meia hora.» É essa
   linha que faz o dado pesar.

   ESTE MÓDULO É ESSA LINHA, E SÓ ELA. Não lê a frase (isso é `lerAcao`,
   desafios.js), não rola (isso é a bandeja, depois do toque) e não narra.
   Recebe o veredito que o catálogo já deu e decide duas coisas:

   1. SE o Mestre chama. A régua contra o dado-ritual (QUANDO_O_MESTRE_CHAMA,
      §2.3 da planta): não chama onde não há obstáculo, onde o bónus já
      decidiu, onde o mundo respondeu NÃO antes do dado, na luta (que tem o
      seu d20 e a sua previsão) nem na conversa (que não se rola).
   2. O QUE a linha diz: a perícia (o nome da ficha), o número a bater, e o
      preço de falhar — a linha de CUSTO_DE_FALHAR do alvo, com o `aviso` e
      a etiqueta `efeito` que a suíte prova serem o que a falha cobra.

   A CD é a do veredito, número por número: o chamado não a mexe, e por isso
   a linha nunca mente sobre o dado que vem. A busca com e sem achado tem a
   mesma CD (desafios.js, §2.6) — o número não denuncia o segredo.

   Puro, sem React, sem relógio, sem sorte: o mesmo veredito e o mesmo
   contexto dão sempre o mesmo chamado. Quem o liga é o App (MC3), entre a
   frase e a chamada do Narrador.
   ============================================================ */

import { custoPorAlvo, dificuldadePorId, mordidaDoDegrau, EFEITOS_DA_FALHA } from "../desafios.js";
import { periciaPorId, resolucaoAutomatica } from "../pericias.js";
import { nomeDoAtributo } from "../testes.js";

/* ---------------- A LINHA ----------------
   `molde`: o que o Mestre diz, nesta ordem e só isto. `{porque}` é a
   situação que pesou na CD (SITUACAO_DA_CD: «com a chuva», «no escuro»),
   e só aparece quando pesou.
   `esperaSozinho`: com a preferência «o Mestre rola por mim», o tempo de
   ler a linha antes de o dado se lançar sozinho (ms).
   `tetoDoAviso`: o comprimento máximo da frase do preço — uma linha, numa
   tela de 375 px.
   `ordemDoAviso`: que variante do aviso vence quando o contexto liga mais
   de uma (a chuva diz mais do que a noite, a noite mais do que a cidade). */
export const O_CHAMADO = Object.freeze({
  molde: "{pericia}. Precisa de {dc}{porque}. {aviso}",
  glifo: "dado",
  dado: "d20",
  rolar: "Rolar",
  recuo: "mudar de ideia",
  esperaSozinho: 2600,
  tetoDoAviso: 60,
  ordemDoAviso: Object.freeze(["chuva", "noite", "cidade"]),
  /* a queda: 1d6 por cada dado de queda (desafios.js, quedaDe) */
  facesDaQueda: 6,
});

/* ---------------- QUANDO O MESTRE NÃO CHAMA ----------------
   A régua de §2.3. A primeira linha que cala decide, e diz porquê e o que
   acontece em vez do chamado. Todas devolvem o turno ao caminho de hoje —
   nenhuma inventa um caminho novo.
   `ctx.emCombate`: a mesa está em luta.
   `ctx.bonus`: o bónus total do herói na perícia (bonusDePericia), se o
     App o souber; sem ele, a régua do automático não cala.
   `ctx.mundoDisseNao`: o oráculo respondeu NÃO à pergunta do teste
     (`v.oportunidade`) — perguntado ANTES do chamado. */
export const QUANDO_O_MESTRE_CHAMA = Object.freeze([
  Object.freeze({
    id: "naoETeste", porque: "o catálogo não viu obstáculo (livre, já revirado, já tentado, não se pede)",
    emVez: "o turno de hoje: narra-se acontecendo, ou o «já revirei»",
    cala: (v) => !v || typeof v !== "object" || v.tipo !== "teste",
  }),
  Object.freeze({
    id: "luta", porque: "a luta tem o seu d20 e a sua previsão",
    emVez: "o tabuleiro",
    cala: (v, ctx) => !!ctx.emCombate,
  }),
  Object.freeze({
    id: "conversa", porque: "conversa não se rola; ler quem fala, sim",
    emVez: "o turno normal, com a escada do pedido",
    cala: (v) => !!v.social,
  }),
  Object.freeze({
    id: "trivial", porque: "não há obstáculo",
    emVez: "narra-se acontecendo",
    cala: (v) => !(Number(v.dc) > (dificuldadePorId("trivial") || { dc: 5 }).dc),
  }),
  Object.freeze({
    id: "automatico", porque: "o bónus torna o resultado certo",
    emVez: "sucesso ou falha automáticos, como hoje",
    cala: (v, ctx) => typeof ctx.bonus === "number" && Number.isFinite(ctx.bonus) && resolucaoAutomatica(ctx.bonus, Number(v.dc)) !== null,
  }),
  Object.freeze({
    id: "mundoDisseNao", porque: "não se rola contra o que não existe",
    emVez: "o envelope do vazio (envelopeSemOportunidade)",
    cala: (v, ctx) => ctx.mundoDisseNao === true,
  }),
]);

const obj = (x) => x && typeof x === "object" && !Array.isArray(x);

/* Porque é que o Mestre NÃO chama este veredito, ou null se chama. */
export function porQueNaoChama(v, ctx) {
  const c = obj(ctx) ? ctx : {};
  for (const r of QUANDO_O_MESTRE_CHAMA) {
    try { if (r.cala(v, c)) return r.id; } catch { return r.id; }
  }
  return null;
}

/* A variante do aviso que o contexto pede. */
function avisoDoContexto(aviso, contexto) {
  if (typeof aviso === "string") return aviso;
  if (!obj(aviso)) return "";
  const c = obj(contexto) ? contexto : {};
  for (const k of O_CHAMADO.ordemDoAviso) if (c[k] && typeof aviso[k] === "string") return aviso[k];
  return typeof aviso.base === "string" ? aviso.base : "";
}

/* O dado do preço, quando a falha morde: a mordida pelo degrau
   (MORDIDA_POR_DEGRAU) ou a queda (1d6 por dado). Só o da falha SECA, que é
   o que o aviso diz. */
function dadoDoPreco(c, v) {
  const p = c && c.peleSeca;
  if (!p) return null;
  if (p.queda && v.queda) return `${Math.max(1, Number(v.queda.dados) || 1)}d${O_CHAMADO.facesDaQueda}`;
  if (p.mordida) return `${Math.max(1, Number(p.mordida) || 1)}d${mordidaDoDegrau(v.dc).faces}`;
  return null;
}

/* ---------------- O CHAMADO ----------------
   `v`: o veredito de `lerAcao`.
   `ctx`: { emCombate, bonus, mundoDisseNao, contexto: { chuva, noite, cidade } }.
   Devolve null (o Mestre não chama: o turno segue como hoje) ou
   { pericia, periciaNome, dc, aviso, efeito, dado, chave, linha, porque }. */
export function oChamado(v, ctx) {
  const c = obj(ctx) ? ctx : {};
  if (porQueNaoChama(v, c)) return null;
  const custo = custoPorAlvo(v.alvoDoCusto != null ? v.alvoDoCusto : v.alvo);
  /* todo chamado tem aviso: sem linha de custo, não há preço a dizer, e o
     Mestre não chama — o teste rola como hoje */
  const situacoes = Array.isArray(v.situacoes) ? v.situacoes : [];
  /* a situação que pesou na CD também escolhe o aviso: a chuva que subiu o
     número é a chuva que apaga a trilha — uma fonte só, e as duas não se
     desmentem mesmo que o App só passe uma delas */
  const pesou = (id) => situacoes.some((s) => s && s.id === id);
  const contexto = { ...(obj(c.contexto) ? c.contexto : {}) };
  if (pesou("chuva")) contexto.chuva = true;
  if (pesou("escuro")) contexto.noite = true;
  const aviso = custo ? avisoDoContexto(custo.aviso, contexto) : "";
  if (!aviso || !custo.efeito) return null;
  const per = v.pericia ? periciaPorId(v.pericia) : null;
  const periciaNome = (per && per.nome) || nomeDoAtributo(v.atributo || "percepcao");
  const dc = Number(v.dc);
  const porque = situacoes.map((s) => s && s.diz).filter(Boolean).join(" e ");
  const linha = O_CHAMADO.molde
    .replace("{pericia}", periciaNome)
    .replace("{dc}", String(dc))
    .replace("{porque}", porque ? `, ${porque}` : "")
    .replace("{aviso}", aviso);
  const efeito = EFEITOS_DA_FALHA.some((e) => e.id === custo.efeito) ? custo.efeito : "fecha";
  return Object.freeze({
    pericia: v.pericia || "",
    periciaNome,
    dc,
    aviso,
    efeito,
    dado: Object.freeze({ teste: O_CHAMADO.dado, preco: dadoDoPreco(custo, v) }),
    chave: String(v.chave || ""),
    linha,
    porque,
  });
}
