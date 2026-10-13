/* ============================================================
   O VEREDITO DA PARTIDA (P2, 10/10) — o preço inteiro de partir, antes do clique

   O cartão de um lugar no mapa vivo acaba no verbo "Partir para X", e a lei
   da casa diz que toda ação irreversível mostra o preço ANTES de acontecer.
   `dadosDoMapaVivo` dava as horas da ficha e da aresta; não dava a CHEGADA
   (que dia, que hora, se é de noite), nem quantas NOITES se dormem na
   estrada, nem, de um povoado a um lugar que não é vizinho, por onde de
   facto se vai. Fazer essa conta na tela seria a tela a decidir.

   A régua desta função é uma só: ELA NÃO TEM CONTA PRÓPRIA. Cada número sai
   da mesma porta que o jogo usa para cobrar:

     · a ida a um LUGAR é a de `idaAMasmorra` (rastro.js), linha a linha: a
       rota pelo chão da boca (`rotaAteAMasmorra`), trocada pelo caminho das
       povoações quando a conta única o escolhe (`caminhoNaRegiao` +
       `rotaDoCaminho`, marcha.js); a pé, os minutos da caminhada
       (`irAteABoca` no App: `avancarMinutos(rota.minutos)`, chega no mesmo
       turno); pela estrada, a jornada de `jornadaAteAMasmorra`;
     · a ida a uma POVOAÇÃO é a jornada de `partidaNaRegiao` (marcha.js);
     · o RELÓGIO de uma jornada é o de `viajar` (App), avanço a avanço: cada
       um anda `minutosPorAvanco` de estrada e custa `relogioDoAvanco` de
       calendário vezes o fator do ritmo de marcha (`relogioDoRitmo`, abaixo
       — o espelho do que o App multiplica; a suíte lê o App e prova que é o
       mesmo número). Desde 11/10 (4.ª sessão de prova, nº 8) o relógio é o
       tempo real da marcha: uma ida de meio dia de marcha custa as 4 h que
       se andam, e só quem passa das oito horas de marcha de um dia paga a
       noite pelo caminho (viagem.js, `relogioDoAvanco`). A vila a minutos da
       boca, aberta como jornada, cobra os minutos dela — e não mais as 12 h
       do piso de um avanço; o veredito diz o que se cobra;
     · e o turno de viagem NÃO paga os minutos do turno. Até 12/10 esta
       linha dizia o contrário (cada partida e cada avanço pagaria os
       `MINUTOS_POR_TURNO` de calendario.js), e o cartão do mapa prometeu
       «chega às 12:05» a quem o relógio pôs às 12:00 (a prova viva da
       v9.443). Medido no App: as seis portas de viagem entram por
       `interceptarMovimento` e saem de `agirInterno` ANTES de
       `extraTempo = avancarMinutos(MINUTOS_POR_TURNO)` — o turno que viaja
       paga a estrada (`irAteABoca`, `viajar`) e mais nada. Uma conta só:
       a do que se cobra. `teste-veredito-da-partida` prova a ordem no App.

   ---------------- O QUE ANDA ENQUANTO SE ANDA (os prazos) ----------------

   A pergunta do `jogo`: partir faz andar algum prazo ou ameaça? Faz — mas
   NÃO o prazo de missão: esse conta noites DORMIDAS (o relógio de gatilho
   "noite", missoes.js, só anda no descanso longo), e uma estrada sem
   acampar não lhe tira nenhuma. O que anda com o calendário, e o veredito
   diz em `prazos` (cada um pela regra pura que o jogo aplica, e só se o
   estado o traz):

     · `exaustao`  — as horas acordado passam de `HORAS_EXAUSTO` na estrada
                     (o relógio do sono do App: `acordouAbs`);
     · `invocacao` — a conjuração cujo prazo vence pelo caminho
                     (`expirarPorMinuto`, invocacoes.js);
     · `peticao`   — a petição do correio que expira por falta de resposta
                     (o filtro de `processarDiaCorreio`: vence no dia seguinte
                     ao seu `prazo`);
     · `revolta`   — o domínio em fúria que cai pelo caminho
                     (`revoltaAgora`, dominios.js — se a fúria não passar);
     · `nemesis`   — o plano da ameaça dá um passo (`podeAvancar`, vilao.js).
                     Sem nome: quem ela é tem a sua própria escada de
                     revelação, e o veredito não a sobe.

   O que NÃO entra, porque não se sabe antes: perder-se (o dado de
   navegação), a marcha forçada (uma escolha armada à parte) e o que a
   estrada traz (encontro, emboscada, mercador).

   ---------------- O QUE O VEREDITO NÃO PODE DIZER ----------------

   É a mesma boca do mapa vivo, e obedece à mesma neblina: o destino tem de
   estar nos nós de `dados` (um lugar oculto — o clímax antes do seu ato —
   não tem veredito: `null`), o perigo do lugar só sai quando a neblina o
   mostra, e o da estrada só quando as duas pontas de cada perna o mostram.

   SÓ A REGIÃO DE AGORA. Sem `dados` (o continente: `dadosDoMapaVivo` dá
   `null`), sem a região que mede pela régua do chão (a v1), em viagem, lá
   dentro de uma masmorra, ou sem saber onde o herói está: `null`. Puro,
   determinístico (sem sorteio nenhum), sem tocar no que recebe.
   ============================================================ */

import { HORAS_MARCHA_POR_DIA, TETO_DE_AVANCOS, ESTADOS, andar, minutosPorAvanco, relogioDoAvanco } from "./viagem.js";
import { rotaAteAMasmorra, jornadaAteAMasmorra, masmorraDaBoca, IDA_NA_REGIAO } from "./boca.js";
import { pontoDoHeroi } from "./rastro.js";
import { masmorrasDoMundo } from "./mundo-base.js";
import { caminhoNaRegiao, origemDoHeroi, rotaDoCaminho, partidaNaRegiao } from "./marcha.js";
import { PERIGO_POR_NIVEL } from "./regiao.js";
import { FASES_DO_DIA, PERIGO_NA_ESTRADA, perigoDaEstradaComMotivo } from "./mapa-vivo.js";
import { ehNoite, horaTxt, HORAS_EXAUSTO } from "./calendario.js";
import { podeAvancar } from "./vilao.js";
import { revoltaAgora } from "./dominios.js";
import { expirarPorMinuto } from "./invocacoes.js";

const obj = (v) => (v && typeof v === "object" && !Array.isArray(v) ? v : null);
const lista = (v) => (Array.isArray(v) ? v : []);
const finito = (v) => v !== null && v !== "" && typeof v !== "boolean" && Number.isFinite(Number(v));
const norm = (s) => String(s == null ? "" : s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
const semArtigo = (s) => norm(s).replace(/^(o|a|os|as)\s+/, "").trim();
const duas = (n) => Math.round(n * 100) / 100;

/* ---------------- A TABELA ----------------
   `relogioDoRitmo` — o fator que `viajar` (App) aplica ao relógio de cada
     avanço pelo ritmo de marcha (`personagem.ritmoViagem`, ermos.js): quem
     corre cobre o mesmo trecho gastando menos dia. A estrada não muda; só o
     calendário. Ritmo desconhecido é o normal (`ritmoViagem`, ermos.js).
   `minutosDoTurno` — o que o turno de VIAGEM paga ao relógio, além da
     estrada: zero, porque a porta de movimento sai antes do relógio do
     turno (ver o cabeçalho, 12/10).
   `ondeNaoSeParte` — onde o herói está (`dados.heroi.onde`) quando o mapa
     não oferece partida: na estrada (anda-se na que se tem), lá dentro
     (sai-se primeiro) ou em lugar nenhum que se saiba.
   `pontaSemNo` — o herói num arredor (fora dos muros, sem nó no mapa) parte
     de terra de gente: a ponta da estrada pesa como uma povoação. */
export const VEREDITO_DA_PARTIDA = {
  relogioDoRitmo: { lento: 1.25, normal: 1, rapido: 0.8 },
  minutosDoTurno: 0,
  ondeNaoSeParte: ["viagem", "masmorra", "nenhum"],
  pontaSemNo: "povoado",
};

/* ---------------- OS PRAZOS ----------------
   Cada um pelo relógio que o App lhe dá: o minuto absoluto (`absMin`: o
   dia conta de 1, o minuto de 0) para o sono e as invocações; o DIA que a
   meia-noite abre (`avancarDiasReino` sobe o dia e só então processa) para
   o resto. Devolve só o que vence DURANTE a partida — o que já venceu não é
   preço desta decisão. Ordenado pela hora a que acontece. */
const absDe = (dia, minuto) => (dia - 1) * 1440 + minuto;
function prazosDaPartida(e, agora, chegada) {
  const a0 = absDe(agora.dia, agora.minuto), a1 = absDe(chegada.dia, chegada.minuto);
  const quando = (abs) => ({ dia: Math.floor(abs / 1440) + 1, minuto: ((abs % 1440) + 1440) % 1440 });
  const out = [];
  /* o sono: o App avisa a exaustão quando as horas acordado chegam ao teto */
  if (finito(e.acordouAbs)) {
    const limite = Number(e.acordouAbs) + HORAS_EXAUSTO * 60;
    if (limite > a0 && limite <= a1) out.push({ id: "exaustao", ...quando(limite) });
  }
  /* as invocações: a regra do App, aplicada à chegada e a agora */
  const ficha = obj(e.ficha);
  if (ficha) {
    let ja = [], depois = [];
    try { ja = expirarPorMinuto(ficha, a0).sumiram; depois = expirarPorMinuto(ficha, a1).sumiram; } catch { ja = []; depois = []; }
    const grupo = lista(ficha.grupo).filter(obj);
    for (const nome of depois.filter((n) => !ja.includes(n))) {
      const g = grupo.find((x) => x.nome === nome);
      if (g && finito(g.expiraMin)) out.push({ id: "invocacao", nome: String(nome), ...quando(Number(g.expiraMin)) });
    }
  }
  /* os dias que a estrada abre: de amanhã até ao da chegada */
  const dias = [];
  for (let d = agora.dia + 1; d <= chegada.dia; d++) dias.push(d);
  const correio = obj(e.correio);
  for (const p of lista(correio && correio.recebidas).filter(obj)) {
    if (p.status !== "pendente" || !finito(p.prazo)) continue;
    const vence = Number(p.prazo) + 1;
    if (vence > agora.dia && vence <= chegada.dia) out.push({ id: "peticao", de: String(p.de || ""), dia: vence, minuto: 0 });
  }
  const governos = obj(e.governos);
  for (const [cidade, g] of Object.entries(governos || {})) {
    let ja = null;
    try { ja = revoltaAgora(g, agora.dia); } catch { ja = null; }
    if (!ja || ja.caiu) continue;
    const d = dias.find((x) => { try { const r = revoltaAgora(g, x); return !!(r && r.caiu); } catch { return false; } });
    if (d) out.push({ id: "revolta", cidade, dia: d, minuto: 0 });
  }
  const nemesis = obj(e.nemesis);
  if (nemesis) {
    const d = dias.find((x) => { try { return podeAvancar(nemesis, { dia: x }); } catch { return false; } });
    if (d) out.push({ id: "nemesis", dia: d, minuto: 0 });
  }
  return out.sort((x, y) => absDe(x.dia, x.minuto) - absDe(y.dia, y.minuto));
}

const PERIGOS = PERIGO_POR_NIVEL.map((p) => p.id);

/* a fase do dia de um minuto, pela régua do mapa vivo (FASES_DO_DIA) */
function faseDe(minuto) {
  return (FASES_DO_DIA.find((f) => minuto < f.ate) || FASES_DO_DIA[FASES_DO_DIA.length - 1]).id;
}

/* ---------------- O RELÓGIO DE UMA JORNADA ----------------
   O laço de `viajar`, sem os dados: avança até a jornada se concluir, e
   soma o que cada avanço custa ao calendário. O teto é folga de segurança
   (uma jornada nunca passa de `TETO_DE_AVANCOS`). */
function relogioDaJornada(jornada, fator, turno) {
  let j = jornada, minutos = 0, avancos = 0;
  while (j && j.estado !== ESTADOS.concluida && avancos < TETO_DE_AVANCOS * 2) {
    minutos += Math.round(relogioDoAvanco(j) * fator) + turno;
    j = andar(j, minutosPorAvanco(j));
    avancos++;
  }
  return { minutos, avancos };
}

/* ---------------- A CHEGADA DA VIAGEM EM CURSO (12/10, pedido do mapa vivo) ----------------
   A faixa do rumo e a tela grande, com o herói na estrada, queriam dizer
   «chega às 13:12» — e a tela não pode refazer o relógio de `viajar`. É o
   mesmo laço do veredito (`relogioDaJornada`, a partir de onde a jornada
   VAI, não do começo), com o mesmo fator de ritmo e o mesmo turno de
   viagem (zero). `dados`: a saída de `dadosDoMapaVivo` (o relógio);
   `estado`: { jornada, ritmo } — a jornada viva e o ritmo de marcha.
   `null` sem relógio, sem jornada, ou com a jornada parada (pausada ou
   concluída): parada, não há hora de chegada que seja verdade. */
export function chegadaDaViagem(dados, estado) {
  const d = obj(dados), e = obj(estado);
  if (!d || !e) return null;
  const relogio = obj(d.relogio);
  const j = obj(e.jornada);
  if (!relogio || !finito(relogio.minuto) || !finito(relogio.dia) || !j) return null;
  if (j.estado === ESTADOS.pausada || j.estado === ESTADOS.concluida || !finito(j.totalMin)) return null;
  const T = VEREDITO_DA_PARTIDA;
  const fator = T.relogioDoRitmo[String(e.ritmo || "")] || T.relogioDoRitmo.normal;
  let rel = null;
  try { rel = relogioDaJornada(j, fator, T.minutosDoTurno); } catch { rel = null; }
  if (!rel || !rel.avancos) return null;
  const fim = Number(relogio.minuto) + rel.minutos;
  const minuto = ((fim % 1440) + 1440) % 1440;
  const noites = Math.floor(fim / 1440);
  return { dia: Number(relogio.dia) + noites, minuto, hora: horaTxt(minuto), fase: faseDe(minuto), noite: ehNoite(minuto), noites, minutosDeRelogio: rel.minutos, avancos: rel.avancos };
}

/* ---------------- A IDA ----------------
   `onde`: { cidadeAtual, lugar } — onde o registo diz que o herói está (a
   cidade, e o lugar quando está à boca de um ou num arredor). `alvo`: o ponto
   da rede (uma povoação pelo nome, ou um lugar da região). Devolve a rota, o
   caminho e a jornada que o jogo abriria — ou `null`. */
function idaPara(mapa, masmorras, onde, alvo, dia) {
  const cidadeAtual = String(onde.cidadeAtual || "");
  const lugar = obj(onde.lugar) && onde.lugar.nome ? onde.lugar : null;
  if (alvo.tipo !== "lugar") {
    let p = null;
    try { p = partidaNaRegiao(mapa, { cidadeAtual, lugar, destino: alvo.nome, dia }); } catch { p = null; }
    if (!p) return null;
    return { caminho: p.caminho, rota: p.rota, jornada: p.jornada };
  }
  /* o lugar: `idaAMasmorra` (rastro.js), da origem à rota */
  const m = masmorras.find((x) => String(x.id) === String(alvo.id)) || masmorras.find((x) => semArtigo(x.nome) === semArtigo(alvo.nome));
  if (!m) return null;
  if (masmorraDaBoca(lugar, [m])) return null;   // já está à boca dele
  const regiao = mapa.regiao;
  const cidade = lista(mapa.cidades).find((c) => obj(c) && norm(c.nome) === norm(cidadeAtual)) || null;
  const daBoca = masmorraDaBoca(lugar, masmorras);
  const ponto = pontoDoHeroi({ cidadeAtual, jornada: null, mapa, lugar });
  const chao = (daBoca && daBoca.bioma) || (cidade && cidade.bioma) || "";
  const origem = ponto && Number.isFinite(Number(ponto.x)) ? { x: Number(ponto.x), y: Number(ponto.y), ...(chao ? { bioma: chao } : {}) } : null;
  let rota = rotaAteAMasmorra(m, origem, { de: (lugar && lugar.nome) || cidadeAtual || "", regiao });
  if (!rota) return null;
  let caminho = null;
  try { caminho = caminhoNaRegiao(mapa, origemDoHeroi(mapa, { cidadeAtual, lugar, jornada: null, ponto: origem }), m.id || m.nome); } catch { caminho = null; }
  if (caminho && caminho.desvio) rota = { ...rotaDoCaminho(caminho, { de: rota.de }), para: rota.para };
  if (rota.modo === "a_pe") return { caminho, rota, jornada: null };
  const jornada = jornadaAteAMasmorra({ rota, masmorra: m, origem }, { de: cidadeAtual || "a última parada", dia });
  return jornada ? { caminho, rota, jornada } : null;
}

/* As horas de marcha que a ida cobra: os minutos da jornada, ou os da
   caminhada. */
const horasDaIda = (ida) => duas((ida.jornada ? Number(ida.jornada.totalMin) : Number(ida.rota.minutos)) / 60);

/* ============================================================
   A FUNÇÃO
   `dados`: a saída de `dadosDoMapaVivo(mapa, estado)` — os nós (com a
     neblina), o herói e o relógio.
   `destinoId`: o `id` de um nó de `dados.nos` ("cidade|Nome", ou o id do
     lugar).
   `estado`: o MESMO estado dado a `dadosDoMapaVivo` (cidadeAtual, lugar,
     jornada, masmorra, dia, minuto, semente), mais:
       mapa  — o mapa (o mesmo que fez `dados`);
       ritmo — o ritmo de marcha (`personagem.ritmoViagem`); normal se faltar.

   Devolve `null`, ou:
     { destino: { id, nome, tipo },
       horas,          — horas de marcha que a ida cobra;
       dias,           — dias de calendário que a partida consome (2 casas);
       noites,         — quantas vezes o dia vira na estrada (as noites fora);
       chegada: { dia, minuto, hora, fase, noite } — ou null sem relógio;
       minutosDeRelogio, avancos, modo ("a_pe" | "estrada"),
       perigoDoLugar,  — o da ficha, só se a neblina o mostra (senão null);
       perigoDaEstrada,— o pior das pernas, pela régua das arestas do mapa
                         vivo (null se alguma ponta o cala);
       motivoDoPerigo, — { ponta, chao, subiu } da pior perna (null com ele);
       horasDeVolta,   — a ida de lá até aqui, pela mesma conta;
       rota: [ids],    — por onde se passa, da origem (quando é nó) ao destino;
       pernas: [{ de, para, horas, modo, terreno }],
       desvio, cumpre, motivo — o caminho pelas povoações, se cabe na
                         promessa e, se não, o chão que o impede,
       prazos: [{ id, dia, minuto, ... }] — o que vence pelo caminho (ver
                         o cabeçalho); vazio sem relógio ou sem nada a vencer }
   Os campos opcionais do `estado` para os prazos: `acordouAbs` (o relógio
   do sono), `ficha` (o herói, para as invocações), `correio`, `governos`
   e `nemesis` — os refs do App, tal como estão.
   ============================================================ */
export function vereditoDaPartida(dados, destinoId, estado) {
  const d = obj(dados);
  const e = obj(estado);
  if (!d || !e || typeof destinoId !== "string" || !destinoId) return null;
  const mapa = obj(e.mapa);
  const regiao = mapa && obj(mapa.regiao);
  if (!regiao || !(Number(regiao.versao) >= IDA_NA_REGIAO.versaoMinima)) return null;
  const heroi = obj(d.heroi);
  if (!heroi || VEREDITO_DA_PARTIDA.ondeNaoSeParte.includes(heroi.onde)) return null;
  if (obj(e.jornada) || obj(e.masmorra)) return null;

  /* o destino: um nó que a neblina deixa ver */
  const nos = lista(d.nos).filter(obj);
  const alvoNo = nos.find((n) => n.id === destinoId);
  if (!alvoNo) return null;
  if (alvoNo.aqui || heroi.noId === alvoNo.id) return null;

  /* os pontos da rede, para dar ids aos nomes do caminho */
  const cidades = lista(mapa.cidades).filter((c) => obj(c) && c.nome);
  const lugares = lista(regiao.lugares).filter((l) => obj(l) && l.nome && l.id);
  const idDoNome = (nome) => {
    const k = semArtigo(nome);
    if (!k) return null;
    const c = cidades.find((x) => semArtigo(x.nome) === k);
    if (c) return `cidade|${c.nome}`;
    const l = lugares.find((x) => semArtigo(x.nome) === k);
    return l ? String(l.id) : null;
  };
  const pontoDoNo = (no) => {
    if (no.tipo === "lugar") { const l = lugares.find((x) => String(x.id) === no.id); return l ? { tipo: "lugar", id: String(l.id), nome: l.nome, x: Number(l.x), y: Number(l.y) } : null; }
    const c = cidades.find((x) => `cidade|${x.nome}` === no.id);
    return c ? { tipo: "cidade", id: no.id, nome: c.nome } : null;
  };
  const alvo = pontoDoNo(alvoNo);
  if (!alvo) return null;

  const relogio = obj(d.relogio);
  const dia = relogio && finito(relogio.dia) ? Number(relogio.dia) : finito(e.dia) ? Math.max(1, Math.floor(Number(e.dia))) : 1;
  let masmorras = [];
  try { masmorras = lista(masmorrasDoMundo(e.semente, mapa)); } catch { masmorras = []; }
  const onde = { cidadeAtual: typeof e.cidadeAtual === "string" ? e.cidadeAtual : "", lugar: obj(e.lugar) };
  let ida = null;
  try { ida = idaPara(mapa, masmorras, onde, alvo, dia); } catch { ida = null; }
  if (!ida || !ida.rota) return null;

  /* ---------------- O RELÓGIO ---------------- */
  const T = VEREDITO_DA_PARTIDA;
  const fator = T.relogioDoRitmo[String(e.ritmo || "")] || T.relogioDoRitmo.normal;
  const turno = T.minutosDoTurno;
  const rel = ida.jornada ? relogioDaJornada(ida.jornada, fator, turno) : { minutos: Math.max(0, Number(ida.rota.minutos) || 0) + turno, avancos: 0 };
  let chegada = null, noites = null;
  if (relogio && finito(relogio.minuto)) {
    const fim = Number(relogio.minuto) + rel.minutos;
    const minuto = ((fim % 1440) + 1440) % 1440;
    noites = Math.floor(fim / 1440);
    chegada = { dia: Number(relogio.dia) + noites, minuto, hora: horaTxt(minuto), fase: faseDe(minuto), noite: ehNoite(minuto) };
  }

  /* ---------------- O CAMINHO ---------------- */
  const c = ida.caminho;
  const origemNo = heroi.noId ? nos.find((n) => n.id === heroi.noId) || null : null;
  const pernas = c
    ? c.escolhido.pernas.map((p, i) => ({ de: i === 0 ? (origemNo ? origemNo.id : idDoNome(p.de)) : idDoNome(p.de), para: idDoNome(p.para), horas: duas(p.horas), modo: p.modo, terreno: p.terreno }))
    : [{ de: origemNo ? origemNo.id : null, para: alvo.id, horas: horasDaIda(ida), modo: ida.rota.modo, terreno: ida.rota.terreno }];
  const rota = [pernas[0].de, ...pernas.map((p) => p.para)].filter(Boolean);

  /* ---------------- O PERIGO ----------------
     O do lugar: o da ficha, tal como o nó o traz (a neblina já o calou se
     for o caso). O da estrada: a perna que o mapa desenha tem a cor que o
     mapa lhe dá (a aresta de `dados` — a tela não pode pintar um traço de
     uma cor e o veredito dizer outra); a que ele não desenha, a MESMA régua
     das arestas (`PERIGO_NA_ESTRADA`: o maior das duas pontas, um degrau
     acima no chão duro), com o chão da ida (o que a jornada grava). A
     estrada inteira vale a pior perna. A régua da aresta lê o chão de UM
     sentido (o de quem a desenhou), e por isso a cor de um traço é uma só
     nos dois sentidos — o veredito herda-a, não a recalcula. */
  const perigoDoLugar = alvo.tipo === "lugar" && PERIGOS.includes(alvoNo.perigo) ? alvoNo.perigo : null;
  const perigoDaPonta = (id) => {
    if (!id) return PERIGO_NA_ESTRADA[T.pontaSemNo];
    const n = nos.find((x) => x.id === id);
    if (!n) return null;
    if (n.tipo !== "lugar") return PERIGO_NA_ESTRADA.povoado;
    return PERIGOS.includes(n.perigo) ? n.perigo : null;
  };
  const arestas = lista(d.arestas).filter(obj);
  /* o motivo da pior perna (12/10, o mapa vivo): o da aresta que a tela
     desenha, ou o da mesma régua — a tela diz «o gelo sobe um degrau» sem
     a refazer */
  let perigoDaEstrada = null, motivoDoPerigo = null, calado = false, pior = -1;
  for (const p of pernas) {
    const ar = p.de && p.para ? arestas.find((x) => (x.de === p.de && x.para === p.para) || (x.de === p.para && x.para === p.de)) : null;
    if (ar) {
      if (!PERIGOS.includes(ar.perigo)) { calado = true; break; }
      if (PERIGOS.indexOf(ar.perigo) > pior) { pior = PERIGOS.indexOf(ar.perigo); motivoDoPerigo = obj(ar.perigoMotivo) ? { ...ar.perigoMotivo } : null; }
      continue;
    }
    const pm = perigoDaEstradaComMotivo(perigoDaPonta(p.de), perigoDaPonta(p.para), p.terreno);
    if (!pm) { calado = true; break; }
    if (PERIGOS.indexOf(pm.perigo) > pior) { pior = PERIGOS.indexOf(pm.perigo); motivoDoPerigo = { ponta: pm.ponta, chao: pm.chao, subiu: pm.subiu }; }
  }
  if (!calado && pior >= 0) perigoDaEstrada = PERIGOS[pior];
  if (calado || pior < 0) motivoDoPerigo = null;

  /* ---------------- A VOLTA ----------------
     De lá até aqui, pela mesma porta: chegado a uma povoação, o registo é
     ela; chegado à boca de um lugar, o herói está à boca dele (a cidade do
     registo fica). O "aqui" é o nó onde está; de um arredor, a cidade dele
     (o mapa não abre estrada para um arredor). */
  let horasDeVolta = null;
  try {
    const casa = origemNo ? pontoDoNo(origemNo) : (() => { const id = idDoNome(onde.cidadeAtual); const n = id ? nos.find((x) => x.id === id) : null; return n ? pontoDoNo(n) : null; })();
    if (casa && casa.id !== alvo.id) {
      const lugarLa = alvo.tipo === "lugar" ? { nome: alvo.nome, coord: { x: alvo.x, y: alvo.y }, distancia: "perto", cidade: onde.cidadeAtual } : null;
      const ondeLa = alvo.tipo === "lugar" ? { cidadeAtual: onde.cidadeAtual, lugar: lugarLa } : { cidadeAtual: alvo.nome, lugar: null };
      const volta = idaPara(mapa, masmorras, ondeLa, casa, dia);
      if (volta && volta.rota) horasDeVolta = horasDaIda(volta);
    }
  } catch { horasDeVolta = null; }

  return {
    destino: { id: alvo.id, nome: alvo.nome, tipo: alvoNo.tipo },
    horas: horasDaIda(ida),
    dias: duas(rel.minutos / 1440),
    noites,
    chegada,
    minutosDeRelogio: rel.minutos,
    avancos: rel.avancos,
    modo: ida.rota.modo === "a_pe" ? "a_pe" : "estrada",
    perigoDoLugar,
    perigoDaEstrada,
    motivoDoPerigo,
    horasDeVolta,
    rota,
    pernas,
    desvio: !!(c && c.desvio),
    cumpre: c ? !!c.cumpre : true,
    motivo: c ? String(c.motivo || "") : "",
    prazos: chegada ? prazosDaPartida(e, { dia: Number(relogio.dia), minuto: Number(relogio.minuto) }, chegada) : [],
  };
}
