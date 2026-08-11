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

   4) O PORTÃO TRABALHA CALADO (v9.13). Antes ele se anunciava: "o
      sistema barrou a narração antes de você ler". Isso era um tiro
      no próprio pé. O jogador não viu o erro — ele só existiu por
      meio segundo, dentro do cano. Contar que houve um erro é criar,
      na cabeça dele, uma falha que ele não teria notado; e mina a
      confiança justamente quando o sistema ACERTOU. Encanamento que
      funciona não avisa que está funcionando.

      Sobra `aviso` só onde a informação é JOGO, não higiene: o
      inimigo que continua de pé com PV na barra, e o grau divino que
      não mudou. Esses o jogador precisa saber para decidir o próximo
      turno. Os de continuidade pura (lugar, segredo, morto, memória)
      vão com `aviso` vazio: a correção segue para o Mestre e o
      jogador segue lendo história.
   ============================================================ */

import { detectarForaDeLugar, notaForaDeLugar, detectarVazamento, notaVazamento, ocorrenciaDoNome, contextoDoNome, AGINDO_NA_CENA } from "./cena.js";
export { ocorrenciaDoNome } from "./cena.js";
import { mesmoPapel, quemTemOPapel } from "./npcs.js";
import { detectarAscensaoNarrada } from "./ascensao.js";
import { detectarAlcanceImpossivel, notaAlcanceImpossivel, nomeDaZona } from "./zonas.js";
import { tituloDe } from "./divindades.js";

const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const frasesDe = (t) => String(t || "").split(/(?<=[.!?;])\s+|\n+/).filter(Boolean);
/* ocorrenciaDoNome mora em cena.js (é lá que o primeiro detector precisava
   dela) e vem reexportada acima: na dúvida sobre um nome, o portão prefere
   NÃO morder — deixar passar custa o comportamento antigo, morder errado
   custa dinheiro e uma cena que estava boa. */

/* Verbos que colocam alguém AGINDO na cena. Menção não é presença:
   "o barão falou disso uma vez" não põe o barão na sala. A régua mora
   em cena.js, junto de contextoDoNome — os quatro detectores medem
   com a mesma fita. */
const AGINDO = AGINDO_NA_CENA;

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
    const { frase, mencao } = contextoDoNome(narrativa, pos, nome);
    if (mencao) continue;                        // falar de um morto é o que se faz com mortos
    /* assimetria de propósito: para MORDER exijo o verbo na mesma frase;
       para SOLTAR aceito o contexto do parágrafo inteiro. Errar solto é
       de graça, errar mordido custa uma chamada e uma cena reescrita. */
    if (!AGINDO.test(frase)) continue;
    const largo = texto.slice(Math.max(0, pos - 200), pos + norm(nome).length + 220);
    if (CONTEXTO_DE_MORTO.test(largo)) continue; // lembrança, corpo, tumba, fantasma: tudo legítimo
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
    const { frase, antes, mencao } = contextoDoNome(narrativa, pos, n.nome);
    if (mencao) continue;   // citar um conhecido não é reapresentá-lo
    if (!APRESENTACAO.test(antes) && !PRIMEIRA_VEZ.test(frase)) continue;
    out.push(n);
  }
  return out;
}

/* ---------------- 4. A PESSOA QUE TROCOU DE PAPEL ----------------
   O caso que abriu isto: o Mestre apresentou Yorick como um velho
   camponês e o capitão da guarda como um gnomo chamado Halvard.
   Cenas depois, Yorick reapareceu como capitão da guarda — e o
   registro aceitou, porque `mesclarNPC` sobrescrevia o papel como
   sobrescreve qualquer campo.

   É a mesma família do morto que age e do conhecido apresentado como
   estranho: memória que não desacontece. Quem o jogador conheceu
   como camponês é camponês; virar guarda é um ACONTECIMENTO, e
   acontecimento passa pelo sistema.

   A régua tem dois degraus, e o segundo é o que dá confiança:
   1) o papel dito difere do registrado — suspeito;
   2) o papel dito JÁ PERTENCE a outra pessoa do registro — provado.
   Só o segundo morde sozinho; o primeiro exige o aposto colado no
   nome ("Yorick, o capitão da guarda"), que é como o Mestre escreve
   quando está de fato reatribuindo o cargo. */
const APOSTO = /^\s*,\s*(?:o |a |um |uma )?([a-zà-ÿ][a-zà-ÿ\s-]{3,44})/i;
const ANTES_DO_NOME = /(?:^|[.,;:!?]\s*)(?:o |a )([a-zà-ÿ][a-zà-ÿ\s-]{3,44}?)\s+$/i;
/* Boca do povo não é cânone. "Contam que Yorick é o capitão" é uma coisa que
   alguém DISSE, e gente diz coisa errada — inclusive de propósito. Só o
   narrador afirmando morde; o boato passa, e é bom que passe: rumor falso é
   material de aventura, não erro de sistema. */
const RELATO = /(contam que|dizem que|dizia que|se diz|ouvi dizer|ouviu dizer|segundo (o|a|os|as)|ao que parece|corre o boato|espalharam|acham que|acreditam que|juram que|pelo que dizem)/;

export function detectarPapelTrocado(narrativa, npcs) {
  const texto = String(narrativa || "");
  if (!texto.trim()) return [];
  const out = [];
  for (const n of Object.values(npcs || {})) {
    if (!n || !n.nome || !n.papel) continue;
    if (norm(n.status).includes("morto")) continue;
    const pos = ocorrenciaDoNome(texto, n.nome);
    if (pos < 0) continue;
    const { antes, depois, mencao, frase } = contextoDoNome(texto, pos, n.nome);
    if (mencao) continue;
    if (RELATO.test(frase)) continue;
    const mA = APOSTO.exec(depois);
    const mB = ANTES_DO_NOME.exec(antes);
    const dito = (mA && mA[1]) || (mB && mB[1]) || "";
    if (!dito.trim()) continue;
    if (mesmoPapel(n.papel, dito)) continue;
    /* o degrau que prova: esse cargo já tem dono, e ele tem nome */
    const dono = quemTemOPapel(npcs, dito, n.nome);
    out.push({ nome: n.nome, registrado: n.papel, dito: dito.trim(), dono: dono ? dono.nome : null });
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
      aviso: `⚔ ${e.nome} continua de pé — ${e.vida}/${e.vidaMax} PV. A luta não acabou.`,
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
      aviso: "",
      nota: notaForaDeLugar(fora, ctx.cidadeAtual),
      regra: `${fora.map((n) => `${n.nome} está em ${n.onde}, a ${n.dias} dia(s) de viagem`).join("; ")} — essa pessoa NÃO pode estar nesta cena, e não teve tempo de chegar. Reescreva sem ela: ou é outra pessoa do lugar (dê outro nome, ou use um papel genérico como "o estalajadeiro"), ou o que chegou foi uma carta/recado, nunca o corpo dela.`,
      lembrete: "Só ponha em cena quem o envelope listou como PRESENTE. Quem está longe manda carta ou recado — nunca aparece.",
    });
  }

  /* alcance: quem está a duas zonas não encosta em você (v9.20) */
  const longe = detectarAlcanceImpossivel(texto, { campo: ctx.campo, zonaHeroi: ctx.zonaHeroi || 0, inimigos: ctx.inimigos });
  if (longe.length) {
    const onde = nomeDaZona(ctx.campo, ctx.zonaHeroi || 0);
    v.push({
      id: "alcance", rotulo: `${longe.map((a) => a.nome).join(", ")} encostou em você de outro lugar`,
      aviso: "",
      nota: notaAlcanceImpossivel(longe, ctx.campo, ctx.zonaHeroi || 0),
      regra: `${longe.map((a) => `${a.nome} está em ${a.onde}, a ${a.distancia} lugar(es) de distância do herói, que está em ${onde}`).join("; ")}. Essa criatura NÃO alcança o herói: ninguém atravessa o terreno de graça. Reescreva a mesma cena com ela ameaçando, avançando ou atacando de longe — sem encostar, sem agarrar, sem chegar a um palmo. Mantenha o resto igual.`,
      lembrete: "Ninguém alcança quem está em outro lugar do terreno. Quem se move, se move pelo sistema — você narra o movimento que o envelope trouxer, nunca um que você decidiu.",
    });
  }

  /* onisciência: ninguém sabe o que não ouviu */
  const vaz = detectarVazamento(texto, ctx.confidencias, ctx.presentes || []);
  if (vaz.length) {
    v.push({
      id: "segredo", rotulo: `${vaz.map((x) => x.quem).join(", ")} sabia de algo que ninguém contou`,
      aviso: "",
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
      aviso: `⚱ Você continua ${tituloDe(asc.gd)} (GD ${asc.gd}). ${asc.emRito ? "O rito ainda está em curso." : "Ascender exige o rito."}`,
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
      aviso: "",
      nota: `[CORREÇÃO DO SISTEMA — CÂNONE: QUEM MORREU, MORREU] Você pôs ${mortos.join(", ")} agindo em cena. O registro da campanha marca essa pessoa como MORTA, e o nome está riscado no códex. Morte é fato consumado: não há retorno sem um evento de ressurreição criado pelo SISTEMA. Trate ${mortos.length > 1 ? "essas pessoas" : "essa pessoa"} como morta daqui em diante — pode aparecer em lembrança, em sonho, num retrato ou como corpo, nunca falando ou agindo no presente.`,
      regra: `${mortos.join(", ")} está MORTO(A) no cânone da campanha e não pode agir, falar nem aparecer viva. Reescreva a cena sem ela: ou é outra pessoa, ou é uma lembrança/menção explícita ao passado. Não ressuscite, não use gêmeo, sósia, fantasma nem "afinal ela sobreviveu".`,
      lembrete: "Quem o registro marca como morto está morto. Nunca traga de volta ninguém — só o sistema pode fazer isso.",
    });
  }

  /* cânone: a pessoa que trocou de papel (v9.22) */
  const trocados = detectarPapelTrocado(texto, ctx.npcs);
  if (trocados.length) {
    const desc = trocados.map((t) => `${t.nome} está no registro como ${t.registrado}, e você o chamou de "${t.dito}"${t.dono ? ` — cargo que pertence a ${t.dono}` : ""}`);
    v.push({
      id: "papel", rotulo: `${trocados.map((t) => t.nome).join(", ")} trocou de papel`,
      aviso: "",
      nota: `[CORREÇÃO DO SISTEMA — CÂNONE: QUEM É QUEM] ${desc.join("; ")}. O registro da campanha manda: essa pessoa continua sendo o que sempre foi. Ninguém troca de ofício ou de cargo entre uma cena e outra — se isso precisa acontecer na ficção, é um ACONTECIMENTO com causa e tempo, não uma reapresentação. Trate ${trocados.length > 1 ? "essas pessoas" : "essa pessoa"} pelo papel do registro daqui em diante.`,
      regra: `${desc.join("; ")}. Reescreva o trecho tratando ${trocados.map((t) => `${t.nome} como ${t.registrado}`).join(" e ")}${trocados.some((t) => t.dono) ? `, e mantenha ${trocados.filter((t) => t.dono).map((t) => `${t.dono} no cargo que é dele`).join(" e ")}` : ""}. Não promova, não rebaixe e não troque o ofício de ninguém: mantenha o resto da cena igual.`,
      lembrete: "O papel de cada pessoa está no registro e não muda por narração. Um camponês não vira capitão entre duas cenas — quem muda de vida muda por acontecimento, e o acontecimento vem do sistema.",
    });
  }

  /* cânone: o conhecido apresentado como estranho */
  const estranhos = detectarConhecidoComoEstranho(texto, ctx.npcs);
  if (estranhos.length) {
    const desc = estranhos.map((n) => `${n.nome}${n.relacao && n.relacao !== "desconhecido" ? ` (${n.relacao})` : ""}${n.conhecidoEm ? `, conhecido(a) no dia ${n.conhecidoEm}` : ""}`);
    v.push({
      id: "memoria", rotulo: `${estranhos.map((n) => n.nome).join(", ")} foi apresentado como se fosse novo`,
      aviso: "",
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

/* O que volta ao Mestre quando o conserto deu certo. Não pode ser
   acusação: o histórico guarda o texto CORRIGIDO, então "você narrou
   X" contradiria o próprio histórico. Vai o lembrete seco da regra. */
export function lembreteDoPortao(violacoes) {
  const l = [...new Set((violacoes || []).map((v) => v.lembrete).filter(Boolean))];
  if (!l.length) return "";
  return `[GUARDA DE CONTINUIDADE — LEMBRETE DE REGRA] ${l.join(" ")}`;
}
