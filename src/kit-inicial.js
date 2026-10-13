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

   Puro, determinístico, sem tocar no que recebe.
   ============================================================ */

import { BASES } from "./loot.js";

/* a arma da classe, pelo nome de base do catálogo (`ARMAS`, itens.js) */
export const KIT_INICIAL = {
  Guerreiro: { arma: "Espada Longa" },
  Clérigo: { arma: "Lança" },
  Ladino: { arma: "Espada Curta" },
  Caçador: { arma: "Arco Curto" },
  Monge: { arma: "Espada Curta" },
  Bardo: { arma: "Rapieira" },
  Mago: { arma: "Cajado de Carvalho" },
  Feiticeiro: { arma: "Varinha Rúnica" },
  Bruxo: { arma: "Adaga" },
  Druida: { arma: "Cajado de Carvalho" },
  Engenheiro: { arma: "Besta Leve" },
  Invocador: { arma: "Orbe de Batalha" },
};

/* A arma de banca da classe, no formato de item do jogo (o de `gerarLoot`
   comum, sem prefixo nem poder), ou `null` quando a classe não tem kit. */
export function armaInicial(classe) {
  const k = typeof classe === "string" && Object.prototype.hasOwnProperty.call(KIT_INICIAL, classe) ? KIT_INICIAL[classe] : null;
  if (!k || !k.arma) return null;
  const b = BASES.arma.find((x) => x.nome === k.arma);
  if (!b) return null;
  return { nome: b.nome, base: b.nome, tipo: "arma", raridade: "comum", atributos: { dano: b.dano }, poderes: [], poder: "", descricao: "" };
}

/* A ficha recém-criada com a arma da classe na mão. Devolve a MESMA ficha
   (por referência) quando não há o que pôr: classe sem kit, ou uma arma
   já empunhada. Lixo volta como veio. */
export function equiparKitInicial(pers) {
  if (!pers || typeof pers !== "object" || Array.isArray(pers)) return pers;
  const eq = pers.equipados && typeof pers.equipados === "object" && !Array.isArray(pers.equipados) ? pers.equipados : {};
  if (eq.arma) return pers;
  const arma = armaInicial(pers.classe);
  if (!arma) return pers;
  return { ...pers, equipados: { ...eq, arma } };
}
