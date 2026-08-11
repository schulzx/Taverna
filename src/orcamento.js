/* ============================================================
   ORÇAMENTO DE ENCONTRO (v9.19) — a unidade de medida que faltava

   O jogo escolhia inimigos por tabela e escalava o PV deles pelo
   nível do herói, mas nunca respondia à pergunta que decide tudo:
   ISSO É JUSTO? Três ogros contra um nível 12 com um companheiro é
   aquecimento ou é morte? Sem essa conta, qualquer ajuste de dano
   ou de PV é chute — e "balanceamento" vira opinião.

   O modelo é o do 5e, adaptado à escala desta casa. Duas ideias
   fazem todo o trabalho:

   1) PESO EM UNIDADES DE HERÓI. Cada criatura vale uma fração do
      que o herói aguenta, e a fração vem da AMEAÇA dela — a mesma
      escala que combate.js já usa para derivar PV (fraco 0.35,
      comum 0.7, competente 1.0, elite 1.6, lendário 2.6). Reusar em
      vez de criar uma segunda tabela evita as duas contarem
      histórias diferentes, que é como nasce o balanceamento
      fantasma.

   2) NÚMERO PESA MAIS QUE SOMA. Seis goblins não são seis vezes um
      goblin: são seis ações por rodada contra as suas duas. É a
      correção mais importante do 5e e a que mais falta em jogo de
      IA, porque o Mestre naturalmente escreve "um bando" sem
      perceber que acabou de dobrar a dificuldade real.

   E uma terceira coisa, que só existe porque o descanso virou
   economia no v9.17: o DIA DE AVENTURA. O sistema soma o que o
   grupo já enfrentou desde a última noite e sabe dizer se ainda há
   fôlego para outra luta. É o que fecha o ciclo — sem orçamento
   diário, "seguimos ou acampamos?" não tem como ser respondido com
   nada além de palpite.
   ============================================================ */

/* ---------------- O PESO DE CADA UM ----------------
   Mesma escala de combate.js, de propósito. Se um dia ela mudar lá,
   tem que mudar aqui — e é melhor que o acoplamento seja explícito
   num comentário do que invisível em dois números que divergem. */
export const PESO_AMEACA = { fraco: 0.35, comum: 0.7, competente: 1.0, elite: 1.6, lendario: 2.6 };

/* A diferença de nível ainda importa, mas pouco: `completarInimigo` já
   escala o PV pelo nível do herói, então o nível declarado da criatura
   diz mais sobre o QUE ela é do que sobre o quanto ela aguenta. Um
   ajuste suave (±25% no extremo) captura o resto sem dobrar a conta. */
export function pesoDe(inimigo, nivelJogador = 1) {
  const base = PESO_AMEACA[inimigo && inimigo.ameaca] || PESO_AMEACA.comum;
  const nv = Number(inimigo && inimigo.nivel) || nivelJogador;
  const gap = Math.max(-8, Math.min(8, nv - (nivelJogador || 1)));
  const ajuste = 1 + gap * 0.03;
  const mortal = Math.max(0.05, base * ajuste);
  /* O GRAU DIVINO ROMPE A ESCALA, e rompe de propósito. Tentei primeiro um
     acréscimo linear (1 + gd × 0.8) e o resultado era absurdo: um deus de
     grau 4 pesava 3.5 unidades, ou seja, três heróis dariam conta dele. Um
     deus não é um monstro grande — é outra categoria de coisa, e a conta
     tem que dizer isso sozinha, senão o sistema autoriza encontros que a
     ficção inteira do jogo trata como impossíveis.

     Por grau, dobra com folga. GD 1 já vale mais que qualquer lendário
     mortal; GD 4 vale mais de vinte heróis, que é o número certo para uma
     luta que só existe no fim do rito de deicídio. */
  const gd = Math.max(0, Math.min(4, Number(inimigo && inimigo.gd) || 0));
  if (!gd) return mortal;
  return Math.max(PESO_AMEACA.lendario, mortal) * Math.pow(2.2, gd);
}

/* ---------------- NÚMERO PESA MAIS QUE SOMA ----------------
   A tabela do 5e, encurtada. O salto grande está entre 1 e 3 porque
   é aí que a economia de ação vira: contra dois, o herói ainda
   escolhe alvo; contra quatro, ele só reage. */
export function multiplicadorDeGrupo(quantos) {
  const n = Math.max(1, Math.floor(quantos) || 1);
  if (n === 1) return 1;
  if (n === 2) return 1.25;
  if (n <= 6) return 1.5;
  if (n <= 10) return 2;
  return 2.5;
}

/* ---------------- O QUE O GRUPO AGUENTA ----------------
   O herói vale 1. Cada companheiro vale 0.6 — menos que um herói
   porque não tem ponto de heroísmo, nem perícia, nem os combos da
   ficha, e porque é o sistema que joga por ele. */
export const VALOR_COMPANHEIRO = 0.6;

export function capacidadeDoGrupo(pers) {
  const comps = ((pers && pers.grupo) || []).filter((g) => g && (g.vida || 0) > 0).length;
  return 1 + comps * VALOR_COMPANHEIRO;
}

/* ---------------- AS FAIXAS ----------------
   Os limiares são por unidade de capacidade. "Mortal" quer dizer o
   que o nome diz: dá para ganhar, mas alguém pode não voltar. */
export const FAIXAS = [
  { id: "trivial", ate: 0.35, icone: "·", rotulo: "Trivial", nota: "aquecimento — custa recursos, não custa medo" },
  { id: "facil", ate: 0.75, icone: "○", rotulo: "Fácil", nota: "resolve-se sem sustos se ninguém fizer besteira" },
  { id: "medio", ate: 1.25, icone: "◐", rotulo: "Médio", nota: "vai doer e vai gastar — é o encontro padrão de um dia" },
  { id: "dificil", ate: 1.9, icone: "●", rotulo: "Difícil", nota: "exige plano, terreno ou recurso queimado" },
  { id: "mortal", ate: Infinity, icone: "☠", rotulo: "Mortal", nota: "dá para vencer, mas alguém pode não voltar" },
];
export function faixaDe(razao) {
  return FAIXAS.find((f) => razao <= f.ate) || FAIXAS[FAIXAS.length - 1];
}

/* ---------------- A AVALIAÇÃO ---------------- */
export function avaliarEncontro(inimigos, pers) {
  const vivos = (inimigos || []).filter((e) => e && !e.derrotado && (e.vida == null || e.vida > 0));
  if (!vivos.length) return null;
  const nivel = (pers && pers.nivel) || 1;
  const bruto = vivos.reduce((s, e) => s + pesoDe(e, nivel), 0);
  const mult = multiplicadorDeGrupo(vivos.length);
  const ajustado = bruto * mult;
  const capacidade = capacidadeDoGrupo(pers);
  const razao = ajustado / capacidade;
  const faixa = faixaDe(razao);
  return {
    quantos: vivos.length, bruto: Number(bruto.toFixed(2)), mult,
    ajustado: Number(ajustado.toFixed(2)), capacidade: Number(capacidade.toFixed(2)),
    razao: Number(razao.toFixed(2)), faixa,
    /* o que a conta custa do dia: um encontro médio é a unidade */
    custoDoDia: Number((razao / 1.0).toFixed(2)),
  };
}

/* ---------------- MONTAR PARA UMA FAIXA ----------------
   O caminho inverso: "quero um encontro difícil com Ogros" → quantos
   ogros? Procura o número que chega mais perto do alvo sem passar da
   faixa seguinte, e nunca devolve zero. */
export function quantosPara(criatura, pers, faixaAlvo = "medio", { max = 12 } = {}) {
  const alvo = FAIXAS.find((f) => f.id === faixaAlvo) || FAIXAS[2];
  const piso = FAIXAS[Math.max(0, FAIXAS.indexOf(alvo) - 1)].ate;
  const meta = (piso + Math.min(alvo.ate, piso * 2 + 0.6)) / 2;
  const capacidade = capacidadeDoGrupo(pers);
  const p = pesoDe(criatura, (pers && pers.nivel) || 1);
  let melhor = 1, melhorErro = Infinity;
  for (let n = 1; n <= max; n++) {
    const razao = (p * n * multiplicadorDeGrupo(n)) / capacidade;
    const erro = Math.abs(razao - meta);
    if (erro < melhorErro) { melhorErro = erro; melhor = n; }
    if (razao > alvo.ate) break;
  }
  return melhor;
}

/* ---------------- O DIA DE AVENTURA ----------------
   Quanto o grupo aguenta entre duas noites. 4 encontros médios é
   menos que o 5e recomenda (6 a 8) porque aqui o grupo é pequeno e
   a campanha é solo: exigir oito lutas por dia faria o jogador
   acampar no meio de todas elas, que é o oposto do que o orçamento
   existe para provocar. */
export const ORCAMENTO_DIA = 4;

export function garantirDia(d) {
  const o = d && typeof d === "object" ? d : {};
  return { gasto: Math.max(0, Number(o.gasto) || 0), lutas: Math.max(0, Math.floor(Number(o.lutas) || 0)) };
}

export function gastarDoDia(dia, custo) {
  const d = garantirDia(dia);
  return { gasto: Number((d.gasto + Math.max(0, custo || 0)).toFixed(2)), lutas: d.lutas + 1 };
}

export function zerarDia() { return { gasto: 0, lutas: 0 }; }

export function folgaDoDia(dia) {
  const d = garantirDia(dia);
  const restante = Math.max(0, ORCAMENTO_DIA - d.gasto);
  const pct = restante / ORCAMENTO_DIA;
  return {
    gasto: d.gasto, lutas: d.lutas, restante: Number(restante.toFixed(2)),
    estado: pct > 0.6 ? "inteiro" : pct > 0.25 ? "gasto" : pct > 0 ? "no osso" : "estourado",
  };
}

/* ---------------- OS TEXTOS ---------------- */
export function selo(av) {
  if (!av) return "";
  return `${av.faixa.icone} Encontro ${av.faixa.rotulo.toLowerCase()} — ${av.faixa.nota}`;
}

/* O que o Mestre precisa saber, e o que ele NÃO precisa. Ele recebe a
   faixa, porque a narração tem que combinar com o perigo real — narrar
   três ogros como "uma escaramuça" quando o sistema diz mortal é a
   forma mais rápida de a ficção mentir sobre as regras. Não recebe os
   números, pelo motivo de sempre: número na boca do Mestre vira
   número na cena. */
export function resumoOrcamentoPrompt(av, dia) {
  if (!av) return "";
  const f = folgaDoDia(dia);
  const cansaco = f.estado === "estourado" ? "O grupo já passou do que aguenta hoje: descreva o esgotamento sem piedade."
    : f.estado === "no osso" ? "O grupo está no fim do fôlego do dia."
    : f.estado === "gasto" ? "O grupo já gastou parte do dia."
    : "";
  return `PESO DESTE ENCONTRO (do sistema): ${av.faixa.rotulo.toUpperCase()} — ${av.faixa.nota}. Calibre a NARRAÇÃO por isto: um encontro trivial não merece prosa de batalha épica, e um mortal não pode soar como escaramuça. ${cansaco} Nunca cite faixa, números, orçamento nem a palavra "encontro" como termo de sistema.`;
}

export const ORCAMENTO_PROMPT = `PESO DOS ENCONTROS (v9.19):
- Toda luta chega com uma FAIXA calculada pelo sistema (trivial, fácil, médio, difícil, mortal). Ela mede o perigo real, contando quantidade — muitos inimigos fracos são mais perigosos que a soma deles.
- Sua narração tem que combinar com a faixa. Não descreva como desespero o que o sistema chamou de trivial, nem como escaramuça o que ele chamou de mortal: quando a prosa e as regras discordam, o jogador para de confiar nas duas.
- Você nunca escolhe quantos inimigos aparecem nem o quão difícil é a luta — quem monta é o sistema. Você narra quem são, de onde vêm e o que querem.`;
