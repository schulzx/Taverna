/* Taverna v6.4 — DECRETOS E RECOMPENSAS (tudo em código, zero tokens).
   O reverso do mural: em vez de o jogador caçar serviço, ELE prega cartazes
   oferecendo recompensa — e o mundo responde. O código decide quem aceita
   (chance por generosidade × fama), gera o grupo de aventureiros (nomes e
   força), rola o desfecho após alguns dias (sucesso × fracasso × dizimado)
   e movimenta as moedas (retém ao pregar; paga no sucesso; devolve tudo no
   fracasso). A IA só narra os envelopes. */

import { sortear, nomePessoa } from "./nomes.js";

export const TIPOS_DECRETO = [
  { id: "cabeca", icone: "☠", rotulo: "Cabeça de alguém", dificuldade: 5, modelo: (a) => `Paga-se pela cabeça de ${a}. Morto. Prova exigida: a própria cabeça, evidentemente.` },
  { id: "masmorra", icone: "🕳", rotulo: "Limpar uma masmorra", dificuldade: 4, modelo: (a) => `Paga-se pela limpeza completa de ${a}. O que lá habita deve deixar de habitar.` },
  { id: "caca", icone: "🏹", rotulo: "Caçar uma criatura", dificuldade: 3, modelo: (a) => `Paga-se pela morte de ${a}. Tragam provas — chifres, garras, o que for.` },
  { id: "resgate", icone: "🆘", rotulo: "Encontrar ou resgatar alguém", dificuldade: 3, modelo: (a) => `Paga-se pelo retorno são e salvo de ${a}. Vivo, de preferência.` },
  { id: "escolta", icone: "🛡", rotulo: "Escoltar uma caravana", dificuldade: 2, modelo: (a) => `Paga-se pela escolta segura da caravana de ${a} até o destino. Carga intacta.` },
];

export const tipoDecreto = (id) => TIPOS_DECRETO.find((t) => t.id === id) || TIPOS_DECRETO[2];

/* Recompensa "justa" mínima: abaixo disso ninguém sério se interessa. */
export const recompensaJusta = (tipoId, nivel) => Math.round((tipoDecreto(tipoId).dificuldade * 40 + (nivel || 1) * 10) / 5) * 5;

const BANDOS = ["Companhia", "Irmandade", "Bando", "Liga", "Ordem Menor"];
const BANDOS_ADJ = ["do Javali", "das Cinzas", "do Corvo", "da Estrada", "do Punho Cerrado", "das Três Luas", "do Sal", "dos Desalmados", "da Aurora", "do Carvalho"];

export function gerarGrupoAventureiros(genero, nivel) {
  const n = 2 + Math.floor(Math.random() * 3); // 2–4 aventureiros
  const membros = [];
  for (let i = 0; i < n; i++) membros.push({ nome: nomePessoa(genero), vivo: true });
  const forca = Math.max(1, Math.min(20, (nivel || 1) + Math.floor(Math.random() * 5) - 2)); // ±2 do seu nível
  return { bando: `${sortear(BANDOS)} ${sortear(BANDOS_ADJ)}`, lider: membros[0].nome, membros, forca };
}

/* Chance de alguém topar o serviço: generosidade pesa muito, fama ajuda. */
export function chanceAceite(decreto, nivel, fama) {
  const justa = recompensaJusta(decreto.tipo, nivel);
  const generosidade = decreto.recompensa / justa; // 1.0 = justa
  let p = 0.2 + (generosidade - 0.6) * 0.45 + (fama || 0);
  return Math.max(0.05, Math.min(0.95, p));
}

/* Tenta encontrar quem aceite. Retorna o grupo ou null. */
export function tentarAceite(decreto, { genero, nivel, fama }) {
  if (Math.random() >= chanceAceite(decreto, nivel, fama)) return null;
  return gerarGrupoAventureiros(genero, nivel);
}

/* Desfecho do serviço, por tabela — força do grupo contra dificuldade do alvo. */
export function resolverDecreto(decreto) {
  const dif = tipoDecreto(decreto.tipo).dificuldade;
  const alvo = dif * 2 + Math.floor(dif / 2); // dificuldade em "pontos de força"
  const vantagem = (decreto.grupo?.forca || 5) - alvo;
  const pSucesso = Math.max(0.15, Math.min(0.85, 0.5 + vantagem * 0.08));
  const r = Math.random();
  if (r < pSucesso) {
    const comBaixas = Math.random() < 0.35;
    return { desfecho: comBaixas ? "sucesso_baixas" : "sucesso", pago: true };
  }
  if (r < pSucesso + 0.10) return { desfecho: "dizimado", pago: false }; // ninguém voltou
  return { desfecho: "fracasso", pago: false };
}

export const ROTULO_DESFECHO = {
  sucesso: "✅ Serviço cumprido",
  sucesso_baixas: "⚑ Cumprido, com baixas",
  fracasso: "✖ Fracassaram — e voltaram",
  dizimado: "☠ Ninguém voltou",
};

export function criarDecreto({ tipo, alvo, recompensa, nivel }) {
  const t = tipoDecreto(tipo);
  return {
    id: `dec-${Date.now().toString(36)}-${Math.floor(Math.random() * 999)}`,
    tipo: t.id, alvo: (alvo || "").trim() || "alvo a definir",
    recompensa: Math.max(5, Math.round(recompensa || recompensaJusta(t.id, nivel))),
    descricao: t.modelo((alvo || "").trim() || "alvo a definir"),
    status: "pregado", // pregado → aceito → resolvido
    dias: 0, grupo: null, desfecho: null,
  };
}
