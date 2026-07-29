/* ============================================================
   MASMORRAS — Taverna
   Masmorras geradas por TABELA, sala a sala, resolvidas pelo
   app: combate (bestiário), armadilha (dano por código), tesouro
   (moedas + loot procedural), santuário (cura), enigma (a IA faz
   a cena) e o CHEFE no fundo. A IA narra cada sala — nunca rola.
   ============================================================ */
import { criaturasDoGenero } from "./bestiario.js";
import { gerarLoot } from "./loot.js";

const d = (n) => Math.floor(Math.random() * n);
const sortear = (arr) => arr[d(arr.length)];

/* ---------------- NOMES (prefixo + lugar + epíteto) ---------------- */
const LUGARES = [
  "Cripta", "Catacumba", "Mina", "Caverna", "Ruína", "Tumba", "Esgoto", "Fortaleza",
  "Templo", "Cisterna", "Torre", "Labirinto", "Covil", "Santuário", "Prisão", "Abismo",
];
const EPITETOS = [
  "dos Sussurros", "do Rei Caído", "das Correntes", "do Musgo Negro", "das Ossadas",
  "do Sino Rachado", "das Águas Paradas", "do Olho Cego", "das Sombras", "do Voto Quebrado",
  "da Serpente", "dos Ratos", "do Silêncio", "das Brasas", "da Névoa", "do Eremita",
];

/* ---------------- ARMADILHAS ---------------- */
const ARMADILHAS = [
  "chão que desaba sobre estacas", "dardos disparados das paredes", "gás esverdeado",
  "pedra que rola pelo corredor", "lâminas oscilantes no teto", "piso que vira alçapão",
  "fios que derrubam potes de fogo", "estátua que cospe areia cega",
];

/* ---------------- SANTUÁRIOS / ENIGMAS ---------------- */
const SANTUARIOS = [
  "fonte de água límpida", "altar coberto de musgo luminoso", "acampamento abandonado com provisões",
  "estátua com as mãos em concha", "jardim subterrâneo de cogumelos brancos",
];
const ENIGMAS = [
  "uma porta com três alavancas e uma inscrição gasta", "um espelho que mostra a sala diferente",
  "estátuas que apontam para direções distintas", "um poço de onde sobe uma voz que faz perguntas",
  "runas que brilham numa sequência que se repete", "uma balança antiga com pesos estranhos",
];

/* Inimigos coerentes com o nível (mesma regra dos encontros de estrada) */
function rolarGrupo(genero, nivel, { elite = false } = {}) {
  const pool = criaturasDoGenero(genero).filter((c) => (c.nivelRef || 1) <= nivel + 2);
  if (!pool.length) return [];
  if (elite) {
    const fortes = criaturasDoGenero(genero).filter((c) => c.ameaca === "elite" || c.ameaca === "lendario");
    const chefe = fortes.length && Math.random() < 0.7 ? sortear(fortes) : { nome: "Chefe da Masmorra", ameaca: "elite", nivelRef: nivel + 1 };
    const capangas = Math.random() < 0.5 ? [sortear(pool)] : [];
    return [chefe, ...capangas];
  }
  const qtd = 1 + (Math.random() < 0.5 ? 1 : 0) + (nivel >= 8 ? 1 : 0);
  const grupo = [];
  for (let i = 0; i < qtd; i++) grupo.push(sortear(pool));
  return grupo;
}

/* Gera a masmorra completa. Salas: entrada, 3-5 miolo, chefe. */
export function gerarMasmorra(genero, nivel) {
  const nome = `${sortear(LUGARES)} ${sortear(EPITETOS)}`;
  const nMiolo = 3 + d(3); // 3 a 5 salas de miolo
  const tipos = [];
  for (let i = 0; i < nMiolo; i++) {
    const r = Math.random();
    tipos.push(r < 0.42 ? "combate" : r < 0.58 ? "armadilha" : r < 0.72 ? "tesouro" : r < 0.84 ? "enigma" : "santuario");
  }
  if (!tipos.includes("combate")) tipos[0] = "combate"; // masmorra sem luta não é masmorra

  const salas = [{ tipo: "entrada" }];
  for (const t of tipos) {
    if (t === "combate") {
      const inimigos = rolarGrupo(genero, nivel);
      salas.push({ tipo: t, inimigos: inimigos.map((c) => ({ nome: c.nome, ameaca: c.ameaca })) });
    } else if (t === "armadilha") {
      salas.push({ tipo: t, nome: sortear(ARMADILHAS), dano: 2 + Math.floor(nivel * 0.8) + d(4) });
    } else if (t === "tesouro") {
      salas.push({ tipo: t, moedas: 10 + nivel * 3 + d(20), caiItem: Math.random() < 0.55 });
    } else if (t === "enigma") {
      salas.push({ tipo: t, cena: sortear(ENIGMAS) });
    } else {
      salas.push({ tipo: t, cena: sortear(SANTUARIOS), curaPct: 0.25 });
    }
  }
  salas.push({ tipo: "chefe", inimigos: rolarGrupo(genero, nivel, { elite: true }).map((c) => ({ nome: c.nome, ameaca: c.ameaca })), moedas: 40 + nivel * 8 + d(30) });
  return { nome, salas, idx: 0 };
}

/* Recompensa do chefe: moedas + item épico/lendário garantido (gerado na hora). */
export function recompensaChefe(nivel) {
  const raridade = Math.random() < 0.7 ? "epico" : "lendario";
  return { item: gerarLoot(raridade, { nivel }) };
}

export const ROTULO_SALA = { entrada: "Entrada", combate: "Combate", armadilha: "Armadilha", tesouro: "Tesouro", enigma: "Enigma", santuario: "Santuário", chefe: "Chefe" };
