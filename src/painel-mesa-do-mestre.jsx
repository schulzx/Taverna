/* ============================================================
   AAA · 4 — O HUD B, «a mesa do Mestre vista de cima»
   (mente/formas.md §AAA §13, a escolha da pessoa a 05/11; a vela é a §5)

   O esqueleto da tela principal saiu do App.jsx para aqui: o ecrã do
   Mestre em cima (LUGAR, HORA com a vela, AMEAÇA), as cartas do grupo em
   baixo (no lugar dos anéis da cinta) e os objetos na borda da mesa (no
   lugar do trilho de ícones). O App só passa o que estas peças leem do
   estado dele; nenhuma conta mora aqui, e toda a medida sai de HUD_DA_MESA.

   MUDA A PORTA, NÃO A SALA: cada toque abre a mesma gaveta de antes — o
   relógio abre O TEMPO, a carta do herói abre a ficha (a Gestão), a de um
   companheiro abre o cartão dele no Grupo, e os objetos abrem o Diário, o
   Mapa e a Bolsa. O Códex e a Ascensão, que a §13 não desenhou como
   objeto, ficam na mesma coluna com a forma de aba que já tinham.
   ============================================================ */
import React from "react";
import { T } from "./constantes.js";
import { HUD_DA_MESA, VELA, MOLDURA_POR_DEGRAU, TAMANHOS_DA_MOLDURA, ALVOS, alfa, OBJETOS_DA_MESA } from "./estilo.js";
import { molduraDe } from "./moldura.js";
import { FASES_DO_DIA } from "./mapa-vivo.js";
import { marcasNoAro } from "./marcas-da-moldura.js";
import { Moldura } from "./painel-moldura.jsx";
import { Retrato, MarcaDaPorta, SeloDePrazo } from "./ui.jsx";
import { estadoDe } from "./semente.js";

const OURO = MOLDURA_POR_DEGRAU.ouro;
const BRONZE = MOLDURA_POR_DEGRAU.bronze || OURO;
const H = HUD_DA_MESA;
/* a sombra é a borda escura da mesa; a tinta do mapa e o atilho são a
   granada do Bárbaro (a mesma pedra do PV) — nenhuma cor nasce aqui */
const SOMBRA = T.couroBaixo;
const TINTA_DO_MAPA = H.gemasDaCarta.PV;

/* o movimento da vela (§5 e §9): a chama tremeluz e a luz respira em
   períodos que não se encontram; acender e o fumo uma vez. Com reduce,
   tudo parado e sem fumo. Sem crase: isto é texto de folha de estilo. */
const CSS_DA_VELA = [
  "@keyframes tvVelaTremor { 0%,100% { transform: scaleY(1) skewX(0deg); } 33% { transform: scaleY(1.06) skewX(2deg); } 66% { transform: scaleY(0.97) skewX(-2deg); } }",
  "@keyframes tvVelaRespiro { 0%,100% { opacity: 1; } 50% { opacity: 0.97; } }",
  "@keyframes tvVelaAcende { from { opacity: 0; transform: scaleY(0.2); } to { opacity: 1; transform: scaleY(1); } }",
  "@keyframes tvVelaFumo { 0% { opacity: 0; transform: translateY(0); } 20% { opacity: 0.8; } 100% { opacity: 0; transform: translateY(-14px); } }",
  ".tv-vela-chama { transform-box: fill-box; transform-origin: 50% 100%; animation: tvVelaAcende " + VELA.tempos.acender + "ms ease-out, tvVelaTremor " + VELA.tempos.tremor + "ms ease-in-out " + VELA.tempos.acender + "ms infinite; }",
  ".tv-vela-luz { animation: tvVelaRespiro " + VELA.tempos.respiroDaLuz + "ms ease-in-out infinite; }",
  ".tv-vela-fumo { transform-box: fill-box; animation: tvVelaFumo " + VELA.tempos.fumo + "ms ease-out 1 forwards; }",
  ".tv-luz-da-vela { transition: opacity " + VELA.tempos.acender + "ms ease; }",
  "@media (prefers-reduced-motion: reduce) { .tv-vela-chama, .tv-vela-luz { animation: none; } .tv-vela-fumo { display: none; } .tv-luz-da-vela { transition: opacity " + VELA.tempos.reduzido + "ms linear; } }",
].join("\n");

/* A FASE DA VELA, pela fase do relógio (as seis de MAPA_VIVO.modoDaFase).
   Fase desconhecida: a vela nova e apagada do dia. */
function velaDaFase(fase) {
  return VELA.porFase[fase] || VELA.porFase.manha;
}

/* a fase do relógio de um minuto, pela régua do mapa vivo (FASES_DO_DIA) */
function faseDoMinuto(minuto) {
  const m = ((Math.floor(Number(minuto) || 0) % 1440) + 1440) % 1440;
  return (FASES_DO_DIA.find((f) => m < f.ate) || FASES_DO_DIA[FASES_DO_DIA.length - 1]).id;
}

/* A VELA — o castiçal de bronze. A altura da cera é o relógio da noite. */
function Vela({ fase = "manha", alto = H.mesa.ecra.velaAlta }) {
  const v = velaDaFase(fase);
  const pe = 66, maxCera = 40;
  const cera = Math.max(4, maxCera * (Number(v.altura) || 0));
  const topo = pe - cera;
  return (
    <svg aria-hidden="true" width={alto * 0.5} height={alto} viewBox="0 0 40 80" style={{ display: "block", overflow: "visible", flexShrink: 0 }}>
      <defs>
        <radialGradient id="tv-vela-halo">
          <stop offset="0" stopColor={VELA.cor.halo} stopOpacity="0.55" />
          <stop offset="1" stopColor={VELA.cor.halo} stopOpacity="0" />
        </radialGradient>
      </defs>
      {v.estado === "acesa" ? <circle className="tv-vela-luz" cx="20" cy={topo - 8} r="18" fill="url(#tv-vela-halo)" /> : null}
      {/* o prato e o copo de bronze */}
      <ellipse cx="20" cy="74" rx="17" ry="4.5" fill={BRONZE.escuro} />
      <ellipse cx="20" cy="72.5" rx="16" ry="3.6" fill={BRONZE.meio} />
      <rect x="13.5" y={pe - 1} width="13" height="8" rx="2" fill={BRONZE.meio} stroke={BRONZE.escuro} strokeWidth="0.8" />
      {/* a cera e a sombra dela */}
      <rect x="15" y={topo} width="10" height={cera} rx="1.5" fill={VELA.cor.cera} />
      <rect x="21.5" y={topo} width="3.5" height={cera} fill={VELA.cor.ceraSombra} />
      <line x1="20" y1={topo} x2="20" y2={topo - 3} stroke={VELA.cor.pavio} strokeWidth="1.2" strokeLinecap="round" />
      {v.estado === "acesa" ? (
        <g className="tv-vela-chama">
          <path d={`M20 ${topo - 2}C15.6 ${topo - 4} 16 ${topo - 11} 20 ${topo - 17}C24 ${topo - 11} 24.4 ${topo - 4} 20 ${topo - 2}Z`} fill={VELA.cor.chama} />
          <ellipse cx="20" cy={topo - 6.5} rx="1.8" ry="3.4" fill={VELA.cor.nucleo} />
        </g>
      ) : null}
      {v.estado === "fumo" ? (
        <path className="tv-vela-fumo" d={`M20 ${topo - 3}c-3 -4 3 -6 0 -10c-3 -4 3 -6 0 -10`} fill="none" stroke={VELA.cor.fumo} strokeWidth="1.2" strokeLinecap="round" />
      ) : null}
    </svg>
  );
}

/* A LUZ DA VELA NA FOLHA: o halo que cai de cima, recortado pelo pai (a
   folha tem overflow escondido). Zero de dia: não pinta nada. */
export function LuzDaVela({ minuto }) {
  const v = velaDaFase(faseDoMinuto(minuto));
  return (
    <div aria-hidden="true" className="tv-luz-da-vela" style={{
      position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0, opacity: v.luz > 0 ? 1 : 0,
      background: `radial-gradient(${VELA.luzNoPapel.raioDaFolha * 100}% 70% at 50% 0%, ${alfa(VELA.cor.halo, v.luz || 0)}, transparent 100%)`,
    }} />
  );
}

/* A VINHETA DA NOITE: a mesa escurece nas bordas enquanto a vela arde. */
export function VinhetaDaNoite({ minuto }) {
  const v = velaDaFase(faseDoMinuto(minuto));
  return (
    <div aria-hidden="true" className="tv-luz-da-vela" style={{
      position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1, opacity: v.luz > 0 ? 1 : 0,
      background: `radial-gradient(120% 100% at 50% 30%, transparent 55%, ${alfa(SOMBRA, VELA.luzNoPapel.vinhetaDaMesa)} 100%)`,
    }} />
  );
}

/* o couro do painel com a moldura de ouro e o fio claro por dentro */
const couroDoPainel = () => ({
  background: `linear-gradient(180deg, ${T.couroAlto} 0%, ${T.couro} 38%)`,
  border: `${H.painel.moldura}px solid ${OURO.meio}`,
  boxShadow: `inset 0 0 0 1px ${alfa(OURO.claro, H.painel.fio)}, 0 6px 14px ${alfa(SOMBRA, 0.45)}`,
  borderRadius: H.painel.raio,
});

function TituloDoPainel({ children }) {
  return <span className="tv-titulo uppercase block" style={{ fontSize: H.titulo.tamanho, letterSpacing: H.titulo.rastreio, color: OURO.claro, lineHeight: 1.2 }}>{children}</span>;
}

function PontosDaAmeaca({ n }) {
  const k = Math.max(0, Math.min(H.ameaca.pontos, Math.floor(Number(n) || 0)));
  return (
    <span aria-hidden="true" style={{ color: T.danger, letterSpacing: 4 }}>
      {Array.from({ length: H.ameaca.pontos }, (_, i) => (i < k ? H.ameaca.cheio : H.ameaca.vazio)).join("")}
    </span>
  );
}

/* O ECRÃ DO MESTRE. `ameaca` só aparece quando o sistema a dá (um número
   0–3); sem ele o painel não nasce — a casa não inventa o perigo. O toque
   na HORA abre O TEMPO, como o relógio da cinta abria. `children` é o que
   se posiciona contra o ecrã inteiro (o sinal de guardado). */
export function EcraDoMestre({ telefone = false, lugar = "", detalhe = "", hora = "", data = "", minuto = 0, ameaca = null, prazo = null, quantosPrazos = 0, escondidoGrave = false, falaDaHora = "", tempoAberto = false, aoAbrirTempo, children }) {
  const fase = faseDoMinuto(minuto);
  const comAmeaca = ameaca != null && Number.isFinite(Number(ameaca));
  const fala = falaDaHora || ["O tempo", hora].filter(Boolean).join(", ");
  if (telefone) {
    const fio = { width: 1, alignSelf: "stretch", background: alfa(OURO.meio, 0.7), margin: "8px 0" };
    return (
      <div className="relative flex items-stretch" style={{ height: H.telefone.ecra.alto, ...couroDoPainel(), borderRadius: 0, border: "none",
        /* a moldura da tira desenha-se por sombra, para não roubar 2 px ao alvo da HORA (44, WCAG 2.5.5) */
        boxShadow: `inset 0 -${H.painel.moldura}px 0 ${OURO.meio}, inset 0 -${H.painel.moldura + 1}px 0 ${alfa(OURO.claro, H.painel.fio)}, 0 6px 14px ${alfa(SOMBRA, 0.45)}` }}>
        <style>{CSS_DA_VELA}</style>
        <div className="flex-1 min-w-0 flex flex-col justify-center px-2.5">
          <span className="tv-body truncate" style={{ fontSize: 13, color: T.ink, lineHeight: 1.15 }} title={[lugar, detalhe].filter(Boolean).join(" · ")}>{lugar}</span>
          {detalhe ? <span className="tv-mono truncate" style={{ fontSize: 10, color: T.inkDim, lineHeight: 1.2 }}>{detalhe}</span> : null}
        </div>
        <span aria-hidden="true" style={fio} />
        <button onClick={aoAbrirTempo} aria-label={fala} aria-expanded={!!tempoAberto} title="O tempo — esperar, acampar, os prazos"
          className="tv-anel-foco shrink-0 flex items-center gap-1.5 px-2" style={{ background: "transparent", border: "none", minWidth: ALVOS.piso }}>
          <Vela fase={fase} alto={H.telefone.ecra.velaAlta} />
          <span className="tv-body" style={{ fontSize: 13, color: T.ink, whiteSpace: "nowrap" }}>{hora}</span>
          {prazo ? <SeloDePrazo noites={prazo.noites} quantos={quantosPrazos} urgente={prazo.noites <= 1} escondidoGrave={escondidoGrave} /> : null}
        </button>
        {comAmeaca ? (<>
          <span aria-hidden="true" style={fio} />
          <span className="shrink-0 flex items-center px-2.5 tv-mono" style={{ fontSize: 12 }} aria-label={`Ameaça, ${ameaca} de ${H.ameaca.pontos}`}><PontosDaAmeaca n={ameaca} /></span>
        </>) : null}
        {children}
      </div>
    );
  }
  const painel = { width: H.mesa.ecra.painel, height: H.mesa.ecra.alto, padding: `8px ${H.painel.enchimento}px`, ...couroDoPainel() };
  return (
    <div className="relative flex items-center justify-center" style={{ height: H.mesa.ecra.alto + 2 * H.mesa.ecra.respiro, gap: H.mesa.ecra.folga, paddingTop: H.mesa.ecra.respiro, paddingBottom: H.mesa.ecra.respiro }}>
      <style>{CSS_DA_VELA}</style>
      <div className="flex flex-col justify-center min-w-0" style={painel}>
        <TituloDoPainel>Lugar</TituloDoPainel>
        <span className="tv-body truncate" style={{ fontSize: 15, color: T.ink, lineHeight: 1.3 }} title={lugar}>{lugar}</span>
        {detalhe ? <span className="tv-mono truncate" style={{ fontSize: 10, color: T.inkDim }}>{detalhe}</span> : null}
      </div>
      <button onClick={aoAbrirTempo} aria-label={fala} aria-expanded={!!tempoAberto} title="O tempo — esperar, acampar, os prazos"
        className="tv-anel-foco flex items-center gap-2 text-left min-w-0" style={{ ...painel, padding: `4px ${H.painel.enchimento}px 4px 6px`, outlineColor: tempoAberto ? T.amber : undefined }}>
        <Vela fase={fase} alto={H.mesa.ecra.velaAlta} />
        <span className="flex flex-col min-w-0">
          <TituloDoPainel>Hora</TituloDoPainel>
          <span className="tv-body truncate" style={{ fontSize: 15, color: T.ink, lineHeight: 1.3 }}>{hora}</span>
          <span className="flex items-center gap-1.5 min-w-0">
            <span className="tv-mono truncate" style={{ fontSize: 10, color: T.inkDim }}>{data}</span>
            {prazo ? <SeloDePrazo noites={prazo.noites} quantos={quantosPrazos} urgente={prazo.noites <= 1} escondidoGrave={escondidoGrave} /> : null}
          </span>
        </span>
      </button>
      {comAmeaca ? (
        <div className="flex flex-col justify-center" style={painel} aria-label={`Ameaça, ${ameaca} de ${H.ameaca.pontos}`}>
          <TituloDoPainel>Ameaça</TituloDoPainel>
          <span className="tv-mono" style={{ fontSize: 14 }}><PontosDaAmeaca n={ameaca} /></span>
          <span className="tv-mono" style={{ fontSize: 10, color: T.inkDim }}>{ameaca} de {H.ameaca.pontos}</span>
        </div>
      ) : null}
      {children}
    </div>
  );
}

/* UMA GEMA DA CARTA: a pedra pequena e o número ao lado */
function GemaDaCarta({ cor, valor, rotulo, tam }) {
  return (
    <span className="inline-flex items-center gap-1" title={rotulo} aria-label={`${rotulo} ${valor}`}>
      <svg aria-hidden="true" width={tam} height={tam} viewBox="0 0 10 10" style={{ display: "block" }}>
        <path d="M5 0.6L9.4 5L5 9.4L0.6 5Z" fill={cor} stroke={alfa(SOMBRA, 0.5)} strokeWidth="0.8" />
        <path d="M5 1.8L7.2 5L5 4.2L2.8 5Z" fill={VELA.cor.nucleo} fillOpacity="0.35" />
      </svg>
      <span className="tv-mono" style={{ fontSize: H.gema.letra, color: T.ink, lineHeight: 1 }}>{valor}</span>
    </span>
  );
}

/* A CARTA DO GRUPO — a moldura viva (§1) em ponto pequeno, com o nome na
   placa e PV, PM e Destino em gemas por baixo. Tocar abre o que o anel
   abria. `destino` só existe para quem o tem (o herói). */
function CartaDoGrupo({ ente, heroi = false, escala = 0.5, telefone = false, comPM = true, destino = null, aberta = false, novo = false, aoAbrir, rotulo }) {
  let m = null;
  try { m = molduraDe(ente, heroi ? "heroi" : "companheiro"); } catch (e) { m = null; }
  if (!ente) return null;
  const aro = TAMANHOS_DA_MOLDURA.carta.largura * escala;
  const k = aro / 160;
  const vida = Math.max(0, Number(ente.vida) || 0), vidaMax = Math.max(0, Number(ente.vidaMax) || 0);
  const tombado = vida <= 0 || !!ente.morrendo;
  let estado = "normal";
  try { estado = estadoDe(vida, vidaMax); } catch (e) { estado = "normal"; }
  let marcas = null;
  try { marcas = heroi ? marcasNoAro(ente.feitos) : null; } catch (e) { marcas = null; }
  const tam = telefone ? H.gema.telefone : H.gema.mesa;
  const nome = String(ente.nome || "").split(" ")[0];
  return (
    <button onClick={aoAbrir} aria-label={rotulo || ente.nome} title={rotulo || ente.nome} aria-haspopup="dialog" aria-expanded={heroi ? !!aberta : undefined}
      className="tv-anel-foco shrink-0 flex flex-col items-center gap-1 rounded-lg"
      style={{ background: "transparent", border: "none", padding: 0, marginTop: heroi ? 0 : (telefone ? 10 : H.mesa.cartas.recuo) }}>
      <span className="relative inline-block">
        <Moldura tamanho="carta" aro={aro} degrau={(m && m.degrau) || "ferro"} lado={(m && m.lado) || "heroi"} gema={m && m.gema} selo={!!(m && m.selo)}
          nivel={ente.nivel || 1} ca={ente.ca != null ? ente.ca : null} tombado={tombado} marcas={marcas}>
          {(w) => <Retrato semente={ente.semente || ente.nome} ente={ente} tamanho={w} estado={estado} semCarta />}
        </Moldura>
        {/* o nome na placa (a caixa de 140 × 56 em y 156 da carta) */}
        <span className="tv-titulo absolute flex items-center justify-center text-center" aria-hidden="true"
          style={{ left: 36 * k, top: 186 * k, width: 140 * k, height: 56 * k * 0.62, fontSize: Math.max(9, 18 * k), color: OURO.claro, lineHeight: 1, overflow: "hidden", whiteSpace: "nowrap" }}>{nome}</span>
        {novo && !aberta ? <span aria-hidden="true" style={{ position: "absolute", right: 2, top: 2, lineHeight: 0 }}><MarcaDaPorta estado="novo" /></span> : null}
      </span>
      <span className="flex items-center gap-2">
        <GemaDaCarta cor={H.gemasDaCarta.PV} valor={vida} rotulo="PV" tam={tam} />
        {comPM ? <GemaDaCarta cor={H.gemasDaCarta.PM} valor={Math.max(0, Number(ente.mana) || 0)} rotulo="PM" tam={tam} /> : null}
        {destino != null ? <GemaDaCarta cor={H.gemasDaCarta.Destino} valor={destino} rotulo="Destino" tam={tam} /> : null}
      </span>
    </button>
  );
}

/* OS OBJETOS DA MESA (AAA §15, redesenhados a 05/11 a pedido da pessoa: «acho
   que conseguimos melhorar esses ícones do bolsa, mapa e diário»). O desenho é
   a tabela OBJETOS_DA_MESA (estilo.js): camadas SVG num quadro 96×96, com
   gradientes próprios. Os ids dos gradientes ganham o prefixo de useId, porque
   o mesmo objeto pode estar duas vezes na página. A chave é o objeto; a aba da
   bolsa chama-se «inv». Um id sem entrada cai no Glifo da aba. */
const CHAVE_DO_OBJETO = { inv: "bolsa" };
export function DesenhoDoObjeto({ chave, lado, novo = false }) {
  const uid = "odm" + React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const o = OBJETOS_DA_MESA[chave];
  if (!o || !Array.isArray(o.camadas)) return null;
  const pref = (v) => (typeof v === "string" && v.startsWith("url(#") ? `url(#${uid}-${v.slice(5)}` : v);
  const gradiente = (g) => {
    const paradas = (g.paradas || []).map(([p, cor, a], k) => <stop key={k} offset={p} stopColor={cor} stopOpacity={a == null ? 1 : a} />);
    return g.tipo === "radial"
      ? <radialGradient key={g.id} id={`${uid}-${g.id}`} cx={g.cx} cy={g.cy} r={g.r}>{paradas}</radialGradient>
      : <linearGradient key={g.id} id={`${uid}-${g.id}`} x1={g.x1} y1={g.y1} x2={g.x2} y2={g.y2}>{paradas}</linearGradient>;
  };
  const camada = (c, k) => {
    const { el, sw, dash, rot, ...resto } = c;
    const props = { ...resto, fill: pref(resto.fill), stroke: pref(resto.stroke) };
    if (sw != null) { props.strokeWidth = sw; props.strokeLinejoin = "round"; props.strokeLinecap = "round"; }
    if (dash) props.strokeDasharray = dash;
    if (rot != null) props.transform = `rotate(${rot} ${c.cx != null ? c.cx : 48} ${c.cy != null ? c.cy : 48})`;
    const Tag = el;
    return <Tag key={k} {...props} />;
  };
  const gs = [...(o.gradientes || []), ...(novo && OBJETOS_DA_MESA.novidade ? [OBJETOS_DA_MESA.novidade.gradiente] : [])];
  return (
    <svg aria-hidden="true" width={lado} height={lado} viewBox={OBJETOS_DA_MESA.viewBox}>
      <defs>{gs.map(gradiente)}</defs>
      {novo && OBJETOS_DA_MESA.novidade ? camada(OBJETOS_DA_MESA.novidade.halo, "halo") : null}
      {o.camadas.map(camada)}
    </svg>
  );
}

export function ObjetoDaMesa({ id, rotulo, legenda = "", ativo = false, novo = false, telefone = false, Glifo = null, aoTocar }) {
  const chave = CHAVE_DO_OBJETO[id] || id;
  const desenho = OBJETOS_DA_MESA[chave] ? chave : null;
  const lado = telefone ? H.telefone.objetos.tamanho : OBJETOS_DA_MESA.tamanho.mesa;
  return (
    <button onClick={aoTocar} aria-pressed={!!ativo} aria-label={[rotulo, legenda, novo ? "há coisa nova" : ""].filter(Boolean).join(", ")} title={rotulo}
      className="tv-anel-foco relative shrink-0 flex flex-col items-center justify-center gap-1 rounded-lg"
      style={{
        minWidth: telefone ? ALVOS.piso : H.mesa.objetos.alvo.largura, minHeight: telefone ? ALVOS.piso : (desenho ? H.mesa.objetos.alvo.alto : ALVOS.piso), padding: telefone ? 2 : 6,
        background: ativo ? alfa(T.amber, 0.12) : "transparent",
        border: `1px solid ${ativo ? T.amber : desenho ? "transparent" : T.lineStrong}`,
      }}>
      <span style={{ position: "relative", display: "inline-flex", filter: `drop-shadow(0 4px 4px ${alfa(SOMBRA, 0.5)})` }}>
        {desenho
          ? <DesenhoDoObjeto chave={desenho} lado={lado} novo={novo && !ativo} />
          : Glifo ? <Glifo tamanho={telefone ? 22 : 26} cor={ativo ? T.amberSoft : T.inkMeio} /> : null}
        {novo && !ativo ? (
          <span aria-hidden="true" style={{ position: "absolute", top: -4, right: -6, lineHeight: 0 }}><MarcaDaPorta estado="novo" /></span>
        ) : null}
      </span>
      <span className="tv-titulo uppercase" style={{ fontSize: telefone ? H.telefone.objetos.rotulo : H.titulo.tamanho, letterSpacing: 1, color: ativo ? T.amberSoft : OURO.claro, lineHeight: 1 }}>{rotulo}</span>
      {legenda && !telefone ? <span className="tv-mono" style={{ fontSize: 10, color: T.inkMeio, lineHeight: 1 }}>{legenda}</span> : null}
    </button>
  );
}

/* A FILA DE BAIXO: as cartas (o herói ao centro, maior) e, no telefone,
   os objetos na mesma fila (objetosNaFila). Rola de lado se não couber.
   `baixa`: a mesa com pouca altura (HUD_DA_MESA.mesa.baixa) — cartas menores. */
export function FilaDasCartas({ telefone = false, baixa = false, heroi, grupo = [], comPMDoHeroi = true, destino = null, fichaAberta = false, fichaNova = false, aoAbrirFicha, aoAbrirCompanheiro, rotuloDoHeroi, objetos = null }) {
  const esc = telefone ? H.telefone.cartas : baixa ? H.mesa.baixa.cartas : H.mesa.cartas;
  const lista = Array.isArray(grupo) ? grupo.filter(Boolean) : [];
  const metade = Math.ceil(lista.length / 2);
  const carta = (c, i) => (
    <CartaDoGrupo key={(c.nome || "") + i} ente={c} escala={esc.companheiro} telefone={telefone}
      comPM={(Number(c.manaMax) || 0) > 0} aoAbrir={() => aoAbrirCompanheiro && aoAbrirCompanheiro(c.nome)} rotulo={`${c.nome}, ${c.vida || 0} de ${c.vidaMax || 0} PV`} />
  );
  return (
    <div className="tv-scroll flex items-start" style={{
      /* na mesa a fila mede as cartas (linhas[4] é auto): nenhum vão por baixo do campo */
      height: telefone ? parseInt(H.telefone.linhas[5], 10) : undefined,
      justifyContent: telefone ? "flex-start" : "center", gap: telefone ? 8 : H.mesa.cartas.folga,
      overflowX: "auto", overflowY: "hidden", padding: telefone ? "6px 10px 0" : "6px 0 0",
    }}>
      {(telefone ? [] : lista.slice(0, metade)).map(carta)}
      <CartaDoGrupo ente={heroi} heroi escala={esc.heroi} telefone={telefone} comPM={comPMDoHeroi} destino={destino}
        aberta={fichaAberta} novo={fichaNova} aoAbrir={aoAbrirFicha} rotulo={rotuloDoHeroi} />
      {(telefone ? lista : lista.slice(metade)).map(carta)}
      {telefone && objetos ? <span className="flex items-start gap-1 shrink-0" style={{ marginLeft: "auto", paddingTop: 10 }}>{objetos}</span> : null}
    </div>
  );
}
