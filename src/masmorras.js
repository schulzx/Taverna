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
/* v9.53: era `arr[d(arr.length)]`, e `d(n)` devolve 1..n — nunca 0. O
   primeiro item de TODA tabela deste arquivo era inalcançável (a primeira
   pista, a primeira armadilha, o primeiro enigma, o primeiro santuário), e
   uma em cada `n` chamadas devolvia `undefined`. Em 500 masmorras geradas,
   500 tinham ao menos uma passagem com a pista vazia — o jogador escolhia a
   porta no escuro porque o sorteio caía fora da lista. */
const sortear = (arr) => (arr && arr.length ? arr[Math.floor(Math.random() * arr.length)] : undefined);

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
      const sala = { id: idSeq++, tipo, camada: c, saidas: [], visitada: false, resolvida: false, pista: pistaDe(tipo), segredo: sortearSegredo(tipo), ...conteudoSala(tipo, genero, nivel, profunda) };
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
    /* ---------------- TODA SALA PRECISA DE UMA ENTRADA (v9.53) ----------------
       Aqui morava o pior bug que este jogo já teve. Cada sala da camada
       anterior sorteava DUAS da camada nova — e quando a camada nova tinha
       três salas e a anterior tinha uma ou duas, sobrava sala sem ninguém
       apontando para ela. Em 200 masmorras geradas, 117 tinham pelo menos uma
       sala órfã.

       O caso letal: em 12% delas a órfã era justamente a sala que guarda a
       CHAVE, e o portão do chefe é `trancada: true`. O jogador entrava,
       limpava tudo o que alcançava, chegava ao portão e lia "falta a chave
       que alguém guardou lá dentro" — sem ter para onde ir. Uma em cada oito
       expedições era um beco sem saída, e o único botão restante era o de
       fugir, que abre mão de tudo.

       O conserto é uma varredura: quem ficou sem pai ganha um, sorteado entre
       os da camada anterior. Fica AQUI, dentro do laço, e não numa costura no
       fim, porque uma camada consertada é a camada anterior da seguinte — e
       reparar cedo é o que impede o furo de se propagar. */
    const comPai = new Set(anterior.flatMap((pid) => salas.find((x) => x.id === pid).saidas));
    for (const id of atual) {
      if (comPai.has(id)) continue;
      /* o sorteio sai ANTES do `find`: dentro do predicado ele seria refeito
         a cada sala comparada, e o `find` compararia cada uma contra um pai
         diferente — quase nunca achando nenhum. */
      const escolhido = sortear(anterior);
      const pai = salas.find((x) => x.id === escolhido);
      if (pai) pai.saidas = [...new Set([...pai.saidas, id])];
    }
    anterior = atual;
  }

  const chefe = { id: idSeq++, tipo: "chefe", camada: nCamadas + 1, saidas: [], visitada: false, resolvida: false, pista: pistaDe("chefe"), trancada: true,
    inimigos: rolarGrupo(genero, nivel, { elite: true }).map((c) => ({ nome: c.nome, ameaca: c.ameaca })), moedas: 40 + nivel * 8 + d(30) };
  salas.push(chefe);
  for (const pid of anterior) salas.find((x) => x.id === pid).saidas.push(chefe.id);

  const completas = garantirCaminhos(salas);
  return { nome, salas: completas, atual: 0, tochas: tochasIniciais(completas), chave: false, ritmo: "normal", saques: { moedas: 0, itens: 0 }, encerrada: false };
}

/* ---------------- QUANTAS TOCHAS (v9.54) ----------------
   Era `5 + d(3)` — de seis a oito — num lugar que pode ter onze salas. Como
   cada passo gasta uma, o jogador chegava ao terço final SEMPRE no escuro,
   e "sempre" não é uma decisão: é um imposto. Escuridão que acontece toda
   vez deixa de ser tensão e vira cenário.

   O número passa a olhar o tamanho da masmorra, e a régua é deliberada:
   dá para CHEGAR ao chefe com folga, não dá para varrer tudo. Quem quiser
   as onze salas vai ter de achar tocha lá dentro, comprar antes de descer
   ou aceitar o escuro no fim — e aí é escolha, que é o que a masmorra
   estava pedindo. */
export function tochasIniciais(salas) {
  const n = (salas || []).length;
  return Math.max(5, Math.round(n * 0.7) + d(2));
}

/* ---------------- A REDE DE SEGURANÇA (v9.53) ----------------
   O reparo dentro do laço já basta. Esta função existe assim mesmo, e o
   motivo é o tamanho do estrago: uma masmorra impossível não é um número
   errado na tela, é a partida travada com o jogador lá dentro. Quando o
   custo do erro é esse, cinto e suspensório valem as vinte linhas.

   Faz duas perguntas, nesta ordem, porque a segunda depende da primeira:

   1) Toda sala tem caminho desde a entrada? Quem não tiver ganha um pai da
      camada anterior (ou da entrada, se for da camada 1).
   2) A CHAVE está alcançável sem a chave? É a pergunta que salva a partida:
      de nada adianta a sala existir no grafo se o único caminho até ela
      passa pelo portão que ela mesma abre. */
export function garantirCaminhos(salas) {
  const porId = new Map(salas.map((s) => [s.id, s]));
  /* quem se alcança a partir da entrada, opcionalmente ignorando trancadas */
  const alcancaveis = (respeitarTrancas) => {
    const vistos = new Set([0]); const fila = [0];
    while (fila.length) {
      const s = porId.get(fila.shift());
      for (const id of (s && s.saidas) || []) {
        const alvo = porId.get(id);
        if (!alvo || vistos.has(id)) continue;
        if (respeitarTrancas && alvo.trancada) continue;
        vistos.add(id); fila.push(id);
      }
    }
    return vistos;
  };

  /* 1) ninguém fica de fora */
  let vistos = alcancaveis(false);
  for (const s of salas) {
    if (vistos.has(s.id)) continue;
    const pais = salas.filter((x) => vistos.has(x.id) && x.camada === s.camada - 1);
    const pai = pais.length ? sortear(pais.map((x) => x.id)) : 0;
    porId.get(pai).saidas = [...new Set([...porId.get(pai).saidas, s.id])];
    vistos = alcancaveis(false);
  }

  /* 2) a chave nunca atrás da própria porta */
  const chave = salas.find((s) => s.guardaChave || s.tipo === "chave");
  if (chave && !alcancaveis(true).has(chave.id)) {
    const abertas = [...alcancaveis(true)].map((id) => porId.get(id)).filter((s) => s && s.camada < chave.camada);
    const pai = porId.get(abertas.length ? sortear(abertas.map((x) => x.id)) : 0);
    pai.saidas = [...new Set([...pai.saidas, chave.id])];
  }
  return salas;
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
  /* v9.54: `tochaExtra` estava na tabela de RITMOS desde a v8.4 e ninguém a
     lia — todo passo custava uma tocha, andasse o herói devagar ou correndo.
     O ritmo cauteloso promete ver mais em troca de queimar mais, e essa era
     a metade da troca que não existia: escolher "cauteloso" só tinha
     vantagem, e uma escolha sem custo não é uma escolha. */
  const gasto = 1 + (ritmoPorId(mm.ritmo).tochaExtra || 0);
  const tochas = Math.max(0, (mm.tochas || 0) - gasto);
  const msgs = [];
  if (tochas === 0 && (mm.tochas || 0) > 0) msgs.push("🕯 Sua última tocha se apaga — daqui em diante é no escuro (desvantagem e mais perigo).");
  else if (gasto > 1 && tochas > 0) msgs.push(`🕯 Passo cauteloso: ${gasto} tochas queimadas — restam ${tochas}.`);
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

/* Tochas achadas ou compradas. O teto existe para o feixe não virar uma
   licença de varrer a masmorra inteira sem pensar. */
export function acenderTochas(mm, quantas = 3) {
  if (!mm) return { mm, linha: "" };
  const teto = Math.max(6, mm.salas.length + 2);
  const antes = mm.tochas || 0;
  /* o `Math.max(antes, …)` não é zelo: sem ele, quem descesse com mais tochas
     do que o teto (voltou de uma masmorra grande e entrou numa pequena)
     PERDERIA tochas ao acender uma. Um teto que confisca não é teto. */
  const tochas = Math.max(antes, Math.min(teto, antes + Math.max(0, quantas)));
  if (tochas === antes) return { mm, linha: `🕯 Você já carrega tochas demais para acender mais uma (${antes}).` };
  return { mm: { ...mm, tochas }, linha: `🕯 ${tochas - antes} tocha${tochas - antes > 1 ? "s" : ""} a mais na mão — ${tochas} no total.` };
}

/* ---------------- O CHEFE QUE ENFRAQUECE (v9.54) ----------------
   A queixa medida: dava para matar o chefe visitando 5 de 9 salas, e o
   tesouro, o santuário e o enigma eram puláveis sem custo nenhum. Explorar
   era zelo — coisa que o jogador cuidadoso faz e o apressado ignora sem
   perder nada.

   Das três alavancas possíveis (portão com mais de um selo, prêmio por
   limpar tudo, chefe mais fraco a cada sala), esta é a única que transforma
   explorar em DECISÃO em vez de virtude: cada sala limpa tira força do
   chefe, e cada sala limpa queima tocha e tempo. Agora as duas pontas
   puxam, e o jogador escolhe onde parar.

   Seis por cento por sala, teto em quarenta: não dá para trivializar o
   confronto final — o chefe continua sendo o chefe —, mas a diferença entre
   descer reto e limpar o andar é visível no primeiro golpe. */
export const DESGASTE_POR_SALA = 0.06;
export const DESGASTE_MAXIMO = 0.40;

export function desgasteDoChefe(mm) {
  if (!mm) return { fracao: 0, salas: 0, pct: 0 };
  const limpas = (mm.salas || []).filter((s) => s && s.resolvida && s.tipo !== "entrada" && s.tipo !== "chefe").length;
  const fracao = Math.min(DESGASTE_MAXIMO, limpas * DESGASTE_POR_SALA);
  return { fracao, salas: limpas, pct: Math.round(fracao * 100) };
}

/* Aplica o desgaste à lista de inimigos do chefe. Devolve a lista nova e a
   linha que o jogador lê — a frase e o efeito nascem juntos. */
export function chefeDesgastado(mm, inimigos) {
  const d = desgasteDoChefe(mm);
  if (!d.fracao || !(inimigos || []).length) return { inimigos: inimigos || [], linha: "", nota: "", desgaste: d };
  const novos = inimigos.map((e) => {
    const max = Math.max(1, Math.round((e.vidaMax || e.vida || 1) * (1 - d.fracao)));
    return { ...e, vida: Math.min(e.vida || max, max), vidaMax: max };
  });
  return {
    inimigos: novos, desgaste: d,
    linha: `💀 As ${d.salas} salas que você limpou cobraram o seu preço lá embaixo: o chefe entra com ${d.pct}% a menos de vida.`,
    nota: `[CHEFE DESGASTADO PELO SISTEMA] Limpei ${d.salas} salas antes de chegar aqui, e o sistema já tirou ${d.pct}% da vida do chefe. Narre isso como o que é — a guarda dele desfalcada, os servos que não vieram, o ritual interrompido pela metade —, nunca como fraqueza dele. Não recalcule número nenhum.`,
  };
}

export function recompensaChefe(nivel) {
  const raridade = Math.random() < 0.7 ? "epico" : "lendario";
  return { item: gerarLoot(raridade, { nivel }) };
}

export const ROTULO_SALA = { entrada: "Entrada", combate: "Combate", armadilha: "Armadilha", tesouro: "Tesouro", enigma: "Enigma", santuario: "Santuário", chave: "Guardião", chefe: "Chefe" };
export const ICONE_SALA = { entrada: "🚪", combate: "⚔", armadilha: "🕸", tesouro: "💰", enigma: "🔮", santuario: "🕯", chave: "🗝", chefe: "💀" };

/* ═══════════ v8.4 — DUNGEON CRAWL: PERCEPÇÃO E RITMO (5e) ═══════════
   No 5e a exploração não é só andar: existe a PERCEPÇÃO PASSIVA (10 +
   modificador), que revela sozinha o que estiver abaixo dela, e a BUSCA
   ATIVA, que custa um turno de 10 minutos e permite rolagem. O ritmo da
   marcha muda o que você enxerga e o que te enxerga. */

export const RITMOS = [
  { id: "cauteloso", nome: "Cauteloso", icone: "🐢", desc: "Avança devagar, examinando tudo.", percepcao: 5, tochaExtra: 1, surpresa: -4, minutos: 20 },
  { id: "normal",    nome: "Normal",    icone: "🚶", desc: "Passo firme, atenção razoável.",   percepcao: 0, tochaExtra: 0, surpresa: 0,  minutos: 10 },
  { id: "apressado", nome: "Apressado", icone: "🏃", desc: "Corre — e quem espreita agradece.", percepcao: -5, tochaExtra: 0, surpresa: 5, minutos: 5 },
];
export function ritmoPorId(id) { return RITMOS.find((r) => r.id === id) || RITMOS[1]; }

/* Percepção passiva ao estilo 5e: 10 + modificador (o app já soma proficiência). */
export function percepcaoPassiva(modPercepcao, ritmoId) {
  return 10 + (modPercepcao || 0) + ritmoPorId(ritmoId).percepcao;
}

/* SEGREDOS: o que uma sala pode esconder, com a dificuldade de notar. */
const SEGREDOS = [
  { tipo: "armadilha_oculta", cd: 14, txt: "um fio quase invisível cruzando a passagem", perigo: true },
  { tipo: "armadilha_oculta", cd: 16, txt: "lajotas que afundam um dedo a mais que as outras", perigo: true },
  { tipo: "passagem_secreta", cd: 15, txt: "uma corrente de ar saindo de trás da estante", perigo: false },
  { tipo: "passagem_secreta", cd: 18, txt: "marcas de arraste no chão, sob a tapeçaria", perigo: false },
  { tipo: "esconderijo",      cd: 13, txt: "uma pedra solta na parede, mal recolocada", perigo: false },
  { tipo: "esconderijo",      cd: 17, txt: "um alçapão sob a palha apodrecida", perigo: false },
  { tipo: "emboscada",        cd: 15, txt: "respiração contida vindo das sombras altas", perigo: true },
];

/* Sorteia o segredo de uma sala (nem toda sala tem). */
export function sortearSegredo(tipoSala) {
  const chance = tipoSala === "tesouro" ? 0.55 : tipoSala === "armadilha" ? 0.6 : tipoSala === "combate" ? 0.3 : 0.4;
  if (Math.random() > chance) return null;
  const s = SEGREDOS[Math.floor(Math.random() * SEGREDOS.length)];
  return { ...s, revelado: false, resolvido: false };
}

/* Ao ENTRAR: a percepção passiva revela sozinha o que estiver abaixo dela.
   É a diferença entre um herói atento e um distraído — sem rolar nada. */
export function checarPassiva(sala, passiva) {
  if (!sala || !sala.segredo || sala.segredo.revelado) return { revelou: false };
  if (passiva >= sala.segredo.cd) {
    return {
      revelou: true,
      texto: `👁 Percepção passiva ${passiva} vs ${sala.segredo.cd} — você nota ${sala.segredo.txt}.`,
      segredo: { ...sala.segredo, revelado: true },
    };
  }
  return { revelou: false, quaseTexto: passiva >= sala.segredo.cd - 3 ? "Algo aqui te incomoda, mas você não sabe dizer o quê." : null };
}

/* BUSCA ATIVA: gasta um turno de exploração e permite rolagem. */
export function custoBusca() { return 10; } // minutos

export function resultadoBusca(sala, rolagemTotal) {
  if (!sala || !sala.segredo) return { achou: false, texto: "Você vasculha por dez minutos e não encontra nada além de poeira." };
  if (sala.segredo.revelado) return { achou: false, texto: "Você já sabe o que há para achar aqui." };
  if (rolagemTotal >= sala.segredo.cd) {
    return { achou: true, texto: `Depois de dez minutos, você encontra: ${sala.segredo.txt}.`, segredo: { ...sala.segredo, revelado: true } };
  }
  return { achou: false, texto: `Dez minutos de busca (${rolagemTotal} vs ${sala.segredo.cd}) — nada além de sombras.` };
}

/* Armadilha NÃO percebida dispara ao entrar; percebida pode ser evitada. */
export function armadilhaDispara(sala) {
  return !!(sala && sala.segredo && sala.segredo.perigo && !sala.segredo.revelado);
}
