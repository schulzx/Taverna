/* ============================================================
   O QUADRO DA QUEST NA TELA — a conta da peça (QQ · Q4, 14/11/2026)
   formas.md §QQ; Figma 386:2. Puro, sem React: provável em Node, como o
   `espolio-na-tela.js`. Quem desenha é painel-quadro.jsx.

   O motor já decidiu tudo (src/quadro-da-quest.js): que cartas há, em que
   estado, por que caminhos se viram, que preço caiu e quanto vale. Aqui só
   se decide a TELA, e só pela tabela (QUADRO_DA_TELA, CARIMBO_DO_PRECO,
   PALAVRAS_DO_QUADRO):

     1. o estado que se VÊ de cada carta (`estadoDaCarta`: costas, aVirar,
        virada, preco, perdida, futura, sobra — §QQ 2) e os pavios da extra;
     2. a arrumação da gaveta (`arrumarOQuadro`): fora do mistério uma fila
        (a de agora); no mistério as etapas numeradas, feita / agora / por
        vir, e o fio de lacre pela ordem das viradas (§QQ 3);
     3. o carimbo (`carimboDaCarta`: a palavra, o glifo, o peso e a conta
        dos efeitos que o motor já multiplicou) e o veredito antes do clique
        (`linhaDoCaminho`, `fichasDoSeFalhar`);
     4. o sinal da barra (`estadoDoSinal`, `textoDoSinal`, `nomeDoSinal`),
        com o número que o motor dá (`quadro.sinal`) — a tela não conta;
     5. o momento da carta que vira (`cronogramaDaPista`, §QQ 4): a leitura
        por palavras com piso e teto, o teto absoluto de 4,5 s, e a saída
        para quem pediu menos movimento;
     6. o que o leitor de ecrã diz (`nomeDaCarta`, `falaDaPista`).

   O campo `juiz` de cada carta é BASTIDOR (Q2): nenhuma função daqui o lê,
   e o check-quadro prova que a peça também não. Onde um campo do motor
   falta (os da §QQ 8 que ainda não chegaram), a peça cala essa parte —
   nunca a calcula.
   ============================================================ */
import { QUADRO_DA_TELA, CARIMBO_DO_PRECO, PALAVRAS_DO_QUADRO } from "./estilo.js";
import { PRECO_DA_FALHA, CAMINHOS_DA_EXTRA } from "./quadro-da-quest.js";
import { PERICIAS } from "./pericias.js";
import { frase } from "./espolio-na-tela.js";

const M = QUADRO_DA_TELA.momento, W = PALAVRAS_DO_QUADRO, L = W.leitor;
const obj = (x) => (x && typeof x === "object" && !Array.isArray(x) ? x : null);
const arr = (x) => (Array.isArray(x) ? x : []);
const num = (x) => (Number.isFinite(Number(x)) ? Number(x) : 0);
const txt = (x) => (typeof x === "string" ? x.trim() : "");
const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");
const MENOS = "−";   /* o sinal de menos tipográfico do carimbo (§QQ 2: «−2 h») */

/* ============================================================
   1. A CARTA
   ============================================================ */

/* o estado que se vê (§QQ 2), pela ordem em que a forma o decide: a futura
   e a que não fez falta antes de tudo (são marcas, não estados do motor) */
export function estadoDaCarta(carta) {
  const c = obj(carta);
  if (!c) return null;
  if (c.futura) return "futura";
  if (c.sobra) return "sobra";
  if (c.estado === "perdida") return "perdida";
  if (c.estado === "preco") return "preco";
  if (c.estado === "virada") return "virada";
  return c.viravel ? "aVirar" : "costas";
}

/* que estados se tocam para abrir alguma coisa (os caminhos ou a carta lida);
   a futura nem foco recebe; a perdida e a que não fez falta só se leem */
export function abreAlgo(estado) {
  return estado === "costas" || estado === "aVirar" || estado === "virada" || estado === "preco";
}

/* os pavios da extra: um por caminho da tabela, aceso o que ainda está aberto */
export function paviosDaCarta(carta) {
  const c = obj(carta);
  if (!c || c.tipo !== "extra") return null;
  const total = CAMINHOS_DA_EXTRA.length;
  const acesos = c.estado === "virada" ? total : Math.max(0, Math.min(total, arr(c.caminhos).length));
  return { total, acesos };
}

/* ============================================================
   2. A ARRUMAÇÃO DA GAVETA
   ============================================================ */
const ROMANOS = [["X", 10], ["IX", 9], ["V", 5], ["IV", 4], ["I", 1]];
export function numeralDaEtapa(n) {
  let k = Math.max(1, Math.floor(num(n)));
  let s = "";
  for (const [r, v] of ROMANOS) while (k >= v) { s += r; k -= v; }
  return s;
}

/* quadro → { misterio, etapas: [{ id, numeral, estado, cartas }], fila,
   extras, porVir, fio }. As etapas vêm na ordem do motor: as feitas, a de
   agora e as por vir. A de agora é a última que não é por vir (o motor só
   dá futuras depois dela); as de antes estão feitas. `fila`: as cartas da
   de agora (a fila só do quadro fora do mistério). `fio`: os ids das cartas
   viradas pela ordem em que viraram — o `dia` da carta, se o motor o der;
   sem ele, a ordem do quadro.

   A ETAPA DE CADA CARTA. O quadro do motor (oQuadroDaQuest) traz `etapa`;
   a forma de tela da Q2b (oQuadroNaTela / aCartaNaTela, plano-quadro §12)
   NÃO a traz — está na lista do que nunca passa. Sem ela a gaveta do
   mistério não sabe que carta é de que etapa, e cai na arrumação pelas
   marcas que a carta tem: a que não fez falta é de uma etapa feita, a
   futura é das por vir, o resto é de agora. É uma aproximação (a virada
   de uma etapa já feita aparece em «agora»), e o pedido ao `backend`
   está escrito: `etapa` como chave opaca (ou o ordinal) na carta de tela.
   `misterio`: o booleano da forma de tela, ou `arco` do quadro do motor. */
export function arrumarOQuadro(quadro) {
  const q = obj(quadro);
  const cartas = arr(q && q.cartas).filter(obj);
  const ess = cartas.filter((c) => c.tipo !== "extra");
  const extras = cartas.filter((c) => c.tipo === "extra");
  const comEtapa = ess.some((c) => c.etapa != null && c.etapa !== "");
  const MARCAS = ["~feita", "~agora", "~futura"];
  const chave = (c) => (comEtapa ? (c.etapa == null ? "" : String(c.etapa)) : c.futura ? MARCAS[2] : c.sobra ? MARCAS[0] : MARCAS[1]);
  const grupos = [];
  const ordenadas = comEtapa ? ess : [...ess].sort((a, b) => MARCAS.indexOf(chave(a)) - MARCAS.indexOf(chave(b)));
  for (const c of ordenadas) {
    const id = chave(c);
    let g = grupos.find((x) => x.id === id);
    if (!g) { g = { id, cartas: [] }; grupos.push(g); }
    g.cartas.push(c);
  }
  let iAgora = -1;
  grupos.forEach((g, i) => { if (!g.cartas.every((c) => c.futura) && (comEtapa || g.id !== MARCAS[0])) iAgora = i; });
  const etapas = grupos.map((g, i) => ({
    id: g.id, numeral: numeralDaEtapa(i + 1),
    estado: g.cartas.every((c) => c.futura) ? "futura" : i === iAgora ? "agora" : "feita",
    cartas: g.cartas,
  }));
  const agora = etapas.find((e) => e.estado === "agora");
  const viradas = cartas.map((c, i) => ({ c, i })).filter(({ c }) => c.estado === "virada" || c.estado === "preco");
  const temDia = viradas.every(({ c }) => Number.isFinite(c.dia));
  const fio = (temDia ? [...viradas].sort((a, b) => a.c.dia - b.c.dia || a.i - b.i) : viradas).map(({ c }) => c.id);
  return {
    misterio: !!(q && (q.misterio === true || q.arco === "misterio")),
    etapas, fila: agora ? agora.cartas : [], extras,
    porVir: ess.filter((c) => c.futura).length,
    fio,
  };
}

/* ============================================================
   3. O CARIMBO E O VEREDITO ANTES DO CLIQUE
   ============================================================ */

/* a conta do carimbo, dos efeitos que o motor já multiplicou pelo peso do
   arco (§QQ 8, 3): os minutos em horas quando são horas inteiras, e as
   moedas com o glifo da moeda (a peça desenha-o: `moeda: true`). Sem
   número nos efeitos (VISTO, PARTIDO), não há conta. */
export function contaDoCarimbo(efeitos) {
  const es = arr(efeitos).filter(obj);
  const moedas = es.find((e) => e.tipo === "moedas" && Number.isFinite(e.n));
  if (moedas) return { texto: `${MENOS}${Math.abs(moedas.n)}`, moeda: true };
  const min = es.find((e) => e.tipo === "minutos" && Number.isFinite(e.n) && e.n > 0);
  if (min) return { texto: min.n >= 60 && min.n % 60 === 0 ? `${MENOS}${min.n / 60} h` : `${MENOS}${min.n} min`, moeda: false };
  return null;
}

/* carta (ou o `preco` de virarCarta) → { id, palavra, glifo, pesado, marca,
   conta } | null. `efeitos`: os da carta (§QQ 8, 3) ou os do preço que o
   momento traz; sem eles, o carimbo vai sem conta. */
export function carimboDaCarta(carta, preco) {
  const c = obj(carta) || {};
  const p = obj(preco);
  const id = p && typeof p.id === "string" ? p.id : typeof c.preco === "string" ? c.preco : obj(c.preco) && c.preco.id;
  const K = id && Object.prototype.hasOwnProperty.call(CARIMBO_DO_PRECO, id) ? CARIMBO_DO_PRECO[id] : null;
  if (!K) return null;
  const efeitos = p && Array.isArray(p.efeitos) ? p.efeitos : Array.isArray(c.efeitos) ? c.efeitos : obj(c.preco) ? c.preco.efeitos : null;
  return {
    id, palavra: K.palavra, glifo: K.glifo, marca: K.marca || null,
    pesado: !(PRECO_DA_FALHA[id] && PRECO_DA_FALHA[id].leve),
    conta: contaDoCarimbo(efeitos),
  };
}

/* o nome de uma perícia pelo id (pericias.js); um id que não é perícia cala */
function nomeDaPericia(id) {
  const p = PERICIAS.find((x) => x.id === id);
  return p ? p.nome : "";
}

/* um caminho → { id, verbo, linha, custa, nome }. `linha`: as perícias e os
   minutos (§QQ 8, 2 — os campos `pericias` e `minutos` do motor); sem eles,
   a linha vai vazia. `custa`: as moedas que o caminho cobra mesmo no
   sucesso. `nome`: o nome acessível do botão (§QQ 4). */
export function linhaDoCaminho(caminho) {
  const c = obj(caminho);
  if (!c) return null;
  const diz = txt(c.diz);
  const pericias = [...new Set(arr(c.pericias))].map(nomeDaPericia).filter(Boolean);
  const minutos = Number.isFinite(c.minutos) && c.minutos > 0 ? `${c.minutos} min` : "";
  const linha = [...pericias, minutos].filter(Boolean).join(" · ");
  const custa = obj(c.custa) && Number.isFinite(c.custa.moedas) && c.custa.moedas > 0 ? c.custa.moedas : null;
  const nomeLinha = [pericias.join(" ou "), minutos ? frase(L.minutos, { n: c.minutos }) : ""].filter(Boolean).join(", ");
  const nome = [frase(L.caminho, { diz }), nomeLinha ? cap(nomeLinha) + "." : "", custa ? frase(L.custa, { n: custa }) : ""].filter(Boolean).join(" ");
  return { id: c.id, verbo: cap(diz), diz, linha, custa, nome };
}

/* as fichas de «se falhar» de uma carta que o caso pede: um preço possível
   por ficha, com o glifo do carimbo e a frase. `seFalhar` vem do motor como
   [id] (Q1) ou [{ id, efeitos }] (§QQ 8, 4); a moeda do mistério só se
   escreve quando os efeitos a trazem — sem eles, a frase cala o número. */
export function fichasDoSeFalhar(caminhos) {
  const vistos = new Map();
  for (const c of arr(caminhos)) {
    for (const s of arr(obj(c) && c.seFalhar)) {
      const id = typeof s === "string" ? s : obj(s) && typeof s.id === "string" ? s.id : "";
      if (!id || !Object.prototype.hasOwnProperty.call(CARIMBO_DO_PRECO, id) || vistos.has(id)) continue;
      const ef = obj(s) ? arr(s.efeitos) : [];
      const m = ef.find((e) => obj(e) && e.tipo === "moedas" && Number.isFinite(e.n));
      const modelo = CARIMBO_DO_PRECO[id].seFalhar;
      const texto = m ? frase(modelo, { n: Math.abs(m.n) }) : modelo.replace(/\s*\{n\}/g, "");
      vistos.set(id, { id, glifo: CARIMBO_DO_PRECO[id].glifo, texto });
    }
  }
  return [...vistos.values()];
}

/* ============================================================
   4. O SINAL DA BARRA
   ============================================================ */

/* o número é do motor (`quadro.sinal = { sabe, de }`, §QQ 8, 1); sem ele,
   sem sinal — a barra não lhe dá um píxel */
export function sinalDoQuadro(quadro) {
  const s = obj(obj(quadro) && quadro.sinal);
  if (!s || !Number.isFinite(s.sabe) || !Number.isFinite(s.de) || s.de <= 0) return null;
  return { sabe: Math.max(0, Math.min(s.de, Math.floor(s.sabe))), de: Math.floor(s.de) };
}

/* repouso · novo (a gota) · aceso (os 600 da chegada) · completo (o número
   a verde) — §QQ 3. O aceso ganha à gota; o completo é do número, e a gota
   e o halo continuam a poder estar por cima dele. */
export function estadoDoSinal(sinal, { novo = false, aceso = false } = {}) {
  const s = obj(sinal);
  if (!s) return null;
  if (aceso) return "aceso";
  if (novo) return "novo";
  return s.sabe >= s.de ? "completo" : "repouso";
}

export function textoDoSinal(sinal, telefone = false) {
  const s = obj(sinal);
  return s ? (telefone ? `${s.sabe}/${s.de}` : `${s.sabe} de ${s.de}`) : "";
}

/* «Pistas: 2 de 4. Há uma nova. Abrir.» */
export function nomeDoSinal(sinal, { novo = false, aberto = false } = {}) {
  const s = obj(sinal);
  if (!s) return "";
  return [frase(L.sinal, s), novo ? L.novo : "", aberto ? L.fechar : L.abrir].filter(Boolean).join(" ");
}

/* ============================================================
   5. O MOMENTO — a carta que vira (§QQ 4)
   ============================================================ */
export function palavrasDe(texto) {
  return txt(texto).split(/\s+/).filter(Boolean).length;
}

/* 250 ms por palavra da face + o `de` + a palavra do carimbo, piso 1 200,
   teto 3 000 (Brysbaert 2019) */
export function leituraDaPista({ face = "", de = "", carimbo = "" } = {}) {
  const n = palavrasDe(face) + palavrasDe(de) + palavrasDe(carimbo);
  return Math.max(M.leitura.piso, Math.min(M.leitura.teto, n * M.leitura.porPalavra));
}

export function duracaoDaPista(passos) {
  return arr(passos).reduce((m, p) => Math.max(m, num(p.de) + num(p.dura)), 0);
}

/* cronogramaDaPista({ face, de, carimbo, misterio, perdeu, ultimo, reduzido })
   → [{ passo, de, dura }], contado do pouso do dado (com o gesto, do envio).
   `carimbo`: a palavra do carimbo (vazia sem preço). `perdeu`: a extra que
   falhou (não vira: um pavio apaga-se, e o risco se `ultimo`).

   O TETO ABSOLUTO de 4,5 s (M.teto) é da carta inteira, do pouso ao fim do
   voo. Com o mistério, o carimbo pesado e a leitura no teto a soma passaria
   (640 + 320 + 260 + 3 000 + 360 = 4 580): quem cede é a leitura, que encolhe
   até a carta caber. A §QQ não diz quem cede — é a escolha que não toca em
   movimento nenhum, e está escrita para o `jogo` a assinar ou corrigir na Q6.

   COM REDUCE (§QQ 4): aparece já virada e carimbada em 120 de opacidade,
   fica o mesmo tempo de leitura, e sai em 120. Na perda não há leitura (a
   §QQ não a dá): a carta fica o tempo que o pavio e o risco levariam. */
export function cronogramaDaPista(opcoes) {
  const o = obj(opcoes) || {};
  const misterio = !!o.misterio, perdeu = !!o.perdeu, ultimo = !!o.ultimo;
  const palavra = perdeu ? "" : txt(o.carimbo);
  const leitura = perdeu ? 0 : leituraDaPista({ face: o.face, de: o.de, carimbo: palavra });
  const perda = M.pavio.apaga + (ultimo ? M.pavio.risca : 0);
  if (o.reduzido) {
    const fica = perdeu ? perda : leitura;
    return [
      { passo: "aparece", de: 0, dura: M.reduzido },
      { passo: perdeu ? "fica" : "leitura", de: M.reduzido, dura: fica },
      { passo: "sai", de: M.reduzido + fica, dura: M.reduzido },
    ];
  }
  const passos = [{ passo: "sobe", de: M.sobe.de, dura: M.sobe.dura }];
  let t = M.sobe.de + M.sobe.dura;
  const por = (passo, dura) => { passos.push({ passo, de: t, dura }); t += dura; };
  if (misterio) por("treme", M.treme.dura);
  if (perdeu) {
    por("pavio", M.pavio.apaga);
    if (ultimo) por("risca", M.pavio.risca);
  } else {
    por("viraA", M.vira.meia);
    por("viraB", M.vira.abre);
    if (palavra) por("carimbo", misterio ? M.carimbo.misterio.dura : M.carimbo.dura);
    const cabe = Math.max(0, M.teto - t - M.voa.dura);
    por("leitura", Math.min(leitura, cabe));
  }
  por("voa", M.voa.dura);
  return passos;
}

/* o passo em que o momento está aos `ms` (o último cujo `de` já passou);
   antes do primeiro, null; depois do fim, "fim" */
export function passoAos(passos, ms) {
  const ps = arr(passos);
  if (!ps.length) return null;
  if (num(ms) >= duracaoDaPista(ps)) return "fim";
  let atual = null;
  for (const p of ps) if (num(ms) >= num(p.de)) atual = p.passo;
  return atual;
}

/* o salto (tocar na carta, Esc, Enter, ou enviar o turno seguinte): vai
   ao voo; com reduce, à saída. Devolve os ms a partir dos quais continuar. */
export function saltoDaPista(passos) {
  const ps = arr(passos);
  const alvo = ps.find((p) => p.passo === "voa") || ps.find((p) => p.passo === "sai");
  return alvo ? alvo.de : duracaoDaPista(ps);
}

/* ============================================================
   6. O QUE O LEITOR DE ECRÃ DIZ
   ============================================================ */

/* o nome acessível da carta (§QQ 4) — pela forma e pelo estado */
export function nomeDaCarta(carta) {
  const c = obj(carta);
  if (!c) return "";
  const forma = txt(c.costas);
  const e = estadoDaCarta(c);
  if (e === "futura") return frase(L.futura, { forma });
  if (e === "perdida") return frase(L.perdida, { forma });
  if (e === "sobra") return frase(L.sobra, { forma });
  if (e === "virada" || e === "preco") {
    const face = txt(c.face), de = txt(c.de);
    const base = de ? frase(L.virada, { Face: cap(face), de }) : `${cap(face)}.`;
    return e === "preco" && txt(c.linha) ? `${base} ${txt(c.linha)}` : base;
  }
  return frase(L.costas, { Forma: cap(forma) });
}

/* a frase da região viva, uma vez, quando a carta vira ou se perde.
   `vira`: o resultado de virarCarta ({ carta, preco, perdeu }). */
export function falaDaPista(vira) {
  const v = obj(vira);
  const c = v && obj(v.carta);
  if (!c) return "";
  if (v.perdeu) {
    const restam = arr(c.caminhos).length;
    if (c.estado !== "perdida" && restam > 0) return frase(L.fechou, { n: restam });
    return frase(L.perdeu, { sobre: txt(c.sobre) || txt(c.costas) });
  }
  const linha = txt(c.linha) || txt(obj(v.preco) && v.preco.linha);
  const base = frase(L.vira, { face: txt(c.face), de: txt(c.de) }).replace(/\s+—\s+\.$/, ".");
  return linha ? `${base} ${linha}` : base;
}
