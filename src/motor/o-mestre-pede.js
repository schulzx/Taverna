/* ============================================================
   O MESTRE PEDE O DADO (04/11/2026)

   A pessoa: «precisamos de uma forma de o sistema acionar o dado mais
   vezes, quase não está pedindo rolagem de dados, um rpg precisa de
   constantes rolagens pra ter o sentimento que você está jogando e
   arriscando algo».

   O defeito medido: o dado só nascia quando a FRASE do jogador batia no
   catálogo (`desafios.js`). Quem joga a conversar e a andar — e é assim
   que se joga — passava sessões inteiras sem rolar. Numa mesa de verdade
   o Mestre não espera a frase certa: ao entrares, «rola Percepção»; ao
   ouvires alguém, «rola Intuição».

   ESTE MÓDULO É ESSE GESTO, E SÓ ELE. Não inventa regra nem teste: o que
   ele pede é uma FRASE que o catálogo já julga («Olho em volta com
   atenção.», «Leio as intenções de Gareth.»), e quem decide a
   perícia, a CD, se há o que achar (o oráculo) e o que o sucesso dá é o
   caminho de sempre — `lerAcao`, o Véu, o envelope. A suíte prova que cada
   frase pedida é um teste do catálogo, e não uma rolagem que ninguém
   sabe resolver.

   O pedido chega como o cartão da proposta (a mesma peça), com o dado e o
   número antes do toque. O jogador rola ou diz «Agora não»; o pedido não
   volta para o mesmo sítio, ou a mesma pessoa, no mesmo dia.
   ============================================================ */

export const O_MESTRE_PEDE = Object.freeze({
  /* a ordem é a prioridade: a conversa que está viva ganha da sala */
  pedidos: Object.freeze([
    Object.freeze({ id: "intencao", frase: (q) => `Leio as intenções de ${q}.`, verbo: (q) => `Ler as intenções de ${q}` }),
    Object.freeze({ id: "chegada", frase: () => "Olho em volta com atenção.", verbo: () => "Olhar à volta" }),
  ]),
  /* CB2 (09/11): O SINAL DA ESTRADA. Não entra em `pedidos` — esses são os
     que o Mestre pede quando a mesa está parada, e a estrada continua a
     calar para eles (`naEstrada`). Este pede-o o ENCONTRO
     (`encontro-na-estrada.js`): há um rasto, um som, uma sombra, e o Mestre
     diz «rola Percepção». A frase é um teste do catálogo (Percepção, a
     suíte prova-o), como todas as desta tabela; a CD é a do sinal. */
  sinal: Object.freeze({ id: "sinal", frase: () => "Presto atenção ao que vem pela estrada.", verbo: () => "Ler os sinais da estrada" }),
  confirmar: "Rolar",
  recuo: "Agora não",
  /* o glifo do cartão (a tabela de glifos é da peça) */
  glifo: "dado",
});

const limpo = (x) => String(x == null ? "" : x).trim();

/* A chave de um pedido: o que ele pede, onde (ou a quem) e em que dia.
   É ela que impede o Mestre de pedir duas vezes a mesma coisa. */
export function aChaveDoPedido(id, { onde = "", quem = "", dia = 0 } = {}) {
  return [id, limpo(onde).toLowerCase(), limpo(quem).toLowerCase(), Number(dia) || 0].join("|");
}

/* O que o Mestre pede agora, ou nada.
   `ocupado`: há teste à espera, proposta na mesa, o Mestre a falar, morte.
   `onde`: o sítio (ou a cidade) onde o herói está; sem ele, nada de chegada.
   `falouCom`: o nome de quem está aqui e a quem a última frase falou —
     conversa, não ato (a conversa não se rola; ler quem fala, sim).
   `jaPedidos`: as chaves já pedidas (aceites ou recusadas). */
export function oQueOMestrePede({ emCombate = false, ocupado = false, naEstrada = false, naMasmorra = false, onde = "", falouCom = "", dia = 0, jaPedidos = [] } = {}) {
  if (emCombate || ocupado || naEstrada || naMasmorra) return null;
  const ja = new Set(Array.isArray(jaPedidos) ? jaPedidos : []);
  const sitio = limpo(onde);
  for (const p of O_MESTRE_PEDE.pedidos) {
    if (p.id === "intencao") {
      const quem = limpo(falouCom);
      if (!quem) continue;
      const chave = aChaveDoPedido(p.id, { quem, dia });
      if (ja.has(chave)) continue;
      return Object.freeze({ id: p.id, chave, frase: p.frase(quem), verbo: p.verbo(quem), quem });
    }
    if (p.id === "chegada") {
      if (!sitio) continue;
      const chave = aChaveDoPedido(p.id, { onde: sitio, dia });
      if (ja.has(chave)) continue;
      return Object.freeze({ id: p.id, chave, frase: p.frase(), verbo: p.verbo(), onde: sitio });
    }
  }
  return null;
}

/* O cartão do pedido, na forma da proposta da frase. `v` é o veredicto do
   catálogo para a frase pedida (`lerAcao`); sem teste — o lugar já foi
   revirado, a pessoa já foi lida, a mesa recusa —, não há cartão: o Mestre
   não pede o que o jogo não sabe resolver. `mod` é o bónus do herói, e
   `pericia` o nome dela como a ficha o diz. */
export function oCartaoDoPedido(pedido, v, { mod = 0, pericia = "" } = {}) {
  if (!pedido || !v || v.tipo !== "teste") return null;
  const dc = Number(v.dc);
  if (!Number.isFinite(dc)) return null;
  const m = Math.round(Number(mod) || 0);
  const preco = `d20 ${m < 0 ? "−" : "+"} ${Math.abs(m)}`;
  const nome = limpo(pericia);
  return Object.freeze({
    id: `pedido:${pedido.chave}`,
    frase: pedido.frase,
    tipo: "dado", glifo: O_MESTRE_PEDE.glifo,
    verbo: pedido.verbo,
    confirmar: O_MESTRE_PEDE.confirmar,
    recuo: O_MESTRE_PEDE.recuo,
    preco,
    linhas: Object.freeze([`${nome ? nome + " · " : ""}precisa de ${dc}`]),
    efeitos: Object.freeze([]),
    pedido: true, chave: pedido.chave,
    dados: Object.freeze({}),
  });
}
