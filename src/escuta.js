/* ============================================================
   O MESTRE QUE ESCUTA (Fase MM, etapa MM18) — reage, responde, e só
   depois empurra

   A queixa da pessoa (11/10), depois da quarta sessão de prova: "o mestre
   não parece estar interessado em reagir ou responder o player e sim
   somente em sair jogando informações". E o limite que ela pôs ao
   conserto, no mesmo dia: "não tire o personagem do foco e da história
   principal planejada, mas ele tem de reagir ao player e usar aquilo para
   levá-lo ao destino ... se um player ficar em todo momento fazendo
   perguntas ou ações inúteis e ele só reagir, a história fica sem rumo".

   ---------------- O QUE O REGISTO DA 4.ª SESSÃO MOSTROU ----------------

   Medido nas 42 chamadas do Narrador (mente/mm11-sessao-4.md e o registo
   dela): em 24 turnos do jogador fora da luta, o pedido levou 23
   empurrões — envelopes que puxam história que ninguém pediu (o compasso a
   plantar um julgamento e uma intriga de corte, a forma da cena, o mural,
   o passado que volta) — em 18 desses turnos, e outros 4 de uma vez num
   turno do sistema (o torneio, a missão de Ondine, o relógio, o sonho).
   12 dos 18 chegaram com o jogador EM CIMA do fio, a perguntar por Noé
   Laminado ou a ir à Muralha: o mundo empurrava por relógio, não porque o
   jogador tivesse empacado. A GENTE mandou 25 linhas de agenda, e nos 16
   turnos de pergunta 15 delas eram maneiras de não responder. E a frase do
   jogador chegava a 7–14 mil caracteres do fim do pedido, debaixo da base
   do mundo inteira.

   ---------------- A TÉCNICA DO MATT, EM TRÊS TEMPOS ----------------

   1. REAGE E RESPONDE PRIMEIRO — com o que o sistema sabe.
   2. A PONTE — no máximo UM empurrão por resposta, e por DENTRO dela:
      quem responde é alguém do fio, o fato toca a história, a ação tem
      uma consequência que aponta para lá. O empurrão escolhido é o que
      toca o fio; o resto espera (os que podem esperar) ou cai.
   3. O MUNDO ANDA QUANDO O JOGADOR EMPACA — uma escada por TURNOS sem
      tocar o fio nem avançar a história: um sinal, depois alguém que vem
      buscá-lo, depois a cobrança. As formas são as do encalhe
      (`encalhe.js#INTERVENCOES`), que já existiam e nunca dispararam na
      sessão (a escada dele conta DIAS, e uma sessão dura dois).

   ---------------- O QUE CONTA COMO AVANÇO ----------------

   A etapa da principal fechar, ou um marco da espinha fechar — E TAMBÉM o
   jogador tocar o fio: nomear quem a história procura, ir aonde ela
   aponta. Na 4.ª sessão a principal ficou em 0/2 do primeiro ao último
   turno (a etapa `falar_com` não registou o encontro com Inocência), e
   uma escada que lesse só as etapas teria dito "empacado há 37 turnos" a
   um jogador que perguntava por Noé em quase todos eles. Tocar o fio é a
   prova que não depende do Cronista.

   ---------------- SEPARADO DA TELA ----------------

   Conta se prova. O módulo lê a frase, a lista de envelopes e o estado
   pequeno da escuta, e devolve o que vai, o que espera, o que cai e a
   linha do RUMO para a pauta (`pauta.js`, secção `rumo`). Quem monta o
   pedido é o App.
   ============================================================ */

import { soPergunta } from "./perguntas.js";
import { intervencaoDoDegrau } from "./encalhe.js";
import { garantirAbertura } from "./abertura.js";
import { garantirMissoes } from "./missoes.js";
import { garantirEspinha } from "./saga.js";

const norm = (s) => String(s == null ? "" : s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim();
const obj = (x) => (x && typeof x === "object" && !Array.isArray(x) ? x : {});
const inteiro = (x) => (Number.isFinite(Number(x)) && Number(x) > 0 ? Math.floor(Number(x)) : 0);

/* ---------------- O PEDIDO ----------------
   O que o jogador fez neste turno, lido uma vez. `doJogador` é falso no
   turno do sistema (todo envelope começa por colchete — a mesma régua de
   `talvezAndarOCompasso`); `perguntas` são as frases que acabam em "?",
   até PERGUNTAS_LIDAS. Lixo devolve tudo falso — nunca erro. */
export const PERGUNTAS_LIDAS = 3;

export function lerOPedido(texto) {
  const t = String(texto == null ? "" : texto).trim();
  const vazio = { doJogador: false, pergunta: false, soPergunta: false, perguntas: [], texto: "" };
  if (!t || t.startsWith("[")) return vazio;
  let sp = { pergunta: false, soPergunta: false };
  try { sp = soPergunta(t); } catch { sp = { pergunta: /\?/.test(t), soPergunta: false }; }
  const perguntas = (t.match(/[^.!?\n"“”«»]*\?/g) || [])
    .map((x) => x.replace(/^[\s,;:—-]+/, "").trim())
    .filter((x) => x.length > 1)
    .slice(0, PERGUNTAS_LIDAS);
  return { doJogador: true, pergunta: !!sp.pergunta, soPergunta: !!sp.soPergunta, perguntas, texto: t };
}

/* ---------------- OS EMPURRÕES ----------------
   Os envelopes que puxam história sem o jogador ter pedido, pelo
   cabeçalho. Tudo o que NÃO está aqui é fato do turno (a procura, o
   movimento, a viagem, a luta, a correção, o clima) e vai sempre.
   · `peso` — no empate entre dois que não tocam o fio, fica o mais pesado;
   · `adia` — pode esperar o turno seguinte sem mentir (o boato, o passado
     que volta); o que não adia fala de um AGORA que amanhã é falso (o
     compasso, a forma da cena) e cai;
   · `de` — o módulo que o escreve, para quem ler o relato saber a quem
     perguntar.
   Os dois ACONTECIDOS (o sino que tocou e o mundo que vem buscar) não
   são empurrão: são o degrau de cima da escada, e vão sempre. */
const E = (id, rx, peso, adia, de) => ({ id, rx, peso, adia, de });
export const EMPURROES = [
  E("compasso", /^\[(PREPARAÇÃO|APERTA|A UM PASSO|AGORA|O QUE FICOU) — DECISÃO DO SISTEMA\]/, 3, false, "compasso.js"),
  E("forma", /^\[A FORMA DESTA CENA/, 1, false, "biblioteca.js"),
  E("mural", /^\[TRABALHO PREGADO NO MURAL/, 2, true, "ofertas.js"),
  E("trama", /^\[QUEST GERADA PELO SISTEMA/, 2, true, "tramas.js"),
  E("global", /^\[EVENTO GLOBAL/, 2, true, "eventos"),
  E("mundo", /^\[O MUNDO SE MEXE/, 2, true, "iniciativa"),
  E("passado", /^\[O PASSADO VOLTA/, 2, true, "fio da memória"),
  E("lembrou", /^\[O MUNDO LEMBROU/, 2, true, "cobrador"),
  E("rumor", /^\[RUMOR\]/, 1, true, "rumores"),
  E("correio", /^\[CORREIO/, 1, true, "correio"),
  E("sonho", /^\[SONHO\]/, 1, false, "sonhos"),
  E("relogio", /^\[RELÓGIO ABERTO/, 1, true, "relogios.js"),
  E("lugar", /^\[NESTE MUNDO/, 1, false, "lexico.js"),
];
export const ACONTECIDOS = [/^\[RELÓGIO COMPLETO/, /^\[O MUNDO VAI BUSCAR/];

export function empurraoDe(envelope) {
  const t = String(envelope == null ? "" : envelope).trimStart();
  if (!t.startsWith("[")) return null;
  if (ACONTECIDOS.some((rx) => rx.test(t))) return null;
  return EMPURROES.find((e) => e.rx.test(t)) || null;
}

/* ---------------- O FIO ----------------
   Os nomes que a história principal persegue AGORA: a pista e o alvo da
   abertura, a origem do perigo, e os alvos e lugares das etapas das
   missões que não se recusam (principal e trama). `tipo` decide como se
   casa: pessoa pelo primeiro nome ("Inocência", "Noé Laminado" →
   "noé laminado" ou "noé" não basta — ver abaixo), lugar pelas duas
   primeiras palavras ("Muralha Quebrada de Silêncio" ← "a Muralha
   Quebrada"). */
const FIO_DAS_MISSOES = ["principal", "trama"];
export function fioDaHistoria(estado) {
  const e = obj(estado);
  const out = [];
  const por = (nome, tipo) => { const n = String(nome || "").trim(); if (n && !out.some((x) => norm(x.nome) === norm(n))) out.push({ nome: n, tipo }); };
  const a = garantirAbertura(e.abertura);
  if (!a.legado) {
    por(a.pista.nome, "pessoa");
    por(a.alvo.quem, "pessoa");
    por(a.alvo.onde, "lugar");
    por(a.alvo.alvo, "lugar");
    por(a.alvo.origem, "lugar");
  }
  let ms = [];
  try { ms = garantirMissoes(e.missoes); } catch { ms = []; }
  for (const m of ms) {
    if (!m || m.status !== "ativa" || !FIO_DAS_MISSOES.includes(m.tipo)) continue;
    for (const et of m.etapas || []) {
      if (!et || et.feito) continue;
      por(et.alvo, et.tipo === "falar_com" ? "pessoa" : "lugar");
      por(et.onde, "lugar");
    }
  }
  return out;
}

/* Uma palavra curta ou de uso comum não identifica ninguém: "O", "Velho",
   "Casa". O primeiro nome de uma pessoa casa se tiver ao menos
   LETRAS_DO_NOME letras; abaixo disso, só o nome inteiro. */
export const LETRAS_DO_NOME = 4;
const ARTIGOS = /^(o|a|os|as|um|uma)\s+/;

function casa(textoNorm, item) {
  const nome = norm(item && item.nome).replace(ARTIGOS, "");
  if (!nome) return false;
  const palavras = nome.split(" ").filter(Boolean);
  const ha = (frag) => frag && new RegExp(`(^|[^a-z0-9])${frag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z0-9]|$)`).test(textoNorm);
  if (ha(nome)) return true;
  if (item.tipo === "pessoa") return palavras[0].length >= LETRAS_DO_NOME && ha(palavras[0]);
  return palavras.length >= 2 && ha(palavras.slice(0, 2).join(" "));
}

export function tocaOFio(texto, fio) {
  const t = norm(texto);
  if (!t) return false;
  return (Array.isArray(fio) ? fio : []).some((f) => casa(t, f));
}

/* ---------------- A ESCADA (por turnos) ----------------
   `desde` é quantos turnos do jogador seguidos sem tocar o fio nem avançar
   a história. `empurroes` é quantos envelopes que puxam história cabem no
   pedido nesse degrau; `encalhe` é o degrau de `encalhe.js` de onde sai a
   forma da intervenção (0: nenhuma).
   · 0 — a escuta: reage, responde, e no máximo UMA ponte por dentro;
   · 1 — o sinal (4 turnos): informação nova, custo zero, na direção certa;
   · 2 — vem buscá-lo (7): alguém chama, com motivo próprio;
   · 3 — o mundo cobra (10): o mundo se mexe e muda as opções, e cabem dois.
   Os números saem do registo da 4.ª sessão: o maior desvio do fio que o
   jogador fez de livre vontade (o julgamento de Caetano, J7–J10) durou
   quatro turnos; ao quinto, o Matt já teria posto alguém a falar de Noé. */
export const ESCADA_DA_ESCUTA = [
  { n: 0, desde: 0, id: "escuta", empurroes: 1, encalhe: 0 },
  { n: 1, desde: 4, id: "sinal", empurroes: 1, encalhe: 1 },
  { n: 2, desde: 7, id: "vem_buscar", empurroes: 1, encalhe: 2 },
  { n: 3, desde: 10, id: "cobra", empurroes: 2, encalhe: 3 },
];

export function degrauDaEscuta(semAvanco) {
  const n = inteiro(semAvanco);
  let d = ESCADA_DA_ESCUTA[0];
  for (const x of ESCADA_DA_ESCUTA) if (n >= x.desde) d = x;
  return d;
}

/* ---------------- O AVANÇO, CONTADO ----------------
   Quantas etapas das missões do fio (principal e trama, ativas ou já
   concluídas) estão feitas, e quantos marcos da espinha. O número só
   interessa a subir: é o que `andarAEscuta` compara com o do turno
   anterior. Lixo conta zero. */
export function contarOAvanco(estado) {
  const e = obj(estado);
  let etapas = 0, marcos = 0;
  try {
    for (const m of garantirMissoes(e.missoes)) {
      if (!m || !FIO_DAS_MISSOES.includes(m.tipo)) continue;
      etapas += (m.etapas || []).filter((x) => x && x.feito).length;
    }
  } catch { etapas = 0; }
  try {
    for (const a of garantirEspinha(e.espinha).atos) marcos += a.marcos.filter((m) => m.feito).length;
  } catch { marcos = 0; }
  return { etapas, marcos };
}

/* ---------------- O ESTADO (um campo novo do save, `escuta`) ----------------
   { semAvanco, etapas, marcos }: os turnos sem avanço e o que estava feito
   no último turno, para saber se andou. A versão antiga ignora o campo;
   um save sem ele começa em zero. */
export function garantirEscuta(e) {
  const o = obj(e);
  return { semAvanco: inteiro(o.semAvanco), etapas: inteiro(o.etapas), marcos: inteiro(o.marcos) };
}

/* Um turno do jogador anda a escuta. `ctx`: { pedido (de `lerOPedido`),
   fio (de `fioDaHistoria`), etapas (quantas etapas das missões do fio
   estão feitas), marcos (quantos marcos da espinha), pausa (a luta) }. Turno do sistema
   não conta: quem empaca é o jogador. Devolve o estado NOVO. */
export function andarAEscuta(escuta, ctx) {
  const e = garantirEscuta(escuta);
  const c = obj(ctx);
  const etapas = c.etapas == null ? e.etapas : inteiro(c.etapas);
  const marcos = c.marcos == null ? e.marcos : inteiro(c.marcos);
  const p = obj(c.pedido);
  /* a luta (e o que mais o App disser que pausa) não é empacar: quem está
     a lutar está a jogar, e na 4.ª sessão os turnos de "seguro a ação"
     da luta com o lobo subiam a escada sozinhos */
  if (!p.doJogador || c.pausa) return { ...e, etapas, marcos };
  const avancou = etapas > e.etapas || marcos > e.marcos;
  const toca = tocaOFio(p.texto, c.fio);
  return { semAvanco: avancou || toca ? 0 : e.semAvanco + 1, etapas, marcos };
}

/* ---------------- O QUE SEGURA O MUNDO ----------------
   O compasso e a forma da cena decidem ANTES de o pedido ser montado, e o
   compasso, quando anda, anda de verdade (a onda passa de plantio a
   aperto). Cortar o envelope dele depois seria o sistema avançar uma
   história que o Narrador nunca contou. Por isso eles SEGURAM, pela porta
   que já têm (`avancarCompasso(..., { segurar })`, `podeFormaDeCena`),
   quando a tabela manda: numa pergunta do jogador, no degrau da escuta. */
export const SEGURA_O_MUNDO = { naPergunta: true, ateODegrau: 0 };

export function seguraOMundo(pedido, degrau) {
  const p = obj(pedido);
  const d = obj(degrau);
  if (!p.doJogador) return false;
  const n = Number.isFinite(Number(d.n)) ? Number(d.n) : 0;
  return !!(SEGURA_O_MUNDO.naPergunta && p.pergunta && n <= SEGURA_O_MUNDO.ateODegrau);
}

/* ---------------- O RUMO (a linha da pauta) ----------------
   A ponte, dita ao Narrador. `{passo}` é o próximo passo da principal na
   voz de `abertura.js#proximoPasso` ("Procurar Inocência Bordão no Sino
   Quieto"); `{forma}` é a intervenção do encalhe no degrau. Sem passo, a
   linha da escuta fica só com o primeiro tempo — nunca inventa destino. */
export const RUMOS = {
  pergunta: "responda primeiro ao que perguntei, com o que está nesta pauta; o que ninguém aqui sabe, quem responde diz que não sabe",
  ato: "reaja primeiro ao que eu fiz, na cara de quem está",
  ponte: "depois, e por dentro da resposta, uma coisa só aponta para: {passo}",
  sinal: "e o mundo dá um sinal na direção de {passo}: {forma}",
  vem_buscar: "e alguém vem até mim, com motivo próprio, por causa de {passo}: {forma}",
  cobra: "e esperar já custa: {forma}, e aponta para {passo}",
};

export function linhaDoRumo(opcoes) {
  const { pedido = null, degrau = null, passo = "", semente = 0 } = obj(opcoes);
  const p = obj(pedido);
  const d = degrau && typeof degrau === "object" ? degrau : ESCADA_DA_ESCUTA[0];
  const ps = String(passo || "").trim();
  if (!p.doJogador && !(d.n > 0)) return "";
  const abre = p.doJogador ? (p.pergunta ? RUMOS.pergunta : RUMOS.ato) : "";
  if (!ps) return abre;
  let segue = RUMOS.ponte;
  if (d.n > 0 && RUMOS[d.id]) {
    const iv = intervencaoDoDegrau(d.encalhe, semente);
    segue = iv ? RUMOS[d.id].replace("{forma}", iv.diz) : RUMOS.ponte;
  }
  const s = segue.replace("{passo}", ps);
  return abre ? `${abre}; ${s}` : s;
}

/* ---------------- ESCUTAR O TURNO ----------------
   `envelopes`: a lista de pedaços que o App juntaria ao pedido (o que
   está em `notaRef`, o compasso, a forma, a frente, a virada, a trama),
   já separados — strings soltas, vazias ignoradas. Devolve:
     { ficam, adiados, cortados, empurroes, degrau }
   `ficam` mantém a ORDEM original; dos empurrões entram até
   `degrau.empurroes`, e entra primeiro o que TOCA O FIO (a ponte sai do
   material da própria história), depois o mais pesado, depois o
   primeiro. Nunca muta o recebido. */
/* `adiadosAntes`: os que já esperaram um turno. Um empurrão adia UMA vez:
   se volta a perder, cai — senão o boato de anteontem chegaria quando
   já ninguém fala dele, e a fila nunca esvaziava. */
export function escutarOTurno(opcoes) {
  const { envelopes = [], fio = [], semAvanco = 0, adiadosAntes = [] } = obj(opcoes);
  const jaEsperou = new Set((Array.isArray(adiadosAntes) ? adiadosAntes : []).map((x) => String(x == null ? "" : x).trim()));
  const lista = (Array.isArray(envelopes) ? envelopes : []).map((x) => String(x == null ? "" : x)).filter((x) => x.trim());
  const d = degrauDaEscuta(semAvanco);
  const cands = [];
  lista.forEach((t, i) => {
    const em = empurraoDe(t);
    if (em) cands.push({ i, t, em, toca: tocaOFio(t, fio) });
  });
  const escolhidos = new Set(
    [...cands]
      .sort((a, b) => (b.toca - a.toca) || (b.em.peso - a.em.peso) || (a.i - b.i))
      .slice(0, Math.max(0, d.empurroes))
      .map((c) => c.i),
  );
  const ficam = [], adiados = [], cortados = [];
  lista.forEach((t, i) => {
    const c = cands.find((x) => x.i === i);
    if (!c || escolhidos.has(i)) ficam.push(t);
    else if (c.em.adia && !jaEsperou.has(t.trim())) adiados.push(t);
    else cortados.push(t);
  });
  return { ficam, adiados, cortados, empurroes: cands.length, degrau: d };
}

/* ---------------- OS ENVELOPES, UM A UM ----------------
   O App junta os envelopes do turno numa string só (`notaRef`), um por
   cabeçalho, e um envelope pode ter várias linhas ("REGRA DESTE ENVELOPE"
   vem na linha de baixo). Parte-se onde uma LINHA começa por colchete — o
   "[narre como: …]" a meio de uma linha fica com o seu envelope. */
export function separarEnvelopes(texto) {
  return String(texto == null ? "" : texto).split(/\n(?=\[)/).map((x) => x.trim()).filter(Boolean);
}

/* ---------------- O QUE VEM POR ÚLTIMO ----------------
   A frase do jogador fecha o pedido, depois do rodapé e da base do mundo
   — é a última coisa que o Narrador lê antes de escrever. Na 4.ª sessão
   ela ia a 7–14 mil caracteres do fim. A etiqueta é curta e é bastidor
   (entre colchetes, como todo envelope). */
export const ETIQUETA_DO_PEDIDO = "[O QUE EU FAÇO AGORA — a narração abre por aqui]";

export function fechoDoPedido(pedido) {
  const p = obj(pedido);
  return p.doJogador && p.texto ? `${ETIQUETA_DO_PEDIDO}\n${p.texto}` : "";
}
