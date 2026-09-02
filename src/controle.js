/* ============================================================
   CONTROLE DE INIMIGO (v9.54) — a última das cinco famílias

   Seis habilidades prometem mexer no INIMIGO em vez de feri-lo, e
   nenhuma tinha uma linha de código atrás. É a família que ficou por
   último de propósito: as outras quatro eram tabelas lidas na hora de
   um golpe, e esta é a única que precisa entrar no motor do turno dos
   inimigos — o lugar onde o sistema decide, sozinho, quem bate em
   quem.

   TRÊS COISAS, E SÓ TRÊS. Depois de ler as seis descrições, o que
   elas pedem cabe em três verbos:

   VIRAR — "ele luta do seu lado", "dois inimigos se voltam um contra
   o outro". O inimigo continua na lista de inimigos (a marionete pode
   ser morta por quem a controla, e isso é uma decisão de verdade), mas
   o alvo dele deixa de ser você.

   PARAR — "fica preso e sem poderes", "domina a vontade de todos por
   um instante". Isto o jogo já sabia fazer: é uma CONDIÇÃO, e as
   condições já tiram a ação, já vencem por turno e já aparecem no HUD.
   Inventar um segundo mecanismo paralelo ao que existe seria criar o
   problema que este arquivo veio resolver.

   CALAR — "ninguém consegue conjurar nem falar, só você". Aqui houve
   uma escolha. Inimigos desta casa não conjuram: eles batem, e o que
   distingue um deles do outro é o TIPO do golpe. Então "silêncio" não
   podia virar "todos perdem a ação" — isso já é o Corte de Marionetes,
   e faria duas habilidades diferentes serem a mesma coisa mais barata.
   Vale contra quem ataca com magia, e não contra quem ataca com um
   porrete. A habilidade deixa de ser um atordoamento de dois turnos e
   vira o que o nome dela diz: uma resposta a conjurador.

   E PROVOCAR, que é o avesso: "você rouba toda a atenção — o grupo age
   livre". Não mexe no inimigo, mexe em para onde ele olha.

   A REGRA DO DEGRAU VALE AQUI, e vale mais do que em qualquer outro
   lugar: virar contra os outros um inimigo que está degraus de
   divindade acima seria pior do que matá-lo de graça. Quem chama passa
   `podeVirar`, exatamente como o limiar recebe `podeCair`.
   ============================================================ */

import { criarCondicao } from "./condicoes.js";
import { perfilDe } from "./danos.js";

const NORM = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const txtDe = (h) => NORM(`${(h && h.nome) || ""} ${(h && h.descricao) || ""}`);

/* A ORDEM DESTA TABELA IMPORTA. "Corte de Marionetes" contém "marionetes",
   e um `find` desatento devolveria a habilidade errada — a de nível 8 vira
   a de nível 8 de outra árvore, com outro efeito. Por isso ela vem primeiro
   E a regex da Marionete exige a palavra inteira. Dois cintos, porque um
   falso positivo aqui derruba a luta do lado errado. */
export const CONTROLES = [
  {
    id: "corte_marionetes", rx: /corte de marionetes|domina a vontade de todos os inimigos/,
    modo: "parar", escopo: "todos", turnos: 1, cond: "atordoado",
    conceito: "todos os fios na sua mão ao mesmo tempo, por um instante só",
  },
  {
    id: "marionete", rx: /\bmarionete\b|controla um inimigo por tres turnos/,
    modo: "virar", quantos: 1, turnos: 3,
    conceito: "os fios entram por trás dos olhos e a vontade passa a ser sua",
  },
  {
    id: "discordia", rx: /discordia|dois inimigos se voltam um contra o outro/,
    modo: "virar", quantos: 2, turnos: 2,
    conceito: "uma suspeita plantada no ouvido de dois, e o resto eles fazem sozinhos",
  },
  {
    id: "interdito", rx: /selo de interdito|fica preso e sem poderes/,
    modo: "parar", escopo: "alvo", turnos: 3, cond: "paralisado",
    /* o selo é litúrgico: morde o que é profano e escorrega no resto */
    so: /(demonio|diabo|infernal|profano|morto-?vivo|zumbi|esqueleto|espectro|fantasma|carnical|vampiro|lich|alma penada|aparicao|necro|abissal|maldito)/,
    soTxt: "demônios e mortos-vivos",
    conceito: "o selo se fecha em círculo e o que é profano não atravessa",
  },
  {
    id: "silencio", rx: /silencio que grita|ninguem consegue conjurar nem falar/,
    modo: "calar", escopo: "todos", turnos: 2, cond: "enfraquecido",
    conceito: "um silêncio tão alto que a palavra morre na boca de quem conjura",
  },
  {
    id: "palco", rx: /palco aberto|rouba toda a atencao/,
    modo: "provocar", turnos: 2,
    conceito: "a cena inteira vira sua, e ninguém consegue olhar para outro lugar",
  },
];

export function controleDe(hab) {
  const t = txtDe(hab);
  if (!t.trim()) return null;
  return CONTROLES.find((c) => c.rx.test(t)) || null;
}

/* ---------------- QUEM ESTÁ VIRADO ----------------
   Lido pela rodada, não por um relógio próprio. Um prazo que se responde
   com uma comparação não precisa de tique, e um tique a menos é um lugar
   a menos onde alguém esquece de ligar o novo efeito. */
export const estaVirado = (inim, rodada) => !!(inim && inim.virado && Number(inim.virado.ate) > Number(rodada));
export const viradosEm = (inimigos, rodada) => (inimigos || []).filter((e) => estaVirado(e, rodada));

/* A provocação mora no COMBATE e não na ficha: é um fato da cena, e some
   junto com ela sem que ninguém precise limpar nada. */
export const estaProvocando = (combate, rodada) => !!(combate && combate.provocacao && Number(combate.provocacao.ate) > Number(rodada));

const vivo = (e) => e && !e.derrotado && (e.vida || 0) > 0;

/* ---------------- APLICAR ----------------
   Função pura sobre a lista de inimigos. Devolve a lista nova, os nomes
   atingidos, a linha do jogador e a nota do Mestre — a mesma forma dos
   outros resolvedores desta casa, para entrar na mesma corrente. */
export function aplicarControle(inimigos, regra, { rodada = 1, alvoNome = "", nomeHab = "", podeVirar } = {}) {
  if (!regra) return null;
  const lista = Array.isArray(inimigos) ? inimigos : [];
  const nome = nomeHab || "A habilidade";
  const vivos = lista.filter(vivo);
  if (!vivos.length) return { ok: false, inimigos: lista, nomes: [], linha: `⛔ ${nome}: não há ninguém de pé para atingir.`, nota: "" };

  /* ---- PROVOCAR: não mexe em inimigo nenhum, mexe no olhar deles ---- */
  if (regra.modo === "provocar") {
    return {
      ok: true, inimigos: lista, nomes: vivos.map((e) => e.nome), provocacao: { ate: rodada + regra.turnos, por: nome },
      linha: `🎭 ${nome} — ${regra.conceito}. Todos os inimigos vêm para cima de VOCÊ; seus companheiros agem livres e com vantagem · ${regra.turnos} turnos.`,
      nota: `[PROVOCAÇÃO — APLICADA PELO SISTEMA] "${nome}": ${regra.conceito}. Pelos próximos ${regra.turnos} turnos o sistema faz TODO inimigo me atacar e dá vantagem aos meus companheiros. Narre a atenção mudando de lugar — os olhos que me procuram, as costas que os outros ganham — e não mande ninguém atacar meus aliados: quem escolhe alvo é o sistema.`,
    };
  }

  /* ---- VIRAR: o alvo passa a bater nos próprios ---- */
  if (regra.modo === "virar") {
    const candidatos = vivos.filter((e) => !estaVirado(e, rodada) && (!podeVirar || podeVirar(e)));
    if (!candidatos.length) {
      return { ok: false, inimigos: lista, nomes: [], linha: `⛔ ${nome}: não há ninguém aqui cuja vontade você consiga tomar.`, nota: "" };
    }
    /* precisa sobrar em quem bater: virar o último inimigo de pé é virar
       alguém contra ninguém, e o turno se perderia em silêncio */
    if (vivos.length < 2) {
      return { ok: false, inimigos: lista, nomes: [], linha: `⛔ ${nome}: ${candidatos[0].nome} está sozinho — não há em quem ele se virar.`, nota: "" };
    }
    /* nunca TODOS: tem de sobrar alguém em quem bater, ou a Discórdia num
       par vira dois inimigos parados se encarando e o turno some */
    const teto = Math.max(1, Math.min(regra.quantos, vivos.length - 1));
    const escolhidos = [];
    const citado = alvoNome ? candidatos.find((e) => NORM(e.nome) === NORM(alvoNome)) : null;
    if (citado) escolhidos.push(citado);
    for (const e of candidatos) {
      if (escolhidos.length >= teto) break;
      if (!escolhidos.includes(e)) escolhidos.push(e);
    }
    const alvos = new Set(escolhidos.map((e) => e.nome));
    const nomes = [...alvos];
    const um = nomes.length === 1;
    return {
      ok: true,
      inimigos: lista.map((e) => (alvos.has(e.nome) ? { ...e, virado: { ate: rodada + regra.turnos, por: nome } } : e)),
      nomes,
      linha: `🎏 ${nome} — ${regra.conceito}. ${nomes.join(" e ")} ${um ? "passa" : "passam"} a lutar contra os próprios · ${regra.turnos} turnos.`,
      nota: `[VONTADE TOMADA PELO SISTEMA] "${nome}": ${regra.conceito}. ${nomes.join(" e ")} ${um ? "luta" : "lutam"} contra os outros inimigos pelos próximos ${regra.turnos} turnos — o sistema já resolve os turnos ${um ? "dele" : "deles"} e escolhe em quem ${um ? "ele bate" : "eles batem"}. Narre a virada (o olhar que muda, o companheiro que não entende) e NÃO ${um ? "o faça" : "os faça"} me atacar enquanto durar. ${um ? "Ele continua sendo um inimigo" : "Eles continuam sendo inimigos"}: eu ainda posso ${um ? "derrubá-lo" : "derrubá-los"}.`,
    };
  }

  /* ---- PARAR e CALAR: viram CONDIÇÃO, que o jogo já sabe cobrar ---- */
  const elegiveis = (() => {
    if (regra.modo === "calar") return vivos.filter((e) => perfilDe(e).ataque !== "fisico");
    if (regra.escopo === "todos") return vivos;
    const citado = alvoNome ? vivos.find((e) => NORM(e.nome) === NORM(alvoNome)) : null;
    const um = citado || vivos[0];
    return um ? [um] : [];
  })();
  const alvos = regra.so ? elegiveis.filter((e) => regra.so.test(NORM(`${e.nome} ${e.desc || ""}`))) : elegiveis;

  if (!alvos.length) {
    const porque = regra.modo === "calar"
      ? "ninguém aqui conjura — o silêncio cai sobre gente que só sabe bater"
      : `${regra.soTxt || "esse tipo de criatura"} não está em cena`;
    return { ok: false, inimigos: lista, nomes: [], linha: `⛔ ${nome}: ${porque}.`, nota: "" };
  }
  const cond = criarCondicao(regra.cond, { turnos: regra.turnos, origem: nome });
  const marcados = new Set(alvos.map((e) => e.nome));
  const nomes = [...marcados];
  const um = nomes.length === 1;
  const efeito = regra.modo === "calar"
    ? (um ? "não consegue conjurar" : "não conseguem conjurar")
    : (um ? "não age" : "não agem");
  return {
    ok: true,
    inimigos: lista.map((e) => (marcados.has(e.nome)
      ? { ...e, condicoes: [...(e.condicoes || []).filter((c) => (c.id || "") !== cond.id), cond] }
      : e)),
    nomes, condicao: cond,
    linha: `${cond.icone} ${nome} — ${regra.conceito}. ${nomes.join(", ")} ${efeito} por ${regra.turnos} turno${regra.turnos > 1 ? "s" : ""}.`,
    nota: `[CONTROLE APLICADO PELO SISTEMA] "${nome}": ${regra.conceito}. ${nomes.join(", ")} ${um ? "está" : "estão"} ${cond.nome} por ${regra.turnos} turno${regra.turnos > 1 ? "s" : ""} — o sistema já aplicou e já conta o prazo. Narre o efeito e trate ${um ? "essa criatura" : "essas criaturas"} como ${um ? "impedida" : "impedidas"}; não ${um ? "a" : "as"} faça agir e não ${um ? "a" : "as"} solte antes da hora.`,
  };
}

/* ---------------- SOLTAR ----------------
   O anúncio de que a vontade voltou. A leitura já é preguiçosa (`estaVirado`
   compara com a rodada), então isto existe para o JOGADOR saber — e para a
   ficha do inimigo não carregar um campo morto pelo resto da luta. */
export function expirarControles(inimigos, rodada) {
  const lista = Array.isArray(inimigos) ? inimigos : [];
  const soltos = lista.filter((e) => e && e.virado && Number(e.virado.ate) <= Number(rodada));
  if (!soltos.length) return { inimigos: lista, linhas: [] };
  const nomes = new Set(soltos.map((e) => e.nome));
  return {
    inimigos: lista.map((e) => { if (!nomes.has(e.nome)) return e; const n = { ...e }; delete n.virado; return n; }),
    linhas: soltos.map((e) => `🎏 ${e.nome} volta a si — os fios de ${e.virado.por} arrebentam.`),
  };
}

export const CONTROLE_PROMPT = `CONTROLE DE INIMIGO (v9.54 — o sistema resolve, você narra):
- Algumas habilidades tomam a VONTADE de um inimigo: ele passa a lutar contra os próprios companheiros por alguns turnos. Quem escolhe o alvo dele e resolve o turno dele é o sistema — narre a virada e não o faça atacar o herói enquanto durar. Ele continua sendo um inimigo, e ainda pode ser derrubado.
- Outras PRENDEM ou CALAM: viram condição na ficha da criatura, com prazo do sistema. Trate a criatura como impedida e não a solte antes da hora.
- E há a PROVOCAÇÃO: enquanto durar, todo inimigo ataca o herói e os companheiros agem com vantagem. Não mande ninguém atacar um aliado nesse período.`;
