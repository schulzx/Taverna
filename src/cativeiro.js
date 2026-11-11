/* ============================================================
   O CATIVEIRO — o preso é um estado, e só um dado o solta
   (11/11/2026, Fase MC · MC9 — «O Mestre chama o dado»)

   O DEFEITO, medido na 18.ª sessão de prova (mente/sessao-18.md, defeito
   4; a planta, mente/plano-o-mestre-chama-o-dado.md §1.7): a luta perdida
   para a Bruxa acabou no desfecho `prisioneiros` (saida-da-luta.js), e o
   `presos: true` só era lido para TEXTO — «acordo de mãos atadas». Não
   havia estado nenhum. O turno seguinte foi sem envelope, e o Narrador
   soltou o herói, deu-lhe uma chave que o sistema não tem (a tela ainda
   dizia «portão lacrado — falta a chave») e tirou-o da sala; a tela da
   masmorra deixava «sair» à mão; e o catálogo, que tem `escapar` e
   `arrebentar`, não sabia que havia de que escapar.

   A REGRA, numa frase: ENQUANTO HÁ CATIVEIRO, SÓ UM DADO DO HERÓI O ABRE.
   O estado diz quem prende (o captor e a cabeça dele, o degrau), com quê
   (as amarras, da semente) e onde; cada saída tem a perícia, a CD que sai
   do captor e um preço quando falha. O Narrador recebe o estado na pauta
   e os vetos em `naoPode`: não solta, não dá chave nem ferramenta, não
   tira o captor de cena.

     abrirCativeiro({ captor, degrau, onde, dia, presos, sorte })
       → cativeiro | null            (o desfecho `prisioneiros` abre-o)
     garantirCativeiro(x)            → cativeiro | null  (o save; lixo → null)
     cdDaSaida(cativeiro, alvo)      → { dc, deOnde, pericia } | null
                                       (o catálogo, desafios.js, lê-a em
                                        `escapar` e `arrebentar`)
     aplicarSaida(cativeiro, id, { sucesso })
       → { cativeiro, livre, preco, horas, linha }   (o sucesso fecha)
     oCativeiroNaPauta(cativeiro)    → { linha, naoPode }

   O SAVE: campo novo `cativeiro`, aditivo — a versão antiga ignora-o, e um
   save antigo abre sem ele (`garantirCativeiro(undefined)` → null).

   Puro: sem React, sem relógio, sem Math.random. A única sorte (as
   amarras) entra pelo gerador semeado que quem abre passa.
   ============================================================ */

/* ---------------- A CD DO CAPTOR ----------------
   A cabeça de quem prende (os degraus de degraus.js) diz quão bem atou:
   o animal não ata ninguém (fica no chão, para o caso de a intenção o
   mandar), o bruto ata com força e sem jeito, o treinado ata como quem
   já atou muitos, o brilhante não deixa folga nenhuma. Os números são os
   degraus da régua de desafios.js (comum 13, incomum 15, difícil 18): o
   treinado é o «comum» do cativeiro. `piso` e `teto` seguram a soma das
   amarras, do aperto e da vigia — 25 é o heroico, e nenhum nó é mais do
   que isso. */
export const CD_DO_CAPTOR = Object.freeze({
  porDegrau: Object.freeze({ animal: 10, bruto: 12, astuto: 13, treinado: 14, brilhante: 16 }),
  padrao: "bruto",
  piso: 10,
  teto: 25,
});

/* ---------------- AS AMARRAS ----------------
   Com quê o captor prende: da semente (a mesma luta, o mesmo nó). Cada uma
   pesa diferente em cada saída — a corrente não se arrebenta e mal se
   desliza, a corda cede ao jeito, a raiz cede à força. O `convencer` não
   olha para o nó: é com quem prende que se fala. */
export const AMARRAS = Object.freeze([
  Object.freeze({ id: "cordas", nome: "cordas", ajuste: Object.freeze({ arrebentar: 0, escapar: 0, convencer: 0 }) }),
  Object.freeze({ id: "correntes", nome: "correntes", ajuste: Object.freeze({ arrebentar: 4, escapar: 2, convencer: 0 }) }),
  Object.freeze({ id: "tiras", nome: "tiras de couro", ajuste: Object.freeze({ arrebentar: 1, escapar: -1, convencer: 0 }) }),
  Object.freeze({ id: "raizes", nome: "raízes", ajuste: Object.freeze({ arrebentar: -1, escapar: 2, convencer: 0 }) }),
]);

/* ---------------- AS SAÍDAS ----------------
   Cada uma: a perícia, o desafio do catálogo que a abre (`alvo`, o mesmo
   de DESAFIOS em desafios.js — `convencer` é social e não está lá), o
   ajuste sobre a CD do captor (`delta`), o verbo que a pauta diz, e o
   PREÇO de falhar. Nenhuma saída sem preço (a suíte confere):
     · aperta — o nó aperta: esta saída fica mais difícil (`cd`);
     · tempo  — o tempo corre preso (`horas`, que o App passa no relógio);
     · vigia  — quem prende percebe e passa a vigiar: TODAS as saídas
                ficam mais difíceis (`cd`).
   A força custa o nó, o jeito custa o tempo, a lábia custa a confiança
   do captor — três portas, três moedas. */
export const SAIDAS_DO_CATIVEIRO = Object.freeze([
  Object.freeze({
    id: "arrebentar", pericia: "atletismo", alvo: "arrebentar", delta: 0,
    verbo: "forçar o que me prende", livre: "o que me prendia cede",
    preco: Object.freeze({ efeito: "aperta", cd: 2, diz: "o que prende não cede, e cada puxão aperta mais o nó" }),
  }),
  Object.freeze({
    id: "escapar", pericia: "acrobacia", alvo: "escapar", delta: 2,
    verbo: "soltar-me torcendo os pulsos", livre: "os pulsos passam pelo nó",
    preco: Object.freeze({ efeito: "tempo", horas: 1, diz: "os pulsos não passam, e uma hora vai-se nisso" }),
  }),
  Object.freeze({
    id: "convencer", pericia: "persuasao", alvo: "convencer", delta: 3,
    verbo: "convencer quem me prende", livre: "quem me prende deixa-me ir",
    preco: Object.freeze({ efeito: "vigia", cd: 2, diz: "quem me prende percebe a manobra e passa a vigiar-me de perto" }),
  }),
]);

/* ---------------- A PAUTA ----------------
   A linha do estado (o canal por turno, nunca bloco fixo — o teto do
   prompt é sagrado) e os vetos. `teto` é o da linha; os vetos são curtos
   e fixos. Na voz do herói, como o resto de `naoPode`. */
export const PAUTA_DO_CATIVEIRO = Object.freeze({
  teto: 220,
  linha: "PRESO: atado com {amarras} por {captor}{onde}{presos}. Só saio por um dado meu: {saidas}.",
  onde: ", em {onde}",
  presos: "; comigo, {presos}",
  naoPode: Object.freeze([
    "soltar-me, ou que alguém me solte, sem um dado meu que o decida",
    "dar-me chave, lâmina ou ferramenta: tiraram-me o que tinha, e o que não tenho não aparece",
    "tirar {captor} de cena: é quem me prende",
  ]),
});

/* ---------------- os ajudantes ---------------- */
const obj = (x) => (x && typeof x === "object" && !Array.isArray(x) ? x : null);
const arr = (x) => (Array.isArray(x) ? x : []);
const texto = (x, max) => (typeof x === "string" ? x.trim().slice(0, max) : "");
const inteiro = (x) => (Number.isFinite(Number(x)) ? Math.round(Number(x)) : 0);
const encher = (m, v) => String(m).replace(/\{(\w+)\}/g, (_, k) => (v[k] == null ? "" : String(v[k])));
const amarraPorId = (id) => AMARRAS.find((a) => a.id === id) || null;
const saidaPorId = (id) => SAIDAS_DO_CATIVEIRO.find((s) => s.id === id || s.alvo === id) || null;
const cdDoDegrau = (degrau) => CD_DO_CAPTOR.porDegrau[degrau] != null ? CD_DO_CAPTOR.porDegrau[degrau] : CD_DO_CAPTOR.porDegrau[CD_DO_CAPTOR.padrao];
const LIMITES = Object.freeze({ nome: 80, presos: 6 });

/* ---------------- ABRIR ----------------
   `captor`: o nome de quem prende (ou o objeto da criatura, com `nome`);
   `degrau`: a cabeça dele (degraus.js — quem abre já a sabe); `sorte`: o
   gerador semeado (as amarras). Sem captor, não há cativeiro. */
export function abrirCativeiro(opcoes) {
  const o = obj(opcoes) || {};
  const captor = texto(typeof o.captor === "string" ? o.captor : obj(o.captor) ? o.captor.nome : "", LIMITES.nome);
  if (!captor) return null;
  const degrau = CD_DO_CAPTOR.porDegrau[o.degrau] != null ? o.degrau : CD_DO_CAPTOR.padrao;
  const sorte = typeof o.sorte === "function" ? o.sorte : null;
  const r = sorte ? Number(sorte()) : 0;
  const amarra = AMARRAS[Math.min(AMARRAS.length - 1, Math.max(0, Math.floor((Number.isFinite(r) ? r : 0) * AMARRAS.length)))];
  return garantirCativeiro({
    v: 1, captor, degrau, cd: cdDoDegrau(degrau), amarras: amarra.id,
    onde: o.onde, desde: o.dia, presos: o.presos,
    aperto: {}, vigia: 0, tentativas: 0,
  });
}

/* ---------------- O SAVE ----------------
   `= {}` não cobre `null`: tudo passa por aqui. Lixo devolve null (não há
   cativeiro), e o que vem do save sai inteiro e normalizado. */
export function garantirCativeiro(x) {
  const c = obj(x);
  if (!c) return null;
  const captor = texto(c.captor, LIMITES.nome);
  if (!captor) return null;
  const degrau = CD_DO_CAPTOR.porDegrau[c.degrau] != null ? c.degrau : CD_DO_CAPTOR.padrao;
  const aperto = {};
  for (const s of SAIDAS_DO_CATIVEIRO) { const n = Math.max(0, inteiro(obj(c.aperto) && c.aperto[s.id])); if (n) aperto[s.id] = n; }
  return {
    v: 1, captor, degrau,
    cd: Math.max(CD_DO_CAPTOR.piso, Math.min(CD_DO_CAPTOR.teto, inteiro(c.cd) || cdDoDegrau(degrau))),
    amarras: amarraPorId(c.amarras) ? c.amarras : AMARRAS[0].id,
    onde: texto(c.onde, LIMITES.nome),
    desde: Math.max(0, inteiro(c.desde)),
    presos: arr(c.presos).map((p) => texto(typeof p === "string" ? p : obj(p) && p.nome, LIMITES.nome)).filter(Boolean).slice(0, LIMITES.presos),
    aperto,
    vigia: Math.max(0, inteiro(c.vigia)),
    tentativas: Math.max(0, inteiro(c.tentativas)),
  };
}

/* ---------------- A CD DE UMA SAÍDA ----------------
   O que o catálogo lê em vez do `dcPadrao` de `escapar`/`arrebentar`
   quando há cativeiro: a CD do captor, mais a saída, as amarras, o nó
   apertado e a vigia. `deOnde` é a etiqueta que o chamado mostra — o
   obstáculo, nunca o nome da regra. */
export function cdDaSaida(cativeiro, alvo) {
  const c = garantirCativeiro(cativeiro);
  const s = c ? saidaPorId(alvo) : null;
  if (!s) return null;
  const amarra = amarraPorId(c.amarras);
  const aj = (amarra.ajuste[s.id] || 0);
  const aperto = c.aperto[s.id] || 0;
  const bruto = c.cd + s.delta + aj + aperto + c.vigia;
  const dc = Math.max(CD_DO_CAPTOR.piso, Math.min(CD_DO_CAPTOR.teto, bruto));
  const partes = [`as ${amarra.nome} com que ${c.captor} me atou`];
  if (aperto) partes.push(`apertadas (+${aperto})`);
  if (c.vigia) partes.push(`sob vigia (+${c.vigia})`);
  return { dc, deOnde: partes.join(", "), pericia: s.pericia };
}

/* ---------------- UMA TENTATIVA ----------------
   O sucesso fecha o estado (`cativeiro: null`, `livre: true`). A falha
   cobra o preço da saída e devolve o estado novo; `horas` é o tempo que o
   App passa no relógio (o preço `tempo`), 0 nos outros. Saída que não
   existe, ou cativeiro nenhum: nada muda (`preco: null`). */
export function aplicarSaida(cativeiro, saidaId, opcoes) {
  const c = garantirCativeiro(cativeiro);
  const s = saidaPorId(saidaId);
  const o = obj(opcoes) || {};
  if (!c || !s) return { cativeiro: c, livre: false, preco: null, horas: 0, linha: "" };
  if (o.sucesso === true) return { cativeiro: null, livre: true, preco: null, horas: 0, linha: `Livre: ${s.livre}, e ${c.captor} já não me prende.` };
  const p = s.preco;
  const novo = { ...c, aperto: { ...c.aperto }, tentativas: c.tentativas + 1 };
  if (p.efeito === "aperta") novo.aperto[s.id] = (novo.aperto[s.id] || 0) + p.cd;
  if (p.efeito === "vigia") novo.vigia = c.vigia + p.cd;
  return { cativeiro: garantirCativeiro(novo), livre: false, preco: p, horas: p.efeito === "tempo" ? p.horas : 0, linha: p.diz[0].toUpperCase() + p.diz.slice(1) + "." };
}

/* ---------------- NA PAUTA ----------------
   Enquanto dura, a linha do estado e os três vetos vão a cada turno. Sem
   cativeiro, nada — nem linha, nem veto. */
export function oCativeiroNaPauta(cativeiro) {
  const c = garantirCativeiro(cativeiro);
  if (!c) return { linha: "", naoPode: [] };
  const P = PAUTA_DO_CATIVEIRO;
  const amarra = amarraPorId(c.amarras);
  const saidas = SAIDAS_DO_CATIVEIRO.map((s) => s.verbo).join(", ");
  let linha = encher(P.linha, {
    captor: c.captor, amarras: amarra.nome,
    onde: c.onde ? encher(P.onde, { onde: c.onde }) : "",
    presos: c.presos.length ? encher(P.presos, { presos: c.presos.join(" e ") }) : "",
    saidas,
  });
  if (linha.length > P.teto) linha = linha.slice(0, P.teto).replace(/\s+\S*$/, "") + "…";
  return { linha, naoPode: P.naoPode.map((v) => encher(v, { captor: c.captor })) };
}
