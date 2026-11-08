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
import { createPortal } from "react-dom";
import { T } from "./constantes.js";
import { HUD_DA_MESA, VELA, MOLDURA_POR_DEGRAU, TAMANHOS_DA_MOLDURA, ALVOS, TIPOS, alfa, OBJETOS_DA_MESA, DADO_DE_USO_NA_MESA, FORMAS_DO_DADO, PAPEL_DO_DADO, TIRA_DA_MESA } from "./estilo.js";
import { molduraDe } from "./moldura.js";
import { FASES_DO_DIA } from "./mapa-vivo.js";
import { marcasNoAro } from "./marcas-da-moldura.js";
import { Moldura } from "./painel-moldura.jsx";
import { Retrato, MarcaDaPorta, SeloDePrazo, Glifo, IconeChevronEsq } from "./ui.jsx";
import { Corpo } from "./painel-bandeja.jsx";
import { estadoDe } from "./semente.js";

const OURO = MOLDURA_POR_DEGRAU.ouro;
const BRONZE = MOLDURA_POR_DEGRAU.bronze || OURO;
const H = HUD_DA_MESA;
const TIRA = TIRA_DA_MESA;
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
function Vela({ fase = "manha", alto = H.mesa.barra.velaAlta }) {
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

/* UMA GEMA DA CARTA: a pedra pequena e o número ao lado */
function GemaDaCarta({ cor, valor, rotulo, tam, letra = H.gema.letra, peso = 400 }) {
  return (
    <span className="inline-flex items-center gap-1" title={rotulo} aria-label={`${rotulo} ${valor}`}>
      <svg aria-hidden="true" width={tam} height={tam} viewBox="0 0 10 10" style={{ display: "block" }}>
        <path d="M5 0.6L9.4 5L5 9.4L0.6 5Z" fill={cor} stroke={alfa(SOMBRA, 0.5)} strokeWidth="0.8" />
        <path d="M5 1.8L7.2 5L5 4.2L2.8 5Z" fill={VELA.cor.nucleo} fillOpacity="0.35" />
      </svg>
      <span className="tv-mono" style={{ fontSize: letra, fontWeight: peso, color: T.ink, lineHeight: 1 }}>{valor}</span>
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

/* 07/11 · TL 4: `naTira` — o objeto na Tira da mesa do telefone: o desenho a 40
   num alvo de 48 × 56 e SEM rótulo escrito (o rótulo fica no nome acessível e
   na mesa puxada). A gota de novidade é a de sempre. */
export function ObjetoDaMesa({ id, rotulo, legenda = "", ativo = false, novo = false, telefone = false, naTira = false, escala = 1, Glifo = null, aoTocar }) {
  const chave = CHAVE_DO_OBJETO[id] || id;
  const desenho = OBJETOS_DA_MESA[chave] ? chave : null;
  const lado = naTira ? TIRA.objeto.desenho : telefone ? H.telefone.objetos.tamanho : OBJETOS_DA_MESA.tamanho.mesa * escala;
  return (
    <button onClick={aoTocar} aria-pressed={!!ativo} aria-label={[rotulo, legenda, novo ? "há coisa nova" : ""].filter(Boolean).join(", ")} title={rotulo}
      className="tv-anel-foco relative shrink-0 flex flex-col items-center justify-center gap-1 rounded-lg"
      style={{
        minWidth: naTira ? TIRA.objeto.alvo.largura : telefone ? ALVOS.piso : H.mesa.objetos.alvo.largura * escala,
        minHeight: naTira ? TIRA.objeto.alvo.alto : telefone ? ALVOS.piso : (desenho ? H.mesa.objetos.alvo.alto * escala : ALVOS.piso),
        /* na mesa puxada (escala < 1) o objeto é o da mesa encolhido inteiro: sem enchimento, e o alvo é o desenho (59,5 × 74,4) */
        padding: naTira || escala < 1 ? 0 : telefone ? 2 : 6,
        background: ativo ? alfa(T.amber, 0.12) : "transparent",
        border: `1px solid ${ativo ? T.amber : desenho ? "transparent" : T.lineStrong}`,
      }}>
      <span style={{ position: "relative", display: "inline-flex", filter: `drop-shadow(0 4px 4px ${alfa(SOMBRA, 0.5)})` }}>
        {desenho
          ? <DesenhoDoObjeto chave={desenho} lado={lado} novo={novo && !ativo} />
          : Glifo ? <Glifo tamanho={telefone || naTira ? 22 : 26} cor={ativo ? T.amberSoft : T.inkMeio} /> : null}
        {novo && !ativo ? (
          <span aria-hidden="true" style={{ position: "absolute", top: -4, right: -6, lineHeight: 0 }}><MarcaDaPorta estado="novo" /></span>
        ) : null}
      </span>
      {naTira && !TIRA.objeto.rotulo ? null : <span className="tv-titulo uppercase" style={{ fontSize: telefone ? H.telefone.objetos.rotulo : H.titulo.tamanho, letterSpacing: 1, color: ativo ? T.amberSoft : OURO.claro, lineHeight: 1 }}>{rotulo}</span>}
      {legenda && !telefone && !naTira && escala >= 1 ? <span className="tv-mono" style={{ fontSize: 10, color: T.inkMeio, lineHeight: 1 }}>{legenda}</span> : null}
    </button>
  );
}


/* ============================================================
   AR 12 · A PRATELEIRA DOS MANTIMENTOS (07/11/2026) — formas.md §AR 12,
   Figma 294:3628 (a mesa), 294:4040 (o detalhe), 294:4080 (o telefone).

   As rações, a água e as tochas pousadas na mesa como três dados, ao pé da
   Bolsa. A FORMA DO DADO É A QUANTIDADE (d10/d8 muito → d4 pouco), e por
   baixo vai a contagem do inventário, «×5». A face NÃO se calcula aqui: vem
   do sistema (faceDoDadoDeUso, dado-de-uso.js), já pronta na prop «dados».
   O dado é o Corpo da Bandeja (papel uso, o osso) — não há segundo dado.

   É UM botão, não três: a ação é uma só (abrir a Bolsa nos Mantimentos), e a
   fiação dela é do App («aoAbrir»). Quando a face desce entre duas vistas, o
   dado encolhe e volta (320 ms; parado no reduce).
   ============================================================ */
const USO = DADO_DE_USO_NA_MESA;
/* a face dita por extenso no nome acessível («dado de seis») */
const FACE_POR_EXTENSO = { 10: "dez", 8: "oito", 6: "seis", 4: "quatro" };
const contaDe = (v) => Math.max(0, Math.floor(Number(v) || 0));
const faceDe = (v) => (FORMAS_DO_DADO[v] && FACE_POR_EXTENSO[v] ? Number(v) : null);

/* um mantimento: o dado (ou o contorno vazio) com o glifo dentro, e a contagem */
/* `lugar` (TL 8): "mesa" (44) · "tira" (o telefone, 22) · "puxada" (a mesa
   puxada do telefone, 28 — os glifos de 28 que AR 12 desenhou para o telefone
   e a TL guarda em TIRA_DA_MESA.puxada). `telefone` é o nome antigo da tira. */
const lugarDoUso = (lugar, telefone) => (lugar === "tira" || lugar === "puxada" || lugar === "mesa" ? lugar : telefone ? "tira" : "mesa");
const medidaDoUso = (lugar) => (lugar === "puxada" ? { dado: TIRA.puxada.dado, glifo: TIRA.puxada.glifo } : lugar === "tira" ? USO.telefone : USO.mesa);
export function DadoDeUso({ tipo, face, n, telefone = false, lugar = null }) {
  const M = medidaDoUso(lugarDoUso(lugar, telefone));
  const tam = M.dado;
  const f = faceDe(face);
  const vazio = f == null;
  const lado = M.glifo[vazio ? USO.vazio.forma : f];
  const centro = vazio ? FORMAS_DO_DADO[USO.vazio.forma].numero : f === 10 ? USO.centroDoD10 : FORMAS_DO_DADO[f].numero;
  const k = tam / 48;
  const aperta = vazio || f === USO.apertaNaFace;
  return (
    <span className="inline-flex flex-col items-center" style={{ gap: USO.contagem.entre }} data-uso={tipo} data-face={vazio ? "vazio" : f}>
      <span style={{ position: "relative", display: "inline-flex", width: tam, height: tam }}>
        {vazio ? (
          <svg width={tam} height={tam} viewBox="0 0 48 48" aria-hidden="true" style={{ flex: "none", overflow: "visible" }}>
            <polygon points={FORMAS_DO_DADO[USO.vazio.forma].corpo} fill="none" stroke={USO.vazio.aro} strokeWidth="1.5" strokeDasharray={USO.vazio.tracejado.join(" ")} strokeLinejoin="round" />
          </svg>
        ) : <Corpo faces={f} legenda="" papel={USO.papel} tam={tam} />}
        <span aria-hidden="true" style={{ position: "absolute", left: centro[0] * k - lado / 2, top: centro[1] * k - lado / 2, lineHeight: 0 }}>
          <Glifo nome={USO.glifo[tipo]} tamanho={lado} cor={vazio ? USO.vazio.glifo : T[PAPEL_DO_DADO[USO.papel].numero]} />
        </span>
      </span>
      <span className="tv-mono" aria-hidden="true" style={{ fontSize: USO.contagem.tamanho, fontWeight: USO.contagem.peso, lineHeight: 1, color: aperta ? USO.contagem.aperta : USO.contagem.cor }}>
        {USO.contagem.prefixo}{contaDe(n)}
      </span>
    </span>
  );
}

/* o nome acessível da prateleira inteira: «rações 5, dado de seis; …» */
export function nomeDaPrateleira(dados, contagens) {
  const d = dados && typeof dados === "object" ? dados : {};
  const c = contagens && typeof contagens === "object" ? contagens : {};
  const partes = USO.ordem.map((tipo) => {
    const f = faceDe(d[tipo]);
    const n = contaDe(c[tipo]);
    if (f == null) return n > 0 ? USO.nome[tipo] + " " + n : USO.nome[tipo] + ": nenhuma";
    return USO.nome[tipo] + " " + n + ", dado de " + FACE_POR_EXTENSO[f] + (f === USO.apertaNaFace ? ", a acabar" : "");
  });
  return "Mantimentos: " + partes.join("; ") + ". Abrir na Bolsa.";
}

export function PrateleiraDosMantimentos({ dados = null, contagens = null, telefone = false, lugar = null, aoAbrir }) {
  const d = dados && typeof dados === "object" ? dados : {};
  const c = contagens && typeof contagens === "object" ? contagens : {};
  const onde = lugarDoUso(lugar, telefone);
  const M = onde === "mesa" ? USO.mesa : USO.telefone;
  const naTira = onde === "tira";
  /* o encolher: a face desceu desde a vista anterior (ou acabou) */
  const anterior = React.useRef(null);
  const [encolheu, setEncolheu] = React.useState({});
  const chave = USO.ordem.map((tipo) => String(faceDe(d[tipo]))).join("|");
  React.useEffect(() => {
    try {
      const antes = anterior.current;
      const agora = Object.fromEntries(USO.ordem.map((tipo) => [tipo, faceDe(d[tipo])]));
      anterior.current = agora;
      if (!antes) return;
      const desceram = USO.ordem.filter((tipo) => antes[tipo] != null && (agora[tipo] == null || agora[tipo] < antes[tipo]));
      if (desceram.length) setEncolheu((e) => ({ ...e, ...Object.fromEntries(desceram.map((tipo) => [tipo, (e[tipo] || 0) + 1])) }));
    } catch { /* a forma nunca custa o turno */ }
  }, [chave]); // eslint-disable-line react-hooks/exhaustive-deps
  const dado = (tipo) => (
    <span key={tipo + "-" + (encolheu[tipo] || 0)} className={encolheu[tipo] ? "tv-uso-encolhe" : undefined} style={{ display: "inline-flex" }}>
      <span style={naTira ? { display: "inline-flex", justifyContent: "center", width: TIRA.mantimentos.coluna } : { display: "inline-flex" }}>
        <DadoDeUso tipo={tipo} face={d[tipo]} n={c[tipo]} lugar={onde} />
      </span>
    </span>
  );
  return (
    <button type="button" onClick={aoAbrir} aria-label={nomeDaPrateleira(d, c)} title="Mantimentos"
      className="tv-anel-foco tv-encaixe shrink-0 flex flex-col items-center justify-center rounded-lg"
      style={{
        minWidth: onde === "puxada" ? undefined : M.alvo.largura, minHeight: onde === "puxada" ? ALVOS.piso : M.alvo.alto, padding: 0, marginTop: onde === "mesa" ? USO.mesa.acima : 0,
        rowGap: onde === "mesa" ? USO.mesa.entreLinhas - USO.contagem.entre - USO.contagem.tamanho : 0,
        background: "transparent", border: "none", cursor: "pointer",
      }}>
      {M.linhas.map((linha, i) => (
        <span key={i} className="flex items-start justify-center" style={{ gap: naTira ? TIRA.mantimentos.entre : M.folga }}>{linha.map(dado)}</span>
      ))}
    </button>
  );
}

/* A FILA DE BAIXO: as cartas (o herói ao centro, maior) e, no telefone,
   os objetos na mesma fila (objetosNaFila). Rola de lado se não couber.
   `baixa`: a mesa com pouca altura (HUD_DA_MESA.mesa.baixa) — cartas menores. */
export function FilaDasCartas({ telefone = false, baixa = false, heroi, grupo = [], comPMDoHeroi = true, destino = null, fichaAberta = false, fichaNova = false, aoAbrirFicha, aoAbrirCompanheiro, rotuloDoHeroi, objetos = null }) {
  const esc = telefone ? H.telefone.cartas : baixa ? H.mesa.cartas.baixa : H.mesa.cartas;
  const lista = Array.isArray(grupo) ? grupo.filter(Boolean) : [];
  const metade = Math.ceil(lista.length / 2);
  const carta = (c, i) => (
    <CartaDoGrupo key={(c.nome || "") + i} ente={c} escala={esc.companheiro} telefone={telefone}
      comPM={(Number(c.manaMax) || 0) > 0} aoAbrir={() => aoAbrirCompanheiro && aoAbrirCompanheiro(c.nome)} rotulo={`${c.nome}, ${c.vida || 0} de ${c.vidaMax || 0} PV`} />
  );
  return (
    <div className="tv-scroll flex items-start" style={{
      /* na mesa a fila mede as cartas (linhas[4] é auto): nenhum vão por baixo do campo */
      height: telefone ? H.telefone.cartas.alto : undefined,
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

/* ============================================================
   TL · A TELA LIMPA (07/11/2026) — formas.md §TL 3–5, 8; Figma 306:2.

   A pessoa mandou a foto do telefone: «veja só como fica poluída a tela».
   Na foto não se via UMA linha de prosa. Três peças desta casa mudam isso:

   · BarraDoMestre (306:69) — a barra do topo e o ecrã do Mestre passam a ser
     uma faixa só: o lugar (um botão: abre o horizonte), quem está em cena (a
     ranhura do EmCena), a hora com a vela e o clima (um botão: abre O TEMPO,
     como o relógio de sempre) e a ameaça. O lugar aparece aqui e só aqui.
   · TiraDaMesa (306:107) — a mesa do telefone recolhida a 72 px: a pega, o
     herói, o companheiro, os objetos sem rótulo e os mantimentos. Nenhum
     número passa da borda (o «132 ◆1» da foto, cortado, volta a ver-se).
   · MesaPuxada (307:805) — puxar ou tocar a pega: a folha de couro de 340
     sobe por cima da página, com as cartas grandes, a Bandeja, os objetos com
     rótulo e os mantimentos a 28. Véu; fecha com Esc, com um toque no véu ou
     arrastando para baixo; o foco fica preso dentro e volta à pega.

   MUDA A PORTA, NÃO A SALA: cada toque abre a mesma gaveta de antes. O que a
   tira esconde (o nome do herói, o rótulo dos objetos) fica no nome
   acessível e na mesa puxada — as duas perdas declaradas da TL 5.
   ============================================================ */
/* a letra da barra, do Figma (306:14, 306:38, 306:33, 306:59) — a TL 8 não a
   tabelou; é a do ecrã de antes, subida ao tamanho que a faixa única deixa */
const BARRA_LETRA = {
  lugar: { telefone: 19, mesa: 22 },
  hora: { telefone: 14, mesa: 15 },
  lado: { telefone: 12, mesa: 28 },
};

/* a seta que diz «isto abre para baixo» (a da casa, virada) */
function SetaDeAbrir({ aberta = false }) {
  return (
    <span aria-hidden="true" style={{ display: "inline-flex", flexShrink: 0, transform: `rotate(${aberta ? 90 : -90}deg)` }}>
      <IconeChevronEsq tamanho={12} cor={T.inkMeio} />
    </span>
  );
}

/* A BARRA DO MESTRE. `cena` é a linha da masmorra (o andar, a camada): na mesa
   vai por baixo do lugar; no telefone SUBSTITUI o nome do lugar (TL 5). `luz`
   («Dia») vai escrita na mesa e, no telefone, só no nome acessível (a vela já
   muda de forma com a hora). `clima` = { glifo, rotulo } ou null. A ameaça só
   nasce quando o sistema a dá — no telefone, só acima de zero. `emCena` é a
   ranhura do <EmCena>; `children` o que se posiciona contra a barra inteira
   (o sinal de guardado). */
export function BarraDoMestre({ telefone = false, lugar = "", cena = "", luz = "", hora = "", minuto = 0, clima = null, ameaca = null,
  prazo = null, quantosPrazos = 0, escondidoGrave = false, falaDaHora = "", tempoAberto = false, aoAbrirTempo,
  horizonteAberto = false, aoAbrirHorizonte, emCena = null, children }) {
  const B = telefone ? H.telefone.barra : H.mesa.barra;
  const fase = faseDoMinuto(minuto);
  const nAmeaca = Number(ameaca);
  const comAmeaca = ameaca != null && Number.isFinite(nAmeaca) && (!telefone || nAmeaca > 0);
  const nome = telefone && cena ? cena : lugar;
  const climaOk = clima && typeof clima === "object" && clima.glifo ? clima : null;
  const fala = falaDaHora || ["O tempo", luz, hora, climaOk && climaOk.rotulo].filter(Boolean).join(", ");
  const falaDoLugar = [lugar, cena].filter(Boolean).join(", ") + ". Abrir o horizonte.";
  const botao = { background: "transparent", border: "none", padding: 0, minHeight: ALVOS.piso, cursor: "pointer" };
  const horaEscrita = telefone ? hora : [luz, hora].filter(Boolean).join(" · ");
  return (
    <div className="relative flex items-center justify-between" data-barra-do-mestre={telefone ? "telefone" : "mesa"}
      style={{ height: B.alto, padding: `0 ${telefone ? BARRA_LETRA.lado.telefone : BARRA_LETRA.lado.mesa}px`, background: T.couro, borderBottom: `1px solid ${OURO.meio}`, gap: 8 }}>
      <style>{CSS_DA_VELA}</style>
      <div className="flex items-center min-w-0" style={{ gap: telefone ? 4 : 20 }}>
        <button type="button" onClick={aoAbrirHorizonte} aria-label={falaDoLugar} aria-expanded={!!horizonteAberto}
          className="tv-anel-foco flex items-center text-left min-w-0" style={{ ...botao, gap: 6 }}>
          <span className="flex flex-col min-w-0">
            {telefone ? null : <TituloDoPainel>Lugar</TituloDoPainel>}
            <span className="tv-display truncate" style={{ fontSize: telefone ? BARRA_LETRA.lugar.telefone : BARRA_LETRA.lugar.mesa, fontWeight: 600, color: T.ink, lineHeight: 1.1 }}>{nome}</span>
            {!telefone && cena ? <span className="tv-mono truncate" style={{ fontSize: TIPOS.maquina, color: T.inkDim, lineHeight: 1.2 }}>{cena}</span> : null}
          </span>
          <SetaDeAbrir aberta={horizonteAberto} />
        </button>
        {emCena}
      </div>
      <div className="flex items-center shrink-0" style={{ gap: telefone ? 8 : 40 }}>
        <button type="button" onClick={aoAbrirTempo} aria-label={fala} aria-expanded={!!tempoAberto} title="O tempo — esperar, acampar, os prazos"
          className="tv-anel-foco flex items-center text-left" style={{ ...botao, gap: 8, minWidth: ALVOS.piso, outlineColor: tempoAberto ? T.amber : undefined }}>
          <Vela fase={fase} alto={B.velaAlta} />
          <span className="flex flex-col">
            {telefone ? null : <TituloDoPainel>Hora</TituloDoPainel>}
            <span className="flex items-center" style={{ gap: 6 }}>
              <span className="tv-mono" style={{ fontSize: telefone ? BARRA_LETRA.hora.telefone : BARRA_LETRA.hora.mesa, color: T.ink, whiteSpace: "nowrap", lineHeight: 1.2 }}>{horaEscrita}</span>
              {climaOk ? <Glifo nome={climaOk.glifo} tamanho={16} cor={T.inkMeio} /> : null}
              {prazo ? <SeloDePrazo noites={prazo.noites} quantos={quantosPrazos} urgente={prazo.noites <= 1} escondidoGrave={escondidoGrave} /> : null}
            </span>
          </span>
        </button>
        {comAmeaca ? (
          <span className="flex flex-col" role="img" aria-label={`Ameaça, ${nAmeaca} de ${H.ameaca.pontos}`}>
            {telefone ? null : <TituloDoPainel>Ameaça</TituloDoPainel>}
            <span className="flex items-center tv-mono" style={{ gap: 6, fontSize: TIPOS.maquina }}>
              <PontosDaAmeaca n={nAmeaca} />
              {telefone ? null : <span style={{ color: T.inkMeio }}>{nAmeaca} de {H.ameaca.pontos}</span>}
            </span>
          </span>
        ) : null}
      </div>
      {children}
    </div>
  );
}

/* uma gema da tira: a da carta, com o número em mono negrito 12 (TL 4) */
function GemaDaTira({ cor, valor, rotulo, tam }) {
  return <GemaDaCarta cor={cor} valor={valor} rotulo={rotulo} tam={tam} letra={TIPOS.maquina} peso={700} />;
}

/* as gemas que a carta mostra, na ordem da carta (PV, PM, Destino) — até `teto` */
function gemasDe(ente, { comPM = true, destino = null, teto = TIRA.heroi.gemas } = {}) {
  if (!ente) return [];
  const lista = [{ rotulo: "PV", valor: Math.max(0, Number(ente.vida) || 0), cor: H.gemasDaCarta.PV }];
  if (comPM) lista.push({ rotulo: "PM", valor: Math.max(0, Number(ente.mana) || 0), cor: H.gemasDaCarta.PM });
  if (destino != null) lista.push({ rotulo: "Destino", valor: destino, cor: H.gemasDaCarta.Destino });
  return lista.slice(0, teto);
}

/* O HERÓI NA TIRA: retrato 44 (aro de ouro), o nível num disco de 18 no canto
   e as gemas empilhadas — um botão de 82 × 56 que abre a ficha. O nome sai da
   tira e fica no nome acessível (TL 5). */
function HeroiNaTira({ heroi, comPM = true, destino = null, aberta = false, novo = false, rotulo, aoAbrir }) {
  if (!heroi) return null;
  const T4 = TIRA.heroi;
  const vida = Math.max(0, Number(heroi.vida) || 0), vidaMax = Math.max(0, Number(heroi.vidaMax) || 0);
  let estado = "normal";
  try { estado = estadoDe(vida, vidaMax); } catch (e) { estado = "normal"; }
  const gemas = gemasDe(heroi, { comPM, destino });
  return (
    <button type="button" onClick={aoAbrir} aria-haspopup="dialog" aria-expanded={!!aberta} data-tira="heroi"
      aria-label={rotulo || [heroi.nome, `nível ${heroi.nivel || 1}`, ...gemas.map((g) => `${g.rotulo} ${g.valor}`)].join(", ")}
      className="tv-anel-foco shrink-0 flex items-center rounded-lg" style={{ background: "transparent", border: "none", padding: 0, gap: T4.entre, minHeight: TIRA.objeto.alvo.alto }}>
      <span className="relative inline-block shrink-0" style={{ width: T4.retrato, height: T4.retrato + 4 }}>
        <span style={{ position: "absolute", left: 0, top: 2 }}>
          <Retrato semente={heroi.semente || heroi.nome} ente={heroi} tamanho={T4.retrato} estado={estado} anel={OURO.meio} semCarta />
        </span>
        <span aria-hidden="true" className="tv-mono flex items-center justify-center" style={{
          position: "absolute", left: -4, bottom: 0, width: T4.nivel, height: T4.nivel, borderRadius: "50%",
          background: T.couroBaixo, border: `1px solid ${OURO.meio}`, color: OURO.claro, fontSize: TIPOS.piso, fontWeight: 700, lineHeight: 1,
        }}>{heroi.nivel || 1}</span>
        {novo && !aberta ? <span aria-hidden="true" style={{ position: "absolute", right: -4, top: -2, lineHeight: 0 }}><MarcaDaPorta estado="novo" /></span> : null}
      </span>
      <span className="flex flex-col" aria-hidden="true" style={{ gap: 2 }}>
        {gemas.map((g) => <GemaDaTira key={g.rotulo} cor={g.cor} valor={g.valor} rotulo={g.rotulo} tam={H.gema.mesa} />)}
      </span>
    </button>
  );
}

/* O COMPANHEIRO NA TIRA: retrato 34 (aro de bronze) e PV e PM numa linha */
function CompanheiroNaTira({ ente, aoAbrir }) {
  if (!ente) return null;
  const vida = Math.max(0, Number(ente.vida) || 0), vidaMax = Math.max(0, Number(ente.vidaMax) || 0);
  let estado = "normal";
  try { estado = estadoDe(vida, vidaMax); } catch (e) { estado = "normal"; }
  const gemas = gemasDe(ente, { comPM: (Number(ente.manaMax) || 0) > 0, teto: 2 });
  return (
    <button type="button" onClick={aoAbrir} data-tira="companheiro" aria-label={`${ente.nome}, ${vida} de ${vidaMax} PV`}
      className="tv-anel-foco shrink-0 flex flex-col items-center justify-center rounded-lg" style={{ background: "transparent", border: "none", padding: 0, gap: 3, minHeight: TIRA.objeto.alvo.alto, minWidth: ALVOS.piso }}>
      <Retrato semente={ente.semente || ente.nome} ente={ente} tamanho={TIRA.companheiro.retrato} estado={estado} anel={BRONZE.meio} semCarta />
      <span className="flex items-start" aria-hidden="true" style={{ gap: 4 }}>
        {gemas.map((g) => <GemaDaTira key={g.rotulo} cor={g.cor} valor={g.valor} rotulo={g.rotulo} tam={H.gema.telefone} />)}
      </span>
    </button>
  );
}

/* o objeto da lista que o App passa: { id, rotulo, legenda, ativo, novo, Glifo, aoTocar } */
const objetosValidos = (objetos) => (Array.isArray(objetos) ? objetos.filter((o) => o && o.id) : []);
const mantimentosValidos = (m) => (m && typeof m === "object" ? m : null);

/* A PEGA DA MESA: a barra de 36 × 4 no topo da tira (ou da mesa puxada). */
function TracoDaPega() {
  const P = TIRA.pega;
  return <span aria-hidden="true" style={{ display: "block", width: P.largura, height: P.alto, borderRadius: P.alto / 2, background: alfa(P.cor, P.alfa) }} />;
}

/* A TIRA DA MESA. A pega é um botão (abre a mesa inteira); arrastar para cima
   em qualquer ponto da tira também a abre (o limiar é um alvo, ALVOS.piso — o
   mesmo do arrastar que fecha a folha da ficha). O herói fica sempre à vista;
   o resto rola de lado se não couber (mais de um companheiro, o Códex, a
   Ascensão). `bandeja` é o nó da Bandeja que a mesa puxada mostra. */
export function TiraDaMesa({ heroi, grupo = [], comPMDoHeroi = true, destino = null, fichaAberta = false, fichaNova = false, rotuloDoHeroi,
  aoAbrirFicha, aoAbrirCompanheiro, objetos = [], mantimentos = null, bandeja = null }) {
  const [puxada, setPuxada] = React.useState(false);
  const pega = React.useRef(null);
  const toque = React.useRef(null);
  const lista = Array.isArray(grupo) ? grupo.filter(Boolean) : [];
  const objs = objetosValidos(objetos);
  const mant = mantimentosValidos(mantimentos);
  const abrir = () => setPuxada(true);
  /* o gesto: para cima, mais vertical que horizontal, ao menos um alvo */
  const aoBaixar = (e) => { try { toque.current = { x: e.clientX, y: e.clientY }; } catch { toque.current = null; } };
  const aoSoltar = (e) => {
    try {
      const t0 = toque.current; toque.current = null;
      if (!t0) return;
      const dy = t0.y - e.clientY, dx = Math.abs(e.clientX - t0.x);
      if (dy >= ALVOS.piso && dy > dx) abrir();
    } catch { /* a forma nunca custa o turno */ }
  };
  return (
    <div className="relative shrink-0" data-tira-da-mesa="" onPointerDown={aoBaixar} onPointerUp={aoSoltar}
      style={{ height: TIRA.alto, background: T.couro, borderTop: `1px solid ${OURO.meio}`, touchAction: "pan-x" }}>
      <button ref={pega} type="button" onClick={abrir} aria-haspopup="dialog" aria-expanded={puxada} aria-label="A mesa: as cartas, a Bandeja e os objetos"
        className="tv-anel-foco absolute flex justify-center" style={{ left: 0, right: 0, top: 0, height: TIRA.cima, padding: `${TIRA.pega.cima}px 0 0`, background: "transparent", border: "none", cursor: "grab", zIndex: 1 }}>
        <TracoDaPega />
      </button>
      <div className="absolute flex items-center" style={{ left: 0, right: 0, top: TIRA.cima, height: TIRA.objeto.alvo.alto, paddingLeft: TIRA.lado[0], paddingRight: TIRA.lado[1] }}>
        <HeroiNaTira heroi={heroi} comPM={comPMDoHeroi} destino={destino} aberta={fichaAberta} novo={fichaNova} rotulo={rotuloDoHeroi} aoAbrir={aoAbrirFicha} />
        {/* a fila mede 354 de 375 (TL 4): sem vão fixo, o que sobra reparte-se (justify-between) */}
        <div className="tv-scroll flex-1 min-w-0 flex items-center justify-between" style={{ overflowX: "auto", overflowY: "hidden" }}>
          {lista.map((c, i) => <CompanheiroNaTira key={(c.nome || "") + i} ente={c} aoAbrir={() => aoAbrirCompanheiro && aoAbrirCompanheiro(c.nome)} />)}
          {objs.length ? (
            <span className="flex items-start shrink-0">
              {objs.map((o) => <ObjetoDaMesa key={o.id} id={o.id} rotulo={o.rotulo} legenda={o.legenda} ativo={o.ativo} novo={o.novo} Glifo={o.Glifo} aoTocar={o.aoTocar} naTira />)}
            </span>
          ) : null}
          {mant ? <PrateleiraDosMantimentos dados={mant.dados} contagens={mant.contagens} aoAbrir={mant.aoAbrir} lugar="tira" /> : null}
        </div>
      </div>
      <MesaPuxada aberta={puxada} aoFechar={() => setPuxada(false)} devolverFocoA={pega}
        heroi={heroi} grupo={lista} comPMDoHeroi={comPMDoHeroi} destino={destino} fichaAberta={fichaAberta} fichaNova={fichaNova} rotuloDoHeroi={rotuloDoHeroi}
        aoAbrirFicha={aoAbrirFicha} aoAbrirCompanheiro={aoAbrirCompanheiro} objetos={objs} mantimentos={mant} bandeja={bandeja} />
    </div>
  );
}

/* os focáveis de dentro da folha, para o foco preso */
const FOCAVEIS = "button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])";

/* A MESA PUXADA. Só existe aberta. Em telas com documento vai num portal ao
   body (fixa, por cima de tudo); sem documento (a suíte, em Node) desenha-se
   ali mesmo. Ao fechar, o foco volta a `devolverFocoA` (a pega). */
export function MesaPuxada({ aberta = false, aoFechar, devolverFocoA = null, rotulo = "A mesa", heroi = null, grupo = [], comPMDoHeroi = true, destino = null,
  fichaAberta = false, fichaNova = false, rotuloDoHeroi, aoAbrirFicha, aoAbrirCompanheiro, objetos = [], mantimentos = null, bandeja = null }) {
  const folha = React.useRef(null);
  const arrasto = React.useRef(null);
  React.useEffect(() => {
    if (!aberta) return undefined;
    const devolver = devolverFocoA;
    try { const f = folha.current && folha.current.querySelector(FOCAVEIS); if (f) f.focus(); } catch { /* sem foco, sem custo */ }
    return () => { try { if (devolver && devolver.current) devolver.current.focus(); } catch { /* idem */ } };
  }, [aberta]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!aberta) return null;
  const fechar = () => { try { if (aoFechar) aoFechar(); } catch { /* a forma nunca custa o turno */ } };
  const aoTeclar = (e) => {
    if (e.key === "Escape") { e.stopPropagation(); fechar(); return; }
    if (e.key !== "Tab" || !folha.current) return;
    const todos = Array.from(folha.current.querySelectorAll(FOCAVEIS));
    if (!todos.length) return;
    const primeiro = todos[0], ultimo = todos[todos.length - 1];
    if (e.shiftKey && document.activeElement === primeiro) { e.preventDefault(); ultimo.focus(); }
    else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primeiro.focus(); }
  };
  const aoBaixar = (e) => { arrasto.current = e.clientY; };
  const aoSoltar = (e) => { const y0 = arrasto.current; arrasto.current = null; if (y0 != null && e.clientY - y0 >= ALVOS.piso) fechar(); };
  const P = TIRA.puxada;
  const esc = H.telefone.cartas;   /* puxada.cartas = "telefone": as cartas grandes do telefone */
  const lista = Array.isArray(grupo) ? grupo.filter(Boolean) : [];
  const objs = objetosValidos(objetos);
  const mant = mantimentosValidos(mantimentos);
  const conteudo = (
    <div onKeyDown={aoTeclar} data-mesa-puxada="">
      <div aria-hidden="true" className="tv-veu-da-mesa" onClick={fechar} style={{ position: "fixed", inset: 0, background: alfa(SOMBRA, P.veu), zIndex: 60 }} />
      <div ref={folha} role="dialog" aria-modal="true" aria-label={rotulo} className="tv-mesa-sobe" onPointerDown={aoBaixar} onPointerUp={aoSoltar}
        style={{ position: "fixed", left: 0, right: 0, bottom: 0, height: P.alto, zIndex: 61, background: T.couro, border: `1px solid ${OURO.meio}`, borderBottom: "none",
          borderTopLeftRadius: P.raio, borderTopRightRadius: P.raio, overflow: "hidden", display: "flex", flexDirection: "column", gap: 12, padding: "0 16px 16px" }}>
        <button type="button" onClick={fechar} aria-label="Fechar a mesa" className="tv-anel-foco flex justify-center shrink-0"
          style={{ minHeight: TIRA.cima * 2, paddingTop: TIRA.pega.cima, background: "transparent", border: "none", cursor: "grab" }}>
          <TracoDaPega />
        </button>
        <div className="flex items-start" style={{ gap: 8 }}>
          <span className="flex items-start shrink-0" style={{ gap: 8 }}>
            <CartaDoGrupo ente={heroi} heroi escala={esc.heroi} telefone comPM={comPMDoHeroi} destino={destino} aberta={fichaAberta} novo={fichaNova} aoAbrir={aoAbrirFicha} rotulo={rotuloDoHeroi} />
            {lista.map((c, i) => (
              <CartaDoGrupo key={(c.nome || "") + i} ente={c} escala={esc.companheiro} telefone comPM={(Number(c.manaMax) || 0) > 0}
                aoAbrir={() => aoAbrirCompanheiro && aoAbrirCompanheiro(c.nome)} rotulo={`${c.nome}, ${c.vida || 0} de ${c.vidaMax || 0} PV`} />
            ))}
          </span>
          {bandeja ? <div className="flex-1 min-w-0">{bandeja}</div> : null}
        </div>
        <div className="flex items-center" style={{ gap: 8 }}>
          {objs.map((o) => <ObjetoDaMesa key={o.id} id={o.id} rotulo={o.rotulo} legenda={o.legenda} ativo={o.ativo} novo={o.novo} Glifo={o.Glifo} aoTocar={o.aoTocar} escala={P.objetos} />)}
          {mant ? <PrateleiraDosMantimentos dados={mant.dados} contagens={mant.contagens} aoAbrir={mant.aoAbrir} lugar="puxada" /> : null}
        </div>
      </div>
    </div>
  );
  return typeof document !== "undefined" && document.body ? createPortal(conteudo, document.body) : conteudo;
}
