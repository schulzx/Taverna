/* ============================================================
   A FICHA DA CRIAÇÃO (V5, 16/11/2026) — Taverna

   A conta que transforma as escolhas da criação na ficha do herói. Era um
   objeto escrito dentro do `onClick` de «ENTRAR NA TAVERNA» no App; saiu
   para cá SEM mudar um campo, para que os dois caminhos — a criação
   antiga (que a sala de dois ainda usa) e a mesa nova do F3 — façam a
   MESMA ficha. A suíte (teste-criacao-da-mesa.mjs) guarda uma cópia do
   objeto antigo e compara campo a campo.

   `escolhas`: { nome, sobrenome, sexo, conceito, historia, raca, classe,
   subclasse, profissao, antecedenteId, pontos, numeroDaSorte }.
   `numeroDaSorte` é o número que a semente da ficha leva no fim (a tela
   antiga tirava-o da sorte da casa; a mesa tira-o da semente da mesa).
   ============================================================ */

import { classePorNome, racaPorNome, habilidadesIniciais } from "./classes.js";
import { antecedentePorId, ANTECEDENTES } from "./antecedentes.js";
import { ATRIBUTOS, MOEDAS_INICIAIS } from "./constantes.js";
import { periciasIniciais } from "./pericias.js";
import { comDom } from "./tracos.js";
import { equiparKitInicial } from "./kit-inicial.js";

export function montarFicha(escolhas) {
  const e = escolhas && typeof escolhas === "object" ? escolhas : {};
  const nome = String(e.nome || "").trim();
  const sobrenome = String(e.sobrenome || "").trim();
  const nomeInteiro = [nome, sobrenome].filter(Boolean).join(" ");
  const conceito = String(e.conceito || "").trim();
  const antObj = antecedentePorId(e.antecedenteId) || ANTECEDENTES[0];
  const cObj = classePorNome(e.classe);
  const rObj = racaPorNome(e.raca);
  const pontos = e.pontos || {};
  const attrFinais = Object.fromEntries(ATRIBUTOS.map((a) => [a.id, (pontos[a.id] || 0) + ((rObj?.bonus || {})[a.id] || 0)]));
  const vidaMax = (cObj?.vidaBase || 10) + attrFinais.vigor * 2;
  const manaMax = (cObj?.manaBase || 8) + attrFinais.intelecto * 2;
  const habsIniciais = habilidadesIniciais(e.classe).map((h) => ({ nome: h.nome, custo: h.custo, descricao: h.descricao }));
  return equiparKitInicial(comDom({
    genero: e.sexo, feicoesFixas: true,
    nome: nomeInteiro, primeiroNome: nome, sobrenome,
    conceito, historia: String(e.historia || "").trim(),
    raca: e.raca, classe: e.classe, subclasse: e.subclasse, profissao: e.profissao,
    antecedente: antObj.nome, antecedenteGancho: antObj.gancho,
    semente: `${nomeInteiro}|${conceito}|${Math.floor(Number(e.numeroDaSorte) || 0)}`,
    atributos: attrFinais, vida: vidaMax + (antObj.pv || 0), vidaMax: vidaMax + (antObj.pv || 0), mana: manaMax + (antObj.pm || 0), manaMax: manaMax + (antObj.pm || 0),
    baseAtributos: { ...attrFinais }, pontosAtr: 0, atributosVersao: 1,
    nivel: 1, xp: 0, moedas: MOEDAS_INICIAIS + (antObj.moedas || 0), nivelPendentes: 0,
    inventario: antObj.item ? [antObj.item] : [], habilidades: habsIniciais, grupo: [],
    efeitos: [], condicoes: [], equipamento: [], equipados: {},
    pericias: periciasIniciais({ classe: e.classe, antecedente: antObj.nome }), periciasVersao: 1,
  }));
}
