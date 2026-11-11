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

   MC6 (11/11, Fase MC) · O MESTRE PEDE ONDE HÁ O QUE ACHAR. A 18.ª sessão
   viu quatro ofertas iguais de «Olhar à volta» em 26 turnos, uma a cada
   deslocação: sítio novo = chave nova = oferta nova, e nada perguntava se o
   sítio tinha alguma coisa. E a oferta COMIA o dado do jogador: o sucesso
   vazio fechava o lugar (`fechaDepois`, desafios.js) com a chave da busca,
   e a seguir «procuro o que o Largo esconde» dava `vasculhado` sem rolar
   (a planta, §1.1). Duas regras novas:
     · a chegada pergunta se HÁ o que achar (`haOQueAchar`: um achável aqui,
       ou o segredo de um passo da quest — a-quest-manda.js). Havendo, pede;
       não havendo, pede uma vez em `vazioUmEm`, por sorte semeada pela
       semente e pela chave (o mesmo sítio no mesmo dia dá sempre a mesma
       resposta), e nunca duas vazias seguidas no mesmo dia (a lista de
       pedidos só guarda o que se pediu, não os sítios por onde se passou:
       «seguidas» conta-se pelo dia, senão um mundo sem nada para achar
       calava a oferta para sempre depois da primeira). A uma-em-N existe para que a
       oferta não denuncie o segredo: se só aparecesse onde há, aparecer
       seria a resposta (§2.3);
     · a oferta tem CHAVE PRÓPRIA no livro de tentativas
       (`oVereditoDaOferta`): o que ela revira fica marcado como dela, e os
       verbos do jogador (examinar, investigar, procurar, lembrar) continuam
       a rolar no mesmo sítio.
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
  /* MC6: a oferta em sítio sem nada para achar — uma em N — e as marcas das
     chaves: a da oferta vazia (no livro de pedidos, para nunca haver duas
     seguidas) e a da tentativa da oferta (no livro de tentativas) */
  vazioUmEm: 4,
  marcaVazia: "vazia",
  marcaDaOferta: "oferta",
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
/* MC6: `haOQueAchar` — true (há achável ou segredo de passo aqui), false
   (não há), null (quem chama não sabe: a régua de antes, pede sempre).
   `semente`: a do mundo, para a sorte da oferta vazia; `sorte`, quando
   dada, manda em vez dela (a suíte). */
const ehVazia = (k) => typeof k === "string" && k.endsWith(`|${O_MESTRE_PEDE.marcaVazia}`);
/* o dia de uma chave vazia: `chegada|onde|quem|dia|vazia` (aChaveDoPedido) */
const diaDaChave = (k) => { const ps = String(k).split("|"); return Number(ps[ps.length - 2]) || 0; };
function sorteDaOferta(semente, chave, sorte) {
  if (typeof sorte === "function") { const x = Number(sorte()); return Number.isFinite(x) ? x : 1; }
  /* FNV-1a da semente e da chave: o mesmo sítio, no mesmo dia, no mesmo
     mundo, dá sempre a mesma resposta — pedir de novo não é rolar de novo */
  let h = 2166136261;
  for (const ch of `${semente == null ? "" : semente}|oferta|${chave}`) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; }
  return h / 4294967296;
}
export function oQueOMestrePede(opcoes) {
  const o = opcoes && typeof opcoes === "object" ? opcoes : {};
  const { emCombate = false, ocupado = false, naEstrada = false, naMasmorra = false, onde = "", falouCom = "", dia = 0, jaPedidos = [], haOQueAchar = null, semente = "", sorte = null } = o;
  if (emCombate || ocupado || naEstrada || naMasmorra) return null;
  const lista = Array.isArray(jaPedidos) ? jaPedidos : [];
  const ja = new Set(lista);
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
      const chaveVazia = `${chave}|${O_MESTRE_PEDE.marcaVazia}`;
      if (ja.has(chave) || ja.has(chaveVazia)) continue;
      if (haOQueAchar === false) {
        /* nunca duas vazias seguidas: nenhuma vazia pedida neste dia */
        if (lista.some((k) => ehVazia(k) && k.startsWith(`${p.id}|`) && diaDaChave(k) === (Number(dia) || 0))) continue;
        if (sorteDaOferta(semente, chave, sorte) >= 1 / O_MESTRE_PEDE.vazioUmEm) continue;
        return Object.freeze({ id: p.id, chave: chaveVazia, frase: p.frase(), verbo: p.verbo(), onde: sitio, vazia: true });
      }
      return Object.freeze({ id: p.id, chave, frase: p.frase(), verbo: p.verbo(), onde: sitio });
    }
  }
  return null;
}

/* MC6 · A CHAVE DA OFERTA. O veredito da frase pedida (`lerAcao`) com a
   chave da tentativa marcada como da oferta: o que a oferta revira e fecha
   (`fechaDepois`, o `limpo`) fica no livro de tentativas com esta chave, e
   a busca, o exame e a memória que o jogador declarar depois no mesmo sítio
   têm a chave deles, abertos. Sem veredito de teste, o veredito como veio. */
export function oVereditoDaOferta(v) {
  if (!v || typeof v !== "object" || v.tipo !== "teste" || typeof v.chave !== "string" || !v.chave) return v;
  const marca = `|${O_MESTRE_PEDE.marcaDaOferta}`;
  return v.chave.endsWith(marca) ? v : { ...v, chave: `${v.chave}${marca}`, oferta: true };
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
