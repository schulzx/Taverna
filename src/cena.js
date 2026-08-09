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

const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

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
   se bater com uma cidade do mapa, vira posição de verdade. */
export function cidadeDe(npc, mapa) {
  const bruto = (npc && (npc.cidade || npc.local)) || "";
  if (!bruto) return "";
  const cs = (mapa && mapa.cidades) || [];
  const achou = cs.find((c) => norm(bruto).includes(norm(c.nome)));
  return achou ? achou.nome : bruto;
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

/* O cão de guarda: o Mestre pôs em cena alguém que está a dias daqui? */
export function detectarForaDeLugar(narrativa, npcs, cidadeAtual, mapa, { comGrupo = [] } = {}) {
  const texto = norm(narrativa);
  if (!texto) return [];
  const { longe } = elencoDaCena(npcs, cidadeAtual, mapa, { comGrupo });
  const achados = [];
  for (const n of longe) {
    const alvo = norm(n.nome);
    if (alvo.length < 3 || !texto.includes(alvo)) continue;
    /* menção não é presença: só conta se o texto o coloca AGINDO na cena */
    const janela = texto.slice(Math.max(0, texto.indexOf(alvo) - 90), texto.indexOf(alvo) + 160);
    const presente = /(entra|chega|aparece|surge|se aproxima|caminha ate|senta|estende|entrega|puxa|desenrola|diz|fala|sussurra|grita|cumprimenta|te encontra|esta ali|esta aqui|ao seu lado|na sua frente)/.test(janela);
    const explicado = /(carta|mensageiro|pombo|recado|bilhete|lembr|sonh|pensa|lembranca|falou uma vez|dias atras|de longe)/.test(janela);
    if (presente && !explicado) achados.push(n);
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
    const janela = texto.slice(Math.max(0, pos - 160), pos + 60);
    const falante = npcsPresentes.find((n) => norm(n.nome).length >= 3 && janela.includes(norm(n.nome)));
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
