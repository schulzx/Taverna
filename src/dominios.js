/* ============================================================
   O GOVERNO (v9.139) — governar um domínio, e não assistir a ele

   O sistema de domínios existia desde a v6.5 e era honesto no que fazia:
   renda por tipo de cidade, população e felicidade vivas, eventos de reino
   por tabela, zero tokens. Mas era um PAINEL, não um governo. Abrindo a
   aba, o jogador via números subirem e desceram e não tinha **um único
   botão**. A felicidade derivava sozinha para 55, os eventos aconteciam com
   ele, e a única decisão possível era erguer um templo — que é do sistema
   de devoção, e só existe para quem despertou uma divindade.

   Quatro coisas faltavam, e cada uma é uma decisão de verdade:

     · O IMPOSTO. A escolha central de quem governa, e ela dói dos dois
       lados: cobrar mais enche o cofre e esvazia a paciência do povo.
     · AS OBRAS. Dinheiro parado não faz nada; obra feita muda um número
       que o resto do sistema já lê — inclusive o preço na praça.
     · O CUSTEIO. Sem conta a pagar, domínio é só renda, e nenhuma decisão
       sobre dinheiro tem peso. Guarnição e obras custam por dia.
     · O GOVERNADOR. E é aqui que isto encontra a índole: quem você põe no
       lugar tem traços, e um deles é traidor.

   E a consequência que faltava: uma cidade revoltada agora SAI. Sem isso,
   "murmúrios de revolta" era um evento que baixava um número e nada mais —
   e um reino que não pode ser perdido não é um reino, é um placar.
   ============================================================ */

import { indoleDe } from "./indole.js";
import { vocacaoDe, generoPorId } from "./comercio.js";

/* ---------------- O IMPOSTO ----------------
   Três degraus, e cada um é uma troca. O do meio não é "o certo": é o que
   não mexe em nada, e por isso o jogador tem de escolher de verdade. */
export const IMPOSTOS = [
  { id: "brando", nome: "brando", o: "cobra pouco e o povo respira", renda: 0.7, felicidade: +8, icone: "🕊" },
  { id: "justo", nome: "justo", o: "o de sempre; ninguém reclama nem agradece", renda: 1.0, felicidade: 0, icone: "⚖" },
  { id: "pesado", nome: "pesado", o: "enche o cofre e gasta a paciência", renda: 1.45, felicidade: -12, icone: "⛓" },
];
export const impostoPorId = (id) => IMPOSTOS.find((x) => x.id === id) || IMPOSTOS[1];

/* ---------------- AS OBRAS ----------------
   Cada obra custa do cofre, leva dias e muda ALGUMA COISA QUE O SISTEMA JÁ
   LÊ. Obra que só dá um bônus abstrato de renda é um botão que imprime
   ouro; estas mexem em felicidade de equilíbrio, em custeio, no que a
   cidade produz e no que pode acontecer com ela.

   `impede` é a lista de eventos de reino que aquela obra passa a barrar —
   é a forma mais concreta de uma construção existir: o celeiro não dá
   pontos, o celeiro faz a praga nos celeiros parar de acontecer. */
export const OBRAS = [
  {
    id: "celeiro", nome: "Celeiro de pedra", icone: "🌾",
    o: "grão seco e guardado contra o ano ruim",
    custo: 220, dias: 6, custeio: 1,
    equilibrio: +6, impede: ["praga"],
    porque: "com o que comer guardado, a fome deixa de ser um evento",
  },
  {
    id: "muralha", nome: "Muralha", icone: "🧱",
    o: "pedra em volta, e um portão que fecha",
    custo: 600, dias: 14, custeio: 3,
    equilibrio: +4, impede: ["boato"], defesa: 2,
    porque: "quem dorme atrás de pedra não repete boato de guerra",
  },
  {
    id: "quartel", nome: "Quartel", icone: "🛡",
    o: "gente armada, paga e aquartelada aqui",
    custo: 400, dias: 10, custeio: 6,
    equilibrio: +2, impede: ["crime"], defesa: 3,
    porque: "ronda na rua acaba com onda de furto — e soldado come todo dia",
  },
  {
    id: "poco", nome: "Poço e chafariz", icone: "⛲",
    o: "água limpa no meio da praça",
    custo: 150, dias: 4, custeio: 1,
    equilibrio: +7, impede: [],
    porque: "é a obra que o povo vê todo dia, e é por isso que ela vale",
  },
  {
    id: "casa-de-oficio", nome: "Casa de ofício", icone: "⚒",
    o: "oficina, aprendizes e um mestre pago pela cidade",
    custo: 500, dias: 12, custeio: 4,
    equilibrio: +3, impede: ["disputa"], produz: true,
    porque: "a cidade passa a fabricar o que só extraía — e a praça sente no preço",
  },
  {
    id: "estrada", nome: "Estrada calçada", icone: "🛣",
    o: "pedra assentada até a próxima vila",
    custo: 350, dias: 9, custeio: 2,
    equilibrio: +2, impede: [], renda: 0.15,
    porque: "caravana que chega inteira volta mais vezes",
  },
];
export const obraPorId = (id) => OBRAS.find((o) => o.id === id) || null;

/* ---------------- O ESTADO DE UM DOMÍNIO ----------------
   Só o que é DECISÃO fica guardado: o imposto que você escolheu, as obras
   feitas, a obra em andamento, quem governa e há quantos dias a cidade
   está furiosa. População e felicidade continuam em `reino.js`, que é de
   quem elas sempre foram. */
export function garantirGoverno(g) {
  const o = g && typeof g === "object" ? g : {};
  return {
    imposto: impostoPorId(o.imposto).id,
    obras: Array.isArray(o.obras) ? o.obras.filter((x) => !!obraPorId(x)) : [],
    obrando: o.obrando && o.obrando.id && obraPorId(o.obrando.id)
      ? { id: o.obrando.id, desde: Number(o.obrando.desde) || 0 }
      : null,
    governador: typeof o.governador === "string" ? o.governador.slice(0, 40) : "",
    furiaDesde: Number(o.furiaDesde) || 0,
  };
}

export function garantirGovernos(governos, mapa) {
  const dominios = ((mapa && mapa.cidades) || []).filter((c) => c.relacao === "jogador");
  const out = {};
  for (const c of dominios) out[c.nome] = garantirGoverno((governos || {})[c.nome]);
  return out;
}

/* ---------------- O GOVERNADOR, E A ÍNDOLE DELE ----------------
   Este é o encontro que faltava. Desde a v9.136 toda pessoa do mundo nasce
   com traços, e um deles é `traidor` — mas isso só chegava à fala. Um
   domínio é o lugar onde ter posto um traidor no comando CUSTA.

   O efeito é pequeno de propósito. Um governador não é um multiplicador de
   império: é um dedo na balança, e uma razão para você se importar com
   quem é aquela pessoa. */
/* TODO TRAÇO GOVERNA DE ALGUM JEITO. A primeira versão desta tabela cobria
   dez dos dezessete traços, e a sonda no jogo pegou o resultado: em 600
   nomeações, 164 governadores não faziam NADA — o jogador punha alguém no
   comando, o painel não dizia uma linha, e aquilo lia como recurso quebrado
   e não como "esta pessoa governa sem deixar marca". Se a índole vale, ela
   vale inteira: os dezessete estão aqui, e uma prova quebra se nascer um
   décimo oitavo sem cadeira. */
export const MANDO = {
  fiel:        { renda: 0,     felicidade: +5, o: "não desvia nada, e o povo sabe" },
  traidor:     { renda: -0.12, felicidade: -2, o: "desvia o que dá para desviar" },
  ganancioso:  { renda: +0.10, felicidade: -6, o: "aperta mais do que você mandou" },
  cruel:       { renda: +0.05, felicidade: -10, o: "resolve tudo com medo" },
  compassivo:  { renda: -0.05, felicidade: +8, o: "perdoa dívida que não devia" },
  orgulhoso:   { renda: 0,     felicidade: -3, o: "não ouve conselho de ninguém daqui" },
  corajoso:    { renda: 0,     felicidade: +3, o: "aparece onde há problema" },
  humilde:     { renda: 0,     felicidade: +4, o: "come o que o povo come" },
  calado:      { renda: 0,     felicidade: -1, o: "governa sem explicar nada" },
  tagarela:    { renda: 0,     felicidade: +2, o: "conta tudo na praça, para o bem e para o mal" },
  medroso:     { renda: -0.05, felicidade: -2, o: "não enfrenta os poderosos daqui, e eles sabem" },
  galanteador: { renda: 0,     felicidade: +3, o: "é bem-quisto, e isso abre portas que a ordem não abre" },
  medonho:     { renda: +0.03, felicidade: -5, o: "ninguém discute com ele duas vezes" },
  generoso:    { renda: -0.08, felicidade: +9, o: "dá do cofre da cidade sem perguntar a você" },
  curioso:     { renda: +0.04, felicidade: -2, o: "mexe no que estava quieto, e nem tudo gosta de ser mexido" },
  supersticioso: { renda: -0.04, felicidade: +4, o: "para a cidade em dia santo, e o povo agradece" },
  rancoroso:   { renda: +0.04, felicidade: -7, o: "cobra dívida velha de quem já tinha esquecido" },
};

export function efeitoDoGovernador(semente, nome) {
  if (!nome) return { renda: 0, felicidade: 0, linhas: [], indole: null };
  const ind = indoleDe(semente, { nome });
  const linhas = [];
  let renda = 0, felicidade = 0;
  for (const t of ind.tracos || []) {
    const m = MANDO[t];
    if (!m) continue;
    renda += m.renda; felicidade += m.felicidade;
    linhas.push(`${t}: ${m.o}`);
  }
  return { renda, felicidade, linhas, indole: ind };
}

/* ---------------- O QUE ENTRA E O QUE SAI ----------------
   Um lugar só para a conta. Antes a renda saía de `gestao.js` e nada saía
   de lugar nenhum — não havia despesa. Domínio sem conta a pagar é só
   renda, e nenhuma decisão sobre dinheiro pesa. */
export function custeioDe(gov) {
  const g = garantirGoverno(gov);
  return g.obras.reduce((s, id) => s + ((obraPorId(id) || {}).custeio || 0), 0);
}

export function bonusDeObras(gov) {
  const g = garantirGoverno(gov);
  let renda = 0, equilibrio = 0, defesa = 0;
  const impede = new Set();
  for (const id of g.obras) {
    const o = obraPorId(id); if (!o) continue;
    renda += o.renda || 0;
    equilibrio += o.equilibrio || 0;
    defesa += o.defesa || 0;
    for (const e of o.impede || []) impede.add(e);
  }
  return { renda, equilibrio, defesa, impede };
}

/* A conta de uma cidade, aberta linha a linha. O painel mostra isto; o
   cofre recebe o `liquido`. Se os dois discordarem é porque alguém fez a
   conta duas vezes — e por isso ela é feita aqui, uma vez. */
export function contaDoDominio({ semente, cidade, gov, rendaBase, felicidade = 55 }) {
  const g = garantirGoverno(gov);
  const imp = impostoPorId(g.imposto);
  const ob = bonusDeObras(g);
  const gvn = efeitoDoGovernador(semente, g.governador);
  const linhas = [];
  let renda = rendaBase;
  linhas.push({ o: `${(cidade && cidade.tipo) || "cidade"}`, v: Math.round(rendaBase) });
  if (imp.renda !== 1) { renda *= imp.renda; linhas.push({ o: `imposto ${imp.nome}`, v: Math.round(rendaBase * (imp.renda - 1)) }); }
  if (ob.renda) { const d = renda * ob.renda; renda += d; linhas.push({ o: "obras", v: Math.round(d) }); }
  if (gvn.renda) { const d = renda * gvn.renda; renda += d; linhas.push({ o: `governador`, v: Math.round(d) }); }
  const custeio = custeioDe(g);
  if (custeio) linhas.push({ o: "custeio", v: -custeio });
  return {
    bruta: Math.round(renda),
    custeio,
    liquido: Math.round(renda) - custeio,
    linhas,
    imposto: imp,
    obras: ob,
    governador: gvn,
    felicidade,
  };
}

/* ---------------- A FELICIDADE DE EQUILÍBRIO ----------------
   `reino.js` já puxa a felicidade para um alvo por dia; até aqui esse alvo
   era 55 fixo (mais o templo). Agora ele responde ao que você FEZ: imposto,
   obras e quem governa. É o que transforma a aba em governo — a decisão de
   hoje aparece na cidade daqui a alguns dias, e não no mesmo instante. */
export const EQUILIBRIO_BASE = 55;

export function equilibrioDe({ semente, gov }) {
  const g = garantirGoverno(gov);
  return Math.max(0, Math.min(100,
    EQUILIBRIO_BASE
    + impostoPorId(g.imposto).felicidade
    + bonusDeObras(g).equilibrio
    + efeitoDoGovernador(semente, g.governador).felicidade));
}

/* ---------------- A OBRA EM ANDAMENTO ----------------
   Obra leva dias. Uma construção que fica pronta no clique é um item de
   loja, não uma obra — e o tempo é a única coisa que faz o jogador
   escolher qual fazer primeiro. */
export function podeErguer(gov, obraId, { cofre = 0 } = {}) {
  const g = garantirGoverno(gov);
  const o = obraPorId(obraId);
  if (!o) return { pode: false, motivo: "essa obra não existe" };
  if (g.obras.includes(obraId)) return { pode: false, motivo: "já está de pé" };
  if (g.obrando) return { pode: false, motivo: `os pedreiros estão na ${(obraPorId(g.obrando.id) || {}).nome || "obra"}` };
  if (cofre < o.custo) return { pode: false, motivo: `faltam ◉ ${o.custo - cofre} no cofre` };
  return { pode: true, motivo: "", obra: o };
}

export function comecarObra(gov, obraId, dia) {
  return { ...garantirGoverno(gov), obrando: { id: obraId, desde: dia || 1 } };
}

/* Devolve a obra terminada, ou null. Quem paga o dia é o App. */
export function obraPronta(gov, dia) {
  const g = garantirGoverno(gov);
  if (!g.obrando) return null;
  const o = obraPorId(g.obrando.id);
  if (!o) return null;
  return (dia - g.obrando.desde) >= o.dias ? o : null;
}

export function terminarObra(gov) {
  const g = garantirGoverno(gov);
  if (!g.obrando) return g;
  return { ...g, obras: [...g.obras, g.obrando.id], obrando: null };
}

/* ---------------- A REVOLTA ----------------
   O evento "murmúrios de revolta" existia desde a v6.5 e não levava a nada:
   baixava a felicidade e a felicidade voltava a subir sozinha. Um reino que
   não pode ser perdido não é um reino, é um placar.

   Agora a fúria conta os dias. E ela avisa antes — a cidade não some de
   surpresa: o jogador vê o prazo, e tem esse prazo para baixar o imposto,
   erguer alguma coisa ou trocar quem manda. */
export const FURIA_ABAIXO_DE = 25;
export const DIAS_ATE_A_REVOLTA = 8;

export function pulsoDaFuria(gov, felicidade, dia) {
  const g = garantirGoverno(gov);
  if (felicidade >= FURIA_ABAIXO_DE) return g.furiaDesde ? { ...g, furiaDesde: 0 } : g;
  return g.furiaDesde ? g : { ...g, furiaDesde: dia };
}

export function revoltaAgora(gov, dia) {
  const g = garantirGoverno(gov);
  if (!g.furiaDesde) return null;
  /* a muralha e o quartel seguram: gente armada atrasa a revolta, e é
     para isso que ela come do cofre todo dia */
  const prazo = DIAS_ATE_A_REVOLTA + bonusDeObras(g).defesa;
  const faltam = prazo - (dia - g.furiaDesde);
  if (faltam > 0) return { faltam, prazo };
  return { faltam: 0, prazo, caiu: true };
}

/* ---------------- O QUE A CASA DE OFÍCIO FAZ NA PRAÇA ----------------
   A obra que amarra este sistema ao comércio: uma cidade com casa de ofício
   passa a FABRICAR o que só extraía, e o gênero que ela produz fica ainda
   mais barato ali. É a primeira vez que uma decisão de governo aparece na
   etiqueta de um preço. */
export const DESCONTO_DA_OFICINA = 0.85;

export function fatorDaOficina(gov, genero, cidade) {
  const g = garantirGoverno(gov);
  if (!g.obras.includes("casa-de-oficio")) return 1;
  const v = vocacaoDe(cidade);
  return v && v.produz.includes(genero) ? DESCONTO_DA_OFICINA : 1;
}

/* ---------------- O QUE O NARRADOR RECEBE ----------------
   Fato consumado: o que o jogador decidiu, e o que a cidade sente por
   causa disso. Ele narra o murmúrio na praça; ele não escolhe o imposto. */
export function envelopeDoDominio(cidade, gov, { felicidade = 55, semente = "" } = {}) {
  if (!cidade || !cidade.nome) return "";
  const g = garantirGoverno(gov);
  const imp = impostoPorId(g.imposto);
  const obras = g.obras.map((id) => (obraPorId(id) || {}).nome).filter(Boolean);
  const humor = felicidade >= 70 ? "o povo está contente" : felicidade >= 40 ? "o povo tolera" : "o povo está furioso";
  const rev = revoltaAgora(g, 0);
  return [
    `${cidade.nome} é sua. Imposto ${imp.nome} — ${imp.o}; ${humor} (${Math.round(felicidade)}/100).`,
    g.governador ? `Quem governa em seu nome: ${g.governador}.` : "Ninguém governa em seu nome ali: é você, de longe.",
    obras.length ? `De pé: ${obras.join(", ")}.` : "",
    g.obrando ? `Em obra: ${(obraPorId(g.obrando.id) || {}).nome}.` : "",
    rev && !rev.caiu ? "A revolta está contada em dias — mostre isso na rua, sem anunciar prazo nenhum." : "",
    "Isto é FATO. Use na cena — no que se ouve na praça, no que a guarda faz — e não o contradiga: não invente imposto, obra nem governador que não estejam aqui.",
  ].filter(Boolean).join(" ");
}

/* A linha do painel para uma obra que muda o comércio. */
export function oQueAOficinaFaz(cidade) {
  const v = vocacaoDe(cidade);
  if (!v || !v.produz.length) return "";
  const g = generoPorId(v.produz[0]);
  return g ? `aqui, barateia ${g.nome} em mais 15%` : "";
}
