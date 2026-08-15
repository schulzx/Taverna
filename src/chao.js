/* ============================================================
   O CHÃO (v9.41) — o que fica caído onde a cena aconteceu

   POR QUE ISTO PRECISOU EXISTIR. Até aqui, o espólio de uma luta ia
   direto para a bolsa e o jogador lia uma linha contando o que tinha
   ganhado. Funcionava enquanto o sistema fosse o único a dar coisas.
   Deixou de funcionar no momento em que a ficção também dava: o Mestre
   narrava "no cinto do morto há um elixir", o jogador escrevia "pego o
   elixir", e o elixir não existia em lugar nenhum — nem na bolsa, nem
   no mundo. A promessa ficava com quem narrou e a conta com quem
   jogou.

   Então o espólio ganha um lugar ANTES da bolsa. Cai no chão, com nome,
   dono e — quando há tabuleiro — quadrado. O jogador abre, olha e
   escolhe. É o "examinar" do Baldur's Gate: segurar a tecla e ver, de
   uma vez, tudo o que dá para catar num raio.

   O QUE NÃO VEM PARA CÁ: moeda e XP. Os dois são abstratos, ninguém
   deixa moeda no chão de propósito e obrigar um clique para pegá-la
   seria pedágio puro. Eles continuam entrando sozinhos.

   E O MESTRE NÃO ENTREGA NADA. Ele descreve o que o sistema pôs no
   chão; quem credita é o código, no clique do jogador. Um item que o
   Mestre mencionar e não estiver aqui simplesmente não existe — e o
   jogador vê isso na lista, que é a única fonte.
   ============================================================ */

/* Raio do exame, em metros. Nove é o passo de um turno: o que dá para
   catar é o que daria para alcançar andando. Fora de combate não há
   tabuleiro, e aí "perto" é a cena inteira. */
export const RAIO_EXAME = 9;
export const LIMITE_CHAO = 40;

let contador = 0;
const novoId = () => `ch${Date.now().toString(36)}${(contador = (contador + 1) % 100000).toString(36)}`;

export function criarChao() {
  return { cena: "", itens: [] };
}

export function garantirChao(c) {
  if (!c || !Array.isArray(c.itens)) return criarChao();
  return { cena: String(c.cena || ""), itens: c.itens.filter(Boolean) };
}

/* ---------------- O QUE CAI ----------------
   Cada achado guarda `pronto`: o objeto EXATO que entra na ficha quando
   alguém o pega. Assim pegar não recalcula nada — é mover de lugar. */
export function achadoDeEquipamento(item, { de = "", x = null, y = null } = {}) {
  if (!item || !item.nome) return null;
  const at = item.atributos || {};
  const detalhe = [
    at.dano ? `+${at.dano} de dano` : "",
    at.defesa ? `+${at.defesa} de defesa` : "",
    at.elemento ? `dano de ${at.elemento}` : "",
  ].filter(Boolean).join(" · ");
  return {
    id: novoId(), especie: "equipamento", nome: item.nome, icone: "✦",
    raridade: item.raridade || "comum", detalhe, de, x, y, qtd: 1,
    destino: "equipamento", pronto: item,
  };
}

export function achadoDeConsumivel(cons, pronto, { de = "", x = null, y = null } = {}) {
  if (!cons || !pronto) return null;
  return {
    id: novoId(), especie: "consumivel", nome: cons.nome, icone: cons.icone || "🧪",
    raridade: cons.raridade || "comum", detalhe: cons.desc || "", de, x, y, qtd: 1,
    destino: "inventario", pronto,
  };
}

export function achadoDeComponente(comp, pronto, { de = "", x = null, y = null } = {}) {
  if (!comp || !pronto) return null;
  return {
    id: novoId(), especie: "componente", nome: comp.nome, icone: comp.icone || "🧺",
    raridade: "comum", detalhe: comp.desc || "matéria-prima para a bancada", de, x, y, qtd: 1,
    destino: "inventario", pronto,
  };
}

/* ---------------- PÔR E TIRAR ---------------- */
export function porNoChao(chao, novos, { cena = null } = {}) {
  const c = garantirChao(chao);
  const lista = (Array.isArray(novos) ? novos : [novos]).filter(Boolean);
  if (!lista.length) return c;
  return {
    cena: cena != null ? String(cena) : c.cena,
    itens: [...c.itens, ...lista].slice(-LIMITE_CHAO),
  };
}

export function tirarDoChao(chao, ids) {
  const c = garantirChao(chao);
  const alvo = new Set((Array.isArray(ids) ? ids : [ids]).filter(Boolean));
  const pegos = c.itens.filter((i) => alvo.has(i.id));
  return { chao: { ...c, itens: c.itens.filter((i) => !alvo.has(i.id)) }, pegos };
}

/* A cena mudou (outro lugar, outro dia)? O que ficou para trás fica
   para trás — senão o chão vira um inventário paralelo que segue o
   herói pelo mundo. */
export function varrerSeMudou(chao, cena) {
  const nova = String(cena || "");
  /* devolve o MESMO objeto quando nada muda — quem chama compara por
     identidade para não redesenhar a tela a cada turno */
  if (chao && Array.isArray(chao.itens) && chao.cena === nova) return chao;
  const c = garantirChao(chao);
  if (!c.cena) return { ...c, cena: nova };
  if (c.cena === nova) return c;
  return { cena: nova, itens: [] };
}

/* ---------------- O RAIO ----------------
   Distância de mesa (Chebyshev em quadrados de 1,5 m), a mesma do grid.
   Sem posição do herói — ou sem posição do achado — tudo está perto:
   fora de combate a cena não tem tabuleiro e o raio não significa nada. */
export function distanciaAte(item, heroi) {
  if (!item || item.x == null || !heroi || heroi.x == null) return 0;
  return Math.max(Math.abs(item.x - heroi.x), Math.abs(item.y - heroi.y)) * 1.5;
}

export function pertoDaqui(chao, heroi, raioM = RAIO_EXAME) {
  const c = garantirChao(chao);
  return c.itens.filter((i) => distanciaAte(i, heroi) <= raioM);
}

export function quantosPerto(chao, heroi, raioM = RAIO_EXAME) {
  return pertoDaqui(chao, heroi, raioM).length;
}

/* ---------------- OS TEXTOS ---------------- */
export function linhaDoAchado(item) {
  if (!item) return "";
  const onde = item.de ? ` — de ${item.de}` : "";
  return `${item.icone} ${item.nome}${onde}`;
}

export function resumoDoChao(itens = []) {
  if (!itens.length) return "";
  return itens.map((i) => `${i.icone} ${i.nome}`).join(", ");
}

/* O envelope de quem catou. É fato consumado: o Mestre descreve o gesto,
   não decide o resultado — e sobretudo não "entrega" nada de novo. */
export function envelopeDoRecolhimento(pegos = []) {
  if (!pegos.length) return "";
  const lista = pegos.map((p) => `${p.nome}${p.de ? ` (de ${p.de})` : ""}`).join(", ");
  return `[RECOLHIMENTO — JÁ APLICADO PELO SISTEMA] Eu me abaixei e recolhi: ${lista}. Isso já está comigo, na minha bolsa. NÃO envie "adicionar_itens" nem "adicionar_equipamento" por isso, não mude o que eu peguei e não invente um item a mais no meio. Narre só o gesto e o que a cena mostra de quem ficou para trás.`;
}

export function envelopeDoQueFicou(itens = []) {
  if (!itens.length) return "";
  return `[NO CHÃO — FATO DO SISTEMA] Ainda há coisa caída perto de mim: ${resumoDoChao(itens)}. Se a cena passar por perto, você pode MENCIONAR o que está no chão, mas não me entregue nada: quem pega sou eu, pelo sistema.`;
}

export const CHAO_PROMPT = `O QUE ESTÁ NO CHÃO (v9.41):
- Espólio de luta e coisa largada não entram sozinhos na bolsa do herói: ficam CAÍDOS no lugar, e é ele quem se abaixa e recolhe, pelo sistema.
- Você NUNCA entrega item. Não diga "você encontra uma poção no cinto dele" a menos que o envelope liste essa poção no chão — e mesmo aí, quem a pega é o jogador, não a sua narração.
- Se ele disser que examina, que revista o corpo ou que pega alguma coisa, descreva o gesto e a cena. O sistema mostra a lista e credita o que ele escolher; não invente conteúdo de bolso, de baú nem de cadáver.
- Moedas e experiência continuam automáticas — essas o sistema já creditou e você não deve mencionar em números.`;
