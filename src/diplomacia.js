/* ============================================================
   A DIPLOMACIA (v9.142) — quem decide é o código, e não a IA

   Esta era a última sala da casa onde a IA ainda decidia o que existe. O
   texto que o jogo mandava ao Narrador dizia, com todas as letras:

     "O líder de X responde NA FICÇÃO conforme poder, personalidade, medos e
      ambições: pode aceitar, exigir condições, adiar ou recusar — A DECISÃO
      É DELE(A). Se um acordo for firmado, registre em mapa_faccoes."

   Ou seja: o jogador apertava um botão, a IA inventava a resposta e depois
   escrevia o tratado de volta no mundo. Todo o resto do projeto foi feito
   para tirar exatamente isso da IA.

   ---------------- E HAVIA UM SEGUNDO BURACO ----------------

   A aba lia só `mapa.faccoes`, que existe apenas quando a IA nomeia alguém.
   Enquanto isso o mundo JÁ NASCE com sete casas geradas por código — com
   ofício, sede, leis, membros e poder — e a diplomacia nunca soube que elas
   existiam. Campanha nova abria a aba e via "nenhuma potência conhecida"
   com sete potências de pé ali fora.

   Aqui as duas viram a mesma coisa: uma POTÊNCIA é qualquer um que tenha
   nome e poder, venha da geração do mundo ou da boca do Narrador.

   ---------------- O QUE UMA POTÊNCIA QUER ----------------

   Antes ela tinha nome, tipo, líder e poder — e nada que se pudesse pesar.
   Agora tem apetite, medo e orgulho, derivados do nome como a índole de uma
   pessoa: a mesma potência quer sempre a mesma coisa, e não é preciso
   guardar nada no save.
   ============================================================ */

import { comA } from "./lugar.js";

/* ---------------- O APETITE ----------------
   O que ela quer, e o que isso faz com uma proposta. Cada apetite muda o
   peso de uma oferta ESPECÍFICA — senão seria adjetivo. */
export const APETITES = [
  { id: "moeda", o: "quer ouro, e não esconde", ama: "comercio", odeia: "vassalagem", presente: 1.5 },
  { id: "terra", o: "quer chão, e mede o seu", ama: "vassalagem", odeia: "comercio", presente: 0.7 },
  { id: "braco", o: "quer braço armado ao lado", ama: "alianca", odeia: "comercio", presente: 0.9 },
  { id: "segredo", o: "quer saber o que os outros não sabem", ama: "alianca", odeia: "guerra", presente: 1.1 },
  { id: "fe", o: "quer almas, e conta as suas", ama: "alianca", odeia: "vassalagem", presente: 0.8 },
  { id: "sangue", o: "quer acerto de contas antigo", ama: "guerra", odeia: "alianca", presente: 0.6 },
];
export const apetitePorId = (id) => APETITES.find((a) => a.id === id) || APETITES[0];

/* ---------------- O MEDO ----------------
   O que a faz ceder. É o outro lado do apetite: o apetite explica o "sim",
   o medo explica o "sim relutante" — e são coisas diferentes na mesa. */
export const MEDOS_DE_POTENCIA = [
  { id: "vizinho", o: "teme quem é maior do que ela aqui perto", cede: (c) => c.maiorQueEla },
  { id: "cerco", o: "teme ficar sozinha", cede: (c) => c.tratadosDela === 0 },
  { id: "lenda", o: "teme o nome que você construiu", cede: (c) => c.fama >= 60 },
  { id: "fome", o: "teme o inverno e o cofre vazio", cede: (c) => c.presenteados >= 2 },
  { id: "ninguem", o: "não teme coisa nenhuma, e faz questão de mostrar", cede: () => false },
];
export const medoPorId = (id) => MEDOS_DE_POTENCIA.find((m) => m.id === id) || MEDOS_DE_POTENCIA[4];

function hash(s) {
  let h = 2166136261;
  const t = String(s || "");
  for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

/* ---------------- A POTÊNCIA ----------------
   Forma única para o que vem da geração do mundo (as casas) e para o que
   vem da boca do Narrador (as facções). Sem isto, tudo o que segue teria de
   ser escrito duas vezes — e a segunda vez ficaria para trás. */
export function potenciaDe(fonte, { doJogador = false } = {}) {
  const f = fonte || {};
  const nome = String(f.nome || "").slice(0, 50);
  if (!nome) return null;
  /* `poder` da casa é 1..100; o da facção do Narrador é uma palavra */
  const PALAVRA = { menor: 20, regional: 45, grande: 70, imperio: 90 };
  const poder = Number.isFinite(Number(f.poder))
    ? Math.max(1, Math.min(100, Math.round(Number(f.poder))))
    : (PALAVRA[String(f.poder || "").toLowerCase()] || 40);
  const h = hash(`potencia|${nome}`);
  return {
    nome,
    tipo: String(f.tipo || f.oficio || "casa").slice(0, 20),
    lider: String(f.lider || f.mestre || "").slice(0, 40),
    sede: String(f.sede || "").slice(0, 40),
    poder,
    tratado: String(f.tratado || "nenhum"),
    relacao: String(f.relacao || "neutra"),
    notas: String(f.notas || "").slice(0, 120),
    doJogador: !!doJogador || !!f.doJogador,
    apetite: APETITES[h % APETITES.length].id,
    medo: MEDOS_DE_POTENCIA[(h >>> 5) % MEDOS_DE_POTENCIA.length].id,
    /* orgulho 0..3: quanto ela precisa ser tratada como igual */
    orgulho: (h >>> 11) % 4,
  };
}

export function potenciasDoMundo({ guildas = [], faccoes = [], faccaoJogador = "" } = {}) {
  const vistos = new Set();
  const out = [];
  for (const g of guildas || []) {
    const p = potenciaDe(g, { doJogador: !!g.doJogador || !!g.membro });
    if (!p || vistos.has(p.nome.toLowerCase())) continue;
    vistos.add(p.nome.toLowerCase()); out.push(p);
  }
  for (const f of faccoes || []) {
    const p = potenciaDe(f, { doJogador: f.nome === faccaoJogador || !!f.doJogador });
    if (!p || vistos.has(p.nome.toLowerCase())) continue;
    vistos.add(p.nome.toLowerCase()); out.push(p);
  }
  return out;
}

/* ---------------- O APREÇO ----------------
   O único estado que a diplomacia guarda: o que cada potência acha de você,
   de 0 a 100, e o que você já mandou. Começa em 40 — nem amizade nem
   desconfiança: ela não te conhece.

   Isto existe porque uma decisão precisa de HISTÓRICO. Sem ele, propor duas
   vezes daria a mesma resposta para sempre, e nada do que o jogador fizesse
   entre uma e outra teria peso. */
export const APRECO_INICIAL = 40;

export function garantirDiplomacia(d) {
  const o = d && typeof d === "object" ? d : {};
  const por = {};
  for (const [k, v] of Object.entries(o.por || {})) {
    if (!k) continue;
    por[k] = {
      /* O ZERO É UM VALOR, E NÃO A FALTA DE UM. `Number(0) || 40` devolve
         40: uma potência que passou a te odiar por completo voltava a
         neutra na primeira normalização — isto é, no próximo save. É a
         mesma armadilha que fez o prazo virar dia 0 na v9.141, do outro
         lado: lá o zero entrava sem querer, aqui ele saía sem querer. */
      apreco: Math.max(0, Math.min(100, Math.round(v && v.apreco != null && Number.isFinite(Number(v.apreco)) ? Number(v.apreco) : APRECO_INICIAL))),
      presenteados: Math.max(0, Math.round(Number(v && v.presenteados) || 0)),
      exigencia: (v && v.exigencia && v.exigencia.tipo) ? { ...v.exigencia } : null,
      ultimaEm: Math.max(0, Math.round(Number(v && v.ultimaEm) || 0)),
    };
  }
  return { por };
}

export const chaveDaPotencia = (nome) => String(nome || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

export function aprecoDe(dip, nome) {
  const d = garantirDiplomacia(dip);
  const v = d.por[chaveDaPotencia(nome)];
  return v ? v.apreco : APRECO_INICIAL;
}

export function fichaDe(dip, nome) {
  const d = garantirDiplomacia(dip);
  return d.por[chaveDaPotencia(nome)] || { apreco: APRECO_INICIAL, presenteados: 0, exigencia: null, ultimaEm: 0 };
}

export function mexerNoApreco(dip, nome, quanto, campos = {}) {
  const d = garantirDiplomacia(dip);
  const k = chaveDaPotencia(nome);
  if (!k) return d;
  const atual = d.por[k] || { apreco: APRECO_INICIAL, presenteados: 0, exigencia: null, ultimaEm: 0 };
  return {
    por: {
      ...d.por,
      [k]: {
        ...atual, ...campos,
        apreco: Math.max(0, Math.min(100, Math.round(atual.apreco + (Number(quanto) || 0)))),
      },
    },
  };
}

/* ---------------- O PRESENTE ----------------
   Custava 40 moedas fixas, fosse para um bando de estrada ou para um
   império — e o efeito era a IA decidir se tinha gostado. Agora o preço
   sobe com o poder de quem recebe, o apetite dela decide se aquilo
   impressiona, e o que ele move é um número. */
export function custoDoPresente(potencia) {
  const p = potencia || {};
  return Math.max(40, Math.round(30 + (p.poder || 40) * 6));
}

export function presentear(dip, potencia, { dia = 1 } = {}) {
  const p = potencia || {};
  const ap = apetitePorId(p.apetite);
  /* quem tem orgulho alto acha pouco quase sempre; quem quer moeda, não */
  /* O PESO DO ORGULHO ERA PEQUENO DEMAIS PARA OFENDER ALGUÉM. A sonda
     mediu os vinte e quatro cruzamentos de apetite e orgulho e o pior deles
     ainda dava +2: `ofendeu` nunca era verdade, e o painel e o envelope
     falavam de uma ofensa que o sistema não sabia produzir. Promessa que o
     código não entrega é adjetivo, e este projeto passou meses tirando
     adjetivo do jogo. */
  const ganho = Math.round(10 * ap.presente - (p.orgulho || 0) * 3);
  const f = fichaDe(dip, p.nome);
  return {
    dip: mexerNoApreco(dip, p.nome, ganho, { presenteados: f.presenteados + 1, ultimaEm: dia }),
    ganho,
    /* o presente pode ofender: orgulho alto e apetite que despreza ouro */
    ofendeu: ganho <= 0,
  };
}

/* ---------------- A DECISÃO ----------------
   Aqui mora o que a IA decidia. Devolve o veredito E os porquês, porque
   uma decisão que não se explica é a mesma arbitrariedade de antes, só que
   com outro dono. */
export const RESPOSTAS = {
  aceita: { id: "aceita", rotulo: "aceita", cor: "ok" },
  exige: { id: "exige", rotulo: "aceita, com uma condição", cor: "amber" },
  adia: { id: "adia", rotulo: "pede tempo", cor: "dim" },
  recusa: { id: "recusa", rotulo: "recusa", cor: "danger" },
};

/* o que cada proposta pede de apreço para passar limpa */
const EXIGE_APRECO = { comercio: 45, alianca: 65, vassalagem: 85, guerra: 0 };

export function pesarProposta({ potencia, acao, dip = null, fama = 0, meuPoder = 0, dia = 1, emGuerraCom = [] }) {
  const p = potencia || {};
  if (!p.nome) return null;
  if (!EXIGE_APRECO[acao] && acao !== "guerra") return null;

  const ap = apetitePorId(p.apetite);
  const md = medoPorId(p.medo);
  const f = fichaDe(dip, p.nome);
  const porques = [];

  /* declarar guerra não se negocia: é um ato, e o outro lado só reage */
  if (acao === "guerra") {
    return { resposta: "aceita", porques: [`${p.nome} não tinha o que responder: guerra não é proposta`], exigencia: null };
  }

  let peso = f.apreco;
  porques.push(`apreço ${f.apreco}`);

  /* o apetite dela: o que ela ama pesa a favor, o que despreza pesa contra */
  if (ap.ama === acao) { peso += 18; porques.push(`${p.nome} ${ap.o}`); }
  if (ap.odeia === acao) { peso -= 22; porques.push(`${p.nome} ${ap.o} — e isto não é isso`); }

  /* o poder relativo: ninguém vira vassalo de quem é menor */
  const eu = Math.max(0, Math.min(100, meuPoder));
  const dif = eu - p.poder;
  if (acao === "vassalagem") {
    if (dif < 20) { peso -= 40; porques.push(`ela tem poder ${p.poder} e você, ${eu}`); }
    else { peso += 15; porques.push(`você é visivelmente maior`); }
  } else if (dif > 25) { peso += 8; porques.push("você chega de cima"); }
  else if (dif < -25) { peso -= 8; porques.push("você chega de baixo"); }

  /* a sua lenda abre porta */
  if (fama >= 60) { peso += 10; porques.push("a sua lenda chegou antes de você"); }
  else if (fama < 10) { peso -= 8; porques.push("ninguém ali sabe quem você é"); }

  /* o medo dela: é o que faz ceder o que o apreço não faria */
  const cedeu = !!md.cede({
    maiorQueEla: dif > 15, tratadosDela: p.tratado && p.tratado !== "nenhum" ? 1 : 0,
    fama, presenteados: f.presenteados,
  });
  if (cedeu) { peso += 14; porques.push(`${md.o}`); }

  /* guerra com quem ela ama, ou com quem ela odeia */
  const inimigosComuns = (emGuerraCom || []).filter(Boolean);
  if (inimigosComuns.length && ap.id === "sangue") { peso += 8; porques.push("você luta a guerra dela"); }

  /* já pediram isso há pouco: insistir cansa */
  if (f.ultimaEm && dia - f.ultimaEm < 3) { peso -= 12; porques.push("você pediu isto anteontem"); }

  const alvo = EXIGE_APRECO[acao];
  if (peso >= alvo + 15) return { resposta: "aceita", porques, exigencia: null };
  if (peso >= alvo) return { resposta: "exige", porques, exigencia: exigenciaDe(p, acao) };
  if (peso >= alvo - 15) return { resposta: "adia", porques, exigencia: null };
  return { resposta: "recusa", porques, exigencia: null };
}

/* ---------------- A CONDIÇÃO ----------------
   Uma exigência tem de ser CONFERÍVEL, senão é adjetivo — o mesmo erro que
   fez "ganhar a confiança do barão" virar uma etapa que nunca fechava. São
   três, e o sistema sabe olhar as três. */
export function exigenciaDe(potencia, acao) {
  const p = potencia || {};
  const ap = apetitePorId(p.apetite);
  if (ap.id === "moeda" || ap.id === "fome") {
    return { tipo: "tributo", moedas: Math.max(100, Math.round(p.poder * 18)), o: `tributo de ◉ ${Math.max(100, Math.round(p.poder * 18))} do cofre` };
  }
  if (ap.id === "sangue") {
    return { tipo: "inimigo", o: `que você declare guerra a quem ${p.nome} odeia` };
  }
  return { tipo: "espera", dias: 3 + (p.orgulho || 0) * 2, o: `que você espere ${3 + (p.orgulho || 0) * 2} dias e volte — ela quer ver se você some` };
}

/* ---------------- O QUE O NARRADOR RECEBE ----------------
   Fato consumado. Ele encena a mesa; ele não decide quem senta nela. */
export function envelopeDaResposta(potencia, acao, veredito) {
  const p = potencia || {};
  const v = veredito || {};
  const O_QUE = { comercio: "um acordo comercial", alianca: "uma aliança", vassalagem: "que se tornem seus vassalos", guerra: "guerra" };
  const cabeca = `[DIPLOMACIA — RESOLVIDA PELO SISTEMA] Você propôs ${O_QUE[acao] || acao} ${comA(p.nome)}${p.lider ? `, de ${p.lider}` : ""}.`;
  const corpo = {
    aceita: `A resposta é SIM, e já está firmada.`,
    exige: `A resposta é SIM COM UMA CONDIÇÃO: ${(v.exigencia || {}).o}. Enquanto ela não for cumprida, não há tratado.`,
    adia: `A resposta é UM TALVEZ que não compromete: ela pede tempo, e não diz quanto.`,
    recusa: `A resposta é NÃO.`,
  }[v.resposta] || "";
  const porque = (v.porques || []).length ? ` O que pesou: ${(v.porques || []).join("; ")}.` : "";
  return `${cabeca} ${corpo}${porque} Narre a cena da resposta — o salão, quem fala, o que o corpo dela diz — com ESTE desfecho e nenhum outro. Não invente termos que não estão aqui, não firme nada além disto e não reabra a decisão.`;
}

export function envelopeDoPresente(potencia, r) {
  const p = potencia || {};
  return `[PRESENTE — JÁ ENTREGUE E JÁ PESADO PELO SISTEMA] Você mandou um presente ${comA(p.nome)}. ${r && r.ofendeu ? "Ela achou pouco, e isso ficou claro sem ninguém dizer." : "Ela recebeu bem."} Narre a entrega e a reação, com este desfecho; não firme tratado nenhum por causa disto.`;
}

/* ---------------- A GUERRA CUSTA ----------------
   `gestao.js` dizia, desde a v6.5: "guerra: sem bônus — os efeitos da
   guerra são ficção do Mestre". Ou seja, declarar guerra não fazia
   absolutamente nada, e a única coisa que impedia o jogador de declarar
   guerra a todo mundo era não ter motivo.

   Agora ela morde por dia, nos domínios, e o quanto morde sai do poder de
   quem está do outro lado. */
export const DANO_DE_GUERRA = 0.06;

export function golpeDaGuerra(potencias, { dominios = 0 } = {}) {
  const emGuerra = (potencias || []).filter((p) => p && p.tratado === "guerra" && !p.doJogador);
  if (!emGuerra.length || !dominios) return null;
  const forca = emGuerra.reduce((s, p) => s + p.poder, 0);
  return {
    quem: emGuerra.map((p) => p.nome),
    felicidade: -Math.max(1, Math.round(forca * DANO_DE_GUERRA)),
    o: emGuerra.length === 1
      ? `${emGuerra[0].nome} está em guerra com você, e o seu povo sente`
      : `${emGuerra.length} potências em guerra com você, e o seu povo sente`,
  };
}

/* ---------------- O RESUMO PARA A PAUTA ---------------- */
export function envelopeDasPotencias(potencias, dip) {
  const ps = (potencias || []).filter((p) => p && !p.doJogador).slice(0, 6);
  if (!ps.length) return "";
  const linhas = ps.map((p) => {
    const ap = apetitePorId(p.apetite);
    const t = p.tratado && p.tratado !== "nenhum" ? `, ${p.tratado} com você` : "";
    return `${p.nome} (poder ${p.poder}${t}): ${ap.o}; ${medoPorId(p.medo).o}. Apreço por você: ${aprecoDe(dip, p.nome)}/100.`;
  });
  return `${linhas.join("\n")}\nIsto é FATO do mundo. Use na cena; não firme, rompa nem altere tratado nenhum por conta própria — quem decide isso é o sistema.`;
}
