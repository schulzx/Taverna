/* ============================================================
   A PROPOSTA DA FRASE (04/11/2026) — src/motor/a-proposta-da-frase.js

   A ordem da pessoa, 04/11: *"para toda ação que o sistema ainda tem dúvidas
   ou falhas, vamos fazer um botão, mesmo quando ele reconheça a ação… digo
   'vou ao mercado…', mesmo que o sistema reconheça, ele não faz a viagem,
   aparece um card 'ir até o mercado…', e quando se aperta nele, daí aparece
   as informações necessárias e o botão 'ir', e somente informações
   necessárias… não tem como eu saber se fulano está lá se eu não for… então
   só aparecem informações que sei."*

   A FRASE QUE O SISTEMA LÊ COMO ATO IRREVERSÍVEL NÃO AGE: PROPÕE. As sessões
   14–17 mediram o custo de agir pela leitura — «Vou ao Descanso do
   Carroceiro» pôs a heroína a dormir, «Volto ao templo» ficou parada, «Pago a
   sopa» não cobrou. Com a proposta, uma leitura errada custa um cartão que se
   deixa, não uma noite, uma estrada ou a bolsa. E o jogador vê, antes, o que
   a frase vai fazer — o veredito antes do clique, a lei da casa.

   O QUE PROPÕE (as portas que gastam tempo, estrada ou moeda, e que falharam
   por texto): o passo na cidade, a estrada (partir, seguir, a masmorra), o
   sono e a compra. O teste não: o dado JÁ é o botão, com o risco escrito e o
   desistir. A luta, as magias e os frascos ficam com as portas deles — quando
   a frase os acorda, não há proposta (a 2.ª leva).

   O SÍTIO DIZ SÓ O QUE O HERÓI SABE (`oQueSeSabeDoSitio`): a distância (o
   herói vê a cidade); quem a abertura disse que lá trabalha; o que uma missão
   ativa manda lá fazer; e quem ele já viu lá, com o dia. Nunca a hora a que
   alguém está, nem se está agora: isso só se sabe indo.

   O App LÊ (os mesmos detectores e as mesmas contas das portas, na mesma
   ordem) e dá aqui a leitura; esta peça só compõe. Ao confirmar, o App corre
   o turno de sempre com a mesma frase — nenhum caminho paralelo, logo o que
   o cartão diz é o que o turno faz.

     aPropostaDaFrase(leitura, estado) → null | {
       id, frase, tipo, glifo, verbo, confirmar, preco, minutos, linhas[], efeitos[] }
       preco:   o que não é tempo (a moeda, a noite); minutos: o tempo, que o
                App diz com o `emTempo` dele (a gramática do resto da tela)
       leitura: { frase,
         acorda?: true      — a frase acorda uma porta que não propõe (luta,
                              magia, frasco…): então nada
         passo?:   { nome, onde, minutos, chamado }
         viagem?:  { destino, dias, falta: { diz } | null }
         seguir?:  { para, minutos, faltam }
         masmorra?:{ nome, linhas[] }
         sono?:    { tipo: "longo"|"curto", preco, retorno }
         compras?: [{ fecha, total, bolsa, itens: [{ nome, quantos }] }] }
     oQueSeSabeDoSitio(estado, sitio) → [linha]

   Puro, sem React. Provado em `testes/teste-a-proposta-da-frase.mjs`.
   ============================================================ */
import { garantirMissoes, etapaAtual, moradaDe } from "../missoes.js";
import { garantirAbertura } from "../abertura.js";
import { aPeEmTexto } from "../coordenadas.js";
import { oSitioDoRegisto } from "./a-pessoa-do-passo.js";

const ehObj = (x) => x != null && typeof x === "object" && !Array.isArray(x);
const arr = (x) => (Array.isArray(x) ? x : []);
const str = (x) => (typeof x === "string" ? x : x == null ? "" : String(x));
const limpo = (x) => str(x).replace(/\s+/g, " ").trim();
const sem = (x) => str(x).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
const semArtigo = (x) => sem(x).replace(/^(o|a|os|as)\s+/, "");
const mesmoNome = (a, b) => !!semArtigo(a) && semArtigo(a) === semArtigo(b);
const mesmaPessoa = (a, b) => { const x = sem(a), y = sem(b); return !!x && !!y && (x === y || x.split(",")[0].trim() === y.split(",")[0].trim()); };
const tpl = (s, v) => str(s).replace(/\{([A-Z])\}/g, (_, k) => (v[k] != null ? v[k] : ""));
const artigoMinusculo = (nome) => limpo(nome).replace(/^(O|A|Os|As)\s/, (m) => m.toLowerCase());
const minutosDe = (x) => (Number.isFinite(Number(x)) && Number(x) > 0 ? Math.round(Number(x)) : null);

/* COMO A PROPOSTA O DIZ. {L} o sítio, {D} o destino, {N} quem, {P} o papel,
   {T} o título da missão, {A} o alvo da etapa, {M} os minutos ditos, {X} os
   dias, {I} os itens, {B} a bolsa, {F} os avanços que faltam. */
export const A_PROPOSTA_DA_FRASE = Object.freeze({
  /* a ordem em que a proposta se titula: o movimento manda (é o que muda a
     cena), depois o sono, depois a moeda; os outros efeitos vão nas linhas */
  ordem: Object.freeze(["masmorra", "seguir", "viagem", "passo", "sono", "compra"]),
  /* o glifo de cada um (ui.jsx; a forma é a da casa) */
  glifo: Object.freeze({ passo: "alfinete", viagem: "mapa", seguir: "mapa", masmorra: "mapa", sono: "ampulheta", compra: "bolsa" }),
  verbo: Object.freeze({
    /* «até» não pede o artigo que o nome não traz («Catedral da Cinza») */
    passo: "Ir até {L}",
    viagem: "Partir para {D}",
    seguir: "Seguir para {D}",
    masmorra: "Ir até {L}",
    masmorraSemNome: "Entrar",
    sono: Object.freeze({ longo: "Dormir", curto: "Descansar um pouco" }),
    compra: "Comprar {I}",
  }),
  /* o botão que confirma — curto, o verbo de mesa */
  confirmar: Object.freeze({ passo: "Ir", viagem: "Partir", seguir: "Seguir", masmorra: "Ir", sono: Object.freeze({ longo: "Dormir", curto: "Descansar" }), compra: "Comprar" }),
  linhas: Object.freeze({
    /* {M} é a gramática do «▸ ir» (aPeEmTexto, coordenadas.js): «5 min a pé» */
    dentro: "dentro dos muros, a {M}",
    arredores: "fora dos muros, a {M}",
    comodo: "aqui dentro, a um passo",
    dias: "{X} de estrada",
    faltam: "faltam {F} na estrada",
    compraTotal: "◉ {T} · a bolsa fica com ◉ {B}",
    /* um efeito que vem junto, dito depois do título */
    junto: "e {I}",
  }),
  /* O QUE SE SABE DO SÍTIO — só o que o herói ouviu ou viu */
  sabe: Object.freeze({
    trabalha: "{N}{P} trabalha aqui",
    procurar: "«{T}»: procurar {A} aqui",
    revelar: "«{T}»: o que este sítio esconde",
    viuHoje: "você viu {N} aqui hoje",
    viu: "você conheceu {N} aqui",
  }),
  /* quantas linhas, no máximo: «somente informações necessárias» */
  tetoDeLinhas: 4,
});

/* O QUE O HERÓI SABE DO SÍTIO. A abertura disse onde a pista trabalha; as
   missões ativas dizem o que lá se faz (a etapa de agora, a que o diário
   mostra); o registo diz quem ele lá conheceu. A cidade conta: o Descanso de
   Vale Verde não é o de Torre Alto. */
export function oQueSeSabeDoSitio(estado, sitio) {
  const e = ehObj(estado) ? estado : {};
  const s = ehObj(sitio) ? sitio : { nome: str(sitio) };
  const L = limpo(s.nome);
  if (!L) return [];
  const cidade = limpo(s.cidade) || limpo(e.cidadeAtual);
  const naCidade = (onde, cidadeDaFonte) => {
    const md = moradaDe(onde);
    if (!mesmoNome(md.lugar, L)) return false;
    const c = limpo(md.cidade) || limpo(cidadeDaFonte);
    return !c || !cidade || mesmoNome(c, cidade);
  };
  const S = A_PROPOSTA_DA_FRASE.sabe;
  const out = [];
  const ditos = new Set();
  const poe = (linha, nome) => { if (linha && !out.includes(linha)) out.push(linha); if (nome) ditos.add(sem(nome)); };
  let a = null;
  try { a = garantirAbertura(e.abertura); } catch { a = null; }
  const daAbertura = !!(a && !a.legado);
  /* primeiro o que as missões mandam lá fazer (é o porquê de ir); a etapa da
     principal sem cidade é da cidade onde a abertura começa */
  let ms = [];
  try { ms = garantirMissoes(e.missoes).filter((m) => ehObj(m) && m.status === "ativa"); } catch { ms = []; }
  for (const m of ms) {
    const et = etapaAtual(m);
    if (!ehObj(et)) continue;
    const onde = limpo(et.onde) || (et.tipo === "revelar" ? limpo(et.alvo) : "");
    if (!onde || !naCidade(onde, daAbertura && m.id === a.principalId ? a.cidade : "")) continue;
    if (et.tipo === "falar_com" && limpo(et.alvo)) poe(tpl(S.procurar, { T: limpo(m.titulo), A: limpo(et.alvo) }), et.alvo);
    else if (et.tipo === "revelar") poe(tpl(S.revelar, { T: limpo(m.titulo) }));
  }
  /* quem a abertura disse que lá trabalha — se a missão já não o disse */
  if (daAbertura && ehObj(a.pista) && limpo(a.pista.nome) && ![...ditos].some((d) => mesmaPessoa(d, a.pista.nome)) && naCidade(a.pista.local, a.cidade)) {
    poe(tpl(S.trabalha, { N: limpo(a.pista.nome), P: limpo(a.pista.papel) ? `, ${limpo(a.pista.papel)},` : "" }), a.pista.nome);
  }
  const npcs = ehObj(e.npcs) ? e.npcs : {};
  for (const [k, r] of Object.entries(npcs)) {
    if (!ehObj(r) || r.morto || !limpo(r.local)) continue;
    const nome = limpo(r.nome) || k;
    if ([...ditos].some((d) => mesmaPessoa(d, nome))) continue;
    /* o registo grava «Sítio, Cidade» (npcs.js, localComCidade) */
    if (!naCidade(oSitioDoRegisto(r.local, e), "")) continue;
    poe(tpl(Number(r.conhecidoEm) === Number(e.dia) ? S.viuHoje : S.viu, { N: nome }), nome);
  }
  return out;
}

/* os efeitos da leitura, cada um com o verbo, o botão, o preço e as linhas */
function osEfeitos(l, e) {
  const P = A_PROPOSTA_DA_FRASE;
  const V = P.verbo, C = P.confirmar, LN = P.linhas;
  const ef = {};
  if (ehObj(l.masmorra)) {
    const n = limpo(l.masmorra.nome);
    ef.masmorra = { verbo: n ? tpl(V.masmorra, { L: artigoMinusculo(n) }) : V.masmorraSemNome, confirmar: C.masmorra, preco: "", minutos: null, linhas: arr(l.masmorra.linhas).map(limpo).filter(Boolean) };
  }
  if (ehObj(l.seguir) && limpo(l.seguir.para)) {
    const f = Number(l.seguir.faltam);
    ef.seguir = { verbo: tpl(V.seguir, { D: limpo(l.seguir.para) }), confirmar: C.seguir, preco: "", minutos: minutosDe(l.seguir.minutos),
      linhas: Number.isFinite(f) && f > 0 ? [tpl(LN.faltam, { F: f === 1 ? "1 avanço" : `${f} avanços` })] : [] };
  }
  if (ehObj(l.viagem) && limpo(l.viagem.destino)) {
    const d = Number(l.viagem.dias);
    const linhas = [];
    if (Number.isFinite(d) && d > 0) linhas.push(tpl(LN.dias, { X: d === 1 ? "1 dia" : `${d} dias` }));
    if (ehObj(l.viagem.falta) && limpo(l.viagem.falta.diz)) linhas.push(limpo(l.viagem.falta.diz));
    ef.viagem = { verbo: tpl(V.viagem, { D: limpo(l.viagem.destino) }), confirmar: C.viagem, preco: "", minutos: null, linhas };
  }
  if (ehObj(l.passo) && limpo(l.passo.nome)) {
    const min = Number(l.passo.minutos) || 0;
    const onde = str(l.passo.onde);
    const longe = onde === "comodo" ? LN.comodo : tpl(onde === "arredores" ? LN.arredores : LN.dentro, { M: aPeEmTexto(min) });
    let sabe = [];
    try { sabe = oQueSeSabeDoSitio(e, l.passo); } catch { sabe = []; }
    ef.passo = { verbo: tpl(V.passo, { L: artigoMinusculo(l.passo.nome) }), confirmar: C.passo, preco: "", minutos: minutosDe(min), linhas: [longe, ...sabe] };
  }
  if (ehObj(l.sono) && (l.sono.tipo === "longo" || l.sono.tipo === "curto")) {
    ef.sono = { verbo: V.sono[l.sono.tipo], confirmar: C.sono[l.sono.tipo], preco: limpo(l.sono.preco), minutos: null, linhas: limpo(l.sono.retorno) ? [limpo(l.sono.retorno)] : [] };
  }
  const compras = arr(l.compras).filter((c) => ehObj(c) && c.fecha && arr(c.itens).length);
  if (compras.length) {
    const itens = compras.flatMap((c) => arr(c.itens)).map((x) => (ehObj(x) ? `${Number(x.quantos) > 1 ? `${x.quantos} × ` : ""}${limpo(x.nome)}` : "")).filter(Boolean);
    const total = compras.reduce((n, c) => n + (Number(c.total) || 0), 0);
    const bolsa = Number(compras[0].bolsa) || 0;
    ef.compra = { verbo: tpl(V.compra, { I: itens.join(", ") }), confirmar: C.compra, preco: `◉ ${total}`, minutos: null, linhas: [tpl(LN.compraTotal, { T: total, B: bolsa - total })] };
  }
  /* a estrada e o passo não andam juntos: quem parte não passeia antes */
  if (ef.masmorra || ef.seguir || ef.viagem) delete ef.passo;
  if (ef.masmorra) { delete ef.seguir; delete ef.viagem; }
  return ef;
}

const aChave = (frase) => `proposta|${sem(frase).slice(0, 80)}`;

export function aPropostaDaFrase(leitura, estado) {
  const l = ehObj(leitura) ? leitura : {};
  const frase = limpo(l.frase);
  if (!frase || l.acorda) return null;
  const e = ehObj(estado) ? estado : {};
  const P = A_PROPOSTA_DA_FRASE;
  let ef = {};
  try { ef = osEfeitos(l, e); } catch { ef = {}; }
  const tipos = P.ordem.filter((k) => ef[k]);
  if (!tipos.length) return null;
  const [t0, ...resto] = tipos;
  const cabeca = ef[t0];
  const junto = resto.map((k) => tpl(P.linhas.junto, { I: ef[k].verbo.charAt(0).toLowerCase() + ef[k].verbo.slice(1) + (ef[k].preco ? ` (${ef[k].preco})` : ef[k].minutos ? ` (${aPeEmTexto(ef[k].minutos)})` : "") }));
  const linhas = [...cabeca.linhas, ...junto].filter(Boolean).slice(0, P.tetoDeLinhas);
  return {
    id: aChave(frase), frase, tipo: t0, glifo: P.glifo[t0],
    verbo: cabeca.verbo, confirmar: cabeca.confirmar, preco: cabeca.preco, minutos: cabeca.minutos, linhas, efeitos: tipos,
  };
}
