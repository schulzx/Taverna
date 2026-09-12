/* ============================================================
   UMA NOITE (v9.217) — o Capítulo: o episódio é a campanha

   O motor do primeiro prato da Noite. Uma partida é: mundo mínimo, um
   pronto do roster, UM dos 8 episódios como arco inteiro — e o relógio
   de 20 a 30 minutos como CONTRATO (lei ix): orçamento de cenas por
   marco, e quando o orçamento acaba, o mundo resolve (o ritmo por cena
   de episodios.js, que nasceu como opção — nunca cópia).

   ---------------- O MUNDO DE UMA NOITE ----------------

   O gerador de geografia resolve por molde registrado; em vez de um
   segundo gerador (a lei-mãe proíbe), o mundo da noite nasce por PODA
   determinística do mesmo gerador: fica UMA região, UMA cidade (já
   descoberta — a noite não tem tempo de se perder), rota nenhuma (a
   Noite não viaja; o que o episódio pedir de lugar, o marco cria em
   cena). O resto do continente simplesmente não existe esta noite.

   ---------------- A POSTURA DA NOITE ----------------

   Na campanha a postura é derivada com histerese; numa noite só não há
   dias para hesitar — cada episódio DECLARA a postura do mundo (posturas
   reais de posturas.js), e ela vale a partida inteira.

   ---------------- O FIM COM VEREDITO ----------------

   O último marco fecha a partida: veredito (o que foi salvo, o que foi
   perdido), a crônica curta, e a CONVERSÃO — o gancho de virar vida:
   o pronto sobrevivente sai como personagem inicial de uma campanha
   nova, com as cicatrizes e os itens que a noite deixou.
   ============================================================ */

import { gerarGeografia } from "./geografia.js";
import { moldePorId } from "./moldes.js";
import { EPISODIOS, episodioPorId } from "./episodios.js";
import { posturaPorId } from "./posturas.js";
import { prontoPorId } from "./prontos.js";

/* ---------------- O ORÇAMENTO (lei ix) ----------------
   3 cenas por marco; episódios de 4 marcos apertam os do meio. O teto
   total de cenas de qualquer capítulo cabe nos 20–30 minutos. */
export const TETO_DE_CENAS_POR_MARCO = 3;
export const TETO_DA_NOITE = 13;
export function orcamentoDoEpisodio(id) {
  const ep = episodioPorId(id);
  if (!ep) return null;
  /* 3 marcos: 3+3+3 = 9 · 4 marcos: 3+2+2+3 = 10 — sempre <= TETO_DA_NOITE */
  const tetos = ep.marcos.map((_, i) => (ep.marcos.length >= 4 && i > 0 && i < ep.marcos.length - 1 ? 2 : TETO_DE_CENAS_POR_MARCO));
  return { marcos: ep.marcos.length, tetos, total: tetos.reduce((s, v) => s + v, 0) };
}
export function tetoDoMarco(id, marco) {
  const o = orcamentoDoEpisodio(id);
  if (!o) return TETO_DE_CENAS_POR_MARCO;
  return o.tetos[Math.max(0, Math.min(o.tetos.length - 1, marco))] || TETO_DE_CENAS_POR_MARCO;
}

/* ---------------- O MUNDO DE UMA NOITE ---------------- */
export function mundoDaNoite(semente, { molde = null, lex = null } = {}) {
  const geo = gerarGeografia(String(semente || "uma-noite"), moldePorId(molde || undefined), lex);
  const cidades = Array.isArray(geo.cidades) ? geo.cidades : [];
  const regioes = Array.isArray(geo.regioes) ? geo.regioes : [];
  if (!cidades.length || !regioes.length) return null;
  /* a primeira cidade que tem região de verdade é a cidade da noite */
  const cidade = cidades.find((c) => regioes.some((r) => r.nome === c.regiao)) || cidades[0];
  const regiao = regioes.find((r) => r.nome === cidade.regiao) || regioes[0];
  const continente = (geo.continentes || []).find((k) => k.nome === regiao.continente) || (geo.continentes || [])[0] || null;
  return {
    continente: continente ? continente.nome : (geo.continente || ""),
    continentes: continente ? [continente] : [],
    regioes: [{ ...regiao, descoberta: true }],
    cidades: [{ ...cidade, descoberta: true }],
    rotas: [],
  };
}

/* ---------------- A POSTURA DA NOITE ----------------
   Declarada por episódio — postura REAL do catálogo, sem histerese. */
export const POSTURA_DA_NOITE = {
  linha_escura: "vespera",
  a_cobranca: "luto",
  a_heranca: "suspeita",
  a_subida: "promessa",
  a_peregrinacao: "anonimato",
  a_mascara_da_paz: "festa",
  a_cacada_invertida: "cacada",
  a_queda_reconstrucao: "crise",
};
export function posturaDaNoite(episodioId) {
  return POSTURA_DA_NOITE[episodioId] || "anonimato";
}

/* ---------------- O VEREDITO ----------------
   O fim da partida em três linhas honestas + a crônica de uma linha.
   `fatos` vem do App: o que o Livro pagou, o que murchou, se o herói
   caiu, quantas cenas a noite levou. */
export function veredito({ episodioId, pronto, venceu = true, cenas = 0, pagas = 0, murchas = 0 } = {}) {
  const ep = episodioPorId(episodioId);
  const p = prontoPorId(pronto);
  if (!ep || !p) return null;
  const titulo = venceu ? "O amanhecer chegou" : "A noite venceu";
  const linhas = [
    venceu ? `${p.nome} atravessou ${ep.nome} de pé.` : `${ep.nome} foi maior que ${p.nome} esta noite.`,
    pagas > 0 ? `${pagas} promessa${pagas > 1 ? "s" : ""} desta noite ${pagas > 1 ? "foram pagas" : "foi paga"}.` : "Nenhuma promessa amadureceu a tempo.",
    murchas > 0 ? `${murchas} fio${murchas > 1 ? "s" : ""} ficou solto no escuro.` : "Nada semeado morreu em silêncio.",
  ];
  const cronica = `${p.nome} · ${ep.nome} · ${venceu ? "sobreviveu" : "caiu"} em ${cenas} cena${cenas === 1 ? "" : "s"}.`;
  return { titulo, linhas, cronica, venceu };
}

/* ---------------- A CONVERSÃO: DAR A ELE UMA VIDA ----------------
   O pronto sobrevivente vira personagem inicial de campanha nova: as
   cicatrizes e os itens vão juntos; o que era da noite (condições do
   momento, efeitos, grupo de ocasião) fica na noite. */
export function converterParaCampanha(ficha) {
  if (!ficha || !ficha.nome || !ficha.classe) return null;
  const f = JSON.parse(JSON.stringify(ficha));
  f.vida = f.vidaMax; f.mana = f.manaMax;
  f.condicoes = []; f.efeitos = []; f.grupo = [];
  /* a marca fica: este herói NASCEU numa noite — a campanha pode citar */
  f.veioDeUmaNoite = true;
  return f;
}

/* ---------------- A ESCOLHA ALEATÓRIA ("me sirva qualquer coisa") ---- */
export function sortearNoite(semente) {
  let h = 2166136261;
  const s = String(semente || "noite");
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  const k = h >>> 0;
  const eps = EPISODIOS.map((e) => e.id);
  return { episodio: eps[k % eps.length], pronto: ["muralha", "sombra", "chama", "remendo", "voz", "flecha", "punho", "voto"][(k >>> 8) % 8] };
}

/* o rótulo do prato para o console de autor */
export function resumoDaNoite({ episodioId, marco = 0, cenas = 0 } = {}) {
  const ep = episodioPorId(episodioId);
  return { episodio: ep ? ep.nome : null, marco, cenas, postura: posturaDaNoite(episodioId) };
}
