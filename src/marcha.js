/* ============================================================
   A MARCHA ÚNICA (MM17, pendência nº 3 · v9.364) — uma conta para a hora

   A pessoa, a 10/10: as viagens lentas. Medido em 200 regiões (secção j de
   `testes/medir-regiao.mjs`), a hora de uma viagem dentro da região tinha
   QUATRO contas, e elas não se conheciam:

     · a JORNADA (o que o jogo cobra): a ida pelo chão da boca
       (`rotaAteAMasmorra` com `IDA_NA_REGIAO`, boca.js) até um lugar; a
       estrada de `mapa.rotas` até uma povoação — e, sem estrada direta, o
       piso de TRÊS DIAS de `abrirViagem` (24 h para uma vila a 19 km). Da
       boca de um lugar, a estrada partia da base: a vila a 250 m da boca
       custava as 8 h da base até ela;
     · a FICHA (`gerarRegiao`): a mesma ida da boca, mas direta sempre — e a
       ida direta entre dois lugares de chão lento chegava a 20 h, quando
       pela base eram 9;
     · o GEÓGRAFO (`linhaDePonto`, coordenadas.js): 4 km/h em qualquer chão
       até 15 km ("3,8 h a pé" para a mina que a marcha diz a um dia), e
       nada acima disso;
     · o MAPA VIVO (`dadosDoMapaVivo`): as horas guardadas na ficha.

   Aqui fica UMA conta, e as quatro leem-na. Ela não inventa fórmula: a
   perna é a de sempre — a estrada de `mapa.rotas` entre duas povoações que
   a têm, e a ida pelo chão da boca (`rotaAteAMasmorra`, a fórmula de
   `IDA_NA_REGIAO`) em tudo o resto. O que ela acrescenta é a REDE: uma ida
   direta que passa de um dia (`PROMESSA_DA_REGIAO.direta`, regiao.js)
   procura o caminho pelas povoações — a base e as vilas, que é por onde há
   gente e caminho —, e fica com o mais curto. Se nem o mais curto cabe na
   promessa (`pontaAPonta`), o motivo é o chão, e a linha de antes de partir
   (`linhaDoCaminho`) di-lo — nunca em silêncio.

   SÓ A REGIÃO DE AGORA. Um mapa sem `regiao`, ou com a região v1 (feita
   antes da régua do chão, v9.356), não passa por aqui: `caminhoNaRegiao`
   devolve `null`, e quem chama fica com a conta de sempre, letra a letra.
   Puro, determinístico (sem sorteio nenhum), sem tocar no que recebe.
   ============================================================ */

import { kmEntre, rumoEntre, aPeEmTexto } from "./coordenadas.js";
import { TERRENO_VIAGEM } from "./geografia.js";
import { HORAS_MARCHA_POR_DIA, minutosDaRota, abrirViagem } from "./viagem.js";
import { rotaAteAMasmorra, IDA_NA_REGIAO } from "./boca.js";
import { PROMESSA_DA_REGIAO } from "./regiao.js";

const obj = (v) => (v && typeof v === "object" && !Array.isArray(v) ? v : null);
const lista = (v) => (Array.isArray(v) ? v : []);
const finito = (v) => v !== null && v !== "" && typeof v !== "boolean" && Number.isFinite(Number(v));
const norm = (s) => String(s == null ? "" : s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
const semArtigo = (s) => norm(s).replace(/^(o|a|os|as)\s+/, "").trim();
const duas = (n) => Math.round(n * 100) / 100;

/* ---------------- A TABELA ----------------
   `paradas`     — por onde a rede pode passar a caminho: as povoações (a
                   base e as vilas). Um lugar (uma mina, uma cripta) é
                   destino, nunca escala — ninguém atravessa um covil para
                   encurtar caminho.
   `empate`      — dois caminhos a menos disto de diferença são o mesmo; o
                   de menos pernas ganha (e o direto ganha de todos).
   `passoDoTexto`— como a linha diz as horas: ao meio-hora, como um guia
                   diria (a jornada guarda o minuto). */
export const MARCHA_NA_REGIAO = {
  paradas: ["base", "povoado"],
  empate: 1e-6,
  passoDoTexto: 0.5,
};

/* a região mede pela régua do chão? (a mesma pergunta de boca.js) */
function regiaoDaMarcha(mapa) {
  const m = obj(mapa);
  const r = m && obj(m.regiao);
  return r && Number(r.versao) >= IDA_NA_REGIAO.versaoMinima ? r : null;
}

/* Os pontos da rede: a base, as povoações (as cidades do mapa) e os lugares
   da região. Cada um com o chão que pisa. */
function pontosDaRede(mapa, r) {
  const cidades = lista(mapa.cidades).filter((c) => obj(c) && c.nome && finito(c.x) && finito(c.y));
  const baseNome = (obj(r.base) && r.base.nome) || (cidades[0] && cidades[0].nome) || "";
  const nos = cidades.map((c) => ({ nome: String(c.nome), tipo: semArtigo(c.nome) === semArtigo(baseNome) ? "base" : "povoado", x: Number(c.x), y: Number(c.y), bioma: String(c.bioma || ""), id: String(c.nome) }));
  for (const l of lista(r.lugares)) {
    if (!obj(l) || !l.nome || !finito(l.x) || !finito(l.y)) continue;
    nos.push({ nome: String(l.nome), tipo: "lugar", x: Number(l.x), y: Number(l.y), bioma: String(l.bioma || ""), id: String(l.id || l.nome) });
  }
  return nos;
}

/* Um ponto da rede por nome (sem caixa, acento nem artigo) ou id; um objeto
   com `nome` que a rede conhece é esse ponto; um objeto só com `x,y` é um
   ponto solto (o herói no meio da estrada, num arredor), com o chão que
   trouxer. */
function acharPonto(nos, ref) {
  if (typeof ref === "string") {
    const k = semArtigo(ref);
    if (!k) return null;
    return nos.find((n) => n.id === ref) || nos.find((n) => semArtigo(n.nome) === k) || null;
  }
  const o = obj(ref);
  if (!o) return null;
  if (o.nome) {
    const n = acharPonto(nos, String(o.nome));
    if (n) return n;
  }
  if (finito(o.x) && finito(o.y)) return { nome: String(o.nome || ""), tipo: "ponto", x: Number(o.x), y: Number(o.y), bioma: String(o.bioma || ""), id: "" };
  return null;
}

/* ---------------- A PERNA ----------------
   Entre duas povoações com estrada: a estrada (os dias de `gerarRotas`, que
   é o que o jogo sempre cobrou). Em tudo o resto: a ida pelo chão da boca —
   a fórmula de `IDA_NA_REGIAO`, com o arredondamento que a jornada cobra
   (a pé em minutos, pela estrada em meios-dias). */
function pernaEntre(mapa, r, a, b) {
  const cidade = (n) => n.tipo === "base" || n.tipo === "povoado";
  if (cidade(a) && cidade(b)) {
    const ka = semArtigo(a.nome), kb = semArtigo(b.nome);
    const e = lista(mapa.rotas).find((x) => obj(x) && ((semArtigo(x.de) === ka && semArtigo(x.para) === kb) || (semArtigo(x.de) === kb && semArtigo(x.para) === ka)) && finito(x.dias));
    if (e) {
      const dias = Number(e.dias);
      return { de: a.nome, para: b.nome, horas: dias * HORAS_MARCHA_POR_DIA, km: finito(e.km) ? Number(e.km) : Math.round(kmEntre(a, b) || 0), terreno: String(e.terreno || ""), modo: "estrada", dias, minutos: minutosDaRota(dias), estrada: true };
    }
  }
  const rt = rotaAteAMasmorra({ nome: b.nome || "ali", x: b.x, y: b.y, bioma: b.bioma }, { x: a.x, y: a.y, ...(a.bioma ? { bioma: a.bioma } : {}) }, { regiao: r });
  if (!rt) return null;
  const horas = rt.modo === "a_pe" ? rt.minutos / 60 : rt.dias * HORAS_MARCHA_POR_DIA;
  return { de: a.nome, para: b.nome, horas, km: rt.km, terreno: rt.terreno, modo: rt.modo, dias: rt.dias, minutos: rt.minutos, estrada: false };
}

const rotuloDoChao = (t) => (TERRENO_VIAGEM[t] ? TERRENO_VIAGEM[t].rotulo : String(t || ""));

/* ---------------- DE ONDE O HERÓI PARTE ----------------
   A ponta de partida de uma pergunta "quanto falta até…", lida do registo:
   na estrada, o ponto onde vai (`ponto`, com o chão que trouxer); à boca de
   um lugar da região, esse lugar; num arredor fora dos muros, o ponto dele,
   com o chão da cidade; senão, a cidade do registo. Devolve o que
   `caminhoNaRegiao` aceita como `de` (um nome, ou um ponto solto), ou `null`. */
export function origemDoHeroi(mapa, ctx) {
  const o = obj(ctx) || {};
  const r = regiaoDaMarcha(mapa);
  if (!r) return null;
  const nos = pontosDaRede(mapa, r);
  const p = obj(o.ponto) && finito(o.ponto.x) && finito(o.ponto.y) ? { x: Number(o.ponto.x), y: Number(o.ponto.y), ...(o.ponto.bioma ? { bioma: String(o.ponto.bioma) } : {}) } : null;
  if (obj(o.jornada)) return p;
  const lugar = obj(o.lugar) && o.lugar.nome ? o.lugar : null;
  const daRegiao = lugar ? acharPonto(nos, String(lugar.nome)) : null;
  if (daRegiao && daRegiao.tipo === "lugar") return daRegiao.nome;
  const cidade = acharPonto(nos, typeof o.cidadeAtual === "string" ? o.cidadeAtual : "");
  if (lugar && lugar.distancia !== "dentro" && obj(lugar.coord) && finito(lugar.coord.x) && finito(lugar.coord.y)) {
    return { x: Number(lugar.coord.x), y: Number(lugar.coord.y), ...(cidade && cidade.bioma ? { bioma: cidade.bioma } : {}) };
  }
  return cidade ? cidade.nome : p;
}

/* ---------------- O CAMINHO ----------------
   `de` e `para`: nomes (ou ids de lugar) da região, ou objetos com `nome` ou
   `x,y`. Devolve `null` fora da região de agora, ou sem os dois pontos; senão:

     { de, para, rumo, direto: perna, escolhido: { horas, km, pernas, via },
       desvio, teto, cumpre, motivo }

   `direto` é a ida reta; `escolhido` é a que se anda (o direto, ou o caminho
   mais curto pelas povoações quando o direto passa de `direta`); `teto` é a
   promessa deste par (da base: `daBase`; entre dois outros: `pontaAPonta`);
   `motivo` é o chão mais lento do caminho escolhido, quando ele passa do
   teto. Os empates resolvem-se pelo menor número de pernas, depois pela
   ordem dos pontos no mapa — nunca pelo acaso. */
export function caminhoNaRegiao(mapa, de, para) {
  const r = regiaoDaMarcha(mapa);
  if (!r) return null;
  const nos = pontosDaRede(mapa, r);
  const a = acharPonto(nos, de), b = acharPonto(nos, para);
  if (!a || !b || a === b) return null;
  const memo = new Map();
  const perna = (p, q) => {
    const k = `${nos.indexOf(p)}|${p.nome}>${nos.indexOf(q)}|${q.nome}`;
    if (!memo.has(k)) memo.set(k, pernaEntre(mapa, r, p, q));
    return memo.get(k);
  };
  const direto = perna(a, b);
  if (!direto) return null;
  const P = PROMESSA_DA_REGIAO;
  let pernas = [direto];
  if (direto.horas > P.direta + MARCHA_NA_REGIAO.empate) {
    /* a rede: o ponto de partida, as paradas (as povoações que não são as
       pontas) e o destino. Dijkstra num grafo de sete pontos no máximo. */
    const paradas = nos.filter((n) => MARCHA_NA_REGIAO.paradas.includes(n.tipo) && n !== a && n !== b);
    const V = [a, ...paradas, b];
    const dist = V.map(() => Infinity), passos = V.map(() => Infinity), antes = V.map(() => -1), feito = V.map(() => false);
    dist[0] = 0; passos[0] = 0;
    const melhor = (h1, p1, h2, p2) => h1 < h2 - MARCHA_NA_REGIAO.empate || (Math.abs(h1 - h2) <= MARCHA_NA_REGIAO.empate && p1 < p2);
    for (;;) {
      let u = -1;
      for (let i = 0; i < V.length; i++) if (!feito[i] && dist[i] < Infinity && (u < 0 || melhor(dist[i], passos[i], dist[u], passos[u]))) u = i;
      if (u < 0) break;
      feito[u] = true;
      if (u === V.length - 1) break;
      for (let v = 1; v < V.length; v++) {
        if (feito[v]) continue;
        const e = perna(V[u], V[v]);
        if (!e) continue;
        if (melhor(dist[u] + e.horas, passos[u] + 1, dist[v], passos[v])) { dist[v] = dist[u] + e.horas; passos[v] = passos[u] + 1; antes[v] = u; }
      }
    }
    const fim = V.length - 1;
    if (antes[fim] >= 0 && melhor(dist[fim], passos[fim], direto.horas, 1)) {
      const seq = [];
      for (let i = fim; i >= 0; i = antes[i]) seq.unshift(i);
      pernas = seq.slice(1).map((v, j) => perna(V[seq[j]], V[v]));
    }
  }
  const horas = pernas.reduce((s, e) => s + e.horas, 0);
  const desvio = pernas.length > 1;
  const daBase = a.tipo === "base" || b.tipo === "base";
  const teto = daBase ? P.daBase : P.pontaAPonta;
  const cumpre = horas <= teto + MARCHA_NA_REGIAO.empate;
  const lenta = [...pernas].sort((x, y) => ((TERRENO_VIAGEM[x.terreno] || {}).kmDia || Infinity) - ((TERRENO_VIAGEM[y.terreno] || {}).kmDia || Infinity))[0];
  const rumo = rumoEntre(a, b);
  return {
    de: a.nome, para: b.nome, rumo: rumo ? rumo.rotulo : "",
    direto,
    escolhido: { horas: duas(horas), km: Math.round(pernas.reduce((s, e) => s + (Number(e.km) || 0), 0) * 10) / 10, pernas, via: pernas.slice(0, -1).map((e) => e.para) },
    desvio, teto, cumpre,
    motivo: cumpre ? "" : rotuloDoChao(lenta.terreno),
    pontos: [a, ...pernas.map((e) => nos.find((n) => n.nome === e.para) || b)].map((n) => ({ nome: n.nome, x: n.x, y: n.y })),
  };
}

/* As horas do caminho que se anda — a pergunta curta. Fora da região de
   agora, a conta de sempre: a estrada entre duas cidades que a têm, ou a ida
   da boca (com a régua da versão da região) até um ponto com `x,y`; sem
   nenhuma das duas, `null` (o portão da casa: na dúvida, não há número). */
export function horasEntre(mapa, de, para) {
  const c = caminhoNaRegiao(mapa, de, para);
  if (c) return c.escolhido.horas;
  const m = obj(mapa);
  if (!m) return null;
  const nomeDe = (x) => (typeof x === "string" ? x : obj(x) && x.nome ? String(x.nome) : "");
  const ka = semArtigo(nomeDe(de)), kb = semArtigo(nomeDe(para));
  const e = ka && kb ? lista(m.rotas).find((x) => obj(x) && ((semArtigo(x.de) === ka && semArtigo(x.para) === kb) || (semArtigo(x.de) === kb && semArtigo(x.para) === ka)) && finito(x.dias)) : null;
  if (e) return Number(e.dias) * HORAS_MARCHA_POR_DIA;
  const pt = (x) => (obj(x) && finito(x.x) && finito(x.y) ? x : typeof x === "string" ? lista(m.cidades).find((c) => obj(c) && semArtigo(c.nome) === semArtigo(x)) || null : null);
  const p = pt(de), q = pt(para);
  if (!p || !q || !q.nome) return null;
  const rt = rotaAteAMasmorra(q, p, m.regiao ? { regiao: m.regiao } : undefined);
  return rt ? (rt.modo === "a_pe" ? rt.minutos / 60 : rt.dias * HORAS_MARCHA_POR_DIA) : null;
}

/* ---------------- AS PALAVRAS ---------------- */
const decimal = (n) => String(n).replace(".", ",");
function horasEmTexto(h) {
  const p = MARCHA_NA_REGIAO.passoDoTexto;
  return `${decimal(Math.max(p, Math.round(h / p) * p))} h`;
}

/* Quanto custa, dito como a linha do Geógrafo o diz: "4 h de marcha por
   estrada", "40 min a pé por campo aberto", "9 h de marcha, por Pedra
   Clara". É a parte que entra no lugar do "N h a pé" dos 4 km/h. */
export function tempoDoCaminho(c) {
  if (!obj(c) || !obj(c.escolhido) || !lista(c.escolhido.pernas).length) return "";
  const e = c.escolhido;
  if (c.desvio) return `${horasEmTexto(e.horas)} de marcha, por ${e.via.join(" e ")}`;
  const p = e.pernas[0];
  if (p.modo === "a_pe") return `${aPeEmTexto(p.minutos)} por ${rotuloDoChao(p.terreno)}`;
  return `${horasEmTexto(e.horas)} de marcha por ${rotuloDoChao(p.terreno)}`;
}

/* ---------------- O VEREDITO ANTES DE PARTIR ----------------
   A linha que o jogador lê ANTES de a estrada começar, quando o caminho que
   se anda não é o reto — ou quando nem o melhor cabe na promessa. Uma linha
   de tela, de jogo: os dois caminhos e o chão, sem nome de mecanismo. Vazia
   quando não há nada a dizer (a ida direta, dentro do dia: a linha da ida
   de sempre basta). */
export function linhaDoCaminho(c) {
  if (!obj(c) || !obj(c.escolhido) || !obj(c.direto)) return "";
  const e = c.escolhido, d = c.direto;
  const rumo = c.rumo ? ` fica ${c.rumo}:` : ":";
  if (c.desvio && c.cumpre) {
    return `🧭 ${c.para}${rumo} o caminho direto leva ${horasEmTexto(d.horas)} por ${rotuloDoChao(d.terreno)}; por ${e.via.join(" e ")}, ${horasEmTexto(e.horas)} — é por lá que se vai.`;
  }
  if (!c.cumpre) {
    const outro = c.desvio ? `o caminho direto seria ${horasEmTexto(d.horas)}` : "nenhum caminho pelas povoações é mais curto";
    return `🧭 ${c.para}${rumo} são ${horasEmTexto(e.horas)} de marcha${c.desvio ? `, por ${e.via.join(" e ")}` : ""} — por ${c.motivo} não se vai mais depressa (${outro}).`;
  }
  return "";
}

/* ---------------- A ROTA QUE A JORNADA LEVA ----------------
   O caminho na forma da rota de sempre (a de `rotaAteAMasmorra`: modo, km,
   dias, minutos, terreno, rumo), mais o `percurso` — os pontos por onde se
   passa, cada um com as horas a que se lá chega — quando o caminho não é a
   ida reta de onde o registo diz que se está. A jornada guarda-o (campo
   NOVO, que a versão antiga ignora) para o herói andar no mapa por onde de
   facto anda. */
export function rotaDoCaminho(c, opcoes) {
  if (!obj(c) || !obj(c.escolhido)) return null;
  const o = obj(opcoes) || {};
  const e = c.escolhido;
  const ultima = e.pernas[e.pernas.length - 1];
  const umaSo = !c.desvio;
  const aPe = umaSo && ultima.modo === "a_pe";
  /* os dias sem arredondar: a jornada cobra os minutos de `minutosDaRota`, e
     duas casas nos dias eram dois minutos a menos que a ficha e a linha */
  const dias = umaSo ? ultima.dias : e.pernas.reduce((s, p) => s + p.horas, 0) / HORAS_MARCHA_POR_DIA;
  const rota = {
    de: String(o.de || c.de), para: c.para,
    terreno: ultima.terreno,
    rumo: rumoEntre(c.pontos[0], c.pontos[c.pontos.length - 1]),
    modo: aPe ? "a_pe" : "estrada",
    km: umaSo ? ultima.km : Math.round(e.km),
    dias: aPe ? 0 : dias,
    minutos: aPe ? ultima.minutos : minutosDaRota(dias),
  };
  if (c.desvio || o.comPercurso) {
    let h = 0;
    rota.percurso = c.pontos.map((p, i) => { if (i > 0) h += e.pernas[i - 1].horas; return { nome: p.nome, x: duas(p.x), y: duas(p.y), h: duas(h) }; });
  }
  return rota;
}

/* ---------------- A PARTIDA PARA UMA POVOAÇÃO ----------------
   O que `viajar` (App) precisa para abrir a jornada até uma cidade da região:
   a rota da conta única a partir de ONDE O HERÓI ESTÁ — a boca de um lugar
   (`lugar`, quando é um lugar da região) ou a cidade do registo — e a linha
   de antes de partir. `null` fora da região de agora, para destino que não é
   povoação da região, ou quando já se está lá: aí a jornada é a de sempre
   (`rotaEntre`). A jornada nasce como as outras (`abrirViagem`), com `de` =
   a cidade do registo (é ela que `jornadaValida` confere) e o `percurso`
   quando se parte de uma boca ou se passa por outra povoação. */
export function partidaNaRegiao(mapa, opcoes) {
  const o = obj(opcoes) || {};
  const r = regiaoDaMarcha(mapa);
  if (!r) return null;
  const nos = pontosDaRede(mapa, r);
  const destino = acharPonto(nos, typeof o.destino === "string" ? o.destino : "");
  if (!destino || destino.tipo === "lugar") return null;
  const lugar = obj(o.lugar) && o.lugar.nome ? acharPonto(nos, String(o.lugar.nome)) : null;
  const daBoca = lugar && lugar.tipo === "lugar" ? lugar : null;
  const origem = daBoca || acharPonto(nos, typeof o.cidadeAtual === "string" ? o.cidadeAtual : "");
  if (!origem || origem === destino) return null;
  const c = caminhoNaRegiao(mapa, origem.nome, destino.nome);
  if (!c) return null;
  const de = String(o.cidadeAtual || origem.nome);
  const rota = rotaDoCaminho(c, { de, comPercurso: !!daBoca });
  /* a pé (a vila a duzentos metros da boca), a jornada leva os minutos da
     caminhada — e não o piso de `minutosDaRota`, que faria de dez minutos
     duas horas de estrada */
  const aPe = rota.modo === "a_pe";
  const j0 = abrirViagem({ de, para: destino.nome, dia: finito(o.dia) ? Number(o.dia) : 0, rota: { km: rota.km, dias: aPe ? duas(rota.minutos / 60 / HORAS_MARCHA_POR_DIA) : rota.dias, terreno: rota.terreno } });
  const j = aPe ? { ...j0, totalMin: rota.minutos } : j0;
  const jornada = rota.percurso ? { ...j, percurso: rota.percurso } : j;
  return { caminho: c, rota, jornada, linhas: [linhaDoCaminho(c)].filter(Boolean) };
}
