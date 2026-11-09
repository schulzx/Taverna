/* ============================================================
   OS ESPÓLIOS NA TELA — a conta da cerimónia (TE10 · 09/11/2026)
   formas.md §TE; Figma 334:2. Puro, sem React: provável em Node, como o
   `reciboQueCabe` de glifos.js. Quem desenha é painel-espolio.jsx.

   O sistema já decidiu tudo (src/espolios.js): a paga, a ordem das peças
   (`revelacaoDoEspolio`, a menos rara primeiro e a peça com nome por
   último), a comparação, o que sai do corpo e o que o artefacto promete.
   Aqui só se decide a TELA, e só pela tabela:

     1. a forma pelo que a paga vale (`formaDoEspolio`): com peça, a
        cerimónia; sem peça, a faixa do fecho no recibo;
     2. a linha do tempo (`cronogramaDoEspolio`): o teto de 4 s
        (REVELACAO_DO_ESPOLIO.teto) encolhe o intervalo entre viragens; a
        antecipação só na última, se for rara ou melhor; a relíquia, sempre
        a última, soma a sua sequência; com reduced motion, um passo só;
     3. a fila das cerimónias (espólio → nível → despertar), que nunca abre
        com a luta aberta (FILA_DAS_CERIMONIAS);
     4. o que cada peça diz: o veredito com os dois lados, o nome acessível
        da carta, o resumo que a região viva lê uma vez, o chip do achado e
        o despertar — cada palavra de PALAVRAS_DO_ESPOLIO;
     5. as duas decisões da pessoa de 09/11 que são tela: a lenda gravada no
        artefacto (`linhasDaLenda`) e a carta de costas no Diário
        (`cartaNoDiario`).

   A tela NUNCA refaz a ordem que o sistema deu, nem soma níveis, nem lê
   PODERES à mão: onde um campo falta, a peça cala-se.
   ============================================================ */
import { REVELACAO_DO_ESPOLIO, RELIQUIA_DA_TELA, FILA_DAS_CERIMONIAS, PALAVRAS_DO_ESPOLIO, ENCAIXE, LENDA_DO_ARTEFACTO, CARTA_NO_DIARIO } from "./estilo.js";
import { RARIDADES, raridadeDoItem, encaixeDoItem, compararItem, rotuloDoEquipar } from "./comparar-item.js";
import { promessaDoArtefacto, DESPERTAR_DO_ARTEFACTO } from "./espolios.js";
import { RELIQUIAS } from "./relicas.js";
import { MAX_SINTONIA } from "./sintonia.js";

const R = REVELACAO_DO_ESPOLIO, P = PALAVRAS_DO_ESPOLIO, L = P.leitor;
/* AS DUAS FRASES QUE A PAGA NA MOCHILA PEDIU (09/11, os restos da TE10).
   `dormeComVaga`: a peça que dorme com lugar de sintonia livre — a sintonia
   nunca é automática, e a frase de PALAVRAS_DO_ESPOLIO.dorme («as tuas três
   já estão em uso») só é verdade com os três tomados; no nível 1, com
   nenhum, mentia. `noChao`: a peça da paga que não coube na mochila (o
   motor pô-la no chão, ESPOLIO_NO_TURNO.mochila). Moram aqui enquanto a mão
   do desenho tem estilo.js aberto; o lugar delas é PALAVRAS_DO_ESPOLIO, e
   mudam-se para lá na volta seguinte da tela. */
const PALAVRAS_DA_PAGA = Object.freeze({
  dormeComVaga: "O poder dorme até o sintonizares — tens {n} de {max} lugares livres. Serve de peça desde já.",
  noChao: "Não coube na mochila: ficou no chão, à tua espera.",
});
const obj = (x) => (x && typeof x === "object" && !Array.isArray(x) ? x : null);
const arr = (x) => (Array.isArray(x) ? x : []);
const num = (x) => (Number.isFinite(Number(x)) ? Number(x) : 0);
const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");

/* o modelo com {n}, {nome}, {q}…: a chave que falta fica vazia, nunca «{nome}» */
export function frase(modelo, vars) {
  const v = obj(vars) || {};
  return String(modelo || "").replace(/\{(\w+)\}/g, (_, k) => (v[k] == null ? "" : String(v[k])));
}

/* ============================================================
   1. O QUE A PAGA TRAZ, e a forma pelo que vale
   ============================================================ */

/* as cartas: as entradas `item`, NA ORDEM QUE O SISTEMA DEU */
export function cartasDoEspolio(entradas) {
  return arr(entradas).filter((e) => obj(e) && e.tipo === "item" && obj(e.item));
}

/* o ganho de cima: o XP, as moedas e os favores (os papéis, crus) — e
   (09/11) `nomesDosFavores`: { papel: nome } com o nome que a paga já traz
   (revelacaoDoEspolio), para a tela não ter de o procurar */
export function ganhoDoEspolio(entradas) {
  const es = arr(entradas).filter(obj);
  const xp = es.filter((e) => e.tipo === "xp").reduce((a, e) => a + Math.max(0, num(e.n)), 0);
  const moedas = es.filter((e) => e.tipo === "moedas").reduce((a, e) => a + Math.max(0, num(e.n)), 0);
  const deFavor = es.filter((e) => e.tipo === "favor" && typeof e.papel === "string" && e.papel);
  const favores = deFavor.map((e) => e.papel);
  const nomesDosFavores = Object.fromEntries(deFavor.filter((e) => typeof e.nome === "string" && e.nome.trim()).map((e) => [e.papel, e.nome.trim()]));
  return { xp, moedas, favores, nomesDosFavores };
}

/* QUATRO TAMANHOS PARA QUATRO VALORES (§TE 1): com peça, a cerimónia (a
   relíquia vai dentro dela); sem peça mas com ganho, a faixa do fecho no
   recibo; sem nada, null. O achado do caminho não passa por aqui: é chip. */
export function formaDoEspolio(entradas) {
  if (cartasDoEspolio(entradas).length) return "cerimonia";
  const g = ganhoDoEspolio(entradas);
  return g.xp > 0 || g.moedas > 0 ? "fecho" : null;
}

/* rara ou melhor: a régua da antecipação (REVELACAO_DO_ESPOLIO.antecipacao.desde) */
export function ehRara(item) {
  return RARIDADES.indexOf(raridadeDoItem(item)) >= RARIDADES.indexOf(R.antecipacao.desde);
}
const ehReliquia = (item) => raridadeDoItem(item) === "unico";

/* ============================================================
   2. A LINHA DO TEMPO — cronogramaDoEspolio(entradas, { reduzido, coracao })
   → [{ passo, de, dura, carta? , veu? }], ms contados do toque que abre.
   Os passos: veu, rotulo, xp, moedas, favor; por carta chega, (a última
   rara) antecipacao, vira, assenta; a relíquia apaga, lume, sobe,
   antecipacao, vira, anel, estrela, frase; e o veredito no fim.
   O TETO: sem relíquia, o fim do veredito nunca passa de R.teto — o
   intervalo entre viragens encolhe primeiro (podem sobrepor-se), e só
   depois o intervalo entre chegadas. Com reduced motion: um passo, de 160.
   ============================================================ */
function linhaDoTempo(n, { passoChega, passoVira, rara, reliquia }) {
  const out = [];
  const meiaVolta = R.vira.meia + R.vira.abre;
  for (let i = 0; i < n; i++) out.push({ passo: "chega", de: R.chegam.de + i * passoChega, dura: R.chegam.dura, carta: i });
  const inicio = n ? R.chegam.de + (n - 1) * passoChega + R.chegam.dura : R.chegam.de;
  let fim = inicio;
  for (let i = 0; i < n; i++) {
    let de = inicio + i * passoVira;
    const ultima = i === n - 1;
    if (ultima && reliquia) {
      const Q = RELIQUIA_DA_TELA;
      out.push({ passo: "apaga", de, dura: Q.apaga, carta: i, veu: Q.veu });
      out.push({ passo: "lume", de, dura: Q.lume.dura, carta: i });
      out.push({ passo: "sobe", de: de + Q.apaga, dura: Q.sobe.dura, carta: i });
      const ant = de + Q.apaga + Q.sobe.dura;
      out.push({ passo: "antecipacao", de: ant, dura: Q.antecipacao.dura, carta: i });
      const vira = ant + Q.antecipacao.dura;
      out.push({ passo: "vira", de: vira, dura: Q.vira.meia + Q.vira.abre, carta: i });
      const virou = vira + Q.vira.meia + Q.vira.abre;
      out.push({ passo: "anel", de: virou, dura: Q.anel.dura, carta: i });
      out.push({ passo: "estrela", de: virou, dura: Q.estrela, carta: i });
      out.push({ passo: "frase", de: virou + Q.frase.de, dura: Q.frase.dura, carta: i });
      fim = Math.max(fim, virou + Q.frase.de + Q.frase.dura);
      continue;
    }
    if (ultima && rara) {
      out.push({ passo: "antecipacao", de, dura: R.antecipacao.dura, carta: i });
      de += R.antecipacao.dura;
    }
    out.push({ passo: "vira", de, dura: meiaVolta, carta: i });
    out.push({ passo: "assenta", de: de + meiaVolta, dura: R.vira.assenta, carta: i });
    fim = Math.max(fim, de + meiaVolta + R.vira.assenta);
  }
  out.push({ passo: "veredito", de: fim, dura: R.veredito.dura });
  return out;
}

/* o fim da linha do tempo: o maior de + dura */
export function duracaoDoCronograma(passos) {
  return arr(passos).reduce((m, p) => Math.max(m, num(p.de) + num(p.dura)), 0);
}

export function cronogramaDoEspolio(entradas, opcoes) {
  const op = obj(opcoes) || {};
  if (op.reduzido) return [{ passo: "final", de: 0, dura: R.reduzido.dura }];
  const cartas = cartasDoEspolio(entradas);
  const g = ganhoDoEspolio(entradas);
  const n = cartas.length;
  const ultima = n ? cartas[n - 1].item : null;
  const reliquia = !!(ultima && ehReliquia(ultima));
  const rara = !!(ultima && !reliquia && ehRara(ultima));
  const topo = [{ passo: "veu", de: R.veu.de, dura: R.veu.dura }, { passo: "rotulo", de: R.rotulo.de, dura: op.coracao ? R.rotulo.coracao : R.rotulo.dura }];
  if (g.xp > 0) topo.push({ passo: "xp", de: R.xp.de, dura: R.xp.dura });
  if (g.moedas > 0) topo.push({ passo: "moedas", de: R.moedas.de, dura: R.moedas.dura });
  if (g.favores.length) topo.push({ passo: "favor", de: R.favor.de, dura: R.favor.dura });

  /* o teto mede-se SEM a relíquia: ela entra como uma carta comum na conta,
     e a sua sequência (no máximo uma vez por campanha) soma-se depois */
  const ideal = { passoChega: R.chegam.entre, passoVira: R.vira.meia + R.vira.abre + R.vira.entre, rara, reliquia: false };
  const medir = (o) => duracaoDoCronograma([...topo, ...linhaDoTempo(n, o)]);
  let cfg = ideal;
  if (n > 1 && medir(ideal) > R.teto) {
    const semVira = medir({ ...ideal, passoVira: 0 });
    if (semVira <= R.teto) cfg = { ...ideal, passoVira: Math.floor((R.teto - semVira) / (n - 1)) };
    else {
      const semNada = medir({ ...ideal, passoVira: 0, passoChega: 0 });
      cfg = { ...ideal, passoVira: 0, passoChega: Math.max(0, Math.floor((R.teto - semNada) / (n - 1))) };
    }
  }
  return [...topo, ...linhaDoTempo(n, { ...cfg, reliquia })];
}

/* ============================================================
   3. A FILA DAS CERIMÓNIAS — uma de cada vez, e nunca com a luta aberta
   `cerimonia`: { tipo: "espolio" | "nivel" | "despertar", … }.
   ============================================================ */
const ORDEM = FILA_DAS_CERIMONIAS.ordem;
export function entrarNaFila(fila, cerimonia) {
  const lista = [...arr(fila), cerimonia].filter((c) => obj(c) && ORDEM.includes(c.tipo));
  return lista.map((c, i) => ({ c, i })).sort((a, b) => ORDEM.indexOf(a.c.tipo) - ORDEM.indexOf(b.c.tipo) || a.i - b.i).map((x) => x.c);
}
export function proximaCerimonia(fila, opcoes) {
  const op = obj(opcoes) || {};
  if (op.lutaAberta && FILA_DAS_CERIMONIAS.esperaALuta) return null;
  return arr(fila).find((c) => obj(c) && ORDEM.includes(c.tipo)) || null;
}

/* ============================================================
   4. O QUE CADA PEÇA DIZ
   ============================================================ */
const palavraDaRaridade = (item) => P.raridade[raridadeDoItem(item)] || "";
const nomeDoEncaixe = (slot) => (slot && ENCAIXE.nomes[slot]) || "";
const ehFeminino = (item) => P.feminino.includes(obj(item) ? item.tipo : "");
const sinalDe = (n) => (n > 0 ? "+" : "−") + Math.abs(n);
const generoDe = (item) => { const a = obj(obj(item) && item.artefacto); return a ? (a.genero === "lembranca" ? "lembranca" : "artefacto") : null; };

/* o fio do despertar: quantas runas acesas e se a estrela do gesto acende —
   de DESPERTAR_DO_ARTEFACTO pelo estado da peça. A lembrança não cresce: sem fio. */
export function fioDoArtefacto(item) {
  if (generoDe(item) !== "artefacto") return null;
  const estado = DESPERTAR_DO_ARTEFACTO.ordem.includes(item.artefacto.estado) ? item.artefacto.estado : DESPERTAR_DO_ARTEFACTO.ordem[0];
  const st = DESPERTAR_DO_ARTEFACTO[estado];
  return { estado, runas: [st.passivos >= 1, st.passivos >= 2], estrela: !!st.gesto };
}

/* quando acorda, em palavras (a promessa do sistema; nunca uma soma da tela) */
function quandoAcorda(pr) {
  if (!pr || !pr.proximo) return "";
  if (pr.proximo === "desperto") return pr.nivelQueAcorda != null ? frase(P.acorda, { n: pr.nivelQueAcorda }) : pr.porProva ? P.acordaSo : "";
  return pr.nivelQueAcorda != null ? frase(P.exaltaQuando, { n: pr.nivelQueAcorda }) : pr.porConfronto ? P.exaltaSo : "";
}

/* O VEREDITO (335:119) — os dois lados antes do clique.
   → null para lixo; senão { nome, raridade, meta, historia, fio, estado,
     linhas, porAcordar, gesto, dorme, sai, troca, naMochila, lenda, botao }.
   `botao`: { rotulo, pode, motivo } — o rótulo é o preço,
   rotuloDoEquipar(linhas, "Equipar já") —, ou null (nada a vestir). */
export function vereditoDoEspolio(entrada, opcoes) {
  const e = obj(entrada);
  const item = e && obj(e.item);
  if (!item) return null;
  const op = obj(opcoes) || {};
  const slot = e.slot || null;
  const raridade = raridadeDoItem(item);
  const genero = generoDe(item);
  let pr = null;
  try { pr = genero ? promessaDoArtefacto(item, op.nivel) : null; } catch (x) { pr = null; }
  const extra = raridade === "unico" ? frase(P.metaReliquia, { n: RELIQUIAS.length }) : genero === "artefacto" ? P.temNome : genero === "lembranca" ? P.lembranca : "";
  const meta = [slot ? nomeDoEncaixe(slot) : item.tipo === "consumivel" ? P.consumivel : "", cap(palavraDaRaridade(item)), extra].filter(Boolean).join(" · ");
  const conta = genero || raridade === "unico";
  let estado = "";
  if (pr && genero === "artefacto") {
    const w = (P.estado[pr.estado] || P.estado.adormecido)[ehFeminino(item) ? "f" : "m"];
    const q = quandoAcorda(pr);
    estado = q ? `${w} · ${q}` : w;
  }
  const porAcordar = [];
  if (pr && genero === "artefacto") {
    for (const p of arr(pr.poderes)) if (obj(p) && !p.aceso && p.nome) porAcordar.push(`${p.nome} — ${P.porAcordar}`);
    if (obj(pr.gesto) && !pr.gesto.aceso && pr.gesto.nome) porAcordar.push(`${pr.gesto.nome} — ${P.gesto}`);
  }
  const ativo = obj(item.ativo);
  const gesto = ativo && ativo.nome ? `${ativo.nome}, ${P.porDia}${ativo.diz ? ` — ${ativo.diz}` : ""}` : "";
  return {
    nome: String(item.nome || ""), raridade, meta,
    historia: conta && typeof item.descricao === "string" ? item.descricao : "",
    fio: fioDoArtefacto(item), estado,
    linhas: arr(e.linhas), porAcordar, gesto,
    dorme: e.dorme ? (Number.isInteger(e.vagas) && e.vagas > 0 ? frase(PALAVRAS_DA_PAGA.dormeComVaga, { n: e.vagas, max: MAX_SINTONIA }) : P.dorme) : "",
    sai: slot && e.sai ? frase(P.sai, { nome: e.sai }) : "",
    troca: slot && typeof e.troca === "string" ? e.troca : "",
    naMochila: slot || e.noChao ? "" : P.naMochila,
    noChao: e.noChao ? PALAVRAS_DA_PAGA.noChao : "",
    lenda: linhasDaLenda(item),
    botao: slot ? { rotulo: rotuloDoEquipar(e.linhas, P.equipar), pode: !!e.podeEquipar, motivo: e.motivo || "" } : null,
  };
}

/* A LENDA DO ARTEFACTO (decisão 6 da pessoa, 09/11) — as linhas que o
   sistema grava em `item.lenda` (dos factos que regista; nunca do
   Narrador), na ordem que ele deu, até LENDA_DO_ARTEFACTO.teto. Cada linha
   é uma frase, ou { texto } (também `linha` ou `diz`); o resto cala-se.
   → [string], vazio quando não há lenda. */
export function linhasDaLenda(item) {
  const it = obj(item);
  const lenda = it ? it.lenda : null;
  const lista = Array.isArray(lenda) ? lenda : typeof lenda === "string" ? [lenda] : [];
  return lista
    .map((l) => (typeof l === "string" ? l : obj(l) ? l.texto || l.linha || l.diz || "" : ""))
    .map((l) => String(l || "").trim())
    .filter(Boolean)
    .slice(0, LENDA_DO_ARTEFACTO.teto);
}

/* A CARTA NO DIÁRIO (decisão 5 da pessoa, 09/11, «só metade») — a carta
   de costas com a luz da raridade que a quest pode pagar. `raridade`: o
   degrau que o sistema dá (raridadeQuePodePagar); lixo ou nada, null.
   → { raridade, rara, frase } — `rara` é a palavra no feminino («peça»),
   `frase` a linha que diz por escrito o que a luz diz. Nunca o caminho. */
export function cartaNoDiario(raridade) {
  if (!RARIDADES.includes(raridade)) return null;
  const rara = CARTA_NO_DIARIO.rara[raridade] || "";
  return { raridade, rara, frase: frase(CARTA_NO_DIARIO.diz, { r: rara }) };
}

/* uma linha da comparação dita: «Iniciativa sobe 3» (o dano diz só o sentido) */
function linhaDita(l) {
  if (!obj(l) || !l.rotulo) return "";
  const sentido = l.sinal === "danger" ? L.desce : L.sobe;
  return l.id === "dano" || !Number.isFinite(l.delta) ? `${l.rotulo} ${sentido}` : `${l.rotulo} ${sentido} ${Math.abs(l.delta)}`;
}
const melhorQueOTeu = (e) => arr(e && e.linhas).some((l) => obj(l) && l.sinal === "ok");

/* O NOME ACESSÍVEL DA CARTA (§TE 6): «A Que Subiu a Escada, épico, arma,
   tem nome. Iniciativa sobe 3.» As costas não têm nome: só entram no
   grupo quando viram. */
export function nomeDaCarta(entrada) {
  const e = obj(entrada);
  const item = e && obj(e.item);
  if (!item) return "";
  const g = generoDe(item);
  const partes = [item.nome, palavraDaRaridade(item), nomeDoEncaixe(e.slot).toLowerCase(), g === "artefacto" ? P.temNome : g === "lembranca" ? P.lembranca : ""].filter(Boolean);
  const ditas = arr(e.linhas).map(linhaDita).filter(Boolean);
  return `${partes.join(", ")}.${ditas.length ? " " + ditas.join(", ") + "." : ""}`;
}

/* O RESUMO, lido uma vez pela região viva no quadro final (WCAG 4.1.3):
   «Ganhaste 269 de experiência e 98 moedas. A capela fica a dever-te.
   Três peças: …; …, raro, melhor que o teu; …, épico, tem nome.»
   `nomeDoFavor(papel)` dá o nome do lugar (a fiação sabe-o; sem ele, o
   favor cala-se — o papel cru é palavra do motor). */
export function resumoDoEspolio(entradas, opcoes) {
  const op = obj(opcoes) || {};
  const g = ganhoDoEspolio(entradas);
  const frases = [];
  const ganhos = [g.xp > 0 ? frase(L.experiencia, { n: g.xp }) : "", g.moedas > 0 ? frase(L.moedas, { n: g.moedas }) : ""].filter(Boolean);
  if (ganhos.length) frases.push(`${L.ganhaste} ${ganhos.join(L.e)}.`);
  for (const papel of g.favores) {
    let nome = "";
    try { nome = typeof op.nomeDoFavor === "function" ? String(op.nomeDoFavor(papel) || "") : ""; } catch (x) { nome = ""; }
    if (!nome) nome = g.nomesDosFavores[papel] || "";
    if (nome) frases.push(`${cap(frase(P.favor, { nome }))}.`);
  }
  const cartas = cartasDoEspolio(entradas);
  if (cartas.length) {
    const q = L.quantas[cartas.length] || String(cartas.length);
    const lista = cartas.map((e) => {
      const gen = generoDe(e.item);
      return [e.item.nome, palavraDaRaridade(e.item), melhorQueOTeu(e) ? L.melhor : "", gen === "artefacto" ? P.temNome : gen === "lembranca" ? P.lembranca : ""].filter(Boolean).join(", ");
    });
    frases.push(`${frase(cartas.length === 1 ? L.peca : L.pecas, { q })}: ${lista.join("; ")}.`);
  }
  return frases.join(" ");
}

/* A FAIXA DO GANHO (335:145): o que já havia e o que entra, em frações da
   barra do nível. `xpParaSubir`: o XP que o nível de antes pedia. Se passa
   o nível, a barra enche e o selo aparece no fim. → null sem régua. */
export function barraDoGanho(xpAntes, xpParaSubir, ganho) {
  const max = num(xpParaSubir);
  if (!(max > 0)) return null;
  const havia = Math.max(0, Math.min(1, num(xpAntes) / max));
  const subiu = num(xpAntes) + Math.max(0, num(ganho)) >= max;
  const entra = subiu ? 1 - havia : Math.max(0, Math.min(1 - havia, num(ganho) / max));
  return { havia, entra, subiu };
}

/* O CHIP DO ACHADO (335:166) — `achado`: { diz, moedas? , item? }.
   → null para lixo; senão { tipo: "moedas"|"consumivel"|"peca"|"pecaMelhor",
     texto, raridade, melhor, rotulo } — `melhor` («▲ CA +1») quando a
   comparação tem uma linha que sobe; `rotulo`, o nome acessível. */
export function chipDoAchado(achado, heroi) {
  const a = obj(achado);
  if (!a) return null;
  const item = obj(a.item);
  if (item) {
    const slot = encaixeDoItem(item);
    const rar = palavraDaRaridade(item);
    if (!slot) return { tipo: "consumivel", texto: String(item.nome || ""), raridade: null, melhor: "", rotulo: `${P.achaste}: ${item.nome}. ${P.examinar}.` };
    let ok = null;
    try { ok = compararItem(obj(heroi) || {}, item, slot).linhas.find((l) => l.sinal === "ok") || null; } catch (x) { ok = null; }
    const melhor = ok ? (ok.id === "dano" ? `dano ${ok.depois}` : `${ok.curto} ${sinalDe(ok.delta)}`) : "";
    const dito = ok ? ` (${ok.curto} ${ok.delta < 0 ? L.menos : L.mais} ${Math.abs(ok.delta)})` : "";
    return {
      tipo: ok ? "pecaMelhor" : "peca", texto: `${item.nome} · ${rar}`, raridade: raridadeDoItem(item), melhor,
      rotulo: `${P.achaste}: ${item.nome}, ${rar}${ok ? `, ${L.melhor}${ok.id === "dano" ? "" : dito}` : ""}. ${P.examinar}.`,
    };
  }
  if (Number.isFinite(a.moedas)) {
    const oque = cap(String(a.diz || "").split(",")[0].trim());
    const quanto = frase(P.moedas, { n: a.moedas });
    return { tipo: "moedas", texto: oque ? `${oque} · ${quanto}` : quanto, raridade: null, melhor: "", rotulo: `${P.achaste}: ${oque ? oque + ", " : ""}${quanto}. ${P.examinar}.` };
  }
  return null;
}

/* O DESPERTAR (337:368) — `antes` e `depois`: o mesmo artefacto antes e
   depois de despertarArtefacto. → null se não é artefacto ou nada mudou;
   senão { estado: "desperto"|"exaltado", nome, raridade, ganhos: [{ nome,
   diz, gesto }], dormem: [linha], leitor }. Os ganhos são o que a promessa
   acendeu entre os dois; o que ainda dorme diz quando acorda. */
export function despertarNaTela(antes, depois, nivel) {
  let pa = null, pd = null;
  try { pa = promessaDoArtefacto(antes, nivel); pd = promessaDoArtefacto(depois, nivel); } catch (x) { return null; }
  if (!pd || pd.genero !== "artefacto") return null;
  const ordem = DESPERTAR_DO_ARTEFACTO.ordem;
  if (pa && ordem.indexOf(pd.estado) <= ordem.indexOf(pa.estado)) return null;
  const acesoAntes = new Set(arr(pa && pa.poderes).filter((p) => p.aceso).map((p) => p.id));
  const ganhos = arr(pd.poderes).filter((p) => p.aceso && !acesoAntes.has(p.id)).map((p) => ({ nome: p.nome, diz: p.diz || "", gesto: false }));
  if (obj(pd.gesto) && pd.gesto.aceso && !(pa && obj(pa.gesto) && pa.gesto.aceso)) ganhos.push({ nome: pd.gesto.nome, diz: pd.gesto.diz || "", gesto: true });
  const quando = quandoAcorda(pd);
  const dormem = [];
  if (quando) {
    for (const p of arr(pd.poderes)) if (!p.aceso) dormem.push(frase(P.aindaDorme, { nome: p.nome, quando }));
    if (obj(pd.gesto) && !pd.gesto.aceso) dormem.push(frase(P.aindaDorme, { nome: pd.gesto.nome, quando }));
  }
  const nome = String((obj(depois) && depois.nome) || "");
  const leitor = [frase(pd.estado === "exaltado" ? L.exalta : L.desperta, { nome }), ...ganhos.map((g) => frase(L.ganha, { nome: g.nome, diz: g.diz.replace(/[.!?…]+$/, "") }))].join(" ");
  return { estado: pd.estado, nome, raridade: raridadeDoItem(depois), ganhos, dormem, leitor };
}
