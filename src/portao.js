/* ============================================================
   O PORTÃO (v9.12) — o cão de guarda passa a morder ANTES

   Até aqui os cães de guarda funcionavam assim: o Mestre narrava,
   o jogador LIA, e só então o sistema acusava o erro e mandava a
   correção — que chegava ao Mestre no turno SEGUINTE. O jogador
   via a besteira, e às vezes via a correção de uma cena que já
   tinha passado.

   Aqui a ordem inverte. A narrativa passa primeiro por um portão:

     Mestre → PORTÃO → (conserto, se preciso) → jogador

   O que isso custa: quase nada. Os detectores são função pura
   lendo texto — regex e comparação com o estado. Rodar antes ou
   depois custa o mesmo: zero. Só o CONSERTO gasta uma chamada, só
   quando alguma coisa de fato quebrou, e vai no modelo BARATO
   (tarefa "leve") com uma carga minúscula: o trecho e a regra
   violada. Nada de system prompt, histórico ou cânone.

   Três decisões que valem estar escritas:

   1) SÓ VIOLAÇÃO DURA PASSA POR AQUI. Existem dois tipos de cão de
      guarda, e eles são opostos. Os que CONTRADIZEM o Mestre
      (matou quem está vivo, teleportou o aliado, vazou segredo,
      ascendeu sem rito, ressuscitou um morto) barram antes. Os que
      RATIFICAM o Mestre — ele narrou "você sangra" e o sistema
      aplica Sangrando — continuam depois, onde sempre estiveram:
      ali a narrativa está CERTA e o sistema é que estava atrás.
      Barrar isso transformaria acerto em erro.

   2) O PORTÃO PODE DESISTIR. Reescrever pode quebrar outra coisa.
      Por isso o texto consertado é RECHECADO uma vez; se ainda
      violar, o portão joga a toalha e entrega o original com o
      aviso visível — exatamente o comportamento antigo. O turno do
      jogador nunca fica preso esperando o Mestre acertar.

   3) O QUE O PORTÃO CONSERTA, O MESTRE NUNCA DISSE. O histórico
      guarda o texto corrigido, não o errado. Então na volta não vai
      acusação ("você narrou X") — que contradiria o próprio
      histórico — e sim um lembrete seco da regra.
   ============================================================ */

import { detectarForaDeLugar, notaForaDeLugar, detectarVazamento, notaVazamento, ocorrenciaDoNome } from "./cena.js";
export { ocorrenciaDoNome } from "./cena.js";
import { detectarAscensaoNarrada } from "./ascensao.js";
import { tituloDe } from "./divindades.js";

const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const frasesDe = (t) => String(t || "").split(/(?<=[.!?;])\s+|\n+/).filter(Boolean);
/* ocorrenciaDoNome mora em cena.js (é lá que o primeiro detector precisava
   dela) e vem reexportada acima: na dúvida sobre um nome, o portão prefere
   NÃO morder — deixar passar custa o comportamento antigo, morder errado
   custa dinheiro e uma cena que estava boa. */

/* Verbos que colocam alguém AGINDO na cena. Menção não é presença:
   "o barão falou disso uma vez" não põe o barão na sala. */
const AGINDO = /(entra|chega|aparece|surge|se aproxima|caminha ate|senta|estende|entrega|puxa|desenrola|diz|fala|responde|sussurra|grita|ri |sorri|cumprimenta|acena|te encontra|esta ali|esta aqui|ao seu lado|na sua frente|se levanta|olha para voce|encara|saca|ataca|golpeia|avanca)/;

/* ---------------- 1. MATOU QUEM ESTÁ VIVO ----------------
   O Mestre mata na PROSA e não registra: a criatura de 320 PV
   "tomba" com 200 ainda na barra, e o painel de combate segue
   mostrando um morto de pé. */
const MORTE = /(morre|morreu|mort[ao]\b|tomba|tombou|cai sem vida|sem vida|expira|ultimo suspiro|desaba (morto|sem vida)|e abatid|foi abatid|derrubad[oa] de vez|nao se levanta mais|corpo (dele|dela) )/;
const MORTE_NEGADA = /\b(nao|quase|ainda|se |como se|parece|fingi)\b/;

export function detectarMorteIndevida(narrativa, inimigos) {
  const vivos = (inimigos || []).filter((e) => e && e.nome && !e.derrotado && (e.vida || 0) > 0);
  if (!vivos.length) return [];
  const frases = frasesDe(narrativa).map(norm);
  const out = [];
  for (const e of vivos) {
    const alvo = norm(e.nome);
    if (alvo.length < 3) continue;
    const matou = frases.some((f) => f.includes(alvo) && MORTE.test(f) && !MORTE_NEGADA.test(f));
    if (matou) out.push(e);
  }
  return out;
}

/* ---------------- 2. O MORTO QUE AGE ----------------
   A contradição de cânone mais grosseira e a mais fácil de provar:
   o registro de pessoas diz "morto", o códex riscou o nome, a
   nêmesis foi enterrada pelo sistema — e lá está a pessoa falando.

   Morte é o único estado que este jogo trata como irreversível, e é
   por isso que dá para checar por código sem falso positivo: selo
   quebrado, ruína reconstruída e item perdido reaparecem por evento
   legítimo; defunto não volta a conversar. */
const CONTEXTO_DE_MORTO = /(lembr|memoria|recorda|sonh|visao|fantasma|espectro|espirito|aparic|assombr|corpo|cadaver|restos|tumulo|tumba|cova|sepult|funeral|luto|retrato|estatua|busto|em vida|antes de morrer|quando ainda|se estivesse vivo|ressuscit|necroman|morto-vivo|mortos-vivos|alma de|nome de|em homenagem|vinganca por|matou|morreu|morte de)/;

export function mortosConhecidos({ npcs, mortosBase = [], nemesis } = {}) {
  const set = new Map();
  for (const n of Object.values(npcs || {})) {
    if (!n || !n.nome) continue;
    if (norm(n.status).includes("morto")) set.set(norm(n.nome), n.nome);
  }
  for (const m of mortosBase || []) if (m) set.set(norm(m), String(m));
  if (nemesis && nemesis.nome && norm(nemesis.status) === "derrotada") set.set(norm(nemesis.nome), nemesis.nome);
  return [...set.values()];
}

export function detectarMortoQueAge(narrativa, ctx = {}) {
  const texto = norm(narrativa);
  if (!texto) return [];
  const out = [];
  for (const nome of mortosConhecidos(ctx)) {
    const pos = ocorrenciaDoNome(narrativa, nome);
    if (pos < 0) continue;
    const janela = texto.slice(Math.max(0, pos - 110), pos + norm(nome).length + 170);
    if (!AGINDO.test(janela)) continue;
    if (CONTEXTO_DE_MORTO.test(janela)) continue;   // lembrança, corpo, tumba, fantasma: tudo legítimo
    out.push(nome);
  }
  return out;
}

/* ---------------- 3. O CONHECIDO TRATADO COMO ESTRANHO ----------------
   O outro lado da quebra de memória: a pessoa está no registro, o
   jogador conviveu com ela — e o Mestre a apresenta de novo, do
   zero, como se fosse a primeira vez. Conhecer alguém também não
   desacontece. */
const APRESENTACAO = /(chamad[oa]|de nome|se apresenta como|diz se chamar|se identifica como|que atende por)\s+$/;
const PRIMEIRA_VEZ = /(pela primeira vez|nunca (o |a )?(tinha |havia )?vist|nunca (o |a )?(tinha |havia )?encontrad|voce nao (o |a )?conhec|nao faz ideia de quem|um desconhecid|uma desconhecid|um estranh|uma estranh|jamais (o |a )?vira)/;

export function detectarConhecidoComoEstranho(narrativa, npcs) {
  const texto = norm(narrativa);
  if (!texto) return [];
  const out = [];
  for (const n of Object.values(npcs || {})) {
    if (!n || !n.nome) continue;
    if (norm(n.status).includes("morto")) continue;   // esse caso é o de cima
    const pos = ocorrenciaDoNome(narrativa, n.nome);
    if (pos < 0) continue;
    const antes = texto.slice(Math.max(0, pos - 45), pos);
    const janela = texto.slice(Math.max(0, pos - 130), pos + norm(n.nome).length + 130);
    if (!APRESENTACAO.test(antes) && !PRIMEIRA_VEZ.test(janela)) continue;
    out.push(n);
  }
  return out;
}

/* ---------------- O PORTÃO ----------------
   Uma única passada. Devolve violações DURAS, cada uma com três
   textos: o que o jogador lê se o conserto falhar (`aviso`), o
   envelope que volta ao Mestre nesse caso (`nota`), e a instrução
   curta que vai ao revisor (`regra`). */
export function violacoesDoTurno(narrativa, ctx = {}) {
  const texto = String(narrativa || "");
  if (texto.trim().length < 20) return [];
  const v = [];

  /* morte indevida */
  for (const e of detectarMorteIndevida(texto, ctx.inimigos)) {
    const pct = Math.round(((e.vida || 0) / (e.vidaMax || 1)) * 100);
    v.push({
      id: "morte", rotulo: `${e.nome} foi dado como morto e está de pé`,
      aviso: `⚖ Coesão do sistema: ${e.nome} NÃO morreu — ainda tem ${e.vida}/${e.vidaMax} PV. A luta continua.`,
      nota: `[CORREÇÃO DE COESÃO — MORTE INDEVIDA NA NARRAÇÃO] Você narrou a queda de ${e.nome}, mas o SISTEMA registra ${e.vida} de ${e.vidaMax} PV: ${e.nome} está DE PÉ e continua agindo. RETOME a cena tratando-o como vivo — sem ressurreição, sem "ele se ergue de novo", sem cinzas: ele simplesmente não caiu. E calibre a intensidade pelo dano REAL do envelope: ${e.vida} de ${e.vidaMax} PV significa que ele ainda tem ${pct}% da vida — não descreva golpes pequenos como devastadores.`,
      regra: `${e.nome} NÃO morreu e NÃO caiu: o sistema registra ${e.vida} de ${e.vidaMax} PV (${pct}% da vida). Reescreva o golpe como um dano que ele ENCAIXOU e do qual continua de pé, agindo. Não use ressurreição, não faça "ele se ergue de novo", não deixe cinzas nem corpo. E não descreva o golpe como devastador: ele levou ${pct === 100 ? "um arranhão" : "dano parcial"}.`,
      lembrete: "Nunca declare a morte de um combatente por conta própria — quem tem PV é o sistema. Narre o golpe; a queda só existe quando o envelope disser que existe.",
    });
  }

  /* teleporte: quem está a dias daqui não entra na taverna */
  const fora = detectarForaDeLugar(texto, ctx.npcs, ctx.cidadeAtual, ctx.mapa, { comGrupo: ctx.comGrupo || [] });
  if (fora.length) {
    v.push({
      id: "lugar", rotulo: `${fora.map((n) => n.nome).join(", ")} apareceu vindo de outra cidade`,
      aviso: `📍 ${fora.map((n) => `${n.nome} está em ${n.onde}, a ${n.dias} dia(s) daqui`).join("; ")} — o sistema avisou o Mestre que essa pessoa não podia estar na cena.`,
      nota: notaForaDeLugar(fora, ctx.cidadeAtual),
      regra: `${fora.map((n) => `${n.nome} está em ${n.onde}, a ${n.dias} dia(s) de viagem`).join("; ")} — essa pessoa NÃO pode estar nesta cena, e não teve tempo de chegar. Reescreva sem ela: ou é outra pessoa do lugar (dê outro nome, ou use um papel genérico como "o estalajadeiro"), ou o que chegou foi uma carta/recado, nunca o corpo dela.`,
      lembrete: "Só ponha em cena quem o envelope listou como PRESENTE. Quem está longe manda carta ou recado — nunca aparece.",
    });
  }

  /* onisciência: ninguém sabe o que não ouviu */
  const vaz = detectarVazamento(texto, ctx.confidencias, ctx.presentes || []);
  if (vaz.length) {
    v.push({
      id: "segredo", rotulo: `${vaz.map((x) => x.quem).join(", ")} sabia de algo que ninguém contou`,
      aviso: `🤐 ${vaz.map((x) => `${x.quem} falou de algo que só ${x.sabiam.join(", ")} sabia`).join("; ")} — o sistema corrigiu.`,
      nota: notaVazamento(vaz),
      regra: `${vaz.map((x) => `${x.quem} mencionou "${x.assunto}", que o jogador contou SÓ para ${x.sabiam.join(", ") || "outra pessoa"}`).join("; ")}. Não há como essa pessoa saber disso. Reescreva a fala dela sem nenhuma referência ao assunto — nem direta, nem insinuada.`,
      lembrete: "O que o jogador contou a uma pessoa não é conhecimento público. Deduzir é permitido; saber, não.",
    });
  }

  /* ascensão que o sistema não deu */
  const asc = detectarAscensaoNarrada(texto, ctx.divindade, ctx.nivel || 1);
  if (asc) {
    v.push({
      id: "ascensao", rotulo: "ascensão narrada sem o rito",
      aviso: `⚱ O Mestre narrou uma ascensão que o sistema não deu — você continua ${tituloDe(asc.gd)} (GD ${asc.gd}). ${asc.emRito ? "O rito ainda está em curso." : "Ascender exige o rito."}`,
      nota: asc.nota,
      regra: `O herói NÃO ascendeu: ele continua ${tituloDe(asc.gd)} (GD ${asc.gd}). ${asc.emRito ? "O rito de ascensão está em curso e ainda não terminou." : "Nenhum rito foi concluído."} Reescreva sem promover ninguém: o poder que ele tocou pode tê-lo marcado, queimado, chamado — mas não o transformou. Não use "você é agora um deus", "seu grau se eleva" nem equivalente.`,
      lembrete: "Só o sistema promove. Nunca narre o herói mudando de grau divino — narre o que ele SENTE, nunca o que ele VIROU.",
    });
  }

  /* cânone: o morto que age */
  const mortos = detectarMortoQueAge(texto, ctx);
  if (mortos.length) {
    v.push({
      id: "morto_age", rotulo: `${mortos.join(", ")} está morto no registro e agiu na cena`,
      aviso: `☠ ${mortos.join(", ")} está morto(a) no registro de pessoas — o sistema barrou a volta.`,
      nota: `[CORREÇÃO DO SISTEMA — CÂNONE: QUEM MORREU, MORREU] Você pôs ${mortos.join(", ")} agindo em cena. O registro da campanha marca essa pessoa como MORTA, e o nome está riscado no códex. Morte é fato consumado: não há retorno sem um evento de ressurreição criado pelo SISTEMA. Trate ${mortos.length > 1 ? "essas pessoas" : "essa pessoa"} como morta daqui em diante — pode aparecer em lembrança, em sonho, num retrato ou como corpo, nunca falando ou agindo no presente.`,
      regra: `${mortos.join(", ")} está MORTO(A) no cânone da campanha e não pode agir, falar nem aparecer viva. Reescreva a cena sem ela: ou é outra pessoa, ou é uma lembrança/menção explícita ao passado. Não ressuscite, não use gêmeo, sósia, fantasma nem "afinal ela sobreviveu".`,
      lembrete: "Quem o registro marca como morto está morto. Nunca traga de volta ninguém — só o sistema pode fazer isso.",
    });
  }

  /* cânone: o conhecido apresentado como estranho */
  const estranhos = detectarConhecidoComoEstranho(texto, ctx.npcs);
  if (estranhos.length) {
    const desc = estranhos.map((n) => `${n.nome}${n.relacao && n.relacao !== "desconhecido" ? ` (${n.relacao})` : ""}${n.conhecidoEm ? `, conhecido(a) no dia ${n.conhecidoEm}` : ""}`);
    v.push({
      id: "memoria", rotulo: `${estranhos.map((n) => n.nome).join(", ")} foi apresentado como se fosse novo`,
      aviso: `📖 ${estranhos.map((n) => n.nome).join(", ")} já faz parte da história — o sistema impediu a reapresentação.`,
      nota: `[CORREÇÃO DO SISTEMA — CÂNONE: MEMÓRIA] Você apresentou ${desc.join("; ")} como se fosse a primeira vez. Essa pessoa JÁ está no registro da campanha e o herói a conhece. Nunca reapresente alguém do registro: retome de onde a relação parou, com o histórico que vocês têm.`,
      regra: `${desc.join("; ")} — o herói JÁ conhece essa pessoa há tempo. Reescreva o encontro como um REENCONTRO: nada de "um homem chamado", "se apresenta como", "um desconhecido" ou "pela primeira vez". Ela chama o herói pelo nome e os dois retomam o que já tinham.`,
      lembrete: "Ninguém do registro de pessoas é novo. Nunca reapresente um conhecido — retome a relação de onde ela parou.",
    });
  }

  return v;
}

/* ---------------- O PEDIDO DE CONSERTO ----------------
   Vai para o modelo BARATO. Carga mínima de propósito: o trecho e a
   regra. Sem system prompt do Mestre, sem histórico, sem cânone —
   é isso que faz o conserto custar uma fração de um turno. */
export const REVISOR_SISTEMA = `Você é o REVISOR DE CONTINUIDADE de uma campanha de RPG em português brasileiro.
Recebe um trecho narrado pelo Mestre e a lista de fatos do sistema que esse trecho contradiz. Sua única tarefa é devolver o MESMO trecho, corrigido.

REGRAS:
1. Corrija SOMENTE o que foi apontado. Todo o resto — acontecimentos, personagens, tom, ritmo, tamanho — fica igual.
2. Não invente fatos novos, não acrescente personagens, não resolva a cena, não adicione diálogo que não existia.
3. Nunca comente a correção, não peça desculpas, não mencione sistema, regras, revisão ou erro. O jogador lê isto como narrativa pura.
4. Mantenha a mesma pessoa e o mesmo tempo verbal do original.
5. Responda SOMENTE com o texto corrigido. Sem aspas, sem título, sem preâmbulo, sem comentário final.`;

export function pedidoDeConserto(narrativa, violacoes) {
  const regras = (violacoes || []).map((v, i) => `${i + 1}. ${v.regra}`).join("\n");
  return {
    system: REVISOR_SISTEMA,
    messages: [{ role: "user", content: `FATOS DO SISTEMA QUE O TRECHO CONTRADIZ:
${regras}

TRECHO DO MESTRE:
"""
${narrativa}
"""

Devolva o trecho corrigido.` }],
    maxTokens: Math.min(1400, Math.max(400, Math.ceil(String(narrativa || "").length / 2))),
  };
}

/* Higiene do que voltou. O revisor é um modelo barato: pode devolver
   aspas, um "Claro:" na frente, ou desandar e reescrever a cena
   inteira. Qualquer sinal disso e o conserto é recusado — recusar
   custa nada, porque o original ainda está na mão. */
const META = /(como (assistente|ia|modelo)|desculp|nao posso|corrigi o trecho|texto corrigido|revis(ao|ado)|\[sistema\]|conforme solicitado)/i;

export function aceitarConserto(bruto, original) {
  let t = String(bruto || "").trim();
  if (!t) return null;
  t = t.replace(/^(aqui esta|segue|claro)[^\n:]{0,40}:\s*/i, "").trim();
  t = t.replace(/^"""\s*|\s*"""$/g, "").trim();
  if (t.length > 1 && /^["“'].*["”']$/s.test(t)) t = t.slice(1, -1).trim();
  if (!t) return null;
  if (META.test(t.slice(0, 200))) return null;
  const orig = String(original || "").length || 1;
  if (t.length < orig * 0.45) return null;      // encolheu demais: comeu a cena
  if (t.length > orig * 2.4) return null;       // inflou demais: inventou por cima
  return t;
}

/* Aviso curto quando o conserto DEU certo — o jogador merece saber que
   o sistema trabalhou, sem levar o erro na cara. */
export function avisoDeConserto(violacoes) {
  const l = (violacoes || []).map((v) => v.rotulo).filter(Boolean);
  if (!l.length) return "";
  return `⚖ O sistema barrou a narração antes de você ler e mandou refazer — ${l.join("; ")}.`;
}

/* O que volta ao Mestre quando o conserto deu certo. Não pode ser
   acusação: o histórico guarda o texto CORRIGIDO, então "você narrou
   X" contradiria o próprio histórico. Vai o lembrete seco da regra. */
export function lembreteDoPortao(violacoes) {
  const l = [...new Set((violacoes || []).map((v) => v.lembrete).filter(Boolean))];
  if (!l.length) return "";
  return `[GUARDA DE CONTINUIDADE — LEMBRETE DE REGRA] ${l.join(" ")}`;
}
