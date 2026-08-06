/* ============================================================
   MASMORRAS (v7.9) — Taverna
   Antes: um corredor linear onde o jogador só apertava "avançar".
   Agora: um GRAFO com escolhas reais — cada sala oferece saídas
   com PISTAS, o chefe fica trancado até você achar a chave, as
   tochas se gastam a cada passo e dá para recuar levando o que
   já ganhou. Decisão, risco e informação: é isso que faz masmorra.
   Tudo rolado por tabela; a IA só narra o que o sistema entrega.
   ============================================================ */
import { criaturasDoGenero } from "./bestiario.js";
import { gerarLoot } from "./loot.js";

const d = (n) => Math.floor(Math.random() * n);
const sortear = (arr) => arr[d(arr.length)];

const LUGARES = ["Cripta", "Catacumba", "Mina", "Caverna", "Ruína", "Tumba", "Esgoto", "Fortaleza", "Templo", "Cisterna", "Torre", "Labirinto", "Covil", "Santuário", "Prisão", "Abismo"];
const EPITETOS = ["dos Sussurros", "do Rei Caído", "das Correntes", "do Musgo Negro", "das Ossadas", "do Sino Rachado", "das Águas Paradas", "do Olho Cego", "das Sombras", "do Voto Quebrado", "da Serpente", "dos Ratos", "do Silêncio", "das Brasas", "da Névoa", "do Eremita"];
const ARMADILHAS = ["chão que desaba sobre estacas", "dardos disparados das paredes", "gás esverdeado", "pedra que rola pelo corredor", "lâminas oscilantes no teto", "piso que vira alçapão", "fios que derrubam potes de fogo", "estátua que cospe areia cega"];
const SANTUARIOS = ["fonte de água límpida", "altar coberto de musgo luminoso", "acampamento abandonado com provisões", "estátua com as mãos em concha", "jardim subterrâneo de cogumelos brancos"];
const ENIGMAS = ["uma porta com três alavancas e uma inscrição gasta", "um espelho que mostra a sala diferente", "estátuas que apontam para direções distintas", "um poço de onde sobe uma voz que faz perguntas", "runas que brilham numa sequência que se repete", "uma balança antiga com pesos estranhos"];

/* PISTAS: o que se percebe da soleira ANTES de entrar. É a informação que
   transforma "apertar avançar" em decisão — e algumas mentem um pouco. */
const PISTAS = {
  combate:    ["ouve-se respiração pesada lá dentro", "há ossos roídos espalhados na entrada", "algo se move na escuridão", "cheiro de bicho e ferro velho"],
  armadilha:  ["o chão à frente tem marcas estranhas", "há poeira demais parada no ar", "um crânio velho jaz bem no meio da passagem", "buracos regulares nas paredes"],
  tesouro:    ["um brilho fraco reflete lá no fundo", "cheiro de metal e cera antiga", "há caixas empilhadas contra a parede", "moedas soltas marcam o caminho"],
  enigma:     ["runas frias piscam devagar", "há uma inscrição gasta na verga da porta", "um mecanismo range sozinho", "silêncio bom demais para ser natural"],
  santuario:  ["escuta-se água corrente", "um ar mais limpo vem de lá", "musgo luminoso cresce na soleira", "cheiro de ervas secas"],
  chave:      ["correntes penduradas balançam sem vento", "uma marca de selo na pedra", "algo importante foi guardado aqui"],
  chefe:      ["um portão pesado, lacrado", "o corredor todo leva para lá", "o ar fica denso perto dessa porta"],
};
const pistaDe = (tipo) => sortear(PISTAS[tipo] || PISTAS.combate);

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
  return Array.from({ length: qtd }, () => sortear(pool));
}

function conteudoSala(tipo, genero, nivel, profunda) {
  const bonus = profunda ? 1.6 : 1; // quanto mais fundo, melhor a recompensa
  if (tipo === "combate") return { inimigos: rolarGrupo(genero, nivel).map((c) => ({ nome: c.nome, ameaca: c.ameaca })) };
  if (tipo === "armadilha") return { nomeArmadilha: sortear(ARMADILHAS), dano: Math.round((2 + nivel * 0.8 + d(4)) * bonus) };
  if (tipo === "tesouro") return { moedas: Math.round((10 + nivel * 3 + d(20)) * bonus), caiItem: Math.random() < (profunda ? 0.8 : 0.5) };
  if (tipo === "enigma") return { cena: sortear(ENIGMAS) };
  if (tipo === "santuario") return { cena: sortear(SANTUARIOS), curaPct: 0.25, tochas: 2 };
  if (tipo === "chave") return { inimigos: rolarGrupo(genero, nivel).map((c) => ({ nome: c.nome, ameaca: c.ameaca })), guardaChave: true };
  return {};
}

/* ---------------- GERADOR: grafo em camadas ----------------
   entrada → camada 1 (2-3 salas) → camada 2 (2-3) → [camada 3] → chefe
   Cada sala liga a 2 salas da camada seguinte. Uma sala do miolo guarda
   a CHAVE; sem ela o portão do chefe não abre. */
export function gerarMasmorra(genero, nivel, nomeSugerido = "") {
  const nome = nomeSugerido || `${sortear(LUGARES)} ${sortear(EPITETOS)}`;
  const nCamadas = nivel >= 8 ? 3 : 2;
  const salas = [{ id: 0, tipo: "entrada", camada: 0, saidas: [], visitada: true, resolvida: true }];
  let idSeq = 1;
  let anterior = [0];

  for (let c = 1; c <= nCamadas; c++) {
    const largura = 2 + (Math.random() < 0.45 ? 1 : 0);
    const atual = [];
    for (let i = 0; i < largura; i++) {
      const r = Math.random();
      const tipo = r < 0.40 ? "combate" : r < 0.56 ? "armadilha" : r < 0.74 ? "tesouro" : r < 0.88 ? "enigma" : "santuario";
      const profunda = c === nCamadas;
      const sala = { id: idSeq++, tipo, camada: c, saidas: [], visitada: false, resolvida: false, pista: pistaDe(tipo), ...conteudoSala(tipo, genero, nivel, profunda) };
      salas.push(sala); atual.push(sala.id);
    }
    /* a CHAVE fica numa sala aleatória do miolo (nunca na primeira camada
       inteira, para haver caminho a percorrer) */
    if (c === Math.max(1, nCamadas - 1)) {
      const idChave = sortear(atual);
      const escolhida = salas.find((x) => x.id === idChave);
      escolhida.tipo = "chave";
      escolhida.pista = pistaDe("chave");
      Object.assign(escolhida, conteudoSala("chave", genero, nivel, false));
    }
    /* liga cada sala anterior a 2 desta camada (caminhos que se cruzam) */
    for (const pid of anterior) {
      const pai = salas.find((x) => x.id === pid);
      const destinos = [...atual].sort(() => Math.random() - 0.5).slice(0, Math.min(2, atual.length));
      pai.saidas = [...new Set([...pai.saidas, ...destinos])];
    }
    anterior = atual;
  }

  const chefe = { id: idSeq++, tipo: "chefe", camada: nCamadas + 1, saidas: [], visitada: false, resolvida: false, pista: pistaDe("chefe"), trancada: true,
    inimigos: rolarGrupo(genero, nivel, { elite: true }).map((c) => ({ nome: c.nome, ameaca: c.ameaca })), moedas: 40 + nivel * 8 + d(30) };
  salas.push(chefe);
  for (const pid of anterior) salas.find((x) => x.id === pid).saidas.push(chefe.id);

  return { nome, salas, atual: 0, tochas: 5 + d(3), chave: false, saques: { moedas: 0, itens: 0 }, encerrada: false };
}

/* Saídas visíveis da sala atual, já com pista e estado. */
export function saidasDe(mm) {
  if (!mm) return [];
  const sala = mm.salas.find((s) => s.id === mm.atual);
  if (!sala) return [];
  return (sala.saidas || []).map((id) => {
    const s = mm.salas.find((x) => x.id === id);
    return {
      id, tipo: s.tipo, camada: s.camada, visitada: s.visitada, resolvida: s.resolvida,
      trancada: !!s.trancada && !mm.chave,
      pista: s.visitada ? (s.resolvida ? "já limpa" : "deixada pela metade") : (s.pista || "não dá para ver daqui"),
    };
  });
}

/* Voltar para uma sala já visitada da camada anterior (recuo). */
export function saidasDeRecuo(mm) {
  if (!mm) return [];
  const sala = mm.salas.find((s) => s.id === mm.atual);
  if (!sala || sala.camada === 0) return [];
  return mm.salas.filter((s) => s.visitada && (s.saidas || []).includes(mm.atual)).map((s) => ({ id: s.id, tipo: s.tipo, camada: s.camada }));
}

/* Move para uma sala: gasta tocha e devolve o estado + avisos. */
export function entrarNaSala(mm, id) {
  const alvo = mm.salas.find((s) => s.id === id);
  if (!alvo) return { mm, msgs: ["Não há passagem por ali."], bloqueado: true };
  if (alvo.trancada && !mm.chave) return { mm, msgs: ["🔒 O portão está lacrado — falta a chave que alguém guardou lá dentro."], bloqueado: true };
  const tochas = Math.max(0, (mm.tochas || 0) - 1);
  const msgs = [];
  if (tochas === 0 && (mm.tochas || 0) > 0) msgs.push("🕯 Sua última tocha se apaga — daqui em diante é no escuro (desvantagem e mais perigo).");
  const salas = mm.salas.map((s) => s.id === id ? { ...s, visitada: true } : s);
  return { mm: { ...mm, salas, atual: id, tochas }, msgs, sala: salas.find((s) => s.id === id) };
}

export function marcarResolvida(mm, id, extras = {}) {
  const salas = mm.salas.map((s) => s.id === id ? { ...s, resolvida: true } : s);
  const achouChave = mm.salas.find((s) => s.id === id && s.guardaChave);
  return { ...mm, salas, chave: mm.chave || !!achouChave, saques: { moedas: (mm.saques?.moedas || 0) + (extras.moedas || 0), itens: (mm.saques?.itens || 0) + (extras.itens || 0) } };
}

export function progressoMasmorra(mm) {
  if (!mm) return { visitadas: 0, total: 0, pct: 0 };
  const total = mm.salas.length;
  const visitadas = mm.salas.filter((s) => s.visitada).length;
  return { visitadas, total, pct: Math.round((visitadas / total) * 100) };
}

export function noEscuro(mm) { return !mm || (mm.tochas || 0) <= 0; }

export function recompensaChefe(nivel) {
  const raridade = Math.random() < 0.7 ? "epico" : "lendario";
  return { item: gerarLoot(raridade, { nivel }) };
}

export const ROTULO_SALA = { entrada: "Entrada", combate: "Combate", armadilha: "Armadilha", tesouro: "Tesouro", enigma: "Enigma", santuario: "Santuário", chave: "Guardião", chefe: "Chefe" };
export const ICONE_SALA = { entrada: "🚪", combate: "⚔", armadilha: "🕸", tesouro: "💰", enigma: "🔮", santuario: "🕯", chave: "🗝", chefe: "💀" };
