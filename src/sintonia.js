/* ============================================================
   SINTONIZAÇÃO (v9.23) — o teto que faltava no poder do herói

   Todo jogo de loot desenvolve a mesma doença: o herói acumula. Aos
   vinte itens mágicos, cada um somando alguma coisa, ele para de
   escolher — só veste tudo. E aí duas coisas morrem juntas: o item
   novo deixa de ser um acontecimento (é só mais um) e o
   balanceamento vira ficção, porque ninguém consegue prever o que
   um personagem carrega.

   A regra do 5e resolve isso com um teto de TRÊS, e ela é boa por um
   motivo que não é numérico: com três vagas, guardar um item passa a
   ser uma decisão, e decisão é o que transforma tesouro em jogo. O
   quarto anel lendário na mochila é uma pergunta ("qual eu tiro?"),
   não um número.

   O QUE A SINTONIA NÃO TIRA. Espada continua cortando e armadura
   continua protegendo sem sintonia nenhuma — o aço é aço. O que fica
   trancado é o PODER: o efeito nomeado, o bônus de atributo, o
   elemento na lâmina. É a divisão que mantém o item útil sem
   sintonia e cobiçado com ela, e é ela que impede o teto de virar
   "seu equipamento não funciona", que seria punição em vez de
   escolha.
   ============================================================ */

const TIER = { comum: 0, incomum: 1, raro: 2, epico: 3, lendario: 4 };

export const MAX_SINTONIA = 3;

/* Pede sintonia o que tem PODER nomeado ou bônus de atributo de
   personagem — ou seja, o que faz algo além de ser um bom pedaço de
   metal. Uma espada +1 comum não pede; a que queima, sim. */
export function pedeSintonia(item) {
  if (!item || !item.nome) return false;
  if (item.sintoniza === false) return false;
  if (item.sintoniza === true) return true;
  /* v9.80: A RÉGUA É O DEGRAU, NÃO O TEXTO. Enquanto `poder` era enfeite,
     "tem poder escrito" e "é raro" davam quase na mesma. Agora todo item
     de incomum para cima carrega uma linha de poder, e manter a régua
     antiga faria o couro comum ocupar um dos três lugares de sintonia —
     um teto que existe para as peças que MUDAM o jogo. */
  if (item.concede) return true;
  if (Array.isArray(item.poderes) && item.poderes.length && (TIER[item.raridade] || 0) >= 2) return true;
  return (TIER[item.raridade] || 0) >= 2;
}

export function chaveDoItem(item) { return String((item && item.nome) || ""); }

export function garantirSintonia(pers) {
  const equip = [...((pers && pers.equipamento) || []), ...Object.values((pers && pers.equipados) || {})];
  const nomes = new Set(equip.filter(Boolean).map(chaveDoItem));
  const l = Array.isArray(pers && pers.sintonizados) ? pers.sintonizados : [];
  /* item que saiu da mochila perde a sintonia sozinho — sintonia é com a
     coisa, não com a lembrança dela */
  return [...new Set(l.filter((n) => nomes.has(n)))].slice(0, MAX_SINTONIA);
}

export function estaSintonizado(pers, item) {
  if (!pedeSintonia(item)) return true;   // não pede: sempre inteiro
  return garantirSintonia(pers).includes(chaveDoItem(item));
}

/* Os itens que pedem sintonia e estão equipados — é a lista que a
   ficha mostra e onde a decisão acontece. */
export function candidatos(pers) {
  const vistos = new Set();
  const equip = [...Object.values((pers && pers.equipados) || {}), ...((pers && pers.equipamento) || [])];
  return equip.filter((it) => {
    if (!it || !pedeSintonia(it)) return false;
    const k = chaveDoItem(it);
    if (vistos.has(k)) return false;
    vistos.add(k); return true;
  });
}

export function alternarSintonia(pers, nome) {
  const atual = garantirSintonia(pers);
  const item = candidatos(pers).find((i) => chaveDoItem(i) === nome);
  if (!item) return { ok: false, motivo: "esse item não está com você" };
  if (atual.includes(nome)) return { ok: true, sintonizados: atual.filter((n) => n !== nome), acao: "soltou" };
  if (atual.length >= MAX_SINTONIA) return { ok: false, motivo: `você só sustenta ${MAX_SINTONIA} objetos de poder ao mesmo tempo — solte um antes` };
  return { ok: true, sintonizados: [...atual, nome], acao: "sintonizou" };
}

/* Migração e primeira vez: sintoniza sozinho os melhores que já estão
   equipados. Ninguém pode acordar com o equipamento apagado por uma regra
   que não existia quando ele o conquistou. */
export function sintoniaInicial(pers) {
  const eq = Object.values((pers && pers.equipados) || {}).filter((i) => pedeSintonia(i));
  const resto = ((pers && pers.equipamento) || []).filter((i) => pedeSintonia(i));
  return [...eq, ...resto]
    .sort((a, b) => (TIER[b.raridade] || 0) - (TIER[a.raridade] || 0))
    .slice(0, MAX_SINTONIA)
    .map(chaveDoItem);
}

/* ---------------- O QUE FICA TRANCADO ----------------
   Só o poder. `bonusEquip` (regras-jogo) soma `atributos` de tudo que está
   equipado; esta função diz quais desses somam. */
export function atributosValem(pers, item) {
  return estaSintonizado(pers, item);
}

export function poderAtivo(pers, item) {
  if (!item || !String(item.poder || "").trim()) return "";
  return estaSintonizado(pers, item) ? item.poder : "";
}

export function resumoSintoniaPrompt(pers) {
  const s = garantirSintonia(pers);
  const cands = candidatos(pers);
  if (!cands.length) return "";
  const dormentes = cands.filter((i) => !s.includes(chaveDoItem(i))).map((i) => i.nome);
  return `OBJETOS DE PODER (do sistema — ${s.length}/${MAX_SINTONIA} sintonizados): ${s.join(", ") || "nenhum"}.${dormentes.length ? ` DORMENTES (carregados, mas sem poder ativo): ${dormentes.join(", ")}.` : ""} Item dormente ainda serve como arma ou armadura comum — o que está desligado é a magia dele. Nunca descreva o efeito mágico de um item dormente, e nunca sugira que o herói "sinta o poder" de algo que não sintonizou.`;
}

export const SINTONIA_PROMPT = `OBJETOS DE PODER (v9.23):
- O herói só sustenta ${MAX_SINTONIA} itens mágicos ao mesmo tempo. Os demais ficam DORMENTES: continuam sendo aço e couro, mas o poder deles não responde.
- Nunca narre o efeito mágico de um item dormente, nem faça a magia dele "acordar sozinha na hora certa". Se o jogador quiser aquele poder, ele troca a sintonia — e isso acontece no acampamento, pelo sistema.
- Você também nunca concede sintonia, nunca aumenta o teto e nunca cria um item que "não precisa de sintonia" para contornar o limite.`;
