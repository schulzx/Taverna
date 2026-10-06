/* ============================================================
   A REGIÃO DELIMITADA (MM17, etapa A) — o mapa do tamanho da história

   A pessoa, a 06/10: *"agora nossa campanha tem estrutura, tem espinha,
   início, meio e fim... não precisamos de um mapa infinito, podemos ter
   um mapa definido e muito mais complexo com uma zona delimitada... a
   história já vem com os ganchos de pra onde o player tem que ir, o mapa
   por ser menor pode ser melhor trabalhado e mais rico."*

   O continente de `gerarGeografia` tem 4 a 24 cidades espalhadas por um
   quadro de 2.500 km, e a masmorra de `masmorrasDoMundo` nasce a até oito
   unidades de uma cidade em cada eixo — a "Nave de Ferro" da 3.ª sessão
   ficava a dias de marcha, e a medida (`testes/medir-regiao.mjs`) diz que
   isso é a regra, não o azar. Um mapa assim é grande e é vazio: as cidades
   têm gente, e o que há entre elas não tem ficha nenhuma.

   Aqui o mundo jogável encolhe para UMA REGIÃO, e cresce por dentro:

     · uma cidade-base (onde a história começa), 3 a 4 povoados e 5 a 8
       lugares de interesse (masmorras, ruínas, acampamentos);
     · tudo a no máximo UM DIA de marcha da base (`ALCANCE_DA_REGIAO`), e
       por isso a região inteira, de ponta a ponta, é de dois dias;
     · cada lugar com o seu ATO (o início na base, o meio em 2–3 lugares,
       o fim no lugar do clímax) e com FICHA: quem anda por lá, a que horas
       fica da base e dos vizinhos, o perigo e a planta;
     · e o resto do continente vira HORIZONTE: reinos, regiões e cidades
       que existem só como nome e boato — sem ficha, sem ponto no mapa e
       sem custo de prompt.

   ---------------- O MESMO FORMATO, E SÓ CAMPO NOVO ----------------

   O que sai daqui é um `mapa` igual ao de `gerarGeografia` — continente,
   continentes, regiões, cidades e rotas, `x,y` na mesma escala de
   `KM_POR_UNIDADE` — com UM campo a mais, `mapa.regiao`, que a versão
   antiga ignora. As rotas são as de `gerarRotas`, letra a letra, porque é
   isso que `garantirGeografia` recalcula no load: um mapa que dependesse
   de rota própria mudaria ao ser lido. E as masmorras são as que
   `masmorrasDoMundo` (mundo-base.js) devolve quando o mapa tem região: os
   lugares desta, no formato de sempre.

   O tamanho NÃO é número de km: é tempo de marcha. Pôr o lugar a "30 km"
   punha-o a um dia na planície e a dois e meio na montanha. O lugar é
   posto pelas horas, e os km saem da tabela de marcha que o jogo já usa
   (`TERRENO_VIAGEM`); a ficha mede a ida com a MESMA conta da boca da
   masmorra (`rotaAteAMasmorra`, boca.js) — uma verdade só.

   A ESPINHA (etapa C1, v9.357): `amarrarEspinha` diz onde mora cada ato, e
   `espinhaNaRegiao` escreve-o — o "descer" de cada lugar e o confronto no
   clímax —, uma vez, na criação de uma campanha nova com região.

   O QUE ESTE MÓDULO NÃO FAZ: não liga nada ao App (é o App que o chama), e não
   serve molde que não seja continental (a Torre já é delimitada pelos
   andares; o Arquipélago e o Braço estão fora do beta): devolve `null`, e
   quem chama fica com `gerarGeografia`.
   ============================================================ */

import { gerarGeografia, gerarRotas, rngDe, populacaoDe, TERRENO_VIAGEM, KM_POR_UNIDADE } from "./geografia.js";
import { moldePorId } from "./moldes.js";
import { HORAS_MARCHA_POR_DIA } from "./viagem.js";
import { kmEntre, rumoEntre } from "./coordenadas.js";
import { rotaAteAMasmorra, horasPeloChao, IDA_NA_REGIAO } from "./boca.js";
import { criaturasDaRegiao, locaisDaCidade, genteDoLocal, chefesDoMundo, TIPOS_MASMORRA, EPITETOS, RUMORES } from "./mundo-base.js";
import { estruturaPorId, custoDaEtapa, pesoDe } from "./historia.js";
import { garantirEspinha, feitioDe } from "./saga.js";
import { garantirModo } from "./modos.js";

const pick = (rnd, arr) => arr[Math.floor(rnd() * arr.length)];
const entre = (rnd, [a, b]) => a + Math.floor(rnd() * (b - a + 1));
const noIntervalo = (rnd, [a, b]) => a + rnd() * (b - a);
const norm = (s) => String(s == null ? "" : s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
const semArtigo = (s) => norm(s).replace(/^(o|a|os|as)\s+/, "").trim();
const duas = (n) => Math.round(n * 100) / 100;

/* ---------------- AS TABELAS ----------------
   Quantos de cada coisa. `meio` é quantos lugares levam o meio da história
   — com a estrutura conhecida, o que ela pede (etapas menos o início e o
   fim), dentro desta faixa. `subregioes` são os chãos da região (o coração,
   onde está a base, e um ou dois vizinhos de outro bioma). */
export const FAIXAS_DA_REGIAO = {
  /* a pessoa disse "2 a 4"; o piso é 3 pela mesma conta de gente do
     `PORTES_DA_REGIAO` (com 2, o elenco cheio cai de 84% para 75%) */
  povoados: [3, 4],
  lugares: [5, 8],
  meio: [2, 3],
  subregioes: [2, 3],
};

/* O ALCANCE, em HORAS DE MARCHA a partir da base. O teto é o dia de marcha
   da casa (`HORAS_MARCHA_POR_DIA`, viagem.js): a pior ida da base a qualquer
   coisa da região é um dia — e a região inteira, de um lado ao outro, dois.
   Cada ato tem a sua faixa: a história CAMINHA PARA FORA (a regra de
   `estenderEspinha`), e o clímax fica na borda. Os povoados ficam a menos
   de um dia por folga de arredondamento: a rota arredonda os km às dezenas
   (`gerarRotas`), e sete horas de estrada ainda arredondam a um dia. */
export const ALCANCE_DA_REGIAO = {
  horasMaximas: HORAS_MARCHA_POR_DIA,
  povoado: [3, 7],
  meio: [4, 7],
  fim: [7, 8],
  paralelo: [2, 6],
};

/* ONDE SE MORA. Uma rota de cidade a cidade tem no mínimo 20 km
   (`gerarRotas`), e a 12 ou 15 km por dia (montanha, pântano, gelo,
   deserto) isso é dia e meio — nenhum povoado nesses chãos ficaria a um
   dia da base. É também o que a história diz: vila nasce na estrada, na
   lavoura e na beira-mar; a montanha e o pântano guardam as masmorras. */
export const BIOMAS_HABITAVEIS = ["planicie", "colina", "floresta", "costa"];

/* O PORTE, pela posição na lista de portes do molde (do menor ao maior —
   a mesma régua de `mundo-base`). A base é a CAPITAL DA REGIÃO, e os
   povoados são, pela ordem em que existem, o forte da fronteira, a cidade
   vizinha, a vila e a aldeia. O porte não é gosto, é gente: o mundo é
   menor, e quem sustenta o elenco de 24 (`TAMANHO_DO_ELENCO`) e os marcos
   da espinha é a gente da base do mundo, que cresce com os locais de cada
   porte. Medido em 200 mundos (`medir-regiao.mjs`, 06/10): com a base
   "cidade" e aldeias, o elenco ficava cheio em 24 de 120 e um ato em sete
   ficava sem marcos que o pesassem; assim, 167 de 200 e um em dezoito. */
export const PORTES_DA_REGIAO = {
  base: 4,
  povoados: [3, 2, 1, 0],
};

/* O PERIGO E O TAMANHO, pelo ato do lugar. O nível é o que `dificuldade.js`
   já lê; as salas cabem na planta (`PLANTA_DA_MASMORRA`, 4 a 20) e no que o
   mundo anunciava (5 a 12). O clímax é o fundo da história e o maior lugar
   dela; o paralelo é o que se faz entre um marco e outro. */
export const NIVEL_POR_ATO = { meio: [3, 7], fim: [8, 12], paralelo: [1, 6] };
export const SALAS_POR_ATO = { meio: [6, 9], fim: [10, 12], paralelo: [5, 7] };

/* O perigo em palavra, pelo nível — o rótulo da ficha. */
export const PERIGO_POR_NIVEL = [
  { ate: 3, id: "baixo", rotulo: "perigo baixo" },
  { ate: 7, id: "medio", rotulo: "perigo médio" },
  { ate: 11, id: "alto", rotulo: "perigo alto" },
  { ate: Infinity, id: "mortal", rotulo: "perigo mortal" },
];

/* O ACAMPAMENTO é o terceiro tipo que a pessoa nomeou ("masmorras, ruínas,
   acampamentos"). A ruína e as masmorras já estão em `TIPOS_MASMORRA`
   (mundo-base.js); o acampamento entra com a MESMA mecânica — tendas são
   salas, a do chefe é o fundo —, porque um covil de salteadores com
   guardas, armadilhas e o butim do chefe é exatamente o que a planta já
   sabe ser. Nada novo para o motor: só o nome e o ícone. */
export const TIPOS_DE_LUGAR = [
  ...TIPOS_MASMORRA,
  { tipo: "acampamento", icone: "⛺", nomes: ["Acampamento de {x}", "Paliçada de {x}", "Covil de {x}"] },
];

/* A ESTRADA DO CLÍMAX: o chão do lugar do fim tem de ter marcha de estrada
   — o mínimo para que um dia de marcha passe dos 15 km da ida a pé, que é a
   régua de `KM_ATE_ONDE_SE_VAI_A_PE` (coordenadas.js). */
export const ROTA_DO_CLIMAX = { kmDiaMinimo: 16 };

/* QUANTOS VIZINHOS a ficha mede, e quantos bichos diz que andam por lá. */
export const FICHA_DO_LUGAR = { vizinhos: 2, quem: 2 };

/* O HORIZONTE: o que fica além da região. Só nome e boato — sem ficha, sem
   coordenada, sem rota. `maximo` segura o save e o prompt. */
export const HORIZONTE = {
  minimo: 3,
  maximo: 6,
  boatos: {
    terra: ["dizem que do outro lado do mar ainda há reis", "os mercadores falam dela como de um sonho caro", "ninguém daqui foi e voltou para contar"],
    regiao: ["as caravanas que vêm de lá chegam com semanas de pó", "de lá vêm o sal e as más notícias", "contam que a estrada para lá está fechada desde o inverno"],
    cidade: ["é de lá que vêm os cobradores", "quem tem dinheiro para fugir foge para lá", "lá se vende o que aqui não se diz", "os soldados que passam falam dela"],
  },
};

/* ---------------- O GERADOR ---------------- */

/* Os km de uma ida de `horas` pelo chão `bioma`: a tabela de marcha do
   jogo, e nunca mais que o dia dela. */
function kmDeHoras(horas, bioma) {
  const t = TERRENO_VIAGEM[bioma] && TERRENO_VIAGEM[bioma].kmDia > 0 ? TERRENO_VIAGEM[bioma] : TERRENO_VIAGEM.planicie;
  return (Math.min(horas, ALCANCE_DA_REGIAO.horasMaximas) / HORAS_MARCHA_POR_DIA) * t.kmDia;
}

/* MM17 C1: os km de uma ida de `horas` da base (chão `deOnde`) a um lugar
   do chão `bioma`, pela régua da região da boca (`horasPeloChao`): metade
   da marcha em cada chão. A conta inversa da que a boca faz na ida — e por
   isso o lugar fica às horas que a ficha diz. */
function kmDaIda(horas, deOnde, bioma) {
  const porKm = horasPeloChao(1, deOnde, bioma);
  return porKm > 0 ? Math.min(horas, ALCANCE_DA_REGIAO.horasMaximas) / porKm : 0;
}

/* A versão da região que este gerador escreve: a que mede a ida pelo chão
   (`IDA_NA_REGIAO`, boca.js). A v1 (v9.356) foi medida pela régua antiga
   e continua a ser lida por ela. */
const REGIAO_DESTA_VERSAO = { versao: IDA_NA_REGIAO.versaoMinima };

/* As horas de uma ida pela régua da boca da masmorra: a pé em minutos,
   pela estrada em meios-dias de marcha. É o que a ficha diz e o que o jogo
   cobrará quando o herói for. */
function idaEntre(destino, origem) {
  const r = rotaAteAMasmorra(destino, origem, { regiao: REGIAO_DESTA_VERSAO });
  if (!r) return null;
  const horas = r.modo === "a_pe" ? r.minutos / 60 : r.dias * HORAS_MARCHA_POR_DIA;
  return { horas: duas(horas), km: duas(r.km), modo: r.modo, dias: r.dias, terreno: r.terreno, rumo: r.rumo ? r.rumo.rotulo : "" };
}

function perigoDe(nivel) {
  return PERIGO_POR_NIVEL.find((p) => nivel <= p.ate) || PERIGO_POR_NIVEL[PERIGO_POR_NIVEL.length - 1];
}

/* `{ semente, molde, genero, lex, estrutura }` → um `mapa`, ou `null` quando
   o molde não é continental. Determinístico pela semente: nenhum sorteio sai
   de fora do gerador semeado. */
export function gerarRegiao(opcoes) {
  const o = opcoes && typeof opcoes === "object" ? opcoes : {};
  const semente = String(o.semente == null ? "" : o.semente);
  const m = moldePorId(o.molde && o.molde.id ? o.molde.id : o.molde);
  if (m.topologia !== "continental") return null;
  const genero = typeof o.genero === "string" && o.genero ? o.genero : "Fantasia medieval";
  const lex = o.lex && typeof o.lex === "object" ? o.lex : null;
  const rnd = rngDe(`${semente}|regiao`);

  /* O CONTINENTE DE ONDE A REGIÃO É UM CANTO. Dele saem os nomes — o léxico
     já nomeou estas terras, e a região usa os nomes que ele deu — e o
     horizonte: o que sobra do continente vira boato. */
  const geo = gerarGeografia(semente, m, lex);
  const biomasDoMolde = (m.biomas || []).map((b) => b.id);
  const habitaveis = BIOMAS_HABITAVEIS.filter((b) => !biomasDoMolde.length || biomasDoMolde.includes(b));

  /* os chãos: o coração (habitável, onde a base e os povoados moram) e os
     vizinhos, com o bioma que o continente lhes deu */
  const nSub = Math.max(1, Math.min(entre(rnd, FAIXAS_DA_REGIAO.subregioes), geo.regioes.length));
  const regioes = geo.regioes.slice(0, nSub).map((r, i) => ({
    nome: r.nome, continente: geo.continente,
    bioma: i === 0 && !habitaveis.includes(r.bioma) ? pick(rnd, habitaveis.length ? habitaveis : BIOMAS_HABITAVEIS) : r.bioma,
    cx: 50, cy: 50,
  }));
  const coracao = regioes[0];

  /* ---------------- A BASE E OS POVOADOS ---------------- */
  const P = m.portes && m.portes.length === 5 ? m.portes : ["aldeia", "vila", "cidade", "fortaleza", "capital"];
  const nPov = Math.max(FAIXAS_DA_REGIAO.povoados[0], Math.min(entre(rnd, FAIXAS_DA_REGIAO.povoados), geo.cidades.length - 1));
  const nomes = geo.cidades.map((c) => c.nome);
  const cidade = (nome, porte, x, y, reg, bioma = reg.bioma) => ({
    nome, tipo: porte, porte, populacao: populacaoDe(porte, rnd),
    regiao: reg.nome, continente: geo.continente, bioma,
    faccao: null, relacao: "neutra", locais: [], sede: false, notas: "",
    x, y, descoberta: false,
  });
  const base = cidade(nomes[0], P[PORTES_DA_REGIAO.base], 50, 50, coracao);
  const cidades = [base];
  const giro = rnd() * Math.PI * 2;
  /* O MAIOR POVOADO FICA MAIS LONGE. A espinha caminha para fora e põe o
     último ato nas cidades mais distantes da base (`estenderEspinha`); se a
     borda fosse uma aldeia de duas casas, o fim da história ficava sem gente
     nem lugar para os marcos que o pesam (medido: os atos curtos são quase
     todos o último). Os portes saem da tabela, e as horas sobem com o
     tamanho — o forte e a cidade vizinha na fronteira, a aldeia ao pé. */
  const locaisDoPorte = m.locaisPorPorte && m.locaisPorPorte.length === 5 ? m.locaisPorPorte : [2, 3, 5, 4, 7];
  const portesPov = Array.from({ length: nPov }, (_, i) => PORTES_DA_REGIAO.povoados[i % PORTES_DA_REGIAO.povoados.length])
    .sort((a, b) => locaisDoPorte[a] - locaisDoPorte[b]);
  const horasPov = portesPov.map(() => noIntervalo(rnd, ALCANCE_DA_REGIAO.povoado)).sort((a, b) => a - b);
  for (let i = 0; i < nPov; i++) {
    const porte = P[portesPov[i]];
    const ang = giro + (i * Math.PI * 2) / nPov + (rnd() - 0.5) * 0.5;
    const horas = horasPov[i];
    /* OS POVOADOS DÃO A VOLTA PELOS CHÃOS. Com todos no coração, a região
       inteira tinha UM bando de bichos (`criaturasDaRegiao` é por região), e
       a espinha esgotava-o: cada "acabar com" gasta uma criatura, e o ato
       ficava sem marco que o pesasse. O povoado de um chão duro é a vila
       da fronteira dele — pertence-lhe (os bichos dele, os boatos dele) e
       mora na borda habitável, no chão do coração. */
    const reg = regioes[(i + 1) % regioes.length];
    const bioma = habitaveis.includes(reg.bioma) ? reg.bioma : coracao.bioma;
    /* o chão da ESTRADA, que é o de `gerarRotas` para estas duas pontas */
    const prova = gerarRotas([base, { ...base, nome: `${base.nome}·`, bioma, x: base.x + 1 }], m)[0];
    const km = kmDeHoras(horas, prova ? prova.terreno : "estrada");
    const x = duas(50 + Math.cos(ang) * (km / KM_POR_UNIDADE));
    const y = duas(50 + Math.sin(ang) * (km / KM_POR_UNIDADE));
    cidades.push(cidade(nomes[1 + i] || `${nomes[0]} ${i + 2}`, porte, x, y, reg, bioma));
  }

  /* ---------------- OS LUGARES ---------------- */
  const est = o.estrutura ? estruturaPorId(o.estrutura) : null;
  const nLug = entre(rnd, FAIXAS_DA_REGIAO.lugares);
  const nMeio = est
    ? Math.max(FAIXAS_DA_REGIAO.meio[0], Math.min(FAIXAS_DA_REGIAO.meio[1], est.etapas.length - 2))
    : entre(rnd, FAIXAS_DA_REGIAO.meio);
  const atos = ["fim", ...Array(nMeio).fill("meio"), ...Array(Math.max(0, nLug - 1 - nMeio)).fill("paralelo")];
  /* O CLÍMAX FICA NA BORDA, e a borda é a um dia de ESTRADA. Num chão de
     marcha lenta (montanha, pântano, gelo, deserto: `TERRENO_VIAGEM`, 12 a
     15 km por dia) um dia de marcha não passa dos 15 km, e a boca da
     masmorra mede essa ida a pé, em três horas (`rotaAteAMasmorra`) — o
     fim da história ficaria mais perto do que o meio. Por isso o clímax
     vai para o chão vizinho que tem estrada (`ROTA_DO_CLIMAX`), e só sem
     nenhum para o coração; os chãos duros guardam o meio e o paralelo. */
  const comEstrada = (r) => (TERRENO_VIAGEM[r.bioma] || TERRENO_VIAGEM.planicie).kmDia >= ROTA_DO_CLIMAX.kmDiaMinimo;
  const vizinhoComEstrada = regioes.findIndex((r, i) => i > 0 && comEstrada(r));
  const subDoFim = vizinhoComEstrada > 0 ? vizinhoComEstrada : 0;
  const giroL = rnd() * Math.PI * 2;
  const usados = new Set();
  const nomeDeLugar = (t) => {
    for (let k = 0; k < 20; k++) {
      const n = pick(rnd, t.nomes).replace("{x}", pick(rnd, EPITETOS));
      if (!usados.has(norm(n))) { usados.add(norm(n)); return n; }
    }
    const n = `${t.nomes[0].replace("{x}", EPITETOS[0])} ${usados.size + 1}`;
    usados.add(norm(n));
    return n;
  };
  const porSub = {};
  const lugares = atos.map((ato, i) => {
    const sub = ato === "fim" ? subDoFim : i % regioes.length;
    const reg = regioes[sub];
    const t = pick(rnd, TIPOS_DE_LUGAR);
    const ang = giroL + (i * Math.PI * 2) / atos.length + (rnd() - 0.5) * 0.4;
    const horas = noIntervalo(rnd, ALCANCE_DA_REGIAO[ato]);
    const km = kmDaIda(horas, coracao.bioma, reg.bioma);
    const x = duas(50 + Math.cos(ang) * (km / KM_POR_UNIDADE));
    const y = duas(50 + Math.sin(ang) * (km / KM_POR_UNIDADE));
    const j = porSub[reg.nome] || 0;
    porSub[reg.nome] = j + 1;
    const pertoDe = [...cidades].sort((a, b) => kmEntre(a, { x, y }) - kmEntre(b, { x, y }))[0];
    return {
      id: `masmorra|${reg.nome}|${j}`,
      nome: nomeDeLugar(t), tipo: t.tipo, icone: t.icone,
      regiao: reg.nome, bioma: reg.bioma,
      cidadeProxima: pertoDe.nome,
      nivel: entre(rnd, NIVEL_POR_ATO[ato]),
      salas: entre(rnd, SALAS_POR_ATO[ato]),
      rumor: pick(rnd, RUMORES),
      x, y, ato,
    };
  });

  /* o centro de cada chão é o meio do que mora nele */
  for (const r of regioes) {
    const pts = [...cidades.filter((c) => c.regiao === r.nome), ...lugares.filter((l) => l.regiao === r.nome)];
    if (pts.length) { r.cx = duas(pts.reduce((a, p) => a + p.x, 0) / pts.length); r.cy = duas(pts.reduce((a, p) => a + p.y, 0) / pts.length); }
  }

  const mapa = {
    continente: geo.continente,
    continentes: [{ nome: geo.continente, regioes: regioes.map((r) => r.nome) }],
    regioes, cidades, rotas: gerarRotas(cidades, m),
  };

  /* ---------------- AS FICHAS ----------------
     Quem anda por lá (os bichos daquele chão, os do nível mais perto do
     lugar), a ida da base e dos vizinhos (a régua da boca), o perigo e a
     planta. O interior da masmorra continua a nascer quando se entra; a
     ficha é o que se SABE de fora. */
  const bichos = {};
  for (const r of regioes) { try { bichos[r.nome] = criaturasDaRegiao(semente, r, genero, lex); } catch { bichos[r.nome] = []; } }
  const comFicha = lugares.map((l) => {
    const daBase = idaEntre(l, base);
    /* os vizinhos: os outros lugares e os povoados (a base já é a ida) */
    const vizinhos = [...lugares.filter((v) => v !== l), ...cidades.slice(1).map((c) => ({ ...c, id: c.nome }))]
      .map((v) => ({ id: v.id, nome: v.nome, ...idaEntre(v, l) }))
      .sort((a, b) => a.horas - b.horas).slice(0, FICHA_DO_LUGAR.vizinhos)
      .map((v) => ({ id: v.id, nome: v.nome, horas: v.horas, rumo: v.rumo }));
    const quem = [...(bichos[l.regiao] || [])]
      .sort((a, b) => Math.abs(a.nivel - l.nivel) - Math.abs(b.nivel - l.nivel))
      .slice(0, FICHA_DO_LUGAR.quem).map((c) => ({ nome: c.nome, nivel: c.nivel }));
    return {
      ...l,
      ficha: {
        quem, perigo: perigoDe(l.nivel).id, perigoRotulo: perigoDe(l.nivel).rotulo,
        horas: daBase ? daBase.horas : null, km: daBase ? daBase.km : null,
        modo: daBase ? daBase.modo : "", rumo: daBase ? daBase.rumo : "",
        vizinhos,
      },
    };
  });

  const povoados = cidades.slice(1).map((c) => {
    const r = mapa.rotas.find((x) => (x.de === base.nome && x.para === c.nome) || (x.para === base.nome && x.de === c.nome));
    return { nome: c.nome, porte: c.porte, horas: r ? r.dias * HORAS_MARCHA_POR_DIA : null, km: r ? r.km : duas(kmEntre(base, c)), terreno: r ? r.terreno : "", rumo: (rumoEntre(base, c) || {}).rotulo || "" };
  });

  /* ---------------- O HORIZONTE ---------------- */
  const dentro = new Set([...cidades.map((c) => norm(c.nome)), ...regioes.map((r) => norm(r.nome)), norm(geo.continente)]);
  const doContinente = (g) => [
    ...(g.continentes || []).slice(1).map((c) => ({ nome: c.nome, tipo: "terra" })),
    ...g.regioes.map((r) => ({ nome: r.nome, tipo: "regiao" })),
    ...[...g.cidades].sort((a, b) => (b.populacao || 0) - (a.populacao || 0)).map((c) => ({ nome: c.nome, tipo: "cidade" })),
  ];
  /* um continente pequeno (duas regiões, quatro cidades) cabe inteiro na
     região e não deixa horizonte nenhum; aí as terras de além saem de outro
     sorteio da mesma semente — o mundo não acaba na borda do mapa */
  const candidatos = doContinente(geo);
  if (candidatos.filter((h) => !dentro.has(norm(h.nome))).length < HORIZONTE.minimo) candidatos.push(...doContinente(gerarGeografia(`${semente}|alem`, m, lex)));
  const doHorizonte = [];
  for (const h of candidatos) {
    if (doHorizonte.length >= HORIZONTE.maximo) break;
    if (dentro.has(norm(h.nome))) continue;
    dentro.add(norm(h.nome));
    doHorizonte.push(h);
  }
  const horizonte = doHorizonte.map((h) => ({ ...h, boato: pick(rnd, HORIZONTE.boatos[h.tipo]) }));

  const todos = [...cidades, ...comFicha];
  const quadro = {
    x0: duas(Math.min(...todos.map((p) => p.x)) - 0.5), y0: duas(Math.min(...todos.map((p) => p.y)) - 0.5),
    x1: duas(Math.max(...todos.map((p) => p.x)) + 0.5), y1: duas(Math.max(...todos.map((p) => p.y)) + 0.5),
  };

  return {
    ...mapa,
    regiao: {
      versao: REGIAO_DESTA_VERSAO.versao,
      nome: coracao.nome,
      base: { nome: base.nome, ato: "inicio" },
      povoados,
      lugares: comFicha,
      horizonte,
      quadro,
    },
  };
}

/* ============================================================
   A AMARRAÇÃO DA ESPINHA (o App lê-a pela `espinhaNaRegiao`, etapa C1)

   `estenderEspinha` (saga.js) já só aponta para o que o mapa tem: cidades,
   gente da base, bichos das regiões, chefes do mundo. Num mapa de região
   isso quer dizer que TODO marco cai dentro dela sem mudar uma linha da
   espinha — e esta função prova isso, marco a marco. O que ela acrescenta
   é o lugar de cada ato: o início na base, o meio nos lugares "meio" (do
   mais perto ao mais longe; com mais atos de meio do que lugares, dois
   atos seguidos dividem um lugar, nunca voltando para trás), o fim no
   lugar do clímax.

   `ctx` ({ semente, genero, molde, lex }) serve para achar a cidade de um
   marco que aponta para um LOCAL ("o Rabo do Diabo"). Devolve `null` para
   mapa sem região ou espinha sem atos.
   ============================================================ */
export function amarrarEspinha(mapa, espinha, ctx) {
  const r = mapa && typeof mapa === "object" && mapa.regiao && typeof mapa.regiao === "object" ? mapa.regiao : null;
  const atos = espinha && typeof espinha === "object" && Array.isArray(espinha.atos) ? espinha.atos : [];
  if (!r || !atos.length) return null;
  const o = ctx && typeof ctx === "object" ? ctx : {};
  const cidades = (Array.isArray(mapa.cidades) ? mapa.cidades : []).filter((c) => c && c.nome);
  const lugares = Array.isArray(r.lugares) ? r.lugares.filter((l) => l && l.nome) : [];
  const fim = lugares.find((l) => l.ato === "fim") || null;
  const meios = lugares.filter((l) => l.ato === "meio").sort((a, b) => ((a.ficha && a.ficha.horas) || 0) - ((b.ficha && b.ficha.horas) || 0));
  const baseNome = (r.base && r.base.nome) || (cidades[0] && cidades[0].nome) || "";

  const locais = {};
  const locaisDe = (c) => {
    if (!locais[c.nome]) { try { locais[c.nome] = locaisDaCidade(String(o.semente || ""), c, o.genero || "Fantasia medieval", o.molde || null, o.lex || null); } catch { locais[c.nome] = []; } }
    return locais[c.nome];
  };
  /* onde fica um nome: uma cidade da região, um local de uma delas, ou um
     lugar da região — senão, fora */
  const ondeFica = (nome) => {
    const k = semArtigo(nome);
    if (!k) return null;
    const c = cidades.find((x) => semArtigo(x.nome) === k);
    if (c) return { tipo: "cidade", nome: c.nome, cidade: c.nome };
    const l = lugares.find((x) => semArtigo(x.nome) === k);
    if (l) return { tipo: "lugar", nome: l.nome, cidade: l.cidadeProxima || "", id: l.id };
    for (const cc of cidades) {
      const loc = locaisDe(cc).find((x) => semArtigo(x.nome) === k);
      if (loc) return { tipo: "local", nome: loc.nome, cidade: cc.nome };
    }
    return null;
  };

  const n = atos.length;
  const papelDe = (i) => (i === 0 ? "inicio" : i === n - 1 ? "fim" : "meio");
  /* os atos do meio repartem os lugares do meio sempre PARA FORA: com mais
     atos que lugares, os primeiros dividem o mais perto e o último fica com o
     mais longe — nunca se volta ao começo do caminho no meio da história */
  const nMeio = Math.max(0, n - 2);
  const porAto = atos.map((a, i) => {
    const papel = papelDe(i);
    let lugar = null;
    if (papel === "inicio") lugar = { tipo: "cidade", nome: baseNome };
    else if (papel === "fim") lugar = fim ? { tipo: "lugar", id: fim.id, nome: fim.nome } : null;
    else if (meios.length) { const l = meios[Math.min(meios.length - 1, Math.floor(((i - 1) * meios.length) / Math.max(1, nMeio)))]; lugar = { tipo: "lugar", id: l.id, nome: l.nome }; }
    return { ato: Number.isFinite(a && a.ato) ? a.ato : i, papel, lugar };
  });

  const marcos = [];
  atos.forEach((a, i) => {
    for (const mk of (a && Array.isArray(a.marcos) ? a.marcos : [])) {
      if (!mk || typeof mk !== "object") continue;
      const onde = ondeFica(mk.onde);
      marcos.push({ id: String(mk.id || ""), ato: i, papel: papelDe(i), feitio: mk.feitio || "", onde: String(mk.onde || ""), cidade: onde ? onde.cidade : "", dentro: !!onde });
    }
  });

  /* o fecho (o confronto) é do clímax; o principal do mundo é quem espera lá */
  const fecho = marcos.filter((x) => x.feitio === "confronto").pop() || null;
  let alvo = "";
  try {
    const ch = chefesDoMundo(String(o.semente || ""), mapa, o.genero || "Fantasia medieval", o.lex || null);
    const p = ch.find((c) => c.linha === "principal");
    alvo = p ? p.nome : "";
  } catch { alvo = ""; }

  return {
    atos: porAto,
    marcos,
    climax: fim ? { id: fim.id, nome: fim.nome, marco: fecho ? fecho.id : "", alvo } : null,
    todosDentro: marcos.every((x) => x.dentro),
  };
}

/* ============================================================
   A ESPINHA NA REGIÃO (MM17, etapa C1) — a história mora nos lugares

   A pessoa, a 06/10: *"cada lugar amarrado a um ato da espinha: o início
   na base, o meio em 2–3 lugares, o fim no lugar do clímax; os ganchos da
   história apontam para lá."* `amarrarEspinha` DIZ onde mora cada ato; esta
   função ESCREVE isso na espinha, uma vez, na criação de uma campanha nova
   com região (o App chama-a só com `mapa.regiao`; sem ele devolve a espinha
   como veio, e o continente nunca passa por aqui):

     · cada ato do meio, e o do fim, ganha o marco "descer" (saga.js) no SEU
       lugar — chegar ao fundo dele, que a masmorra publica ao cair o chefe.
       Dois atos que dividem um lugar (a amarração reparte para fora) não
       pedem duas vezes a mesma descida: fica com o primeiro;
     · o fecho (o confronto com o antagonista principal) passa a ter `onde` =
       o lugar do clímax, e o descer do clímax vem logo antes dele;
     · O ATO CONTINUA DIMENSIONADO PELA CONTA DO ARCO (a terceira regra de
       saga.js): a descida entra no peso, e os marcos sorteados do ato ficam
       só até o peso fechar — nem um a mais. Era a falta de peso que deixava
       5,7% dos atos da região sem marcos suficientes (medido a 06/10, quase
       todos o último: a borda tinha pouca gente e poucos bichos livres); o
       lugar é peça que não se gasta.

   Pura e determinística: nenhum sorteio — a espinha estendida já os fez. */
export function espinhaNaRegiao(mapa, espinha, ctx) {
  const e = garantirEspinha(espinha);
  let a = null;
  try { a = amarrarEspinha(mapa, e, ctx); } catch { a = null; }
  if (!a) return e;
  const lugares = (mapa.regiao && Array.isArray(mapa.regiao.lugares)) ? mapa.regiao.lugares : [];
  const est = estruturaPorId(e.estrutura);
  const pesoDoFeitio = (f) => pesoDe(feitioDe(f).peso);
  const descidos = new Set();
  const alvos = new Set(e.atos.flatMap((x) => x.marcos).map((m) => norm(m.alvo)).filter(Boolean));
  const o = ctx && typeof ctx === "object" ? ctx : {};
  const comAto = new Set(a.atos.map((x) => x.lugar && x.lugar.id).filter(Boolean));
  const semAto = lugares.filter((x) => !comAto.has(x.id))
    .sort((p, q) => ((q.ficha && q.ficha.horas) || 0) - ((p.ficha && p.ficha.horas) || 0));
  /* os bichos que podem guardar um lugar: os da ficha, os do chão dele e,
     por fim, os dos outros chãos da região (que fica toda a um dia) — cada
     chão do nível mais perto do lugar para o mais longe */
  const cidades = (Array.isArray(mapa.cidades) ? mapa.cidades : []).filter((c) => c && c.nome);
  const quens = new Set(e.atos.flatMap((x) => x.marcos).map((m) => norm(m.quem)).filter(Boolean));
  const genteDe = (c) => {
    try {
      return locaisDaCidade(String(o.semente || ""), c, o.genero || "Fantasia medieval", o.molde || null, o.lex || null)
        .flatMap((loc) => genteDoLocal(String(o.semente || ""), loc, o.genero || "Fantasia medieval", o.molde || null, o.lex || null));
    } catch { return []; }
  };
  const bichosDoChao = {};
  const doChao = (reg) => {
    if (!bichosDoChao[reg.nome]) { try { bichosDoChao[reg.nome] = criaturasDaRegiao(String(o.semente || ""), reg, o.genero || "Fantasia medieval", o.lex || null); } catch { bichosDoChao[reg.nome] = []; } }
    return bichosDoChao[reg.nome];
  };
  const bichosDe = (l) => {
    const daFicha = (l.ficha && Array.isArray(l.ficha.quem)) ? l.ficha.quem : [];
    const regs = (Array.isArray(mapa.regioes) ? mapa.regioes : []).filter((r) => r && r.nome);
    const chaos = [...regs.filter((r) => r.nome === l.regiao), ...regs.filter((r) => r.nome !== l.regiao)];
    const porNivel = (xs) => [...xs].sort((a, b) => Math.abs((a.nivel || 0) - l.nivel) - Math.abs((b.nivel || 0) - l.nivel));
    return [...daFicha, ...chaos.flatMap((r) => porNivel(doChao(r)))];
  };
  /* O CLÍMAX ESCOLHE PRIMEIRO. Bichos e lugares sem ato são poucos numa
     região pequena, e o meio, por ir antes, gastava-os todos: o último ato
     — o que mais pesa — ficava sem com que fechar. O fim monta-se antes, o
     meio depois, cada ato no seu lugar da lista. */
  const montar = (ato, i) => {
    const am = a.atos[i];
    const l = am && am.lugar && am.lugar.tipo === "lugar" ? lugares.find((x) => x.id === am.lugar.id) : null;
    if (!am || am.papel === "inicio" || !l) return ato;
    const fecho = am.papel === "fim" ? ato.marcos.find((m) => m.feitio === "confronto") || null : null;
    const sorteados = ato.marcos.filter((m) => m !== fecho);
    const fechoAqui = fecho ? { ...fecho, onde: l.nome, regiao: l.regiao || fecho.regiao, ehLugar: true } : null;
    if (descidos.has(l.id)) return { ...ato, marcos: fechoAqui ? [...sorteados, fechoAqui] : ato.marcos };
    descidos.add(l.id);
    const descer = { id: `espinha|${i}|d`, feitio: "descer", onde: l.nome, regiao: l.regiao || "", ehLugar: true };
    descer.titulo = feitioDe("descer").titulo(descer);
    descer.condicao = feitioDe("descer").condicao(descer);
    const custo = custoDaEtapa(est, i);
    let peso = pesoDoFeitio("descer") + (fechoAqui ? pesoDoFeitio("confronto") : 0);
    let k = 0;
    while (k < sorteados.length && peso < custo) { peso += pesoDoFeitio(sorteados[k].feitio); k++; }
    /* O QUE GUARDA O LUGAR. Se os sorteados não fecham o peso, quem fecha é
       o que anda por lá — os bichos da ficha (`ficha.quem`) e depois os do
       mesmo chão, do nível mais perto do lugar: acabar com eles à porta, e
       depois descer. Bicho que já é alvo de outro marco não serve (uma morte
       fecharia dois). */
    const guardas = [];
    for (const q of bichosDe(l)) {
      if (peso >= custo) break;
      if (!q || !q.nome || alvos.has(norm(q.nome))) continue;
      alvos.add(norm(q.nome));
      const g = { id: `espinha|${i}|g${guardas.length}`, feitio: "enfrentar", alvo: q.nome, quantos: 1, onde: l.nome, regiao: l.regiao || "", ehLugar: true };
      g.titulo = feitioDe("enfrentar").titulo(g);
      g.condicao = feitioDe("enfrentar").condicao(g);
      guardas.push(g);
      peso += pesoDoFeitio("enfrentar");
    }
    /* O DESVIO. Num chão de poucos bichos, todos já são alvo de alguém; aí o
       ato passa por um lugar que nenhum ato tem (um paralelo, do mais longe
       ao mais perto — a história caminha para fora) e desce também lá. O
       lugar não se gasta como gente e bicho, e cada um só se desce uma vez. */
    const desvios = [];
    for (const x of semAto) {
      if (peso >= custo) break;
      if (descidos.has(x.id)) continue;
      descidos.add(x.id);
      const v = { id: `espinha|${i}|v${desvios.length}`, feitio: "descer", onde: x.nome, regiao: x.regiao || "", ehLugar: true };
      v.titulo = feitioDe("descer").titulo(v);
      v.condicao = feitioDe("descer").condicao(v);
      desvios.push(v);
      peso += pesoDoFeitio("descer");
    }
    /* QUEM SABE DO LUGAR. Sem bicho livre nem lugar sem ato (o mundo mais
       magro de 200 medidos), fecha o peso a gente da região que ainda não é
       marco de ninguém — a da cidade mais perto do lugar primeiro: quem viu
       a boca, quem perdeu alguém lá dentro. */
    const testemunhas = [];
    if (peso < custo) {
      const perto = cidades.filter((c) => c.nome === l.cidadeProxima);
      for (const c of [...perto, ...cidades.filter((c) => c.nome !== l.cidadeProxima)]) {
        if (peso >= custo) break;
        for (const p of genteDe(c)) {
          if (peso >= custo) break;
          if (!p || !p.nome || quens.has(norm(p.nome))) continue;
          quens.add(norm(p.nome));
          const w = { id: `espinha|${i}|t${testemunhas.length}`, feitio: "procurar", quem: p.nome, onde: p.local || c.nome, regiao: c.regiao || "", ehLugar: !!p.local };
          w.titulo = feitioDe("procurar").titulo(w);
          w.condicao = feitioDe("procurar").condicao(w);
          testemunhas.push(w);
          peso += pesoDoFeitio("procurar");
        }
      }
    }
    /* no meio, os sorteados que sobram depois do peso fechado ficam DEPOIS da
       descida — são gente e lugares do mundo (o elenco e os segredos vêm
       deles), e a história não precisa deles para andar; no fim, nada vem
       entre a descida e o confronto, e o que sobra sai */
    const resto = fechoAqui ? [] : sorteados.slice(k);
    return { ...ato, marcos: [...sorteados.slice(0, k), ...testemunhas, ...desvios, ...guardas, descer, ...resto, ...(fechoAqui ? [fechoAqui] : [])] };
  };
  const ultimo = e.atos.length - 1;
  const atos = [...e.atos];
  for (const i of [ultimo, ...e.atos.map((_, j) => j).filter((j) => j !== ultimo)]) atos[i] = montar(e.atos[i], i);
  return garantirEspinha({ ...e, atos });
}

/* ============================================================
   O MAPA DA CRIAÇÃO (MM17, etapa B) — a escolha, fora do App

   A criação de uma campanha NOVA chama isto no lugar de `gerarGeografia`.
   A escolha "região ou continente" mora aqui, e não embrulhada no App,
   para que a suíte prove a fiação em Node em vez de ler texto:

     · só os modos de MODOS_DA_REGIAO ganham região — o beta é Uma Vida
       (ordem de 28/09); Uma Noite chega com o mundo mínimo dela e nem
       passa por aqui, e o Duelo não cria campanha;
     · só o molde continental (`gerarRegiao` devolve `null` nos outros);
     · em qualquer outro caso, `gerarGeografia` com os MESMOS três
       argumentos de sempre — o mapa de hoje, byte a byte.

   O load NUNCA chama isto: um save antigo fica com o continente que tem
   (`garantirGeografia` espalha o mapa e não inventa campo nenhum). */
export const MODOS_DA_REGIAO = ["historia"];

export function mapaDaCriacao(opcoes) {
  const o = opcoes && typeof opcoes === "object" ? opcoes : {};
  if (MODOS_DA_REGIAO.includes(garantirModo(o.modo))) {
    const reg = gerarRegiao({ semente: o.semente, molde: o.molde, genero: o.genero, lex: o.lex, estrutura: o.estrutura });
    if (reg && Array.isArray(reg.cidades) && reg.cidades.length) return reg;
  }
  return gerarGeografia(String(o.semente == null ? "" : o.semente), moldePorId(o.molde && o.molde.id ? o.molde.id : o.molde), o.lex || null);
}

/* O `mapaRef` de uma campanha nova, a partir do que a criação gerou. A
   primeira cidade é a casa do herói (na região, a BASE: `gerarRegiao` põe
   a base em `cidades[0]`) e abre de saída; o resto nasce na névoa. As
   chaves são as de sempre, na ordem de sempre — um continente sai daqui
   igual ao literal que o App escrevia —, e só o mapa de região leva as
   duas a mais: `continentes` (o canto do continente de onde ela é) e
   `regiao`, o campo novo que a versão antiga ignora. */
export function mapaDaCampanhaNova(geo) {
  const g = geo && typeof geo === "object" ? geo : {};
  const cidades = Array.isArray(g.cidades) ? g.cidades : [];
  const mapa = {
    cidades: cidades.map((c, i) => (i === 0 ? { ...c, descoberta: true } : c)),
    faccoes: [], continente: g.continente, regioes: g.regioes, rotas: g.rotas,
  };
  if (g.regiao && typeof g.regiao === "object") return { ...mapa, continentes: g.continentes, regiao: g.regiao };
  return mapa;
}
