/* ============================================================
   O KIT INICIAL (S10b, 13/10 — a 10.ª sessão de prova)

   A heroína da 10.ª sessão era uma Guerreira, e entrou na primeira luta
   SEM ARMA. Não era a tela (a grade nem desenha arma): a ficha de Uma Vida
   nasce, na tela de criação, com `equipados: {}` — e não só a Guerreira:
   TODAS as doze classes. Sem arma, `danoDaArma` (itens.js) devolve 1d2,
   «desarmado»: a «mestre das armas» dava socos. Os oito prontos das outras
   mesas nasciam armados (`montarPronto`, prontos.js); a campanha principal
   era a única que não.

   A regra: toda classe começa com a arma da classe EMPUNHADA. A arma de
   cada uma está nesta tabela, escolhida no que a classe sabe usar
   (`PROFICIENCIAS`, itens.js — a suíte confere com `avaliarEquipar` que
   nenhuma nasce com penalidade) e no que ela é: a espada do Guerreiro, o
   arco do Caçador, a rapieira do Bardo, o cajado do Mago e do Druida
   (madeira: o druida não toca metal). A peça é a de banca comum, a mesma
   que a forja vende (o dano é o da base, `BASES.arma` de loot.js): nem
   melhor nem pior que o primeiro achado.

   SÓ A CAMPANHA NOVA. Isto é chamado na criação da ficha e em mais lado
   nenhum — nunca no load: a ficha de um save existente fica com o que
   tem (se a heroína vendeu a espada, a espada não volta). E nunca troca
   uma arma que já está na mão (o pronto, a herança).

   A ARMADURA DA CLASSE (31/10, a 13.ª sessão de prova). A Guerreira da
   13.ª nasceu armada e NUA: defesa 11 (10 + a destreza), a mesma de uma
   maga, e três Ratos Gigantes — o encontro «fraco» da casa — derrubavam-na
   numa luta em cada cinco sozinha. Os oito prontos das outras mesas nascem
   vestidos (cenario-padrao.js: a Muralha em Cota de Malha, a Flecha em
   Couro Batido, o Remendo em Brigantina, a Sombra e a Voz em Gibão), e o
   Livro do Jogador do 5e dá cota de malha ao guerreiro, couro ao ranger, ao
   ladino, ao bardo, ao bruxo e ao druida, e escamas ao clérigo: a campanha
   principal era, de novo, a única que não. A peça é a de banca comum
   (`BASES.armadura`, loot.js — a defesa é a da forja), escolhida no que a
   classe veste sem penalidade (`PROFICIENCIAS`, itens.js: a suíte confere
   com `avaliarEquipar`) e no que ela é — o Druida em couro, que não toca
   metal. Monge, Mago, Feiticeiro e Invocador não vestem armadura nenhuma
   (o Monge luta sem ela; os outros três não sabem usá-la), e ficam como
   estavam.
   Medido na régua permanente (teste-kit-inicial.mjs §5, 1000 sementes, a
   Guerreira da 13.ª com as aflições do inimigo): três ratos com o
   companheiro, 5,0% → 2,8% de quedas; sozinha, 20,2% → 12,7%; dois
   Bandidos com ele, 26,8% → 21,5%; três (o encontro mortal) continuam a
   derrubá-la em 64,4%. O fraco deixa de ser uma moeda ao ar, e o mortal
   continua mortal.
   Cada peça só entra na mão VAZIA: a herança de uma espada não tira a cota,
   e uma armadura já vestida fica.

   Puro, determinístico, sem tocar no que recebe.
   ============================================================ */

import { BASES } from "./loot.js";

/* a arma da classe, pelo nome de base do catálogo (`ARMAS`, itens.js), e a
   armadura, pelo de `BASES.armadura` (loot.js) — quem não a tem não veste */
export const KIT_INICIAL = {
  Guerreiro: { arma: "Espada Longa", armadura: "Cota de Malha" },
  Clérigo: { arma: "Lança", armadura: "Brigantina" },
  Ladino: { arma: "Espada Curta", armadura: "Gibão de Couro" },
  Caçador: { arma: "Arco Curto", armadura: "Couro Batido" },
  Monge: { arma: "Espada Curta" },
  Bardo: { arma: "Rapieira", armadura: "Gibão de Couro" },
  Mago: { arma: "Cajado de Carvalho" },
  Feiticeiro: { arma: "Varinha Rúnica" },
  Bruxo: { arma: "Adaga", armadura: "Gibão de Couro" },
  Druida: { arma: "Cajado de Carvalho", armadura: "Gibão de Couro" },
  Engenheiro: { arma: "Besta Leve", armadura: "Couro Batido" },
  Invocador: { arma: "Orbe de Batalha" },
};
const doKit = (classe) => (typeof classe === "string" && Object.prototype.hasOwnProperty.call(KIT_INICIAL, classe) ? KIT_INICIAL[classe] : null);

/* A arma de banca da classe, no formato de item do jogo (o de `gerarLoot`
   comum, sem prefixo nem poder), ou `null` quando a classe não tem kit. */
export function armaInicial(classe) {
  const k = doKit(classe);
  if (!k || !k.arma) return null;
  const b = BASES.arma.find((x) => x.nome === k.arma);
  if (!b) return null;
  return { nome: b.nome, base: b.nome, tipo: "arma", raridade: "comum", atributos: { dano: b.dano }, poderes: [], poder: "", descricao: "" };
}

/* A armadura de banca da classe, no mesmo formato (o dos prontos, com a
   defesa da forja), ou `null` quando a classe não veste nenhuma. */
export function armaduraInicial(classe) {
  const k = doKit(classe);
  if (!k || !k.armadura) return null;
  const b = BASES.armadura.find((x) => x.nome === k.armadura);
  if (!b) return null;
  return { nome: b.nome, base: b.nome, tipo: "armadura", raridade: "comum", atributos: { defesa: b.defesa }, poderes: [], poder: "", descricao: "" };
}

/* A ficha recém-criada com a arma da classe na mão e a armadura dela no
   corpo — cada peça só onde o lugar está vazio. Devolve a MESMA ficha (por
   referência) quando não há o que pôr: classe sem kit, ou as duas já
   equipadas. Lixo volta como veio. */
export function equiparKitInicial(pers) {
  if (!pers || typeof pers !== "object" || Array.isArray(pers)) return pers;
  const eq = pers.equipados && typeof pers.equipados === "object" && !Array.isArray(pers.equipados) ? pers.equipados : {};
  const arma = eq.arma ? null : armaInicial(pers.classe);
  const armadura = eq.armadura ? null : armaduraInicial(pers.classe);
  if (!arma && !armadura) return pers;
  return { ...pers, equipados: { ...eq, ...(arma ? { arma } : {}), ...(armadura ? { armadura } : {}) } };
}
