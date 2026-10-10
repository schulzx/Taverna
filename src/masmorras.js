/* ============================================================
   MASMORRAS (v7.9) — Taverna
   Antes: um corredor linear onde o jogador só apertava "avançar".
   Agora: um GRAFO com escolhas reais — cada sala oferece saídas
   com PISTAS, o chefe fica trancado até você achar a chave, as
   tochas se gastam a cada passo e dá para recuar levando o que
   já ganhou. Decisão, risco e informação: é isso que faz masmorra.
   Tudo rolado por tabela; a IA só narra o que o sistema entrega.
   ============================================================ */
import { criaturasDoGenero, CRIATURAS_FANTASIA, ARQUETIPOS } from "./bestiario.js";
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
  /* ---------------- v9.167: A MESA FARTA ----------------
     Quatro trancas cobriam quatro atributos — Força e Presença nunca
     abriam porta nenhuma, e o herói forte resolvia todo enigma com o
     atributo dos outros. As quatro novas fecham a roda: cada atributo
     da ficha tem uma tranca que é DELE. */
  {
    id: "arrimo", atributo: "forca", rotulo: "arrimo", artigo: "O",
    o: "uma laje de pedra fora do eixo, com marcas de alavanca em volta",
    dicas: [
      "as marcas de alavanca são todas de quem tentou pelo lado errado",
      "a laje balança um dedo quando se empurra embaixo, e nada quando se empurra em cima",
      "o eixo não quebrou: saiu do encaixe — e encaixe tem direção",
    ],
  },
  {
    id: "selo", atributo: "presenca", rotulo: "selo", artigo: "O",
    o: "um selo de cera negra que esquenta quando alguém se aproxima",
    dicas: [
      "a cera esquenta mais quando se fala com ela do que quando se toca",
      "há três nomes riscados na soleira — e um espaço em branco",
      "o selo não pede uma senha: pede uma AFIRMAÇÃO, dita como quem manda",
    ],
  },
  {
    id: "agulha", atributo: "destreza", rotulo: "agulha", artigo: "A",
    o: "uma fechadura de doze agulhas finas, e um chão limpo demais na frente",
    dicas: [
      "das doze agulhas, só três têm o brilho de quem trabalha — as outras são isca",
      "o chão limpo é onde os dedos dos apressados caíram",
      "a terceira agulha só cede depois que as outras duas ficam presas juntas",
    ],
  },
  {
    id: "contas", atributo: "intelecto", rotulo: "contas", artigo: "As",
    o: "um ábaco de pedra na parede, com uma dívida gravada embaixo",
    dicas: [
      "a dívida gravada tem três parcelas, e a soma delas está errada de propósito",
      "duas pedras do ábaco não deslizam — já estão na posição certa",
      "o que se paga aqui não é o total: é o TROCO",
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

/* ---------------- A PLANTA DO TAMANHO QUE O MUNDO ANUNCIA (MM16 nº 4) ----------------
   O mundo anuncia cada masmorra com nível e número de salas ("🛕 A Nave de
   Ferro (templo, nível 6, 12 salas)", `oQueExisteAqui`, mundo-base.js) — é
   o que o Narrador lê no prompt, o que o povo comenta e o que o veredito à
   porta mede (`vereditoDaMasmorra`, boca.js). E ao entrar o gerador fazia
   a planta pelo NÍVEL, com 6 a 11 salas: na sessão de prova o mundo dizia
   12 e a planta tinha 6 ("ENTRADA 1/6"). A v9.115 já tinha corrigido a
   metade disto — o nível passou a vir do mapa —, e o tamanho ficou para
   trás: o cartaz e o chão contando histórias diferentes outra vez.

   Com `opcoes.salas`, a planta nasce com ESSE número exato de salas
   (entrada e chefe incluídos), clampado à tabela. As larguras das camadas
   saem da conta abaixo, sem sorte — o que muda de uma masmorra para outra
   continua a ser o que mora em cada sala. Sem a opção, o gerador é o de
   sempre, chamada a chamada (o mesmo número de sorteios, na mesma ordem).

   `larguraMaxima` é a de sempre (2-3 por camada); `camadasMinimas` é a
   profundidade mínima que o gerador sempre teve (a chave nunca na primeira
   camada inteira quando há duas); o teto e o piso de salas cobrem o que o
   mundo anuncia (5 a 12, mundo-base.js) com folga, e abaixo de 4 não há
   miolo para a chave. */
export const PLANTA_DA_MASMORRA = {
  larguraMaxima: 3,
  camadasMinimas: 2,
  salasMinimas: 4,
  salasMaximas: 20,
};

/* As larguras das camadas do miolo para uma planta de `n` salas no total
   (entrada + miolo + chefe). As primeiras camadas ficam com a sobra: o
   leque abre largo à porta e afunila para o fundo. `null` para lixo. */
export function larguraDasCamadas(n) {
  const T = PLANTA_DA_MASMORRA;
  const num = typeof n === "number" ? n : typeof n === "string" && n.trim() ? Number(n) : NaN;
  if (!Number.isFinite(num)) return null;
  const total = Math.max(T.salasMinimas, Math.min(T.salasMaximas, Math.round(num)));
  const miolo = total - 2;
  const camadas = Math.max(T.camadasMinimas, Math.ceil(miolo / T.larguraMaxima));
  const base = Math.floor(miolo / camadas), sobra = miolo % camadas;
  return Array.from({ length: camadas }, (_, i) => base + (i < sobra ? 1 : 0));
}

/* ---------------- A FICHA É A PLANTA (MM17, pendência nº 1 · v9.363) ----------------
   A região delimitada (regiao.js) dá a cada lugar uma FICHA, e nela `quem`:
   os bichos daquele chão que andam por lá. É o que o povo comenta, o que o
   mapa vivo mostra e o que a pauta lá dentro diz ao Narrador ("de fora,
   sabe-se que por lá andam…"). E ao entrar a planta sorteava os PRÓPRIOS
   bichos do bestiário do género (`rolarGrupo`): medido em 200 mundos
   (`medir-regiao.mjs`, secção i), 0 dos 1.285 lugares tinham a planta toda
   dentro da ficha, e só 1.210 dos 8.045 inimigos postos nas salas (15%)
   eram bichos que a ficha nomeava — num mundo com léxico, 0. O Narrador
   ouvia "Elemental Menor, Ogro" à porta e encontrava um Dragão Jovem na
   primeira sala — o cartaz e o chão contando histórias diferentes outra vez
   (a v9.115 corrigiu o nível; a MM16 nº 4, as salas; isto é o resto).

   A ficha manda. Com `opcoes.quem` (a lista da ficha), a planta nasce como
   sempre — os MESMOS sorteios, na mesma ordem, a mesma forma, as mesmas
   salas, o mesmo tamanho de cada grupo — e no fim os inimigos de cada sala
   de luta (combate, guardião, chefe) passam a ser os da ficha, por conta e
   sem sorte nenhuma:
     · o CHEFE é o mais forte da ficha (ameaça, depois nível), com a ameaça
       erguida até `pisoDoChefe` — o alfa da matilha, não um Dragão que
       ninguém anunciou;
     · os outros lugares de cada grupo andam numa RODA pela ficha, os não
       chefes primeiro: o guardião da chave (que existe em toda planta, e
       vem antes do fundo) já põe o primeiro deles em cena, e por isso todo
       bicho que a ficha nomeia aparece em alguma sala sempre que a planta
       tem lugares de luta que cheguem (com a ficha de dois, sempre).
   A ameaça de cada bicho vem da ficha (`ameaca`, que a região grava desde
   esta versão); numa ficha de antes dela, do bestiário pelo nome; e, num
   nome que o léxico do mundo deu, pela tabela do nível abaixo — o mesmo
   degrau de onde o léxico tirou o nome.

   Sem a opção, nada disto corre: a planta é a de antes, byte a byte
   (teste-ficha-e-planta.mjs guarda os hashes). */
export const FICHA_NA_PLANTA = {
  /* a escada das ameaças, da mais fraca à mais forte (a de bestiario.js) */
  ameacas: ["fraco", "comum", "competente", "elite", "lendario"],
  /* o chefe da ficha nunca entra abaixo disto (o de sempre era elite ou lendário) */
  pisoDoChefe: "elite",
  /* a ameaça de um nome que nem a ficha nem o bestiário dizem, pelo nível —
     os degraus do bestiário (fraco 1-2, comum 2-3, competente 4-5, elite 7-9,
     lendário 10+) */
  ameacaPeloNivel: [
    { ate: 1, ameaca: "fraco" },
    { ate: 3, ameaca: "comum" },
    { ate: 6, ameaca: "competente" },
    { ate: 9, ameaca: "elite" },
    { ate: Infinity, ameaca: "lendario" },
  ],
  /* sem nível nem nada: o meio da escada */
  ameacaSemNivel: "comum",
  /* quantos bichos da ficha a planta aceita, e o tamanho de um nome — lixo
     grande não vira planta */
  maximo: 6,
  nomeMaximo: 60,
};

const BESTIARIO_INTEIRO = [...CRIATURAS_FANTASIA, ...ARQUETIPOS];

/* A lista da ficha, limpa: `[{ nome, ameaca, nivel }]` (nivel `null` quando
   a ficha não o diz), sem repetidos, na ordem da ficha. Lixo é `[]`. */
export function bichosDaFicha(quem) {
  const T = FICHA_NA_PLANTA;
  if (!Array.isArray(quem)) return [];
  const vistos = new Set();
  const out = [];
  for (const q of quem) {
    if (out.length >= T.maximo) break;
    if (!q || typeof q !== "object") continue;
    const nome = typeof q.nome === "string" ? q.nome.trim().slice(0, T.nomeMaximo) : "";
    if (!nome || vistos.has(nome)) continue;
    vistos.add(nome);
    const nv = Number(q.nivel);
    const nivel = q.nivel != null && Number.isFinite(nv) && nv > 0 ? Math.round(nv) : null;
    const base = BESTIARIO_INTEIRO.find((c) => c.nome === nome);
    const ameaca = T.ameacas.includes(q.ameaca) ? q.ameaca
      : base ? base.ameaca
      : nivel == null ? T.ameacaSemNivel
      : T.ameacaPeloNivel.find((x) => nivel <= x.ate).ameaca;
    out.push({ nome, ameaca, nivel });
  }
  return out;
}

/* A planta `mm` com os inimigos da ficha `quem` (ver o bloco acima). Pura:
   devolve uma planta nova e não toca na recebida; sem bichos válidos na
   ficha, ou planta lixo, devolve a MESMA. É para a planta que acaba de
   nascer — numa já percorrida, renomearia quem já caiu. */
export function plantaDaFicha(mm, quem) {
  const bichos = bichosDaFicha(quem);
  if (!bichos.length || !mm || typeof mm !== "object" || !Array.isArray(mm.salas)) return mm;
  const T = FICHA_NA_PLANTA;
  const degrau = (a) => T.ameacas.indexOf(a);
  const chefe = bichos.reduce((m, b) => (degrau(b.ameaca) > degrau(m.ameaca) || (degrau(b.ameaca) === degrau(m.ameaca) && (b.nivel || 0) > (m.nivel || 0)) ? b : m));
  const roda = [...bichos.filter((b) => b !== chefe), chefe];
  let k = 0;
  const daRoda = () => { const b = roda[k % roda.length]; k++; return { nome: b.nome, ameaca: b.ameaca }; };
  const deLuta = (s) => !!(s && typeof s === "object" && Object.prototype.hasOwnProperty.call(SALAS_DE_LUTA, s.tipo) && Array.isArray(s.inimigos));
  const quantos = (s) => Math.max(1, s.inimigos.length);
  /* o miolo primeiro, na ordem da planta; o fundo por último — é o que põe
     o guardião (e os não chefes) em cena antes de a roda chegar ao chefe */
  const novos = new Map();
  for (const s of mm.salas) if (deLuta(s) && s.tipo !== "chefe") novos.set(s, Array.from({ length: quantos(s) }, daRoda));
  const ameacaDoChefe = degrau(chefe.ameaca) >= degrau(T.pisoDoChefe) ? chefe.ameaca : T.pisoDoChefe;
  for (const s of mm.salas) {
    if (deLuta(s) && s.tipo === "chefe") novos.set(s, [{ nome: chefe.nome, ameaca: ameacaDoChefe }, ...Array.from({ length: quantos(s) - 1 }, daRoda)]);
  }
  return { ...mm, salas: mm.salas.map((s) => (novos.has(s) ? { ...s, inimigos: novos.get(s) } : s)) };
}

/* ---------------- GERADOR: grafo em camadas ----------------
   entrada → camada 1 (2-3 salas) → camada 2 (2-3) → [camada 3] → chefe
   Cada sala liga a 2 salas da camada seguinte. Uma sala do miolo guarda
   a CHAVE; sem ela o portão do chefe não abre.
   MM16 nº 4: `opcoes.salas` — a planta com o número que o mundo anuncia
   (ver PLANTA_DA_MASMORRA, acima). `opcoes` pode vir `null`.
   MM17 (v9.363): `opcoes.quem` — a lista da ficha do lugar; os inimigos
   saem dela (ver FICHA_NA_PLANTA, acima). */
export function gerarMasmorra(genero, nivel, nomeSugerido = "", opcoes = null) {
  const nome = nomeSugerido || `${sortear(LUGARES)} ${sortear(EPITETOS)}`;
  const larguras = opcoes && typeof opcoes === "object" && opcoes.salas != null ? larguraDasCamadas(opcoes.salas) : null;
  const nCamadas = larguras ? larguras.length : nivel >= 8 ? 3 : 2;
  const salas = [{ id: 0, tipo: "entrada", camada: 0, saidas: [], visitada: true, resolvida: true }];
  let idSeq = 1;
  let anterior = [0];

  for (let c = 1; c <= nCamadas; c++) {
    const largura = larguras ? larguras[c - 1] : 2 + (Math.random() < 0.45 ? 1 : 0);
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
  const planta = { nome, nivel: Math.max(1, Math.round(Number(nivel) || 1)), salas: completas, atual: 0, tochas: tochasIniciais(completas), chave: false, ritmo: "normal", saques: { moedas: 0, itens: 0 }, encerrada: false };
  return opcoes && typeof opcoes === "object" && opcoes.quem != null ? plantaDaFicha(planta, opcoes.quem) : planta;
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
  /* MM14: `jaLimpa` é o estado da sala ANTES do passo — quem chama decide
     por ele se o conteúdo dela acontece de novo (nunca). A entrada é
     "resolvida" desde que nasce e não tem conteúdo: não conta. */
  const jaLimpa = alvo.resolvida === true && alvo.tipo !== "entrada";
  return { mm: { ...mm, salas, atual: id, tochas }, msgs, sala: salas.find((s) => s.id === id), jaLimpa };
}

/* ---------------- A SALA LIMPA FICA LIMPA (MM14) ----------------
   Voltar a uma sala resolvida refazia tudo o que ela tinha: a luta abria
   de novo com os mesmos corpos, de vida cheia (a sessão de prova, MM11,
   T34: "Esqueleto 8/8 e Slime 4/4", os dois que ela tinha matado no T29),
   e no turno seguinte o próprio sistema avisava o Narrador de que estavam
   mortos. A porta do App (`irParaSala`) lia só o TIPO da sala e nunca se
   ela já estava resolvida — e o mesmo buraco pagava o tesouro outra vez,
   curava outra vez no santuário, disparava a armadilha outra vez e abria
   o enigma de uma porta já aberta.

   A regra: o que uma sala tinha acontece UMA vez. Voltar é andar — gasta
   a tocha e o tempo do passo, como sempre — e a cena é a sala como ficou.
   `oQueFicou` é o que o Narrador lê sobre ela (O QUE, nunca o COMO), e
   `linha` é o que a tela diz: gameplay, sem nome de mecanismo. */
export const SALA_LIMPA = {
  combate: { oQueFicou: "a luta aqui já acabou", linha: "A sala está como você a deixou." },
  chave: { oQueFicou: "o guardião já caiu e o que ele guardava já foi levado", linha: "A sala está como você a deixou." },
  armadilha: { oQueFicou: "a armadilha já disparou e não se rearma", linha: "A armadilha daqui já disparou." },
  tesouro: { oQueFicou: "o tesouro já foi levado — o que resta é o vazio onde ele estava", linha: "Aqui já não há nada para levar." },
  santuario: { oQueFicou: "o refúgio já deu o que tinha a dar nesta descida", linha: "O refúgio já deu o que tinha." },
  enigma: { oQueFicou: "a tranca já cedeu e a passagem continua aberta", linha: "A passagem continua aberta." },
  chefe: { oQueFicou: "o chefe já caiu", linha: "A sala está como você a deixou." },
};

/* O que voltar a uma sala limpa entrega: `{ linha, envelope }`, ou `null`
   quando a sala não está limpa (ou é lixo, ou é a entrada) — aí a porta
   segue o caminho de sempre. `pos` é a posição que o App já monta para os
   outros envelopes da masmorra. Os nomes de quem caiu vão ao Narrador pelo
   nome, e o veto diz o que ele não pode fazer com eles: é a mesma verdade
   que a "correção do sistema" dizia um turno tarde demais. As opções
   podem vir `null` (o `= {}` do destructuring não o cobre). */
export function voltarASalaLimpa(sala, opcoes) {
  const pos = opcoes && typeof opcoes === "object" ? opcoes.pos : "";
  if (!sala || typeof sala !== "object" || sala.resolvida !== true || sala.tipo === "entrada") return null;
  const t = SALA_LIMPA[sala.tipo] || SALA_LIMPA.combate;
  const caidos = [...new Set((Array.isArray(sala.inimigos) ? sala.inimigos : [])
    .map((i) => String((i && i.nome) || "").trim()).filter(Boolean))];
  const onde = String(pos || "").trim();
  const quem = caidos.length
    ? ` Quem lutou aqui continua caído: ${caidos.join(", ")} — não se levanta, não reaparece, não volta a atacar.`
    : "";
  const envelope = `[MASMORRA${onde ? ` — ${onde}` : ""} · SALA JÁ RESOLVIDA — NADA SE REPETE] Volto a uma sala por onde já passei: ${t.oQueFicou}.${quem} Nada salta das sombras e nada se paga outra vez. Descreva em 1-2 frases a sala como ficou e me passe a vez.`;
  return { linha: t.linha, envelope };
}

export function marcarResolvida(mm, id, extras = {}) {
  const salas = mm.salas.map((s) => s.id === id ? { ...s, resolvida: true } : s);
  const achouChave = mm.salas.find((s) => s.id === id && s.guardaChave);
  return { ...mm, salas, chave: mm.chave || !!achouChave, saques: { moedas: (mm.saques?.moedas || 0) + (extras.moedas || 0), itens: (mm.saques?.itens || 0) + (extras.itens || 0) } };
}

/* ---------------- A MASMORRA SE ACABA (MM11, 3.ª sessão de prova) ----------------
   A sala do Guardião (`tipo: "chave"`) tem inimigos e `guardaChave`, mas a
   porta do App só abria combate para `combate` e `chefe`: a `chave` caía fora
   de todos os ramos, o guardião nunca caía, a chave nunca soltava e o portão
   do chefe nunca abria. Toda masmorra era um beco sem saída de fato — e o
   gerador, que jura que a chave é alcançável, jurava a verdade e não adiantava.
   Do outro lado, a luta que o SISTEMA fechava ("todos os inimigos caíram")
   deixava a sala `resolvida:false`: só o ramo da resposta do Narrador a fechava.

   Duas decisões, as duas puras, para as duas portas de vitória chamarem a
   mesma coisa:

   1) QUEM ABRE LUTA e o que cada um diz — `SALAS_DE_LUTA`. Cada tipo guarda o
      aviso de tela, o rótulo do envelope e a fórmula da abertura. Combate e
      chefe dizem EXATAMENTE o que o App dizia inline (regressão zero); o
      guardião é o texto novo.
   2) O DESFECHO de uma luta vencida — `desfechoDaLuta`: resolve a sala, larga
      a chave se era a do guardião, e devolve o aviso e a nota. IDEMPOTENTE: a
      segunda chamada (o outro caminho de vitória) não repete nem a chave nem o
      aviso. O Narrador nunca decide se a chave caiu — o sistema decide, e o
      envelope do guardião diz isso a ele. */
export const SALAS_DE_LUTA = {
  combate: {
    aviso: "Emboscada na masmorra!", rotulo: "COMBATE",
    abertura: "Avanço para a próxima sala e os inimigos saltam das sombras",
    fecho: "",
  },
  chefe: {
    aviso: "A sala do chefe!", rotulo: "CHEFE",
    abertura: "Avanço para a próxima sala e os inimigos saltam das sombras",
    fecho: " É o confronto final desta masmorra — narre à altura.",
  },
  chave: {
    aviso: "O guardião da chave!", rotulo: "GUARDIÃO",
    abertura: "Avanço para a próxima sala e o guardião se ergue entre as correntes e o selo na pedra",
    fecho: " É quem guarda a chave do portão do chefe — narre o peso disso, mas NÃO diga que a chave caiu nem onde ela está: quem decide isso é o sistema, ao fim da luta.",
  },
};

/* O que o guardião largou ao cair: o que a tela diz e o que o Narrador lê. */
const DESPOJO_DA_CHAVE = {
  aviso: "🗝 Entre os despojos: a CHAVE do portão lacrado. O caminho para o chefe se abre.",
  nota: "[MASMORRA] Achei a chave do portão do chefe entre os restos do guardião. Mencione isso na narração.",
};

/* `{ aviso, rotulo, abertura, fecho }` se a sala abre luta; `null` se não
   (tesouro, armadilha, santuário, enigma, entrada — ou lixo). */
export function abreLuta(sala) {
  if (!sala || typeof sala !== "object") return null;
  const tipo = sala.tipo;
  return typeof tipo === "string" && Object.prototype.hasOwnProperty.call(SALAS_DE_LUTA, tipo) ? SALAS_DE_LUTA[tipo] : null;
}

/* A linha que a tela mostra ao abrir a luta. `nomes` pode vir `null`. */
export function linhaDaLuta(sala, nomes) {
  const l = abreLuta(sala);
  if (!l) return "";
  return `⚔ ${l.aviso} ${(Array.isArray(nomes) ? nomes : []).join(", ")} — o combate está aberto.`;
}

/* O envelope que o Narrador recebe ao abrir a luta. `pos` é a posição que o
   App já monta para os envelopes da masmorra; `lista` é "Nome (nv N, V PV), …";
   `depois` é o que o App cola ao fim (desgaste do chefe, percepção, tempo).
   As opções podem vir `null` (o `= {}` do destructuring não o cobre). */
export function envelopeDaLuta(sala, opcoes) {
  const l = abreLuta(sala);
  if (!l) return "";
  const o = opcoes && typeof opcoes === "object" ? opcoes : {};
  const pos = o.pos == null ? "" : String(o.pos), lista = o.lista == null ? "" : String(o.lista), depois = o.depois == null ? "" : String(o.depois);
  return `[MASMORRA — ${pos} · ${l.rotulo} — COMBATE JÁ ABERTO PELO SISTEMA] ${l.abertura}: ${lista}. O HUD de combate JÁ ESTÁ ABERTO — NÃO envie "combate_iniciar". Descreva a sala e a investida inicial em 1-2 frases e me passe a vez (eu ajo pelos botões de combate).${l.fecho}${depois}`;
}

/* A luta da sala `id` acabou em vitória. Devolve
   `{ mm, resolveuAgora, chaveNova, ehChefe, aviso, nota }`:
   - `resolveuAgora`: a sala NÃO estava resolvida e agora está (só na 1.ª vez);
   - `chaveNova`: a chave do portão caiu AGORA (só na 1.ª vez; um guardião
     vencido com a chave já na mão, ou já resolvido, não a repete);
   - `ehChefe`: a sala é a do chefe (a masmorra chegou ao fim) — fato da sala,
     não do momento: quem quiser "só agora" combina com `resolveuAgora`;
   - `aviso`/`nota`: a linha de tela e a nota ao Narrador sobre a chave, ou `""`.
   Tolera `mm` null/sem salas e id inexistente (devolve o que veio, sem efeito).
   Uma sala já resolvida devolve a MESMA masmorra, exceto num save que ficou
   incoerente (guardião resolvido sem a chave — o defeito, preso no disco): aí
   a chave cai, uma vez. */
export function desfechoDaLuta(mm, id) {
  const nada = { mm, resolveuAgora: false, chaveNova: false, ehChefe: false, aviso: "", nota: "" };
  if (!mm || typeof mm !== "object" || !Array.isArray(mm.salas)) return nada;
  const sala = mm.salas.find((s) => s && s.id === id);
  if (!sala) return nada;
  const ehChefe = sala.tipo === "chefe";
  const jaResolvida = sala.resolvida === true;
  const faltaChave = sala.guardaChave === true && !mm.chave;
  if (jaResolvida && !faltaChave) return { ...nada, ehChefe };
  const novo = marcarResolvida(mm, id);
  const chaveNova = !mm.chave && novo.chave === true;
  return {
    mm: novo, resolveuAgora: !jaResolvida, chaveNova, ehChefe,
    aviso: chaveNova ? DESPOJO_DA_CHAVE.aviso : "",
    nota: chaveNova ? DESPOJO_DA_CHAVE.nota : "",
  };
}

export function progressoMasmorra(mm) {
  if (!mm) return { visitadas: 0, total: 0, pct: 0 };
  const total = mm.salas.length;
  const visitadas = mm.salas.filter((s) => s.visitada).length;
  return { visitadas, total, pct: Math.round((visitadas / total) * 100) };
}

export function noEscuro(mm) { return !mm || (mm.tochas || 0) <= 0; }

/* ============================================================
   A MASMORRA NA PAUTA (MM16 nº 4) — a sala onde estou, por turno

   Na terceira sessão de prova (`mente/mm11-sessao-3.md`, M13) a heroína
   parou à soleira e perguntou ao Mestre o que havia na câmara, quantos
   eram, a quantos metros, e onde se esconder. A pauta não tinha a sala:
   o ONDE dizia "no posto da estrada · (aqui isto é um forte)" — a fogueira
   de antes da porta —, sem GUARDIÃO, sem quem lá estava (o save tinha um
   Goblin e um Lobo), sem passagens nem distâncias. As quatro perguntas
   perderam-se, e o Mestre inventou salões. A planta inteira estava no
   estado da masmorra, e o sistema não a contava a quem narra.

   Isto é a planta dita ao Narrador, no canal por turno (a seção MASMORRA
   de `pauta.js`) — nunca bloco estático. Tudo se lê do estado: nada se
   inventa, e o que o herói ainda não viu continua escondido (das salas por
   abrir vai só a PISTA, o que se percebe da soleira, como na tela).

     0. QUE SALA é esta não mora aqui: vai na 1.ª linha do ONDE, que é de
        ferro (`salaEmPalavras`, lida por `linhaDoLugar` no geografo.js) —
        "dentro da Nave de Ferro, na sala do guardião da chave". A sala onde
        se está é o lugar, e o lugar nunca cai da pauta;
     1. a planta: a camada, quantas salas se viram (o número da PLANTA,
        não o que o mundo anuncia), a luz;
     2. o que nela resta: quem lá está de pé, quem lá ficou caído, o que a
        sala já deu (o `oQueFicou` da SALA_LIMPA), a tranca por abrir;
     3. as passagens: para a frente, a pista de cada uma; para trás, a sala
        de onde se veio; o portão do fundo;
     4. o fundo: a quantas passagens fica o portão, e se a chave já caiu.

   NA LUTA vai só a 1: quem está, onde e a quantos metros é o tabuleiro que
   diz (o TERRENO DA LUTA e o CONTRA), e dizê-lo duas vezes seria duas
   versões da mesma verdade. A ordem das linhas é a ordem do corte: a
   primeira é a última a cair. */
/* Que sala é esta, dito como lugar (o tipo, nunca o que há nela por ver).
   É a frase que segue "dentro da <masmorra>," na 1.ª linha do ONDE. */
export const SALA_EM_PALAVRAS = {
  entrada: "à entrada",
  combate: "numa sala de luta",
  armadilha: "numa sala armadilhada",
  tesouro: "numa sala de tesouro",
  enigma: "diante de uma tranca",
  santuario: "num refúgio",
  chave: "na sala do guardião da chave",
  chefe: "na sala do chefe",
};

/* A sala atual em palavras, ou "" (sem planta, sala perdida, tipo novo). */
export function salaEmPalavras(mm) {
  if (!mm || typeof mm !== "object" || !Array.isArray(mm.salas)) return "";
  const sala = mm.salas.find((s) => s && s.id === mm.atual);
  return (sala && Object.prototype.hasOwnProperty.call(SALA_EM_PALAVRAS, sala.tipo) && SALA_EM_PALAVRAS[sala.tipo]) || "";
}

export const MASMORRA_NA_PAUTA = {
  /* nomes de quem está na sala, de pé ou caído (o resto vira "e mais N") */
  maxNomes: 4,
  /* passagens ditas, para a frente e para trás somadas */
  maxPassagens: 4,
};

/* Quantas passagens separam a sala `de` da sala `para`, andando pela planta
   nos dois sentidos (para a frente pelas saídas, para trás pelo recuo).
   `null` quando não há caminho ou a planta é lixo. */
export function passagensAte(mm, de, para) {
  if (!mm || !Array.isArray(mm.salas)) return null;
  const vizinhos = new Map(mm.salas.filter((s) => s && s.id != null).map((s) => [s.id, new Set()]));
  for (const s of mm.salas) {
    if (!s || !vizinhos.has(s.id)) continue;
    for (const id of s.saidas || []) if (vizinhos.has(id)) { vizinhos.get(s.id).add(id); vizinhos.get(id).add(s.id); }
  }
  if (!vizinhos.has(de) || !vizinhos.has(para)) return null;
  const dist = new Map([[de, 0]]); const fila = [de];
  while (fila.length) {
    const a = fila.shift();
    if (a === para) return dist.get(a);
    for (const b of vizinhos.get(a)) if (!dist.has(b)) { dist.set(b, dist.get(a) + 1); fila.push(b); }
  }
  return null;
}

/* "Lobo, Goblin ×2" — os nomes de uma lista de inimigos, contados, até ao teto */
function nomesContados(lista) {
  const conta = new Map();
  for (const i of Array.isArray(lista) ? lista : []) {
    const n = String((i && i.nome) || "").trim();
    if (n) conta.set(n, (conta.get(n) || 0) + 1);
  }
  const todos = [...conta].map(([n, q]) => (q > 1 ? `${n} ×${q}` : n));
  const max = MASMORRA_NA_PAUTA.maxNomes;
  return todos.length > max ? `${todos.slice(0, max).join(", ")} e mais ${todos.length - max}` : todos.join(", ");
}

/* As linhas da seção MASMORRA para esta masmorra, ou `[]` (fora dela, ou
   lixo). `opcoes.luta` (booleano) corta para a linha da sala. As opções
   podem vir `null`. Nunca muta a masmorra. */
export function masmorraParaPauta(mm, opcoes) {
  const luta = !!(opcoes && typeof opcoes === "object" && opcoes.luta === true);
  if (!mm || typeof mm !== "object" || !Array.isArray(mm.salas) || !mm.salas.length) return [];
  const sala = mm.salas.find((s) => s && s.id === mm.atual);
  if (!sala) return [];
  const prog = progressoMasmorra(mm);
  const chefe = mm.salas.find((s) => s && s.tipo === "chefe") || null;
  const fundo = Math.max(...mm.salas.map((s) => Number(s && s.camada) || 0));
  const rotulo = (s) => ROTULO_SALA[s && s.tipo] || "sala";
  const luz = noEscuro(mm) ? "NO ESCURO: nenhuma tocha acesa" : `${mm.tochas} ${mm.tochas === 1 ? "tocha" : "tochas"} na mão`;
  const linhas = [`camada ${Number(sala.camada) || 0} de ${fundo} · ${prog.visitadas} das ${prog.total} salas da planta já vistas · ${luz}`];
  if (luta) return linhas;

  /* 2. o que nela resta */
  const nomes = nomesContados(sala.inimigos);
  let resta = "";
  if (sala.tipo === "entrada") resta = "a boca: por aqui se sai da masmorra";
  else if (sala.resolvida === true) resta = `${(SALA_LIMPA[sala.tipo] || SALA_LIMPA.combate).oQueFicou}${nomes ? ` — caídos aqui: ${nomes}` : ""}`;
  else if (nomes) resta = `de pé aqui: ${nomes}`;
  else if (sala.tipo === "enigma") resta = `a tranca (${trancaPorId(sala.tranca).rotulo}) ainda por abrir`;
  if (resta) linhas.push(resta);

  /* 3. as passagens: para a frente, a pista; para trás, a sala de onde se veio */
  const frente = saidasDe(mm).map((x) => (chefe && x.id === chefe.id
    ? "o portão do fundo"
    : x.visitada ? `${rotulo(x)} (${x.pista})` : x.pista));
  const tras = saidasDeRecuo(mm).map((x) => `de volta: ${rotulo(x)}`);
  const passagens = [...frente, ...tras].filter(Boolean);
  const max = MASMORRA_NA_PAUTA.maxPassagens;
  if (passagens.length) linhas.push(`passagens: ${passagens.slice(0, max).join(" · ")}${passagens.length > max ? ` · e mais ${passagens.length - max}` : ""}`);
  else linhas.push("passagens: nenhuma para a frente — só se volta por onde se veio");

  /* 4. o fundo: a distância na planta e a chave */
  if (chefe && chefe.resolvida === true) linhas.push("o chefe já caiu: a masmorra está vencida");
  else if (chefe && chefe.id !== sala.id) {
    const d = passagensAte(mm, sala.id, chefe.id);
    const onde = d == null ? "" : d === 1 ? "a uma passagem daqui" : `a ${d} passagens daqui`;
    linhas.push(`o portão do fundo${onde ? `: ${onde}` : ""}, ${mm.chave ? "e a chave já caiu — abre" : "lacrado — a chave ainda não caiu"}`);
  }
  return linhas;
}

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
  /* v9.167: DUAS a mais, não quatro — cada virada precisa de um efeito
     que o código EXECUTA (ameaça, defesa, vida, capangas são os botões
     que existem), e virada de fachada é a regra escrita sem código
     atrás, que é o defeito que este módulo veio matar. */
  { id: "escancara", diz: "joga a guarda fora", nota: "ele para de se defender de vez: fica fácil de acertar e muito pior de levar — o tempo passa a correr contra quem hesita" },
  { id: "convoca_o_braco", diz: "chama o braço-direito", nota: "não é a horda: é UM, o de confiança, e ele chega sabendo lutar" },
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
  /* v9.167: as duas novas. A troca do escancara é honesta nos dois
     sentidos — a defesa cai de verdade e a ameaça sobe DOIS degraus. */
  if (v.id === "escancara") {
    c.defesa = Math.max(8, (c.defesa || 12) - 2);
    c.ameaca = subir(subir(c.ameaca));
  }
  if (v.id === "convoca_o_braco") {
    capangas = [{ nome: "Braço-direito do Chefe", ameaca: "competente", chamado: true }];
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
