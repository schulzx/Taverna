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
/* As quatro trancas, e o que cada uma pede. `dicas` é o que a sala
   ensina a quem erra — na ordem em que ela ensina. */
export const TRANCAS = [
  {
    id: "mecanismo", atributo: "destreza", rotulo: "mecanismo", artigo: "O",
    o: "uma porta com três alavancas e uma inscrição gasta",
    dicas: [
      "as três alavancas têm marcas de uso desiguais — uma foi puxada muito mais",
      "a inscrição fala de uma ORDEM, não de um número",
      "a do meio range ao ceder; as outras duas não fazem som nenhum",
    ],
  },
  {
    id: "inscricao", atributo: "intelecto", rotulo: "inscrição", artigo: "A",
    o: "runas frias que piscam numa sequência que se repete",
    dicas: [
      "a sequência repete a cada sete piscadas, e a sétima é mais longa",
      "duas runas são a mesma letra em idades diferentes da língua",
      "o que está escrito não é uma ordem: é um nome",
    ],
  },
  {
    id: "padrao", atributo: "percepcao", rotulo: "padrão", artigo: "O",
    o: "estátuas que apontam para direções diferentes",
    dicas: [
      "uma das estátuas foi girada há pouco — o pó no pedestal está limpo de um lado",
      "as direções não apontam para portas: apontam para o teto",
      "há uma marca no chão onde todas as linhas se cruzariam",
    ],
  },
  {
    id: "peso", atributo: "vigor", rotulo: "peso", artigo: "A balança de",
    o: "uma balança antiga com pesos estranhos e um poço embaixo",
    dicas: [
      "os pratos não estão nivelados, e o desnível é sempre o mesmo",
      "um dos pesos é oco — pesa menos do que o tamanho promete",
      "o poço embaixo não é armadilha: é o contrapeso",
    ],
  },
];
export const trancaPorId = (id) => TRANCAS.find((t) => t.id === id) || TRANCAS[0];

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
  /* v9.151: a sala de enigma nasce com uma TRANCA — qual atributo a abre
     e o que ela ensina a quem erra. O campo cena continua para o
     Narrador ter a imagem, mas quem julga agora e o sistema. */
  if (tipo === "enigma") { const tr = sortear(TRANCAS); return { cena: tr.o, tranca: tr.id, tentativasEnigma: 0 }; }
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
  /* O NÍVEL FICA GRAVADO (v9.115). A masmorra nascia com um nível, gastava
     ele para escolher bicho, armadilha e tesouro, e o esquecia — de dentro
     não havia como saber o tamanho do lugar em que se estava.

     Era a mesma perda que a missão tinha: guardava-se o PREÇO e jogava-se
     fora o TAMANHO. E aqui doía mais, porque o mapa ANUNCIA o nível da
     masmorra ("Poço de Raízes, nível 11") e quem entrava recebia outra,
     feita no nível do herói. O cartaz e o chão contando histórias
     diferentes sobre o mesmo lugar. */
  return { nome, nivel: Math.max(1, Math.round(Number(nivel) || 1)), salas: completas, atual: 0, tochas: tochasIniciais(completas), chave: false, ritmo: "normal", saques: { moedas: 0, itens: 0 }, encerrada: false };
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

export function recompensaChefe(nivel, lex = null) {
  const raridade = Math.random() < 0.7 ? "epico" : "lendario";
  return { item: gerarLoot(raridade, { nivel, lex }) };
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

/* ============================================================
   O ENIGMA DEIXA DE SER PROSA (v9.151)

   Era a última porta da masmorra em que a IA decidia o que existe E
   julgava se deu certo. O envelope dizia, com todas as letras:

     "A sala trava o caminho com: [uma frase]. Apresente a cena e o
      desafio NA FICÇÃO — me deixe resolver."

   Ou seja: o Narrador inventava o enigma, ouvia a resposta do jogador e
   decidia sozinho se ela servia. Nenhuma das três coisas é dele. E o
   sintoma disso não é abstrato: um enigma julgado por quem quer contar
   uma boa cena abre quando a cena precisa que abra, e o jogador aprende
   em duas masmorras que basta escrever com confiança.

   ---------------- O QUE UM ENIGMA É, MECANICAMENTE ----------------

   É uma tranca com CHAVE DECLARADA. Cada tipo de enigma diz qual
   atributo o abre — o mecanismo pede dedos, a inscrição pede letras, o
   padrão pede olho. Isso importa porque transforma "o jogador é
   inteligente?" em "o PERSONAGEM tem a ferramenta?", que é a pergunta
   que um RPG faz.

   ---------------- FALHAR É PROGRESSO ----------------

   A regra que define este módulo: cada tentativa que falha ENTREGA UMA
   PISTA e baixa a dificuldade da próxima. Uma sala trancada que o
   jogador não consegue passar é uma campanha morta, e um enigma que se
   resolve num dado só não é enigma, é uma fechadura.

   Então o enigma não é um muro: é um SUMIDOURO DE TEMPO. Dez minutos por
   tentativa, e tempo numa masmorra é tocha e é o que vaga pelos
   corredores. O jogador que insiste passa; ele paga em luz. É a mesma
   escolha que o desgaste do chefe já oferece do outro lado.
   ============================================================ */


/* ---------------- O PREÇO DE CADA TENTATIVA ----------------
   Dez minutos é o mesmo que buscar uma sala (`TEMPO.turnoBuscaMasmorra`),
   e é de propósito: examinar uma tranca custa o que examinar um quarto
   custa. Números diferentes para o mesmo gesto seriam duas regras. */
export const MINUTOS_POR_TENTATIVA = 10;

/* Quanto a dificuldade cai a cada pista. Três pistas tiram seis do alvo —
   o bastante para virar o jogo de um personagem que não tem o atributo,
   e não o bastante para tornar a primeira tentativa irrelevante. */
export const ALIVIO_POR_DICA = 2;

export function enigmaDaSala(sala) {
  const t = trancaPorId(sala && sala.tranca);
  return { ...t, tentativas: Math.max(0, Number((sala || {}).tentativasEnigma) || 0) };
}

/* A dificuldade é o PERFIL de sempre, resolvido pelo modificador do herói,
   menos o que as pistas já entregaram. O piso existe porque a última
   pista praticamente diz a resposta: a partir dali é um formalismo, e um
   formalismo que trava a campanha seria pior do que não ter enigma. */
export function dificuldadeDoEnigma(base, tentativas) {
  const n = Math.max(0, Number(tentativas) || 0);
  return Math.max(8, Math.round(Number(base) || 14) - n * ALIVIO_POR_DICA);
}

/* Devolve o que aconteceu — nunca o que se deve narrar. */
export function tentarEnigma(sala, { total, dc }) {
  const e = enigmaDaSala(sala);
  const abriu = Number(total) >= Number(dc);
  const proxima = e.tentativas + 1;
  return {
    abriu,
    tranca: e.id,
    rotulo: e.rotulo,
    artigo: e.artigo,
    tentativa: proxima,
    /* a pista da tentativa que acabou de falhar; quando acabam, a sala
       não tem mais o que ensinar e só resta insistir */
    dica: abriu ? "" : (e.dicas[e.tentativas] || ""),
    semMaisDicas: !abriu && e.tentativas >= e.dicas.length,
    minutos: MINUTOS_POR_TENTATIVA,
  };
}

/* O ARTIGO SAI DA TABELA, e não de um `a` fixo na frase. "A mecanismo" foi
   o que a primeira versão escreveu — e concordância errada numa linha do
   sistema estraga mais do que parece: ela é a única frase da tela que o
   jogador sabe que não foi a IA que escreveu, então ela tem de estar
   certa. Mesmo motivo do `comA` em `lugar.js`. */
export function falaDoEnigma(r) {
  if (!r) return "";
  const quem = `${r.artigo || "A"} ${r.rotulo}`;
  if (r.abriu) return `🔮 ${quem} cede na ${r.tentativa}ª tentativa.`;
  return `🔮 ${quem} não cede (${r.tentativa}ª tentativa, −${MINUTOS_POR_TENTATIVA} min)${r.dica ? ` — mas você nota: ${r.dica}.` : r.semMaisDicas ? " — e a sala já não tem mais o que ensinar." : ""}`;
}

/* O envelope diz o que ACONTECEU, e proíbe as três coisas que o antigo
   pedia: inventar o enigma, julgar a resposta e resolver a sala. */
export function envelopeDoEnigma(r, e, pos = "") {
  if (!r) return "";
  const cab = `[MASMORRA — ${pos} · ENIGMA ${r.abriu ? "ABERTO" : "RESISTIU"} — RESOLVIDO PELO SISTEMA] A sala trava o caminho com ${e.o}. Eu tentei abrir usando ${e.rotulo}, e o sistema rolou: ${r.abriu ? "PASSOU" : "FALHOU"} (tentativa ${r.tentativa}).`;
  if (r.abriu) {
    return `${cab}
REGRA DESTE ENVELOPE (obrigatória): narre a tranca cedendo em duas ou três frases — o mecanismo que enfim obedece, o que há do outro lado. NÃO invente um enigma diferente do que está escrito aqui, NÃO explique a solução como se fosse minha ideia e NÃO me dê nada além da passagem.`;
  }
  return `${cab}${r.dica ? ` A sala me ensinou uma coisa: ${r.dica}.` : ""}
REGRA DESTE ENVELOPE (obrigatória): eu NÃO abri. Narre a tentativa e o que ela custou em duas ou três frases${r.dica ? ", e mostre na ficção a coisa que eu notei — como observação minha, não como resposta pronta" : ""}. NÃO abra a passagem, NÃO revele a solução, NÃO ofereça uma saída alternativa e NÃO deixe a resposta escapar numa descrição. Depois devolva a palavra para mim.`;
}


/* ============================================================
   O CHEFE VIRA (v9.151) — fases por PV, e não por vontade da IA

   O chefe da masmorra era um combate comum, maior. Ele já tinha uma
   coisa boa — o DESGASTE, que faz cada sala limpa tirar vida dele —, e
   isso resolve o antes do confronto. Faltava o durante: um chefe que faz
   a mesma coisa do primeiro ao último golpe é um saco de pontos de vida.

   ---------------- O QUE UMA FASE PODE SER AQUI ----------------

   Só quatro coisas, e as quatro são coisas que o combate JÁ resolve
   sozinho. Isso não é preguiça: é a diferença entre uma fase e um
   adjetivo. Se a virada não muda um número que o sistema usa, ela é o
   Narrador dizendo "ele fica mais perigoso" — e o jogador não sente nada.

     ENFURECE  sobe a ameaça um degrau. É a maior das quatro, porque a
               ameaça manda em três lugares de uma vez: bônus de ataque,
               dano por golpe e QUANTOS golpes ele dá por rodada (elite
               bate duas vezes; lendário, até três).
     ENCOURA   soma defesa. O jogador erra mais, e a luta estica.
     CHAMA     traz capangas. Muda o problema de tático para aritmético:
               agora há mais de um alvo e o dano entra por mais lados.
     REERGUE   devolve vida. A única que pode frustrar, e por isso é a
               única com teto: nunca passa da metade do que ele tinha.

   ---------------- POR QUE DUAS, E NÃO TRÊS ----------------

   Metade e um quarto. Três viradas numa luta que dura seis rodadas
   significaria virar quase todo turno, e uma surpresa que acontece
   sempre deixa de ser surpresa.

   ---------------- O MESMO CHEFE VIRA SEMPRE IGUAL ----------------

   As viradas saem do NOME, como a índole das pessoas e a altura das
   paredes. O Colosso do Sino Rachado é sempre o que se encoura e depois
   chama; quem lutou com ele uma vez sabe, e esse saber vale alguma
   coisa. Sorteio a cada luta apagaria isso e não daria nada em troca.
   ============================================================ */

export const LIMIARES = [0.5, 0.25];

export const VIRADAS = [
  { id: "enfurece", diz: "se enfurece", nota: "a fúria dele passa a ser método: mais golpes, e mais fundo" },
  { id: "encoura", diz: "endurece", nota: "a pele ou a guarda dele fecha — acertá-lo passa a ser trabalho" },
  { id: "chama", diz: "chama os seus", nota: "ele não estava sozinho, e agora os outros vêm" },
  { id: "reergue", diz: "se reergue", nota: "alguma coisa nele se remenda — não milagre, teimosia" },
];
export const viradaPorId = (id) => VIRADAS.find((v) => v.id === id) || VIRADAS[0];

/* O mesmo truque de semente do resto da casa: soma dos códigos do nome.
   Determinístico, barato, e nada precisa ser guardado. */
const semear = (nome) => {
  let h = 0;
  for (const c of String(nome || "chefe")) h = (h * 31 + c.charCodeAt(0)) % 100000;
  return h;
};

/* Duas viradas DIFERENTES: repetir "endurece" duas vezes seria a mesma
   luta duas vezes, e o segundo limiar existe justamente para o jogador
   ter de mudar de plano de novo. */
export function fasesDoChefe(nome) {
  const h = semear(nome);
  const primeira = h % VIRADAS.length;
  const segunda = (primeira + 1 + (Math.floor(h / VIRADAS.length) % (VIRADAS.length - 1))) % VIRADAS.length;
  return LIMIARES.map((em, i) => ({ em, virada: VIRADAS[i === 0 ? primeira : segunda].id }));
}

const ESCADA = ["fraco", "comum", "competente", "elite", "lendario"];
const subir = (a) => ESCADA[Math.min(ESCADA.length - 1, Math.max(0, ESCADA.indexOf(a)) + 1)];

/* Aplica a virada ao chefe. Devolve o chefe novo, os capangas que
   entram (se entram) e a linha que o jogador lê — os três nascem juntos,
   porque a frase que descreve uma coisa que o sistema não fez é
   exatamente o defeito que este módulo veio consertar. */
export function aplicarVirada(chefe, viradaId) {
  const v = viradaPorId(viradaId);
  const c = { ...chefe };
  let capangas = [];
  if (v.id === "enfurece") c.ameaca = subir(c.ameaca);
  if (v.id === "encoura") c.defesa = (c.defesa || 12) + 3;
  if (v.id === "reergue") {
    const teto = Math.round((c.vidaMax || 1) * 0.5);
    c.vida = Math.min(teto, (c.vida || 0) + Math.round((c.vidaMax || 1) * 0.15));
  }
  if (v.id === "chama") {
    capangas = [{ nome: "Servo do Chefe", ameaca: "comum", chamado: true }];
  }
  return { chefe: c, capangas, virada: v };
}

/* Qual limiar acabou de ser cruzado, se algum. Compara ANTES e DEPOIS
   porque um golpe grande pode cruzar os dois de uma vez — e nesse caso
   vale o mais fundo: o chefe não faz duas cenas no mesmo instante. */
export function viradaAoCruzar(chefe, vidaAntes, vidaAgora, jaViradas = []) {
  const max = Number(chefe && chefe.vidaMax) || 0;
  if (!max || vidaAgora <= 0) return null;
  const feitas = new Set(Array.isArray(jaViradas) ? jaViradas : []);
  const fases = fasesDoChefe(chefe && chefe.nome);
  let escolhida = null;
  for (const f of fases) {
    const limiar = max * f.em;
    if (feitas.has(f.em)) continue;
    if (vidaAntes > limiar && vidaAgora <= limiar) escolhida = f;
  }
  return escolhida;
}

/* O NOME DIZ DE QUEM E A VIRADA, e nao so que houve uma. Tres modulos
   ja tinham "virada": adversario.js (a do vilao), historia.js (a do arco)
   e tramas.js, que registrou o mesmo aperto em comentario. A colisao
   quebrou o build na hora — e o conserto e na ORIGEM, nunca um apelido
   no import: apelido conserta um arquivo e deixa a armadilha de pe. */
export function falaDaViradaDoChefe(nome, v, pct) {
  if (!v) return "";
  return `💀 ${nome} ${v.diz} — ${pct}% de vida.`;
}

export function envelopeDaViradaDoChefe(nome, v, pct) {
  if (!v) return "";
  return `[CHEFE — VIRADA APLICADA PELO SISTEMA] ${nome} cruzou ${pct}% de vida e o sistema JÁ mudou a luta: ele ${v.diz}. O que isso é, por dentro: ${v.nota}.
REGRA DESTE ENVELOPE (obrigatória): narre a virada em uma ou duas frases, como um momento — o instante em que a luta muda de assunto. NÃO invente número nenhum, NÃO declare morte de ninguém e NÃO desfaça a virada no turno seguinte: ela vale até o fim da luta.`;
}
