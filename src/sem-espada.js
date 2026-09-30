/* ============================================================
   A LUTA SEM ESPADA (Fase MM · MM9) — a palavra que dobra o bando

   A PERGUNTA DE MESA: *"posso mandá-los largar as armas?"*. No Honey Heist
   o clímax resolveu-se assim, e a mesa inteira lembra-se disso mais do que
   de qualquer golpe. Aqui, até esta etapa, a vontade da oposição só virava
   PELA VIDA: as `quebra` de `adversario.js` leem `minhaVida`, `quantos`,
   `liderCaiu` — nenhuma lê o que o herói disse. Intimidar no meio da luta
   rolava o dado do catálogo (`desafios.js`, `intimidar`) e o resultado ia
   ao Narrador como prosa: o bando continuava a bater como se nada fosse.

   ---------------- O QUE ESTE MÓDULO DECIDE ----------------

   · QUEM OUVE, e o quê — `PALAVRA_POR_DEGRAU`, pela cabeça que o inimigo
     tem (`DEGRAUS`, degraus.js) e pelo tipo de palavra (Persuasão,
     Intimidação, Enganação). Um animal não se convence: foge de quem mete
     medo. Um astuto ouve tudo. Um treinado aguenta a ameaça. O morto não
     ouve nada; o fanático, só quando aquilo por que luta já caiu.
   · A CD — `CD_DA_PALAVRA`: o degrau e o tipo, a vida que falta a quem
     fala pelo bando, quantos do bando já caíram, e se o herói acabou de
     impressionar.
   · A ESCADA DA VONTADE — dois degraus e nada mais: FIRME → VERGADO (a
     intenção do bando passa a ser a de quem quer sair: `sair_vivo`, ou
     `fugir_ferido` no bicho) → VENCIDO (rendem-se; o bicho foge). Quem a
     VIDA já vergou (a `quebra` de sempre o pôs em `sair_vivo`,
     `encurralado`, `debandar`…) já está no degrau do meio: uma palavra
     certa a quem já quer sair é a rendição. É assim que a espada e a
     palavra se somam, em vez de serem dois jogos.
   · A RENDIÇÃO — `rendido: true`, um campo NOVO e ADITIVO no inimigo, ao
     lado de `derrotado: true` (fora da luta) e com a VIDA que tinha: não
     morreu, não fugiu. Liga-se ao poupado de MM3 (`desacordado`,
     golpe-final.js): os dois são gente viva nas mãos do herói
     (`vivosNasMaos`), e o que o rendido sabe vai à pauta
     (`envelopeDosPrisioneiros`) — a intenção com que o bando veio, e quem
     o mandou, quando havia quem. Interrogar a sério, prender, levar,
     soltar: é Q4, e fica escrito lá.

   ---------------- O QUE ESTE MÓDULO NÃO FAZ ----------------

   Não lê a frase: quem decide que "intimido o bandido" é um teste de
   Intimidação é `lerAcao` (desafios.js), que já passa a frase pela peneira
   (`soODeclarado`) — "posso intimidá-lo?" e "e se eu o ameaçasse?" não
   rolam. Não rola o dado nem cobra a ação: o App faz as duas coisas, pela
   tabela `PALAVRA_NA_LUTA`. E não escreve nome de mecanismo em lado
   nenhum: o que vai à tela e à pauta é o que o bando FAZ.
   ============================================================ */

import { degrauDaCriatura, degrauPorId, DEGRAU_DO_CHAO } from "./degraus.js";
import { menteDaCriatura, intencaoPorId } from "./adversario.js";
import { chanceDeAcerto } from "./fuga.js";
import { dificuldadePorId } from "./desafios.js";
import { PESO_AMEACA } from "./orcamento.js";

const N = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const ehObj = (x) => !!x && typeof x === "object" && !Array.isArray(x);
const lista = (x) => (Array.isArray(x) ? x.filter(ehObj) : []);
const dePe = (e) => !e.derrotado && (Number(e.vida) || 0) > 0;
const limpar = (s, n = 40) => String(s == null ? "" : s).replace(/\s+/g, " ").trim().slice(0, n);

/* ---------------- OS TRÊS TIPOS DE PALAVRA ----------------
   Pela PERÍCIA do veredicto de `lerAcao`, e não pelo id do desafio: é a
   perícia que diz o que a palavra faz, e o catálogo pode ganhar outro
   desafio de Intimidação amanhã sem esta tabela saber. */
export const TIPOS_DE_PALAVRA = {
  persuasao: { id: "persuasao", verbo: "convencer" },
  intimidacao: { id: "intimidacao", verbo: "intimidar" },
  enganacao: { id: "enganacao", verbo: "enganar" },
};

export function tipoDaPalavra(veredicto) {
  const v = ehObj(veredicto) ? veredicto : null;
  if (!v || v.tipo !== "teste" || !v.social) return null;
  return TIPOS_DE_PALAVRA[v.pericia] ? v.pericia : null;
}

/* ============================================================
   QUEM NÃO SE RENDE — o fanático.

   "Fanático" NÃO existe como traço de inimigo nesta casa: a índole
   (`indole.js`) é de gente do elenco, não de bestiário; o único fanático
   escrito é o `desc` do Cultista ("fanático com magia menor"), e o `desc`
   não chega à mesa (`completarInimigo` não o copia — dívida conhecida). O
   prompt diz ao Narrador que "o fanático não negocia", sem nada atrás.
   Então decide-se por TABELA DE NOMES, como a de quem ataca de longe
   (`atirador.js`): o nome e, quando vier, o `desc`.
   ============================================================ */
export const QUEM_NAO_SE_RENDE = [
  { id: "fanatico", rx: /\b(cultistas?|fanatic[oa]s?|zelot[ae]s?|sectari[oa]s?|inquisidor(es|a)?|devot[oa]s? de|martir(es)?|profeta|profetisa)\b/ },
];
export function ehFanatico(inimigo) {
  if (!ehObj(inimigo)) return false;
  if (inimigo.fanatico === true) return true;
  const t = N(`${inimigo.nome || ""} ${inimigo.desc || ""}`);
  return QUEM_NAO_SE_RENDE.some((q) => q.rx.test(t));
}

/* ============================================================
   O QUE CADA PALAVRA MOVE, POR DEGRAU — a tabela da etapa.

   Cada célula: `passos` (0 = nada, 1 = um degrau da escada da vontade) e
   `cd` (o ajuste sobre `CD_DA_PALAVRA.base`); `fim` é o que o último
   degrau É para aquela cabeça — `rendicao` para quem pensa, `fuga` para o
   bicho.

     animal     não se convence nem se engana: não há com quem falar. Mas
                o fogo, o grito e a arma erguida afugentam — e o bicho não
                se rende, FOGE.
     bruto      responde à força: a ameaça pesa por inteiro e a mentira
                cola; o argumento custa mais (+3), porque ele não pesa.
     astuto     o degrau que "sim": vê o que perde e o que ganha, e por
                isso ouve o argumento sem desconto. A ameaça e a mentira
                custam (+2): ele mede se o herói cumpre, e desconfia.
     treinado   tropa com disciplina: a ameaça esbarra na ordem (+4); o
                argumento e o engano (+2) ainda passam.
     brilhante  não se deixa intimidar (0) e quase não se engana (+5); com
                ele, só se fala a sério (+2).

   E DUAS CABEÇAS QUE A ESCADA NÃO VÊ, por cima do degrau:
     morto      "cumpre o que foi posto para cumprir, e não muda de ideia"
                (degraus.js): nada move um esqueleto.
     fanático   nada — ATÉ o que ele serve cair (o chefe tombou, a coisa
                que guardava quebrou). Aí o argumento pode tudo o que pode
                com qualquer um, com +5: "talvez nunca", e nunca por medo
                nem por engano.
   ============================================================ */
const NADA = { passos: 0, cd: 0 };
export const PALAVRA_POR_DEGRAU = {
  animal: { persuasao: NADA, intimidacao: { passos: 1, cd: 3, fim: "fuga" }, enganacao: NADA },
  bruto: { persuasao: { passos: 1, cd: 3 }, intimidacao: { passos: 1, cd: 0 }, enganacao: { passos: 1, cd: 0 } },
  astuto: { persuasao: { passos: 1, cd: 0 }, intimidacao: { passos: 1, cd: 2 }, enganacao: { passos: 1, cd: 2 } },
  treinado: { persuasao: { passos: 1, cd: 2 }, intimidacao: { passos: 1, cd: 4 }, enganacao: { passos: 1, cd: 2 } },
  brilhante: { persuasao: { passos: 1, cd: 2 }, intimidacao: NADA, enganacao: { passos: 1, cd: 5 } },
};
export const PALAVRA_DAS_CABECAS = {
  morto: { persuasao: NADA, intimidacao: NADA, enganacao: NADA },
  fanatico: { persuasao: NADA, intimidacao: NADA, enganacao: NADA },
  fanaticoSemCausa: { persuasao: { passos: 1, cd: 5 }, intimidacao: NADA, enganacao: NADA },
};

/* A célula de UM inimigo para UM tipo de palavra. `situacao` é a da luta
   (`garantirLuta`/`lutaDaMesa`): é dela que sai "a causa caiu". */
export function celulaDaPalavra(inimigo, tipo, situacao, opcoes) {
  const lex = ehObj(opcoes) && opcoes.lex ? opcoes.lex : null;
  const t = TIPOS_DE_PALAVRA[tipo] ? tipo : null;
  if (!t || !ehObj(inimigo)) return { ...NADA, fim: "rendicao", cabeca: "nenhuma" };
  const s = ehObj(situacao) ? situacao : {};
  let mente = "pensa";
  try { mente = menteDaCriatura(String(inimigo.nome || ""), String(inimigo.desc || ""), lex) || "pensa"; } catch { mente = "pensa"; }
  const fim = mente === "besta" ? "fuga" : "rendicao";
  if (mente === "morto") return { ...PALAVRA_DAS_CABECAS.morto[t], fim, cabeca: "morto" };
  if (ehFanatico(inimigo)) {
    const causaCaiu = !!(s.liderCaiu || s.protegidoQuebrou);
    const c = causaCaiu ? PALAVRA_DAS_CABECAS.fanaticoSemCausa : PALAVRA_DAS_CABECAS.fanatico;
    return { ...c[t], fim, cabeca: causaCaiu ? "fanaticoSemCausa" : "fanatico" };
  }
  let degrau = DEGRAU_DO_CHAO;
  try { degrau = degrauDaCriatura(inimigo, { lex }); } catch { degrau = DEGRAU_DO_CHAO; }
  const linha = PALAVRA_POR_DEGRAU[degrauPorId(degrau) ? degrau : DEGRAU_DO_CHAO];
  const c = linha[t] || NADA;
  return { passos: c.passos, cd: c.cd, fim: c.fim || fim, cabeca: degrau };
}

/* ============================================================
   A ESCADA DA VONTADE

   As intenções de quem JÁ QUER SAIR — a vida vergou-os, ou o chefe caiu,
   ou não há por onde. Quem está numa delas está no degrau do meio.
   `INTENCAO_DE_QUEM_CEDE` é para onde a palavra empurra quem ainda está
   firme: a mesma intenção que a vida daria, pelo tipo de mente.
   ============================================================ */
export const INTENCOES_QUE_CEDEM = ["sair_vivo", "fugir_ferido", "encurralado", "debandar", "perder_o_animo", "receoso"];
export const INTENCAO_DE_QUEM_CEDE = { pensa: "sair_vivo", besta: "fugir_ferido", morto: "sair_vivo" };

/* 2 degraus: firme (0) → vergado (1) → vencido (2). Um crítico, ou uma
   margem larga, dá um degrau a mais: o grito certo, na hora certa, acaba
   a luta de uma vez. */
export const ESCADA_DA_VONTADE = { vergado: 1, vencido: 2, margemDoPassoDuplo: 10 };

/* ============================================================
   A CD — por tabela, nunca à mão.

   base            15, o "incomum" da escada de dificuldades (DIFICULDADES,
                   desafios.js): convencer alguém a parar de lutar é
                   pedir-lhe o que ele veio aqui para não dar.
   celula          o ajuste do degrau e do tipo (acima).
   vida            quanto falta a QUEM FALA PELO BANDO: quem está por um fio
                   ouve melhor (−2 abaixo de metade, −4 abaixo de um quarto).
   caidos          −2 por companheiro dele fora da luta (morto, fugido,
                   rendido), até −6: ver o bando desfazer-se convence.
   impressionou    −2 quando o herói acabou de fazer algo que se vê — derrubou
                   alguém nesta rodada, ou acertou em cheio.
   piso, teto      5 e 25: o trivial e o heroico da mesma escada.
   ============================================================ */
export const CD_DA_PALAVRA = {
  base: dificuldadePorId("incomum").dc,
  vida: [{ ate: 0.25, cd: -4 }, { ate: 0.5, cd: -2 }],
  porCaido: -2, tetoCaidos: -6,
  impressionou: -2,
  piso: dificuldadePorId("trivial").dc,
  teto: dificuldadePorId("heroico").dc,
};

export function cdDaPalavra(args) {
  const { celula = null, vidaFrac = 1, caidos = 0, impressionou = false } = ehObj(args) ? args : {};
  const C = CD_DA_PALAVRA;
  const c = ehObj(celula) ? celula : NADA;
  let cd = C.base + (Number(c.cd) || 0);
  const v = Number.isFinite(Number(vidaFrac)) ? Number(vidaFrac) : 1;
  const faixa = C.vida.find((f) => v <= f.ate);
  if (faixa) cd += faixa.cd;
  cd += Math.max(C.tetoCaidos, C.porCaido * Math.max(0, Math.floor(Number(caidos) || 0)));
  if (impressionou) cd += C.impressionou;
  return Math.max(C.piso, Math.min(C.teto, cd));
}

/* ---------------- QUEM FALA PELO BANDO ----------------
   A mesma conta de `lutaDaMesa` (App) e da régua: o mais forte de pé, pelo
   nível e por `PESO_AMEACA`. A palavra dirige-se a quem manda — é a vontade
   dele que o bando segue. */
export function vozDoBando(inimigos) {
  const vivos = lista(inimigos).filter(dePe);
  if (!vivos.length) return null;
  const peso = (x) => (Number(x.nivel) || 0) + (PESO_AMEACA[x.ameaca] || PESO_AMEACA.comum) * 10;
  return vivos.reduce((a, b) => (peso(b) > peso(a) ? b : a), vivos[0]);
}

/* ---------------- NA LUTA, A PALAVRA É A AÇÃO ----------------
   No 5e, falar é livre, mas obrigar alguém a largar as armas é uma AÇÃO
   (o teste de Carisma que o Mestre pede no lugar do ataque). O catálogo de
   desafios, hoje, não cobra nada dentro da luta — a MM4 deixou-o escrito
   como furo. Aqui a palavra cobra a ação, como o golpe: é a escolha
   interessante (bater ou falar), e sem custo seria sempre as duas. */
export const PALAVRA_NA_LUTA = { custo: "acao" };

/* ---------------- A VOZ DO VEREDITO ----------------
   O que o jogador lê ANTES do clique: a chance (a mesma de `chanceDeAcerto`,
   que é a do d20 desta casa — o 1 falha e o 20 passa) dita como mundo, e o
   que acontece se passar. Nenhum número e nenhum mecanismo. */
export const FAIXAS_DA_PALAVRA = [
  { id: "quase_certo", min: 0.75, diz: "quase certamente cedem" },
  { id: "provavel", min: 0.5, diz: "devem ceder" },
  { id: "pode", min: 0.25, diz: "podem ceder" },
  { id: "dificil", min: 0, diz: "dificilmente cedem" },
];
export const O_QUE_A_PALAVRA_FAZ = {
  vergam: "a vontade deles verga",
  rendem: "baixam as armas",
  fogem: "fogem",
  surdos: {
    animal: "Não é com palavras que se fala com um bicho.",
    morto: "Isto não tem medo nem razão para ouvir.",
    fanatico: "Nada do que disser o fará largar a fé.",
    firme: "Isso não o fará ceder.",
  },
};

const intencaoCede = (id) => INTENCOES_QUE_CEDEM.includes(String(id || ""));
/* a intenção que vale guardar como "o que vieram fazer": existe e não é a
   de quem já quer sair (essa não conta nada a quem interroga) */
const intencaoValida = (id) => !!intencaoPorId(String(id || "")) && !intencaoCede(id);
const caidosDe = (inimigos) => lista(inimigos).filter((e) => !dePe(e)).length;

/* O que PASSAR faria, sem rolar nada: vergar, ou vencer. */
function oQueFaria(celula, intencao, passos) {
  const nivel = (intencaoCede(intencao) ? ESCADA_DA_VONTADE.vergado : 0) + passos;
  if (nivel >= ESCADA_DA_VONTADE.vencido) return celula.fim === "fuga" ? "fuga" : "rendicao";
  return "virou";
}

/* ============================================================
   O VEREDITO ANTES DO CLIQUE

   `inimigos` é a lista da luta; `tipo` um de `TIPOS_DE_PALAVRA`; `mod` o
   bônus do herói no teste (o App já o calcula para rolar); `intencao` o id
   da intenção do bando agora (`intencaoRef`); `situacao` a da luta;
   `impressionou` o sinal da rodada. Devolve `pode` (há com quem falar),
   a CD, a chance e a linha. Nunca estoura: é lido a cada tecla.
   ============================================================ */
export function vereditoDaPalavra(args) {
  const a = ehObj(args) ? args : {};
  const tipo = TIPOS_DE_PALAVRA[a.tipo] ? a.tipo : null;
  const voz = vozDoBando(a.inimigos);
  if (!tipo || !voz) return { pode: false, linha: "", cd: null, chance: null, voz: voz ? voz.nome : "" };
  const celula = celulaDaPalavra(voz, tipo, a.situacao, { lex: a.lex || null });
  if (celula.passos <= 0) {
    const S = O_QUE_A_PALAVRA_FAZ.surdos;
    const linha = celula.cabeca === "animal" ? S.animal : celula.cabeca === "morto" ? S.morto
      : celula.cabeca === "fanatico" ? S.fanatico : S.firme;
    return { pode: false, linha, cd: null, chance: 0, voz: voz.nome, celula };
  }
  const vidaFrac = (Number(voz.vida) || 0) / (Number(voz.vidaMax) || Number(voz.vida) || 1);
  const cd = cdDaPalavra({ celula, vidaFrac, caidos: caidosDe(a.inimigos), impressionou: !!a.impressionou });
  let chance = null;
  try { chance = chanceDeAcerto({ bonus: Number(a.mod) || 0, defesa: cd, vantagem: !!a.vantagem, desvantagem: !!a.desvantagem }); } catch { chance = null; }
  const faixa = Number.isFinite(chance) ? (FAIXAS_DA_PALAVRA.find((f) => chance >= f.min) || FAIXAS_DA_PALAVRA[FAIXAS_DA_PALAVRA.length - 1]) : FAIXAS_DA_PALAVRA[2];
  const faria = oQueFaria(celula, a.intencao, celula.passos);
  const F = O_QUE_A_PALAVRA_FAZ;
  const efeito = faria === "rendicao" ? F.rendem : faria === "fuga" ? F.fogem : F.vergam;
  return {
    pode: true, cd, chance, faixa: faixa.id, voz: voz.nome, celula, faria,
    linha: `${limpar(voz.nome)}: ${faixa.diz} — ${efeito}.`,
  };
}

/* ---------------- O CORPO DE QUEM SE RENDE ----------------
   `derrotado: true` para a luta acabar como sempre acaba; `rendido: true`
   para ninguém o confundir com um morto; a VIDA que tinha fica. `queria`
   é a intenção com que o bando veio — o que ele sabe, e o que o
   interrogatório de Q4 lhe vai arrancar. Save: dois campos novos, que a
   versão antiga ignora (vê um inimigo `derrotado`, como sempre viu). */
export function renderSe(inimigo, opcoes) {
  if (!ehObj(inimigo)) return inimigo;
  const dada = ehObj(opcoes) ? String(opcoes.queria || "") : "";
  /* a que já vinha carimbada (do degrau do meio) manda sobre a de agora,
     que nessa altura já é a de quem quer sair */
  const queria = intencaoValida(inimigo.queria) ? inimigo.queria : dada;
  const q = intencaoValida(queria) ? { queria } : {};
  return { ...inimigo, derrotado: true, rendido: true, ...q };
}

/* ============================================================
   OUVIR A PALAVRA — o que o teste já rolado faz ao bando.

   `passou` é o que o App já decidiu (o sucesso, ou o "por um fio" de MM5);
   `margem` = total − CD; `critico` o 20 natural. Devolve a lista NOVA de
   inimigos (nunca muta a recebida), a intenção nova do bando (ou `null`
   para não mexer), quem se rendeu, quem fugiu e quem resta de pé.
   ============================================================ */
export function ouvirAPalavra(args) {
  const a = ehObj(args) ? args : {};
  const inimigos = lista(a.inimigos);
  const tipo = TIPOS_DE_PALAVRA[a.tipo] ? a.tipo : null;
  const voz = vozDoBando(inimigos);
  const nada = { efeito: "nada", inimigos, intencao: null, rendidos: [], fogem: [], restam: inimigos.filter(dePe).map((e) => e.nome), voz: voz ? voz.nome : "", queria: "" };
  if (!tipo || !voz || !a.passou) return nada;
  const lex = a.lex || null;
  const celula = celulaDaPalavra(voz, tipo, a.situacao, { lex });
  if (celula.passos <= 0) return nada;
  const duplo = !!a.critico || (Number(a.margem) || 0) >= ESCADA_DA_VONTADE.margemDoPassoDuplo;
  const passos = celula.passos + (duplo ? 1 : 0);
  const faria = oQueFaria(celula, a.intencao, passos);
  const antes = String(a.intencao || "");
  if (faria === "virou") {
    let mente = "pensa";
    try { mente = menteDaCriatura(String(voz.nome || ""), String(voz.desc || ""), lex) || "pensa"; } catch { mente = "pensa"; }
    /* O QUE VIERAM FAZER fica carimbado em quem está de pé (`queria`,
       campo novo e aditivo), porque no degrau seguinte a intenção do bando
       já é a de quem quer sair — e o prisioneiro tem de saber a de antes. */
    const carimbados = intencaoValida(antes)
      ? inimigos.map((e) => (dePe(e) && !intencaoValida(e.queria) ? { ...e, queria: antes } : e))
      : inimigos;
    return { ...nada, efeito: "virou", inimigos: carimbados, intencao: INTENCAO_DE_QUEM_CEDE[mente] || INTENCAO_DE_QUEM_CEDE.pensa, queria: antes };
  }
  /* VENCIDO: o bando segue quem manda — cada um que a palavra PODE mover
     (a célula dele, não a da voz) rende-se ou foge; quem ela não move
     (o morto, o fanático, o bicho que só a ameaça afugenta) fica. */
  const rendidos = [], fogem = [];
  const novos = inimigos.map((e) => {
    if (!dePe(e)) return e;
    const c = e === voz ? celula : celulaDaPalavra(e, tipo, a.situacao, { lex });
    if (c.passos <= 0) return e;
    if (c.fim === "fuga") { fogem.push(e.nome); return { ...e, derrotado: true, fugiu: true }; }
    rendidos.push(e.nome);
    return renderSe(e, { queria: antes });
  });
  const restam = novos.filter(dePe).map((e) => e.nome);
  return {
    efeito: rendidos.length ? "rendicao" : "fuga", inimigos: novos, intencao: null,
    rendidos, fogem, restam, voz: voz.nome, queria: antes,
  };
}

/* ============================================================
   O QUE O NARRADOR OUVE — pela pauta, sem nome de mecanismo.

   O molde de `envelopeDoGolpeFinal`: `{ acabou, naoPode }`, uma lista por
   seção. `acabou` é o fato consumado ("o que o sistema resolveu agora");
   `naoPode` é o veto de o desfazer. A intenção NOVA do bando não vem
   aqui: o App passa-a a `intencaoRef`, e a linha da luta (`linhaDaLuta`)
   diz-la no turno seguinte pela porta de sempre.
   ============================================================ */
const juntar = (nomes) => (nomes.length <= 1 ? nomes.join("") : `${nomes.slice(0, -1).join(", ")} e ${nomes[nomes.length - 1]}`);
export function envelopeDaPalavra(res, opcoes) {
  const r = ehObj(res) ? res : {};
  const h = limpar(ehObj(opcoes) ? opcoes.heroi : "") || "o herói";
  const voz = limpar(r.voz);
  if (r.efeito === "virou" && voz) {
    const nova = intencaoPorId(r.intencao);
    return {
      acabou: [`O que ${h} disse pesou: ${voz} já não quer o que queria — agora quer ${nova ? nova.quer.split(",")[0] : "sair dali"}. Mostre-o a vacilar, e o bando a olhar para ele.`],
      naoPode: [],
    };
  }
  const nomes = (x) => (Array.isArray(x) ? x : []).map((n) => limpar(n)).filter(Boolean);
  const rend = nomes(r.rendidos);
  const fog = nomes(r.fogem);
  const acabou = [], naoPode = [];
  if (rend.length) {
    acabou.push(`${juntar(rend)} ${rend.length > 1 ? "baixam as armas e rendem-se" : "baixa as armas e rende-se"}: ${rend.length > 1 ? "estão vivos e fora da luta" : "está vivo e fora da luta"}, à mercê de ${h}.`);
    naoPode.push(`${juntar(rend)} ${rend.length > 1 ? "renderam-se" : "rendeu-se"}: não ${rend.length > 1 ? "os" : "o"} faça voltar a lutar, fugir ou morrer sem que ${h} o decida.`);
  }
  if (fog.length) acabou.push(`${juntar(fog)} ${fog.length > 1 ? "fogem" : "foge"} de ${h} — ${fog.length > 1 ? "saíram" : "saiu"} da luta.`);
  return { acabou, naoPode };
}

/* ============================================================
   OS VIVOS NAS MÃOS DO HERÓI — o rendido (MM9) e o poupado (MM3).

   Os dois saem da luta vivos; nenhum dos dois é um morto a riscar do
   registo do mundo, nem um fugido que vai voltar. É esta a consequência
   mínima que a rendição tem de ter para não ser um "morreu de outra
   maneira": ele está ali, e sabe coisas.
   ============================================================ */
export function vivosNasMaos(inimigos) {
  return lista(inimigos).filter((e) => e.rendido === true || e.desacordado === true)
    .map((e) => ({ nome: e.nome, estado: e.rendido === true ? "rendido" : "desacordado", queria: e.queria || "", acordaEmHoras: e.acordaEmHoras || null }));
}

/* O QUE ELE SABE, e só isto — a verdade do sistema, não a imaginação do
   Narrador: a intenção com que o bando veio (o `quer` e o `porque`), e, se
   a luta era do vilão, que alguém os mandou (e o nome, se o App o der). O
   resto é Q4: o que se arranca a mais, com que teste, a que preço. */
export function oQueOPrisioneiroSabe(preso, opcoes) {
  const o = ehObj(opcoes) ? opcoes : {};
  const doVilao = !!o.doVilao, quemMandou = o.quemMandou || "";
  const p = ehObj(preso) ? preso : {};
  const i = intencaoPorId(p.queria);
  const partes = [];
  if (i) partes.push(`vieram para ${i.quer.split(",")[0]} — ${i.porque}`);
  /* sem o nome, diz-se só que houve mandante — dizer "e ele sabe quem"
     sem dizer quem seria pedir ao Narrador que o inventasse */
  if (doVilao) partes.push(limpar(quemMandou, 60) ? `quem os mandou foi ${limpar(quemMandou, 60)}` : "vieram a mando de alguém");
  return partes.join("; ");
}

export function envelopeDosPrisioneiros(inimigos, opcoes) {
  const o = ehObj(opcoes) ? opcoes : {};
  const doVilao = !!o.doVilao, quemMandou = o.quemMandou || "";
  const h = limpar(o.heroi) || "o herói";
  const acabou = [], naoPode = [];
  for (const p of vivosNasMaos(inimigos)) {
    const nome = limpar(p.nome);
    if (!nome) continue;
    const sabe = oQueOPrisioneiroSabe(p, { doVilao, quemMandou });
    const como = p.estado === "rendido" ? "rendeu-se e está vivo" : `está desacordado${p.acordaEmHoras ? ` (acorda em ${p.acordaEmHoras} ${p.acordaEmHoras === 1 ? "hora" : "horas"})` : ""}`;
    acabou.push(`${nome} ${como}, nas mãos de ${h}: pode ser interrogado.${sabe ? ` O que sabe, e só isto: ${sabe}.` : ""}`);
    naoPode.push(`Não invente o que ${nome} sabe além disto.`);
  }
  return { acabou, naoPode };
}
