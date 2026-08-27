/* ============================================================
   GRADE DE BATALHA — o campo desenhado (v9.125) — Taverna
   Extraída do App.jsx, onde nasceu na v9.34 como uma malha de <button>.

   O QUE MUDOU, E POR QUÊ: a regra não mudou nada. Os mesmos alcançáveis
   saídos de `alcancaveisDe`, a mesma área saída de `quadradosDaArea`, o
   mesmo `onMover` que cobra o caminho e o golpe livre. O que mudou foi a
   PINTURA — e ela importava mais do que parecia.

   A malha de botões dizia a verdade inteira e parecia uma planilha: célula
   colorida, emoji dentro, um pixel de vão. O resto do jogo é grimório
   noturno, e a luta — o momento mais tenso da mesa — era o único lugar que
   parecia Excel. Além disso o lado do quadrado ficava preso entre 9 e 18
   pixels, e 18 px não é alvo de dedo: no telefone o tabuleiro compacto era
   decorativo e só a tela cheia servia para jogar.

   Em SVG o quadrado é uma unidade e o tamanho é problema do CSS, então o
   mesmo desenho serve o polegar e o mouse. E o que era cor de fundo vira
   coisa: a parede tem massa e aresta iluminada, o estorvo é um vulto no
   chão, o alcance tem CONTORNO em vez de mil bordinhas, e o passo deixa de
   ser teletransporte.
   ============================================================ */
import React from "react";
import { T } from "./constantes.js";
import { garantirGrade, alcancaveisDe, ocupacaoDe, adjacentes, caminhar, quadradosDe, ladoDe, tamanhoDe, ehParede, ehEstorvo, terrenoDificil, temCobertura, nomeDoLugar, distanciaM, alcanceNatural, metrosTxt } from "./grid.js";

const K = (x, y) => `${x},${y}`;

/* O CONTORNO DA UNIÃO (v9.125): a borda de um conjunto de quadrados são as
   arestas que não têm vizinho dentro do conjunto. Desenhar isso em vez de
   uma borda por célula é o que faz "até onde eu chego" virar uma FORMA —
   uma mancha com beirada — em vez de um mosaico de quadradinhos com risco
   em volta de cada um. */
function contorno(conjunto) {
  const linhas = [];
  for (const k of conjunto) {
    const [x, y] = k.split(",").map(Number);
    if (!conjunto.has(K(x, y - 1))) linhas.push([x, y, x + 1, y]);
    if (!conjunto.has(K(x, y + 1))) linhas.push([x, y + 1, x + 1, y + 1]);
    if (!conjunto.has(K(x - 1, y))) linhas.push([x, y, x, y + 1]);
    if (!conjunto.has(K(x + 1, y))) linhas.push([x + 1, y, x + 1, y + 1]);
  }
  return linhas;
}

/* SEM BURACOS (v9.125): um quadrado ocupado não é alcançável — não dá para
   parar em cima de ninguém — e a parede também não. Sem isto, cada ficha e
   cada bloco de pedra dentro do seu passo abria um furo no conjunto, e o
   contorno desenhava uma caixinha tracejada em volta de cada um: o tabuleiro
   ficava com cara de que tudo estava selecionado. O que interessa é a BEIRA
   do que se alcança, então o que não escoa até a borda do campo é buraco e
   entra no conjunto só para o desenho. */
function semBuracos(conjunto, largura, altura) {
  const fora = new Set();
  const fila = [];
  const poe = (x, y) => {
    if (x < 0 || y < 0 || x >= largura || y >= altura) return;
    const k = K(x, y);
    if (fora.has(k) || conjunto.has(k)) return;
    fora.add(k); fila.push([x, y]);
  };
  for (let x = 0; x < largura; x++) { poe(x, 0); poe(x, altura - 1); }
  for (let y = 0; y < altura; y++) { poe(0, y); poe(largura - 1, y); }
  while (fila.length) {
    const [x, y] = fila.pop();
    poe(x + 1, y); poe(x - 1, y); poe(x, y + 1); poe(x, y - 1);
  }
  const cheio = new Set(conjunto);
  for (let y = 0; y < altura; y++) for (let x = 0; x < largura; x++) {
    const k = K(x, y);
    if (!cheio.has(k) && !fora.has(k)) cheio.add(k);
  }
  return cheio;
}

const Contorno = ({ linhas, cor, largura = 0.05, tracejado = null, opacidade = 1 }) => (
  <g stroke={cor} strokeWidth={largura} strokeLinecap="round" opacity={opacidade} strokeDasharray={tracejado || undefined}>
    {linhas.map(([x1, y1, x2, y2], i) => <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />)}
  </g>
);

/* Uma ficha no tabuleiro. O <g> anda por CSS `transform`, e não pelo
   atributo do SVG, porque só a propriedade do CSS aceita transição — é
   dela que sai o deslizamento. Quem move de verdade é o sistema; isto aqui
   só evita que a ficha pisque de um canto ao outro. */
function Ficha({ ent, tipo, cor, x, y, lado, ms, grande, rotulo = null }) {
  const r = lado * 0.40;
  const cx = x + lado / 2, cy = y + lado / 2;
  const pv = Math.max(0, ent.vida || 0), pvMax = Math.max(0, ent.vidaMax || 0);
  const frac = pvMax > 0 ? Math.max(0, Math.min(1, pv / pvMax)) : null;
  const rArco = r + lado * 0.07;
  const volta = 2 * Math.PI * rArco;
  const corVida = frac == null ? cor : frac <= 1 / 3 ? T.danger : frac <= 2 / 3 ? T.amber : T.ok;
  /* A INICIAL, E NÃO UM EMOJI (v9.125): 🧍🛡👹 eram invisíveis nos 18 px da
     malha antiga e viraram desenho animado colorido quando o quadrado
     cresceu — bitmap de outra paleta, no meio de um jogo que é âmbar sobre
     violeta. A inicial no serifado da casa é ficha de tabuleiro: diz QUEM
     é aquilo, não só de que lado está, e cresce sem trair o tom. */
  const inicial = String(ent.nome || "?").trim().charAt(0).toUpperCase();
  return (
    <g style={{ transform: `translate(${cx}px, ${cy}px)`, transition: `transform ${ms}ms linear` }}>
      {tipo === "heroi" && <circle r={r * 1.5} fill={T.amber} opacity={0.12} />}
      <circle r={r} fill="#100e1a" stroke={cor} strokeWidth={lado * 0.055} />
      {frac != null && (
        <circle r={rArco} fill="none" stroke={corVida} strokeWidth={0.075} strokeLinecap="round"
          strokeDasharray={`${volta * frac} ${volta}`} transform="rotate(-90)" opacity={0.85} />
      )}
      <text className="tv-display" textAnchor="middle" dominantBaseline="central" fill={cor}
        style={{ fontSize: lado * 0.5, fontWeight: 700, pointerEvents: "none" }}>{inicial}</text>
      {grande && (
        <text className="tv-mono" textAnchor="middle" y={r + lado * 0.4} fill={cor} opacity={0.8}
          style={{ fontSize: 0.26, pointerEvents: "none" }}>{rotulo || ent.nome}</text>
      )}
    </g>
  );
}

export function GridDeBatalha({ combate, grupo = [], previsao = null, passoM = 9, passoTotal = 9, ignoraDificil = false, podeMover = true, onMover, mira = null, onMirar, alcanceMira = null }) {
  const [aberto, setAberto] = React.useState(false);
  /* ---------------- ANDAR OU MIRAR (v9.41) ----------------
     O toque no quadrado passou a querer dizer duas coisas, e duas coisas
     sem aviso é ambiguidade. Então há um modo, e ele diz na cara qual é:
     sem habilidade selecionada só existe andar; com uma habilidade de
     área selecionada, o tabuleiro abre já mirando, porque quem acabou de
     escolher Bola de Fogo quer dizer ONDE ela cai, não dar dois passos. */
  const podeMirar = !!(alcanceMira && alcanceMira.tamanho && onMirar);
  const [modo, setModo] = React.useState("andar");
  React.useEffect(() => { setModo(podeMirar ? "mirar" : "andar"); }, [podeMirar, alcanceMira && alcanceMira.nome]);
  const mirando = podeMirar && modo === "mirar";
  const [sobre, setSobre] = React.useState(null);
  const [andando, setAndando] = React.useState(null);

  const grade = combate && combate.grade ? combate.grade : null;
  const g = garantirGrade(grade);
  const heroi = combate && combate.heroi;

  /* O PASSO DESENHADO (v9.125): `caminhar` sempre devolveu o caminho e nada
     olhava para ele — o x,y do herói trocava e a ficha aparecia do outro
     lado do salão. Aqui o caminho é refeito entre onde ele estava e onde
     ele está, e a ficha o percorre quadrado a quadrado. É a mesma busca,
     determinística: mesma origem, mesmo destino e mesmos ocupados devolvem
     a mesma rota que o sistema cobrou.

     Só o herói ganha rota; os outros deslizam em linha reta pela transição
     do CSS. Um inimigo anda um ou dois quadrados por rodada, e para isso a
     reta é indistinguível do caminho. */
  const antesRef = React.useRef(null);
  const posHeroi = heroi && heroi.x != null ? K(heroi.x, heroi.y) : "";
  React.useEffect(() => {
    if (!heroi || heroi.x == null || !grade) { antesRef.current = null; return; }
    const antes = antesRef.current;
    antesRef.current = { x: heroi.x, y: heroi.y };
    if (!antes || (antes.x === heroi.x && antes.y === heroi.y)) return;
    const de = { ...heroi, x: antes.x, y: antes.y };
    const alvo = { x: heroi.x, y: heroi.y };
    const ocup = ocupacaoDe([...((combate && combate.inimigos) || []), ...((combate && combate.aliados) || [])], heroi);
    const tenta = (semDificil) => caminhar(grade, de, alvo, { ocupados: ocup, deslocamentoM: 999, ignoraDificil: semDificil });
    const r = (() => { const a = tenta(ignoraDificil); return a.ok ? a : tenta(true); })();
    const rota = r.ok ? [antes, ...r.caminho] : [antes, alvo];
    const ms = Math.max(55, Math.min(110, Math.round(420 / rota.length)));
    let i = 0;
    setAndando({ rota, i: 0, ms });
    const id = setInterval(() => {
      i += 1;
      if (i >= rota.length) { clearInterval(id); setAndando(null); }
      else setAndando({ rota, i, ms });
    }, ms);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posHeroi]);

  if (!g) return null;

  const aliados = ((combate.aliados) || []).map((a, i) => ({ ...a, ...(grupo[i] || {}), x: a.x, y: a.y }));
  const inimigos = ((combate.inimigos) || []).filter((e) => !e.derrotado && (e.vida || 0) > 0);
  const colados = heroi ? adjacentes(heroi, inimigos) : [];
  const ocupados = ocupacaoDe([...inimigos, ...aliados], heroi);
  const podeIr = (heroi && podeMover && !mirando) ? alcancaveisDe(grade, heroi, { ocupados, deslocamentoM: passoM, ignoraDificil }) : new Set();
  const naArea = new Set(((previsao && previsao.quadrados) || []).map((q) => K(q.x, q.y)));
  const noAlcance = (alcanceMira && alcanceMira.quadrados) || new Set();

  /* quem ocupa cada quadrado — o rótulo fica no canto superior esquerdo de
     quem ocupa mais de um, que é onde a ficha é desenhada */
  const mapa = new Map();
  const poe = (ent, tipo, cor) => {
    if (!ent || ent.x == null) return;
    quadradosDe(ent).forEach((q, i) => mapa.set(K(q.x, q.y), { ent, tipo, cor, chefe: i === 0 }));
  };
  aliados.forEach((a) => { if ((a.vida || 0) > 0) poe(a, "aliado", T.ok); });
  inimigos.forEach((e) => poe(e, "inimigo", T.danger));
  poe(heroi, "heroi", T.amber);

  /* A ROTA ANTES DO CLIQUE: passar o cursor por um quadrado alcançável
     mostra por onde se vai e quanto custa. No dedo não existe passar por
     cima, e é por isso que isto é enfeite e não muleta — a informação que
     decide (dá para chegar? custa golpe livre?) continua no contorno e na
     tarja de cima, que existem nos dois. */
  const rotaPrevista = (() => {
    if (!sobre || mirando || !heroi || andando) return null;
    if (!podeIr.has(K(sobre.x, sobre.y))) return null;
    const r = caminhar(grade, heroi, sobre, { ocupados, deslocamentoM: passoM, ignoraDificil });
    return r.ok ? { pontos: [heroi, ...r.caminho], custoM: r.custoM } : null;
  })();

  const paredes = [], dificeis = [], coberturas = [], estorvos = [];
  for (let y = 0; y < g.altura; y++) for (let x = 0; x < g.largura; x++) {
    if (ehParede(grade, x, y)) { paredes.push([x, y]); continue; }
    if (ehEstorvo(grade, x, y)) estorvos.push([x, y]);
    if (terrenoDificil(grade, x, y)) dificeis.push([x, y]);
    else if (temCobertura(grade, x, y)) coberturas.push([x, y]);
  }
  const setParedes = new Set(paredes.map(([x, y]) => K(x, y)));

  /* o que este turno alcança — o passo, ou o alcance da habilidade quando se
     está mirando. O quadrado de quem olha entra junto: ninguém precisa de
     véu por cima de si mesmo. */
  const alcance = new Set(mirando ? noAlcance : podeIr);
  if (alcance.size && heroi && heroi.x != null) quadradosDe(heroi).forEach((q) => alcance.add(K(q.x, q.y)));
  /* o mesmo conjunto sem buracos serve ao véu e ao contorno: sem isso a
     ficha do inimigo dentro do seu passo ficava sentada numa mancha escura,
     porque o quadrado dele não é "alcançável" — não dá para parar em cima
     dele — embora esteja bem debaixo do seu nariz. */
  const alcanceCheio = alcance.size ? semBuracos(alcance, g.largura, g.altura) : alcance;
  const veu = [];
  if (alcance.size) for (let y = 0; y < g.altura; y++) for (let x = 0; x < g.largura; x++) if (!alcanceCheio.has(K(x, y))) veu.push([x, y]);

  const viaDoCaminho = (pontos) => pontos.map((p, i) => `${i ? "L" : "M"}${p.x + 0.5} ${p.y + 0.5}`).join(" ");

  const tabuleiro = (grande) => (
    /* O COMPACTO CONTINUA SENDO UM RELANCE (v9.125): a malha antiga travava o
       quadrado entre 9 e 18 px e ficava pequena demais para o dedo; deixar o
       SVG crescer à vontade cai no defeito oposto, que a v9.34 já tinha
       diagnosticado — um tabuleiro de 16×16 com 34 px de lado empurra a
       narração para fora da tela. Então o teto é a ALTURA: 320 px de campo,
       e o quadrado fica com o que sobrar. A tela cheia é que serve o dedo. */
    <div style={{ width: "100%", maxWidth: grande ? `min(94vw, ${Math.round((68 * g.largura) / g.altura)}vh)` : g.largura * Math.min(34, 320 / g.altura), aspectRatio: `${g.largura} / ${g.altura}`, margin: "0 auto" }}>
      <svg viewBox={`0 0 ${g.largura} ${g.altura}`} style={{ width: "100%", height: "100%", display: "block", borderRadius: 10, background: "#141020", border: `1px solid ${T.line}` }}>
        <defs>
          <pattern id="tv-lama" width="0.5" height="0.5" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
            <line x1="0" y1="0" x2="0" y2="0.5" stroke="rgba(190,150,90,0.30)" strokeWidth="0.07" />
          </pattern>
        </defs>

        {/* AS REGIÕES SÃO O VOCABULÁRIO DO MESTRE (v9.125): ele narra "no vão
            da porta", nunca "quadrado 3,8". Antes o nome só existia no balão
            de ajuda; agora está escrito no chão, e o jogador lê a cena com as
            mesmas palavras que vai ouvir de volta. */}
        {g.regioes.map((r, i) => (
          <g key={r.nome + i}>
            <rect x={r.x0} y={r.y0} width={r.x1 - r.x0 + 1} height={r.y1 - r.y0 + 1}
              fill={i % 2 ? "rgba(255,255,255,0.016)" : "transparent"} />
            {/* no canto da faixa, e não no meio dela: o meio é onde as fichas
                andam, e um nome de lugar por baixo de um inimigo não é nome
                nenhum. No canto ele fica como legenda de planta baixa. */}
            <text className="tv-mono" x={r.x0 + 0.22} y={r.y0 + 0.48} textAnchor="start" dominantBaseline="central"
              fill={T.ink} opacity={0.26}
              style={{ fontSize: Math.min(0.32, (r.x1 - r.x0 + 1) / (r.nome.length * 0.75)), pointerEvents: "none", textTransform: "uppercase", letterSpacing: 0.03 }}>
              {r.nome}
            </text>
          </g>
        ))}

        {/* terreno difícil e cobertura: o chão que cobra e o chão que protege */}
        {dificeis.map(([x, y]) => <rect key={`d${x},${y}`} x={x} y={y} width="1" height="1" fill="url(#tv-lama)" />)}
        {coberturas.map(([x, y]) => <rect key={`c${x},${y}`} x={x} y={y} width="1" height="1" fill="rgba(120,140,190,0.09)" />)}

        {/* a malha, fina o bastante para orientar e apagada o bastante para
            não competir com nada que esteja em cima dela */}
        <g stroke={T.line} strokeWidth="0.025" opacity="0.9">
          {Array.from({ length: g.largura - 1 }).map((_, i) => <line key={`v${i}`} x1={i + 1} y1="0" x2={i + 1} y2={g.altura} />)}
          {Array.from({ length: g.altura - 1 }).map((_, i) => <line key={`h${i}`} x1="0" y1={i + 1} x2={g.largura} y2={i + 1} />)}
        </g>

        {/* PAREDE COM MASSA: o bloco escuro mais a aresta iluminada só do
            lado que dá para o salão. É o que separa "aqui é pedra" de "aqui
            é uma casa mais escura". */}
        <g>
          {paredes.map(([x, y]) => <rect key={`p${x},${y}`} x={x} y={y} width="1" height="1" fill="#07060c" />)}
          <Contorno linhas={contorno(setParedes)} cor="#463d63" largura={0.06} />
        </g>

        {/* o estorvo é a mesa virada, o barril, a estalagmite: não bloqueia
            passagem nem visão, e dá cobertura a quem se cola nele */}
        {estorvos.map(([x, y]) => (
          <g key={`e${x},${y}`}>
            <ellipse cx={x + 0.5} cy={y + 0.58} rx="0.31" ry="0.26" fill="#2b2340" stroke="#544877" strokeWidth="0.045" />
            <ellipse cx={x + 0.5} cy={y + 0.45} rx="0.31" ry="0.2" fill="#3a3157" stroke="#544877" strokeWidth="0.03" />
          </g>
        ))}

        {/* O VÉU (v9.125): a primeira versão PINTAVA de dourado o que dá para
            alcançar — e o alcance quase sempre é a maior parte do tabuleiro,
            então o campo inteiro virava uma mancha de lama com buracos onde
            havia gente. Escurecer o que NÃO se alcança diz a mesma coisa e
            deixa o chão em paz: a taverna continua com cara de taverna, e o
            que some é o que não interessa neste turno.

            A cor do contorno é que carrega o sentido — âmbar é o seu passo,
            violeta é o alcance da habilidade. */}
        {alcance.size > 0 && (
          <g>
            {veu.map(([x, y]) => <rect key={`v${x},${y}`} x={x} y={y} width="1" height="1" fill="rgba(7,5,12,0.46)" />)}
            <Contorno linhas={contorno(alcanceCheio)} cor={mirando ? T.violet : T.amber} largura={0.045} tracejado="0.22 0.18" opacidade={0.6} />
          </g>
        )}
        {naArea.size > 0 && (
          <g>
            {[...naArea].map((k) => { const [x, y] = k.split(",").map(Number); return <rect key={`a${k}`} x={x} y={y} width="1" height="1" fill="rgba(216,106,91,0.26)" />; })}
            <Contorno linhas={contorno(naArea)} cor={T.danger} largura={0.06} />
          </g>
        )}

        {/* o caminho: o previsto pontilhado, o andado inteiro */}
        {rotaPrevista && (
          <g>
            <path d={viaDoCaminho(rotaPrevista.pontos)} fill="none" stroke={T.amber} strokeWidth="0.09" strokeDasharray="0.2 0.18" strokeLinecap="round" opacity="0.8" />
            <circle cx={sobre.x + 0.5} cy={sobre.y + 0.5} r="0.2" fill={T.amber} opacity="0.9" />
          </g>
        )}
        {andando && andando.i > 0 && (
          <path d={viaDoCaminho(andando.rota.slice(0, andando.i + 1))} fill="none" stroke={T.amberSoft} strokeWidth="0.1" strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />
        )}

        {mira && (
          <g opacity="0.95" style={{ pointerEvents: "none" }}>
            <circle cx={mira.x + 0.5} cy={mira.y + 0.5} r="0.36" fill="none" stroke={T.violetSoft} strokeWidth="0.07" />
            <line x1={mira.x + 0.5} y1={mira.y + 0.12} x2={mira.x + 0.5} y2={mira.y + 0.88} stroke={T.violetSoft} strokeWidth="0.04" />
            <line x1={mira.x + 0.12} y1={mira.y + 0.5} x2={mira.x + 0.88} y2={mira.y + 0.5} stroke={T.violetSoft} strokeWidth="0.04" />
          </g>
        )}

        {/* AS FICHAS */}
        <g style={{ pointerEvents: "none" }}>
          {aliados.map((a, i) => (a.vida || 0) > 0 && a.x != null ? (
            <Ficha key={`al${i}`} ent={a} tipo="aliado" cor={T.ok} x={a.x} y={a.y} lado={ladoDe(a)} ms={260} grande={grande} />
          ) : null)}
          {inimigos.map((e, i) => e.x != null ? (
            <Ficha key={`in${e.nome}-${i}`} ent={e} tipo="inimigo" cor={T.danger} x={e.x} y={e.y} lado={ladoDe(e)} ms={260} grande={grande} />
          ) : null)}
          {heroi && heroi.x != null && (
            <Ficha ent={heroi} rotulo="você" tipo="heroi" cor={T.amber} lado={ladoDe(heroi)} grande={grande}
              x={andando ? andando.rota[andando.i].x : heroi.x}
              y={andando ? andando.rota[andando.i].y : heroi.y}
              ms={andando ? andando.ms : 260} />
          )}
        </g>

        {/* A CAMADA DO TOQUE, por último e por cima: cada quadrado continua
            sendo um alvo com nome, inclusive os que não dão para clicar —
            é o balão que conta que ali tem cobertura, ou lama, ou parede. */}
        <g>
          {Array.from({ length: g.altura }).flatMap((_, y) => Array.from({ length: g.largura }).map((__, x) => {
            const k = K(x, y);
            const oc = mapa.get(k);
            const tiro = mirando && noAlcance.has(k);
            const indo = podeIr.has(k);
            const clicavel = mirando ? tiro : indo;
            const titulo = oc
              ? `${oc.ent.nome}${oc.ent.vidaMax ? ` — ${oc.ent.vida}/${oc.ent.vidaMax} PV` : ""}${ladoDe(oc.ent) > 1 ? ` · ${tamanhoDe(oc.ent).nome}` : ""} · ${nomeDoLugar(grade, x, y)}${tiro ? " — dá para acertar aqui" : ""}`
              : `${nomeDoLugar(grade, x, y)}${setParedes.has(k) ? " (parede)" : ""}${terrenoDificil(grade, x, y) ? " · terreno difícil" : ""}${temCobertura(grade, x, y) ? " · cobertura +2" : ""}${indo ? " — dá para chegar aqui neste turno" : ""}${tiro ? ` — dá para fazer ${alcanceMira.nome} cair aqui` : ""}`;
            const agir = () => { if (!clicavel) return; if (mirando) onMirar({ x, y }); else onMover && onMover({ x, y }); };
            return (
              <rect key={k} x={x} y={y} width="1" height="1" fill="transparent"
                role={clicavel ? "button" : undefined} tabIndex={clicavel ? 0 : undefined}
                onClick={agir}
                onKeyDown={(ev) => { if (clicavel && (ev.key === "Enter" || ev.key === " ")) { ev.preventDefault(); agir(); } }}
                onMouseEnter={() => setSobre({ x, y })} onMouseLeave={() => setSobre(null)}
                style={{ cursor: clicavel ? "pointer" : "default", outline: "none" }}>
                <title>{titulo}</title>
              </rect>
            );
          }))}
        </g>
      </svg>
    </div>
  );

  const cabecalho = (
    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
      <span className="tv-mono text-[9px] uppercase tracking-widest" style={{ color: T.inkDim }}>
        campo · {g.largura}×{g.altura} quadrados de 1,5 m
      </span>
      {colados.length > 0 && (
        <span className="tv-mono text-[9px]" style={{ color: T.danger }} title="Sair de perto de um inimigo dá a ele um golpe livre">
          ⚡ sair custa {colados.length === 1 ? "um golpe livre" : `${colados.length} golpes livres`}
        </span>
      )}
      <span className="tv-mono text-[9px]" style={{ color: passoM > 0 ? T.inkDim : T.danger }}
        title="O que sobra do seu passo nesta rodada. Andar não gasta a ação: dá para dar dois passos, contornar e ainda golpear.">
        👣 {metrosTxt(passoM)} de {metrosTxt(passoTotal)} m nesta rodada
      </span>
      {rotaPrevista && (
        <span className="tv-mono text-[9px]" style={{ color: T.amberSoft }}>
          ↳ {metrosTxt(rotaPrevista.custoM)} m até ali
        </span>
      )}
      {podeMirar && (
        <button onClick={() => setModo((m) => (m === "mirar" ? "andar" : "mirar"))}
          title={mirando ? "Voltar a andar pelo tabuleiro" : `Escolher onde ${alcanceMira.nome} vai cair`}
          className="tv-mono text-[9px] px-2 py-0.5 rounded-full"
          style={{ background: mirando ? T.violet : "transparent", color: mirando ? T.onSecond : T.violetSoft, border: `1px solid ${T.violet}` }}>
          {mirando ? `◎ mirando ${alcanceMira.nome} — toque onde cai` : `👣 andando — toque para mirar ${alcanceMira.nome}`}
        </button>
      )}
      {previsao && (
        <span className="tv-mono text-[9px] px-2 py-0.5 rounded-full" style={{ color: previsao.aliados.length ? T.danger : T.amberSoft, border: `1px solid ${previsao.aliados.length ? T.danger : T.amber}` }}>
          {previsao.aliados.length ? "💢" : "◎"} {previsao.nome} ({previsao.forma}{previsao.raio ? ` de ${previsao.raio} m` : ""}): {previsao.inimigos.length} inimigo{previsao.inimigos.length === 1 ? "" : "s"}
          {previsao.aliados.length ? ` · PEGA ${previsao.aliados.join(", ")}` : " · nenhum aliado na área"}
        </span>
      )}
      <button onClick={() => setAberto(true)} title="Abrir o campo em tela cheia"
        className="tv-mono text-[9px] ml-auto px-2 py-0.5 rounded-full" style={{ border: `1px solid ${T.line}`, color: T.inkDim }}>
        ⤢ ampliar
      </button>
    </div>
  );

  return (
    <div className="mb-2">
      {cabecalho}
      {tabuleiro(false)}
      {aberto && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4" style={{ background: "rgba(8,6,14,0.92)", backdropFilter: "blur(3px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setAberto(false); }}>
          <div className="tv-mono text-xs uppercase tracking-widest mb-2 text-center" style={{ color: T.amberSoft, maxWidth: "100%" }}>
            {g.cenario} · {g.largura}×{g.altura} quadrados de 1,5 m
          </div>
          {tabuleiro(true)}
          {/* v9.125: a legenda falava de 🧍🛡👹, que saíram do tabuleiro. Uma
              legenda que descreve o desenho anterior é pior do que nenhuma —
              ela ensina a procurar o que não está lá. */}
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 mt-3 tv-mono text-[10px]" style={{ color: T.inkDim, maxWidth: "min(640px, 100%)" }}>
            <span style={{ color: T.amberSoft }}>◍ a inicial de cada um</span>
            <span>· o anel é a vida</span>
            <span>· <b style={{ color: T.amber }}>tracejado dourado</b>: até onde se chega neste turno</span>
            <span>· <b style={{ color: T.violetSoft }}>tracejado roxo</b>: até onde a habilidade alcança</span>
            <span>· <b style={{ color: T.danger }}>vermelho</b>: a área da magia</span>
            <span>· o escuro está fora do seu alcance</span>
          </div>
          {(inimigos.length > 0 && heroi) && (
            <div className="tv-body text-[11px] mt-2 text-center" style={{ color: T.inkDim, maxWidth: "min(640px, 100%)" }}>
              {inimigos.map((e) => `${e.nome} a ${Math.round(distanciaM(heroi, e))} m${ladoDe(e) > 1 ? ` (${tamanhoDe(e).nome.toLowerCase()}, alcança ${alcanceNatural(e)} m)` : ""}`).join(" · ")}
            </div>
          )}
          <button onClick={() => setAberto(false)} className="mt-3 rounded-xl px-5 py-2 tv-mono text-sm" style={{ background: T.amber, color: T.onAccent, fontWeight: 600 }}>
            Fechar e agir →
          </button>
        </div>
      )}
    </div>
  );
}
