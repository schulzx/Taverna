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
import { oSitioDoRegisto, aHoraDita } from "./a-pessoa-do-passo.js";
import { contrair } from "../lugar.js";

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
  /* a 2.ª leva (04/11): a luta e a habilidade vêm à frente (são o ato
     inteiro da frase); quem não está aqui e a espera só valem sozinhos */
  ordem: Object.freeze(["agressao", "habilidade", "masmorra", "seguir", "viagem", "passo", "ausente", "espera", "sono", "pagar", "compra", "venda"]),
  /* o glifo de cada um (ui.jsx; a forma é a da casa) */
  glifo: Object.freeze({ agressao: "espada", habilidade: "faiscas", passo: "alfinete", ausente: "alfinete", viagem: "mapa", seguir: "mapa", masmorra: "mapa", espera: "ampulheta", sono: "ampulheta", pagar: "bolsa", compra: "bolsa", venda: "bolsa" }),
  /* o que o botão faz, no App: «turno» é a frase pelo turno de sempre; os
     outros têm executor próprio (o veredito do crime já visto, a habilidade
     pela porta da ficha, o relógio, o «ir» da planta) */
  faz: Object.freeze({ agressao: "atacar", habilidade: "habilidade", ausente: "ir", espera: "esperar" }),
  /* a luta é sem volta: a cor do perigo, não a do convite */
  semVolta: Object.freeze(["agressao"]),
  verbo: Object.freeze({
    /* «até» não pede o artigo que o nome não traz («Catedral da Cinza») */
    passo: "Ir até {L}",
    viagem: "Partir para {D}",
    seguir: "Seguir para {D}",
    masmorra: "Ir até {L}",
    masmorraSemNome: "Entrar",
    sono: Object.freeze({ longo: "Dormir", curto: "Descansar um pouco" }),
    compra: "Comprar {I}",
    agressao: "Atacar {N}",
    habilidade: "Usar {N}",
    ausente: "Ir até {L}",
    ausenteSemSitio: "{N} não está aqui",
    espera: "Esperar",
    esperaAte: "Esperar até {H}",
    pagar: "Pagar {I}",
    pagarQuantia: "Pagar ◉ {T}",
    venda: "Vender {I}",
  }),
  /* o botão que confirma — curto, o verbo de mesa */
  confirmar: Object.freeze({ passo: "Ir", viagem: "Partir", seguir: "Seguir", masmorra: "Ir", sono: Object.freeze({ longo: "Dormir", curto: "Descansar" }), compra: "Comprar",
    agressao: "Atacar", habilidade: "Usar", ausente: "Ir", ausenteSemSitio: "Dizer na mesma", espera: "Esperar", pagar: "Pagar", venda: "Vender" }),
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
    abreALuta: "abre a luta",
    pm: "PM {A} → {B}",
    semPM: "falta PM: tem {A}, custa {B}",
    ausente: "{N} não está aqui",
    pagarTotal: "a bolsa fica com ◉ {B}",
    pagarNaoChega: "a bolsa só tem ◉ {B}",
    /* {N} já com a preposição contraída: «à Vela Silenciosa», «a Joric» */
    venda: "{N}: a bolsa fica com ◉ {B}",
  }),
  /* O QUE SE SABE DE ONDE ANDA UMA PESSOA — o mesmo critério do sítio */
  sabeDaPessoa: Object.freeze({
    /* {L} já com a preposição: «no Descanso do Carroceiro», «em Catedral da Cinza» */
    procurar: "«{T}»: procurar {N} {L}",
    trabalha: "{N} trabalha {L}",
    viu: "você conheceu {N} {L}",
  }),
  /* os verbos de ter com alguém (o «procuro» é da porta da procura) */
  chama: /\b(falo|falar|converso|conversar|pergunto|perguntar|chamo|chamar|digo|dizer|peco|pedir|aproximo-me|cumprimento|saudo|vou ter com|interpelo)\b/,
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

/* «em» + o nome, contraído («no Descanso», «na Catedral»); sem artigo, «em» */
const emLugar = (nome) => contrair(`em ${artigoMinusculo(nome)}`);

/* ONDE O HERÓI SABE QUE A PESSOA ANDA: a missão que a manda procurar num
   sítio, a abertura que disse onde trabalha, o registo de onde a conheceu.
     → [{ linha, lugar, cidade }] */
export function oQueSeSabeDaPessoa(estado, nome) {
  const e = ehObj(estado) ? estado : {};
  const N = limpo(nome);
  if (!N) return [];
  const S = A_PROPOSTA_DA_FRASE.sabeDaPessoa;
  const out = [];
  const poe = (modelo, v, onde, cidadeDaFonte) => {
    const md = moradaDe(onde);
    if (!limpo(md.lugar)) return;
    const linha = tpl(modelo, { ...v, N, L: emLugar(md.lugar) });
    out.push({ linha, lugar: limpo(md.lugar), cidade: limpo(md.cidade) || limpo(cidadeDaFonte) });
  };
  let a = null;
  try { a = garantirAbertura(e.abertura); } catch { a = null; }
  const daAbertura = !!(a && !a.legado);
  let ms = [];
  try { ms = garantirMissoes(e.missoes).filter((m) => ehObj(m) && m.status === "ativa"); } catch { ms = []; }
  for (const m of ms) {
    const et = etapaAtual(m);
    if (ehObj(et) && et.tipo === "falar_com" && mesmaPessoa(et.alvo, N) && limpo(et.onde)) poe(S.procurar, { T: limpo(m.titulo) }, et.onde, daAbertura && m.id === a.principalId ? a.cidade : "");
  }
  if (!out.length && daAbertura && ehObj(a.pista) && mesmaPessoa(a.pista.nome, N) && limpo(a.pista.local)) poe(S.trabalha, {}, a.pista.local, a.cidade);
  if (!out.length) {
    const npcs = ehObj(e.npcs) ? e.npcs : {};
    const k = Object.keys(npcs).find((x) => mesmaPessoa(x, N) || (ehObj(npcs[x]) && mesmaPessoa(npcs[x].nome, N)));
    const r = k ? npcs[k] : null;
    if (ehObj(r) && !r.morto && limpo(r.local)) poe(S.viu, {}, oSitioDoRegisto(r.local, e), "");
  }
  return out;
}

/* QUEM A FRASE CHAMA: um nome que o herói conhece, depois de um verbo de ter
   com alguém. `conhecidos`: os nomes; `presentes`: quem está à vista. Só
   devolve quem NÃO está — quem está, a conversa segue sem cartão.
     → { nome } | null */
export function aPessoaChamada(frase, ctx) {
  const c = ehObj(ctx) ? ctx : {};
  const t = sem(frase);
  const P = A_PROPOSTA_DA_FRASE;
  const mv = t.match(P.chama);
  if (!t || t.startsWith("[") || !mv) return null;
  const depois = t.slice(mv.index);
  const presentes = arr(c.presentes).map(limpo).filter(Boolean);
  let achado = null;
  for (const n of arr(c.conhecidos).map(limpo).filter(Boolean)) {
    const inteiro = sem(n), primeiro = inteiro.split(/[\s,]+/)[0];
    const casa = depois.includes(inteiro) ? inteiro.length : primeiro.length >= 4 && new RegExp(`\\b${primeiro}\\b`).test(depois) ? primeiro.length : 0;
    if (casa && (!achado || casa > achado.casa)) achado = { nome: n, casa };
  }
  if (!achado) return null;
  if (presentes.some((p) => mesmaPessoa(p, achado.nome) || sem(p).split(/[\s,]+/)[0] === sem(achado.nome).split(/[\s,]+/)[0])) return null;
  return { nome: achado.nome };
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
  /* A 2.ª LEVA (04/11) */
  if (ehObj(l.agressao) && limpo(l.agressao.nome)) {
    const veredito = limpo(l.agressao.veredito);
    ef.agressao = { verbo: tpl(V.agressao, { N: limpo(l.agressao.nome) }), confirmar: C.agressao, preco: "", minutos: null, linhas: [veredito || LN.abreALuta] };
  }
  if (ehObj(l.habilidade) && limpo(l.habilidade.nome)) {
    const h = l.habilidade;
    const custo = Number(h.custo) || 0, pm = Number(h.pm) || 0;
    const linhas = [];
    if (limpo(h.falta)) linhas.push(limpo(h.falta));
    else if (custo > 0) linhas.push(tpl(LN.pm, { A: pm, B: pm - custo }));
    if (limpo(h.efeito)) linhas.push(limpo(h.efeito));
    ef.habilidade = { verbo: tpl(V.habilidade, { N: limpo(h.nome) }), confirmar: C.habilidade, preco: custo > 0 ? `${custo} PM` : "", minutos: null, linhas, impedido: limpo(h.falta) };
  }
  if (ehObj(l.ausente) && limpo(l.ausente.nome)) {
    const N = limpo(l.ausente.nome);
    let sabe = [];
    try { sabe = oQueSeSabeDaPessoa(e, N); } catch { sabe = []; }
    const aqui = limpo(e.cidadeAtual);
    const sitios = arr(l.ausente.sitios).filter((x) => ehObj(x) && limpo(x.nome));
    const daqui = sabe.find((x) => (!x.cidade || !aqui || mesmoNome(x.cidade, aqui)) && sitios.some((q) => mesmoNome(q.nome, x.lugar)));
    const alvo = daqui ? sitios.find((q) => mesmoNome(q.nome, daqui.lugar)) : null;
    ef.ausente = alvo
      ? { verbo: tpl(V.ausente, { L: artigoMinusculo(alvo.nome) }), confirmar: C.ausente, preco: "", minutos: minutosDe(alvo.minutos), linhas: [tpl(LN.ausente, { N }), ...sabe.map((x) => x.linha)], alvo }
      : { verbo: tpl(V.ausenteSemSitio, { N }), confirmar: C.ausenteSemSitio, preco: "", minutos: null, linhas: sabe.map((x) => x.linha), semSitio: true };
  }
  if (ehObj(l.espera) && (Number(l.espera.minutos) > 0 || arr(l.espera.opcoes).length)) {
    const min = minutosDe(l.espera.minutos);
    const ate = Number.isFinite(Number(l.espera.ate)) && l.espera.ate !== null && l.espera.ate !== undefined ? Number(l.espera.ate) : null;
    ef.espera = { verbo: ate !== null ? tpl(V.esperaAte, { H: aHoraDita(ate) }) : V.espera, confirmar: C.espera, preco: "", minutos: min, linhas: [],
      opcoes: min ? null : arr(l.espera.opcoes).map(minutosDe).filter(Boolean) };
  }
  if (ehObj(l.pagar) && Number(l.pagar.total) > 0) {
    const total = Number(l.pagar.total), bolsa = Number(l.pagar.bolsa) || 0;
    const nomes = arr(l.pagar.itens).map((x) => (ehObj(x) && limpo(x.nome) ? `${Number(x.quantos) > 1 ? `${x.quantos} × ` : ""}${limpo(x.nome)}` : "")).filter(Boolean);
    const chega = total <= bolsa;
    ef.pagar = { verbo: nomes.length ? tpl(V.pagar, { I: nomes.join(", ") }) : tpl(V.pagarQuantia, { T: total }), confirmar: C.pagar, preco: `◉ ${total}`, minutos: null,
      linhas: [chega ? tpl(LN.pagarTotal, { B: bolsa - total }) : tpl(LN.pagarNaoChega, { B: bolsa })], impedido: chega ? "" : tpl(LN.pagarNaoChega, { B: bolsa }) };
  }
  if (ehObj(l.venda) && limpo(l.venda.item)) {
    const v = l.venda;
    const valor = Number(v.valor) || 0, bolsa = Number(v.bolsa) || 0;
    /* `rotulo`: o nome como se diz (sem o aposto); `item`, o da bolsa, é o do executor */
    ef.venda = { verbo: tpl(V.venda, { I: limpo(v.rotulo) || limpo(v.item) }), confirmar: C.venda, preco: valor > 0 ? `◉ +${valor}` : "", minutos: null,
      linhas: limpo(v.motivo) ? [limpo(v.motivo)] : [tpl(LN.venda, { N: contrair(`a ${artigoMinusculo(v.quem)}`), B: bolsa + valor })], impedido: limpo(v.motivo) };
  }
  /* quem não está aqui e a espera só valem sozinhos: juntos de outro ato,
     o turno é desse ato (e a frase vai inteira ao Narrador) */
  for (const so of ["ausente", "espera"]) if (ef[so] && Object.keys(ef).some((k) => k !== so)) delete ef[so];
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
  const juntos = resto.filter((k) => !ef[k].linhaPropria);
  const junto = juntos.map((k) => tpl(P.linhas.junto, { I: ef[k].verbo.charAt(0).toLowerCase() + ef[k].verbo.slice(1) + (ef[k].preco ? ` (${ef[k].preco})` : ef[k].minutos ? ` (${aPeEmTexto(ef[k].minutos)})` : "") }));
  const linhas = [...cabeca.linhas, ...junto].filter(Boolean).slice(0, P.tetoDeLinhas);
  /* o que impede: o primeiro efeito que não pode (a bolsa, o PM) */
  const imp = tipos.map((k) => ef[k].impedido).find((x) => limpo(x)) || "";
  /* o que o App precisa para executar: o que a leitura trouxe de cada efeito */
  const dados = {};
  for (const k of tipos) if (["agressao", "habilidade", "pagar", "venda", "espera"].includes(k)) dados[k] = l[k];
  if (ef.ausente && ef.ausente.alvo) dados.ausente = { nome: limpo(l.ausente.nome), alvo: ef.ausente.alvo };
  return {
    id: aChave(frase), frase, tipo: t0, glifo: P.glifo[t0],
    verbo: cabeca.verbo, confirmar: cabeca.confirmar, preco: cabeca.preco, minutos: cabeca.minutos, linhas, efeitos: tipos,
    faz: ef.ausente && ef.ausente.semSitio ? "turno" : P.faz[t0] || "turno",
    tom: P.semVolta.includes(t0) ? "semVolta" : "convite",
    opcoes: cabeca.opcoes || null,
    impedido: imp,
    dados,
  };
}
