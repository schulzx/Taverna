/* ============================================================
   DÁDIVAS ÉPICAS (v9.32) — a bênção que existe na ficha

   O relato que originou este arquivo: "recebi uma dádiva chamada
   Sopro do Abismo mas não apareceu nada, nem em habilidades nem em
   ascensão" e "apareceu 'dádiva épica: Dádiva do Destino' e eu não
   entendi como usar, nem ficou claro se aconteceu algo".

   Dois furos diferentes, com a mesma cara:

   1. A DÁDIVA ÚNICA dependia do Mestre. O sistema sorteava "única"
      em 15% das vezes e mandava um envelope PEDINDO que ele criasse
      a bênção e a registrasse via "adicionar_habilidades". Quando ele
      narrava e esquecia de registrar — e ele esquece —, o jogador
      lia o nome de uma dádiva que não existia em lugar nenhum. Era
      a última decisão mecânica que ainda morava na narração.

   2. As DEZ DA TABELA tinham efeito escrito e nenhum código atrás.
      Só vidaMax e manaMax eram aplicados na hora da concessão; o
      ataque extra, o crítico em 19, o refazer, o segundo fôlego, as
      imunidades, o desconto de PM — tudo isso era texto bonito. A
      ficha dizia uma coisa e o dado fazia outra.

   Aqui as duas coisas viram código. A única é GERADA PELO SISTEMA,
   com nome próprio e número real, e o Mestre recebe o nome pronto
   para narrar. As dez ganham leitores puros que o App consulta na
   hora de rolar — e é por isso que este arquivo não importa React
   nem toca em estado: ele só responde perguntas sobre uma ficha.
   ============================================================ */

import { DADIVAS_EPICAS } from "./regras.js";
import { estaSintonizado } from "./sintonia.js";

export function dadivaPorId(id) { return DADIVAS_EPICAS.find((d) => d.id === id) || null; }

/* Os ids que a ficha carrega. Únicas moram na mesma lista, com id próprio
   prefixado — assim `temDadiva` continua sendo uma busca só. */
export function idsDe(pers) { return Array.isArray(pers && pers.dadivas) ? pers.dadivas : []; }
export function temDadiva(pers, id) { return idsDe(pers).includes(id); }

/* As únicas guardam a ficha inteira (nome, descrição, efeito) porque não
   existe tabela onde procurá-las depois. */
export function unicasDe(pers) { return Array.isArray(pers && pers.dadivasUnicas) ? pers.dadivasUnicas : []; }

/* Soma um campo numérico de efeito por TODAS as dádivas — as da tabela e as
   únicas. É a única porta: quem quiser saber quanto uma bênção dá pergunta
   aqui, e nunca lê `efeito` na mão. */
function somar(pers, campo) {
  let t = 0;
  for (const id of idsDe(pers)) {
    const d = dadivaPorId(id);
    if (d && d.efeito && Number(d.efeito[campo])) t += Number(d.efeito[campo]);
  }
  for (const u of unicasDe(pers)) {
    if (u && u.efeito && Number(u.efeito[campo])) t += Number(u.efeito[campo]);
  }
  for (const p of poderesDeItem(pers)) {
    if (p && p.efeito && Number(p.efeito[campo])) t += Number(p.efeito[campo]);
  }
  return t;
}
function algum(pers, campo) {
  for (const id of idsDe(pers)) { const d = dadivaPorId(id); if (d && d.efeito && d.efeito[campo]) return true; }
  for (const u of unicasDe(pers)) if (u && u.efeito && u.efeito[campo]) return true;
  for (const p of poderesDeItem(pers)) if (p && p.efeito && p.efeito[campo]) return true;
  return false;
}

/* ============================================================
   O EQUIPAMENTO FALA A MESMA LÍNGUA (v9.80)

   Os itens ganharam poderes de verdade, e os poderes falam este mesmo
   vocabulário — `danoExtra`, `ataqueExtra`, `descontoPM`, `criticoEm`,
   `movimento`, `rerroll`, `segundoFolego`. Não foi economia de
   digitação: é que TODOS os leitores abaixo já são chamados de dentro do
   combate, do movimento e das rolagens. Escrever um segundo conjunto de
   leitores só para item seria dar duas réguas à mesma pergunta.

   O FILTRO DA SINTONIA é o mesmo de `bonusEquip`: item guardado na
   mochila não faz nada, e item que pede sintonia e não recebeu fica
   dormente — serve de aço e de couro, mas o poder não responde.
   ============================================================ */
export function poderesDeItem(pers) {
  const out = [];
  for (const it of Object.values((pers && pers.equipados) || {})) {
    if (!it || !Array.isArray(it.poderes) || !it.poderes.length) continue;
    if (!estaSintonizado(pers, it)) continue;
    for (const p of it.poderes) if (p && p.efeito) out.push(p);
  }
  return out;
}

/* ---------------- OS LEITORES ----------------
   Um por pergunta que o combate faz. Todos devolvem o valor NEUTRO quando
   não há dádiva nenhuma, para que o jogo inteiro de nível 1 a 19 se comporte
   exatamente como antes. */

export function ataquesExtras(pers) { return somar(pers, "ataqueExtra"); }
export function danoExtraDeDadiva(pers) { return somar(pers, "danoExtra"); }
export function defesaDeDadiva(pers) { return somar(pers, "defesa"); }
export function descontoDePM(pers) { return somar(pers, "descontoPM"); }
export function bonusSocialDeDadiva(pers) { return somar(pers, "bonusSocial"); }
export function temVantagemMental(pers) { return algum(pers, "vantagemMental"); }
/* v9.34: com o grid, "quantas zonas por movimento" deixou de fazer sentido —
   o deslocamento é orçamento em metros. O que a Dádiva dos Passos Longos faz
   é DOBRAR esse orçamento e ignorar terreno difícil, que é o que ela sempre
   disse ("move-se o dobro e ignora terreno difícil"). */
export function dobraMovimento(pers) { return somar(pers, "movimento") >= 2; }
export function ignoraTerrenoDificil(pers) { return somar(pers, "movimento") >= 2; }

/* Crítico: 20 é o padrão do d20; a Sorte Impossível abaixa a régua para 19.
   Devolve o MENOR entre os concedidos — se um dia houver duas fontes, a
   melhor manda. */
export function criticoMinimo(pers) {
  let c = 20;
  for (const id of idsDe(pers)) { const d = dadivaPorId(id); const v = Number(d && d.efeito && d.efeito.criticoEm); if (v && v < c) c = v; }
  for (const u of unicasDe(pers)) { const v = Number(u && u.efeito && u.efeito.criticoEm); if (v && v < c) c = v; }
  return Math.max(2, Math.min(20, c));
}

/* Imunidades: exaustão, veneno, doença. A condição vem por id do catálogo. */
export function imunidadesDe(pers) {
  const s = new Set();
  for (const id of idsDe(pers)) { const d = dadivaPorId(id); (d && d.efeito && d.efeito.imunidades || []).forEach((x) => s.add(String(x))); }
  for (const u of unicasDe(pers)) ((u && u.efeito && u.efeito.imunidades) || []).forEach((x) => s.add(String(x)));
  /* v9.81: e o que o EQUIPAMENTO concede. O elmo que não deixa o medo
     entrar tem de valer tanto quanto a dádiva que faz o mesmo — senão a
     imunidade seria um efeito que só o topo do jogo alcança. */
  for (const p of poderesDeItem(pers)) ((p && p.efeito && p.efeito.imunidades) || []).forEach((x) => s.add(String(x)));
  return [...s];
}

/* ---------------- OS DOIS LEITORES QUE FALTAVAM (v9.81) ----------------
   A paleta de efeitos de item era curta demais para um arsenal grande: com
   nove campos, dois épicos do mesmo slot saíam parecidos. Estes dois abrem
   dezenas de peças de uma vez, e os dois se penduram em ganchos que já
   existiam — a vantagem por atributo (que os traços de raça já usam) e o
   bônus de iniciativa (idem). */
export function vantagemDeItem(pers, attrId) {
  const alvo = String(attrId || "").toLowerCase();
  return poderesDeItem(pers).some((p) => {
    const v = p.efeito && p.efeito.vantagem;
    if (!v) return false;
    return Array.isArray(v) ? v.map((x) => String(x).toLowerCase()).includes(alvo) : String(v).toLowerCase() === alvo;
  });
}

export function iniciativaDeItem(pers) { return somar(pers, "iniciativa"); }
const NORM = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
export function imuneA(pers, condId) {
  const alvo = NORM(condId);
  return imunidadesDe(pers).some((i) => NORM(i) === alvo);
}

/* ---------------- OS RECURSOS QUE SE GASTAM ----------------
   Duas dádivas não são passivas: o Destino refaz uma rolagem por descanso e
   a Recuperação reergue quem caiu, uma vez por dia. Recurso que se gasta
   precisa de contador na ficha e de um lugar que o zere — senão vale uma
   vez na vida ou vale sempre, e nenhum dos dois é o que está escrito. */

export function refazeresDeDadiva(pers) { return somar(pers, "rerroll"); }
export function refazerDisponivel(pers) {
  const tem = refazeresDeDadiva(pers);
  if (!tem) return 0;
  return Math.max(0, tem - Math.max(0, Number((pers && pers.dadivaGastos && pers.dadivaGastos.rerroll) || 0)));
}
export function gastarRefazer(pers) {
  const g = { ...((pers && pers.dadivaGastos) || {}) };
  g.rerroll = (Number(g.rerroll) || 0) + 1;
  return { ...pers, dadivaGastos: g };
}

export function temSegundoFolego(pers) { return somar(pers, "segundoFolego") > 0; }
export function segundoFolegoDisponivel(pers, dia) {
  if (!temSegundoFolego(pers)) return false;
  return Number((pers && pers.dadivaGastos && pers.dadivaGastos.folegoDia)) !== Number(dia);
}
export function gastarSegundoFolego(pers, dia) {
  const g = { ...((pers && pers.dadivaGastos) || {}) };
  g.folegoDia = Number(dia) || 0;
  return { ...pers, dadivaGastos: g };
}

/* O descanso longo devolve o refazer. O segundo fôlego é por DIA e se
   devolve sozinho quando o dia vira — por isso não aparece aqui. */
export function repousarDadivas(pers) {
  const g = { ...((pers && pers.dadivaGastos) || {}) };
  delete g.rerroll;
  return { ...pers, dadivaGastos: g };
}

/* ---------------- A DÁDIVA ÚNICA, FEITA PELO SISTEMA ----------------
   O que ela precisa ser para não repetir o furo: ter NOME, ter NÚMERO e
   entrar na ficha sem passar por ninguém. O nome nasce do que o herói é —
   domínio, título, feitos — e a semente é determinística para a mesma
   lenda nunca produzir duas bênçãos diferentes ao recarregar o save. */

function rng(semente) {
  let h = 2166136261;
  const s = String(semente || "");
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = (h * 16777619) >>> 0; }
  return () => { h = (h * 1664525 + 1013904223) >>> 0; return h / 4294967296; };
}
const pega = (r, lista) => lista[Math.floor(r() * lista.length)];

/* Os moldes. Cada um traz o efeito REAL e a forma do nome — porque um nome
   sem número é exatamente o que este arquivo existe para não deixar
   acontecer de novo. */
const MOLDES = [
  { chave: "gume",     efeito: { danoExtra: 6 },              forma: (n) => `Gume ${n}`,       diz: "cada golpe seu carrega 6 de dano a mais — a ferida não fecha direito." },
  { chave: "couraca",  efeito: { defesa: 3 },                 forma: (n) => `Couraça ${n}`,    diz: "+3 de defesa: o que era para te acertar passa de raspão." },
  { chave: "folego",   efeito: { vidaMax: 25, manaMax: 10 },  forma: (n) => `Fôlego ${n}`,     diz: "+25 de vida máxima e +10 de mana máxima." },
  { chave: "presteza", efeito: { ataqueExtra: 1 },            forma: (n) => `Presteza ${n}`,   diz: "um ataque a mais por turno." },
  { chave: "fonte",    efeito: { manaMax: 30, descontoPM: 1 },forma: (n) => `Fonte ${n}`,      diz: "+30 de mana máxima e 1 PM a menos em cada conjuração." },
  { chave: "sopro",    efeito: { vidaMax: 20, danoExtra: 3 }, forma: (n) => `Sopro ${n}`,      diz: "+20 de vida máxima e +3 de dano em cada golpe." },
  { chave: "olho",     efeito: { criticoEm: 19 },             forma: (n) => `Olho ${n}`,       diz: "seus críticos acontecem com 19 ou 20." },
  { chave: "passo",    efeito: { movimento: 2 },              forma: (n) => `Passo ${n}`,      diz: "atravessa dois lugares por turno e ignora terreno difícil." },
];

/* O adjetivo vem do herói. Um deus da forja recebe "Sopro da Bigorna"; um
   herói sem domínio recebe algo da própria lenda. Nunca uma palavra solta. */
const QUALIFICADORES = [
  "do Abismo", "do Primeiro Silêncio", "da Última Hora", "do Nome Esquecido",
  "das Marés Mortas", "da Hora Vazia", "do Juramento Roto", "da Fome Antiga",
  "da Pedra que Sangra", "do Sol Cego", "do Trovão Preso", "da Raiz Funda",
];

export function gerarDadivaUnica(pers, { dominio = "", titulo = "", quantas = 0 } = {}) {
  const semente = `dadiva|${(pers && pers.nome) || "heroi"}|${(pers && pers.semente) || ""}|${quantas}`;
  const r = rng(semente);
  const molde = pega(r, MOLDES);
  const qual = dominio
    ? `d${/^[aeiou]/i.test(dominio) ? "o" : "o"} ${dominio}`.replace(/^do (a|e|i|o|u)/i, "da $1")
    : pega(r, QUALIFICADORES);
  const nome = molde.forma(qual);
  return {
    id: `unica:${molde.chave}:${quantas}`,
    nome,
    unica: true,
    efeito: molde.efeito,
    desc: molde.diz,
    contexto: titulo
      ? `nasceu do que ${(pers && pers.nome) || "o herói"} fez como ${titulo}`
      : `nasceu da lenda de ${(pers && pers.nome) || "quem a carrega"}`,
  };
}

/* ---------------- LEITURA PARA A FICHA E PARA O MESTRE ---------------- */

/* O que cada dádiva FAZ, em uma linha, com o estado do recurso quando ele
   existe. É a resposta a "não entendi como usar": se há carga, ela aparece. */

export function linhaDaDadiva(pers, id) {
  const d = dadivaPorId(id);
  if (!d) return null;
  let extra = "";
  if (d.efeito && d.efeito.rerroll) {
    const n = refazerDisponivel(pers);
    extra = n > 0 ? " · pronta — o botão 🎲 Destino aparece quando você rolar" : " · já usada (volta no descanso longo)";
  }
  if (d.efeito && d.efeito.segundoFolego) extra = " · automática ao cair a 0 PV";
  return { id, nome: d.nome, desc: d.desc, extra, ativa: !!(d.efeito && (d.efeito.rerroll || d.efeito.segundoFolego)) };
}

export function todasAsLinhas(pers) {
  const out = [];
  for (const id of idsDe(pers)) { const l = linhaDaDadiva(pers, id); if (l) out.push(l); }
  for (const u of unicasDe(pers)) out.push({ id: u.id, nome: u.nome, desc: u.desc, extra: " · única desta lenda", ativa: false, unica: true });
  return out;
}

export function resumoDadivasPrompt(pers) {
  const l = todasAsLinhas(pers);
  if (!l.length) return "";
  return `DÁDIVAS ÉPICAS DO HERÓI (concedidas e APLICADAS pelo sistema — são fato, não promessa): ${l.map((x) => `${x.nome} (${x.desc})`).join("; ")}. Você nunca concede, nunca retira e nunca inventa uma dádiva nova: quando uma nasce, o envelope chega com o nome pronto.`;
}

export function envelopeDaUnica(u, pers) {
  return `[DÁDIVA ÉPICA ÚNICA — CRIADA E APLICADA PELO SISTEMA] O herói cruzou mais 30.000 XP no ápice mortal e uma bênção exclusiva desta campanha despertou nele. Ela JÁ está na ficha, com nome e número: "${u.nome}" — ${u.desc} (${u.contexto}).

Narre o instante em que esse poder acorda, à altura: isto acontece pouquíssimas vezes numa vida. Use EXATAMENTE este nome — "${u.nome}" — e trate o efeito como fato consumado. NÃO invente outro nome, NÃO altere o que ela faz, NÃO acrescente um segundo poder por cima e NÃO envie "adicionar_habilidades": o sistema já registrou tudo.`;
}

export const DADIVAS_PROMPT = `DÁDIVAS ÉPICAS (v9.32 — só o sistema concede):
- Depois do nível 20 o herói ganha uma dádiva a cada 30.000 XP. Quem sorteia, nomeia e aplica é o SISTEMA — inclusive as exclusivas desta campanha, que chegam com nome próprio no envelope.
- Você nunca concede uma dádiva, nunca inventa o nome de uma, nunca muda o que ela faz e nunca registra uma como habilidade. Se a ficção pedir uma bênção, narre o desejo — o sistema decide se ela vem.
- Quando o envelope chegar, use o nome exato que ele traz e narre a manifestação. O número já está na ficha.`;
