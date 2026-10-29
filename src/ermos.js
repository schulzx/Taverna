/* ============================================================
   EXPLORAÇÃO DE ERMOS (v8.5) — Taverna
   Viajar deixa de ser gratuito. Suprimentos que acabam, ritmo de
   marcha que decide o que você vê e quem te vê, forrageamento,
   navegação (dá para se perder) e exaustão em seis níveis, como
   no 5e. Tudo por tabela; a IA só narra o que o sistema entrega.
   ============================================================ */
import { sorteDaCasa } from "./semente.js";
import { BIOMA_ROTULO } from "./geografia.js";

const d = (n) => 1 + Math.floor(sorteDaCasa() * n);

/* o último degrau da exaustão: seis níveis, como no 5e (o sexto mata) */
const EXAUSTAO_MAXIMA = 6;

/* ---------------- SUPRIMENTOS ---------------- */
export const SUPRIMENTOS = {
  racoes: { nome: "Rações de viagem", icone: "🥖", preco: 5, desc: "Comida seca para um dia." },
  agua:   { nome: "Odres de água",    icone: "💧", preco: 2, desc: "Água para um dia." },
  tochas: { nome: "Tochas",           icone: "🕯", preco: 1, desc: "Uma hora de luz cada." },
  kit:    { nome: "Kit de viagem",    icone: "🎒", preco: 25, desc: "Corda, saco de dormir, pederneira, panela." },
};

export function garantirSuprimentos(s) {
  const o = s && typeof s === "object" ? s : {};
  return { racoes: o.racoes || 0, agua: o.agua || 0, tochas: o.tochas || 0, kit: !!o.kit };
}

/* Consumo diário: uma ração e uma água por boca (herói + companheiros). */
export function consumoDiario(tamanhoGrupo) {
  return { racoes: Math.max(1, tamanhoGrupo), agua: Math.max(1, tamanhoGrupo) };
}

export function consumirDia(sup, tamanhoGrupo) {
  const s = garantirSuprimentos(sup);
  const c = consumoDiario(tamanhoGrupo);
  const faltaComida = Math.max(0, c.racoes - s.racoes);
  const faltaAgua = Math.max(0, c.agua - s.agua);
  return {
    suprimentos: { ...s, racoes: Math.max(0, s.racoes - c.racoes), agua: Math.max(0, s.agua - c.agua) },
    faltaComida, faltaAgua,
    /* sede castiga mais rápido que fome, como no 5e */
    exaustao: (faltaAgua > 0 ? 1 : 0) + (faltaComida > 0 ? 1 : 0),
    msgs: [
      ...(faltaComida > 0 ? [`🥖 Comida acabou — ${faltaComida} boca(s) passam fome hoje.`] : []),
      ...(faltaAgua > 0 ? [`💧 Água acabou — ${faltaAgua} boca(s) passam sede hoje.`] : []),
    ],
  };
}

/* O DIA QUE SE COME, NA FICHA (29/10, a 13.ª sessão). O botão do descanso
   longo anunciava «2 rações e 2 águas» (`consumoDiario`) e a mochila
   acordava com 10/10: o App descontava numa escrita funcional do estado
   da ficha e, linhas abaixo, o mesmo descanso gravava a ficha inteira — a
   de antes da comida —, e a última escrita ganhava. A conta passa a ser
   uma só e a devolver a ficha: quem chama segue com ela.

     comerODia(pers, bocas) → { pers, msgs, consumo } — os suprimentos
       menos `consumoDiario(bocas)` (até zero), a exaustão (sobe na fome e
       na sede, desce um degrau com comida e água), e as linhas do sistema.
   Pura; a ficha recebida fica. */
export function comerODia(pers, bocas) {
  const p = pers && typeof pers === "object" ? pers : {};
  const exAntes = Number(p.exaustao) || 0;
  const cd = consumirDia(p.suprimentos, bocas);
  const comeuEBebeu = cd.faltaComida === 0 && cd.faltaAgua === 0;
  const exaustao = comeuEBebeu ? recuperarExaustao(exAntes, true) : Math.min(EXAUSTAO_MAXIMA, exAntes + cd.exaustao);
  const msgs = cd.msgs.length ? cd.msgs : exAntes > 0 ? ["🍲 Comida quente e água limpa — um nível de exaustão vai embora."] : [];
  return { pers: { ...p, suprimentos: cd.suprimentos, exaustao }, msgs, consumo: consumoDiario(bocas) };
}

/* ---------------- RITMO DE VIAGEM (5e) ---------------- */
export const RITMOS_VIAGEM = [
  { id: "lento",  nome: "Lento",  icone: "🐢", kmDia: 18, percepcao: 5,  furtivo: true,  desc: "Devagar e atento — dá para viajar furtivamente." },
  { id: "normal", nome: "Normal", icone: "🚶", kmDia: 24, percepcao: 0,  furtivo: false, desc: "O passo padrão de uma caravana." },
  { id: "rapido", nome: "Rápido", icone: "🏃", kmDia: 30, percepcao: -5, furtivo: false, desc: "Cobre mais chão, mas você repara em menos." },
];
export function ritmoViagem(id) { return RITMOS_VIAGEM.find((r) => r.id === id) || RITMOS_VIAGEM[1]; }

/* Marcha forçada: além de 8 horas, cada hora extra pede resistência. */
export function marchaForcada(horasExtras, modVigor) {
  const out = [];
  for (let h = 1; h <= (horasExtras || 0); h++) {
    const cd = 10 + h;
    const rolo = d(20) + (modVigor || 0);
    out.push({ hora: h, cd, rolo, passou: rolo >= cd });
  }
  return { testes: out, exaustao: out.filter((t) => !t.passou).length };
}

/* ---------------- NAVEGAÇÃO: dá para se perder ---------------- */
export const CD_NAVEGACAO = { planicie: 10, costa: 10, colina: 12, floresta: 15, montanha: 15, deserto: 15, pantano: 15, gelo: 17 };

/* v9.40: perder-se e caçar comida dependem do TERRENO, e cada molde tem os
   seus. As três tabelas antigas (viagem, navegação, abundância) viraram
   campos do bioma no molde — aqui a gente só pergunta, com as tabelas
   medievais como rede quando o molde não conhece o bioma. */
function fichaDoBioma(bioma, molde) {
  const bs = (molde && molde.biomas) || [];
  return bs.find((b) => b.id === bioma) || null;
}
export function rotuloDeBioma(bioma, molde) {
  const f = fichaDoBioma(bioma, molde);
  return (f && f.rotulo) || BIOMA_ROTULO[bioma] || bioma;
}

export function testarNavegacao(bioma, modSobrevivencia, temMapa, molde = null) {
  const f = fichaDoBioma(bioma, molde);
  const cd = ((f && f.cd) || CD_NAVEGACAO[bioma] || 12) - (temMapa ? 5 : 0);
  const rolo = d(20) + (modSobrevivencia || 0);
  const passou = rolo >= cd;
  return {
    cd, rolo, passou,
    texto: `Navegação em ${rotuloDeBioma(bioma, molde)}: d20+${modSobrevivencia || 0} = ${rolo} vs ${cd} → ${passou ? "rota mantida" : "vocês se perdem"}`,
    horasPerdidas: passou ? 0 : d(4) + 1,
  };
}

/* ---------------- FORRAGEAMENTO ---------------- */
export const ABUNDANCIA = { planicie: 12, floresta: 10, colina: 12, costa: 10, montanha: 15, pantano: 15, deserto: 20, gelo: 20 };

export function forragear(bioma, modSobrevivencia, molde = null) {
  const f = fichaDoBioma(bioma, molde);
  const cd = (f && f.abundancia) || ABUNDANCIA[bioma] || 14;
  const rolo = d(20) + (modSobrevivencia || 0);
  if (rolo < cd) return { achou: false, racoes: 0, agua: 0, cd, rolo, texto: `Forrageamento em ${rotuloDeBioma(bioma, molde)}: ${rolo} vs ${cd} — a terra não deu nada hoje.` };
  const racoes = d(6) + Math.max(0, modSobrevivencia || 0);
  const agua = d(6) + Math.max(0, modSobrevivencia || 0);
  return { achou: true, racoes, agua, cd, rolo, texto: `Forrageamento: ${rolo} vs ${cd} — +${racoes} rações e +${agua} de água.` };
}

/* ---------------- EXAUSTÃO (6 níveis do 5e) ---------------- */
export const EXAUSTAO = [
  { n: 0, efeito: "" },
  { n: 1, efeito: "Desvantagem em testes de perícia" },
  { n: 2, efeito: "Velocidade reduzida à metade" },
  { n: 3, efeito: "Desvantagem em ataques e resistências" },
  { n: 4, efeito: "Vida máxima reduzida à metade" },
  { n: 5, efeito: "Velocidade reduzida a zero" },
  { n: 6, efeito: "Morte" },
];
export function efeitoExaustao(nivel) {
  const n = Math.max(0, Math.min(6, nivel || 0));
  return { nivel: n, efeito: EXAUSTAO[n].efeito, desvantagemPericia: n >= 1, desvantagemCombate: n >= 3, vidaMetade: n >= 4, morte: n >= 6 };
}

/* Um descanso longo com comida e água remove um nível. */
export function recuperarExaustao(nivel, comeuEBebeu) {
  return comeuEBebeu ? Math.max(0, (nivel || 0) - 1) : (nivel || 0);
}

/* ---------------- RESUMO PARA O PROMPT ---------------- */
export function resumoErmos(sup, exaustao, ritmoId, tamanhoGrupo) {
  const s = garantirSuprimentos(sup);
  const c = consumoDiario(tamanhoGrupo);
  const dias = Math.min(Math.floor(s.racoes / c.racoes), Math.floor(s.agua / c.agua));
  const r = ritmoViagem(ritmoId);
  const ex = efeitoExaustao(exaustao);
  return `SUPRIMENTOS: ${s.racoes} rações, ${s.agua} água, ${s.tochas} tochas${s.kit ? ", kit de viagem" : " (SEM kit de viagem)"} — dá para ${dias} dia(s) de viagem com ${tamanhoGrupo} boca(s). Marcha ${r.nome.toLowerCase()} (${r.kmDia} km/dia).${ex.nivel ? ` EXAUSTÃO nível ${ex.nivel}: ${ex.efeito} — mostre isso na ficção (tremor, respiração curta, erros bobos).` : ""}${dias <= 1 ? " ATENÇÃO: os suprimentos estão no fim — a fome e a sede devem pesar na narrativa." : ""}`;
}
