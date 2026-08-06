/* ============================================================
   REGRAS 5e (v8.1) — Taverna
   A camada que faltava: proficiência, curva de XP oficial,
   escalas de tempo e dádivas épicas. Tudo tabela; a IA só narra.
   ============================================================ */

/* ---------------- PROFICIÊNCIA ----------------
   No 5e o bônus de um herói não vem só do atributo: soma a
   PROFICIÊNCIA, que cresce com o nível e chega a +6. Era isso que
   faltava — um mago 20 com Intelecto +5 rola +11 no que domina,
   não +5. */
export function bonusProficiencia(nivel) {
  const n = nivel || 1;
  if (n >= 17) return 6;
  if (n >= 13) return 5;
  if (n >= 9) return 4;
  if (n >= 5) return 3;
  return 2;
}

/* Atributo-chave da classe (e perícias afins) ganham proficiência. */
export const ATRIBUTO_CHAVE_CLASSE = {
  "Guerreiro": "forca", "Bárbaro": "forca", "Monge": "destreza", "Ladino": "destreza",
  "Caçador": "percepcao", "Mago": "intelecto", "Druida": "intelecto", "Engenheiro": "intelecto",
  "Invocador": "intelecto", "Clérigo": "presenca", "Bardo": "presenca", "Feiticeiro": "presenca", "Bruxo": "presenca",
};
export function ehProficiente(classe, attrId) {
  return ATRIBUTO_CHAVE_CLASSE[classe] === attrId;
}

/* Teto de rolagem coerente com o 5e: atributo +5, proficiência +6,
   mais um respiro de itens/efeitos. */
export const MOD_MAX_5E = 14;

/* ---------------- CURVA DE XP (tabela oficial) ----------------
   A curva antiga (nível × 100) fazia o nível 20 chegar cedo demais.
   Esta é a do Player's Handbook: do 17 ao 20 cada degrau custa caro. */
export const XP_ACUMULADO = [
  0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000,
  85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000,
];
export function xpParaNivel(nivel) {
  return XP_ACUMULADO[Math.max(0, Math.min(19, (nivel || 1) - 1))] || 0;
}
export function xpDoProximoNivel(nivel) {
  if ((nivel || 1) >= 20) return null;
  return XP_ACUMULADO[nivel] - XP_ACUMULADO[nivel - 1];
}
/* Nível 20 não para de evoluir: cada 30.000 XP rende uma DÁDIVA ÉPICA. */
export const XP_POR_DADIVA = 30000;

/* ---------------- ESCALAS DE TEMPO (5e) ----------------
   Rodada de combate 6 segundos; turno de exploração de masmorra
   10 minutos; viagem por horas. O relógio do app passa a respeitar. */
export const TEMPO = {
  rodadaCombate: 0.1,     // 6 segundos = 0,1 minuto
  turnoMasmorra: 10,      // exploração cuidadosa, sala a sala
  turnoBuscaMasmorra: 10, // procurar/investigar uma sala
  descansoCurto: 60,
  viagemHora: 60,
  turnoCena: 5,           // conversa/cena comum
};
export function minutosDoContexto(ctx) {
  if (ctx === "combate") return TEMPO.rodadaCombate;
  if (ctx === "masmorra") return TEMPO.turnoMasmorra;
  if (ctx === "viagem") return TEMPO.viagemHora;
  return TEMPO.turnoCena;
}

/* ---------------- DÁDIVAS ÉPICAS ----------------
   Depois do nível 20, o herói recebe uma dádiva a cada 30k XP.
   Grande chance de vir da tabela; pequena chance de o Mestre criar
   uma única para a história daquele herói. */
export const DADIVAS_EPICAS = [
  { id: "combate", nome: "Dádiva do Combate", desc: "Um ataque extra a cada turno — sua velocidade beira o impossível.", efeito: { ataqueExtra: 1 } },
  { id: "resiliencia", nome: "Dádiva da Resiliência", desc: "+40 pontos de vida máxima: o corpo aprendeu a não ceder.", efeito: { vidaMax: 40 } },
  { id: "destino", nome: "Dádiva do Destino", desc: "Uma vez por descanso, refaz qualquer rolagem — o destino te deve favores.", efeito: { rerroll: 1 } },
  { id: "recuperacao", nome: "Dádiva da Recuperação", desc: "Recupera metade da vida ao cair a 0 PV, uma vez por dia.", efeito: { segundoFolego: 1 } },
  { id: "magia", nome: "Dádiva da Magia", desc: "+20 de mana máxima e as conjurações custam 1 PM a menos.", efeito: { manaMax: 20, descontoPM: 1 } },
  { id: "vigor", nome: "Dádiva do Vigor Irreal", desc: "Imune a exaustão, veneno e doença. O cansaço é coisa de mortais.", efeito: { imunidades: ["exaustao", "veneno", "doenca"] } },
  { id: "presenca", nome: "Dádiva da Presença", desc: "+2 em todos os testes sociais; multidões se calam quando você fala.", efeito: { bonusSocial: 2 } },
  { id: "vontade", nome: "Dádiva da Vontade de Ferro", desc: "Vantagem em todas as resistências mentais e contra medo.", efeito: { vantagemMental: true } },
  { id: "passos", nome: "Dádiva dos Passos Longos", desc: "Move-se o dobro e ignora terreno difícil — nada mais te atrasa.", efeito: { movimento: 2 } },
  { id: "sorte", nome: "Dádiva da Sorte Impossível", desc: "Críticos acontecem com 19 ou 20, não só no 20.", efeito: { criticoEm: 19 } },
];
export const CHANCE_DADIVA_UNICA = 0.15; // 15% de o Mestre criar uma exclusiva

export function sortearDadiva(jaTem = []) {
  if (Math.random() < CHANCE_DADIVA_UNICA) return { unica: true };
  const pool = DADIVAS_EPICAS.filter((d) => !jaTem.includes(d.id));
  if (!pool.length) return { unica: true };
  return { unica: false, dadiva: pool[Math.floor(Math.random() * pool.length)] };
}

/* Texto do estado épico para o prompt e a ficha. */
export function resumoEpico(pers) {
  const nv = pers.nivel || 1;
  if (nv < 20) return "";
  const xp = pers.xp || 0;
  const dadivas = (pers.dadivas || []).length;
  return `Nível 20 (ápice mortal) · ${dadivas} ${dadivas === 1 ? "dádiva épica" : "dádivas épicas"} · ${xp}/${XP_POR_DADIVA} XP para a próxima`;
}
