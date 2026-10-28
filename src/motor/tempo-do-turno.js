/* ============================================================
   O TEMPO DO TURNO, NO MOTOR (Fase T, trilha A, 28/10/2026) — src/motor/tempo-do-turno.js

   O replay da sessão gravada divergia no `minuto` em todo turno de
   exploração: quem escreve o relógio do dia é o `avancarOsMinutos` do App,
   e ele era chamado por dois órgãos que o replay não corria — o tempo da
   ação, no `agirInterno` (os minutos de um turno de exploração), e o da
   caminhada, no `moverParaLocal` (o cinturão é uma caminhada de verdade; o
   outro lado da praça, não; a escada da taverna é um minuto).

   Vêm para cá, na MESMA ordem e com os porquês de cada linha:

   - `osMinutosAndam` — a conta do relógio: os minutos somados e os dias
     que viram. O que um dia que vira faz (o reino, os festivais) continua
     a ser porta do App: lê e escreve o reino, os governos, o correio.
   - `oCorpoNoRelogio` — o que o tempo faz ao corpo: a invocação cujo prazo
     acabou (só fora da luta) e a vigília longa (o aviso das 16 h, a
     Exaustão das 20 h). Devolve o que mudar; quem escreve a ficha, a tela
     e a nota é o App, pela mesma porta de sempre (`naFicha`).
   - `oPassoNaCidade` — a parte pura do `moverParaLocal`: o lugar novo (com
     a âncora no prédio para um cômodo), os minutos da caminhada
     (`TEMPO_DA_CAMINHADA`), a linha da tela e a nota ao Mestre.
   - `oTempoDoTurno` e `oPassoDoReplay` — as mesmas peças, na ordem do App,
     sobre o estado do replay (o passo que `sessao.js` pode chamar).

   A forma é a das outras peças: o que entra é lido, nunca tocado; o que
   sai é novo. Provado byte a byte contra o App de antes (7a0d8b2) em
   `teste-motor-tempo-do-turno.mjs`.
   ============================================================ */
import { definirLugar, pontoDoLugar, comEm, comDe } from "../lugar.js";
import { expirarPorMinuto } from "../invocacoes.js";
import { criarCondicao } from "../condicoes.js";
import { HORAS_AVISO_SONO, HORAS_EXAUSTO, MINUTOS_POR_TURNO } from "../calendario.js";
import { oMundoAndaNoTurno } from "./antes-do-mestre.js";

/* o dia do relógio: 1440 minutos, e o minuto 0 é a meia-noite */
export const RELOGIO_DO_DIA = Object.freeze({ minutosDoDia: 1440 });

/* ---------------- A CAMINHADA (v9.58) ----------------
   O cinturão é uma caminhada de verdade (o arredor traz os minutos dele;
   sem eles, 40); o outro lado da praça, cinco; a escada da taverna, um. */
export const TEMPO_DA_CAMINHADA = Object.freeze({ comodo: 1, dentro: 5, arredores: 40 });

const fin = (x) => (Number.isFinite(x) ? x : 0);

/* ---------------- A CONTA DO RELÓGIO ----------------
   Os minutos somam; cada 1440 viram um dia (o App corre a porta do dia
   uma vez por dia virado: o reino, o festival). `aoVirar` é o minuto que
   o relógio marca no instante em que cada dia vira (a porta do dia corre
   com ele, como corria no App). → { minuto, dias, aoVirar } */
export function osMinutosAndam(ler, n) {
  const e = ler || {};
  const M = RELOGIO_DO_DIA.minutosDoDia;
  let minuto = fin(e.minuto) + fin(n);
  let dias = 0;
  const aoVirar = [];
  while (minuto >= M) { minuto -= M; dias++; aoVirar.push(minuto); }
  return { minuto, dias, aoVirar };
}

/* o minuto absoluto da campanha (o dia 1 começa no 0) */
export const minutoAbsoluto = (dia, minuto) => (fin(dia) - 1) * RELOGIO_DO_DIA.minutosDoDia + fin(minuto);

/* a condição da vigília longa, posta na ficha (a que havia sai: uma só) */
export const comAExaustao = (p) => ({ ...p, condicoes: [...((p && p.condicoes) || []).filter((x) => x.id !== "exausto"), criarCondicao("exausto", { origem: "vigília longa demais" })] });

/* ---------------- O QUE O TEMPO FAZ AO CORPO ----------------
   ler: { combate, ficha, dia, minuto (os de DEPOIS de os minutos
   andarem), acordouAbs }; n: os minutos que andaram.

   v9.54: O PRAZO DA INVOCAÇÃO NO RELÓGIO DO MUNDO. Só fora da luta —
   dentro dela quem manda é a rodada, e deixar os dois correrem juntos
   desfaria a fera no meio do combate por causa dos seis segundos que a
   rodada custa no calendário.

   O sono: o corpo cobra. 16 h acordado = aviso; 20 h = Exaustão (condição
   por código). A Exaustão lê a ficha de DEPOIS da invocação desfeita (é a
   que o App tem nesse instante), e não se reanuncia: quem já está cansado
   não volta a ouvir a linha (a armadilha da v9.54 — a condição sumia entre
   um turno e outro porque se escrevia num lugar só).

   → { fim (o expirarPorMinuto, ou null), nota, exausto, aviso, linha, acordadoH } */
export function oCorpoNoRelogio(ler, n) {
  const e = ler || {};
  const abs = minutoAbsoluto(e.dia, e.minuto);
  let ficha = e.ficha;
  let fim = null, nota = null;
  if (!e.combate) {
    const f = expirarPorMinuto(ficha, abs);
    if (f.sumiram.length) {
      fim = f; ficha = f.pers;
      nota = `[INVOCAÇÃO ENCERRADA PELO SISTEMA] ${f.sumiram.join(", ")} ${f.sumiram.length > 1 ? "se desfizeram" : "se desfez"}: o prazo acabou. Narre o desmanche em uma frase e siga — ${f.sumiram.length > 1 ? "elas não estão mais" : "ela não está mais"} comigo.`;
    }
  }
  const acordadoH = (abs - e.acordouAbs) / 60;
  const cansadoJa = ((ficha || {}).condicoes || []).some((c) => c.id === "exausto" || (c.nome || "").toLowerCase().includes("cansado"));
  if (acordadoH >= HORAS_EXAUSTO && !cansadoJa) {
    return { fim, nota, exausto: true, aviso: false, acordadoH, linha: `🥱 Exaustão: ${Math.floor(acordadoH)}h acordado. Você está Exausto (desvantagem) até um descanso longo.` };
  }
  if (acordadoH >= HORAS_AVISO_SONO && (acordadoH - fin(n) / 60) < HORAS_AVISO_SONO) {
    return { fim, nota, exausto: false, aviso: true, acordadoH, linha: `🌙 Você está acordado há ${Math.floor(acordadoH)}h. O corpo pede acampamento — além de ${HORAS_EXAUSTO}h vem a exaustão.` };
  }
  return { fim, nota, exausto: false, aviso: false, acordadoH, linha: "" };
}

/* a cidade em que o herói pisa, no mapa (o `cidadeSobOsPes` do App) */
export function aCidadeSobOsPes(ler) {
  const e = ler || {};
  if (!e.cidadeAtual) return null;
  return (((e.mapa || {}).cidades) || []).find((c) => (c.nome || "").toLowerCase() === String(e.cidadeAtual).toLowerCase()) || null;
}
const semNome = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

/* ---------------- O PASSO NA CIDADE (v9.58, v9.118) ----------------
   ler: { cidadeAtual, lugar, dia, mapa }; alvo: o sítio pedido (o da
   frase ou o do mapa: as duas portas são o mesmo código).

   v9.118: TODO LUGAR NASCE COM PONTO. O arredor já sabe onde fica — ele
   nasceu com coordenada na v9.51 e ninguém a lia. Um cômodo se ancora no
   PRÉDIO, não na cidade: o quarto de cima é metros acima do salão, e
   ancorar na praça o poria a metros da praça, que é outro lugar.

   → null (não houve passo: sem alvo, sem cidade, ou já está lá), ou
     { lugar, minutos, caminhadaNaTela, linha, nota } */
export function oPassoNaCidade(ler, alvo) {
  const e = ler || {};
  const nomeCidade = e.cidadeAtual;
  if (!alvo || !alvo.nome || !nomeCidade) return null;
  if (e.lugar && semNome(e.lugar.nome) === semNome(alvo.nome)) return null;
  const distancia = alvo.onde === "arredores" ? "arredores" : "dentro";
  const cidAqui = aCidadeSobOsPes(e);
  const ancora = alvo.onde === "comodo" && alvo.dentroDe
    ? { nome: alvo.dentroDe, ...(pontoDoLugar(alvo.dentroDe, cidAqui, "dentro") || {}) }
    : cidAqui;
  const lugar = definirLugar(alvo.nome, { cidade: nomeCidade, dia: e.dia, distancia, dentroDe: alvo.dentroDe || "", ancora, coord: alvo.coord || null });
  if (!lugar) return null;
  const T = TEMPO_DA_CAMINHADA;
  const minutos = alvo.onde === "arredores" ? (Number(alvo.minutos) || T.arredores) : alvo.onde === "comodo" ? T.comodo : T.dentro;
  const ondeDiz = alvo.onde === "comodo" ? ` — ${alvo.dentroDe}` : alvo.onde === "arredores" ? ` — ${Math.round(Number(alvo.minutos) || T.arredores)} min de caminhada desde ${nomeCidade}` : "";
  const lugarDito = alvo.onde === "comodo" ? `${comEm(alvo.nome)}, dentro ${comDe(alvo.dentroDe)}` : comEm(alvo.nome);
  return {
    lugar, minutos,
    /* só a caminhada de verdade diz o relógio na tela */
    caminhadaNaTela: alvo.onde === "arredores",
    linha: `📍 Você está ${comEm(alvo.nome)}${ondeDiz}.`,
    nota: `[MOVIMENTO — REGISTRADO PELO SISTEMA] Eu me desloquei${alvo.onde === "dentro" ? ` dentro de ${nomeCidade}` : ""} e AGORA estou ${lugarDito}${alvo.onde === "arredores" ? `, nos arredores de ${nomeCidade}` : ""}. O sistema já registrou o lugar e o tempo. Narre a chegada e a cena AQUI — não me descreva a caminho, não me deixe na praça e não me devolva ao ponto de partida. Só eu decido sair daqui.`,
  };
}

/* os minutos andados sobre o estado do replay: o minuto e o dia (o que o
   dia virado faz ao reino é porta do App, e o replay não o corre). Um
   estado SEM relógio (as sessões de prova jogadas em Node não o levam)
   continua sem ele: o passo não inventa uma hora que ninguém marcou. */
const andarNoEstado = (E, n) => {
  if (!Number.isFinite(E.minuto)) return E;
  const r = osMinutosAndam(E, n);
  return { ...E, minuto: r.minuto, dia: r.dias ? fin(E.dia) + r.dias : E.dia };
};

/* ---------------- PARA O REPLAY: O TEMPO DA AÇÃO ----------------
   No `agirInterno`, um turno de exploração custa MINUTOS_POR_TURNO —
   só com frase do jogador, fora da luta, do acampamento e da masmorra, e
   quando a frase não é SÓ pergunta (MM14). Corre antes de "o sítio pela
   frase" (no App, o `agirInterno` vem antes do `enviar`). */
export function oTempoDoTurno(estado, entrada) {
  const E = estado || {};
  const frase = typeof (entrada || {}).frase === "string" ? entrada.frase : "";
  if (!frase || frase.trimStart().startsWith("[")) return E;
  if (!oMundoAndaNoTurno(E, frase).anda) return E;
  return andarNoEstado(E, MINUTOS_POR_TURNO);
}

/* ---------------- PARA O REPLAY: O PASSO NA CIDADE ----------------
   O `moverParaLocal` sobre o estado do replay, com o alvo que o replay já
   achou pela frase: o lugar (com a coordenada que o sítio gravado traz) e
   os minutos da caminhada. Sem passo, o estado volta o mesmo. */
export function oPassoDoReplay(estado, alvo) {
  const E = estado || {};
  const p = oPassoNaCidade({ cidadeAtual: E.cidadeAtual, lugar: E.lugar, dia: fin(E.dia), mapa: E.mapa }, alvo);
  if (!p) return E;
  return andarNoEstado({ ...E, lugar: p.lugar }, p.minutos);
}
