/* Taverna v7.0 — CORREIO DOS REINOS (tudo em código, zero tokens).
   Mensagens oficiais ENTRE facções passam por aqui: o jogador envia cartas
   (aliança, guerra, paz, tributo, casamento, conselho...) e as respostas
   chegam em 1–3 dias rolados por tabela. Facções também mandam petições ao
   jogador, com prazo para aceitar ou recusar. A IA só narra os envelopes —
   é proibida de inventar atos oficiais de facções fora deste sistema. */

export const CUSTO_CARTA = 10; // mensageiro + selo

export const TIPOS_CARTA = {
  alianca:   { icone: "🤝", nome: "Proposta de aliança",      base: 0.45, resposta: true,  desc: "Tratado de aliança entre as duas facções." },
  guerra:    { icone: "⚔️", nome: "Declaração de guerra",     base: 1.00, resposta: false, desc: "Guerra aberta. Não há recusa — há mobilização." },
  paz:       { icone: "🕊️", nome: "Pedido de paz",            base: 0.50, resposta: true,  desc: "Encerra uma guerra existente." },
  tributo:   { icone: "💰", nome: "Exigência de tributo",     base: 0.30, resposta: true,  desc: "Exige pagamento único da facção visada." },
  ajuda:     { icone: "🆘", nome: "Pedido de auxílio",        base: 0.40, resposta: true,  desc: "Pede apoio material ou militar." },
  conselho:  { icone: "📜", nome: "Pedido de conselho",       base: 0.85, resposta: true,  desc: "Pede orientação; a resposta vem por escrito." },
  casamento: { icone: "💍", nome: "Proposta de casamento político", base: 0.35, resposta: true, desc: "Une as casas por matrimônio." },
  cortesia:  { icone: "🌹", nome: "Carta de cortesia",        base: 0.90, resposta: true,  desc: "Saudações e presentes — estreita laços." },
};

export function garantirCorreio(c) {
  return c && typeof c === "object" && Array.isArray(c.enviadas) && Array.isArray(c.recebidas)
    ? { enviadas: c.enviadas, recebidas: c.recebidas, historico: Array.isArray(c.historico) ? c.historico : [], tratados: Array.isArray(c.tratados) ? c.tratados : [], seq: c.seq || 1 }
    : { enviadas: [], recebidas: [], historico: [], tratados: [], seq: 1 };
}

/* Chance de aceite de uma carta do jogador, modulada por fama e liderança. */
export function chanceResposta(tipo, { fama = 0, ehLider = false } = {}) {
  const t = TIPOS_CARTA[tipo];
  if (!t) return 0.5;
  let ch = t.base + fama / 250 + (ehLider ? 0.05 : 0);
  return Math.max(0.05, Math.min(0.95, ch));
}

export function criarCarta({ para, tipo, oferta = 0, mensagem = "", dia = 1, de = null }) {
  return {
    id: null, // preenchido no App (seq)
    de: de || "jogador",
    para, tipo, oferta: Math.max(0, Math.round(oferta || 0)),
    mensagem: String(mensagem || "").slice(0, 400),
    enviadaEm: dia,
    chegaEm: dia + 1 + Math.floor(Math.random() * 3), // 1–3 dias
    status: "a_caminho",
  };
}

/* Efeitos concretos quando uma carta do jogador é ACEITA. */
function efeitoAceite(tipo, carta) {
  const ef = { felicidade: 0, moedas: 0, tratadosAdd: [], tratadosRem: [], nota: "" };
  switch (tipo) {
    case "alianca":   ef.tratadosAdd.push({ faccao: carta.para, tratado: "alianca" }); ef.felicidade = 4; ef.nota = "aliança firmada"; break;
    case "paz":       ef.tratadosRem.push({ faccao: carta.para, tratado: "guerra" }); ef.felicidade = 4; ef.nota = "paz firmada"; break;
    case "tributo":   ef.moedas = 120 + Math.floor(Math.random() * 12) * 10; ef.nota = `tributo pago: ◉ ${ef.moedas}`; break;
    case "ajuda":     ef.nota = "auxílio prometido"; break;
    case "conselho":  ef.nota = "resposta por escrito"; break;
    case "casamento": ef.tratadosAdd.push({ faccao: carta.para, tratado: "casamento" }); ef.felicidade = 6; ef.nota = "casamento arranjado"; break;
    case "cortesia":  ef.felicidade = 1; ef.nota = "laços estreitados"; break;
  }
  return ef;
}

/* Petições que facções mandam ao jogador (aceitar/recusar, com prazo). */
const TIPOS_PETICAO = [
  { tipo: "pedido_alianca",   icone: "🤝", texto: (de) => `${de} propõe um tratado de aliança.`, peso: 3 },
  { tipo: "pedido_ajuda",     icone: "🆘", texto: (de) => `${de} pede auxílio contra seus inimigos.`, peso: 2 },
  { tipo: "exigencia_tributo",icone: "💰", texto: (de) => `${de} exige tributo de ◉ 120 pelo "privilégio" da paz.`, peso: 2 },
  { tipo: "ameaca",           icone: "🔥", texto: (de) => `${de} ameaça guerra se não houver submissão (◉ 80).`, peso: 1 },
  { tipo: "oferta_casamento", icone: "💍", texto: (de) => `${de} oferece casamento político para unir as casas.`, peso: 1 },
  { tipo: "comercio",         icone: "⚖️", texto: (de) => `${de} propõe acordo comercial (+renda enquanto vigorar).`, peso: 3 },
];

export function gerarPeticao({ faccoes = [], dia = 1 } = {}) {
  if (!faccoes.length) return null;
  const pool = TIPOS_PETICAO.flatMap((t) => Array(t.peso).fill(t));
  const t = pool[Math.floor(Math.random() * pool.length)];
  const de = faccoes[Math.floor(Math.random() * faccoes.length)];
  return { id: null, de, tipo: t.tipo, icone: t.icone, texto: t.texto(de), recebidaEm: dia, prazo: dia + 3, status: "pendente" };
}

/* Efeitos ao ACEITAR uma petição (recusar quase sempre só decepciona). */
export function resolverPeticao(p, aceite) {
  const ef = { felicidade: 0, moedas: 0, tratadosAdd: [], tratadosRem: [], nota: "" };
  if (!aceite) {
    if (p.tipo === "ameaca" && Math.random() < 0.5) { ef.tratadosAdd.push({ faccao: p.de, tratado: "guerra" }); ef.felicidade = -8; ef.nota = "a ameaça virou guerra"; }
    else ef.nota = "petição recusada";
    return ef;
  }
  switch (p.tipo) {
    case "pedido_alianca":   ef.tratadosAdd.push({ faccao: p.de, tratado: "alianca" }); ef.felicidade = 4; break;
    case "pedido_ajuda":     ef.moedas = -100; ef.tratadosAdd.push({ faccao: p.de, tratado: "apoio" }); ef.felicidade = 2; break;
    case "exigencia_tributo": ef.moedas = -120; break;
    case "ameaca":           ef.moedas = -80; ef.nota = "submissão comprada"; break;
    case "oferta_casamento": ef.tratadosAdd.push({ faccao: p.de, tratado: "casamento" }); ef.felicidade = 6; break;
    case "comercio":         ef.tratadosAdd.push({ faccao: p.de, tratado: "comercio" }); ef.moedas = 60; break;
  }
  return ef;
}

/* Processamento diário: respostas chegam, petições novas surgem (~15%/dia),
   petições vencidas expiram. Retorna mensagens (envelopes) e efeitos somados. */
export function processarDiaCorreio(correio, { dia = 1, fama = 0, ehLider = false, faccoes = [] } = {}) {
  const c = garantirCorreio(correio);
  const msgs = [];
  const ef = { felicidade: 0, moedas: 0, tratadosAdd: [], tratadosRem: [] };

  /* respostas às cartas do jogador */
  c.enviadas = c.enviadas.filter((carta) => {
    if (carta.status !== "a_caminho" || carta.chegaEm > dia) return true;
    const t = TIPOS_CARTA[carta.tipo] || {};
    if (carta.tipo === "guerra") {
      ef.tratadosAdd.push({ faccao: carta.para, tratado: "guerra" });
      ef.felicidade -= 8;
      msgs.push(`[CORREIO — GUERRA DECLARADA] A declaração de guerra chegou a ${carta.para}. Os tambores soam: ${carta.para} mobiliza suas forças. A guerra é oficial e registrada.`);
      c.historico.unshift({ ...carta, status: "guerra", respondidaEm: dia });
    } else if (Math.random() < chanceResposta(carta.tipo, { fama, ehLider })) {
      const e = efeitoAceite(carta.tipo, carta);
      ef.felicidade += e.felicidade; ef.moedas += e.moedas;
      ef.tratadosAdd.push(...e.tratadosAdd); ef.tratadosRem.push(...e.tratadosRem);
      msgs.push(`[CORREIO — RESPOSTA: ACEITA] ${carta.para} ACEITOU: ${t.icone || ""} ${t.nome || carta.tipo}${carta.oferta ? ` (oferta de ◉ ${carta.oferta})` : ""}. ${e.nota ? `Resultado: ${e.nota}.` : ""}${carta.tipo === "conselho" ? " O Mestre escreve o conselho recebido na voz do destinatário." : ""}`);
      c.historico.unshift({ ...carta, status: "aceita", respondidaEm: dia });
    } else {
      msgs.push(`[CORREIO — RESPOSTA: RECUSADA] ${carta.para} RECUSOU: ${t.icone || ""} ${t.nome || carta.tipo}${carta.oferta ? ` (oferta de ◉ ${carta.oferta})` : ""}. O selo voltou quebrado.`);
      c.historico.unshift({ ...carta, status: "recusada", respondidaEm: dia });
    }
    return false;
  });

  /* petições vencidas */
  c.recebidas = c.recebidas.filter((p) => {
    if (p.status !== "pendente") return false;
    if (p.prazo >= dia) return true;
    msgs.push(`[CORREIO — PETIÇÃO EXPIRADA] ${p.de} não recebeu resposta (${p.texto}) e retirou a oferta, ofendido.`);
    ef.felicidade -= 1;
    c.historico.unshift({ ...p, status: "expirada" });
    return false;
  });

  /* nova petição do mundo (~15%/dia, máx. 3 pendentes) */
  const pendentes = c.recebidas.filter((p) => p.status === "pendente").length;
  if (faccoes.length && pendentes < 3 && Math.random() < 0.15) {
    const p = gerarPeticao({ faccoes, dia });
    if (p) {
      p.id = `pet_${dia}_${Math.floor(Math.random() * 9999)}`;
      c.recebidas.unshift(p);
      msgs.push(`[CORREIO — PETIÇÃO RECEBIDA] ${p.icone} ${p.texto} Prazo: até o dia ${p.prazo}. O jogador decide na aba Correio.`);
    }
  }

  c.historico = c.historico.slice(0, 12);
  return { correio: c, msgs, efeitos: ef };
}
