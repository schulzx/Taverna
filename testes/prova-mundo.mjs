/* A prova de olho: um mundo de caçadores e fendas, com equipamento,
   afixos e profissões todos vindos do léxico. Não é teste — é olhar. */
import { garantirLexico, temEquipamentoProprio, temAfixosProprios, chamadoDaProfissao, PROFISSOES_DO_SISTEMA } from "../src/lexico.js";
import { gerarLoot } from "../src/loot.js";
import { fichaDoItem } from "../src/itens.js";

const F = {
  arma_leve_uma: ["canivete de fenda", "estilete de aço", "bisturi de campo"],
  arma_simples_uma: ["cano de ferro", "bastão retrátil", "pé de cabra"],
  arma_simples_dist: ["zarabatana de ar", "funda de rolamento", "lança-dardos"],
  arma_marcial_uma: ["faca de caça longa", "machado de bombeiro", "facão de mato"],
  arma_marcial_duas: ["marreta de demolição", "serra elétrica", "motosserra de poda"],
  arma_marcial_dist: ["fuzil de caça", "balestra industrial", "arpão pneumático"],
  foco_uma: ["lanterna de fenda", "ampola de resíduo", "cristal de núcleo"],
  foco_duas: ["bastão de sondagem", "antena portátil", "vara de medição"],
  escudo: ["tampa de bueiro", "placa de riot", "porta de aço cortada"],
  armadura_panos: ["macacão de mecânico", "jaqueta de couro", "moletom grosso"],
  armadura_leve: ["colete tático", "sobretudo grosso", "casaco de patrulha"],
  armadura_media: ["colete balístico", "peitoral de placas", "jaqueta com kevlar"],
  armadura_pesada: ["traje de contenção", "exoesqueleto", "blindagem de lacrador"],
  elmo: ["capacete de riot", "capacete de moto", "máscara de solda"],
  botas: ["coturno reforçado", "botas de borracha", "bota de bombeiro"],
  anel: ["anel de sinal", "aliança de aço", "aro de identificação"],
  amuleto: ["crachá lacrado", "pingente de núcleo", "corrente com chapa"],
};
const A = {
  grau0: ["usado", "remendado", "sujo", "descartável"],
  grau1: ["reforçado", "calibrado", "de patrulha", "homologado"],
  grau2: ["blindado", "com núcleo", "selado", "de contenção"],
  grau3: ["de lacrador", "experimental", "de elite", "irradiado"],
  grau4: ["de travessia única", "do Primeiro Portão", "de núcleo vivo", "proscrito"],
  sufixos: ["do Setor 9", "da Travessia", "do Vazamento", "de Membrana", "da Superintendência", "do Último Turno", "da Fenda Aberta"],
};
const P = [
  ["Ferreiro", "mecânico de equipamento"], ["Alquimista", "químico de resíduo"],
  ["Herborista", "coletor de esporos"], ["Cartógrafo", "mapeador de fenda"],
  ["Escriba", "despachante de contrato"], ["Cozinheiro", "cozinheiro de alojamento"],
  ["Joalheiro", "avaliador de núcleo"], ["Curtidor", "processador de carcaça"],
  ["Minerador", "escavador de entulho"], ["Caçador de Recompensas", "caçador por contrato"],
  ["Mercador", "corretor de créditos"], ["Médico de Campo", "enfermeiro de contenção"],
].map(([profissao, chamado]) => ({ profissao, chamado }));

const lex = garantirLexico({ equipamento: F, afixos: A, profissoes: P });

console.log("equipamento: " + temEquipamentoProprio(lex) + " · afixos: " + temAfixosProprios(lex) + " · profissões: " + lex.profissoes.length + "/12\n");

console.log("=== A FICHA ===");
for (const n of PROFISSOES_DO_SISTEMA) console.log("  " + n.padEnd(24) + " → " + chamadoDaProfissao(lex, n));

console.log("\n=== A BANCA ===");
for (const r of ["comum", "incomum", "raro", "epico", "lendario"]) {
  for (let i = 0; i < 3; i++) {
    const x = gerarLoot(r, { nivel: 10, lex });
    const f = fichaDoItem(x);
    console.log("  " + r.padEnd(9) + x.nome.padEnd(52) + "| " + String(f.rotulo + (f.mao === 2 ? " · 2 mãos" : "")).padEnd(30) + "| " + x.base);
  }
}

console.log("\n=== E SEM LÉXICO, O CATÁLOGO DE SEMPRE ===");
for (const r of ["comum", "lendario"]) for (let i = 0; i < 2; i++) console.log("  " + r.padEnd(9) + gerarLoot(r, { nivel: 10 }).nome);
