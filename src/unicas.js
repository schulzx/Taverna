/* ============================================================
   HABILIDADES ÚNICAS (v7.4.4) — Taverna
   Mesma filosofia do loot: habilidades comuns vêm da árvore da
   classe (tabela fixa); habilidades ÚNICAS nascem por CÓDIGO em
   momentos raros — derrubar uma elite ou um lendário pode deixar
   uma marca de poder que vira técnica própria. A IA só narra a
   epifania; quem cria, precifica e limita é o sistema.
   ============================================================ */

const NUCLEOS = ["Eclipse", "Coroa", "Sopro", "Selo", "Lamento", "Grito", "Raiz", "Véu", "Pacto", "Fenda", "Trono", "Olho"];
const MATIZ = ["de Cinzas", "do Abismo", "de Ossos", "da Tempestade", "do Sangue", "de Gelo Negro", "do Vazio", "de Jade", "do Julgamento", "das Profundezas", "de Prata", "do Ultimo Suspiro"];
const ASSINATURAS = ["Devorador", "Silencioso", "Radiante", "Inquebrantável", "Vingativo", "Eterno", "Profano", "Sagrado", "Faminto", "Sereno"];

/* moldes mecânicos — o dano/efeito numérico é usado PELO SISTEMA na resolução */
const MOLDES = [
  { id: "execucao", desc: (c, d) => `Golpe de finalização: causa ${d} de dano base; contra alvos com menos de metade dos PV, o dano DOBRA.`, custo: [5, 8], recarga: [2, 3], dano: (n) => 12 + n },
  { id: "drenagem", desc: (c, d) => `Toca a essência do alvo: causa ${d} de dano e você recupera PV igual à metade do dano causado.`, custo: [4, 7], recarga: [2, 3], dano: (n) => 9 + n },
  { id: "explosao", desc: (c, d) => `Descarga avassaladora: ${d} de dano no alvo principal e metade em todos os demais inimigos.`, custo: [6, 9], recarga: [3, 4], dano: (n) => 10 + n, area: true },
  { id: "baluarte", desc: (c) => `Ergue uma proteção sobrenatural: você fica Protegido por 3 turnos (−3 de dano sofrido) e recupera ${4 + 2} PV por turno enquanto durar.`, custo: [4, 6], recarga: [3, 4], dano: null },
  { id: "sentenca", desc: (c, d) => `Marca o alvo com um presságio: ${d} de dano agora; se ele ainda estiver de pé, fica Enfraquecido por 2 turnos.`, custo: [5, 8], recarga: [2, 4], dano: (n) => 11 + n, condicao: "Enfraquecido" },
];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const entre = ([a, b]) => a + Math.floor(Math.random() * (b - a + 1));

/* Gera uma habilidade única calibrada ao nível do herói.
   existentes: nomes já conhecidos, para nunca repetir. */
export function gerarHabilidadeUnica(nivel = 1, existentes = []) {
  const molde = pick(MOLDES);
  const custo = entre(molde.custo);
  const recarga = entre(molde.recarga);
  const danoBase = molde.dano ? molde.dano(Math.floor((nivel || 1) / 2)) : 0;
  let nome = `${pick(NUCLEOS)} ${pick(MATIZ)}`;
  if (Math.random() < 0.5) nome += ` ${pick(ASSINATURAS)}`;
  const usados = new Set((existentes || []).map((x) => (x || "").toLowerCase()));
  if (usados.has(nome.toLowerCase())) nome = `${pick(NUCLEOS)} ${pick(MATIZ)} ${pick(ASSINATURAS)}`;
  return {
    nome,
    custo,
    recarga,
    unica: true,
    molde: molde.id,
    area: !!molde.area,
    condicao: molde.condicao || null,
    danoBase,
    descricao: molde.desc(custo, danoBase),
  };
}

/* Chance de despertar uma única pela ameaça máxima derrotada —
   espelha a lógica do loot único (elite raro, lendário generoso). */
export function chanceUnica(inimigosDerrotados) {
  const ordem = { fraco: 0, comum: 1, competente: 2, elite: 3, lendario: 4 };
  const max = (inimigosDerrotados || []).reduce((m, e) => Math.max(m, ordem[e.ameaca] ?? 1), 0);
  if (max >= 4) return 0.4;   // lendário: 40%
  if (max >= 3) return 0.15;  // elite: 15%
  return 0;
}
