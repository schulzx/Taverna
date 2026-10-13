/* ============================================================
   A FAIXA DO RUMO E A CARTA — a conta do mapa vivo (MM17, a tela)

   `formas.md` § Mapa §10: "a matemática da faixa (rumo, profundidade,
   janela de 140°, a frente) e a colocação dos rótulos sem colisão são
   CONTA, não tela: módulo puro com suíte própria — determinístico, sem
   React." É isto. `painel-mapa-vivo.jsx` só desenha o que daqui sai, e
   `testes/teste-painel-mapa-vivo.mjs` prova os números contra os nós do
   Figma (a semente 0, `172:1467`).

   NÃO DECIDE NADA DO JOGO. Tudo o que é verdade — onde o herói está, o que
   a neblina mostra, o perigo, as horas — vem pronto de `dadosDoMapaVivo`
   (mapa-vivo.js) e de `vereditoDaPartida` (partida.js). Aqui só se projeta:
   um rumo vira um x, uma distância vira um tamanho, um nome procura sítio.
   Os números da projecção são tabela (`MAPA_VIVO`, estilo.js).

   O QUE NUNCA SAI DAQUI (o mapa não estraga, §5): o fundo e as cristas lêem
   o chão dos nós VISÍVEIS, e o lugar do fim (`atoDaHistoria === "fim"`)
   não entra no chão nem quando aparece — uma mancha de gelo nova no dia da
   revelação diria o mesmo que o ponto. A névoa e a contagem de ocultos não
   passam por aqui.

   Puro: o único sorteio é `rngDe` (geografia.js) com o nome da região.
   ============================================================ */
import { MAPA_VIVO } from "./estilo.js";
import { RUMOS, grausEntre } from "./coordenadas.js";
import { rngDe } from "./geografia.js";

const obj = (v) => (v && typeof v === "object" && !Array.isArray(v) ? v : null);
const lista = (v) => (Array.isArray(v) ? v : []);
const finito = (v) => v !== null && v !== "" && typeof v !== "boolean" && Number.isFinite(Number(v));
const prender = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const duas = (n) => Math.round(n * 100) / 100;
/* o desvio de um rumo para a frente, em (−180, 180] */
const desvio = (g, frente) => { let d = ((g - frente) % 360 + 360) % 360; if (d > 180) d -= 360; return d; };
/* um hash pequeno e estável de uma chave de texto, em [0, 1) */
function hash01(chave) {
  let h = 2166136261;
  const s = String(chave);
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return (h >>> 0) / 4294967296;
}

const CHAOS = Object.keys(MAPA_VIVO.modos.dia.chao);

/* ---------------- A HORA, O MODO ---------------- */

/* Que modo (dia · entardecer · noite) a fase do relógio pinta. Sem relógio,
   o dia — a tela não inventa noite. */
export function modoDaLuz(relogio) {
  const f = obj(relogio) && relogio.fase;
  return MAPA_VIVO.modoDaFase[f] || "dia";
}

/* ---------------- A FRENTE ----------------
   O alvo do feixe (§1, a condição do `jogo`): na estrada, o destino; fora
   dela, o nó com `momento` "proximo", ou "agora" onde o herói não está;
   sem nenhum, ninguém — e a frente é o norte. Lê SÓ `momento` (§2, o
   feixe nunca lê `atoDaHistoria`). */
export function alvoDoFeixe(dados) {
  const d = obj(dados);
  if (!d) return null;
  const h = obj(d.heroi) || {};
  const nos = lista(d.nos).filter(obj);
  if (h.onde === "viagem") {
    const id = obj(h.jornada) && h.jornada.paraId;
    return (id && nos.find((n) => n.id === id)) || null;
  }
  return nos.find((n) => n.momento === "proximo")
    || nos.find((n) => n.momento === "agora" && !n.aqui && n.id !== h.noId)
    || null;
}

/* De onde o herói olha: o ponto dele, ou o do nó onde está. */
function olhoDoHeroi(d) {
  const h = obj(d.heroi) || {};
  if (finito(h.x) && finito(h.y)) return { x: Number(h.x), y: Number(h.y) };
  const n = h.noId ? lista(d.nos).find((x) => obj(x) && x.id === h.noId) : null;
  return n ? { x: n.x, y: n.y } : null;
}

/* O rumo (0 = norte, em graus) e a distância (km) de um nó, vistos do herói. */
export function rumoEDistancia(dados, no) {
  const d = obj(dados), n = obj(no);
  if (!d || !n) return null;
  const o = olhoDoHeroi(d);
  if (!o || !finito(n.x) || !finito(n.y)) return null;
  const g = grausEntre(o, { x: n.x, y: n.y });
  const ladoKm = obj(d.quadro) && finito(d.quadro.ladoKm) ? Number(d.quadro.ladoKm) : 0;
  return { graus: g == null ? 0 : g, km: Math.hypot(n.x - o.x, n.y - o.y) * ladoKm, mesmoPonto: g == null };
}

/* ---------------- A LETRA SEM MEDIR ----------------
   A largura de um texto pela largura média da família (em em) — a carta
   coloca nomes antes de os ter no ecrã. O mono é exacto (todo caractere
   tem a mesma largura); o display é a média medida nos nós do Figma. */
export function larguraDoTexto(texto, tamanho, familia = "display", rastreio = 0) {
  const n = String(texto || "").length;
  if (!n) return 0;
  const m = MAPA_VIVO.carta.letraMedia[familia] || MAPA_VIVO.carta.letraMedia.display;
  return duas(n * m * tamanho + Math.max(0, n - 1) * rastreio * tamanho);
}

/* ---------------- A FAIXA ----------------
   Tudo o que a faixa desenha, em px, para uma largura dada. A altura é a
   da tabela (96 · 48 no telefone); a escala vertical do telefone é 48/96. */
export function itensDaFaixa(dados, opcoes) {
  const d = obj(dados);
  const o = obj(opcoes) || {};
  const F = MAPA_VIVO.faixa, Md = MAPA_VIVO.medidas;
  const telefone = !!o.telefone;
  const largura = finito(o.largura) && Number(o.largura) > 0 ? Number(o.largura) : 1142;
  const altura = telefone ? Md.faixaTelefone : Md.faixa;
  const escala = altura / Md.faixa;
  const janela = telefone ? Md.janelaTelefone : Md.janela;
  if (!d) return null;

  const alvo = alvoDoFeixe(d);
  const ra = alvo ? rumoEDistancia(d, alvo) : null;
  const frente = ra && !ra.mesmoPonto ? ra.graus : 0;
  const xDe = (g) => {
    const dv = desvio(g, frente);
    if (Math.abs(dv) > janela / 2) return null;
    return duas(largura / 2 + (dv * largura) / janela);
  };

  const rumos = RUMOS.map((r, i) => ({ id: r.id, curto: r.curto, x: xDe(i * 45), norte: i === 0 }))
    .filter((r) => r.x != null && r.x >= 0 && r.x <= largura);

  const ladoKm = obj(d.quadro) && finito(d.quadro.ladoKm) ? Number(d.quadro.ladoKm) : 1;
  const longe = ladoKm * Md.longe;
  const h = obj(d.heroi) || {};
  const lugares = [];
  for (const n of lista(d.nos).filter(obj)) {
    if (n.aqui || n.id === h.noId) continue;
    const r = rumoEDistancia(d, n);
    if (!r || r.mesmoPonto) continue;
    const x = xDe(r.graus);
    if (x == null) continue;
    const f = prender(r.km / longe, 0, 1);
    lugares.push({
      id: n.id, nome: n.nome, tipo: n.tipo, subtipo: n.subtipo, estado: n.estado, momento: n.momento,
      graus: duas(r.graus), km: duas(r.km), x,
      lado: duas(lerp(F.lugar.perto, F.lugar.longe, f) * escala),
      cy: duas(lerp(F.lugar.centroPerto, F.lugar.centroLonge, f) * escala),
      opacidade: alvo && n.id === alvo.id ? 1 : duas(lerp(F.lugar.opacidadePerto, F.lugar.opacidadeLonge, f)),
      alvo: !!(alvo && n.id === alvo.id),
    });
  }
  /* o longe por baixo, o perto por cima, o alvo por cima de todos */
  lugares.sort((a, b) => (a.alvo - b.alvo) || (b.km - a.km));

  /* o horizonte: cada nome no seu rumo; o que cai a menos de `cedeAoFeixe`
     do feixe SOME; os que ficam alternam as duas filas, da esquerda para a
     direita. No telefone não há horizonte. */
  const horizonte = [];
  if (!telefone) {
    const H = F.horizonte;
    const cand = [];
    for (const hz of lista(d.horizonte).filter(obj)) {
      const i = RUMOS.findIndex((r) => r.id === hz.rumo);
      if (i < 0) continue;
      const x = xDe(i * 45);
      if (x == null) continue;
      const texto = String(hz.nome || "").toUpperCase();
      const w = larguraDoTexto(texto, F.rumos.letra, "mono", H.rastreio);
      const esq = x - w / 2, dir = x + w / 2;
      const meio = largura / 2;
      const oculto = !!alvo && esq - H.cedeAoFeixe < meio && dir + H.cedeAoFeixe > meio;
      cand.push({ nome: String(hz.nome), texto, x, largura: w, oculto });
    }
    cand.sort((a, b) => a.x - b.x);
    let k = 0;
    for (const c of cand) horizonte.push({ ...c, y: duas(H.filas[c.oculto ? 0 : (k++) % H.filas.length] * escala) });
  }

  /* o astro anda pelo minuto: o sol nasce a leste (90°) às 06:00, passa a
     sul ao meio-dia e põe-se a oeste às 18:00; a lua faz o mesmo arco do
     lado de lá da noite. No telefone, só ícones. */
  let astro = null;
  const rel = obj(d.relogio);
  if (!telefone && rel && finito(rel.minuto)) {
    const m = Number(rel.minuto);
    const sol = m >= 360 && m <= 1080;
    const mm = sol ? m : (m + 720) % 1440;
    const t = prender((mm - 360) / 720, 0, 1);
    const x = xDe(90 + t * 180);
    if (x != null) astro = { tipo: sol ? "sol" : "lua", x, y: duas((F.astro.base - F.astro.arco * Math.sin(Math.PI * t)) * escala), lado: F.astro.lado };
  }

  return { largura, altura, escala, janela, frente: duas(frente), alvoId: alvo ? alvo.id : null, modo: modoDaLuz(rel), rumos, lugares, horizonte, astro };
}

/* ---------------- O CHÃO ----------------
   O chão de cada nó visível, para o fundo da carta e as cristas da faixa.
   `no.bioma` quando o motor o der (pedido P1); até lá, o chão da ida que o
   jogo cobra da base a esse lugar (a aresta da ficha, `tipoDeChao`); e o
   chão da região para o resto. O lugar do fim não entra (ver o cabeçalho). */
export function chaosDosNos(dados) {
  const d = obj(dados);
  if (!d) return [];
  const doQuadro = obj(d.quadro) && CHAOS.includes(d.quadro.chao) ? d.quadro.chao : "planicie";
  const nos = lista(d.nos).filter(obj);
  const base = nos.find((n) => n.tipo === "base");
  const arestas = lista(d.arestas).filter(obj);
  const out = [];
  for (const n of nos) {
    if (n.atoDaHistoria === "fim") continue;
    if (!finito(n.x) || !finito(n.y)) continue;
    let bioma = CHAOS.includes(n.bioma) ? n.bioma : null;
    if (!bioma && n.tipo === "lugar" && base) {
      const a = arestas.find((x) => x.origem === "ficha" && ((x.de === base.id && x.para === n.id) || (x.para === base.id && x.de === n.id)));
      if (a && CHAOS.includes(a.tipoDeChao)) bioma = a.tipoDeChao;
    }
    out.push({ id: n.id, x: Number(n.x), y: Number(n.y), bioma: bioma || doQuadro });
  }
  return out;
}

/* O chão de um ponto (normalizado): o do nó mais perto, com a borda
   mexida pelo ruído (massas, não papel de parede). */
export function chaoEm(x, y, chaos, ruido = MAPA_VIVO.carta.fundo.ruido) {
  const c = lista(chaos);
  if (!c.length) return "planicie";
  const jx = (hash01(`${Math.round(x * 400)}|${Math.round(y * 400)}|x`) - 0.5) * 2 * ruido;
  const jy = (hash01(`${Math.round(x * 400)}|${Math.round(y * 400)}|y`) - 0.5) * 2 * ruido;
  let melhor = c[0], dm = Infinity;
  for (const p of c) {
    const dd = (p.x - x - jx) ** 2 + (p.y - y - jy) ** 2;
    if (dd < dm) { dm = dd; melhor = p; }
  }
  return melhor.bioma;
}

/* As duas cristas da faixa: o chão de cada rumo a ~24 km e a ~10 km, lido
   do mesmo chão da carta. Gelo e montanha dão picos; mata dá copas. O
   ruído é do RUMO (não do pixel): a crista não treme quando a largura muda. */
export function cristasDaFaixa(dados, itens) {
  const d = obj(dados), it = obj(itens);
  if (!d || !it) return null;
  const F = MAPA_VIVO.faixa, C = F.cristas;
  const o = olhoDoHeroi(d);
  const ladoKm = obj(d.quadro) && finito(d.quadro.ladoKm) ? Number(d.quadro.ladoKm) : 1;
  const chaos = chaosDosNos(d);
  const fazer = (km, banda) => {
    const passo = C.passo;
    const pts = [];
    for (let x = -passo; x <= it.largura + passo; x += passo) {
      const g = it.frente + ((x - it.largura / 2) * it.janela) / it.largura;
      const rad = (g * Math.PI) / 180;
      const f = km / ladoKm;
      const bioma = o ? chaoEm(o.x + Math.sin(rad) * f, o.y - Math.cos(rad) * f, chaos) : (obj(d.quadro) && d.quadro.chao) || "planicie";
      const rel = F.relevo[bioma] != null ? F.relevo[bioma] : 0.2;
      const chave = Math.round(((g % 360) + 360) % 360);
      const n = hash01(`${km}|${chave}`);
      let alto = rel * (0.7 + 0.3 * n);
      if (F.picos.includes(bioma)) alto *= (chave % 2 === 0 ? 1 : 0.62 + 0.2 * n);
      else if (F.copas.includes(bioma)) alto *= (chave % 2 === 0 ? 1 : 0.8);
      const y = (banda.chao - (banda.chao - banda.topo) * alto) * it.escala;
      pts.push(`${duas(x)},${duas(y)}`);
    }
    return `M${-passo},${it.altura} L${pts.join(" L")} L${it.largura + passo},${it.altura} Z`;
  };
  return { longe: fazer(C.longeKm, C.longe), perto: fazer(C.pertoKm, C.perto) };
}

/* ---------------- O FUNDO DA CARTA ----------------
   Gerado uma vez por região (o painel memoriza-o): o chão em células, as
   matas em pinheiros de dois tons (a face acesa à esquerda — a luz vem de
   noroeste, Imhof), o gelo e a montanha em picos de perfil. Tudo em
   unidades do lado da carta, em poucos `path` (um por cor). */
export function fundoDaCarta(dados, opcoes) {
  const d = obj(dados);
  if (!d) return null;
  const o = obj(opcoes) || {};
  const lado = finito(o.lado) ? Number(o.lado) : MAPA_VIVO.carta.lado - 2 * MAPA_VIVO.carta.rebordo;
  const FD = MAPA_VIVO.carta.fundo;
  const N = FD.celulas, s = lado / N;
  const chaos = chaosDosNos(d);
  const rnd = rngDe(`${(obj(d.regiao) && d.regiao.nome) || ""}|fundo-da-carta`);
  const chao = Object.fromEntries(CHAOS.map((c) => [c, []]));
  const mata = [], arvoreLuz = [], arvore = [], pico = [], picoSombra = [];
  const r1 = (v) => Math.round(v * 10) / 10;
  for (let j = 0; j < N; j++) {
    for (let i = 0; i < N; i++) {
      const x = i * s, y = j * s;
      const b = chaoEm((i + 0.5) / N, (j + 0.5) / N, chaos);
      chao[b].push(`M${r1(x)} ${r1(y)}h${r1(s + 0.6)}v${r1(s + 0.6)}h${r1(-s - 0.6)}Z`);
      const dens = hash01(`${Math.floor(i / 3)}|${Math.floor(j / 3)}|mata`);
      if (b === "floresta") {
        if (dens > 0.55) mata.push(`M${r1(x)} ${r1(y)}h${r1(s + 0.6)}v${r1(s + 0.6)}h${r1(-s - 0.6)}Z`);
        const k = Math.floor(rnd() * (FD.arvores + 1) * (0.4 + dens));
        for (let a = 0; a < k; a++) {
          const cx = x + rnd() * s, base = y + s * (0.5 + rnd() * 0.5), alt = s * (0.55 + rnd() * 0.35), meia = alt * 0.32;
          arvoreLuz.push(`M${r1(cx)} ${r1(base - alt)}L${r1(cx - meia)} ${r1(base)}L${r1(cx)} ${r1(base)}Z`);
          arvore.push(`M${r1(cx)} ${r1(base - alt)}L${r1(cx + meia)} ${r1(base)}L${r1(cx)} ${r1(base)}Z`);
        }
      } else if (b === "gelo" || b === "montanha") {
        const k = Math.floor(rnd() * (FD.picos + 1));
        for (let a = 0; a < k; a++) {
          const cx = x + rnd() * s, base = y + s * (0.6 + rnd() * 0.4), alt = s * (0.9 + rnd() * 0.9), meia = alt * 0.55;
          pico.push(`M${r1(cx)} ${r1(base - alt)}L${r1(cx - meia)} ${r1(base)}L${r1(cx)} ${r1(base)}Z`);
          picoSombra.push(`M${r1(cx)} ${r1(base - alt)}L${r1(cx + meia)} ${r1(base)}L${r1(cx)} ${r1(base)}Z`);
        }
      } else {
        /* o resto do chão: alguma árvore solta onde a borda da mata chega */
        if (dens > 0.8 && rnd() < 0.3) {
          const cx = x + rnd() * s, base = y + s * 0.8, alt = s * 0.5, meia = alt * 0.32;
          arvoreLuz.push(`M${r1(cx)} ${r1(base - alt)}L${r1(cx - meia)} ${r1(base)}L${r1(cx)} ${r1(base)}Z`);
          arvore.push(`M${r1(cx)} ${r1(base - alt)}L${r1(cx + meia)} ${r1(base)}L${r1(cx)} ${r1(base)}Z`);
        }
      }
    }
  }
  const junta = (a) => a.join("");
  return {
    lado,
    chao: Object.fromEntries(Object.entries(chao).filter(([, v]) => v.length).map(([k, v]) => [k, junta(v)])),
    mata: junta(mata), arvoreLuz: junta(arvoreLuz), arvore: junta(arvore), pico: junta(pico), picoSombra: junta(picoSombra),
  };
}

/* ---------------- A CÂMARA ----------------
   O quadro é fixo; a câmara é que se move (§1): zoom 1,5 (1,8 no
   telefone) centrada num ponto — o herói, ao abrir —, presa ao quadro. */
export function camaraDaCarta(centro, opcoes) {
  const o = obj(opcoes) || {};
  const lado = finito(o.lado) ? Number(o.lado) : 860;
  const zoom = finito(o.zoom) && Number(o.zoom) >= 1 ? Number(o.zoom) : MAPA_VIVO.medidas.zoom;
  const c = obj(centro) && finito(centro.x) && finito(centro.y) ? centro : { x: 0.5, y: 0.5 };
  const vista = lado / zoom;
  const cx = prender(Number(c.x) * lado, vista / 2, lado - vista / 2);
  const cy = prender(Number(c.y) * lado, vista / 2, lado - vista / 2);
  return { x0: duas(cx - vista / 2), y0: duas(cy - vista / 2), zoom, lado, vista: duas(vista) };
}
/* Um ponto normalizado no ecrã da carta (px dentro do quadro). */
export function noEcra(camara, x, y) {
  return { x: duas((Number(x) * camara.lado - camara.x0) * camara.zoom), y: duas((Number(y) * camara.lado - camara.y0) * camara.zoom) };
}

/* ---------------- A ESTRADA CURVA ----------------
   A tela curva as estradas (§2, `Mapa/Herói`): uma quadrática cujo ponto
   de controlo sai do meio, para um lado que o id da aresta escolhe. */
export function curvaDaAresta(a, b, id, curva = MAPA_VIVO.carta.estrada.curva) {
  const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
  const dx = b.x - a.x, dy = b.y - a.y;
  const sinal = hash01(id) < 0.5 ? -1 : 1;
  return { x: duas(mx - dy * curva * sinal), y: duas(my + dx * curva * sinal) };
}
export function pontoNaCurva(a, c, b, t) {
  const u = 1 - t;
  return { x: duas(u * u * a.x + 2 * u * t * c.x + t * t * b.x), y: duas(u * u * a.y + 2 * u * t * c.y + t * t * b.y) };
}

/* ---------------- OS NOMES SEM COLISÃO ----------------
   A posição do nó não se mexe; o nome é que se afasta (§2, `Mapa/Rótulo`):
   baixo → direita → esquerda → cima → segunda fila. Os itens chegam por
   prioridade (o primeiro escolhe primeiro); os marcadores são obstáculos
   para todos. Devolve, por id, a caixa do nome e o lado que ficou. */
export function colocarRotulos(itens, opcoes) {
  const o = obj(opcoes) || {};
  const lado = finito(o.lado) ? Number(o.lado) : Infinity;
  const vao = finito(o.vao) ? Number(o.vao) : MAPA_VIVO.carta.rotulo.vao;
  const its = lista(itens).filter((i) => obj(i) && finito(i.x) && finito(i.y));
  const caixas = its.map((i) => ({ x: i.x - (i.raio || 0), y: i.y - (i.raio || 0), w: 2 * (i.raio || 0), h: 2 * (i.raio || 0) }));
  const cruza = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
  const dentro = (c) => c.x >= 0 && c.y >= 0 && c.x + c.w <= lado && c.y + c.h <= lado;
  const out = {};
  for (const i of its) {
    const r = i.raio || 0, w = i.largura || 0, h = i.altura || 0;
    const opcoesDeSitio = [
      ["baixo", i.x - w / 2, i.y + r + vao],
      ["direita", i.x + r + vao, i.y - h / 2],
      ["esquerda", i.x - r - vao - w, i.y - h / 2],
      ["cima", i.x - w / 2, i.y - r - vao - h],
      ["segunda", i.x - w / 2, i.y + r + 2 * vao + h],
    ];
    let escolhido = null;
    for (const [sitio, x, y] of opcoesDeSitio) {
      const c = { x, y, w, h };
      if (!dentro(c)) continue;
      if (caixas.some((b) => cruza(c, b))) continue;
      escolhido = { sitio, ...c };
      break;
    }
    if (!escolhido) escolhido = { sitio: "baixo", x: i.x - w / 2, y: i.y + r + vao, w, h };
    caixas.push({ x: escolhido.x, y: escolhido.y, w: escolhido.w, h: escolhido.h });
    out[i.id] = { sitio: escolhido.sitio, x: duas(escolhido.x), y: duas(escolhido.y), largura: w, altura: h };
  }
  return out;
}

/* ---------------- O TECLADO ----------------
   As setas andam de nó em nó: o mais perto no rumo da seta (dentro de um
   cone de 60° para cada lado). */
const SETAS = { cima: 0, direita: 90, baixo: 180, esquerda: 270 };
export function vizinhoNaSeta(nos, deId, seta) {
  const ns = lista(nos).filter((n) => obj(n) && finito(n.x) && finito(n.y));
  const de = ns.find((n) => n.id === deId);
  const alvo = SETAS[seta];
  if (!de || alvo == null) return null;
  let melhor = null, nota = Infinity;
  for (const n of ns) {
    if (n.id === de.id) continue;
    const g = grausEntre({ x: de.x, y: de.y }, { x: n.x, y: n.y });
    if (g == null) continue;
    const dv = Math.abs(desvio(g, alvo));
    if (dv > 60) continue;
    const dist = Math.hypot(n.x - de.x, n.y - de.y);
    const v = dist * (1 + dv / 60);
    if (v < nota) { nota = v; melhor = n.id; }
  }
  return melhor;
}

/* ---------------- AS PALAVRAS QUE SÃO CONTA ---------------- */

/* "4 h", "2,6 h", "10,5 h": uma casa, vírgula, sem ",0". */
export function textoDeHoras(h) {
  if (!finito(h)) return "";
  const v = Math.round(Number(h) * 10) / 10;
  return `${String(v).replace(".", ",")} h`;
}

/* O rumo de B visto de A, por extenso ("ao sul", "a nordeste"). */
export function rumoPorExtenso(a, b) {
  if (!obj(a) || !obj(b)) return "";
  const g = grausEntre({ x: a.x, y: a.y }, { x: b.x, y: b.y });
  if (g == null) return "";
  return RUMOS[Math.round(g / 45) % 8].rotulo;
}

/* Quem anda lá, na língua de quem lê: "Cultistas e esqueletos." — o plural
   de cada palavra (as que não são de ligação), em minúscula, a lista com
   vírgulas e "e". */
const LIGACAO = new Set(["de", "do", "da", "dos", "das", "e", "o", "a"]);
function plural(p) {
  if (LIGACAO.has(p)) return p;
  if (/ão$/.test(p)) return p.replace(/ão$/, "ões");
  if (/[aeiouáéíóúâêô]$/.test(p)) return p + "s";
  if (/[rzs]$/.test(p)) return /s$/.test(p) ? p : p + "es";
  if (/l$/.test(p)) return p.replace(/l$/, "is");
  if (/m$/.test(p)) return p.replace(/m$/, "ns");
  return p;
}
export function quemEmTexto(nomes) {
  const ns = lista(nomes).map((n) => String(n || "").trim()).filter(Boolean);
  if (!ns.length) return "";
  const pl = ns.map((n) => n.toLowerCase().split(/\s+/).map(plural).join(" "));
  const frase = pl.length === 1 ? pl[0] : `${pl.slice(0, -1).join(", ")} e ${pl[pl.length - 1]}`;
  return frase.charAt(0).toUpperCase() + frase.slice(1) + ".";
}
