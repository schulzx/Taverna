/* ============================================================
   O PROMETIDO (Fase MM, a campanha que prende · item 1) — as promessas
   do Narrador, cobradas

   A queixa da pessoa, depois da 4.ª sessão de prova: "achei a história
   de morna para frio, não prendeu muito". E o que o registo mostrou
   (mente/mm11-sessao-4.md, "Onde e por que a história esfria"): as
   melhores coisas da sessão saíram da cabeça do Narrador e morreram lá.
   "A carta que não era para mim", o couro de Norberto, as cinco chaves
   pretas, "Eu sou o recado. A Muralha escolheu um nome ... Ainda." — o
   Cronista registou metade delas como cânone, e nada as cobrou.
   `promessas.sementes` ficou vazio do primeiro ao último turno.

   A técnica do Matt é a mais velha da mesa: o que o Mestre deixa cair
   numa cena, ele APANHA três cenas depois, e o jogador percebe que nada
   ali era enfeite. O Mestre de IA planta bem e esquece; o sistema não
   esquece. Este módulo é a memória do que o Narrador prometeu e a régua
   de quando o prometido volta.

   ---------------- POR QUE NÃO É O LIVRO DE PROMESSAS ----------------

   O Livro (`promessas.js`) guarda o que o SISTEMA planta, numa das 39
   formas, e esconde do Narrador a verdade (`pagaComo`): ele insinua sem
   saber de quê. Aqui é o contrário — a semente é do Narrador, ele SABE o
   que disse, e o texto é a própria frase dele. Meter as duas no mesmo
   razão obrigava a inventar uma forma para cada frase solta e a fingir
   que o Narrador não sabe o que escreveu. São dois cofres: um esconde,
   este lembra. (E não é `cobranca.js`, que é a outra cobrança: a das
   moedas que a narração disse que o herói ganhou.)

   ---------------- O CICLO ----------------

   1. O Cronista lê a narração e devolve, numa secção curta, as sementes
      que o Narrador plantou (`SECAO_DO_CRONISTA`): um objeto com mistério,
      uma frase que promete, alguém que fica de voltar, uma ameaça dita.
      `guardarSementes` filtra o que é lembrete de cena (a tarefa, o
      estado da cena, o presságio de ambiente) e guarda o resto.
   2. Cada turno do jogador fora da luta anda o relógio. `cobrarNoTurno`
      escolhe, pela tabela de prazos (`TIPOS_DE_SEMENTE`), no máximo UMA
      semente madura e devolve a linha da pauta ("isto volta agora").
   3. Cobrada, fecha. A que passa do prazo sem nunca ter tido turno para
      voltar, ou cuja pessoa morreu, expira — nunca fica pendurada.

   Nunca cobra num turno de pergunta: aí a resposta é o turno inteiro
   (`escuta.js`, o primeiro tempo do Matt), e uma semente a voltar no
   meio da resposta é o empurrão que a escuta existe para segurar.

   ---------------- SEPARADO DA TELA ----------------

   Conta se prova. Quem chama o Cronista e monta a pauta é o App; aqui só
   se decide o que guardar, quando voltar e o que dizer.
   ============================================================ */

import { tocaOFio } from "./escuta.js";

const norm = (s) => String(s == null ? "" : s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim();
const obj = (x) => (x && typeof x === "object" && !Array.isArray(x) ? x : {});
const inteiro = (x) => (Number.isFinite(Number(x)) && Number(x) > 0 ? Math.floor(Number(x)) : 0);
const texto = (x, max) => String(x == null ? "" : x).replace(/\s+/g, " ").trim().slice(0, max);

/* ---------------- OS QUATRO TIPOS, E OS PRAZOS DE CADA UM ----------------
   Os prazos contam TURNOS DO JOGADOR FORA DA LUTA (a luta é pausa, como na
   escuta: na 4.ª sessão foram 15 turnos de Quimera, e uma ameaça dita no
   M21 morreria de velhice debaixo dela).
   · `madura` — antes disto a semente não volta: voltar no turno seguinte
     não é pagar, é repetir;
   · `vence`  — a partir daqui ela está em dívida e passa à frente das
     outras (a urgência é idade ÷ vence);
   · `expira` — passou disto sem voltar, fecha como expirada;
   · `peso`   — o que a promessa vale para a mesa. Desempata a escolha
     (a ameaça dita aperta mais do que a frase solta) e decide quem cede
     o lugar quando o caderno está cheio.
   Os números saem do registo: o couro entra no M12 e as chaves que ele
   explica no M17–M19 (5 a 7 turnos); a ameaça do M21 tinha de apertar
   antes de a masmorra começar (M27, 5 turnos fora da luta); a mulher de
   capa verde ficou de voltar no M14 e o Matt tê-la-ia trazido na mesma
   cidade, antes da partida (≤ 6). `volta` é o QUE a pauta pede — nunca o
   como (a regra de pauta.js).

   O que o registo também mostrou, e mudou a tabela: em 22 turnos do
   jogador fora da luta, 16 foram perguntas — e numa pergunta não se
   cobra. Sobram 6 turnos de ato numa sessão inteira. Por isso a escolha
   tem de ser boa (o peso) e o caderno não pode encher de frases menores
   antes de a ameaça grande chegar (a troca, em `guardarSementes`). */
export const TIPOS_DE_SEMENTE = [
  { id: "objeto", o: "um objeto com mistério", madura: 4, vence: 9, expira: 20, peso: 2, volta: "o objeto faz, abre ou atrai alguém agora, e o que ele é começa a mostrar-se" },
  { id: "frase", o: "uma frase que promete", madura: 3, vence: 7, expira: 16, peso: 1, volta: "o que essa frase prometeu acontece, ou uma parte cumpre-se diante de mim" },
  { id: "volta", o: "alguém que fica de voltar", madura: 3, vence: 6, expira: 14, peso: 2, volta: "essa pessoa volta, como disse, e traz o que ficou de trazer" },
  { id: "ameaca", o: "uma ameaça dita", madura: 2, vence: 6, expira: 14, peso: 3, volta: "a ameaça dá um passo concreto contra mim ou contra quem está comigo" },
];
const tipoPorId = (id) => TIPOS_DE_SEMENTE.find((t) => t.id === id) || null;

/* O que o Cronista escreve por extenso cai no tipo certo. */
const SINONIMOS = { artefato: "objeto", item: "objeto", promessa: "frase", segredo: "frase", pessoa: "volta", retorno: "volta", ameaça: "ameaca", aviso: "ameaca" };
const tipoDe = (t) => { const n = norm(t); return tipoPorId(n) ? n : (SINONIMOS[n] || SINONIMOS[String(t || "").toLowerCase()] || ""); };

/* ---------------- O RITMO ----------------
   · `intervalo`    — turnos do jogador entre duas voltas: duas seguidas
     viram desfile, e a semente cobrada precisa de um turno para pesar;
   · `maxAbertas`   — com seis promessas em aberto a mesa já tem mais do
     que paga numa sessão (seis turnos de ato, na 4.ª). A sétima só entra
     se pesar ao menos tanto como a mais leve das abertas, e essa CEDE o
     lugar (fecha como expirada, nunca fica pendurada); senão é recusada;
   · `novasPorTurno` — uma narração de 140 palavras não planta mais de duas
     coisas a sério; o resto é cenário;
   · `guardadas`    — quantas fechadas o estado lembra (cobradas e
     expiradas), para o diário e para não aceitar de volta a mesma frase;
   · `palavras`     — menos do que isto não é promessa, é etiqueta;
   · `parecida`     — fração de palavras em comum a partir da qual duas
     sementes são a mesma (o Cronista repete o couro com outras palavras),
     e `comuns` o mínimo delas: uma frase curta tem duas palavras que
     contam, e "nome" sozinho fazia "o nome é o teu" passar por "a carta
     com nome de morto";
   · `pesoNaEscolha`, `fioNaEscolha` — o que somam à urgência (idade ÷
     vence) o peso do tipo e o tocar o fio da história. */
export const RITMO_DO_PROMETIDO = { intervalo: 2, maxAbertas: 6, novasPorTurno: 2, guardadas: 12, palavras: 3, parecida: 0.5, comuns: 2, pesoNaEscolha: 0.25, fioNaEscolha: 0.5, letras: 120 };

/* ---------------- O QUE NÃO É SEMENTE ----------------
   O lembrete de cena não conta. Três famílias, e cada uma com o porquê:
   · a TAREFA — "falar com Noé", "ir à Muralha": é etapa de missão, e a
     missão já tem quem a cobre (missoes.js);
   · o ESTADO da cena — "a tocha está acesa", "Euzébio espera": dura o
     turno, não promete nada;
   · o AMBIENTE — o cheiro, o ar, a chuva, o sino que dobra: é o presságio
     que fecha 24 de 28 respostas da 4.ª sessão, e o defeito é exatamente
     ele não pagar nada. Guardá-lo como promessa seria dar-lhe razão. */
export const NAO_E_SEMENTE = [
  { id: "tarefa", rx: /^(lembr|nao esquec|precis|tem de |tens de |tem que |deve |ir (a|ao|para) |va |vai a|procur|fal(e|ar) com|encontr(e|ar) |compr(e|ar) |pag(ue|ar) |entreg(ue|ar) )/, porque: "é etapa de missão, e a missão já tem quem a cobre" },
  { id: "estado", rx: /\b(esta acesa|esta apagad|continua (ali|parad|caid|de pe)|espera (ali|em silencio|calad)|segue (ali|parad))\b/, porque: "dura o turno, não promete nada" },
  { id: "ambiente", rx: /^(o |a |um |uma )?(cheiro|ar |ar$|chuva|vento|trov|nevoa|neblina|silencio|escurid|sombra|ceu |sino (dobra|toca|bate))/, porque: "é o presságio de ambiente, e o defeito é ele não pagar nada" },
];

export function ehLembreteDeCena(t) {
  const n = norm(t);
  if (!n) return true;
  if (n.split(" ").filter(Boolean).length < RITMO_DO_PROMETIDO.palavras) return true;
  return NAO_E_SEMENTE.some((x) => x.rx.test(n));
}

/* ---------------- A SECÇÃO DO CRONISTA ----------------
   Vai no system do Cronista (uma chamada leve própria, fora do prompt do
   Narrador: o teto de 82 mil não a vê). Curta de propósito: o Cronista é
   conservador por regra, e "na dúvida, lista vazia" vale aqui também.

   E a outra metade: o Narrador também PAGA sozinho, e bem — o couro
   plantado no M12 foi aberto no M13, a "gaveta errada" do M13 teve
   resposta no M19 ("A gaveta certa é a que nunca devia ter sido aberta").
   Cobrar de novo o que a cena já pagou é a repetição que a pessoa leu
   como morna. Por isso o Cronista vê as abertas (`abertasParaOCronista`)
   e diz quais a narração pagou (`promessas_pagas`, os números). */
export const SECAO_DO_CRONISTA = "SEÇÃO promessas (lista, no máximo 2): o que a narração deste turno PLANTOU e ainda não pagou — um objeto com mistério (\"objeto\"), uma frase que promete (\"frase\"), alguém que ficou de voltar (\"volta\"), uma ameaça dita (\"ameaca\"). Formato [{\"tipo\":\"objeto|frase|volta|ameaca\",\"texto\":\"a promessa em até 12 palavras\",\"quem\":\"quem a fez ou carrega, se houver\"}]. Não conta: tarefa (ir a, falar com), o estado da cena, o cheiro, o ar, o sino, a chuva. Na dúvida, []. SEÇÃO promessas_pagas: os números das PROMESSAS EM ABERTO que esta narração cumpriu ou revelou de fato; na dúvida, [].";

/* O bloco que vai no pedido ao Cronista, junto do cânone: as abertas, com
   o número que ele devolve em `promessas_pagas`. Vazio quando não há. */
export function abertasParaOCronista(estado) {
  const ab = garantirPrometido(estado).sementes.filter((s) => s.estado === "aberta");
  if (!ab.length) return "";
  return "PROMESSAS EM ABERTO (número — promessa):\n" + ab.map((s) => `${s.id} — ${s.texto}${s.quem ? ` (${s.quem})` : ""}`).join("\n");
}

/* ---------------- O ESTADO (um campo novo do save, `prometido`) ----------------
   { turno, ultima, proxId, sementes: [{ id, tipo, texto, quem, turno,
   estado: "aberta"|"cobrada"|"paga"|"expirada", fim }] }. `cobrada` é a
   que o sistema trouxe de volta; `paga`, a que a narração pagou sozinha. A versão antiga ignora
   o campo; um save sem ele começa vazio. Lixo não estoura: entra o que
   tem tipo e texto, o resto cai. */
const ESTADOS = ["aberta", "cobrada", "paga", "expirada"];

function garantirSemente(s) {
  const o = obj(s);
  const tipo = tipoDe(o.tipo);
  const t = texto(o.texto, RITMO_DO_PROMETIDO.letras);
  if (!tipo || !t) return null;
  return {
    id: inteiro(o.id),
    tipo,
    texto: t,
    quem: texto(o.quem, 60),
    turno: inteiro(o.turno),
    estado: ESTADOS.includes(o.estado) ? o.estado : "aberta",
    fim: inteiro(o.fim),
  };
}

export function garantirPrometido(c) {
  const o = obj(c);
  const sementes = (Array.isArray(o.sementes) ? o.sementes : []).map(garantirSemente).filter(Boolean);
  const maior = sementes.reduce((m, s) => Math.max(m, s.id), 0);
  return {
    turno: inteiro(o.turno),
    /* `ultima` guarda o turno da última volta; -1 em save novo, para a
       primeira poder sair já no turno da maturidade */
    ultima: Number.isFinite(Number(o.ultima)) ? Math.floor(Number(o.ultima)) : -1,
    proxId: Math.max(inteiro(o.proxId), maior + 1, 1),
    sementes,
  };
}

/* duas frases são a mesma promessa quando partilham metade das palavras
   que contam (quatro letras ou mais) */
const palavras = (t) => new Set(norm(t).replace(/[^a-z0-9 ]/g, " ").split(" ").filter((w) => w.length >= 4));
function mesma(a, b) {
  const A = palavras(a), B = palavras(b);
  if (!A.size || !B.size) return norm(a) === norm(b);
  let comum = 0;
  for (const w of A) if (B.has(w)) comum++;
  return comum >= RITMO_DO_PROMETIDO.comuns && comum / Math.min(A.size, B.size) >= RITMO_DO_PROMETIDO.parecida;
}

/* ---------------- GUARDAR (depois da narração, pela mão do Cronista) ----------------
   `lista`: o que o Cronista devolveu na secção `promessas` (lixo = nada).
   Devolve { estado, guardadas, recusadas: [{ texto, porque }], cederam }. Nunca
   muta o recebido. A semente nasce no turno ATUAL do relógio. */
export function guardarSementes(estado, lista) {
  const E = garantirPrometido(estado);
  const R = RITMO_DO_PROMETIDO;
  const guardadas = [], recusadas = [], cederam = [];
  let sementes = E.sementes, proxId = E.proxId;
  for (const bruta of (Array.isArray(lista) ? lista : []).slice(0, 8)) {
    const s = garantirSemente({ ...obj(bruta), id: proxId, turno: E.turno, estado: "aberta" });
    if (!s) { recusadas.push({ texto: texto(obj(bruta).texto, 60), porque: "sem tipo ou sem texto" }); continue; }
    if (ehLembreteDeCena(s.texto)) { recusadas.push({ texto: s.texto, porque: "lembrete de cena" }); continue; }
    if (sementes.some((x) => mesma(x.texto, s.texto))) { recusadas.push({ texto: s.texto, porque: "já guardada (a mesma promessa, dita de novo)" }); continue; }
    if (guardadas.length >= R.novasPorTurno) { recusadas.push({ texto: s.texto, porque: "turno cheio" }); continue; }
    const abertas = sementes.filter((x) => x.estado === "aberta");
    if (abertas.length >= R.maxAbertas) {
      /* a mais leve, e entre as leves a mais velha, cede se a nova pesa ao
         menos tanto como ela */
      const leve = [...abertas].sort((a, b) => (tipoPorId(a.tipo).peso - tipoPorId(b.tipo).peso) || (a.id - b.id))[0];
      if (tipoPorId(leve.tipo).peso > tipoPorId(s.tipo).peso) { recusadas.push({ texto: s.texto, porque: "promessas demais em aberto" }); continue; }
      const cedeu = { ...leve, estado: "expirada", fim: E.turno };
      sementes = sementes.map((x) => (x.id === leve.id ? cedeu : x));
      cederam.push(cedeu);
    }
    sementes = [...sementes, s];
    guardadas.push(s);
    proxId++;
  }
  return { estado: { ...E, proxId, sementes: aparar(sementes) }, guardadas, recusadas, cederam };
}

/* ---------------- PAGAR (o que a narração cumpriu sozinha) ----------------
   `ids`: os números que o Cronista devolveu em `promessas_pagas`. Só
   fecha o que está aberto; número desconhecido ou lixo não faz nada. */
export function pagarSementes(estado, ids) {
  const E = garantirPrometido(estado);
  const quer = new Set((Array.isArray(ids) ? ids : []).map(inteiro).filter(Boolean));
  const pagas = [];
  const sementes = E.sementes.map((s) => {
    if (s.estado !== "aberta" || !quer.has(s.id)) return s;
    const x = { ...s, estado: "paga", fim: E.turno };
    pagas.push(x);
    return x;
  });
  return { estado: pagas.length ? { ...E, sementes: aparar(sementes) } : E, pagas };
}

/* as fechadas mais antigas saem do estado; as abertas ficam todas */
function aparar(sementes) {
  const fechadas = sementes.filter((s) => s.estado !== "aberta");
  const sobra = fechadas.length - RITMO_DO_PROMETIDO.guardadas;
  if (sobra <= 0) return sementes;
  const fora = new Set(fechadas.slice(0, sobra).map((s) => s.id));
  return sementes.filter((s) => !fora.has(s.id));
}

/* ---------------- A LINHA DA PAUTA ----------------
   O texto é a frase do próprio Narrador (ele a escreveu, não há o que
   esconder); o pedido é o `volta` da tabela. */
function linhaDaVolta(s) {
  const t = tipoPorId(s.tipo);
  return `"${s.texto}"${s.quem ? ` (${s.quem})` : ""} volta agora: ${t.volta}`;
}

/* ---------------- O TURNO ----------------
   `ctx`: { pedido (de escuta.js#lerOPedido), luta, fio (de
   escuta.js#fioDaHistoria), mortos (nomes) }. Devolve { estado, semente,
   linha, expiradas }. `semente`/`linha` vazias quando nada volta.

   · turno do sistema ou luta: nada anda (quem empaca é o jogador; a luta
     é pausa);
   · anda o relógio; expira o que passou do prazo ou perdeu quem a fazia;
   · turno de pergunta: não cobra (a escuta);
   · senão, se o intervalo deixou, cobra a madura de maior urgência — a
     que toca o fio da história ganha meio ponto, porque a promessa que
     aperta o fio é a que aquece, e o peso do tipo soma; empate, a mais
     antiga. */
export function cobrarNoTurno(estado, ctx) {
  const E = garantirPrometido(estado);
  const c = obj(ctx);
  const p = obj(c.pedido);
  const nada = (e) => ({ estado: e, semente: null, linha: "", expiradas: [] });
  if (!p.doJogador || c.luta) return nada(E);
  const turno = E.turno + 1;
  const mortos = (Array.isArray(c.mortos) ? c.mortos : []).map(norm).filter(Boolean);
  const morreu = (s) => !!s.quem && ["volta", "ameaca"].includes(s.tipo) && mortos.includes(norm(s.quem));
  const expiradas = [];
  let sementes = E.sementes.map((s) => {
    if (s.estado !== "aberta") return s;
    if (turno - s.turno > tipoPorId(s.tipo).expira || morreu(s)) {
      const x = { ...s, estado: "expirada", fim: turno };
      expiradas.push(x);
      return x;
    }
    return s;
  });
  const base = { ...E, turno };
  const R = RITMO_DO_PROMETIDO;
  if (p.pergunta || turno - E.ultima < R.intervalo) return { ...nada({ ...base, sementes: aparar(sementes) }), expiradas };
  const fio = Array.isArray(c.fio) ? c.fio : [];
  const cands = sementes
    .filter((s) => s.estado === "aberta" && turno - s.turno >= tipoPorId(s.tipo).madura)
    .map((s) => ({ s, u: (turno - s.turno) / tipoPorId(s.tipo).vence + tipoPorId(s.tipo).peso * R.pesoNaEscolha + (tocaOFio(`${s.texto} ${s.quem}`, fio) ? R.fioNaEscolha : 0) }))
    .sort((a, b) => (b.u - a.u) || (a.s.id - b.s.id));
  if (!cands.length) return { ...nada({ ...base, sementes: aparar(sementes) }), expiradas };
  const eleita = { ...cands[0].s, estado: "cobrada", fim: turno };
  sementes = sementes.map((s) => (s.id === eleita.id ? eleita : s));
  return { estado: { ...base, ultima: turno, sementes: aparar(sementes) }, semente: eleita, linha: linhaDaVolta(eleita), expiradas };
}
