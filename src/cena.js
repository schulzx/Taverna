/* ============================================================
   QUEM ESTÁ AQUI, E QUEM SABE O QUÊ (v9.9)

   Dois furos de coerência que quebram a imersão de formas
   parecidas — o Mestre tratando o mundo como se fosse um só
   lugar e uma só cabeça:

   1) TELETRANSPORTE. O jogador deixa um aliado em Ponte do Sul,
      viaja três dias, toca "turno do mundo" — e o sujeito aparece
      desenrolando um pergaminho com uma demanda local. Ele não
      tinha como estar ali.

   2) ONISCIÊNCIA. O jogador confidencia algo a UMA pessoa, e na
      cena seguinte outra pessoa comenta o assunto. Ninguém contou
      nada a ela. Isso é pior que um furo: ensina o jogador a não
      confiar em conversa nenhuma.

   Os dois se resolvem do mesmo jeito: o sistema sabe onde cada um
   está e o que cada um ouviu, e entrega isso pronto ao Mestre —
   junto com a proibição explícita. E lê a narrativa depois, para
   corrigir quando ele escorregar.
   ============================================================ */

const semAcento = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "");
const norm = (s) => semAcento(s).toLowerCase().trim();

/* ONDE ESTE NOME APARECE DE FATO (v9.12) — e não como pedaço de outro.
   O gerador repete nomes: o registro tem "Doran", e o gerador de chefes criou
   "Doran Queima-Campos". Com um indexOf cru, toda aparição do chefe era lida
   como o aliado teletransportando de Ponte do Sul. Isso já era um furo; virou
   um furo CARO quando estes detectores passaram a rodar no PORTÃO, porque
   agora um falso positivo paga uma chamada de conserto e reescreve uma cena
   que estava certa. Preserva caso e comprimento para poder perguntar se a
   palavra seguinte é nome próprio. */
export function ocorrenciaDoNome(narrativa, nome) {
  const cru = semAcento(narrativa);
  const texto = cru.toLowerCase();
  const alvo = norm(nome);
  if (alvo.length < 4) return -1;
  const letra = /[a-z0-9]/;
  let i = texto.indexOf(alvo);
  while (i >= 0) {
    const antes = i > 0 ? texto[i - 1] : " ";
    const fim = i + alvo.length;
    const depois = fim < texto.length ? texto[fim] : " ";
    if (!letra.test(antes) && !letra.test(depois)) {
      const seguePropio = /^[ -][A-Z][a-zà-ÿA-Z-]{2,}/.test(cru.slice(fim, fim + 40));
      const vemDePropio = /[A-Z][a-zà-ÿ]{2,}[ -]$/.test(cru.slice(Math.max(0, i - 30), i));
      if (!seguePropio && !vemDePropio) return i;
    }
    i = texto.indexOf(alvo, i + 1);
  }
  return -1;
}

/* ---------------- MENÇÃO NÃO É PRESENÇA (v9.13) ----------------
   O erro que este bloco existe para não cometer: o bardo canta uma
   balada sobre a Loba Ferida, que está num templo a três dias daqui —
   e o sistema "corrige" o Mestre, porque leu o nome dela perto de um
   verbo de fala. Só que ninguém disse que ela ESTAVA ali. Ela foi
   citada. Citar alguém é a coisa mais comum que se faz numa taverna.

   Duas travas, nesta ordem:

   1) A FRASE, NÃO A JANELA. Antes isto lia 90 caracteres para trás e
      160 para frente, atravessando pontos finais: um "diz" da frase
      anterior colava no nome da frase seguinte. Agora o contexto para
      no ponto, no ponto e vírgula, na quebra de linha e no travessão
      de diálogo. Verbo de outra frase não é verbo deste nome.

   2) SUJEITO OU COMPLEMENTO. "Merlim entra" é presença. "uma canção
      sobre Merlim" não é: ali ele vem depois de preposição, é
      complemento do que outra pessoa está fazendo. A exceção são as
      locuções que colocam alguém ao alcance da mão ("ao lado de
      Merlim") — essas também vêm depois de preposição e são presença
      pura.

   Regra de desempate, a mesma do resto do portão: na dúvida, NÃO
   morde. Deixar passar custa o comportamento antigo; morder errado
   custa uma chamada e reescreve uma cena que estava boa. */

const CORTE = /[.!?;:\n—–]/;

/* O nome vem depois de uma locução que o coloca ao alcance do herói.
   Isto é presença, mesmo com preposição no meio. */
const LOCUCAO_DE_PRESENCA = /(ao lado de|ao lado da|junto de|junto a|junto ao|perto de|proximo de|proxima de|atras de|diante de|na frente de|em frente a|a frente de|ao pe de|na companhia de|acompanhad[oa] (de|por)|de pe (ao lado|atras|diante) de|com|entre|para|ate)\s+$/;

/* O nome vem depois de preposição: ele é COMPLEMENTO da frase, não
   sujeito dela. Quem age é outro. */
const NOME_COMPLEMENTO = /\b(sobre|acerca de|a respeito de|em nome de|em homenagem a|em memoria de|por causa de|no lugar de|em vez de|contra|sem|de|do|da|dos|das|ao|aos|as|a)\s+$/;

/* Verbos que colocam alguém AGINDO na cena. Serve tanto para dizer que
   um nome é sujeito quanto para o portão inteiro — mora aqui para que
   os quatro detectores usem exatamente a mesma régua. */
export const AGINDO_NA_CENA = /(entra|chega|aparece|surge|se aproxima|caminha ate|senta|estende|entrega|puxa|desenrola|diz|dizia|fala|falava|responde|sussurra|grita|murmura|range|ri |ri\.|sorri|cumprimenta|acena|te encontra|esta ali|esta aqui|esta parad|ao seu lado|na sua frente|se levanta|se ergue|olha para voce|encara|saca|ataca|golpeia|avanca|recua|bate|toca|abre|fecha|serve|derrama|ergue|aponta|estala|inclina)/;

/* Recorta a frase em que o nome aparece. Índices são os do texto
   normalizado sem acento e em minúscula — os mesmos que
   ocorrenciaDoNome devolve. */
export function contextoDoNome(narrativa, pos, nome) {
  const base = semAcento(narrativa).toLowerCase();
  const len = norm(nome).length;
  if (pos < 0) return { frase: "", antes: "", depois: "", mencao: false };
  let ini = 0;
  for (let i = pos - 1; i >= 0; i--) if (CORTE.test(base[i])) { ini = i + 1; break; }
  let fim = base.length;
  for (let i = pos + len; i < base.length; i++) if (CORTE.test(base[i])) { fim = i; break; }
  const antes = base.slice(ini, pos);
  const depois = base.slice(pos + len, fim);
  const frase = base.slice(ini, fim);
  /* menção: preposição colada no nome, sem locução de presença. A única
     saída é ele retomar a frase como sujeito de uma relativa — "de
     Merlim, QUE entra na sala". Sem o "que", o verbo seguinte é do
     outro substantivo: em "a espada de Merlim está ali", quem está ali
     é a espada. */
  let mencao = false;
  if (!LOCUCAO_DE_PRESENCA.test(antes) && NOME_COMPLEMENTO.test(antes)) {
    const relativa = new RegExp(`^\\s*,?\\s*(que|quem|o qual|a qual)\\s+(${AGINDO_NA_CENA.source})`);
    mencao = !relativa.test(depois);
  }
  return { frase, antes, depois, mencao };
}

/* ---------------- ONDE CADA UM ESTÁ ---------------- */

/* Distância em dias entre duas cidades, pela malha de rotas do mapa.
   Sem rota conhecida, estima pela distância no mapa. */
export function diasEntre(mapa, de, para) {
  if (!de || !para || norm(de) === norm(para)) return 0;
  const rotas = (mapa && mapa.rotas) || [];
  const direta = rotas.find((r) =>
    (norm(r.de) === norm(de) && norm(r.para) === norm(para)) ||
    (norm(r.de) === norm(para) && norm(r.para) === norm(de)));
  if (direta && direta.dias) return Math.max(1, Math.round(direta.dias));
  const cs = (mapa && mapa.cidades) || [];
  const a = cs.find((c) => norm(c.nome) === norm(de));
  const b = cs.find((c) => norm(c.nome) === norm(para));
  if (a && b) {
    const d = Math.hypot((a.x || 0) - (b.x || 0), (a.y || 0) - (b.y || 0));
    /* continentes diferentes custam travessia */
    const mar = a.continente && b.continente && a.continente !== b.continente ? 6 : 0;
    return Math.max(1, Math.round(d / 6) + mar);
  }
  return 3;   // desconhecido: longe o bastante para exigir explicação
}

/* Onde o registro diz que a pessoa está. `local` é texto livre do Mestre;
   se bater com uma cidade do mapa, vira posição de verdade.

   QUANDO NÃO BATE (v9.99): antes isto devolvia o texto cru — "atrás do
   balcão da Taverna", "na forja" — como se fosse a cidade. Esse texto
   nunca é igual a `cidadeAtual`, então todo NPC registrado com um local
   descritivo (em vez do nome exato da cidade) caía para sempre no balde
   LONGE em elencoDaCena, mesmo sentado à mesa na cena atual. O cão de
   guarda de teletransporte então mordia toda aparição dele — "se
   aproxima", "senta" — e o portão entrava num looping: reescreve para
   tirar o NPC, o Mestre bota de volta porque é o ponto da cena, o cão
   de guarda morde de novo. Mesma regra do resto do arquivo: na dúvida,
   NÃO morde — devolve "", que vira "paradeiro não registrado" (presente),
   não "longe". */
export function cidadeDe(npc, mapa) {
  const bruto = (npc && (npc.cidade || npc.local)) || "";
  if (!bruto) return "";
  const cs = (mapa && mapa.cidades) || [];
  const achou = cs.find((c) => norm(bruto).includes(norm(c.nome)));
  return achou ? achou.nome : "";
}

/* Quem plausivelmente está na cena, e quem está longe (com a conta feita). */
export function elencoDaCena(npcs, cidadeAtual, mapa, { comGrupo = [] } = {}) {
  const lista = Object.values(npcs || {}).filter((n) => n && n.nome);
  const noGrupo = new Set((comGrupo || []).map((g) => norm(g.nome)));
  const aqui = [], longe = [];
  for (const n of lista) {
    if ((n.status || "").toLowerCase().includes("morto")) continue;
    /* quem viaja com você está sempre onde você está */
    if (noGrupo.has(norm(n.nome))) { aqui.push({ ...n, motivo: "viaja com você" }); continue; }
    const onde = cidadeDe(n, mapa);
    if (!onde) { aqui.push({ ...n, motivo: "paradeiro não registrado" }); continue; }
    if (norm(onde) === norm(cidadeAtual)) { aqui.push({ ...n, motivo: `vive em ${onde}` }); continue; }
    longe.push({ ...n, onde, dias: diasEntre(mapa, onde, cidadeAtual) });
  }
  return { aqui, longe };
}

/* A ficção já explicou como aquele nome chegou até aqui sem o corpo junto. */
const EXPLICADO_DE_LONGE = /(carta|missiva|pergaminho selado|mensageiro|pombo|recado|bilhete|lembr|sonh|pensa|visao|falou uma vez|dias atras|de longe|cant|canc|balada|verso|poema|hino|historia de|lenda de|rumor|boato|dizem que|contam que|ouviu falar|se diz)/;

/* O cão de guarda: o Mestre pôs em cena alguém que está a dias daqui? */
export function detectarForaDeLugar(narrativa, npcs, cidadeAtual, mapa, { comGrupo = [] } = {}) {
  const texto = norm(narrativa);
  if (!texto) return [];
  const { longe } = elencoDaCena(npcs, cidadeAtual, mapa, { comGrupo });
  const achados = [];
  for (const n of longe) {
    const pos = ocorrenciaDoNome(narrativa, n.nome);
    if (pos < 0) continue;
    const { frase, mencao } = contextoDoNome(narrativa, pos, n.nome);
    if (mencao) continue;                      // "uma canção sobre ela" não a traz para a taverna
    if (!AGINDO_NA_CENA.test(frase)) continue; // sem verbo de ação na MESMA frase, é só o nome no ar
    if (EXPLICADO_DE_LONGE.test(frase)) continue;
    achados.push(n);
  }
  return achados;
}

export function notaForaDeLugar(achados, cidadeAtual) {
  if (!achados.length) return "";
  const l = achados.map((n) => `${n.nome} (que está em ${n.onde}, a ${n.dias} dia${n.dias > 1 ? "s" : ""} daqui)`).join("; ");
  return `[CORREÇÃO DO SISTEMA — QUEM ESTÁ ONDE] Você colocou em cena ${l}, mas essa pessoa NÃO está em ${cidadeAtual} e não teve tempo de chegar. Refaça mentalmente: ou não é ela (é outra pessoa da cidade), ou o que chegou foi um recado/carta — nunca o corpo dela. A partir de agora, só ponha em cena quem o sistema listou como PRESENTE, ou alguém que tenha viajado com motivo e tempo para isso.`;
}

/* ---------------- QUEM SABE O QUÊ ----------------
   Toda confidência do jogador vira registro: assunto + quem ouviu. */
export function garantirConfidencias(c) {
  return Array.isArray(c) ? c.filter((x) => x && x.assunto) : [];
}

export function registrarConfidencia(confidencias, { assunto, ouvintes = [], dia = 0, exclusivo = true }) {
  const a = String(assunto || "").trim();
  if (!a) return garantirConfidencias(confidencias);
  const lista = garantirConfidencias(confidencias);
  const ja = lista.find((x) => norm(x.assunto) === norm(a));
  if (ja) {
    const novos = new Set([...(ja.ouvintes || []), ...ouvintes]);
    return lista.map((x) => (x === ja ? { ...x, ouvintes: [...novos] } : x));
  }
  return [...lista, { assunto: a, ouvintes: [...new Set(ouvintes)], dia, exclusivo }].slice(-24);
}

export function sabeDoAssunto(confidencia, nome) {
  return (confidencia.ouvintes || []).some((o) => norm(o) === norm(nome));
}

/* O outro cão de guarda: alguém falou de um assunto que só outra pessoa ouviu. */
export function detectarVazamento(narrativa, confidencias, npcsPresentes = []) {
  const texto = norm(narrativa);
  if (!texto) return [];
  const out = [];
  for (const c of garantirConfidencias(confidencias)) {
    if (!c.exclusivo) continue;
    const chave = norm(c.assunto);
    if (chave.length < 6 || !texto.includes(chave)) continue;
    /* quem está falando disso? procura um nome de presente perto da menção */
    const pos = texto.indexOf(chave);
    /* a janela sai do texto COM caso preservado — é o que deixa ocorrenciaDoNome
       distinguir "Doran" de "Doran Queima-Campos" também aqui */
    const janela = semAcento(narrativa).slice(Math.max(0, pos - 160), pos + 60);
    const falante = npcsPresentes.find((n) => ocorrenciaDoNome(janela, n.nome) >= 0);
    if (!falante) continue;
    if (sabeDoAssunto(c, falante.nome)) continue;
    out.push({ assunto: c.assunto, quem: falante.nome, sabiam: c.ouvintes });
  }
  return out;
}

export function notaVazamento(vazamentos) {
  if (!vazamentos.length) return "";
  const l = vazamentos.map((v) => `${v.quem} falou de "${v.assunto}", que eu contei só para ${v.sabiam.join(", ") || "uma pessoa"}`).join("; ");
  return `[CORREÇÃO DO SISTEMA — QUEM SABE O QUÊ] ${l}. Não há como essa pessoa saber disso: ninguém contou. Trate como se ela NÃO soubesse. Informação viaja por boca, carta ou espião — e quando viajar, tem que ser mostrado em cena, com quem contou e por quê. Nunca faça um personagem simplesmente saber o que o jogador disse a outro.`;
}

/* ---------------- O QUE O MESTRE RECEBE ---------------- */
export function resumoCenaPrompt(npcs, cidadeAtual, mapa, { comGrupo = [], confidencias = [] } = {}) {
  const { aqui, longe } = elencoDaCena(npcs, cidadeAtual, mapa, { comGrupo });
  if (!aqui.length && !longe.length) return "";
  const linhaAqui = aqui.length ? aqui.map((n) => `${n.nome} (${n.motivo})`).join(" · ") : "ninguém do registro";
  const linhaLonge = longe.length ? longe.map((n) => `${n.nome} está em ${n.onde}, a ${n.dias} dia${n.dias > 1 ? "s" : ""} daqui`).join(" · ") : "";
  const segredos = garantirConfidencias(confidencias).filter((c) => c.exclusivo && (c.ouvintes || []).length);
  const linhaSegredo = segredos.length
    ? segredos.map((c) => `"${c.assunto}" — sabem disso: ${c.ouvintes.join(", ")}`).join(" · ")
    : "";
  return `QUEM ESTÁ EM CENA (do sistema — obedeça):
- PRESENTES em ${cidadeAtual || "onde estou"}: ${linhaAqui}.
${linhaLonge ? `- LONGE (NÃO podem aparecer nesta cena; no máximo mandam carta ou recado, e mesmo assim só se fizer sentido): ${linhaLonge}.\n` : ""}${linhaSegredo ? `- O QUE FOI DITO EM PARTICULAR (só estas pessoas sabem — ninguém mais pode mencionar, nem de leve): ${linhaSegredo}.\n` : ""}`;
}

export const CENA_PROMPT = `PRESENÇA E CONHECIMENTO (v9.9 — duas regras duras):
- QUEM ESTÁ LONGE ESTÁ LONGE. O envelope traz a lista de quem está PRESENTE e de quem está a dias de viagem. Não coloque em cena alguém da lista "LONGE" — nem para entregar um pergaminho, nem para dar uma missão, nem "por acaso". Se essa pessoa precisa se comunicar, use carta, mensageiro ou boato, e diga quantos dias a notícia levou. Se ela precisa mesmo aparecer, isso é uma VIAGEM dela: mostre o motivo e o custo, e só na cena seguinte.
- NINGUÉM SABE O QUE NÃO OUVIU. O que o jogador contou a uma pessoa não é conhecimento público. O envelope lista o que foi dito em particular e para quem. Nenhum outro personagem pode mencionar, insinuar ou reagir a isso. Se a informação precisa circular, mostre COMO circulou (alguém contou, alguém escutou atrás da porta, uma carta foi interceptada) — em cena, não de graça.
- Isto vale inclusive para aliados leais e para quem "adivinharia": deduzir é permitido, saber não.`;
