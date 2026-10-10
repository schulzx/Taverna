/* ============================================================
   O MAPA VIVO (MM17, etapa D) — o que a tela precisa para desenhar a região

   A pessoa está a desenhar, no Figma, o MAPA EM TEMPO REAL no lugar dos
   banners: a região inteira à vista, o herói a andar nela, a neblina que se
   abre. A região (`mapa.regiao`, regiao.js) já tem tudo o que existe — a
   base, os povoados, os lugares com ficha, o horizonte —, e o jogo já sabe
   onde o herói está (`cidadeAtual`, `lugar`, `masmorra`, `jornada`). Faltava
   a ponte: UMA função que lê os dois e devolve o que uma tela desenha, sem
   desenhar nada e sem decidir nada que o motor não tenha decidido antes.

   `dadosDoMapaVivo(mapa, estado)` devolve:

     · o QUADRO: a região num quadrado normalizado (0–1), com margem, e a
       escala — quantos km e quantas horas de marcha tem o lado, e uma régua
       redonda para o canto do pergaminho;
     · os NÓS: a base, os povoados e os lugares, cada um com a sua posição
       normalizada, o seu estado de neblina, o perigo, as horas da base e dos
       vizinhos, e o ato da história QUANDO o jogador já o pode saber;
     · as ARESTAS: as estradas entre povoados (`mapa.rotas`) e as idas aos
       lugares (as fichas), com as horas que o jogo cobra;
     · o HERÓI, num sítio só: na base, num povoado, à boca de um lugar, lá
       dentro (com a camada e o progresso da planta), num arredor, ou na
       estrada — com a posição interpolada pela estrada percorrida;
     · a NEBLINA, por tabela; o HORIZONTE, na borda, cada nome com o seu
       rumo; e o RELÓGIO, para o dia e a noite.

   ---------------- O QUE A TELA NÃO PODE SABER ANTES DO JOGADOR ----------------

   A lei da casa diz que o Narrador nunca vê a verdade eleita antes do turno
   da revelação. A tela é a mesma boca, e mais perigosa: o que ela desenha o
   jogador lê sem perguntar. Por isso:

     1. O CLÍMAX NÃO EXISTE no mapa de um mundo novo. O lugar do fim
        (`ato: "fim"`) nasce "desconhecido" — não aparece, nem como ponto
        apagado, nem como vizinho na ficha de outro lugar, nem como aresta.
        Acorda quando a história chega ao ato dele, quando o herói vai lá
        (a estrada, a boca, a porta) ou quando o App o diz conhecido.
     2. O ATO SÓ SE MOSTRA QUANDO CHEGA. Um lugar do meio ou o do fim só diz
        "meio"/"fim" quando a história chega ao ato que mora nele (o "descer"
        que `espinhaNaRegiao` escreve no lugar). E o PARALELO NUNCA se diz:
        se os paralelos levassem rótulo, os lugares sem rótulo seriam, por
        exclusão, os da história — o segredo sairia pela ausência.
     3. O SEGREDO não tem nó: o "o que X esconde" da espinha mora num local
        DENTRO de uma cidade, e esta função não lê marco nenhum além do
        "descer" (o lugar do ato) — nem título, nem alvo, nem "onde" de
        outro feitio. O que sai daqui não carrega texto de marco.
     4. O QUADRO É DE TODOS os pontos, os escondidos incluídos. Se o quadro
        crescesse à medida que a neblina abre, o pergaminho mexeria-se sob o
        dedo, e o tamanho do quadro diria que há coisa por descobrir. Ele é o
        da região (`regiao.quadro`), fixo desde a criação.

   ---------------- O CONTINENTE ----------------

   Um mapa SEM `regiao` (todo save de antes da MM17, e os moldes fora do
   beta) devolve `null`: o continente tem 2.500 km e de 4 a 24 cidades, e a
   tela em tempo real foi desenhada para a escala de um dia de marcha. A tela
   cai no pergaminho de sempre (`painel-mapa.jsx`), que é o que esse jogador
   já conhece. Recortar o continente a um quadro seria inventar uma região
   que a história não tem.

   Puro, determinístico (o único sorteio — o rumo do horizonte — sai de
   `rngDe` com a semente do mundo), sem tocar no que recebe. Lixo dá `null`.
   ============================================================ */

import { rngDe, KM_POR_UNIDADE, TERRENO_VIAGEM } from "./geografia.js";
import { HORAS_MARCHA_POR_DIA, progressoDaViagem } from "./viagem.js";
import { rotaAteAMasmorra, masmorraDaBoca } from "./boca.js";
import { pontoDoHeroi, jornadaValida } from "./rastro.js";
import { lugarConcluido } from "./mundo-base.js";
import { progressoMasmorra } from "./masmorras.js";
import { PERIGO_POR_NIVEL, ROTA_DO_CLIMAX } from "./regiao.js";
import { RUMOS } from "./coordenadas.js";
import { horaTxt, ehNoite, estacaoDe } from "./calendario.js";
/* MM17 nº 3 (v9.364): as horas de cada aresta são as da conta única */
import { caminhoNaRegiao } from "./marcha.js";

const obj = (v) => (v && typeof v === "object" && !Array.isArray(v) ? v : null);
const lista = (v) => (Array.isArray(v) ? v : []);
const norm = (s) => String(s == null ? "" : s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
const semArtigo = (s) => norm(s).replace(/^(o|a|os|as)\s+/, "").trim();
const finito = (v) => v !== null && v !== "" && typeof v !== "boolean" && Number.isFinite(Number(v));
const duas = (n) => Math.round(n * 100) / 100;

/* ---------------- A MOLDURA ----------------
   `margem` — a fração do lado que fica livre em volta dos pontos: o nome do
     lugar da borda tem onde caber, e o horizonte mora DEPOIS dela;
   `casas` — as casas decimais das posições normalizadas (4 casas num
     quadrado de ~75 km são 7 metros: mais do que qualquer tela distingue);
   `reguasKm` — as réguas redondas, da menor à maior; fica a maior que não
     passa de `reguaMaxima` do lado (a régua do canto, não um travessão). */
export const MOLDURA_DO_MAPA_VIVO = {
  margem: 0.08,
  casas: 4,
  reguasKm: [1, 2, 5, 10, 15, 20, 25, 50],
  reguaMaxima: 0.3,
};

/* ---------------- A NEBLINA ----------------
   Os estados, do mais escuro ao mais aberto. O índice É a ordem: um sinal
   só sobe o estado, nunca o desce. */
export const ESTADOS_DA_NEBLINA = ["desconhecido", "boato", "conhecido", "visitado", "concluido"];

/* De onde cada nó parte num mundo novo. A base é onde a história começa
   (o herói acorda lá). Os povoados e os lugares são o que a base conta —
   a região inteira fica a um dia dela, e a C1 já pôs a base a conhecer
   todos (`masmorrasConhecidas`, boca.js) —, mas contar não é mostrar o
   caminho: é boato. O clímax não é contado: ver a regra 1 do cabeçalho. */
export const PISO_DA_NEBLINA = { base: "visitado", povoado: "boato", lugar: "boato", climax: "desconhecido" };

/* Os sinais que abrem a neblina, e até onde cada um abre:
   `cidadeDeOuvir`    — a cidade de que se ouviu falar (`deOuvir`, geografia.js);
   `cidadeDescoberta` — a cidade descoberta e não só ouvida;
   `pertoDeOndeDormiu`— o lugar cuja cidade próxima o herói pisou: quem dormiu
                        na vila sabe o caminho para a mina;
   `aHistoriaApontaLa`— o ato que mora no lugar chegou (o "descer" da espinha);
   `oGanchoApontaLa`  — o ato SEGUINTE mora lá: é para lá que o gancho manda
                        (a abertura nomeia o primeiro lugar do meio, com as
                        horas e o rumo — `historiaDoLugar`, abertura.js);
   `ditoAoHeroi`      — o App diz que o herói o conhece (`estado.conhecidos`);
   `oDestinoDaEstrada`— a estrada em curso vai para lá;
   `pisado`           — o herói está ou esteve lá (a cidade pisada, a boca,
                        a porta, `estado.visitados`);
   `concluido`        — a masmorra publicou o fim (`base.concluidas`). */
export const SINAIS_DA_NEBLINA = {
  cidadeDeOuvir: "boato",
  cidadeDescoberta: "conhecido",
  pertoDeOndeDormiu: "conhecido",
  aHistoriaApontaLa: "conhecido",
  oGanchoApontaLa: "conhecido",
  ditoAoHeroi: "conhecido",
  oDestinoDaEstrada: "conhecido",
  pisado: "visitado",
  concluido: "concluido",
};

/* O clímax só acorda pelo que diz respeito A ELE: a história chegar lá, o
   herói ir lá, ou alguém lho dizer. Dormir na vila ao pé não basta — a vila
   pode ser a própria base, e o fim da história estaria no mapa desde o
   primeiro turno. E o gancho também não: o ato antes do fim apontaria o
   fim um ato inteiro antes de a história lá chegar. */
export const SINAIS_QUE_ACORDAM_O_CLIMAX = ["aHistoriaApontaLa", "ditoAoHeroi", "oDestinoDaEstrada", "pisado", "concluido"];

/* O que cada estado mostra. `aparece: false` é não estar na lista de nós
   (só na contagem); `perigo` e `vizinhos` são da ficha, que o boato não
   tem — sabe-se que existe e para que lado, não quem lá anda. */
export const O_QUE_A_NEBLINA_MOSTRA = {
  desconhecido: { aparece: false, perigo: false, vizinhos: false },
  boato: { aparece: true, perigo: false, vizinhos: false },
  conhecido: { aparece: true, perigo: true, vizinhos: true },
  visitado: { aparece: true, perigo: true, vizinhos: true },
  concluido: { aparece: true, perigo: true, vizinhos: true },
};

/* QUANDO O ATO SE DIZ (as regras 1 e 2 do cabeçalho). `sempre`: desde o
   primeiro turno; `quandoOAtoChega`: a partir da etapa da história em que
   o ato do lugar começa; `nunca`: nunca. */
export const REVELACAO_DO_ATO = { inicio: "sempre", meio: "quandoOAtoChega", fim: "quandoOAtoChega", paralelo: "nunca" };

/* O PERIGO DA ESTRADA, para a cor da aresta. O povoado é terra de gente
   (`baixo`); a aresta vale o maior perigo das duas pontas, e o chão duro
   (marcha abaixo da estrada do clímax: montanha, pântano, gelo, deserto)
   sobe um degrau. Ponta cujo perigo a neblina esconde dá aresta sem perigo
   (`null`): a cor não pode dizer o que a ficha cala. */
export const PERIGO_NA_ESTRADA = {
  povoado: "baixo",
  chaoDuroSobe: 1,
  kmDiaDoChaoDuro: ROTA_DO_CLIMAX.kmDiaMinimo,
};

/* O DIA, para a tela pintar a luz. As fases dividem as 24 horas (`ate` em
   minutos, exclusivo); a madrugada e a noite são as horas de `ehNoite`
   (calendario.js), e a suíte prova que as duas réguas não discordam. `luz`
   são os pontos da curva (minuto, 0–1), interpolada em linha reta: a tela
   anima o céu sem saber o que é uma hora. */
export const FASES_DO_DIA = [
  { ate: 360, id: "madrugada" },
  { ate: 480, id: "amanhecer" },
  { ate: 720, id: "manha" },
  { ate: 1020, id: "tarde" },
  { ate: 1260, id: "entardecer" },
  { ate: 1440, id: "noite" },
];
export const LUZ_DO_DIA = [[0, 0.08], [300, 0.08], [420, 0.7], [540, 0.95], [720, 1], [960, 0.95], [1140, 0.55], [1260, 0.15], [1440, 0.08]];

/* ---------------- AS PEÇAS ---------------- */

const ordem = (e) => ESTADOS_DA_NEBLINA.indexOf(e);
const subir = (atual, para) => (ordem(para) > ordem(atual) ? para : atual);
const PERIGOS = PERIGO_POR_NIVEL.map((p) => p.id);

function luzDe(minuto) {
  const m = Math.max(0, Math.min(1440, minuto));
  for (let i = 1; i < LUZ_DO_DIA.length; i++) {
    const [a, la] = LUZ_DO_DIA[i - 1], [b, lb] = LUZ_DO_DIA[i];
    if (m <= b) return duas(la + ((lb - la) * (m - a)) / Math.max(1, b - a));
  }
  return LUZ_DO_DIA[LUZ_DO_DIA.length - 1][1];
}

/* O relógio: o dia e o minuto do App (`diaRef`, `minutoRef`). Sem minuto
   não há relógio — a tela fica com a luz que tiver por padrão. */
function relogioDe(e) {
  if (!finito(e.minuto)) return null;
  const minuto = ((Math.floor(Number(e.minuto)) % 1440) + 1440) % 1440;
  const dia = finito(e.dia) ? Math.max(1, Math.floor(Number(e.dia))) : 1;
  const fase = (FASES_DO_DIA.find((f) => minuto < f.ate) || FASES_DO_DIA[FASES_DO_DIA.length - 1]).id;
  return { dia, minuto, hora: horaTxt(minuto), fase, noite: ehNoite(minuto), luz: luzDe(minuto), estacao: estacaoDe(dia).id };
}

/* O ato de cada lugar na espinha: a primeira etapa cujo marco "descer"
   (escrito por `espinhaNaRegiao`) aponta para ele. É o único feitio que se
   lê — ver a regra 3 do cabeçalho. */
function atoDosLugares(espinha) {
  const out = new Map();
  lista(obj(espinha) && espinha.atos).forEach((a, i) => {
    for (const m of lista(obj(a) && a.marcos)) {
      if (!obj(m) || m.feitio !== "descer") continue;
      const k = semArtigo(m.onde);
      if (k && !out.has(k)) out.set(k, i);
    }
  });
  return out;
}

/* ============================================================
   A FUNÇÃO
   `estado` (tudo opcional; lixo é ausência):
     cidadeAtual, lugar, masmorra, jornada — onde o herói está (os refs);
     base       — a base do mundo (`baseMundoRef`: `concluidas`);
     espinha    — a espinha (`espinhaRef`), para o ato de cada lugar;
     etapa      — a etapa da história (`historiaRef.current.etapa`);
     dia, minuto— o relógio (`diaRef`, `minutoRef`);
     semente    — a semente do mundo, para o rumo do horizonte;
     visitados, conhecidos — listas de nomes de lugar (campo NOVO que o App
                  ainda não guarda: ver `mente/mm17-regiao.md`, etapa D).
   ============================================================ */
export function dadosDoMapaVivo(mapa, estado) {
  const m = obj(mapa);
  const r = m && obj(m.regiao);
  if (!r) return null;
  const e = obj(estado) || {};
  const M = MOLDURA_DO_MAPA_VIVO;

  /* ---------------- OS PONTOS (todos, antes da neblina) ---------------- */
  const cidades = lista(m.cidades).filter((c) => obj(c) && c.nome && finito(c.x) && finito(c.y));
  const baseNome = (obj(r.base) && r.base.nome) || (cidades[0] && cidades[0].nome) || "";
  const baseC = cidades.find((c) => c.nome === baseNome) || null;
  if (!baseC) return null;
  const povoadosR = new Map(lista(r.povoados).filter((p) => obj(p) && p.nome).map((p) => [p.nome, p]));
  const lugares = lista(r.lugares).filter((l) => obj(l) && l.nome && l.id && finito(l.x) && finito(l.y));

  const todos = [
    { id: `cidade|${baseC.nome}`, nome: baseC.nome, tipo: "base", src: baseC },
    ...cidades.filter((c) => c !== baseC).map((c) => ({ id: `cidade|${c.nome}`, nome: c.nome, tipo: "povoado", src: c })),
    ...lugares.map((l) => ({ id: String(l.id), nome: l.nome, tipo: "lugar", src: l, climax: l.ato === "fim" })),
  ];
  const porId = new Map(todos.map((n) => [n.id, n]));
  const porNome = new Map();
  for (const n of todos) if (!porNome.has(semArtigo(n.nome))) porNome.set(semArtigo(n.nome), n);
  const acha = (nome) => (nome ? porNome.get(semArtigo(nome)) || null : null);

  /* ---------------- O QUADRO ---------------- */
  const q = obj(r.quadro);
  const xs = todos.map((n) => Number(n.src.x)), ys = todos.map((n) => Number(n.src.y));
  const qx0 = q && finito(q.x0) ? Math.min(Number(q.x0), ...xs) : Math.min(...xs);
  const qy0 = q && finito(q.y0) ? Math.min(Number(q.y0), ...ys) : Math.min(...ys);
  const qx1 = q && finito(q.x1) ? Math.max(Number(q.x1), ...xs) : Math.max(...xs);
  const qy1 = q && finito(q.y1) ? Math.max(Number(q.y1), ...ys) : Math.max(...ys);
  const ladoPontos = Math.max(qx1 - qx0, qy1 - qy0, 1e-6);
  const ladoUnidades = ladoPontos / (1 - 2 * M.margem);
  const cx = (qx0 + qx1) / 2, cy = (qy0 + qy1) / 2;
  const fator = 10 ** M.casas;
  const arred = (v) => Math.round(v * fator) / fator;
  const nx = (x) => arred(0.5 + (Number(x) - cx) / ladoUnidades);
  const ny = (y) => arred(0.5 + (Number(y) - cy) / ladoUnidades);
  const ladoKm = duas(ladoUnidades * KM_POR_UNIDADE);
  const chao = TERRENO_VIAGEM[baseC.bioma] && TERRENO_VIAGEM[baseC.bioma].kmDia > 0 ? baseC.bioma : "planicie";
  const kmHora = TERRENO_VIAGEM[chao].kmDia / HORAS_MARCHA_POR_DIA;
  const reguaKm = [...M.reguasKm].reverse().find((k) => k <= ladoKm * M.reguaMaxima) || M.reguasKm[0];
  const quadro = {
    margem: M.margem,
    ladoKm,
    ladoHoras: duas(ladoKm / kmHora),
    chao,
    regua: { km: reguaKm, fracao: arred(reguaKm / ladoKm), horas: duas(reguaKm / kmHora) },
  };

  /* ---------------- ONDE O HERÓI ESTÁ ---------------- */
  const cidadeAtual = typeof e.cidadeAtual === "string" ? e.cidadeAtual : "";
  const mm = obj(e.masmorra) && e.masmorra.nome ? e.masmorra : null;
  const lugarH = obj(e.lugar) && e.lugar.nome ? e.lugar : null;
  let jornada = null;
  try { jornada = mm ? null : jornadaValida(obj(e.jornada), cidadeAtual); } catch { jornada = null; }
  if (jornada && !jornada.para) jornada = null;

  const noNaRegiao = (lugar) => { const l = lugar ? masmorraDaBoca(lugar, lugares) : null; return l ? porId.get(String(l.id)) || null : null; };
  const noDaMasmorra = mm ? noNaRegiao(mm) : null;
  const noDaBoca = !mm && !jornada ? noNaRegiao(lugarH) : null;
  const noDaCidade = acha(cidadeAtual);
  const destino = jornada ? acha(jornada.para) || acha(obj(jornada.alvo) && jornada.alvo.nome) : null;

  /* ---------------- A NEBLINA ---------------- */
  const base = obj(e.base);
  const espinha = obj(e.espinha);
  const etapa = finito(e.etapa) ? Math.max(0, Math.floor(Number(e.etapa))) : finito(obj(e.historia) && e.historia.etapa) ? Math.max(0, Math.floor(Number(e.historia.etapa))) : 0;
  const atoDe = atoDosLugares(espinha);
  const visitados = new Set(lista(e.visitados).map(semArtigo).filter(Boolean));
  const conhecidos = new Set(lista(e.conhecidos).map(semArtigo).filter(Boolean));
  const concluido = (nome) => { try { return !!base && lugarConcluido(base, nome); } catch { return false; } };

  const estadoDe = new Map();
  /* primeiro as cidades: o "perto de onde dormiu" dos lugares lê-as */
  for (const n of todos.filter((x) => x.tipo !== "lugar")) {
    const c = n.src;
    let s = PISO_DA_NEBLINA[n.tipo];
    if (c.descoberta !== false && c.deOuvir) s = subir(s, SINAIS_DA_NEBLINA.cidadeDeOuvir);
    if (c.descoberta !== false && !c.deOuvir) s = subir(s, SINAIS_DA_NEBLINA.cidadeDescoberta);
    if (c.pisada || n === noDaCidade || visitados.has(semArtigo(n.nome))) s = subir(s, SINAIS_DA_NEBLINA.pisado);
    if (n === destino) s = subir(s, SINAIS_DA_NEBLINA.oDestinoDaEstrada);
    if (conhecidos.has(semArtigo(n.nome))) s = subir(s, SINAIS_DA_NEBLINA.ditoAoHeroi);
    estadoDe.set(n.id, s);
  }
  for (const n of todos.filter((x) => x.tipo === "lugar")) {
    const l = n.src;
    const k = semArtigo(n.nome);
    const vale = (sinal) => !n.climax || SINAIS_QUE_ACORDAM_O_CLIMAX.includes(sinal);
    const sinais = {
      pertoDeOndeDormiu: (() => { const c = acha(l.cidadeProxima); return !!c && c.tipo !== "lugar" && ordem(estadoDe.get(c.id)) >= ordem("visitado"); })(),
      aHistoriaApontaLa: atoDe.has(k) && atoDe.get(k) <= etapa,
      oGanchoApontaLa: atoDe.has(k) && atoDe.get(k) === etapa + 1,
      ditoAoHeroi: conhecidos.has(k),
      oDestinoDaEstrada: n === destino,
      pisado: n === noDaBoca || n === noDaMasmorra || visitados.has(k),
      concluido: concluido(n.nome),
    };
    let s = PISO_DA_NEBLINA[n.climax ? "climax" : "lugar"];
    for (const [sinal, sim] of Object.entries(sinais)) if (sim && vale(sinal)) s = subir(s, SINAIS_DA_NEBLINA[sinal]);
    estadoDe.set(n.id, s);
  }
  const mostra = (id) => O_QUE_A_NEBLINA_MOSTRA[estadoDe.get(id)] || O_QUE_A_NEBLINA_MOSTRA.desconhecido;
  const aparece = (id) => !!(porId.has(id) && mostra(id).aparece);

  /* ---------------- OS NÓS ---------------- */
  const vizinhoId = (v) => {
    if (!obj(v)) return null;
    if (porId.has(String(v.id))) return String(v.id);
    const n = acha(v.nome || v.id);
    return n ? n.id : null;
  };
  const rotas = lista(m.rotas).filter((x) => obj(x) && x.de && x.para && finito(x.dias));
  const horasDaRota = (x) => duas(Number(x.dias) * HORAS_MARCHA_POR_DIA);
  /* MM17 nº 3 (v9.364): A MARCHA ÚNICA. Na região de agora, a hora de um par
     é a da conta única (`caminhoNaRegiao`, marcha.js) — a mesma que a
     jornada cobra —, e um par cujo caminho passa por uma povoação NÃO tem
     traço reto: o herói vai pelas outras arestas, e um traço com a hora do
     desvio por cima da serra seria a tela a mentir. `undefined` = a conta
     única não fala deste mapa (região v1): fica a hora guardada, como antes. */
  const marchaDe = new Map();
  const marcha = (a, b) => {
    const k = `${a}~${b}`;
    if (!marchaDe.has(k)) { let c; try { c = caminhoNaRegiao(m, a, b); } catch { c = null; } marchaDe.set(k, c || undefined); }
    return marchaDe.get(k);
  };
  const horasDoPar = (a, b, guardada) => {
    const c = marcha(a, b);
    if (c === undefined) return guardada;
    return c.desvio ? null : c.escolhido.horas;
  };
  const atoPublico = (n) => {
    const ato = n.tipo === "base" ? "inicio" : n.tipo === "lugar" ? n.src.ato : null;
    const regra = REVELACAO_DO_ATO[ato];
    if (regra === "sempre") return ato;
    if (regra === "quandoOAtoChega") { const i = atoDe.get(semArtigo(n.nome)); return Number.isFinite(i) && i <= etapa ? ato : null; }
    return null;
  };
  /* o momento do lugar na história: `agora` (o ato de agora mora lá),
     `passado` (já morou), `proximo` (é para lá que o gancho manda — nunca o
     clímax, pela mesma razão do sinal) */
  const momentoDe = (n) => {
    const i = n.tipo === "base" ? 0 : atoDe.get(semArtigo(n.nome));
    if (Number.isFinite(i) && i === etapa + 1 && !n.climax) return "proximo";
    if (!Number.isFinite(i) || i > etapa) return null;
    return i === etapa ? "agora" : "passado";
  };

  const nos = [];
  for (const n of todos) {
    if (!aparece(n.id)) continue;
    const v = mostra(n.id);
    const s = n.src;
    let horasDaBase = 0, vizinhos = [], perigo = null, perigoRotulo = "";
    if (n.tipo === "povoado") {
      const p = povoadosR.get(n.nome);
      const rota = rotas.find((x) => (x.de === baseC.nome && x.para === n.nome) || (x.para === baseC.nome && x.de === n.nome));
      horasDaBase = p && finito(p.horas) ? Number(p.horas) : rota ? horasDaRota(rota) : null;
      { const c = marcha(baseC.nome, n.nome); if (c) horasDaBase = c.escolhido.horas; }
    } else if (n.tipo === "lugar") {
      const f = obj(s.ficha) || {};
      horasDaBase = finito(f.horas) ? Number(f.horas) : null;
      { const c = marcha(baseC.nome, String(s.id)); if (c) horasDaBase = c.escolhido.horas; }
      if (v.perigo && PERIGOS.includes(f.perigo)) { perigo = f.perigo; perigoRotulo = String(f.perigoRotulo || ""); }
    }
    if (v.vizinhos) {
      if (n.tipo === "lugar") {
        vizinhos = lista(obj(s.ficha) && s.ficha.vizinhos)
          .map((x) => ({ id: vizinhoId(x), horas: obj(x) && finito(x.horas) ? Number(x.horas) : null }))
          .map((x) => (x.id ? { ...x, horas: horasDoPar(String(s.id), x.id.startsWith("cidade|") ? x.id.slice(7) : x.id, x.horas) } : x))
          .filter((x) => x.id && aparece(x.id) && x.horas != null);
      } else {
        vizinhos = rotas.filter((x) => x.de === n.nome || x.para === n.nome)
          .map((x) => ({ id: `cidade|${x.de === n.nome ? x.para : x.de}`, horas: horasDoPar(n.nome, x.de === n.nome ? x.para : x.de, horasDaRota(x)) }))
          .filter((x) => aparece(x.id) && x.horas != null);
      }
    }
    const no = {
      id: n.id, nome: n.nome, tipo: n.tipo,
      subtipo: n.tipo === "lugar" ? String(s.tipo || "") : String(s.porte || s.tipo || ""),
      icone: n.tipo === "lugar" ? String(s.icone || "") : "",
      x: nx(s.x), y: ny(s.y),
      estado: estadoDe.get(n.id),
      perigo, perigoRotulo,
      horasDaBase,
      vizinhos,
      atoDaHistoria: atoPublico(n),
      momento: momentoDe(n),
      aqui: false,
    };
    if (n.tipo === "lugar" && s.rumor) no.boato = String(s.rumor);
    nos.push(no);
  }
  const noVisivel = new Map(nos.map((x) => [x.id, x]));

  /* ---------------- AS ARESTAS ---------------- */
  const perigoDaPonta = (id) => {
    const x = noVisivel.get(id);
    if (!x) return undefined;
    if (x.tipo !== "lugar") return PERIGO_NA_ESTRADA.povoado;
    return x.perigo;   // null quando a neblina o cala
  };
  const perigoDaAresta = (a, b, chaoDaIda) => {
    const pa = perigoDaPonta(a), pb = perigoDaPonta(b);
    if (!pa || !pb) return null;
    let i = Math.max(PERIGOS.indexOf(pa), PERIGOS.indexOf(pb));
    const t = TERRENO_VIAGEM[chaoDaIda];
    if (t && t.kmDia > 0 && t.kmDia < PERIGO_NA_ESTRADA.kmDiaDoChaoDuro) i += PERIGO_NA_ESTRADA.chaoDuroSobe;
    return PERIGOS[Math.max(0, Math.min(PERIGOS.length - 1, i))];
  };
  const arestas = [];
  const chaveDe = (a, b) => [a, b].sort().join("~");
  const jaTem = new Map();
  const juntar = (de, para, horas, extra) => {
    if (!aparece(de) || !aparece(para) || de === para || horas == null) return;
    const k = chaveDe(de, para);
    const ja = jaTem.get(k);
    if (ja) { if (ja.para === de && ja.horasDeVolta == null) ja.horasDeVolta = horas; return; }
    const a = { id: k, de, para, horas, horasDeVolta: null, ...extra };
    a.perigo = perigoDaAresta(de, para, a.tipoDeChao);
    jaTem.set(k, a);
    arestas.push(a);
  };
  for (const x of rotas) {
    juntar(`cidade|${x.de}`, `cidade|${x.para}`, horasDoPar(x.de, x.para, horasDaRota(x)), { tipoDeChao: String(x.terreno || ""), modo: "estrada", origem: "rota", km: finito(x.km) ? Number(x.km) : null });
  }
  /* as idas da ficha: da base a cada lugar visível (a hora que a ficha diz e
     a boca cobra), e de cada lugar com ficha aberta aos seus vizinhos. O
     chão e o modo são os da ida que o jogo faria (`rotaAteAMasmorra`, com a
     régua da versão da região) — a hora é a da ficha, que é a verdade
     guardada. */
  const ida = (destino, origem) => { try { return rotaAteAMasmorra(destino, origem, { regiao: r }); } catch { return null; } };
  for (const n of todos.filter((x) => x.tipo === "lugar")) {
    if (!aparece(n.id)) continue;
    const f = obj(n.src.ficha) || {};
    const daBase = ida(n.src, baseC);
    const hb = horasDoPar(baseC.nome, String(n.src.id), finito(f.horas) ? Number(f.horas) : null);
    if (hb != null) juntar(`cidade|${baseC.nome}`, n.id, hb, { tipoDeChao: daBase ? daBase.terreno : String(n.src.bioma || ""), modo: f.modo || (daBase ? daBase.modo : ""), origem: "ficha", km: finito(f.km) ? Number(f.km) : null });
    if (!mostra(n.id).vizinhos) continue;
    for (const v of lista(f.vizinhos)) {
      const vid = vizinhoId(v);
      if (!vid || !obj(v) || !finito(v.horas)) continue;
      const alvo = porId.get(vid);
      const i = alvo ? ida(alvo.src, n.src) : null;
      const hv = alvo ? horasDoPar(String(n.src.id), alvo.tipo === "lugar" ? String(alvo.src.id) : alvo.nome, Number(v.horas)) : Number(v.horas);
      if (hv == null) continue;
      juntar(n.id, vid, hv, { tipoDeChao: i ? i.terreno : "", modo: i ? i.modo : "", origem: "ficha", km: i ? i.km : null });
    }
  }

  /* ---------------- O HERÓI (num sítio só) ---------------- */
  const ponto = (x, y) => {
    if (!finito(x) || !finito(y)) return { x: null, y: null, foraDoQuadro: false };
    const a = nx(x), b = ny(y);
    const fora = a < 0 || a > 1 || b < 0 || b > 1;
    return { x: Math.max(0, Math.min(1, a)), y: Math.max(0, Math.min(1, b)), foraDoQuadro: fora };
  };
  const marcar = (n) => { const x = n ? noVisivel.get(n.id) : null; if (x) x.aqui = true; return x; };
  let heroi = { onde: "nenhum", noId: null, x: null, y: null, foraDoQuadro: false };
  if (mm) {
    const salas = lista(mm.salas).filter(obj);
    const atual = salas.find((s) => s.id === mm.atual) || null;
    let prog = { visitadas: 0, total: 0, pct: 0 };
    try { if (salas.length) prog = progressoMasmorra({ ...mm, salas }); } catch { /* fica o zero */ }
    const no = marcar(noDaMasmorra);
    const p = no ? { x: no.x, y: no.y, foraDoQuadro: false } : ponto(obj(mm.coord) && mm.coord.x, obj(mm.coord) && mm.coord.y);
    heroi = {
      onde: "masmorra", noId: no ? no.id : null, ...p,
      masmorra: {
        nome: String(mm.nome),
        camada: atual && finito(atual.camada) ? Number(atual.camada) : 0,
        camadas: salas.reduce((a, s) => Math.max(a, finito(s.camada) ? Number(s.camada) : 0), 0),
        progresso: prog,
      },
    };
  } else if (jornada) {
    let pt = null, prog = null;
    try { pt = pontoDoHeroi({ cidadeAtual, jornada, mapa: m }); } catch { pt = null; }
    try { prog = progressoDaViagem(jornada); } catch { prog = null; }
    const total = finito(jornada.totalMin) ? Math.max(1, Number(jornada.totalMin)) : null;
    const feito = total != null && finito(jornada.andadoMin) ? Math.max(0, Math.min(total, Number(jornada.andadoMin))) : 0;
    const fracao = prog ? Math.max(0, Math.min(1, prog.fracao)) : 0;
    const deN = acha(jornada.de);
    const deId = deN && aparece(deN.id) ? deN.id : null;
    const paraId = destino && aparece(destino.id) ? destino.id : null;
    heroi = {
      onde: "viagem", noId: null,
      ...(pt ? ponto(pt.x, pt.y) : { x: null, y: null, foraDoQuadro: false }),
      jornada: {
        de: String(jornada.de || ""), para: String(jornada.para || ""),
        deId, paraId,
        arestaId: deId && paraId && jaTem.has(chaveDe(deId, paraId)) ? chaveDe(deId, paraId) : null,
        fracao: arred(fracao),
        horasFeitas: total != null ? duas(feito / 60) : null,
        horasQueFaltam: total != null ? duas((total - feito) / 60) : null,
        horasTotais: total != null ? duas(total / 60) : null,
        estado: String(jornada.estado || "em_curso"),
      },
    };
  } else if (noDaBoca) {
    const no = marcar(noDaBoca);
    heroi = { onde: "boca", noId: no ? no.id : null, ...(no ? { x: no.x, y: no.y, foraDoQuadro: false } : ponto(noDaBoca.src.x, noDaBoca.src.y)) };
  } else if (lugarH && lugarH.distancia !== "dentro" && obj(lugarH.coord) && finito(lugarH.coord.x)) {
    heroi = { onde: "arredor", noId: null, lugar: String(lugarH.nome), cidade: String(lugarH.cidade || ""), ...ponto(lugarH.coord.x, lugarH.coord.y) };
  } else if (noDaCidade && noDaCidade.tipo !== "lugar") {
    const no = marcar(noDaCidade);
    heroi = { onde: noDaCidade.tipo === "base" ? "base" : "povoado", noId: no ? no.id : null, ...(no ? { x: no.x, y: no.y, foraDoQuadro: false } : ponto(noDaCidade.src.x, noDaCidade.src.y)), ...(lugarH ? { lugar: String(lugarH.nome) } : {}) };
  }

  /* ---------------- O HORIZONTE ----------------
   Cada nome na borda, num rumo seu. Os rumos são os oito da rosa
   (`RUMOS`, coordenadas.js), baralhados pela semente do mundo e dados um
   a cada nome — o horizonte tem no máximo seis (`HORIZONTE.maximo`) e a rosa
   tem oito, logo dois nunca se empilham. O ponto é onde o rumo sai do
   quadrado: a tela desenha o nome DEPOIS da margem, a apontar para fora. */
  const hz = lista(r.horizonte).filter((h) => obj(h) && h.nome);
  const rnd = rngDe(`${String(e.semente == null ? "" : e.semente)}|${String(r.nome || baseC.nome)}|mapa-vivo|horizonte`);
  const rosa = RUMOS.map((x, i) => ({ x, i, k: rnd() })).sort((a, b) => a.k - b.k || a.i - b.i);
  const horizonte = hz.map((h, i) => {
    const { x: rumo, i: oitavo } = rosa[i];
    const g = (oitavo * 45 * Math.PI) / 180;
    const dx = Math.sin(g), dy = -Math.cos(g);
    const t = 0.5 / Math.max(Math.abs(dx), Math.abs(dy));
    return { nome: String(h.nome), tipo: String(h.tipo || ""), boato: String(h.boato || ""), rumo: rumo.id, rotulo: rumo.rotulo, x: arred(0.5 + dx * t), y: arred(0.5 + dy * t) };
  });

  /* ---------------- A CONTAGEM ---------------- */
  const contagem = Object.fromEntries(ESTADOS_DA_NEBLINA.map((s) => [s, 0]));
  for (const n of todos) contagem[estadoDe.get(n.id)]++;

  return {
    regiao: { nome: String(r.nome || ""), versao: finito(r.versao) ? Number(r.versao) : 1 },
    quadro,
    nos,
    arestas,
    heroi,
    neblina: { contagem, ocultos: contagem.desconhecido },
    horizonte,
    relogio: relogioDe(e),
  };
}
