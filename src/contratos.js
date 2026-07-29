/* ============================================================
   MURAL DE CONTRATOS — Taverna
   Trabalhos gerados por TABELA: o app define objetivo e paga a
   recompensa (moedas + XP) por código quando a missão conclui.
   A IA só conduz a ficção do serviço. Renova no descanso longo.
   ============================================================ */
import { criaturasDoGenero } from "./bestiario.js";
import { nomePessoa } from "./nomes.js";

const d = (n) => Math.floor(Math.random() * n);
const sortear = (arr) => arr[d(arr.length)];

const LOCAIS = [
  "na floresta próxima", "nas colinas ao norte", "numa estrada antiga", "nos arredores da cidade",
  "num bosque sombrio", "nas ruínas vizinhas", "no pântano", "nos túneis antigos", "na vila ao lado",
];
const ITENS_PROCURADOS = [
  "uma erva rara de flor azul", "um medalhão de família perdido", "um tomo molhado de fungos",
  "amostras de minério brilhante", "um sino de prata roubado", "ovos de uma ave gigante",
];

function criaturaAlvo(genero, nivel) {
  const pool = criaturasDoGenero(genero).filter((c) => (c.nivelRef || 1) <= nivel + 2);
  return pool.length ? sortear(pool) : { nome: "Criatura", ameaca: "comum" };
}

/* Gera UM contrato coerente com o nível e o mapa (cidades conhecidas). */
export function gerarContrato(genero, nivel, mapa) {
  const cidades = ((mapa && mapa.cidades) || []).map((c) => c.nome);
  const destino = cidades.length ? sortear(cidades) : "a cidade vizinha";
  const quem = nomePessoa(genero || "Fantasia medieval");
  const tipo = sortear(["caca", "caca", "limpeza", "escolta", "entrega", "resgate", "coleta"]);
  const moedas = 15 + nivel * 5 + d(15), xp = 20 + nivel * 4 + d(10);
  const id = `${Date.now().toString(36)}-${d(9999)}`;

  if (tipo === "caca") {
    const c = criaturaAlvo(genero, nivel);
    return { id, tipo, titulo: `Caça: ${c.nome}`, descricao: `Um(a) ${c.nome} tem atacado ${sortear(LOCAIS)}. Elimine a ameaça.`, alvo: c.nome, recompensa: { moedas, xp } };
  }
  if (tipo === "limpeza") {
    const c = criaturaAlvo(genero, nivel);
    return { id, tipo, titulo: `Limpeza ${sortear(LOCAIS)}`, descricao: `Um bando de ${c.nome} infestou o lugar. Varra a infestação.`, alvo: c.nome, recompensa: { moedas: moedas + 10, xp: xp + 10 } };
  }
  if (tipo === "escolta") {
    return { id, tipo, titulo: `Escolta de ${quem}`, descricao: `${quem} precisa chegar a salvo a ${destino}. Proteja a viagem.`, recompensa: { moedas, xp } };
  }
  if (tipo === "entrega") {
    return { id, tipo, titulo: `Entrega para ${destino}`, descricao: `Leve um pacote lacrado até ${destino}. Sem abrir, sem perguntas.`, recompensa: { moedas: moedas - 5, xp } };
  }
  if (tipo === "resgate") {
    return { id, tipo, titulo: `Resgate de ${quem}`, descricao: `${quem} desapareceu ${sortear(LOCAIS)}. Traga de volta — de preferência vivo(a).`, recompensa: { moedas: moedas + 15, xp: xp + 10 } };
  }
  return { id, tipo: "coleta", titulo: "Coleta rara", descricao: `Encontre e traga ${sortear(ITENS_PROCURADOS)}.`, recompensa: { moedas, xp } };
}

export function gerarMural(genero, nivel, mapa, n = 3) {
  const vistos = new Set();
  const lista = [];
  let guard = 0;
  while (lista.length < n && guard++ < 20) {
    const c = gerarContrato(genero, nivel, mapa);
    if (vistos.has(c.titulo)) continue;
    vistos.add(c.titulo);
    lista.push(c);
  }
  return lista;
}

export const ICONE_CONTRATO = { caca: "🏹", limpeza: "🧹", escolta: "🛡", entrega: "📦", resgate: "🆘", coleta: "🌿" };
