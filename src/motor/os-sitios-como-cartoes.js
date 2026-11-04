/* ============================================================
   OS SÍTIOS COMO CARTÕES (o Narrador ator, a 17.ª sessão · 04/11/2026) — src/motor/os-sitios-como-cartoes.js

   A pessoa aprovou-a em 04/11 («Pode fazer os sítios como cartões»;
   mente/sessao-17.md, §3, a proposta do `jogo`). Na 17.ª o jogador gastou
   15 dos 20 turnos num `falar_com` cuja resposta o sistema sabia desde a
   abertura: o IR por frase falhou 3 de 10 vezes («Vou ao Descanso do
   Carroceiro…» pôs a heroína a descansar; «Volto ao templo…» ficou em
   intenção), e quem jogava não podia saber, antes de ir, que o Godfrey
   estava de folga, nem que a folga era no templo. A planta deixa ir a
   qualquer sítio, mas não diz quem lá está.

   O SÍTIO DO PASSO PASSA A SER COISA QUE SE TOCA, COM O VEREDITO. A soleira
   oferece «Ir até o Descanso do Carroceiro · 5 min · Godfrey Pescador não
   está lá: de folga hoje…» e «Ir até Catedral da Cinza · 5 min · Godfrey
   Pescador está lá, de folga». Antes de ir, quem joga vê quem lá está à
   hora da chegada.

   A VERDADE DO CARTÃO É A MESMA DA CHEGADA. Para cada sítio a que se vai a
   pé daqui (a lista do App, `lugaresDaqui`, sem os cômodos), a peça monta o
   estado de quem lá chegasse — o lugar e os minutos do passo que o toque
   vai dar (oPassoNaCidade, tempo-do-turno.js) — e pergunta a
   `aPessoaDoPasso` quem está em cena. É a mesma função que a ficha do
   turno seguinte vai correr; duas contas para o mesmo sítio seriam duas
   verdades, e o cartão mentiria na primeira vez que divergissem.

   DE QUE SÍTIOS HÁ CARTÃO, e por esta ordem:
     1. onde está agora quem um passo procura (no posto, ou de folga no
        sítio da rotina, O_FORA_COM_SITIO);
     2. o sítio que um `revelar` de agora manda descobrir, nesta cidade;
     3. o posto de quem um passo procura e não está lá, com o porquê (onde
        anda, e a que horas volta) — só quando não há cartão dela em 1.
   Uma pessoa, um cartão. Quem já deu o passo (`dado`) só conta enquanto
   tem o que dizer (o passo seguinte por perguntar: o cartão da pista). O
   sítio onde o herói está não tem cartão: lá não se vai. Na estrada, na
   masmorra e na luta, nenhum.

   O TOQUE é o «ir» da planta (`irAoLugarPeloMapa`): o mesmo passo, a
   mesma frase ao Narrador, o mesmo tempo. Nenhum caminho paralelo.

     osSitiosComoCartoes(estado, sitios)
       estado: o de aPessoaDoPasso (o do pedido, estadoDoPedido)
       sitios: [{ nome, onde: "dentro"|"arredores"|…, minutos? }] — lugaresDaqui()
     → [{ id, nome, oferta, diz, minutos, alvo, quem }]
       id:      "sitio|<nome>"
       diz:     quem lá está, ou porque não está (o retorno do cartão)
       minutos: os do passo (o App diz-os com emTempo)
       alvo:    o sítio da lista, tal como veio (é o que o toque leva)

   Sem sorte, sem prosa: tudo sai do estado e da semente. A última resposta
   fica guardada pela chave do que ela lê (a soleira monta-se a cada
   render, e a pergunta corre uma vez por sítio). Puro, sem React. Provado
   em `testes/teste-os-sitios-como-cartoes.mjs`.
   ============================================================ */
import { aPessoaDoPasso, aHoraDita } from "./a-pessoa-do-passo.js";
import { oPassoNaCidade, osMinutosAndam } from "./tempo-do-turno.js";
import { garantirMissoes, etapaAtual, moradaDe } from "../missoes.js";
import { contrair } from "../lugar.js";

const ehObj = (x) => x != null && typeof x === "object" && !Array.isArray(x);
const arr = (x) => (Array.isArray(x) ? x : []);
const str = (x) => (typeof x === "string" ? x : x == null ? "" : String(x));
const limpo = (x) => str(x).replace(/\s+/g, " ").trim();
const sem = (x) => str(x).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
const semArtigo = (x) => sem(x).replace(/^(o|a|os|as)\s+/, "");
const tpl = (s, v) => str(s).replace(/\{([A-Z])\}/g, (_, k) => (v[k] != null ? v[k] : ""));

/* COMO O CARTÃO O DIZ. {L} o sítio (o artigo do começo em minúscula: «o
   Descanso do Carroceiro»), {N} quem, {I} a hora a que chega («às onze da
   manhã»), {T} o título da missão.

   CURTO, PORQUE É UM RETORNO: a peça `Oferta` põe o verbo, o preço e o
   retorno numa linha, e a primeira versão («Gareth não está lá: fora do
   turno, a tratar de família; costuma estar lá desde as onze da manhã», 95
   caracteres) apertou o verbo a «Ir até a Espada …» e cortou-se a si mesma
   em «…desde as onz…» (medido no navegador, 800 px, 04/11). Onde a pessoa
   anda já tem o seu cartão quando é um sítio; o resto é a hora. */
export const OS_SITIOS_COMO_CARTOES = Object.freeze({
  /* «até» não pede o artigo que o nome não traz («Catedral da Cinza»):
     «Ir a Catedral» seria erro, e «à» seria um palpite de género */
  oferta: "Ir até {L}",
  esta: "{N} está lá",
  /* de folga, ou fora do turno, no sítio da rotina (O_FORA_COM_SITIO) */
  fora: Object.freeze({ folga: "{N} está lá, de folga", fora: "{N} está lá, fora do turno" }),
  /* quem guarda o sítio de um `revelar` */
  guarda: "{N} está lá, de guarda",
  naoEsta: "{N} não está lá agora",
  deFolga: "{N} está de folga hoje",
  chega: "{N} só chega {I}",
  /* o sítio de um `revelar` sem ninguém do passo */
  semGente: "aonde «{T}» leva",
  /* de que sítios da lista: os cômodos são do prédio, e o prédio já tem o seu */
  de: Object.freeze(["dentro", "arredores"]),
  /* quantos, no máximo: a soleira corta o resto, e o «+N» mostra-o */
  teto: 3,
  /* o comprimento do retorno com um nome de dois termos: a 800 px cabiam
     ~85 caracteres ao lado de um verbo já apertado; 45 deixa o verbo inteiro */
  tetoDoRetorno: 45,
});

const comArtigoMinusculo = (nome) => limpo(nome).replace(/^(O|A|Os|As)\s/, (m) => m.toLowerCase());
const mesmoNome = (a, b) => !!semArtigo(a) && semArtigo(a) === semArtigo(b);

/* o estado de quem chegasse ao sítio pelo passo que o toque vai dar */
function aChegada(e, s) {
  let passo = null;
  try { passo = oPassoNaCidade(e, s); } catch { passo = null; }
  if (!passo || !ehObj(passo.lugar)) return null;
  let E = { ...e, lugar: passo.lugar };
  if (Number.isFinite(e.minuto)) {
    const r = osMinutosAndam(e, passo.minutos);
    E = { ...E, minuto: r.minuto, dia: r.dias ? (Number(e.dia) || 0) + r.dias : e.dia };
  }
  return { E, minutos: passo.minutos };
}

/* se a pessoa ainda conta para o cartão: o passo dela por fazer, ou — quem
   já o deu — o passo seguinte ainda por perguntar */
function conta(p, ms) {
  if (!p.dado) return true;
  const m = ms.find((q) => ehObj(q) && q.id === p.missao);
  const et = m && Number.isInteger(p.seguinte) ? arr(m.etapas)[p.seguinte] : null;
  return ehObj(et) && !et.feito && !et.perguntada && arr(p.sabe).length > 0;
}

function oQueDiz(p) {
  const P = OS_SITIOS_COMO_CARTOES;
  if (p.aqui) {
    if (p.de === "guarda") return tpl(P.guarda, { N: p.nome });
    if (p.fora && P.fora[p.fora]) return tpl(P.fora[p.fora], { N: p.nome });
    return tpl(P.esta, { N: p.nome });
  }
  if (p.deFolga) return tpl(P.deFolga, { N: p.nome });
  /* «a» + «as onze da manhã» = «às onze da manhã» (contrair, lugar.js) */
  if (Number.isFinite(p.volta)) return tpl(P.chega, { N: p.nome, I: contrair(`a ${aHoraDita(p.volta)} `).trim() });
  return tpl(P.naoEsta, { N: p.nome });
}

/* a chave do que a resposta lê: o que muda de turno para turno */
function aChave(e, sitios) {
  try {
    const l = ehObj(e.lugar) ? [e.lugar.nome, e.lugar.cidade, e.lugar.dentroDe] : null;
    return JSON.stringify([e.nomeCampanha, e.cidadeAtual, l, e.dia, e.minuto, !!e.jornada, !!e.masmorra, !!e.combate,
      e.missoes, e.npcs, ehObj(e.abertura) ? e.abertura.principalId : null, ehObj(e.mundo) ? e.mundo.genero : null,
      arr(sitios).map((s) => (ehObj(s) ? [s.nome, s.onde, s.minutos] : null))]);
  } catch { return null; }
}
let guardada = { chave: null, valor: null };

export function osSitiosComoCartoes(estado, sitios) {
  const e = ehObj(estado) ? estado : {};
  const chave = aChave(e, sitios);
  if (chave && guardada.chave === chave) return guardada.valor;
  const valor = Object.freeze(osCartoes(e, arr(sitios)).map((c) => Object.freeze(c)));
  if (chave) guardada = { chave, valor };
  return valor;
}

function osCartoes(e, sitios) {
  if (!limpo(e.cidadeAtual) || ehObj(e.jornada) || ehObj(e.masmorra) || e.combate) return [];
  let ms = [];
  try { ms = garantirMissoes(e.missoes).filter((m) => ehObj(m) && m.status === "ativa"); } catch { ms = []; }
  if (!ms.length) return [];
  const P = OS_SITIOS_COMO_CARTOES;
  const aqui = ehObj(e.lugar) ? [e.lugar.nome, e.lugar.dentroDe].filter((x) => limpo(x)) : [];
  const vale = sitios.filter((s) => ehObj(s) && limpo(s.nome) && P.de.includes(str(s.onde)) && !aqui.some((a) => mesmoNome(a, s.nome)));
  const unicos = vale.filter((s, i) => vale.findIndex((x) => mesmoNome(x.nome, s.nome)) === i);
  /* quem está em cada sítio, à hora da chegada */
  const achados = [];
  for (const s of unicos) {
    const ch = aChegada(e, s);
    if (!ch) continue;
    let gente = [];
    try { gente = aPessoaDoPasso(ch.E); } catch { gente = []; }
    for (const p of arr(gente)) if (ehObj(p) && conta(p, ms)) achados.push({ s, minutos: ch.minutos, p });
  }
  /* quem um passo procura vem antes de quem só guarda um sítio: um sítio
     tem um cartão, e o que ele diz é de quem o jogador vai lá procurar */
  achados.sort((x, y) => (x.p.de === "guarda") - (y.p.de === "guarda"));
  const out = [];
  /* quem está com o herói já não tem cartão: está aqui */
  const usado = new Set();
  try { for (const p of arr(aPessoaDoPasso(e))) if (ehObj(p) && p.aqui) usado.add(sem(p.nome)); } catch { /* sem ninguém aqui */ }
  const poe = (s, minutos, diz, quem) => {
    const id = `sitio|${limpo(s.nome)}`;
    if (!diz || out.some((c) => c.id === id) || out.length >= P.teto) return;
    out.push({ id, nome: limpo(s.nome), oferta: tpl(P.oferta, { L: comArtigoMinusculo(s.nome) }), diz, minutos, alvo: s, quem: quem || "" });
  };
  /* 1. onde está agora quem um passo procura */
  for (const a of achados) {
    if (!a.p.aqui || usado.has(sem(a.p.nome))) continue;
    usado.add(sem(a.p.nome));
    poe(a.s, a.minutos, oQueDiz(a.p), a.p.nome);
  }
  /* 2. o sítio que um `revelar` de agora manda descobrir, nesta cidade */
  for (const m of ms) {
    const et = etapaAtual(m);
    if (!ehObj(et) || et.tipo !== "revelar") continue;
    const md = moradaDe(limpo(et.onde) || limpo(et.alvo));
    if (md.cidade && !mesmoNome(md.cidade, e.cidadeAtual)) continue;
    const s = unicos.find((x) => mesmoNome(x.nome, md.lugar));
    if (!s) continue;
    const ch = aChegada(e, s);
    if (ch) poe(s, ch.minutos, tpl(P.semGente, { T: limpo(m.titulo) }), "");
  }
  /* 3. o posto de quem não está lá, com o porquê */
  for (const a of achados) {
    if (a.p.aqui || usado.has(sem(a.p.nome))) continue;
    usado.add(sem(a.p.nome));
    poe(a.s, a.minutos, oQueDiz(a.p), a.p.nome);
  }
  return out;
}
