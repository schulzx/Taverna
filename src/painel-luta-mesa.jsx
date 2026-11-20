/* ============================================================
   A LUTA NA MESA, AS PEÇAS DE §10 (F4 · «10 · As lacunas fechadas»,
   19/11/2026) — a mão de oito cartas com a linha do dado, a jogada
   («como?» + «Agir»), a coluna direita em papel (a fala do Mestre, «nesta
   rodada, eles vão», o alvo com o golpe por extenso) e a coluna do grupo com
   «o que resta na vez».

   As pranchas: mente/figma/F4-luta-a-mesa-inteira-1440.png (10a) e
   F4-luta-as-pecas.png (10b). As medidas, as cores e as palavras moram em
   luta-na-mesa.js (MAO_DE_ACOES, A_JOGADA, MESA_DA_LUTA, O_QUE_RESTA_NA_VEZ),
   e as contas — a linha do dado, o veredito do «Agir», as intenções
   agrupadas — são funções puras de lá, provadas em Node
   (testes/teste-luta-na-mesa.mjs). Aqui só se pinta; quem monta a tela é
   painel-batalha.jsx (TelaDeBatalha), que decide o que cada toque faz.

   As regras que valem aqui como na casa toda: nenhum componente nasce dentro
   de um render; a sombra das peças tocáveis é `filter`, nunca a sombra de
   caixa inline (o anel de foco da folha é box-shadow e o inline apagá-lo-ia);
   com movimento reduzido nada desliza.
   ============================================================ */
import React from "react";
import { T, alfa, SOMBRA_DA_MESA } from "./estilo.js";
import { Glifo, PipDoRecurso, Retrato } from "./ui.jsx";
import { CartaDePe } from "./pecas-da-mesa.jsx";
import { letraDaMesa } from "./mesa-do-mestre.js";
import { retratoDe } from "./retratos.js";
import { sementeDe, estadoDe } from "./semente.js";
import { golpePorExtenso } from "./batalha-na-tela.js";
import { metrosTxt } from "./grid.js";
import { MAO_DE_ACOES as MA, A_JOGADA as AJ, MESA_DA_LUTA as ML, O_QUE_RESTA_NA_VEZ as OR } from "./luta-na-mesa.js";

const movimentoParado = () => {
  try { return !!(typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches); }
  catch { return false; }
};
/* a sombra de uma peça como `filter` (drop-shadow), a partir da escala das
   três sombras da mesa: uma camada só, que é o que o filtro aguenta barato */
const SOMBRA_COMO_FILTRO = {
  peca: `drop-shadow(0 2px 3px ${alfa(T.veuDaNoite, 0.5)})`,
  pousado: `drop-shadow(0 4px 6px ${alfa(T.veuDaNoite, 0.45)})`,
  erguido: `drop-shadow(0 10px 12px ${alfa(T.veuDaNoite, 0.5)})`,
};
/* o glifo na carta de osso e no papel: a tinta escura da casa que a varredura
   dos glifos aceita (onAccent, #1E1207 — a mesma família da tinta do
   pergaminho, 15 : 1 sobre o osso) */
const TINTA_NO_OSSO = T.onAccent;
const NUMERAL = ["", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito"];
const numeral = (n) => NUMERAL[n] || String(n);

/* o retrato pintado de alguém (a carta), ou nada — quem pede decide o resto */
function pinturaDe(ente) {
  try { const r = retratoDe(ente, null); return r && r.arquivo ? r.arquivo : null; } catch { return null; }
}

/* ============================================================
   O PAPEL — a folha onde a coluna direita escreve
   ============================================================ */
function Papel({ rotulo, altura = null, inclina = 0, children, rotuloAcessivel = "", ...resto }) {
  const P = ML.papel;
  return (
    <section aria-label={rotuloAcessivel || rotulo || undefined} className="flex flex-col shrink-0 min-w-0"
      style={{ width: "100%", minHeight: altura || undefined, padding: P.respiro, gap: 8, borderRadius: P.raio, background: T[P.chao],
        border: `1px solid ${T[P.borda]}`, boxShadow: SOMBRA_DA_MESA[P.sombra], transform: inclina ? `rotate(${inclina}deg)` : undefined, color: T[P.tinta] }} {...resto}>
      {rotulo ? <span style={{ color: T[P.rotulo], ...letraDaMesa("rotulo") }}>{rotulo}</span> : null}
      {children}
    </section>
  );
}

/* A FALA DO MESTRE (300 × 128, só a fala, quatro linhas; duas quando a
   coluna aperta). O corte de verdade é o do módulo, pelo começo; o clamp é
   o cinto. A fala inteira fica no `title`. */
export function FalaDoMestreNoPapel({ texto = "", inteiro = "", carregando = false, apertada = false }) {
  const F = ML.fala;
  const linhas = apertada ? F.linhasApertadas : F.linhas;
  const letra = letraDaMesa("notaDoMestre");
  return (
    <Papel rotulo={F.rotulo} altura={apertada ? F.alturaApertada : F.altura}>
      <p className="m-0" aria-live="polite" title={inteiro || undefined}
        style={{ ...letra, color: T[ML.papel.tinta], display: "-webkit-box", WebkitLineClamp: linhas, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
        {carregando && !texto ? "" : texto}
      </p>
    </Papel>
  );
}

/* «NESTA RODADA, ELES VÃO» (−1°): uma linha por grupo de iguais — os rostos
   sobrepostos, «3× Rato Gigante» e «2–10 cada → Saoirse» — e a soma do que
   chega se todos acertarem. `linhas`/`noHeroi`: linhasDeElesVao. */
export function ElesVaoNoPapel({ linhas = [], noHeroi = null, inimigos = [], realce = null, aoRealcar = null }) {
  const E = ML.elesVao, P = ML.papel;
  if (!linhas.length) return null;
  const enteDe = (nome) => inimigos.find((e) => e && e.nome === nome) || { nome };
  return (
    <Papel rotulo={E.rotulo} inclina={movimentoParado() ? 0 : E.inclina}>
      {linhas.map((l, i) => (
        <div key={`${l.especie}-${i}`} className="flex items-center min-w-0" style={{ gap: 10 }}
          onMouseEnter={aoRealcar ? () => aoRealcar(l.nomes[0]) : undefined} onMouseLeave={aoRealcar ? () => aoRealcar(null) : undefined}>
          <span className="flex shrink-0" aria-hidden="true">
            {l.nomes.slice(0, 3).map((n, k) => (
              <span key={n} style={{ marginLeft: k ? -E.sobrepoe : 0, borderRadius: "50%", outline: realce === n ? `2px solid ${T.amber}` : "none" }}>
                <Retrato semente={sementeDe(enteDe(n))} ente={enteDe(n)} inimigo tamanho={E.rosto} anel={T.lacre} semCarta estado={estadoDe(enteDe(n).vida, enteDe(n).vidaMax, true)} />
              </span>
            ))}
          </span>
          <span className="flex flex-col min-w-0">
            <span className="truncate" style={{ ...letraDaMesa("proposta"), color: T[P.tinta] }}>{l.quantos > 1 ? `${l.quantos}× ` : ""}{l.especie}</span>
            <span className="truncate" style={{ ...letraDaMesa("servico"), fontWeight: 700, color: T[P.perigo] }}>
              {l.dano ? `${l.dano.min === l.dano.max ? l.dano.min : `${l.dano.min}–${l.dano.max}`}${l.quantos > 1 ? " cada" : ""}` : l.tipo}
              {l.alvo ? ` → ${l.alvo}` : ""}
            </span>
          </span>
        </div>
      ))}
      {noHeroi ? (
        <span style={{ ...letraDaMesa("notaDoMestre"), color: T[P.tintaDim] }}>
          se os {numeral(noHeroi.quantos)} acertarem, de {noHeroi.min} a {noHeroi.max}
        </span>
      ) : null}
    </Papel>
  );
}

/* AS CONTAS DE PV do alvo: dez, em lacre, as que faltam apagadas */
function ContasDoPV({ vida, vidaMax }) {
  const n = ML.alvo.contas;
  const v = Math.max(0, Number(vida) || 0), m = Math.max(1, Number(vidaMax) || 1);
  const acesas = Math.max(0, Math.min(n, Math.ceil((v / m) * n)));
  return (
    <span className="inline-flex items-center" aria-hidden="true" style={{ gap: 2 }}>
      {Array.from({ length: n }, (_, i) => <span key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: i < acesas ? T.lacre : alfa(T.lacre, 0.25) }} />)}
    </span>
  );
}

/* O ALVO (300 × 222; 128 com duas entradas em «eles vão»): a carta 60 × 84,
   o nome, as contas de PV, a distância e a defesa; o fio; «SEU GOLPE», a
   chance grande, o d20 contra a defesa, a face que basta e o dano com o
   abate. Tudo de golpePorExtenso (a MESMA previsão que a carta de ação lê). */
export function OAlvoNoPapel({ previsao = null, ente = null, distanciaM = null, aoAlcance = null, curto = false }) {
  const A = ML.alvo, P = ML.papel;
  const g = (() => { try { return golpePorExtenso(previsao); } catch { return null; } })();
  if (!g || !ente) return null;
  const pintura = pinturaDe(ente);
  const vida = Math.max(0, Number(ente.vida) || 0), vidaMax = Math.max(0, Number(ente.vidaMax) || 0);
  const linhaFina = { ...letraDaMesa("servico"), color: T[P.tintaDim] };
  return (
    <Papel rotulo={A.rotulo} altura={curto ? A.alturaCurta : A.altura} rotuloAcessivel={`O alvo: ${ente.nome}`}>
      <div className="flex min-w-0" style={{ gap: 12 }}>
        <span className="shrink-0 overflow-hidden" style={{ width: A.carta.largura, height: A.carta.altura, borderRadius: 4, border: `2px solid ${T.lacre}`, background: T.couroBaixo, boxShadow: SOMBRA_DA_MESA.peca }}>
          {pintura
            ? <img src={pintura} alt="" draggable="false" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            : <span className="flex items-center justify-center w-full h-full"><Retrato semente={sementeDe(ente)} ente={ente} inimigo tamanho={A.carta.largura - 8} anel={T.lacre} semCarta /></span>}
        </span>
        <span className="flex flex-col min-w-0" style={{ gap: 4 }}>
          <span className="truncate" style={{ ...letraDaMesa("nome"), color: T[P.tinta] }}>{ente.nome}</span>
          <span className="flex items-center" style={{ gap: 6 }}>
            <ContasDoPV vida={vida} vidaMax={vidaMax} />
            <span style={{ ...letraDaMesa("servico"), fontWeight: 700, color: T[P.tinta] }}>{vida} de {vidaMax}</span>
          </span>
          {distanciaM != null && <span style={linhaFina}>a {metrosTxt(distanciaM)} m{aoAlcance === true ? " · ao alcance" : aoAlcance === false ? " · fora do alcance" : ""}</span>}
          {g.defesa != null && <span style={linhaFina}>defesa {g.defesa}</span>}
        </span>
      </div>
      {!curto && (
        <>
          <span aria-hidden="true" style={{ height: 1, background: alfa(T[P.tinta], 0.25), margin: "2px 0" }} />
          <span style={{ color: T[P.rotulo], ...letraDaMesa("rotulo") }}>{A.golpe}</span>
          <div className="flex items-start min-w-0" style={{ gap: 12 }}>
            {g.chance != null && <span className="tv-body shrink-0" style={{ fontSize: A.chance, fontWeight: 700, lineHeight: 1.1, color: T[P.tinta] }}>{g.chance}{" "}%</span>}
            <span className="flex flex-col min-w-0">
              {g.bonus != null && g.defesa != null && <span style={{ ...letraDaMesa("servico"), color: T[P.tinta] }}>d20 {g.bonus >= 0 ? "+" : "−"} {Math.abs(g.bonus)} contra a defesa {g.defesa}</span>}
              {g.faceMinima != null && <span style={linhaFina}>{g.faceMinima < g.criticoEm ? `${g.faceMinima} ou mais no dado` : "só o crítico acerta"} · {g.criticoEm >= 20 ? "o 20 é crítico" : `${g.criticoEm}–20 é crítico`}</span>}
            </span>
          </div>
          {(g.dano || g.abate != null) && (
            <span style={{ ...letraDaMesa("servico"), fontSize: 14, fontWeight: 700, color: T[P.brasa] }}>
              {[g.dano ? `dano ${g.dano.texto}` : null, g.abate != null ? `abate em ${g.abate} %` : null].filter(Boolean).join(" · ")}
            </span>
          )}
          {g.golpesLivres.map((q) => (
            <span key={q.nome} style={{ ...letraDaMesa("servico"), color: T[P.perigo] }}>{q.nome} tem um golpe livre{q.dano ? ` (${q.dano})` : ""}</span>
          ))}
        </>
      )}
    </Papel>
  );
}

/* ============================================================
   A CARTA DE AÇÃO (§10 «MAO_DE_ACOES») — glifo, nome, a linha do dado e o
   custo, nas alturas da tabela. Repouso · armada (sobe 8) · impedida (sem
   chão, a razão na linha do dado) · foco (o anel da folha).
   ============================================================ */
function LinhaDoDado({ linha, tam, celular, media = false, impedida, razao }) {
  const L = MA.linha;
  const LL = celular ? L.celular : media ? L.media : null;
  const corpo = LL ? LL.corpo : L.corpo;
  const base = { position: "absolute", left: 0, right: 0, top: tam.yDado, height: corpo + 6, display: "flex", alignItems: "center" };
  if (impedida) {
    /* F4d: a prancha 10b («impedida · a razão») não tem custo — a razão usa o
       lugar dele e quebra em duas linhas, em vez de «ninguém ao s…» */
    return <span style={{ ...base, height: "auto", justifyContent: "center", ...letraDaMesa("servico"), textTransform: "none", color: T.ink, padding: "0 4px", textAlign: "center", lineHeight: 1.2,
      display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{razao}</span>;
  }
  if (!linha || linha.forma === "semDado") {
    return <span style={{ ...base, justifyContent: "center", ...letraDaMesa("servico"), textTransform: "none", color: T[L.corSemDado] }}>{(linha && linha.texto) || L.semDado}</span>;
  }
  if (linha.forma === "dano") {
    return (
      <span style={{ ...base, justifyContent: "center", gap: 4 }}>
        <Glifo nome={L.dano.glifo} tamanho={L.dano.glifoPx} cor={T[L.dano.cor]} />
        <span className="tv-body" style={{ fontSize: L.dano.corpo, fontWeight: 700, color: T[L.dano.cor] }}>{linha.texto}</span>
      </span>
    );
  }
  const d20 = LL ? LL.d20 : L.d20;
  if (linha.forma === "chance") {
    const xd = LL ? LL.xD20 : L.xD20, xn = LL ? LL.xNumero : L.xNumero;
    return (
      <span style={base}>
        <span style={{ position: "absolute", left: xd, top: (corpo + 6 - d20) / 2, lineHeight: 0 }}><Glifo nome="dado" tamanho={d20} cor={TINTA_NO_OSSO} /></span>
        {linha.faceMinima != null && <span className="tv-body" style={{ position: "absolute", left: xn, fontSize: corpo, fontWeight: 700, color: T.tintaDoPergaminho }}>{linha.faceMinima}+</span>}
        <span className="tv-body" style={{ position: "absolute", right: L.recuo, fontSize: corpo, fontWeight: 700, color: T.tintaDoPergaminho, whiteSpace: "nowrap" }}>{linha.chance}</span>
      </span>
    );
  }
  return (
    <span style={{ ...base, justifyContent: "center", gap: 4 }}>
      <Glifo nome="dado" tamanho={d20} cor={TINTA_NO_OSSO} />
      <span className="tv-body" style={{ fontSize: corpo, fontWeight: 700, color: T.tintaDoPergaminho }}>{linha.texto}</span>
    </span>
  );
}

/* F4d: «até 9 m» quebrava entre o número e a unidade («até 9 / m»): o espaço
   entre os dois vira o que não quebra */
const semQuebraNaUnidade = (x) => String(x || "").replace(/(\d) (m|PM|PV)\b/g, "$1\u00a0$2");

export function CartaDeAcao({ id, rotulo, tamanho = "mesa", armada = false, impedida = false, razao = "", linha = null, custo = "", aoTocar, aoApontar = null, reduzido = false }) {
  const tam = MA.tamanhos[tamanho] || MA.tamanhos.mesa;
  const celular = tamanho === "celular";
  const C = { chao: T.ossoLume, chaoArmada: T.osso, borda: T.tintaDoPergaminhoDim, bordaArmada: T.tintaDoPergaminho };
  const sobe = armada && !celular && !reduzido ? MA.armar.sobe : 0;
  const falado = [rotulo, impedida ? razao : linha ? linha.falado : "", custo].filter(Boolean).join(", ");
  return (
    <button type="button" data-carta={id} onClick={aoTocar}
      onMouseEnter={aoApontar ? () => aoApontar(id) : undefined} onMouseLeave={aoApontar ? () => aoApontar(null) : undefined}
      aria-pressed={armada} aria-disabled={impedida || undefined} aria-label={falado}
      className="tv-anel-foco shrink-0"
      style={{ position: "relative", width: celular ? "100%" : tam.largura, height: tam.altura, minWidth: 0, padding: 0, borderRadius: 6, textAlign: "center",
        background: impedida ? "transparent" : armada ? C.chaoArmada : C.chao,
        border: impedida ? `1px dashed ${T.inkMeio}` : armada ? `2px solid ${C.bordaArmada}` : `1px solid ${C.borda}`,
        filter: impedida ? undefined : SOMBRA_COMO_FILTRO[armada ? "erguido" : "peca"],
        transform: sobe ? `translateY(-${sobe}px)` : undefined,
        transition: reduzido ? "none" : `transform ${MA.armar.ms}ms ease-out`, cursor: "pointer" }}>
      {tam.glifo > 0 && (
        <span aria-hidden="true" style={{ position: "absolute", left: 0, right: 0, top: tam.yGlifo, display: "flex", justifyContent: "center", lineHeight: 0 }}>
          <Glifo nome={MA.glifo[id] || "dado"} tamanho={tam.glifo} cor={impedida ? T.inkMeio : TINTA_NO_OSSO} />
        </span>
      )}
      <span aria-hidden="true" className="truncate" style={{ position: "absolute", left: celular ? 2 : 4, right: celular ? 2 : 4, top: tam.yNome, ...letraDaMesa("nome"), ...(tamanho === "media" || celular ? { letterSpacing: 0 } : null), color: impedida ? T.ink : T.tintaDoPergaminho }}>{rotulo}</span>
      <span aria-hidden="true"><LinhaDoDado linha={linha} tam={tam} celular={celular} media={tamanho === "media"} impedida={impedida} razao={razao} /></span>
      {custo && !impedida && (
        <span aria-hidden="true" style={{ position: "absolute", left: 4, right: 4, top: tam.yCusto, ...letraDaMesa("servico"), textTransform: "none", color: impedida ? T.inkMeio : T.brasaNoPergaminho,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{semQuebraNaUnidade(custo)}</span>
      )}
    </button>
  );
}

/* A MÃO: uma fila só de oito (ou a grelha 2 × 4 do celular). `cartas`: as
   oito, já com o estado de cada uma (quem as monta é a tela). */
export function MaoDeAcoes({ cartas = [], tamanho = "mesa", aoTocar, aoApontar = null, entre = MA.entre }) {
  const celular = tamanho === "celular";
  const reduzido = React.useMemo(movimentoParado, []);
  return (
    <div role="group" aria-label="Sua mão" className={celular ? "grid w-full" : "flex items-end min-w-0"}
      style={celular ? { gridTemplateColumns: `repeat(${MA.tamanhos.celular.colunas}, minmax(0, 1fr))`, gap: MA.tamanhos.celular.entre }
        : { gap: entre, paddingTop: MA.armar.sobe }}>
      {cartas.map((c) => (
        <CartaDeAcao key={c.id} {...c} tamanho={tamanho} reduzido={reduzido} aoTocar={() => aoTocar(c)} aoApontar={aoApontar} />
      ))}
    </div>
  );
}

/* ============================================================
   A JOGADA (§10 «A_JOGADA») — a linha da pena e o «Agir», juntos.
   `veredito`: vereditoDoAgir — pronta repete o veredito; impedida diz o que
   falta. Enter na pena age (quando pronta). `gaveta`: o ✦ das habilidades,
   que a prancha não pôs em lugar nenhum e continua a existir (no canto da
   pena, à direita).
   ============================================================ */
export function AJogada({ tamanho = "mesa", entrada = "", aoEscrever, veredito = null, aoAgir, desligada = false, convite = "", gaveta = null }) {
  const celular = tamanho === "celular";
  const D = celular ? null : (AJ[tamanho] || AJ.mesa);
  const P = AJ.pena, A = AJ.agir;
  const [foco, setFoco] = React.useState(false);
  const reduzido = React.useMemo(movimentoParado, []);
  const pronta = !!(veredito && veredito.pronta);
  const altoPena = celular ? AJ.celular.altura : D.pena;
  const altoAgir = celular ? AJ.celular.altura : D.agir;
  const pena = (
    <label className="flex items-center min-w-0" style={{ position: "relative", height: altoPena, flex: celular ? "1 1 0" : undefined, width: celular ? undefined : "100%",
      padding: `0 8px 0 ${P.xGlifo}px`, gap: P.xTexto - P.xGlifo - P.glifoPx, borderRadius: P.raio, background: T[P.chao],
      border: foco ? `${P.focoPx}px solid ${T[P.foco]}` : `1px solid ${T[P.borda]}`, boxShadow: SOMBRA_DA_MESA[P.sombra] }}>
      <Glifo nome={P.glifo} tamanho={P.glifoPx} cor={T[P.corGlifo]} />
      <input value={entrada || ""} onChange={(e) => aoEscrever && aoEscrever(e.target.value)}
        onFocus={() => setFoco(true)} onBlur={() => setFoco(false)}
        onKeyDown={(e) => { if (e.key === "Enter" && pronta && aoAgir) { e.preventDefault(); aoAgir(); } }}
        placeholder={convite || (celular ? P.conviteCurto : P.convite)} disabled={desligada} aria-label="Como você faz isso"
        className="tv-entrada-pena flex-1 min-w-0 bg-transparent" style={{ ...letraDaMesa("notaDoMestre"), fontStyle: entrada ? "normal" : "italic", color: T[P.corTexto], outline: "none", border: 0 }} />
      {gaveta}
    </label>
  );
  const agir = (
    <button type="button" onClick={() => { if (aoAgir) aoAgir(); }} aria-disabled={!pronta || undefined}
      aria-label={`${A.rotulo}${veredito && veredito.diz ? `: ${veredito.diz}` : ""}`}
      className="tv-anel-foco tv-agir-da-jogada flex flex-col items-center justify-center shrink-0 min-w-0"
      style={{ height: altoAgir, width: celular ? AJ.celular.agir : "100%", padding: "0 8px", borderRadius: A.raio,
        background: pronta ? T[A.pronta.chao] : "transparent",
        border: pronta ? `1px solid ${T[A.pronta.chao]}` : `${A.impedida.px}px dashed ${T[A.impedida.borda]}`,
        filter: pronta ? SOMBRA_COMO_FILTRO[A.pronta.sombra] : undefined,
        transition: reduzido ? "none" : `background-color ${A.transicaoMs}ms ease, opacity ${A.transicaoMs}ms ease`, cursor: pronta ? "pointer" : "default" }}>
      <span style={{ ...letraDaMesa("contagem"), color: pronta ? T[A.pronta.letra] : T[A.impedida.rotulo] }}>{A.rotulo}</span>
      {veredito && veredito.diz ? (
        /* F4d · B2: no celular o «Agir» tem 124 de largo e o veredito («Atacar ·
           Goblin · 55 %») perdia a chance nas reticências — quebra em duas linhas */
        <span className={celular ? undefined : "truncate"} style={{ maxWidth: "100%", ...letraDaMesa("servico"), textTransform: "none", color: pronta ? T[A.pronta.letra] : T[A.impedida.razao],
          ...(celular ? { textAlign: "center", lineHeight: 1.15, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" } : null) }}>{veredito.diz}</span>
      ) : null}
    </button>
  );
  if (celular) {
    return <div className="flex items-stretch w-full" style={{ gap: AJ.celular.entre }}>{pena}{agir}</div>;
  }
  return <div className="flex flex-col shrink-0" style={{ width: D.largura, gap: D.entre }}>{pena}{agir}</div>;
}

/* ============================================================
   A COLUNA DO GRUPO (§10) — «O GRUPO», a carta de pé de cada um (a do herói
   primeiro) e, sob a carta de quem tem a vez, «o que resta na vez».
   ============================================================ */
/* O QUE RESTA NA VEZ: quatro linhas de 24 — ● ação, ▲ bônus, ◆ reação, as
   casas do passo. `vez`: economiaDaVez (vez-na-mesa.js). */
export function OQueRestaNaVez({ vez = null }) {
  const v = vez && typeof vez === "object" && vez.acao ? vez : null;
  if (!v) return null;
  const linha = { height: OR.linha, display: "flex", alignItems: "center", gap: 8, ...letraDaMesa("servico"), textTransform: "none", color: T.inkMeio };
  const estado = (livre) => (livre ? "livre" : "gasto");
  const m = Math.max(0, Number(v.movimento && v.movimento.restaM) || 0), mt = Math.max(0, Number(v.movimento && v.movimento.totalM) || 0);
  const acesas = mt > 0 ? Math.round((m / mt) * OR.casas) : 0;
  const n = (x) => String(Math.round(x * 10) / 10).replace(".", ",");
  const itens = [
    { k: "acao", livre: v.acao.resta > 0 },
    v.bonus.tem ? { k: "bonus", livre: v.bonus.resta > 0 } : null,
    { k: "reacao", livre: !!v.reacao.resta },
  ].filter(Boolean);
  const leitura = [...itens.map((i) => `${OR.palavra[i.k]} ${i.livre ? OR.livre : OR.gasta}`), mt > 0 ? `${OR.palavra.movimento} ${n(m)} de ${n(mt)} m` : null].filter(Boolean).join(", ");
  return (
    <div role="group" aria-label={leitura} className="flex flex-col" style={{ width: "100%" }}>
      {itens.map((i) => (
        <span key={i.k} aria-hidden="true" style={linha}>
          <PipDoRecurso recurso={i.k} estado={estado(i.livre)} tamanho={20} />
          <span style={{ color: i.livre ? T.inkMeio : T.inkDim }}>{OR.palavra[i.k]} · {i.livre ? OR.livre : OR.gasta}</span>
        </span>
      ))}
      {mt > 0 && (
        <span aria-hidden="true" className="flex flex-col" style={{ gap: 4, marginTop: 4 }}>
          <span className="flex" style={{ gap: 4 }}>
            {Array.from({ length: OR.casas }, (_, i) => <span key={i} style={{ width: OR.casa, height: OR.casa, borderRadius: 2, background: i < acesas ? T.ossoLume : "transparent", border: `1px solid ${i < acesas ? T.ossoLume : T.lineStrong}` }} />)}
          </span>
          <span style={{ ...letraDaMesa("servico"), textTransform: "none", color: T.inkMeio }}>{OR.palavra.movimento} · {n(m)} de {n(mt)} m</span>
        </span>
      )}
    </div>
  );
}

const legendaDe = (e) => [e.classe, e.nivel ? `nível ${e.nivel}` : ""].filter(Boolean).join(" · ");
export function ColunaDoGrupoNaLuta({ heroi = null, grupo = [], vez = null, aVez = true, aviso = null, selos = null }) {
  const G = ML.grupo;
  if (!heroi) return null;
  const cartaDe = (e, ehHeroi) => ({ nome: e.nome || "", legenda: legendaDe(e), retrato: pinturaDe(e),
    vida: Math.max(0, Number(e.vida) || 0), vidaMax: Math.max(0, Number(e.vidaMax) || 0),
    mana: Math.max(0, Number(e.mana) || 0), manaMax: Math.max(0, Number(e.manaMax) || 0), vez: !!ehHeroi && aVez });
  return (
    <section aria-label={G.rotulo} className="flex flex-col min-h-0 overflow-y-auto tv-scroll tv-sem-barra" style={{ width: G.largura, gap: 12 }}>
      <span style={{ color: T.inkMeio, ...letraDaMesa("rotulo") }}>{G.rotulo}</span>
      <CartaDePe {...cartaDe(heroi, true)} />
      {aviso}
      {aVez && <OQueRestaNaVez vez={vez} />}
      {selos}
      {(Array.isArray(grupo) ? grupo : []).filter(Boolean).map((g, i) => <CartaDePe key={`${g.nome}-${i}`} {...cartaDe(g, false)} />)}
    </section>
  );
}

/* A PLAQUETA DA RODADA: latão, «RODADA 1», no canto do tapete */
export function PlaquetaDaRodada({ rodada = 1 }) {
  return (
    <span className="inline-flex items-center shrink-0" style={{ padding: "2px 8px", borderRadius: 2, background: T[ML.rodada.chao], color: T[ML.rodada.letra], boxShadow: SOMBRA_DA_MESA.peca, ...letraDaMesa("rotulo") }}>
      Rodada {rodada}
    </span>
  );
}


/* ============================================================
   O MESTRE CALOU NO MEIO DA LUTA (F4c, 19/11) — o cartão da falha, que só
   existia na página: a frase do silêncio, a linha do turno e «Tentar de
   novo» quando insistir resolve. Sem ele, a luta jogada travava com a mão
   morta e o aviso só no registo.
   ============================================================ */
export function AvisoDoSilencio({ silencio = null, aoTentarDeNovo = null }) {
  if (!silencio) return null;
  const P = ML.papel;
  return (
    <section role="alert" aria-label="O Mestre não contou" className="flex flex-col shrink-0 min-w-0"
      style={{ width: "100%", padding: P.respiro, gap: 8, borderRadius: P.raio, background: T.ossoLume, border: `1px solid ${T.lacre}`, boxShadow: SOMBRA_DA_MESA[P.sombra] }}>
      <span style={{ ...letraDaMesa("notaDoMestre"), color: T[P.perigo] }}>{silencio.casa || "O Mestre não contou o que você fez."}</span>
      {silencio.linha ? <span style={{ ...letraDaMesa("servico"), textTransform: "none", color: T[P.tinta] }}>{silencio.linha}</span> : null}
      {silencio.podeTentar && aoTentarDeNovo ? (
        <button type="button" data-tentar-de-novo="" onClick={aoTentarDeNovo} className="tv-anel-foco self-start"
          style={{ minHeight: 44, padding: "0 16px", borderRadius: AJ.agir.raio, background: T.amber, color: T.onAccent, border: 0, filter: SOMBRA_COMO_FILTRO.peca, ...letraDaMesa("contagem") }}>
          Tentar de novo
        </button>
      ) : null}
    </section>
  );
}
