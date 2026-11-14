/* ============================================================
   O QUADRO DA QUEST (QQ · Q4, 14/11/2026) — formas.md §QQ
   Figma (página 386:2): a carta 387:100, o carimbo 386:56, o sinal 388:97,
   o leque 388:21, os caminhos 389:121; a mesa 390:2067 / 390:2130 /
   390:2193; o telefone 390:2256 / 390:2280 / 390:2304 / 390:2328; o
   momento 393:3612 a 393:3708.

   A CARTA É UM OBJETO DA MESA, não uma linha de lista: costas de couro com
   filete de metal, face de pergaminho. O estado lê-se pela forma antes da
   cor (WCAG 1.4.1), e «essencial» / «extra» nunca se escrevem — diz-o o
   metal (ouro / ferro) e os pavios da que se pode ganhar.

   As peças, todas definidas FORA do render (a lei da casa: o que nasce
   dentro perde o foco do campo):
   · CartaDePista — os sete estados (costas, aVirar, virada, preco, perdida,
     futura, sobra), o carimbo, os pavios, o lacre, o risco;
   · CarimboDoPreco — a palavra de CARIMBO_DO_PRECO, o glifo e a conta;
   · SinalDoQuadro — o leque e «2 de 4» na Barra do Mestre (o `oficial`
     põe-no lá); sem `quadro.sinal`, 0 px;
   · CaminhosDaCarta — o veredito antes do clique: como se pode saber, e o
     que custa falhar; tocar num caminho chama `aoEscrever` (o dado é do
     Chamado do Mestre, nunca daqui);
   · GavetaDoQuadro — a gaveta de cima: fora do mistério uma fila, no
     mistério as etapas, a pergunta pregada e o fio de lacre; a carta
     escolhida e a carta lida; os separadores com mais de um quadro;
   · PistaQueVira — o momento: a carta sobe, (treme), vira, o carimbo cai,
     fica para ler e voa ao sinal; salta-se sempre.

   Nada se lê do App: tudo chega por props, já «para a tela» (o motor é
   src/quadro-da-quest.js; a conta da tela é src/quadro-na-tela.js). O
   campo `juiz` das cartas é bastidor e nenhuma peça daqui o lê.
   ============================================================ */
import React from "react";
import { T } from "./constantes.js";
import { QUADRO_DA_TELA, PALAVRAS_DO_QUADRO, MOLDURA_POR_DEGRAU, ALVOS, TIPOS, alfa, TIRA_DA_MESA, HUD_DA_MESA, DIARIO_DA_QUEST, ABA_DA_TELA, ENCAIXE } from "./estilo.js";
import { Glifo, MarcaDaPorta, IconeChevronEsq } from "./ui.jsx";
import { tocarCarta, tocarDaLuta } from "./som-da-mesa.js";
import { frase } from "./espolio-na-tela.js";
import {
  estadoDaCarta, abreAlgo, paviosDaCarta, arrumarOQuadro, carimboDaCarta, linhaDoCaminho, fichasDoSeFalhar,
  sinalDoQuadro, estadoDoSinal, textoDoSinal, nomeDoSinal, cronogramaDaPista, saltoDaPista, nomeDaCarta, falaDaPista,
} from "./quadro-na-tela.js";

const Q = QUADRO_DA_TELA, C = Q.carta, W = PALAVRAS_DO_QUADRO, L = W.leitor;
const OURO = MOLDURA_POR_DEGRAU.ouro, FERRO = MOLDURA_POR_DEGRAU.ferro;
/* a forma da carta de costas: o alfinete, o vulto e o pacote (§QQ 7) */
const GLIFO_DA_FORMA = { lugar: "alfinete", pessoa: "vulto", objeto: "objeto" };
/* as medidas que o Figma dá e a §QQ 7 não tabelou (como BARRA_LETRA na
   mesa do Mestre): o miolo das costas (387:7), o carimbo (386:56), o
   título da carta escolhida e o nó dos caminhos (389:45 / 389:89), o
   leque (388:21) e o papel pregado (390:2193). Moram aqui por serem só
   desta peça; mudam no Figma primeiro. */
const DO_FIGMA = {
  costas: { cima: 24, baixo: 14, entre: 10 },
  face: { cima: 10, baixo: 9, entre: 4 },
  carimbo: { enchimento: "5px 8px 5px 6px", entre: 5, rastreio: "0.04em" },
  escolhida: { titulo: 22, entrelinha: 26, sobre: 14, entre: 10, rotulo: "0.08em" },
  caminho: { enchimento: "8px 12px", entre: 10, verbo: 20, linha: 16 },
  seFalhar: { enchimento: "10px 12px 12px", texto: 14, entrelinha: 20, ficha: 28 },
  leque: [
    { cx: 10.15, cy: 11.95, giro: -14, chao: T.couro, aro: OURO.meio },
    { cx: 12.76, cy: 11.81, giro: -2, chao: T.couro, aro: OURO.meio },
    { cx: 14.82, cy: 12.48, giro: 12, chao: T.pergaminho, aro: T.pergaminhoBorda },
  ],
  papel: { enchimento: "10px 14px 12px", titulo: 12, rastreio: "0.08em" },
  rasgo: 20,
  sinal: { mesa: 82, telefone: 60 },      /* §QQ 3: o botão do sinal, 82 × 48 na mesa e 60 × 48 no telefone */
};
const metalDe = (carta) => MOLDURA_POR_DEGRAU[C.metal[carta && carta.tipo === "extra" ? "extra" : "essencial"]];
const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");
/* a forma nunca custa o turno: um som ou um callback que estoura cala-se */
const calado = (f) => { try { return f(); } catch (e) { return undefined; } };
function querParado() {
  try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; }
}
/* o efeito de leiaute só no navegador (no servidor, o efeito comum) */
const useAntesDaPintura = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;
/* o id de uma carta dentro de um seletor de atributo entre aspas */
const noSeletor = (x) => String(x).replace(/["\\]/g, (c) => "\\" + c);
const corte = (linhas) => ({ display: "-webkit-box", WebkitLineClamp: linhas, WebkitBoxOrient: "vertical", overflow: "hidden" });

/* ============================================================
   AS PEÇAS PEQUENAS
   ============================================================ */
function GlifoDaForma({ forma, tamanho = C.glifo, cor }) {
  return <Glifo nome={GLIFO_DA_FORMA[forma] || GLIFO_DA_FORMA.lugar} tamanho={tamanho} cor={cor} />;
}

/* os pavios da extra: um por caminho; `apaga`: o índice que se apaga agora */
function Pavios({ acesos = 0, total = 0, apaga = null }) {
  const { lado, entre, aceso, apagado } = C.pavio;
  const largura = total * lado + Math.max(0, total - 1) * entre;
  return (
    <svg aria-hidden="true" width={largura} height={lado} viewBox={`0 0 ${largura} ${lado}`} style={{ flexShrink: 0, overflow: "visible" }}>
      {Array.from({ length: total }, (_, i) => {
        const cx = i * (lado + entre) + lado / 2;
        const vivo = i < acesos && i !== apaga;
        if (vivo) return <circle key={i} cx={cx} cy={lado / 2} r={lado / 2} fill={aceso} />;
        /* o que apaga agora: o oco por baixo e a chama por cima, que se vai
           em fumo (tv-pavio-apaga); com reduce, a chama some seca */
        return (
          <g key={i}>
            <circle cx={cx} cy={lado / 2} r={lado / 2 - 0.5} fill="none" stroke={apagado} strokeWidth={1} />
            {i === apaga ? <circle cx={cx} cy={lado / 2} r={lado / 2} fill={aceso} className="tv-pavio-apaga" style={{ transformBox: "fill-box", transformOrigin: "center" }} /> : null}
          </g>
        );
      })}
    </svg>
  );
}

/* O LEQUE (388:21): três cartas, a da frente virada */
export function LequeDoQuadro({ tamanho = Q.sinal.leque }) {
  return (
    <svg aria-hidden="true" width={tamanho} height={tamanho} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
      {DO_FIGMA.leque.map((f, i) => (
        <rect key={i} x={f.cx - 5.5} y={f.cy - 7.5} width={11} height={15} rx={2} fill={f.chao} stroke={f.aro} strokeWidth={1}
          transform={`rotate(${f.giro} ${f.cx} ${f.cy})`} />
      ))}
    </svg>
  );
}

/* O CARIMBO (386:56). `k`: carimboDaCarta(...). `classe`: a da queda no
   momento (tv-pista-carimbo / -pesado); parado, gira pela tabela. */
export function CarimboDoPreco({ k, classe = "" }) {
  if (!k) return null;
  const P = Q.carimbo;
  const cor = k.pesado ? P.cor.pesado : P.cor.leve;
  return (
    <span className={`inline-flex items-center ${classe}`}
      style={{ background: alfa(T.pergaminho, P.chao), border: `${k.pesado ? P.traco.pesado : P.traco.leve}px solid ${cor}`, borderRadius: P.raio,
        padding: DO_FIGMA.carimbo.enchimento, gap: DO_FIGMA.carimbo.entre, color: cor, transform: classe ? undefined : `rotate(${P.giro}deg)`, whiteSpace: "nowrap" }}>
      <Glifo nome={k.glifo} tamanho={P.glifo} cor={cor} />
      <span className="flex flex-col" style={{ lineHeight: 1.25 }}>
        <span className="tv-titulo" style={{ fontSize: P.letra, letterSpacing: DO_FIGMA.carimbo.rastreio }}>{k.palavra}</span>
        {k.conta ? (
          <span className="tv-mono inline-flex items-center" style={{ fontSize: P.letra, fontWeight: 600, gap: 3 }}>
            {k.conta.texto}{k.conta.moeda ? <Glifo nome="moeda" tamanho={P.letra} cor={cor} /> : null}
          </span>
        ) : null}
      </span>
    </span>
  );
}

/* o risco da perdida: de canto a canto, por dentro do filete */
function Risco({ desenha = false }) {
  const f = C.filete;
  return (
    <svg aria-hidden="true" width={C.lado} height={C.alto} viewBox={`0 0 ${C.lado} ${C.alto}`} style={{ position: "absolute", left: -1.5, top: -1.5, pointerEvents: "none" }}>
      <line x1={f} y1={C.alto - f} x2={C.lado - f} y2={f} stroke={C.risco.cor} strokeWidth={C.risco.largura} strokeLinecap="round"
        pathLength={1} strokeDasharray={desenha ? 1 : undefined} className={desenha ? "tv-pista-risca" : undefined} style={desenha ? { "--risco": 1 } : undefined} />
    </svg>
  );
}

/* ============================================================
   A CARTA (387:100) — 108 × 148, raio 8
   `estado`: o que se vê (sem ele, estadoDaCarta). `momento`: só a
   PistaQueVira o passa — { apaga, risco: "oculto"|"desenha", carimbo:
   "oculto"|"cai", pesado }.
   ============================================================ */
function Dorso({ carta, estado, momento }) {
  const m = metalDe(carta);
  const apagado = estado === "perdida" || estado === "sobra";
  const borda = estado === "sobra" ? T.lineStrong : estado === "perdida" ? FERRO.meio : m.meio;
  const filete = estado === "sobra" ? T.line : estado === "perdida" ? FERRO.escuro : m.escuro;
  const corDoGlifo = apagado ? T.inkDim : estado === "aVirar" ? T.amberSoft : T.inkMeio;
  const aroDoDisco = estado === "aVirar" ? T.amber : apagado ? T.lineStrong : m.meio;
  const pv = paviosDaCarta(carta);
  const palavra = estado === "sobra" ? W.naoFezFalta : carta.costas;
  const D = DO_FIGMA.costas;
  return (
    <span className="absolute inset-0 flex flex-col items-center" style={{ background: T.couro, border: `1.5px solid ${borda}`, borderRadius: C.raio,
      paddingTop: D.cima, paddingBottom: D.baixo, gap: D.entre,
      boxShadow: estado === "aVirar" ? `0 0 ${C.aro.halo}px ${alfa(C.aro.cor, C.aro.alfaDoHalo)}` : "none" }}>
      <span aria-hidden="true" className="absolute" style={{ inset: C.filete - 1.5, border: `1px solid ${filete}`, borderRadius: C.raio / 2 }} />
      <span className="relative flex items-center justify-center" style={{ width: C.disco, height: C.disco, borderRadius: "50%", background: T.pagina, border: `1px solid ${aroDoDisco}` }}>
        <GlifoDaForma forma={carta.forma} cor={corDoGlifo} />
      </span>
      <span className="relative tv-body italic text-center" style={{ width: C.lado - 2 * C.enchimento, fontSize: C.forma.tamanho, lineHeight: `${C.forma.entrelinha}px`, color: apagado ? T.inkDim : T.inkMeio }}>{palavra}</span>
      {pv ? (
        <span className="relative" style={{ marginTop: "auto", lineHeight: 0 }}>
          <Pavios total={pv.total} acesos={estado === "perdida" ? 0 : momento && Number.isInteger(momento.acesos) ? momento.acesos : pv.acesos} apaga={momento && Number.isInteger(momento.apaga) ? momento.apaga : null} />
        </span>
      ) : null}
      {estado === "aVirar" ? (
        <span aria-hidden="true" className="absolute pointer-events-none"
          style={{ inset: -(1.5 + C.aro.fora), border: `${C.aro.largura}px solid ${alfa(C.aro.cor, C.aro.alfa)}`, borderRadius: C.raio + C.aro.fora }} />
      ) : null}
      {estado === "perdida" && !(momento && momento.risco === "oculto") ? <Risco desenha={!!(momento && momento.risco === "desenha")} /> : null}
    </span>
  );
}

function Face({ carta, estado, momento }) {
  const k = estado === "preco" ? carimboDaCarta(carta) : null;
  const corDaTinta = T.brasaNoPergaminho;
  const D = DO_FIGMA.face;
  const extra = carta.tipo === "extra";
  const mostraCarimbo = k && !(momento && momento.carimbo === "oculto");
  const classeDoCarimbo = momento && momento.carimbo === "cai" ? (momento.pesado ? "tv-pista-carimbo-pesado" : "tv-pista-carimbo") : "";
  return (
    <span className="absolute inset-0 flex flex-col items-start overflow-hidden text-left" style={{ background: T.pergaminho, border: `1.5px solid ${T.pergaminhoBorda}`, borderRadius: C.raio,
      padding: `${D.cima}px ${C.enchimento}px ${D.baixo}px`, gap: D.entre }}>
      {estado === "virada" ? <GlifoDaForma forma={carta.forma} tamanho={C.glifoDaFace} cor={corDaTinta} /> : null}
      <span className="tv-body" style={{ width: "100%", fontSize: C.face.tamanho, lineHeight: `${C.face.entrelinha}px`, fontWeight: 600, color: T.tintaDoPergaminho, ...corte(C.face.linhas) }}>{carta.face}</span>
      {estado === "preco" ? (
        <span className="flex justify-center" style={{ width: "100%", minHeight: Q.carimbo.glifo }}>
          {mostraCarimbo ? <CarimboDoPreco k={k} classe={classeDoCarimbo} /> : null}
        </span>
      ) : null}
      <span style={{ flex: 1 }} />
      {estado === "virada" ? <span aria-hidden="true" style={{ width: "100%", height: 1, background: alfa(corDaTinta, 0.35), flexShrink: 0 }} /> : null}
      {carta.de ? (
        <span className="tv-body italic" style={{ width: "100%", fontSize: C.de.tamanho, lineHeight: `${C.de.entrelinha}px`, color: T.tintaDoPergaminhoDim,
          ...(estado === "preco" ? { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } : corte(C.de.linhas)) }}>{carta.de}</span>
      ) : null}
      {extra && estado === "virada" ? (
        <svg aria-hidden="true" width={C.lacre} height={C.lacre} viewBox="0 0 14 14" style={{ position: "absolute", top: D.cima, right: C.enchimento }}>
          <circle cx={7} cy={7} r={6.25} fill={T.lacreNoPergaminho} stroke={alfa(T.rosa, 0.7)} strokeWidth={1.5} />
        </svg>
      ) : null}
      {k && k.marca === "rasgo" ? (
        <svg aria-hidden="true" width={DO_FIGMA.rasgo} height={DO_FIGMA.rasgo} viewBox="0 0 20 20" style={{ position: "absolute", right: -1.5, bottom: -1.5 }}>
          <path d="M20 0L16 5L18 8L13 11L14 15L8 16L6 20H20Z" fill={T.couro} />
        </svg>
      ) : null}
      {k && k.marca === "racha" ? (
        <svg aria-hidden="true" width={C.lado / 2} height={C.alto / 2} viewBox="0 0 24 24" preserveAspectRatio="none" style={{ position: "absolute", right: C.enchimento, top: 0, pointerEvents: "none" }}>
          <path d="M13 2L10 9L14 12L9 17L11 22" fill="none" stroke={Q.carimbo.cor.pesado} strokeWidth={1.5} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
        </svg>
      ) : null}
    </span>
  );
}

function Silhueta({ carta }) {
  const s = C.silhueta;
  return (
    <span className="absolute inset-0 flex items-center justify-center" style={{ background: alfa(T.pagina, s.chao), borderRadius: C.raio }}>
      <svg aria-hidden="true" width={C.lado} height={C.alto} style={{ position: "absolute", inset: 0 }}>
        <rect x={s.traco / 2} y={s.traco / 2} width={C.lado - s.traco} height={C.alto - s.traco} rx={C.raio} fill="none"
          stroke={T.lineStrong} strokeWidth={s.traco} strokeDasharray={s.tracejado.join(" ")} />
      </svg>
      <GlifoDaForma forma={carta.forma} tamanho={C.glifoDaSilhueta} cor={T.lineStrong} />
    </span>
  );
}

export function CartaDePista({ carta, estado = null, escolhida = false, tabIndex = 0, aoTocar, aoFoco, aoTeclar, botaoRef, momento = null, rotulo = null }) {
  if (!carta || typeof carta !== "object") return null;
  const e = estado || estadoDaCarta(carta);
  const caixa = { position: "relative", display: "block", width: C.lado, height: C.alto, flexShrink: 0, borderRadius: C.raio };
  const miolo = e === "futura" ? <Silhueta carta={carta} />
    : e === "virada" || e === "preco" ? <Face carta={carta} estado={e} momento={momento} />
    : <Dorso carta={carta} estado={e} momento={momento} />;
  /* a futura não recebe foco nem toque: a lista diz «e mais N por vir» */
  if (e === "futura") return <span aria-hidden="true" data-carta={carta.id} style={caixa}>{miolo}</span>;
  return (
    <button type="button" ref={botaoRef} data-carta={carta.id} data-viravel={carta.viravel ? "1" : undefined} data-escolhida={escolhida ? "1" : undefined}
      tabIndex={tabIndex} aria-label={rotulo || nomeDaCarta(carta)} aria-disabled={abreAlgo(e) ? undefined : "true"}
      onClick={() => { if (aoTocar) calado(() => aoTocar(carta, e)); }} onFocus={aoFoco} onKeyDown={aoTeclar}
      className="tv-anel-foco" style={{ ...caixa, padding: 0, border: "none", background: "transparent", cursor: abreAlgo(e) ? "pointer" : "default" }}>
      {miolo}
    </button>
  );
}

/* ============================================================
   O SINAL (388:97) — na Barra do Mestre: à esquerda da HORA na mesa
   (a 40 dela), antes da vela no telefone. `sinal`: o `quadro.sinal` do
   motor ({ sabe, de }); sem ele, nada (0 px). `novo`: a gota, desde que uma
   carta mudou até o quadro abrir; `aceso`: os 600 ms da chegada (o
   `oficial` liga-o ao fim do momento e desliga-o em QUADRO_DA_TELA.sinal
   .acende). `botaoRef`: para o foco voltar aqui quando a gaveta fecha.
   ============================================================ */
export function SinalDoQuadro({ sinal, telefone = false, novo = false, aceso = false, aberto = false, aoAbrir, botaoRef }) {
  const s = sinalDoQuadro({ sinal });
  if (!s) return null;
  const estado = estadoDoSinal(s, { novo, aceso });
  const completo = s.sabe >= s.de;
  const corDoNumero = estado === "aceso" ? T.amberSoft : completo ? T.ok : telefone ? T.ink : T.inkMeio;
  const H = HUD_DA_MESA.titulo;
  return (
    <button type="button" ref={botaoRef} onClick={() => { if (aoAbrir) calado(aoAbrir); }} aria-expanded={!!aberto}
      aria-label={nomeDoSinal(s, { novo: novo || aceso, aberto })} data-sinal-do-quadro={estado}
      className={`tv-anel-foco relative flex flex-col justify-center ${estado === "aceso" ? "tv-sinal-acende" : ""}`}
      style={{ minHeight: Q.sinal.alvo, minWidth: telefone ? DO_FIGMA.sinal.telefone : DO_FIGMA.sinal.mesa, padding: 0, background: "transparent", border: "none", cursor: "pointer",
        borderBottom: `2px solid ${aberto ? T.amber : "transparent"}` }}>
      {telefone ? null : <span className="tv-titulo uppercase block text-left" style={{ fontSize: H.tamanho, letterSpacing: H.rastreio, color: OURO.claro, lineHeight: 1.2 }}>{W.rotulo}</span>}
      <span className="flex items-center" style={{ gap: 6 }}>
        <span className="relative" style={{ lineHeight: 0 }}>
          <LequeDoQuadro />
          {novo || aceso ? <span aria-hidden="true" style={{ position: "absolute", top: -6, right: -2, lineHeight: 0 }}><MarcaDaPorta estado="novo" /></span> : null}
        </span>
        <span className="tv-mono" style={{ fontSize: TIPOS.maquina, color: corDoNumero, fontWeight: estado === "aceso" ? 600 : 400, whiteSpace: "nowrap" }}>{textoDoSinal(s, telefone)}</span>
      </span>
    </button>
  );
}

/* ============================================================
   A CARTA ESCOLHIDA (389:121, 390:2328) — o veredito antes do clique
   ============================================================ */
function RotuloDaArea({ cor, children }) {
  return <span className="tv-mono uppercase block" style={{ fontSize: TIPOS.maquina, letterSpacing: DO_FIGMA.escolhida.rotulo, color: cor, lineHeight: "16px" }}>{children}</span>;
}

function BotaoDoCaminho({ caminho, aoEscrever }) {
  const l = linhaDoCaminho(caminho);
  if (!l) return null;
  const P = Q.caminho, D = DO_FIGMA.caminho;
  return (
    <button type="button" aria-label={l.nome} onClick={() => { if (aoEscrever) calado(() => aoEscrever(l.verbo, caminho)); }}
      className="tv-anel-foco flex items-center text-left w-full"
      style={{ minHeight: P.alto, background: T.panel, border: `1px solid ${T.lineStrong}`, borderRadius: P.raio, padding: D.enchimento, gap: D.entre, cursor: "pointer" }}>
      <span className="flex flex-col flex-1 min-w-0" style={{ gap: 2 }}>
        <span className="tv-body" style={{ fontSize: P.verbo, lineHeight: `${D.verbo}px`, fontWeight: 500, color: T.ink }}>{l.verbo}</span>
        {l.linha ? <span className="tv-mono" style={{ fontSize: P.pericias, lineHeight: `${D.linha}px`, color: T.inkMeio }}>{l.linha}</span> : null}
      </span>
      {l.custa ? (
        <span className="tv-mono inline-flex items-center shrink-0" style={{ fontSize: TIPOS.maquina, fontWeight: 600, color: T.amberSoft, gap: 4 }}>
          <Glifo nome="moeda" tamanho={TIPOS.maquina} cor={T.amberSoft} />{l.custa}
        </span>
      ) : null}
      <span className="shrink-0" style={{ lineHeight: 0 }}><Glifo nome="pena" tamanho={P.pena} cor={T.inkDim} /></span>
    </button>
  );
}

export function CaminhosDaCarta({ carta, aoEscrever }) {
  if (!carta || typeof carta !== "object") return null;
  const D = DO_FIGMA.escolhida, F = DO_FIGMA.seFalhar;
  const extra = carta.tipo === "extra";
  const pv = paviosDaCarta(carta);
  const fichas = extra ? [] : fichasDoSeFalhar(carta.caminhos);
  const caminhos = Array.isArray(carta.caminhos) ? carta.caminhos : [];
  return (
    <div className="flex flex-col" style={{ gap: D.entre }}>
      <span className="tv-display" style={{ fontSize: D.titulo, lineHeight: `${D.entrelinha}px`, fontWeight: 600, color: T.ink }}>{cap(carta.costas)}</span>
      {extra && typeof carta.sobre === "string" && carta.sobre ? <span className="tv-body italic" style={{ fontSize: D.sobre, lineHeight: "20px", color: T.inkMeio }}>{carta.sobre}</span> : null}
      <RotuloDaArea cor={T.amberSoft}>{W.saber}</RotuloDaArea>
      <ul className="flex flex-col" style={{ gap: D.entre, listStyle: "none", margin: 0, padding: 0 }}>
        {caminhos.map((c) => <li key={c.id}><BotaoDoCaminho caminho={c} aoEscrever={aoEscrever} /></li>)}
      </ul>
      {extra || fichas.length ? (
        <div className="flex flex-col" style={{ background: T.perigoFundo, borderRadius: Q.caminho.raio, padding: F.enchimento, gap: 8 }}>
          <RotuloDaArea cor={T.danger}>{W.seFalhar}</RotuloDaArea>
          <span className="tv-body" style={{ fontSize: F.texto, lineHeight: `${F.entrelinha}px`, color: T.ink }}>{extra ? W.fecha : W.naMesma}</span>
          {extra && pv ? (
            <span className="flex items-center" style={{ gap: 8 }}>
              <Pavios total={pv.total} acesos={pv.acesos} />
              <span className="tv-mono" style={{ fontSize: TIPOS.maquina, color: T.inkMeio }}>{frase(W.restam, { n: pv.acesos })}</span>
            </span>
          ) : null}
          {fichas.length ? (
            <ul className="flex flex-wrap" style={{ gap: 8, listStyle: "none", margin: 0, padding: 0 }}>
              {fichas.map((k) => (
                <li key={k.id} className="tv-body inline-flex items-center" style={{ minHeight: F.ficha, gap: 6, padding: "0 10px", borderRadius: F.ficha / 2, border: `1px solid ${T.danger}`, color: T.ink, fontSize: TIPOS.rotulo }}>
                  <Glifo nome={k.glifo} tamanho={TIPOS.piso} cor={T.danger} />{k.texto}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/* A CARTA LIDA (§QQ 2, a truncagem): o facto muda de casa, inteiro */
export function CartaLida({ carta }) {
  if (!carta || typeof carta !== "object") return null;
  return (
    <div className="flex flex-col" style={{ gap: DO_FIGMA.escolhida.entre }}>
      <span className="tv-body" style={{ fontSize: TIPOS.prosa, lineHeight: 1.35, fontWeight: 600, color: T.ink }}>{cap(carta.face)}</span>
      {carta.de ? <span className="tv-body italic" style={{ fontSize: TIPOS.corpo, color: T.inkMeio }}>{carta.de}</span> : null}
      {carta.linha ? <span className="tv-body italic" style={{ fontSize: TIPOS.corpo, color: T.inkMeio }}>{carta.linha}</span> : null}
    </div>
  );
}

/* ============================================================
   A GAVETA (§QQ 3)
   ============================================================ */
/* o fio de lacre: liga as cartas viradas pela ordem em que viraram, com um
   percevejo no topo de cada uma. Mede-se depois do leiaute; uma carta que
   não está na árvore (a etapa dobrada) fica de fora. */
function FioDeLacre({ caixaRef, ids }) {
  const [pontos, setPontos] = React.useState([]);
  const chave = ids.join("|");
  useAntesDaPintura(() => {
    const medir = () => calado(() => {
      const caixa = caixaRef.current;
      if (!caixa) return;
      const r0 = caixa.getBoundingClientRect();
      const ps = [];
      for (const id of ids) {
        const el = caixa.querySelector(`[data-carta="${noSeletor(id)}"]`);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        ps.push({ x: r.left - r0.left + r.width / 2, y: r.top - r0.top + Q.misterio.papel.percevejo / 2 });
      }
      setPontos((antes) => (JSON.stringify(antes) === JSON.stringify(ps) ? antes : ps));
    });
    medir();
    window.addEventListener("resize", medir);
    return () => window.removeEventListener("resize", medir);
  }); // eslint-disable-line react-hooks/exhaustive-deps
  if (!chave) return null;
  const F = Q.misterio.fio, raio = Q.misterio.papel.percevejo / 2;
  return (
    <svg aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", overflow: "visible" }}>
      {pontos.length > 1 ? <polyline points={pontos.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke={alfa(F.cor, F.alfa)} strokeWidth={F.largura} /> : null}
      {pontos.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={raio / 2 + 1} fill={F.cor} />)}
    </svg>
  );
}

/* `coluna`: as extra do mistério na mesa, uma por linha, à direita do fio;
   `cheia`: a fila ocupa o que sobra da linha (a etapa, ao lado do numeral) */
function FilaDeCartas({ cartas, telefone, escolhida, ativa, aoTocar, aoFoco, coluna = false, cheia = false, rotulo = undefined }) {
  const G = Q.gaveta.grade;
  return (
    <ul aria-label={rotulo} className={coluna ? "flex flex-col" : "flex flex-wrap"} style={{ columnGap: telefone ? G.telefone : G.mesa, rowGap: G.linhas, listStyle: "none", margin: 0, padding: 0, ...(cheia ? { flex: 1, minWidth: 0 } : null) }}>
      {cartas.map((c) => (
        <li key={c.id} style={{ lineHeight: 0 }}>
          <CartaDePista carta={c} escolhida={escolhida === c.id} tabIndex={ativa === c.id ? 0 : -1} aoTocar={aoTocar} aoFoco={() => aoFoco(c.id)} />
        </li>
      ))}
    </ul>
  );
}

/* a etapa feita, dobrada no telefone (A dobra, R15): o numeral, «feita», as
   mini-cartas 14 × 19 e o chevron */
function DobraDaEtapa({ etapa, aberta, aoAlternar }) {
  return (
    <button type="button" onClick={aoAlternar} aria-expanded={!!aberta}
      aria-label={frase(L.dobra, { numeral: etapa.numeral, estado: W.feita, abrir: aberta ? L.fechar : L.abrir })}
      className="tv-anel-foco flex items-center w-full"
      style={{ minHeight: ALVOS.piso, gap: 10, padding: "0 12px", background: "transparent", border: `1px solid ${T.line}`, borderRadius: Q.caminho.raio, cursor: "pointer" }}>
      <span className="tv-titulo" style={{ fontSize: Q.misterio.numeral, color: T.inkMeio }}>{etapa.numeral}</span>
      <span className="tv-mono" style={{ fontSize: TIPOS.maquina, color: T.inkDim }}>{W.feita}</span>
      <span aria-hidden="true" className="flex items-center" style={{ gap: 4 }}>
        {etapa.cartas.map((c) => {
          const virou = c.estado === "virada" || c.estado === "preco";
          return <span key={c.id} style={{ width: 14, height: 19, borderRadius: 2, background: virou ? T.pergaminho : T.couro, border: `1px solid ${virou ? T.pergaminhoBorda : T.lineStrong}` }} />;
        })}
      </span>
      <span style={{ flex: 1 }} />
      <span aria-hidden="true" style={{ display: "inline-flex", transform: `rotate(${aberta ? 90 : -90}deg)` }}><IconeChevronEsq tamanho={16} cor={T.inkMeio} /></span>
    </button>
  );
}

function RotuloDaEtapa({ etapa, telefone }) {
  if (etapa.estado === "futura") return <span className="tv-titulo" style={{ fontSize: Q.misterio.numeral, color: T.inkDim, minWidth: telefone ? undefined : 48 }}>{etapa.numeral}</span>;
  const agora = etapa.estado === "agora";
  return (
    <span className={telefone ? "flex items-baseline" : "flex flex-col"} style={{ gap: telefone ? 8 : 2, minWidth: telefone ? undefined : 48 }}>
      <span className="tv-titulo" style={{ fontSize: Q.misterio.numeral, color: agora ? T.amberSoft : T.inkMeio }}>{etapa.numeral}</span>
      <span className="tv-mono" style={{ fontSize: TIPOS.maquina, color: agora ? T.amberSoft : T.inkDim }}>{agora ? W.agora : W.feita}</span>
    </span>
  );
}

/* a pergunta: no mistério um papel pregado; fora dele, a letra no couro */
function CabecaDoQuadro({ quadro, misterio, telefone, sinal, aoFechar }) {
  const tamanho = telefone ? Q.gaveta.pergunta.telefone : Q.gaveta.pergunta.mesa;
  const conta = sinal ? textoDoSinal(sinal, false) : "";
  const P = DO_FIGMA.papel;
  const pergunta = (
    <span className="flex flex-col min-w-0" style={{ gap: 4 }}>
      <span className="tv-mono uppercase flex items-center" style={{ fontSize: P.titulo, letterSpacing: P.rastreio, color: misterio ? T.brasaNoPergaminho : T.amberSoft, gap: 8 }}>
        {misterio ? <span aria-hidden="true" style={{ width: Q.misterio.papel.percevejo, height: Q.misterio.papel.percevejo, borderRadius: "50%", background: T.rosa, flexShrink: 0 }} /> : null}
        {quadro.titulo}
        {telefone && conta ? <span style={{ color: misterio ? T.tintaDoPergaminhoDim : T.inkMeio, textTransform: "none", letterSpacing: 0 }}>{conta}</span> : null}
      </span>
      <span className="tv-display" style={{ fontSize: tamanho, lineHeight: `${tamanho + 4}px`, fontWeight: 600, color: misterio ? T.tintaDoPergaminho : T.ink }}>{quadro.pergunta}</span>
    </span>
  );
  const S = ENCAIXE.sombraDoEscolhido;
  return (
    <div className="flex items-start" style={{ gap: 12 }}>
      {misterio ? (
        <div className="flex-1 min-w-0" style={{ background: T.pergaminho, padding: P.enchimento, transform: `rotate(-${Q.misterio.papel.giro}deg)`, boxShadow: `0 ${S.y / 2}px ${S.raio / 2}px ${alfa(ENCAIXE.sombra, S.alfa)}` }}>{pergunta}</div>
      ) : <div className="flex-1 min-w-0">{pergunta}</div>}
      {!telefone && conta ? <span className="tv-mono shrink-0" style={{ fontSize: TIPOS.maquina, color: T.inkMeio, paddingTop: 14 }}>{conta}</span> : null}
      <button type="button" onClick={aoFechar} aria-label={L.fecharGaveta} className="tv-anel-foco tv-mono flex items-center justify-center shrink-0"
        style={{ minWidth: ALVOS.piso, minHeight: ALVOS.piso, color: T.inkMeio, fontSize: 18, background: "transparent", border: "none", cursor: "pointer" }}>✕</button>
    </div>
  );
}

function SeparadoresDosQuadros({ quadros, atual, aoEscolher }) {
  const A = ABA_DA_TELA;
  return (
    <div role="tablist" className="flex" style={{ gap: 4, overflowX: "auto" }}>
      {quadros.map((q) => {
        const sel = q.quest === atual;
        return (
          <button key={q.quest} type="button" role="tab" aria-selected={sel} onClick={() => aoEscolher(q.quest)} className="tv-anel-foco tv-mono"
            style={{ minHeight: A.alto, padding: "0 12px", whiteSpace: "nowrap", fontSize: TIPOS.maquina, color: sel ? T.amberSoft : T.inkMeio, background: "transparent", border: "none",
              borderBottom: `${A.fio}px solid ${sel ? OURO.meio : "transparent"}`, cursor: "pointer" }}>
            {q.tipo === 2 ? <span aria-hidden="true" style={{ marginRight: 6 }}>{DIARIO_DA_QUEST.indice.glifoDoCoracao}</span> : null}{q.titulo}
          </button>
        );
      })}
    </div>
  );
}

const FOCAVEIS_DA_LISTA = "button[data-carta]";
/* as setas andam entre as cartas (roving tabindex, E4 §3) */
function andarComSetas(e, raiz) {
  const passos = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
  if (!(e.key in passos) && e.key !== "Home" && e.key !== "End") return;
  const todos = raiz ? Array.from(raiz.querySelectorAll(FOCAVEIS_DA_LISTA)) : [];
  const i = todos.indexOf(document.activeElement);
  if (i < 0 || !todos.length) return;
  e.preventDefault();
  const j = e.key === "Home" ? 0 : e.key === "End" ? todos.length - 1 : Math.max(0, Math.min(todos.length - 1, i + passos[e.key]));
  todos[j].focus();
}

/* ============================================================
   A FILA NO DIÁRIO (§QQ 3 — uma ação, uma forma). As linhas de «o que
   falta» que são cartas passam a ser a mesma fila de CartaDePista da etapa
   de agora, e tocar numa carta abre o mesmo quadro. A carta é a da gaveta,
   byte a byte, com as setas da gaveta (roving tabindex, E4 §3).
   · `cartas`: pistasDoQueFalta(quadro, falta).cartas (quadro-na-tela.js);
   · `aoTocar(carta)`: abrir o quadro (o App fecha o Diário e abre a gaveta
     nessa quest); sem ele, a carta lê-se e não abre nada.
   ============================================================ */
export function FilaDePistas({ cartas = [], telefone = false, aoTocar = null }) {
  const lista = Array.isArray(cartas) ? cartas.filter((c) => c && typeof c === "object" && c.id != null) : [];
  const [ativa, setAtiva] = React.useState(null);
  const raiz = React.useRef(null);
  if (!lista.length) return null;
  const focaveis = lista.filter((c) => !c.futura);
  const idAtiva = focaveis.some((c) => c.id === ativa) ? ativa : ((focaveis.find((c) => c.viravel) || focaveis[0] || {}).id || null);
  return (
    <div ref={raiz} data-fila-de-pistas="" onKeyDown={(e) => calado(() => andarComSetas(e, raiz.current))}>
      <FilaDeCartas cartas={lista} telefone={telefone} escolhida={null} ativa={idAtiva} rotulo={W.rotulo}
        aoTocar={aoTocar ? (carta) => aoTocar(carta) : undefined} aoFoco={setAtiva} />
    </div>
  );
}

/* GavetaDoQuadro — o contrato com o `oficial`:
   · `quadros`: os quadros do estado (osQuadrosDoEstado), já «para a tela»;
     `questDaVez`: o id que abre primeiro (sem ele, o primeiro);
   · `aberta`, `aoFechar()`: só existe aberta; fecha pelo ✕, Esc, a pega
     arrastada para cima (telefone) e o toque fora (que não seja o sinal nem
     um campo de escrita: o campo aceita escrita com a gaveta aberta);
   · `aoEscrever(verbo, caminho)`: tocar num caminho — o `oficial` escreve o
     verbo no campo e fecha a gaveta;
   · `devolverFocoA`: o ref do botão do sinal (o foco volta lá);
   · `alturaMaxima`: px até 8 acima da soleira ou do campo (a conta é do
     leiaute do App, Q.gaveta.folga); o resto rola por dentro;
   · `estilo`: a posição (desce da barra; na mesa, na coluna da página). */
export function GavetaDoQuadro({ quadros = [], questDaVez = null, aberta = false, telefone = false, aoFechar, aoEscrever, devolverFocoA = null, alturaMaxima = null, estilo = null }) {
  const lista = Array.isArray(quadros) ? quadros.filter((q) => q && typeof q === "object" && Array.isArray(q.cartas) && q.cartas.length) : [];
  const [atual, setAtual] = React.useState(questDaVez);
  const [escolhida, setEscolhida] = React.useState(null);
  const [ativa, setAtiva] = React.useState(null);
  const [abertas, setAbertas] = React.useState({});
  const raiz = React.useRef(null);
  const grade = React.useRef(null);
  const arrasto = React.useRef(null);
  const quadro = lista.find((q) => q.quest === atual) || lista.find((q) => q.quest === questDaVez) || lista[0] || null;
  const fechar = () => calado(() => { if (aoFechar) aoFechar(); });

  React.useEffect(() => { if (aberta) { setAtual(questDaVez); setEscolhida(null); } }, [aberta, questDaVez]);
  /* o foco: à primeira carta que se pode virar (ou à primeira); volta ao sinal */
  React.useEffect(() => {
    if (!aberta) return undefined;
    const devolver = devolverFocoA;
    calado(() => {
      const r = raiz.current;
      const alvo = r && (r.querySelector("button[data-carta][data-viravel='1']") || r.querySelector(FOCAVEIS_DA_LISTA));
      if (alvo) alvo.focus();
    });
    return () => calado(() => { if (devolver && devolver.current) devolver.current.focus(); });
  }, [aberta]); // eslint-disable-line react-hooks/exhaustive-deps
  /* o toque fora fecha (nunca o do sinal, que alterna sozinho, nem o de um campo) */
  React.useEffect(() => {
    if (!aberta) return undefined;
    const aoTocarFora = (e) => calado(() => {
      const alvo = e.target;
      if (!raiz.current || raiz.current.contains(alvo)) return;
      if (devolverFocoA && devolverFocoA.current && devolverFocoA.current.contains(alvo)) return;
      if (alvo && alvo.closest && alvo.closest("input, textarea, [contenteditable='true']")) return;
      fechar();
    });
    document.addEventListener("pointerdown", aoTocarFora);
    return () => document.removeEventListener("pointerdown", aoTocarFora);
  }, [aberta]); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    if (!aberta) return;
    calado(() => {
      const r = raiz.current;
      if (!r) return;
      const alvo = escolhida ? r.querySelector("[data-regresso]") : r.querySelector(`button[data-carta="${noSeletor(String(ativa || ""))}"]`);
      if (alvo && document.activeElement !== alvo && (escolhida || r.contains(document.activeElement) || document.activeElement === document.body)) alvo.focus();
    });
  }, [escolhida]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!aberta || !quadro) return null;
  const arrumo = arrumarOQuadro(quadro);
  const sinal = sinalDoQuadro(quadro);
  const cartaEscolhida = escolhida ? quadro.cartas.find((c) => c.id === escolhida) : null;
  const focaveis = quadro.cartas.filter((c) => !c.futura);
  const idAtiva = focaveis.some((c) => c.id === ativa) ? ativa : ((focaveis.find((c) => c.viravel) || focaveis[0] || {}).id || null);
  const aoTocarCarta = (carta, e) => { if (abreAlgo(e)) setEscolhida(carta.id); };
  const aoFoco = (id) => setAtiva(id);
  const P = telefone ? Q.gaveta.telefone : Q.gaveta.mesa;
  const aoTeclar = (e) => {
    if (e.key === "Escape") { e.stopPropagation(); if (cartaEscolhida) setEscolhida(null); else fechar(); return; }
    if (!cartaEscolhida) andarComSetas(e, grade.current);
  };
  const aoBaixar = (e) => { arrasto.current = telefone ? e.clientY : null; };
  const aoSoltar = (e) => { const y0 = arrasto.current; arrasto.current = null; if (y0 != null && y0 - e.clientY >= ALVOS.piso) fechar(); };
  const G = Q.gaveta.grade, entreCol = telefone ? G.telefone : G.mesa;
  const props = { telefone, escolhida, ativa: idAtiva, aoTocar: aoTocarCarta, aoFoco };
  const linhaDasExtras = arrumo.extras.length ? <FilaDeCartas cartas={arrumo.extras} {...props} /> : null;
  const fioVertical = <span aria-hidden="true" style={{ width: 1, alignSelf: "stretch", minHeight: C.alto, background: T.line, flexShrink: 0 }} />;
  const fioHorizontal = <span aria-hidden="true" style={{ height: 1, width: "100%", background: T.line }} />;

  let corpo;
  if (cartaEscolhida) {
    const virou = cartaEscolhida.estado === "virada" || cartaEscolhida.estado === "preco";
    corpo = (
      <div className="flex flex-col" style={{ gap: 12 }}>
        <button type="button" data-regresso="" onClick={() => setEscolhida(null)} aria-label={frase(L.voltar, { pergunta: quadro.pergunta })}
          className="tv-anel-foco flex items-center text-left" style={{ minHeight: ALVOS.piso, gap: 8, background: "transparent", border: "none", cursor: "pointer", padding: 0 }}>
          <IconeChevronEsq tamanho={16} cor={T.inkMeio} />
          <span className="tv-body italic truncate" style={{ fontSize: 14, color: T.inkMeio }}>{quadro.pergunta}</span>
        </button>
        {virou ? <CartaLida carta={cartaEscolhida} /> : <CaminhosDaCarta carta={cartaEscolhida} aoEscrever={aoEscrever} />}
      </div>
    );
  } else if (!arrumo.misterio) {
    corpo = (
      <div ref={grade} className="flex flex-wrap items-start" style={{ columnGap: entreCol, rowGap: G.linhas }}>
        <FilaDeCartas cartas={arrumo.fila} {...props} />
        {linhaDasExtras ? <>{fioVertical}{linhaDasExtras}</> : null}
      </div>
    );
  } else {
    const etapas = arrumo.etapas.map((et) => {
      if (telefone && et.estado === "feita" && !abertas[et.id]) {
        return <li key={et.id || et.numeral}><DobraDaEtapa etapa={et} aberta={false} aoAlternar={() => setAbertas((a) => ({ ...a, [et.id]: true }))} /></li>;
      }
      return (
        <li key={et.id || et.numeral} className={telefone ? "flex flex-col" : "flex items-start"} style={{ gap: telefone ? 8 : 12 }}>
          {telefone && et.estado === "feita"
            ? <DobraDaEtapa etapa={et} aberta aoAlternar={() => setAbertas((a) => ({ ...a, [et.id]: false }))} />
            : <RotuloDaEtapa etapa={et} telefone={telefone} />}
          <FilaDeCartas cartas={et.cartas} {...props} cheia />
        </li>
      );
    });
    corpo = (
      <div ref={grade} className="relative">
        <div className={telefone ? "flex flex-col" : "flex items-start"} style={{ gap: telefone ? 14 : 16 }}>
          <ul className="flex flex-col flex-1 min-w-0" style={{ gap: G.linhas, listStyle: "none", margin: 0, padding: 0 }} aria-label={arrumo.porVir ? frase(L.porVir, { n: arrumo.porVir }) : undefined}>
            {etapas}
          </ul>
          {arrumo.extras.length ? <>{telefone ? fioHorizontal : fioVertical}<FilaDeCartas cartas={arrumo.extras} {...props} coluna={!telefone} /></> : null}
        </div>
        <FioDeLacre caixaRef={grade} ids={arrumo.fio} />
      </div>
    );
  }

  return (
    <div ref={raiz} role="region" aria-label={frase(L.gaveta, { pergunta: quadro.pergunta })} className="tv-gaveta-desce flex flex-col"
      onKeyDown={aoTeclar} onPointerDown={aoBaixar} onPointerUp={aoSoltar} data-gaveta-do-quadro={arrumo.misterio ? "misterio" : "fila"}
      style={{ width: telefone ? "100%" : P.largura, maxWidth: "100%", maxHeight: alturaMaxima || undefined, overflowY: "auto", background: T.couro,
        /* o fio de ouro nos lados e em baixo vai por sombra de dentro, e não por
           borda: a borda comia 2 px da linha do telefone, e a terceira carta
           (343 = 3 × 108 + 2 × 9,5, §QQ 2) caía para a linha de baixo */
        borderBottomLeftRadius: Q.gaveta.raio, borderBottomRightRadius: Q.gaveta.raio,
        boxShadow: `inset 1px 0 0 ${OURO.meio}, inset -1px 0 0 ${OURO.meio}, inset 0 -1px 0 ${OURO.meio}, ${Q.gaveta.sombra}`,
        padding: P.enchimento.map((n) => `${n}px`).join(" "), gap: Q.gaveta.entre, ...(estilo || {}) }}>
      {telefone ? (
        <span aria-hidden="true" className="flex justify-center shrink-0" style={{ cursor: "grab" }}>
          <span style={{ width: TIRA_DA_MESA.pega.largura, height: TIRA_DA_MESA.pega.alto, borderRadius: TIRA_DA_MESA.pega.alto, background: alfa(TIRA_DA_MESA.pega.cor, TIRA_DA_MESA.pega.alfa) }} />
        </span>
      ) : null}
      {lista.length > 1 ? <SeparadoresDosQuadros quadros={lista} atual={quadro.quest} aoEscolher={(id) => { setAtual(id); setEscolhida(null); }} /> : null}
      {cartaEscolhida ? null : <CabecaDoQuadro quadro={quadro} misterio={arrumo.misterio} telefone={telefone} sinal={sinal} aoFechar={fechar} />}
      {corpo}
    </div>
  );
}

/* ============================================================
   O MOMENTO — a carta que vira (§QQ 4; 393:3612 a 393:3708)
   O contrato com o `oficial`:
   · `vira`: o resultado de virarCarta ({ carta, preco, perdeu }), num ref
     efémero do resolver do teste (ou do gesto);
   · `misterio`: o quadro é do arco de mistério (a antecipação, o carimbo
     pesado);
   · `alvoRef`: o botão do sinal — a carta voa para lá;
   · `saltar`: um número que sobe quando o turno seguinte é enviado (salta);
   · `aoAcabar()`: no fim do voo — o `oficial` desmonta a peça e acende o
     sinal (`aceso` por QUADRO_DA_TELA.sinal.acende, e só no ganho: uma
     perda não acende, só deixa a gota);
   · `estilo`: a posição (por cima da soleira, alinhada à direita da coluna).
   A carta salta com o toque, Esc ou Enter. Com reduce: já virada e
   carimbada, 120 a entrar, o tempo de ler, 120 a sair.
   ============================================================ */
const PASSOS_DE_COSTAS = new Set(["sobe", "treme", "viraA", "pavio", "risca"]);
export function PistaQueVira({ vira, misterio = false, alvoRef = null, saltar = 0, aoAcabar, estilo = null }) {
  const v = vira && typeof vira === "object" && vira.carta && typeof vira.carta === "object" ? vira : null;
  const [fase, setFase] = React.useState(null);
  const [fala, setFala] = React.useState("");
  const [voo, setVoo] = React.useState(null);
  const relogios = React.useRef([]);
  const carta = React.useRef(null);
  const parado = React.useMemo(() => querParado(), []);
  const perdeu = !!(v && v.perdeu);
  const k = v && !perdeu ? carimboDaCarta(v.carta, v.preco) : null;
  const passos = React.useMemo(() => (v ? cronogramaDaPista({
    face: v.carta.face, de: v.carta.de, carimbo: k ? k.palavra : "", misterio, perdeu, ultimo: v.carta.estado === "perdida", reduzido: parado,
  }) : []), [v, misterio, perdeu, parado]); // eslint-disable-line react-hooks/exhaustive-deps

  const limpar = () => { for (const r of relogios.current) clearTimeout(r); relogios.current = []; };
  const aoEntrar = (passo) => calado(() => {
    setFase(passo);
    if (passo === "viraB" || (passo === "aparece" && !perdeu)) { tocarCarta("comum"); setFala(falaDaPista(v)); }
    if (passo === "carimbo") tocarDaLuta("golpe");
    if (passo === "pavio" || (passo === "aparece" && perdeu)) { tocarDaLuta("erro"); setFala(falaDaPista(v)); }
    if (passo === "voa") {
      const a = alvoRef && alvoRef.current, c = carta.current;
      if (a && c) {
        const ra = a.getBoundingClientRect(), rc = c.getBoundingClientRect();
        setVoo({ x: ra.left + ra.width / 2 - (rc.left + rc.width / 2), y: ra.top + ra.height / 2 - (rc.top + rc.height / 2) });
      }
    }
  });
  const correrDesde = (ms) => {
    limpar();
    const fim = passos.reduce((m, p) => Math.max(m, p.de + p.dura), 0);
    for (const p of passos) {
      if (p.de + p.dura <= ms) continue;
      relogios.current.push(setTimeout(() => aoEntrar(p.passo), Math.max(0, p.de - ms)));
    }
    relogios.current.push(setTimeout(() => calado(() => { if (aoAcabar) aoAcabar(); }), Math.max(0, fim - ms)));
  };
  React.useEffect(() => { if (v) correrDesde(0); return limpar; }, [passos]); // eslint-disable-line react-hooks/exhaustive-deps
  const pular = () => { if (fase === "voa" || fase === "sai") return; const ms = saltoDaPista(passos); if (!fala) setFala(falaDaPista(v)); correrDesde(ms); };
  const ultimoSalto = React.useRef(saltar);
  React.useEffect(() => { if (saltar !== ultimoSalto.current) { ultimoSalto.current = saltar; pular(); } }, [saltar]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!v) return null;
  const final = estadoDaCarta(v.carta);
  const deCostas = PASSOS_DE_COSTAS.has(fase);
  const antes = { ...v.carta, estado: "costas", viravel: false };
  const pv = paviosDaCarta(v.carta);
  /* na perda, a carta sobe com o pavio que vai apagar ainda aceso (os que
     restam + 1), apaga-o no passo do pavio, e só no risco fica perdida */
  const antesDaPerda = perdeu && (fase === null || fase === "sobe" || fase === "treme" || fase === "pavio");
  const momento = {
    apaga: perdeu && fase === "pavio" && pv ? pv.acesos : null,
    acesos: antesDaPerda && pv ? Math.min(pv.total, pv.acesos + 1) : null,
    risco: fase === "risca" ? "desenha" : fase === "pavio" ? "oculto" : "feito",
    carimbo: fase === "viraB" ? "oculto" : fase === "carimbo" ? "cai" : "pousado",
    pesado: misterio,
  };
  const vistaCarta = perdeu ? (antesDaPerda ? antes : v.carta) : deCostas ? antes : v.carta;
  const vistoEstado = perdeu ? (antesDaPerda ? "costas" : final) : deCostas ? "costas" : final;
  const classeFora = fase === "sobe" ? "tv-pista-sobe" : fase === "treme" ? "tv-pista-treme" : fase === "voa" ? "tv-pista-voa" : fase === "aparece" ? "tv-pista-aparece" : fase === "sai" ? "tv-pista-sai" : "";
  const classeDentro = fase === "viraA" ? "tv-carta-vira-a" : fase === "viraB" ? "tv-carta-vira-b" : "";
  const aoTeclar = (e) => { if (e.key === "Escape" || e.key === "Enter" || e.key === " ") { e.preventDefault(); pular(); } };
  return (
    <div style={{ pointerEvents: "none", ...(estilo || {}) }} data-pista-que-vira={fase || ""}>
      <div className="sr-only" aria-live="polite">{fala}</div>
      <div ref={carta} className={classeFora} style={{ opacity: fase ? undefined : 0, pointerEvents: "auto", display: "inline-block",
        ...(voo ? { "--voa-x": `${voo.x}px`, "--voa-y": `${voo.y}px` } : null) }}>
        <div className={classeDentro}>
          <CartaDePista carta={vistaCarta} estado={vistoEstado} momento={momento} aoTocar={pular} aoTeclar={aoTeclar}
            rotulo={nomeDaCarta(v.carta)} />
        </div>
      </div>
    </div>
  );
}
