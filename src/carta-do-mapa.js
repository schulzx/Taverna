/* ============================================================
   A CARTA — o mapa em pergaminho pousado na mesa (V8 · 18/11/2026)

   formas.md §«A Mesa do Mestre · F5» (decisão 5, `AGUADA_DA_CARTA`,
   `TINTA_DA_CARTA`, `LUZ_DA_CARTA`, §4 «A carta») e as pranchas F5-8 e F5-14.
   O desenho é `painel-carta.jsx`; aqui só a conta de apresentação, provada em
   `testes/teste-carta-do-mapa.mjs`.

   NADA DE REGRA NASCE AQUI. O que existe, o que o herói conhece, as horas, a
   chegada e o perigo saem dos motores de sempre:
     · na região (o molde continental do beta): `dadosDoMapaVivo` (mapa-vivo.js)
       e `vereditoDaPartida` (partida.js), os mesmos da tela que esta carta
       substitui;
     · fora dela (o arquipélago, o estelar, todo save de antes da região):
       `dadosDaCartaDoContinente`, abaixo, que só LÊ o mapa guardado — as
       cidades descobertas, as rotas com os dias que o jogo cobra
       (`viajarPeloMapa` lê as mesmas), e onde o herói está;
     · os mantimentos: `consumoDiario` (ermos.js), a conta que o fim do dia
       come — uma ração e uma água por boca, por noite fora.
   A carta diz o que estas contas dizem, em palavras de quem joga, e nunca o
   nome de um mecanismo.

   O QUE O HERÓI NÃO CONHECE não se desenha: o nó escondido nem chega aqui
   (a neblina do mapa vivo; `descoberta: false` no continente), e o papel em
   volta do que se conhece fica em branco, com hachura (`conhecidoNaCarta`).
   ============================================================ */
import { colocarRotulos, curvaDaAresta, pontoNaCurva, larguraDoTexto, textoDeHoras, rumoPorExtenso } from "./faixa-do-rumo.js";
import { PORTES } from "./geografia.js";
import { PERIGO_POR_NIVEL } from "./regiao.js";
import { HORAS_MARCHA_POR_DIA } from "./viagem.js";
import { pontoDoHeroi } from "./rastro.js";
import { consumoDiario, garantirSuprimentos } from "./ermos.js";
import { horaTxt } from "./calendario.js";

const obj = (v) => (v && typeof v === "object" && !Array.isArray(v) ? v : null);
const lista = (v) => (Array.isArray(v) ? v : []);
const finito = (v) => v !== null && v !== "" && typeof v !== "boolean" && Number.isFinite(Number(v));
const norm = (s) => String(s == null ? "" : s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
const duas = (n) => Math.round(n * 100) / 100;

/* ---------------- AS MEDIDAS (formas.md §F5 §2 e §4) ----------------
   `lado` — o lado do papel desenhado (viewBox); a tela escala.
   `disco` / `alvo` — o lugar: disco de 34, alvo de toque de 44.
   `nome` / `boato` — Cinzel 13 para o lugar visto, Spectral itálico 14 para
     o que só se ouviu; `respiro` é a folga do papel por baixo do nome.
   `heroi` — a peça do herói, 36, encostada ao disco do lugar.
   `conhecido` — o raio (fração do lado) do papel desenhado em volta de cada
     lugar, pelo que o herói sabe dele; o resto fica em branco.
   `telefone` — a janela que arrasta (343 × 400) e o zoom dela. */
export const CARTA_DO_MAPA = Object.freeze({
  lado: 640,
  disco: 34,
  alvo: 44,
  glifo: 18,
  heroi: 36,
  nome: 13,
  boato: 14,
  respiro: 3,
  vao: 6,
  conhecido: { visitado: 0.2, concluido: 0.2, conhecido: 0.15, boato: 0.09, estrada: 0.11 },
  traco: { estrada: 2, trilha: 1.6, aPe: 1.6, rota: 3, costa: 1.8 },
  tracejado: { trilha: "7 5", aPe: "1 5", historia: "2 6" },
  rosa: 52,
  pilula: 44,
  regua: { segmentos: 4, altura: 6 },
  coluna: 340,
  telefone: { largura: 343, altura: 400, zoom: 1.8 },
});

/* As aguadas por chão: a chave do token em `T` e o alfa (formas.md
   `AGUADA_DA_CARTA`). A planície fica no papel. */
export const AGUADA_DA_CARTA = Object.freeze({
  costa: { cor: "aguadaMar", alfa: 0.42 },
  floresta: { cor: "aguadaMata", alfa: 0.4 },
  montanha: { cor: "aguadaMonte", alfa: 0.36 },
  colina: { cor: "aguadaMonte", alfa: 0.28 },
  pantano: { cor: "aguadaBrejo", alfa: 0.38 },
  gelo: { cor: "aguadaGelo", alfa: 0.6 },
  deserto: { cor: "aguadaAreia", alfa: 0.45 },
});

/* A luz que pinta o papel, POR BAIXO da tinta (formas.md `LUZ_DA_CARTA`):
   ao entardecer e à noite a letra fina (`tintaDim`) sai — com o papel
   tingido ela cai abaixo de 4,5. O modo sai de `modoDaLuz` (a fase do
   relógio), o mesmo que pinta a mesa. */
export const LUZ_DA_CARTA = Object.freeze({
  dia: null,
  entardecer: { tom: "tomDoEntardecer", alfa: 0.14, borda: "sombraDoEntardecer", alfaBorda: 0.22, letraFina: false },
  noite: { tom: "veuDaNoite", alfa: 0.12, borda: "veuDaNoite", alfaBorda: 0.28, halo: "haloDaVela", alfaHalo: 0.1, letraFina: false },
});

/* As caveiras do perigo, de uma a três (a régua da prancha) — a palavra vai
   sempre escrita ao lado (`PERIGO_POR_NIVEL`). */
export const CAVEIRAS_DO_PERIGO = Object.freeze({ baixo: 1, medio: 2, alto: 3, mortal: 3 });

/* ---------------- A PREPOSIÇÃO DO NOME ----------------
   O nome entra sem artigo («para Baixo Escura»); só o que já começa por
   artigo contrai («para o que sobrou de…»). A mesma decisão do mapa vivo. */
const CONTRACAO = {
  de: { o: "do", a: "da", os: "dos", as: "das" },
  em: { o: "no", a: "na", os: "nos", as: "nas" },
  para: { o: "para o", a: "para a", os: "para os", as: "para as" },
};
export function preposicao(p, nome) {
  const n = String(nome || "");
  const m = n.match(/^(O|A|Os|As) (.+)$/);
  const c = m && CONTRACAO[p] && CONTRACAO[p][m[1].toLowerCase()];
  return c ? `${c} ${m[2]}` : `${p} ${n}`;
}

const PALAVRA_DO_ESTADO = { boato: "só se ouviu falar", conhecido: "caminho conhecido", visitado: "você já esteve lá", concluido: "terminado" };
const CHAO_EM_PALAVRAS = { floresta: "na mata", gelo: "no gelo", planicie: "no campo", colina: "nas colinas", costa: "na costa", pantano: "no pântano", deserto: "no deserto", montanha: "na montanha" };
const PALAVRA_DO_PRAZO = {
  exaustao: "o cansaço chega pelo caminho",
  invocacao: "uma conjuração se desfaz",
  peticao: "uma petição fica sem resposta",
  revolta: "um domínio se revolta",
  nemesis: "a ameaça dá um passo",
};
const noPorId = (dados, id) => (obj(dados) && lista(dados.nos).find((n) => obj(n) && n.id === id)) || null;
const rotuloDoPerigo = (id) => (PERIGO_POR_NIVEL.find((p) => p.id === id) || {}).rotulo || "";
const plural = (n, um, varios) => `${n} ${n === 1 ? um : varios}`;
/* «4,5 dias», «1 dia»: uma casa, vírgula, sem «,0» */
export function diasEmTexto(d) {
  if (!finito(d)) return "";
  const v = Math.round(Number(d) * 10) / 10;
  return `${String(v).replace(".", ",")} ${v === 1 ? "dia" : "dias"}`;
}

/* ============================================================
   O CONTINENTE — a mesma forma de dados, lida do mapa guardado
   ============================================================
   `dadosDaCartaDoContinente(mapa, estado)` → a forma que a carta desenha
   (nos, arestas, heroi, relogio), ou null. Para o mapa SEM região — onde
   `dadosDoMapaVivo` dá null. Não decide nada: a cidade escondida
   (`descoberta: false`) não entra; a que só se ouviu (`deOuvir`) é boato; a
   pisada é visitada; a estrada é a rota guardada, com os dias dela. O quadro
   é o de TODAS as cidades, as escondidas incluídas (o tamanho do papel não
   pode contar que há terra por descobrir). Um mundo vertical (a Torre) não
   é mapa: null, e fica a escada de sempre.
   `estado`: { cidadeAtual, jornada, masmorra, dia, minuto, vertical } */
export function dadosDaCartaDoContinente(mapa, estado) {
  const m = obj(mapa);
  if (!m) return null;
  const e = obj(estado) || {};
  if (e.vertical) return null;
  const todas = lista(m.cidades).filter((c) => obj(c) && c.nome && finito(c.x) && finito(c.y));
  const vistas = todas.filter((c) => c.descoberta !== false);
  if (!vistas.length) return null;
  const xs = todas.map((c) => Number(c.x)), ys = todas.map((c) => Number(c.y));
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const margem = 0.08;
  const lado = Math.max(x1 - x0, y1 - y0, 1e-6) / (1 - 2 * margem);
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const nx = (x) => Math.round((0.5 + (Number(x) - cx) / lado) * 10000) / 10000;
  const ny = (y) => Math.round((0.5 + (Number(y) - cy) / lado) * 10000) / 10000;
  const id = (nome) => `cidade|${nome}`;
  const aqui = norm(e.cidadeAtual);
  const jornada = obj(e.jornada) && e.jornada.para ? e.jornada : null;
  const nos = vistas.map((c) => {
    const pisada = !!c.pisada || (norm(c.nome) === aqui && !jornada);
    const estadoDoNo = pisada ? "visitado" : c.deOuvir ? "boato" : "conhecido";
    return {
      id: id(c.nome), nome: String(c.nome), tipo: "povoado", subtipo: String(c.porte || c.tipo || ""),
      x: nx(c.x), y: ny(c.y), estado: estadoDoNo, bioma: c.bioma ? String(c.bioma) : null,
      perigo: null, horasDaBase: null, vizinhos: [], aqui: norm(c.nome) === aqui && !jornada && !obj(e.masmorra),
    };
  });
  const visivel = new Set(nos.map((n) => n.id));
  const arestas = [];
  const vistos = new Set();
  for (const r of lista(m.rotas)) {
    if (!obj(r) || !r.de || !r.para || !finito(r.dias)) continue;
    const de = id(r.de), para = id(r.para);
    if (!visivel.has(de) || !visivel.has(para) || de === para) continue;
    const k = [de, para].sort().join("~");
    if (vistos.has(k)) continue;
    vistos.add(k);
    arestas.push({ id: k, de, para, dias: Number(r.dias), horas: duas(Number(r.dias) * HORAS_MARCHA_POR_DIA), modo: "estrada", origem: "rota", perigo: null, km: finito(r.km) ? Number(r.km) : null, tipoDeChao: String(r.terreno || "") });
  }
  for (const n of nos) {
    n.vizinhos = arestas.filter((a) => a.de === n.id || a.para === n.id).map((a) => ({ id: a.de === n.id ? a.para : a.de, horas: a.horas, dias: a.dias }));
  }
  let heroi = { onde: "nenhum", noId: null, x: null, y: null };
  const noAqui = nos.find((n) => n.aqui);
  if (obj(e.masmorra) && e.masmorra.nome) {
    heroi = { onde: "masmorra", noId: null, x: null, y: null, masmorra: { nome: String(e.masmorra.nome), progresso: {} } };
  } else if (jornada) {
    let pt = null;
    try { pt = pontoDoHeroi({ cidadeAtual: e.cidadeAtual || "", jornada, mapa: m }); } catch { pt = null; }
    const deN = nos.find((n) => norm(n.nome) === norm(jornada.de));
    const paraN = nos.find((n) => norm(n.nome) === norm(jornada.para));
    const k = deN && paraN ? [deN.id, paraN.id].sort().join("~") : null;
    heroi = {
      onde: "viagem", noId: null,
      x: pt && finito(pt.x) ? Math.max(0, Math.min(1, nx(pt.x))) : null,
      y: pt && finito(pt.y) ? Math.max(0, Math.min(1, ny(pt.y))) : null,
      jornada: { de: String(jornada.de || ""), para: String(jornada.para || ""), deId: deN ? deN.id : null, paraId: paraN ? paraN.id : null, arestaId: k && vistos.has(k) ? k : null, fracao: null, horasQueFaltam: null },
    };
  } else if (noAqui) {
    heroi = { onde: "povoado", noId: noAqui.id, x: noAqui.x, y: noAqui.y };
  }
  const relogio = finito(e.dia) ? { dia: Number(e.dia), hora: finito(e.minuto) ? horaTxt(Math.max(0, Math.floor(Number(e.minuto))) % 1440) : "", fase: null } : null;
  return { regiao: { nome: "" }, continente: true, quadro: null, nos, arestas, heroi, horizonte: [], relogio };
}

/* O veredito da partida no continente: a rota guardada daqui até lá, com os
   dias que `viajarPeloMapa` cobra. Sem rota direta, sem preço: null (e a
   carta diz que a estrada não está desenhada). Em viagem ou lá dentro, null. */
export function vereditoNoContinente(dados, destinoId) {
  const d = obj(dados);
  if (!d || !d.continente) return null;
  const h = obj(d.heroi) || {};
  if (h.onde !== "povoado" || !h.noId || h.noId === destinoId) return null;
  const a = lista(d.arestas).find((x) => (x.de === h.noId && x.para === destinoId) || (x.para === h.noId && x.de === destinoId));
  const no = noPorId(d, destinoId);
  if (!a || !no) return null;
  /* as noites fora: os dias arredondados, como o aviso de antes da partida
     (`faltaComidaParaPartir`, mercado.js) os conta */
  return { destino: { id: no.id, nome: no.nome, tipo: no.tipo }, horas: a.horas, dias: a.dias, noites: Math.max(1, Math.round(a.dias)), chegada: null, modo: "estrada", rota: [h.noId, destinoId], pernas: [{ de: h.noId, para: destinoId, horas: a.horas, modo: "estrada" }], perigoDaEstrada: null, horasDeVolta: a.horas, prazos: [], desafio: null };
}

/* ============================================================
   O DESENHO — onde cada coisa pousa no papel
   ============================================================ */
const px = (v, lado) => duas(Number(v) * lado);
const curvaDe = (a, pa, pb) => {
  const c = curvaDaAresta(pa, pb, a.id);
  return { c, d: `M${pa.x} ${pa.y}Q${c.x} ${c.y} ${pb.x} ${pb.y}` };
};
const TRACO_DA_ARESTA = (a) => (a.origem === "rota" ? "estrada" : a.modo === "a_pe" ? "aPe" : "trilha");

/* O caminho de uma lista de nós (a rota do veredito), perna a perna: pela
   curva da estrada quando ela existe, reto quando não. */
function caminhoDaRota(ids, pos, arestas) {
  const ps = lista(ids).filter((id) => pos[id]);
  if (ps.length < 2) return "";
  let d = `M${pos[ps[0]].x} ${pos[ps[0]].y}`;
  for (let i = 1; i < ps.length; i++) {
    const a = ps[i - 1], b = ps[i];
    const ar = arestas.find((x) => (x.de === a && x.para === b) || (x.de === b && x.para === a));
    if (ar) {
      const pa = pos[ar.de], pb = pos[ar.para];
      const c = curvaDaAresta(pa, pb, ar.id);
      d += `Q${c.x} ${c.y} ${pos[b].x} ${pos[b].y}`;
    } else d += `L${pos[b].x} ${pos[b].y}`;
  }
  return d;
}

/* `desenhoDaCarta(dados, { lado, rota, historia })` → tudo em px no papel:
     nos       — { id, nome, x, y, estado, aqui, tipo, subtipo, concluido }
     estradas  — { id, d, traco ("estrada"|"trilha"|"aPe"), fraca }
     rotulos   — por id, a caixa do nome (sem colisão) e o tamanho da letra
     heroi     — { x, y } ou null (na estrada, sobre a curva andada)
     andado    — o caminho já andado da viagem em curso ("" sem viagem)
     rota      — o caminho do destino escolhido (a lista do veredito)
     historia  — o caminho até onde a história chama (outra lista)
     pilula    — { x, y } — o meio da primeira perna da rota (para o tempo)
     conhecido — os círculos do papel desenhado { x, y, r }
     cantoVazio— o canto mais longe de tudo o que se conhece (a nota
                 «terra não vista»), ou null quando não há canto vazio. */
export function desenhoDaCarta(dados, opcoes) {
  const d = obj(dados);
  if (!d) return null;
  const o = obj(opcoes) || {};
  const C = CARTA_DO_MAPA;
  const lado = finito(o.lado) ? Number(o.lado) : C.lado;
  const nosD = lista(d.nos).filter((n) => obj(n) && finito(n.x) && finito(n.y));
  const pos = Object.fromEntries(nosD.map((n) => [n.id, { x: px(n.x, lado), y: px(n.y, lado) }]));
  const estadoDe = Object.fromEntries(nosD.map((n) => [n.id, n.estado]));
  const arestas = lista(d.arestas).filter((a) => obj(a) && pos[a.de] && pos[a.para]);
  const estradas = arestas.map((a) => ({ id: a.id, d: curvaDe(a, pos[a.de], pos[a.para]).d, traco: TRACO_DA_ARESTA(a), fraca: estadoDe[a.de] === "boato" || estadoDe[a.para] === "boato" }));

  const h = obj(d.heroi) || {};
  const j = h.onde === "viagem" ? obj(h.jornada) : null;
  let heroi = null, andado = "";
  if (j && j.arestaId && finito(j.fracao)) {
    const a = arestas.find((x) => x.id === j.arestaId);
    if (a) {
      const pa = pos[a.de], pb = pos[a.para];
      const { c } = curvaDe(a, pa, pb);
      const ida = a.de === j.deId;
      const pts = [];
      for (let k = 0; k <= 16; k++) { const t = (k / 16) * Number(j.fracao); pts.push(pontoNaCurva(pa, c, pb, ida ? t : 1 - t)); }
      andado = `M${pts.map((q) => `${q.x} ${q.y}`).join("L")}`;
      heroi = pts[pts.length - 1];
    }
  }
  if (!heroi && h.noId && pos[h.noId]) heroi = { x: duas(pos[h.noId].x + C.disco * 0.55), y: duas(pos[h.noId].y - C.disco * 0.75) };
  if (!heroi && finito(h.x) && finito(h.y)) heroi = { x: px(h.x, lado), y: px(h.y, lado) };

  const rotaIds = lista(o.rota);
  const rota = caminhoDaRota(rotaIds, pos, arestas);
  const historia = caminhoDaRota(lista(o.historia), pos, arestas);
  let pilula = null;
  /* a pílula só numa perna onde cabe (três pílulas de comprimento): na perna
     curta ela tapava os nomes das duas pontas, e as horas já estão no cartão */
  const pernaCabe = rotaIds.length >= 2 && pos[rotaIds[0]] && pos[rotaIds[1]] && Math.hypot(pos[rotaIds[1]].x - pos[rotaIds[0]].x, pos[rotaIds[1]].y - pos[rotaIds[0]].y) >= 3 * C.pilula;
  if (pernaCabe) {
    /* a pílula pousa na primeira perna, no ponto mais longe de todo disco
       (o meio da perna caía às vezes em cima de outro lugar) */
    const a = pos[rotaIds[0]], b = pos[rotaIds[1]];
    const ar = arestas.find((x) => (x.de === rotaIds[0] && x.para === rotaIds[1]) || (x.de === rotaIds[1] && x.para === rotaIds[0]));
    const c = ar ? curvaDaAresta(pos[ar.de], pos[ar.para], ar.id) : { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    const ida = !ar || ar.de === rotaIds[0];
    let melhor = null;
    for (let k = 3; k <= 7; k++) {
      const tt = k / 10;
      const p = ar ? pontoNaCurva(pos[ar.de], c, pos[ar.para], ida ? tt : 1 - tt) : { x: a.x + (b.x - a.x) * tt, y: a.y + (b.y - a.y) * tt };
      const folga = Math.min(...nosD.map((n) => Math.hypot(pos[n.id].x - p.x, pos[n.id].y - p.y)));
      if (!melhor || folga > melhor.folga) melhor = { ...p, folga };
    }
    pilula = { x: duas(melhor.x), y: duas(melhor.y) };
  }

  /* os nomes: o lugar onde se está e o destino escolhem primeiro (a regra
     da faixa do rumo: «você está aqui» e o destino pousam antes) */
  const prioridade = (n) => (n.aqui || n.id === h.noId ? 0 : n.id === o.destino ? 1 : n.estado === "visitado" ? 2 : n.estado === "boato" ? 4 : 3);
  const tam = (n) => (n.estado === "boato" ? C.boato : C.nome);
  /* o Cinzel é todo em versal: mais largo que a média do display (+60 %,
     medido na prova a 1440 — com +35 % «Forte Abandonado de Mil Bocas»
     saía cortado pela borda); o Spectral itálico do boato, +10 % */
  const rotulos = colocarRotulos([...nosD].sort((a, b) => prioridade(a) - prioridade(b)).map((n) => ({
    id: n.id, x: pos[n.id].x, y: pos[n.id].y, raio: C.disco / 2,
    largura: duas(larguraDoTexto(n.nome, tam(n)) * (n.estado === "boato" ? 1.1 : 1.6) + 2 * C.respiro),
    altura: duas(tam(n) * 1.25 + 2 * C.respiro),
  })), { lado, vao: C.vao });
  for (const n of nosD) if (rotulos[n.id]) rotulos[n.id].tamanho = tam(n);
  /* NENHUM NOME SOBRE OUTRO (a regra 4 de FAIXA_DO_RUMO): quando nem a segunda
     fila cabe, o nome fica escondido e só a marca fica — ele aparece ao tocar
     no lugar (o escolhido vence sempre). Na ordem da prioridade: quem escolheu
     primeiro fica. */
  const aceitos = [];
  const sobre = (a, b) => a.x < b.x + b.largura && b.x < a.x + a.largura && a.y < b.y + b.altura && b.y < a.y + a.altura;
  for (const n of [...nosD].sort((a, b) => (a.id === o.destino ? -1 : b.id === o.destino ? 1 : prioridade(a) - prioridade(b)))) {
    const r = rotulos[n.id];
    if (!r) continue;
    /* o nome também não tapa o disco de outro lugar; o destino e o lugar onde
       se está nunca se escondem (escolhem primeiro) */
    /* o destino nunca se esconde; o lugar onde se está só cede ao destino (a
       peça do herói e «Você está em…» já dizem onde ele está) */
    const firme = n.id === o.destino || ((n.aqui || n.id === h.noId) && !aceitos.some((x) => sobre(r, x)));
    const tapaDisco = nosD.some((m) => m.id !== n.id && sobre(r, { x: pos[m.id].x - C.disco / 2, y: pos[m.id].y - C.disco / 2, largura: C.disco, altura: C.disco }));
    if (!firme && (aceitos.some((x) => sobre(r, x)) || tapaDisco)) { r.oculto = true; continue; }
    aceitos.push(r);
  }

  const conhecido = nosD.map((n) => ({ x: pos[n.id].x, y: pos[n.id].y, r: duas((C.conhecido[n.estado] || C.conhecido.boato) * lado) }));
  if (heroi && j) conhecido.push({ x: heroi.x, y: heroi.y, r: duas(C.conhecido.estrada * lado) });

  /* o canto vazio: dos quatro, o mais longe do papel desenhado — se nenhum
     fica fora de todos os círculos, não há terra não vista a dizer */
  /* os cantos livres da rosa (alto à direita) e da régua (baixo à esquerda):
     a nota pousa por dentro deles */
  const cantos = [[0.16, 0.12], [0.84, 0.24], [0.2, 0.82], [0.84, 0.9]].map(([cx, cy]) => ({ x: cx * lado, y: cy * lado }));
  const folga = (p) => Math.min(...conhecido.map((k) => Math.hypot(p.x - k.x, p.y - k.y) - k.r), Infinity);
  const melhor = cantos.map((p) => ({ ...p, f: folga(p) })).sort((a, b) => b.f - a.f)[0];
  const cantoVazio = melhor && melhor.f > 0 ? { x: duas(melhor.x), y: duas(melhor.y) } : null;

  return {
    lado,
    nos: nosD.map((n) => ({ id: n.id, nome: n.nome, x: pos[n.id].x, y: pos[n.id].y, estado: n.estado, aqui: !!n.aqui || n.id === h.noId, tipo: n.tipo, subtipo: n.subtipo, concluido: n.estado === "concluido" })),
    estradas, rotulos, heroi, andado, rota, historia, pilula, conhecido, cantoVazio,
  };
}

/* ============================================================
   AS PALAVRAS — o que a coluna escreve
   ============================================================ */

/* «Você está em Velha Valente.» — de onde o herói olha a carta. */
export function ondeEstaNaCarta(dados, chegada = null) {
  const d = obj(dados);
  if (!d) return "";
  const h = obj(d.heroi) || {};
  const no = noPorId(d, h.noId);
  if (h.onde === "viagem" && obj(h.jornada)) {
    const j = h.jornada;
    const para = (noPorId(d, j.paraId) || {}).nome || j.para;
    const falta = finito(j.horasQueFaltam) ? `, faltam ${textoDeHoras(j.horasQueFaltam)}` : "";
    const quando = obj(chegada) && chegada.hora ? `; você chega às ${chegada.hora}${chegada.noite ? ", de noite" : ""}` : "";
    return `Na estrada ${preposicao("para", para)}${falta}${quando}.`;
  }
  if (h.onde === "masmorra" && obj(h.masmorra)) return `Você está dentro ${preposicao("de", h.masmorra.nome)}.`;
  if (h.onde === "boca" && no) return `Você está à porta ${preposicao("de", no.nome)}.`;
  if (h.onde === "arredor" && h.lugar) return `Você está ${preposicao("em", h.lugar)}${h.cidade ? `, fora ${preposicao("de", h.cidade)}` : ""}.`;
  if ((h.onde === "base" || h.onde === "povoado") && no) return `Você está ${preposicao("em", no.nome)}.`;
  return "Você está longe de qualquer lugar que a carta conheça.";
}

/* «vila · na costa · 4 h a sudoeste de Velha Valente» */
export function subtituloNaCarta(dados, no) {
  const d = obj(dados), n = obj(no);
  if (!d || !n) return "";
  const tipo = n.tipo === "lugar" ? String(n.subtipo || "") : ((PORTES[n.subtipo] || {}).rotulo || String(n.subtipo || ""));
  const chao = CHAO_EM_PALAVRAS[n.bioma] || "";
  const base = lista(d.nos).find((x) => obj(x) && x.tipo === "base");
  let longe = "";
  if (base && base.id !== n.id && finito(n.horasDaBase)) longe = `${textoDeHoras(n.horasDaBase)} ${rumoPorExtenso(base, n)} ${preposicao("de", base.nome)}`.replace(/\s+/g, " ").trim();
  return [tipo, chao, longe].filter(Boolean).join(" · ");
}

/* A palavra do estado do lugar (o selo do cartão). */
export function estadoEmPalavras(no, heroi = null) {
  const n = obj(no);
  if (!n) return "";
  const h = obj(heroi) || {};
  if (h.onde === "viagem" && obj(h.jornada) && h.jornada.paraId === n.id) return "a caminho";
  return PALAVRA_DO_ESTADO[n.estado] || "";
}

/* O QUE A VIAGEM COME. Uma ração e uma água por boca, a cada noite fora
   (`consumoDiario`, a conta do fim do dia). Sem noite fora, nada sai da
   bolsa. `falta` diz o que não chega, em número. */
export function mantimentosDaViagem(noites, bocas, suprimentos) {
  const n = finito(noites) ? Math.max(0, Math.round(Number(noites))) : null;
  if (n == null) return null;
  const s = garantirSuprimentos(suprimentos);
  if (n === 0) return { noites: 0, racoes: 0, agua: 0, temRacoes: s.racoes, temAgua: s.agua, faltamRacoes: 0, faltamAgua: 0, texto: "Sem noite fora: os mantimentos ficam na bolsa.", falta: false };
  const c = consumoDiario(Math.max(1, Number(bocas) || 1));
  const racoes = c.racoes * n, agua = c.agua * n;
  const faltamRacoes = Math.max(0, racoes - s.racoes), faltamAgua = Math.max(0, agua - s.agua);
  const gasto = `${plural(racoes, "ração", "rações")} e ${plural(agua, "água", "águas")}`;
  const leva = `você leva ${s.racoes} e ${s.agua}`;
  const faltam = [faltamRacoes ? plural(faltamRacoes, "ração", "rações") : "", faltamAgua ? plural(faltamAgua, "água", "águas") : ""].filter(Boolean).join(" e ");
  return {
    noites: n, racoes, agua, temRacoes: s.racoes, temAgua: s.agua, faltamRacoes, faltamAgua,
    texto: faltam ? `Gasta ${gasto} — ${leva}: faltam ${faltam}.` : `Gasta ${gasto} (${leva}).`,
    falta: !!faltam,
  };
}

/* O VEREDITO ANTES DO CLIQUE, em palavras. `partidaNaCarta(dados, no, v, {
   chegada, suprimentos, bocas })` →
     { verbo, impedido, preco, mantimentos, caminho: [linhas], perigo }
   · `verbo` — «Partir para X», ou null quando não há partida daqui (o lugar
     onde se está, ou um lugar sem estrada desenhada e sem horas);
   · `impedido` — na estrada ou lá dentro, a razão (o botão desliga);
   · `preco` — horas ou dias, a chegada, as noites fora, o que vence pelo
     caminho — tudo do veredito, nada da tela;
   · `caminho` — o que o herói já sabe que há no caminho: por onde passa, e
     o perigo da estrada quando as duas pontas o mostram. */
export function partidaNaCarta(dados, no, veredito, opcoes) {
  const d = obj(dados), n = obj(no);
  if (!d || !n) return null;
  const o = obj(opcoes) || {};
  const h = obj(d.heroi) || {};
  const v = obj(veredito);
  const aqui = !!n.aqui || h.noId === n.id;
  if (aqui) return { verbo: null, impedido: null, preco: "", mantimentos: null, caminho: [], perigo: null };
  const verbo = `Partir ${preposicao("para", n.nome)}`;
  if (h.onde === "viagem") {
    const j = obj(h.jornada) || {};
    const ch = obj(o.chegada);
    return { verbo: "Você já está na estrada", impedido: [finito(j.horasQueFaltam) ? `faltam ${textoDeHoras(j.horasQueFaltam)}` : "", ch && ch.hora ? `você chega às ${ch.hora}` : ""].filter(Boolean).join(" · ") || "termine a viagem antes de partir de novo", preco: "", mantimentos: null, caminho: [], perigo: null };
  }
  if (h.onde === "masmorra") return { verbo: "Você está lá dentro", impedido: "saia primeiro para partir", preco: "", mantimentos: null, caminho: [], perigo: null };
  if (!v) {
    if (finito(n.horasDaBase)) return { verbo, impedido: null, preco: `${textoDeHoras(n.horasDaBase)} de estrada`, mantimentos: null, caminho: [], perigo: null };
    if (d.continente) return { verbo, impedido: null, preco: "Não há estrada desenhada daqui até lá: os dias só se sabem andando.", mantimentos: null, caminho: [], perigo: null, semPreco: true };
    return { verbo: null, impedido: null, preco: "", mantimentos: null, caminho: [], perigo: null };
  }
  const via = lista(v.rota).slice(1, -1).map((id) => (noPorId(d, id) || {}).nome).filter(Boolean);
  const partes = [];
  if (finito(v.dias) && d.continente) partes.push(`${diasEmTexto(v.dias)} de viagem`);
  else partes.push(`${textoDeHoras(v.horas)} ${v.modo === "a_pe" ? "a pé" : "de estrada"}`);
  const rel = obj(d.relogio);
  if (obj(v.chegada) && v.chegada.hora) {
    const outroDia = rel && Number(v.chegada.dia) > Number(rel.dia) ? ` do dia ${v.chegada.dia}` : "";
    partes.push(`chega às ${v.chegada.hora}${outroDia}${v.chegada.noite ? ", de noite" : ""}`);
  }
  if (finito(v.noites)) partes.push(Number(v.noites) === 0 ? "sem noite ao relento" : `${plural(Number(v.noites), "noite", "noites")} ao relento`);
  for (const p of lista(v.prazos)) if (obj(p) && PALAVRA_DO_PRAZO[p.id]) partes.push(PALAVRA_DO_PRAZO[p.id]);
  const caminho = [];
  if (via.length) caminho.push(`Passa por ${via.join(" e ")}.`);
  if (v.perigoDaEstrada) caminho.push(`A estrada: ${rotuloDoPerigo(v.perigoDaEstrada)}.`);
  if (obj(v.desafio) && v.desafio.rotulo) caminho.push(`Lá: ${String(v.desafio.rotulo).toLowerCase()}.`);
  return {
    verbo, impedido: null, preco: partes.join(" · "),
    mantimentos: mantimentosDaViagem(v.noites, o.bocas, o.suprimentos),
    caminho, perigo: v.perigoDaEstrada || null,
  };
}

/* O PERIGO DO LUGAR, como a régua da prancha: as caveiras cheias e a
   palavra. `null` quando a carta não sabe (o boato não tem ficha). */
export function perigoNaCarta(no, veredito = null) {
  const n = obj(no);
  if (!n) return null;
  const v = obj(veredito);
  const id = (v && obj(v.desafio) && v.desafio.selo) || n.perigo || null;
  if (!id || !CAVEIRAS_DO_PERIGO[id]) return null;
  return { id, cheias: CAVEIRAS_DO_PERIGO[id], de: 3, palavra: rotuloDoPerigo(id) };
}
