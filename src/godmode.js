/* ============================================================
   MODO CRIATIVO (v9.10) — comandos de teste

   Testar o topo do jogo era impraticável: para ver a ascensão, os
   milagres, a presença divina ou uma cidade dominada, era preciso
   jogar uma campanha inteira até o nível 20. Este arquivo dá as
   chaves do mundo, como o modo criativo do Minecraft.

   Os comandos são digitados no campo de ação e interceptados ANTES
   de qualquer coisa: o Mestre nunca os vê, nenhum token é gasto,
   nenhum turno passa. Começam com "/" para não colidirem jamais
   com uma ação de verdade.

   Este arquivo é só o parser e a tabela — quem MEXE no estado é o
   App, porque o estado mora lá. Assim o que dá para testar sem
   React fica testado sem React.
   ============================================================ */

/* Cada comando: nome, argumentos, o que faz e como se escreve.
   `args` descreve o formato para a ajuda e para a validação. */
export const COMANDOS = [
  { cmd: "ajuda", args: "", grupo: "geral", desc: "lista todos os comandos" },
  { cmd: "nivel", args: "<1-20>", grupo: "ficha", desc: "define o nível (PV/PM e pontos recalculados)" },
  { cmd: "xp", args: "<n>", grupo: "ficha", desc: "soma XP (sobe de nível pela tabela normal)" },
  { cmd: "pontos", args: "<hab|atr> <n>", grupo: "ficha", desc: "dá pontos de habilidade ou de atributo" },
  { cmd: "atributo", args: "<nome> <0-8>", grupo: "ficha", desc: "crava um atributo (forca, destreza, vigor, intelecto, presenca, percepcao)" },
  { cmd: "hab", args: "<nome da habilidade>", grupo: "ficha", desc: "aprende de graça, ignorando pré-requisito" },
  { cmd: "curar", args: "", grupo: "ficha", desc: "PV e PM cheios, condições e exaustão limpas" },
  { cmd: "moedas", args: "<n>", grupo: "ficha", desc: "soma moedas (aceita negativo)" },
  { cmd: "item", args: "<nome>", grupo: "ficha", desc: "põe um item na bolsa" },
  { cmd: "pocao", args: "<id|nome>", grupo: "ficha", desc: "põe um consumível na bolsa (cura_p/m/g, mana_p/m/g, elixir_forca, revigorante…)" },
  { cmd: "heroismo", args: "<0-3>", grupo: "ficha", desc: "crava os pontos de heroísmo" },
  { cmd: "pericia", args: "<nome> <0|1|2>", grupo: "ficha", desc: "0 limpa, 1 treina, 2 torna especialista" },

  { cmd: "gd", args: "<0-4>", grupo: "divino", desc: "crava o Grau de Divindade (desperta se preciso)" },
  { cmd: "fieis", args: "<n>", grupo: "divino", desc: "define o número de fiéis" },
  { cmd: "pf", args: "<n>", grupo: "divino", desc: "define os Pontos de Fé" },
  { cmd: "deus", args: "[gd]", grupo: "divino", desc: "gera uma divindade nova no panteão" },
  { cmd: "rito", args: "", grupo: "divino", desc: "abre o rito de deicídio contra um deus do panteão" },
  { cmd: "templo", args: "[cidade]", grupo: "divino", desc: "ergue um templo seu (padrão: cidade atual)" },

  { cmd: "dominar", args: "[cidade]", grupo: "mundo", desc: "toma a cidade para a sua facção" },
  { cmd: "tp", args: "<cidade>", grupo: "mundo", desc: "te move para a cidade na hora" },
  { cmd: "dia", args: "<+n|n>", grupo: "mundo", desc: "avança ou crava o dia da campanha" },
  { cmd: "hora", args: "<0-23>", grupo: "mundo", desc: "crava a hora do dia" },
  { cmd: "mapa", args: "", grupo: "mundo", desc: "lista o mundo: continentes, regiões e cidades" },
  { cmd: "aqui", args: "", grupo: "mundo", desc: "mostra a base do lugar onde você está (locais, gente, segredos)" },
  { cmd: "chefes", args: "", grupo: "mundo", desc: "lista os chefes gerados neste mundo" },
  { cmd: "relogio", args: "<listar|+ nome|++ id|- id>", grupo: "mundo", desc: "lista, cria, avança ou apaga um relógio de progresso" },

  { cmd: "combate", args: "<criatura> [nivel] [quantos]", grupo: "luta", desc: "abre uma luta contra a criatura pedida" },
  { cmd: "matar", args: "", grupo: "luta", desc: "derruba todos os inimigos do combate atual" },
  { cmd: "companheiro", args: "<nome>", grupo: "luta", desc: "põe alguém no seu grupo, pronto para lutar" },
];

export const GRUPOS = {
  ficha: "Ficha e personagem",
  divino: "Divindade e ascensão",
  mundo: "Mundo, mapa e tempo",
  luta: "Combate e grupo",
  geral: "Geral",
};

/* Reconhece um comando. Devolve null se não for um — e "não é um comando"
   é o caso comum, então isto precisa ser barato e não pegar falso positivo:
   só conta se começar com "/" e o nome existir na tabela. */
export function interpretar(texto) {
  const t = String(texto || "").trim();
  if (!t.startsWith("/")) return null;
  const corpo = t.slice(1).trim();
  if (!corpo) return { cmd: "ajuda", args: [], bruto: "" };
  const partes = corpo.split(/\s+/);
  const nome = partes[0].toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "");
  const ficha = COMANDOS.find((c) => c.cmd === nome);
  if (!ficha) return { cmd: null, desconhecido: nome, args: [], bruto: corpo };
  return { cmd: nome, ficha, args: partes.slice(1), bruto: corpo.slice(partes[0].length).trim() };
}

/* Número com sinal: "5" → {valor:5}, "+5" → {valor:5, relativo:true} */
export function lerNumero(txt, padrao = null) {
  const s = String(txt == null ? "" : txt).trim();
  if (!s) return { valor: padrao, relativo: false, ok: padrao != null };
  const rel = s.startsWith("+") || s.startsWith("-");
  const n = Number(s);
  if (!Number.isFinite(n)) return { valor: padrao, relativo: false, ok: false };
  return { valor: n, relativo: rel, ok: true };
}

export function textoDeAjuda() {
  const porGrupo = new Map();
  for (const c of COMANDOS) {
    if (!porGrupo.has(c.grupo)) porGrupo.set(c.grupo, []);
    porGrupo.get(c.grupo).push(c);
  }
  const linhas = ["⚡ MODO CRIATIVO — comandos de teste (o Mestre não vê nada disto; não gasta turno nem tokens)"];
  for (const [g, cs] of porGrupo) {
    linhas.push(`\n${GRUPOS[g] || g}`);
    for (const c of cs) linhas.push(`  /${c.cmd}${c.args ? ` ${c.args}` : ""} — ${c.desc}`);
  }
  linhas.push("\nExemplos: /nivel 20 · /gd 4 · /dominar · /combate Dragão Ancião · /tp Aldoria · /dia +7 · /pocao cura_g");
  return linhas.join("\n");
}

export function textoDesconhecido(nome) {
  const perto = COMANDOS.map((c) => c.cmd).filter((c) => c.startsWith(String(nome || "").slice(0, 2)));
  return `⚡ "/${nome}" não existe.${perto.length ? ` Você quis dizer: ${perto.map((p) => `/${p}`).join(", ")}?` : ""} Use /ajuda para ver tudo.`;
}

/* ---------------- APLICADORES PUROS ----------------
   O que dá para resolver sem tocar em React fica aqui, testado. */

/* Nível cravado: recalcula PV/PM pela mesma progressão do jogo normal
   (+6 PV e +4 PM por nível) e credita os pontos que aquele nível daria. */
export function cravarNivel(pers, alvo, { pontosNoNivel, pontosAtributoNoNivel }) {
  const nv = Math.max(1, Math.min(20, Math.round(alvo)));
  const atual = Math.max(1, pers.nivel || 1);
  if (nv === atual) return { pers, ganhoHab: 0, ganhoAtr: 0, delta: 0 };
  const delta = nv - atual;
  let ganhoHab = 0, ganhoAtr = 0;
  if (delta > 0) {
    for (let n = atual + 1; n <= nv; n++) { ganhoHab += pontosNoNivel(n); ganhoAtr += pontosAtributoNoNivel(n); }
  } else {
    /* descer devolve o que aquele trecho tinha dado — sem ficar negativo */
    for (let n = nv + 1; n <= atual; n++) { ganhoHab -= pontosNoNivel(n); ganhoAtr -= pontosAtributoNoNivel(n); }
  }
  const vidaMax = Math.max(6, (pers.vidaMax || 10) + delta * 6);
  const manaMax = Math.max(4, (pers.manaMax || 8) + delta * 4);
  return {
    delta, ganhoHab, ganhoAtr,
    pers: {
      ...pers, nivel: nv, xp: 0, vidaMax, manaMax, vida: vidaMax, mana: manaMax,
      pontosHab: Math.max(0, (pers.pontosHab || 0) + ganhoHab),
      pontosAtr: Math.max(0, (pers.pontosAtr || 0) + ganhoAtr),
    },
  };
}

/* GD cravado: o grau vem de `grausGanhos`, que já é o caminho do deicídio —
   assim o god mode usa a MESMA porta que o jogo usa, e não uma paralela. */
export function cravarGD(divindade, gd, { grausPorFieis }) {
  const alvo = Math.max(0, Math.min(4, Math.round(gd)));
  const fieisMin = grausPorFieis(alvo);
  return {
    ...divindade,
    despertar: alvo > 0 ? true : divindade.despertar,
    grausGanhos: alvo,
    fieis: Math.max(divindade.fieis || 0, fieisMin),
  };
}

export const GODMODE_AVISO = "⚡ Modo criativo — alteração direta da ficha, sem passar pelo Mestre.";
