/* ============================================================
   ONDE EU ESTOU (v9.39) — o terceiro lugar

   O sistema conhecia dois lugares e só dois: DENTRO de uma cidade
   (`cidadeAtual`) ou EM VIAGEM entre cidades (`jornada`). Tudo o que
   a ficção inventasse no meio — a fazenda de Jessa a quarenta minutos
   a pé, a caverna atrás da colina, o acampamento onde a arapuca está
   armada — não existia para o código.

   E aí acontecia o pior tipo de bug, o que parece má-fé da IA e não é.
   O rodapé do sistema afirma, em TODO turno: "Local: em Baixo
   Brumoso". Depois de o herói caminhar até a fazenda, essa linha
   virava mentira — e o Mestre, que foi construído para obedecer o
   sistema acima da própria memória, fazia a única coisa coerente que
   podia fazer: narrava o herói de volta à cidade, para que a frase
   voltasse a ser verdade. O jogador armava a armadilha, mandava passar
   doze horas e era teletransportado para a cidade. Insistia, e o
   Mestre inventava três dias de marcha para um lugar que ficava a uma
   caminhada — porque nada, em lugar nenhum, dizia onde aquilo era.

   Não era desobediência. Era obediência a uma mentira.

   Este módulo é a verdade que faltava: um lugar NOMEADO, ancorado a
   uma cidade, que o sistema guarda entre turnos e defende.

   DUAS REGRAS:

   1) O LUGAR É DA FICÇÃO, A MEMÓRIA É DO SISTEMA. Quem diz que o herói
      chegou à fazenda é o Mestre (ou o Cronista, lendo o que foi
      narrado) — é um fato da história, e fatos da história são dele.
      Mas quem LEMBRA, turno após turno, e quem impede que ele seja
      desfeito por descuido, é o código.

   2) ESTAR FORA NÃO É ESTAR LONGE. Um lugar nos arredores é uma
      caminhada, não uma expedição: ir e voltar custa horas. Sem isso
      escrito, o Mestre arbitra a distância cena a cena — e arbitra
      sempre a favor da cena que ele já tem na cabeça, que é a cidade.
   ============================================================ */

const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

/* Quanto custa ir e voltar. Um lugar do dia a dia da região não vira
   viagem: viagem tem sistema próprio (`jornada`) e mapa próprio. */
/* v9.54: `dentro` é a terceira distância, e ela existia como buraco. Um
   andar de torre, um porão, a sala do trono — tudo isso caía em "arredores"
   e vinha com a régua de HORAS colada: o Mestre lia "ir e voltar leva horas"
   para descer uma escada. A distância mais curta do jogo estava sendo
   descrita como a do meio, e a consequência era pior do que parece: o herói
   que subia à torre para pegar um livro perdia a tarde. */
export const DISTANCIAS = {
  dentro: { id: "dentro", rotulo: "dentro", dentro: true, volta: "sair daqui leva MINUTOS — é uma escada, um corredor, uma porta" },
  arredores: { id: "arredores", rotulo: "nos arredores", volta: "ir e voltar leva HORAS, não dias" },
  perto: { id: "perto", rotulo: "a meio dia daqui", volta: "ir e voltar leva a maior parte de um dia" },
};
export function distanciaDe(id) { return DISTANCIAS[id] || DISTANCIAS.arredores; }

/* De que distância é este lugar, lido do NOME. A lista é curta e literal de
   propósito: só palavras que só podem significar interior. "de cima" não
   entra — "o moinho de cima" fica nos arredores, e é ali que ele fica. Na
   dúvida, arredores, que é o comportamento de sempre. */
const RX_DENTRO = /\b(andar|piso|sobrado|porao|porão|subsolo|sotao|sótão|adega|cripta|catacumba|cela|calabouco|calabouço|corredor|escadaria|escada|salao|salão|sala|saguao|saguão|atrio|átrio|nave|campanario|campanário|cozinha|despensa|quarto|alcova|biblioteca|arquivo|oficina|forja|adro interno|topo da torre|alto da torre|cume da torre|dentro d[aeo])\b/;

export function distanciaPorTexto(nome) {
  const n = norm(nome);
  if (!n) return "arredores";
  return RX_DENTRO.test(n) ? "dentro" : "arredores";
}

/* ============================================================
   IR A UM LUGAR DA CIDADE (v9.55)

   Achado jogando: "Vou até o Javali Cambaleante". O Mestre narrou a
   travessia da praça e a porta da taverna — perfeito — e o sistema
   continuou com o herói no centro, porque ninguém registrou nada. O
   marcador do mapa não saiu do lugar.

   E o Mestre estava CERTO em não registrar: o prompt lhe diz, desde a
   v9.39, que `lugar_atual` é para o que fica FORA da cidade, e que voltar
   à cidade é `lugar_atual: null`. A taverna não é fora da cidade. O
   sistema tinha um modelo com dois estados — "na cidade" e "fora dela" —
   e a cidade inteira cabia no primeiro.

   Então quem move é o CÓDIGO, e move antes de o Mestre responder: o
   jogador escreveu o nome de um lugar que o sistema conhece, com um verbo
   de deslocamento. Não há o que interpretar, e é exatamente o tipo de
   coisa que esta casa não delega.

   A RÉGUA É ESTREITA DE PROPÓSITO. Falar de um lugar não é ir até ele:
   "pergunto ao taberneiro sobre a forja" tem o nome e não tem a viagem.
   Exige-se o verbo E o nome, e um falso positivo aqui teleporta o herói —
   que é o erro que este arquivo inteiro existe para impedir.
   ============================================================ */

const RX_VOU = /\b(vou|vamos|sigo|segui|caminho|ando|marcho|me dirijo|dirijo-?me|entro|entrar|adentro|rumo a|rumo ao|chego|chegar|visito|visitar|passo n[ao]|passar n[ao]|procuro|procurar|subo|desco|volto para|retorno a|me encaminho|encaminho-?me|parto para|atravesso ate|atravesso para)\b/;
/* "até X" sozinho já é deslocamento em português falado ("até a forja!") */
const RX_ATE = /\bat[eé]\s+[ao]?\s*\w/;

/* Palavras que não distinguem nada e por isso não podem casar sozinhas. */
const VAZIAS = new Set(["a", "o", "as", "os", "da", "do", "das", "dos", "de", "e", "em", "na", "no", "um", "uma", "the"]);
const pedacos = (s) => norm(s).split(/[^a-z0-9]+/).filter((p) => p.length > 2 && !VAZIAS.has(p));

/* Quanto do NOME do lugar aparece no que o jogador escreveu. Um nome de
   duas palavras casa com uma delas ("javali" → "O Javali Cambaleante");
   um nome de uma palavra precisa dela inteira. */
/* v9.58: a palavra tem que acabar onde acaba. Era `\b${p}` sem fim, e com os
   cômodos isso virou erro de verdade: "desço para o salão" casava com "a
   SALA dos fundos", porque "sala" é prefixo de "salao". O sufixo aceito é o
   plural do português — a forja e as forjas são o mesmo lugar.

   E vale nos DOIS sentidos: o cômodo se chama "os quartos do sótão" e o
   jogador escreve "subo para o quarto". Só -os e -as viram singular, que são
   os plurais que os nomes deste jogo usam; "cais" e "país" não são plurais
   de nada e não podem ser desmanchados. */
const singular = (p) => (/(os|as)$/.test(p) && p.length > 4 ? p.slice(0, -1) : p);
const RX_PEDACO = (p) => new RegExp(`\\b${singular(p)}(s|es)?\\b`);

function casaNome(texto, nome) {
  const t = norm(texto);
  const ps = pedacos(nome);
  if (!ps.length) return false;
  if (t.includes(norm(nome))) return true;
  const achados = ps.filter((p) => RX_PEDACO(p).test(t)).length;
  return ps.length === 1 ? achados === 1 : achados >= Math.min(2, ps.length - 0) || achados / ps.length >= 0.5;
}

/* Devolve o lugar que o jogador pediu, ou null. `lugares` é a lista de
   candidatos — os locais de dentro da cidade e o cinturão de fora —, e
   cada um precisa de `nome`; o resto vem junto para quem chama usar. */
/* ============================================================
   O LUGAR TAMBÉM SE PEDE PELO TIPO (v9.76)

   "Cada lugar tem seu nome, mas também tem seu tipo — mercado, templo,
   taverna. Se eu digo 'vou até o mercado' ele identifica o mercado
   daquela cidade e me leva até lá."

   E não identificava. A busca era só por NOME, e os nomes são gerados
   pela toponímia: o templo de uma cidade se chama "Santuário das
   Cinzas" e o de outra "Ermida do Vau". Ninguém decora isso, e ninguém
   deveria — o jogador diz o que a coisa É.

   O estrago era maior do que parecia. "Vou até o templo" casa
   `querPartir` ("vou ate"), então, não encontrando lugar local, a frase
   caía no resolver de CIDADES, que procurava um assentamento chamado
   "templo", não achava, e respondia "Não encontrei 'vou até o templo' no
   que você conhece do mundo" — o sistema negando um lugar que ele mesmo
   desenhou na planta da cidade, três metros à frente do herói.

   As palavras são as que um jogador usa, não as que a toponímia usa
   para BATIZAR: quem escreve "vou à igreja" quer o templo, mesmo que
   "igreja" nunca apareça em nome nenhum. E o NOME continua ganhando do
   tipo — quem escreveu "Santuário das Cinzas" já disse qual é.
   ============================================================ */
export const PALAVRAS_DO_TIPO = {
  /* dentro da cidade */
  taverna: ["taverna", "estalagem", "hospedaria", "albergue", "pousada", "bar", "botequim"],
  mercado: ["mercado", "feira", "praca", "bazar", "comercio", "entreposto", "pregao"],
  templo: ["templo", "igreja", "santuario", "capela", "altar", "oratorio", "ermida", "basilica"],
  forja: ["forja", "ferraria", "ferreiro", "bigorna", "fundicao"],
  quartel: ["quartel", "guarnicao", "casa da guarda", "baluarte", "bastiao"],
  cadeia: ["cadeia", "carcere", "prisao", "calabouco", "enxovia", "celas"],
  biblioteca: ["biblioteca", "arquivo", "livraria", "cartorio"],
  docas: ["docas", "cais", "porto", "ancoradouro", "pier", "estaleiro"],
  arena: ["arena", "coliseu", "ringue", "rinha"],
  "cemitério": ["cemiterio", "necropole", "jazigo", "campo santo", "ossario", "sepultura"],
  guilda: ["guilda", "confraria"],
  "casa de banhos": ["casa de banhos", "banhos", "termas", "cisterna"],
  torre: ["torre"],
  forte: ["forte", "fortaleza", "castelo"],
  /* e o cinturão de fora, que tem tipos próprios (arredores.js) */
  capela: ["templo", "igreja", "santuario", "capela", "ermida"],
  fazenda: ["fazenda", "granja", "roca", "courela", "terras baixas"],
  moinho: ["moinho", "azenha"],
  ponte: ["ponte", "passagem estreita"],
  "ruína": ["ruina", "ruinas", "pedras antigas", "casarao vazio", "torre caida"],
  mina: ["mina", "galeria", "poco fundo"],
  pedreira: ["pedreira", "lavra", "corte de pedra"],
  pomar: ["pomar", "figueiras", "olival"],
  cabana: ["cabana", "choca", "casa de muda"],
  embarcadouro: ["embarcadouro", "atracadouro"],
  salinas: ["salinas", "marinha de sal"],
  posto: ["posto", "posto da guarda", "guarita"],
  "cemitério de fora": ["cemiterio", "campo santo", "vala"],
};

/* OS TIPOS que a frase pede — plural de propósito. Uma palavra pode
   apontar para mais de um tipo, e isso não é ambiguidade: é o mundo. O
   templo DENTRO da cidade e a capela do cinturão de FORA são tipos
   diferentes no gerador e a mesma coisa para quem escreve "vou à igreja".
   Foi exatamente isso que fez a primeira versão desta função falhar em
   jogo: a cidade da prova não tinha templo dentro, tinha "o santuário à
   beira do caminho" fora, e o pedido não achava nada.

   A palavra mais longa ganha — "casa de banhos" contém "casa", e "banhos"
   sozinho não pode roubar dela. */
export function tiposPedidos(texto) {
  const t = norm(texto);
  if (!t.trim()) return [];
  let melhores = [], tamanho = 0;
  for (const [tipo, palavras] of Object.entries(PALAVRAS_DO_TIPO)) {
    let meu = 0;
    for (const p of palavras) {
      if (p.length <= meu) continue;
      if (new RegExp(`\\b${p}s?\\b`).test(t)) meu = p.length;
    }
    if (!meu) continue;
    if (meu > tamanho) { tamanho = meu; melhores = [tipo]; }
    else if (meu === tamanho) melhores.push(tipo);
  }
  return melhores;
}

/* Compatibilidade com quem só quer um: o primeiro da lista. */
export function tipoPedido(texto) { return tiposPedidos(texto)[0] || null; }

export function lugarPedido(texto, lugares = []) {
  const t = norm(texto);
  if (!t.trim() || !(RX_VOU.test(t) || RX_ATE.test(t))) return null;
  /* o mais específico ganha: entre "a Forja" e "a Forja Velha", casa a que
     tem mais pedaços reconhecidos no texto.

     v9.58: MAS O NOME INTEIRO GANHA DE TUDO. Sem este degrau, "desço para o
     salão" perdia para "a sala dos fundos" — dois pedaços contra um, e o
     jogador que escreveu o nome exato de um lugar ia parar noutro. Quem
     escreveu o nome todo já disse qual é; contar pedaços ali é discutir com
     o jogador sobre o que ele acabou de dizer. */
  let melhor = null, pontos = 0;
  for (const l of lugares) {
    if (!l || !l.nome || !casaNome(t, l.nome)) continue;
    const inteiro = t.includes(norm(l.nome)) ? 100 : 0;
    const p = inteiro + pedacos(l.nome).length;
    if (p > pontos) { pontos = p; melhor = l; }
  }
  if (melhor) return melhor;
  /* O NOME GANHA DO TIPO, sempre: quem escreveu "Santuário das Cinzas" já
     disse qual é, e discutir com ele seria o mesmo erro do "salão" contra a
     "sala dos fundos". O tipo só entra quando nome nenhum casou. */
  const tipos = tiposPedidos(t);
  if (!tipos.length) return null;
  const doTipo = lugares.filter((l) => l && tipos.includes(l.tipo));
  if (!doTipo.length) return null;
  /* DENTRO GANHA DE FORA, e é a regra que faz "vou à igreja" servir nas
     duas cidades: onde há templo, o templo; onde não há, a capela da
     encruzilhada, a quarenta minutos de caminhada. Quem diz "vou ao
     mercado" quer o da praça, não o entreposto do cinturão. */
  return doTipo.find((l) => l.onde === "comodo")
    || doTipo.find((l) => l.onde === "dentro")
    || doTipo[0];
}

export function garantirLugar(l) {
  if (!l || !l.nome) return null;
  return {
    nome: String(l.nome).slice(0, 60).trim(),
    cidade: String(l.cidade || "").slice(0, 60).trim(),
    /* v9.58: DE QUE PRÉDIO este lugar é um cômodo. Vazio quando o lugar é o
       prédio inteiro — que é o caso de quase tudo. Sem este campo o quarto de
       cima da taverna e a taverna eram o mesmo tipo de coisa, e "desço para o
       salão" não tinha para onde descer. */
    dentroDe: String(l.dentroDe || "").slice(0, 60).trim(),
    distancia: DISTANCIAS[l.distancia] ? l.distancia : "arredores",
    desde: Number.isFinite(l.desde) ? l.desde : 0,
  };
}

export function definirLugar(nome, { cidade = "", dia = 0, distancia = null, dentroDe = "" } = {}) {
  /* sem distância declarada, o NOME decide — quem chama não deveria precisar
     saber se "o segundo andar da torre" é uma escada ou uma caminhada */
  return garantirLugar({ nome, cidade, dia, dentroDe, distancia: distancia || distanciaPorTexto(nome), desde: dia });
}

/* O mesmo lugar de novo não é um lugar novo: evita reanunciar a cada
   turno em que o Mestre repete o nome. */
export function ehOMesmoLugar(a, b) {
  if (!a || !b) return !a && !b;
  return norm(a.nome) === norm(b.nome);
}

/* Um "lugar" que na verdade é a própria cidade não é sublocal nenhum —
   é o herói em casa, e registrar isso criaria um fantasma que o rodapé
   passaria a defender contra a realidade. */
export function ehAPropriaCidade(nome, cidade) {
  const n = norm(nome), c = norm(cidade);
  if (!n || !c) return false;
  if (n === c) return true;
  /* "em Baixo Brumoso", "a cidade de Baixo Brumoso": não acrescentam lugar
     nenhum ao que já é a cidade. Já "a fazenda de Jessa" acrescenta. */
  return n.replace(/^(em|na|no|a cidade de|a vila de|o povoado de|o vilarejo de)\s+/, "").trim() === c;
}

/* Os nomes vêm da ficção com artigo colado ("a fazenda de Jessa"), e
   "em a fazenda" saiu feio na tela no primeiro teste. A contração é
   burra de propósito: só resolve o artigo inicial, que é o caso real. */
/* v9.100: e o INDEFINIDO também. "Você monta acampamento uma estalagem em
   Forte do Vigia" foi o que apareceu na tela quando o sítio do
   acampamento passou por aqui: o mapa devolve "uma estalagem em X", "um
   refúgio aliado em X", e a contração só conhecia "a" e "o". A regra do
   português é a mesma dos dois lados — em+uma=numa, em+um=num —, e as
   quatro linhas de baixo são a mesma burrice deliberada das quatro de
   cima. Ordem importa: "as" antes de "a", "uma" antes de "um", senão o
   prefixo curto casa primeiro e come a palavra errada. */
export function comEm(nome) {
  const s = String(nome || "").trim();
  if (/^as\s+/i.test(s)) return `n${s.replace(/^as\s+/i, "as ")}`;
  if (/^os\s+/i.test(s)) return `n${s.replace(/^os\s+/i, "os ")}`;
  if (/^a\s+/i.test(s)) return `n${s.replace(/^a\s+/i, "a ")}`;
  if (/^o\s+/i.test(s)) return `n${s.replace(/^o\s+/i, "o ")}`;
  if (/^umas\s+/i.test(s)) return `n${s.replace(/^umas\s+/i, "umas ")}`;
  if (/^uns\s+/i.test(s)) return `n${s.replace(/^uns\s+/i, "uns ")}`;
  if (/^uma\s+/i.test(s)) return `n${s.replace(/^uma\s+/i, "uma ")}`;
  if (/^um\s+/i.test(s)) return `n${s.replace(/^um\s+/i, "um ")}`;
  return `em ${s}`;
}

/* A mesma burrice deliberada para "de": "o quarto de cima de O Javali
   Cambaleante" foi o que apareceu na primeira passada. */
export function comDe(nome) {
  const s = String(nome || "").trim();
  if (/^as\s+/i.test(s)) return `d${s.replace(/^as\s+/i, "as ")}`;
  if (/^os\s+/i.test(s)) return `d${s.replace(/^os\s+/i, "os ")}`;
  if (/^a\s+/i.test(s)) return `d${s.replace(/^a\s+/i, "a ")}`;
  if (/^o\s+/i.test(s)) return `d${s.replace(/^o\s+/i, "o ")}`;
  /* e o INDEFINIDO fica de fora deste: "duma estalagem" é português
     correto e não é o português que se fala nesta mesa. Cai no `de ` de
     baixo, que já dizia "de uma estalagem" — que é o certo aqui. */
  return `de ${s}`;
}

export function textoDoLugar(l) {
  if (!l) return "";
  const d = distanciaDe(l.distancia);
  return `${l.nome}${l.cidade ? ` (${d.rotulo} de ${l.cidade})` : ""}`;
}

/* A linha do rodapé. É aqui que a mentira virava teleporte, então é
   aqui que a verdade precisa ser mais firme do que em qualquer outro
   lugar do prompt. */
export function linhaDeLugar(l) {
  if (!l) return "";
  const d = distanciaDe(l.distancia);
  /* v9.54: um andar de torre não é "fora da cidade" — pode estar no meio
     dela. A frase de sempre defendia o herói de ser teleportado de volta; a
     de dentro defende a mesma coisa dizendo a verdade sobre onde ele está. */
  if (d.dentro) {
    return `${comEm(l.nome)}${l.dentroDe ? `, dentro ${comDe(l.dentroDe)}` : ""}${l.cidade ? `, dentro de ${l.cidade}` : ""} — e este é um lugar INTERNO: ${d.volta}. Eu não estou no salão principal nem na rua, e você NÃO me tira daqui: só eu decido descer, sair ou passar para outro cômodo, e só quando eu escrever isso. Toda cena acontece AQUI.`;
  }
  return `FORA DA CIDADE, ${comEm(l.nome)}${l.cidade ? ` — ${d.rotulo} de ${l.cidade}, ${d.volta}` : ""}. Eu NÃO estou na cidade e você NÃO me devolve a ela: só eu decido voltar, e só quando eu escrever isso. Enquanto eu não disser, toda cena acontece AQUI, inclusive as horas que passam, o que espero e o que vigio.`;
}

export function resumoLugarPrompt(l, cidade) {
  if (!l) return "";
  const d = distanciaDe(l.distancia);
  return `ONDE EU ESTOU: ${l.nome}${l.dentroDe ? `, um cômodo ${comDe(l.dentroDe)}` : ""}${l.cidade ? `, ${d.dentro ? "dentro de" : `${d.rotulo} de`} ${l.cidade}` : ""}.
- Este lugar é REAL e o sistema o guarda entre turnos. A lista de locais e de gente da cidade abaixo é o que existe LÁ, não aqui: use-a como o mundo ao redor, não como a cena.
- ${d.volta.charAt(0).toUpperCase() + d.volta.slice(1)} — ${d.dentro ? "nunca transforme sair de um cômodo numa expedição, e nunca cobre horas por uma escada." : "nunca transforme a volta numa viagem de dias."}
- Se eu esperar, vigiar, dormir ou deixar o tempo passar, isso acontece AQUI. Faça o mundo vir até mim: ${d.dentro ? "quem sobe a escada, o que se ouve pelo assoalho, a porta que range" : "quem aparece na estrada, o que se ouve ao longe, o que cai na armadilha"}.
- Só saio daqui quando EU escrever que saio. Se eu voltar ${d.dentro ? "para fora" : "à cidade"}, registre "lugar_atual": null.`;
}

/* ---------------- O CÃO DE GUARDA ----------------
   Função pura sobre o texto, roda antes de o jogador ver. Morde só o
   caso que doeu de verdade: o sistema tem um lugar registrado, a
   narrativa põe o herói de volta na cidade, e o jogador NÃO pediu isso.

   A régua é estreita de propósito. Mencionar a cidade não é voltar
   para ela ("o rumor de Baixo Brumoso ficou para trás" é cor, não
   deslocamento), e falso positivo custa uma chamada e uma cena. */
const VERBOS_DE_VOLTA = [
  "de volta a", "de volta à", "de volta para", "devolve voce a", "devolve voce à", "devolve voce para",
  "retorna a", "retorna à", "retorna para", "voce retorna", "voce volta", "volta a", "volta à",
  "chega a", "chega à", "chega em", "voce chega", "reencontra as ruas", "cruza os portoes de",
  "as portas de", "entra em", "esta de volta",
];
const PEDIDOS_DE_VOLTA = [
  "volto", "voltar", "retorno", "retornar", "de volta", "regresso", "sigo para a cidade",
  "vou para a cidade", "vou a cidade", "vou à cidade", "parto de volta", "deixo a", "saio d",
];

/* O que o JOGADOR escreveu, sem os turnos que o SISTEMA disparou.

   Sem esta limpeza o cão de guarda se desarmava sozinho: quando o jogador
   clica em "12h", quem viaja como mensagem é o envelope [PASSAR O TEMPO],
   e dentro dele está escrito "NÃO me leve de volta à cidade" — uma
   PROIBIÇÃO que o detector lia como pedido. O sistema mandando não fazer
   algo não pode contar como o jogador pedindo para fazer.

   A marca é o colchete na PRIMEIRA posição: todo envelope abre com um
   cabeçalho entre colchetes, e o que o jogador digita nunca abre assim.
   Tirar colchetes de dentro do texto não bastaria — o envelope é
   "[CABEÇALHO] seguido de instrução solta", e a instrução é o problema. */
export function falaDoJogador(texto) {
  const t = String(texto || "").trimStart();
  return t.startsWith("[") ? "" : t.trim();
}

export function pediuParaVoltar(textoDoJogador, cidade) {
  const t = norm(falaDoJogador(textoDoJogador));
  if (!t) return false;
  if (PEDIDOS_DE_VOLTA.some((p) => t.includes(norm(p)))) return true;
  const c = norm(cidade);
  return !!c && t.includes(c);
}

export function detectarVoltaForcada(narrativa, { lugar, cidade, pedidoDoJogador } = {}) {
  if (!lugar || !cidade) return null;
  const t = norm(narrativa);
  if (!t) return null;
  if (pediuParaVoltar(pedidoDoJogador, cidade)) return null;
  const c = norm(cidade);
  if (!t.includes(c)) return null;
  /* a cidade aparece — mas apareceu como DESTINO do herói?

     A cidade tem que vir COLADA no verbo, não a alguns caracteres dele. Com
     uma janela folgada, "um mensageiro chega a cavalo, vindo de Baixo
     Brumoso" mordia: o verbo era de chegada, mas quem chegava não era o
     herói. Exigir adjacência resolve sem lista de sujeitos. */
  const voltou = VERBOS_DE_VOLTA.some((v) => {
    const alvo = norm(v);
    let i = t.indexOf(alvo);
    while (i >= 0) {
      if (t.slice(i + alvo.length).replace(/^[\s,]+/, "").startsWith(c)) return true;
      i = t.indexOf(alvo, i + 1);
    }
    return false;
  });
  if (!voltou) return null;
  return { lugar: lugar.nome, cidade };
}

export function notaVoltaForcada(achado) {
  return `[CORREÇÃO DE LUGAR — REGISTRO DO SISTEMA] Você me devolveu a ${achado.cidade}, e eu não pedi para voltar. O SISTEMA registra que eu estou em ${achado.lugar}, fora da cidade, e continuo lá: eu não caminhei de volta, não anoiteci na estrada e não cheguei a portão nenhum. RETOME a cena EM ${achado.lugar.toUpperCase()} — o que se ouve daqui, o que se move no escuro, quem chega até aqui. Só eu decido voltar à cidade, e só quando eu escrever isso.`;
}

export const LUGAR_PROMPT = `ONDE O HERÓI ESTÁ (v9.39):
- Além das cidades e das viagens, existe um terceiro lugar: um ponto NOMEADO fora da cidade e perto dela — uma fazenda, um moinho, uma gruta, o acampamento onde a armadilha está armada.
- Quando o herói chegar a um lugar assim, registre "lugar_atual": "a fazenda de Jessa" (nome curto, como se diz em voz alta). Quando ele voltar para dentro da cidade, registre "lugar_atual": null.
- Enquanto houver um lugar registrado, o herói ESTÁ nele. Não o devolva à cidade por conta própria — nem para passar o tempo, nem para dormir, nem para "reapresentar a cena". Esperar de tocaia é uma cena legítima e acontece onde a tocaia está.
- SAIR DE UM LUGAR É UM MOVIMENTO, e movimento é do jogador: o sistema só aceita "lugar_atual": null quando o próprio herói escreveu que sai. Se você mandar sem isso, é recusado e você recebe um aviso — não insista.
- DENTRO DE UM COMBATE o lugar não muda, em hipótese nenhuma: enquanto a luta corre quem diz onde cada um está é o tabuleiro do sistema, em metros. Nada de arrastar o herói um andar acima entre dois golpes.
- Lugar assim NÃO é viagem: ir e voltar custa HORAS. Nunca invente dias de marcha para o que fica nos arredores — viagem de verdade tem sistema próprio e começa por outro caminho.`;
