/* ============================================================
   A BANDEJA (04/11/2026) — src/painel-bandeja.jsx

   A faixa da mesa onde os dados pousam, entre a página e o campo. A pessoa:
   «um rpg precisa de constantes rolagens… além de que são diferentes dados
   jogados». Cada dado tem a forma dele e a cor do papel que tem no lance.

   A FORMA É DO `desenho` (Mesa C, Figma `243:46` · `243:72` · `244:613`;
   formas.md §«A mesa à luz de vela (C)» §4–§5), e mora em estilo.js:
   FORMAS_DO_DADO, PAPEL_DO_DADO, BANDEJA, MOVIMENTO_DO_DADO. Nenhum número de
   forma aqui dentro.

   CADA ESTADO TEM UMA FORMA ALÉM DA COR (quem não vê cor lê-o):
     rolando — rodado, sem anel, o número a trocar (teatro: o resultado já
               veio da semente; a peça NUNCA sorteia);
     sucesso — anel contínuo `ok` e o selo ✓;
     falha   — anel TRACEJADO `danger`, o dado apagado, o selo ✕;
     crítico — anel âmbar forte, oito raios e o selo ✦;
     desastre — a racha no corpo, anel `danger` forte e o selo !.
   E ao lado vai sempre a frase: a conta e o veredito em letra.

   DUAS ALTURAS: FRESCA (logo depois do lance) e RECOLHIDA (o jogador já
   mandou outro turno — só a fileira pequena; a mesa lembra o que saiu).
   ============================================================ */
import { useEffect, useState } from "react";
import { T, TIPOS, FORMAS_DO_DADO, PAPEL_DO_DADO, BANDEJA, MOVIMENTO_DO_DADO } from "./estilo.js";
import { aLinhaDoLancamento, NOME_DO_DESFECHO } from "./motor/a-bandeja.js";

const SELO = { sucesso: "✓", falha: "✕", critico: "✦", desastre: "!" };
const corDoSelo = (d) => (d === "sucesso" ? T.ok : d === "critico" ? T.amber : T.danger);
const RACHA = "M30 6 L26 18 L33 24 L27 36 L31 46";
const RAIOS = [0, 45, 90, 135, 180, 225, 270, 315];

const semMovimento = () => {
  try { return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches); } catch { return false; }
};

/* Um corpo de dado (um d10 do d100 também): a forma, as facetas e o número */
function Corpo({ faces, legenda, papel, tam, desfecho = "livre", rolando = false, apagado = false }) {
  const f = FORMAS_DO_DADO[faces] || FORMAS_DO_DADO[20];
  const p = PAPEL_DO_DADO[papel] || PAPEL_DO_DADO.teste;
  const cor = T[p.corpo], tinta = T[p.numero];
  const tamDaLetra = String(legenda).length > 1 && faces === 10 ? FORMAS_DO_DADO[100].tamDezenas : f.tam;
  const opacidade = apagado ? BANDEJA.falhaApagada : desfecho === "falha" && !rolando ? BANDEJA.falhaApagada + 0.2 : 1;
  return (
    <svg width={tam} height={tam} viewBox="0 0 48 48" aria-hidden="true" style={{ flex: "none", overflow: "visible", opacity: opacidade,
      transform: rolando ? "rotate(-18deg)" : "none", transition: `transform ${MOVIMENTO_DO_DADO.pousar}ms ease-out` }}>
      {f.retangulo
        ? <rect x={f.retangulo.x} y={f.retangulo.y} width={f.retangulo.lado} height={f.retangulo.lado} rx={f.retangulo.raio} fill={cor} stroke={tinta} strokeOpacity={BANDEJA.alfaDoTraco} strokeWidth={BANDEJA.traco} strokeLinejoin="round" />
        : <polygon points={f.corpo} fill={cor} stroke={tinta} strokeOpacity={BANDEJA.alfaDoTraco} strokeWidth={BANDEJA.traco} strokeLinejoin="round" />}
      {(f.facetas || []).map((d, i) => <path key={i} d={d} fill="none" stroke={tinta} strokeOpacity={BANDEJA.alfaDaFaceta} strokeWidth="1" />)}
      {desfecho === "desastre" && !rolando && <path d={RACHA} fill="none" stroke={T.perigoFundo} strokeWidth="2" strokeLinecap="round" />}
      <text x={f.numero[0]} y={f.numero[1]} textAnchor="middle" dominantBaseline="central"
        fontFamily="'JetBrains Mono', ui-monospace, monospace" fontWeight="700" fontSize={tamDaLetra} fill={tinta}>{legenda}</text>
    </svg>
  );
}

/* A marca do desfecho por cima do dado: o anel (contínuo, tracejado, forte),
   os raios do crítico e o selo do canto. */
function Marca({ desfecho, tam, largura = tam }) {
  if (!SELO[desfecho]) return null;
  const cor = desfecho === "critico" ? T.amber : desfecho === "sucesso" ? T.ok : T.danger;
  const forte = desfecho === "critico" || desfecho === "desastre";
  const cx = largura / 2, cy = tam / 2, rx = largura / 2 + 4, ry = tam / 2 + 4;
  return (
    <svg className="tv-dado-veredito" width={largura + 16} height={tam + 16} viewBox={`-8 -8 ${largura + 16} ${tam + 16}`} aria-hidden="true"
      style={{ position: "absolute", left: -8, top: -8, overflow: "visible", pointerEvents: "none", animationDuration: `${MOVIMENTO_DO_DADO.veredito}ms` }}>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={cor} strokeWidth={forte ? BANDEJA.anelForte : BANDEJA.anel}
        strokeDasharray={desfecho === "falha" ? "4 3" : undefined} />
      {desfecho === "critico" && RAIOS.map((g) => {
        const a = (g * Math.PI) / 180;
        return <line key={g} x1={cx + Math.cos(a) * (rx + 3)} y1={cy + Math.sin(a) * (ry + 3)} x2={cx + Math.cos(a) * (rx + 8)} y2={cy + Math.sin(a) * (ry + 8)} stroke={T.amber} strokeWidth="2" strokeLinecap="round" />;
      })}
      <g transform={`translate(${largura - BANDEJA.selo / 2 + 2} ${-BANDEJA.selo / 2 + 4})`}>
        <circle cx={BANDEJA.selo / 2} cy={BANDEJA.selo / 2} r={BANDEJA.selo / 2} fill={corDoSelo(desfecho)} stroke={T.pagina} strokeWidth="2" />
        <text x={BANDEJA.selo / 2} y={BANDEJA.selo / 2} textAnchor="middle" dominantBaseline="central" fontSize={BANDEJA.selo * 0.62} fontWeight="700" fill={T.onAccent}>{SELO[desfecho]}</text>
      </g>
    </svg>
  );
}

/* Um dado do lance. O d100 é dois d10 (dezenas e unidades), com a marca à volta dos dois. */
function DadoDoLance({ d, tam, rolando, desfecho, troca }) {
  const papel = d.papel;
  if (d.faces === 100) {
    const v = d.valor % 100;
    const dz = rolando ? String(((troca * 3) % 10) * 10).padStart(2, "0") : String(Math.floor(v / 10) * 10).padStart(2, "0");
    const un = rolando ? String((troca * 7) % 10) : String(v % 10);
    return (
      <span className={rolando ? "tv-dado-rola" : "tv-dado-pousa"} style={{ position: "relative", display: "inline-flex", gap: 4 }}>
        <Corpo faces={10} legenda={dz} papel={papel} tam={tam} rolando={rolando} desfecho={desfecho} apagado={d.posto} />
        <Corpo faces={10} legenda={un} papel={papel} tam={tam} rolando={rolando} desfecho={desfecho} apagado={d.posto} />
        {!rolando && !d.posto && <Marca desfecho={desfecho} tam={tam} largura={tam * 2 + 4} />}
      </span>
    );
  }
  const legenda = rolando ? String(((troca * 7 + d.faces) % d.faces) + 1) : String(d.valor);
  return (
    <span className={rolando ? "tv-dado-rola" : "tv-dado-pousa"} style={{ position: "relative", display: "inline-flex" }}>
      <Corpo faces={d.faces} legenda={legenda} papel={papel} tam={tam} rolando={rolando} desfecho={desfecho} apagado={d.posto} />
      {!rolando && !d.posto && <Marca desfecho={desfecho} tam={tam} />}
    </span>
  );
}

export function Bandeja({ lancamentos = [], fresca = true }) {
  const lista = Array.isArray(lancamentos) ? lancamentos.filter(Boolean) : [];
  const ultimo = lista[0] || null;
  const n = ultimo ? ultimo.n : 0;
  /* o lance novo rola por MOVIMENTO_DO_DADO.rolar e o número troca a cada
     `troca` ms; o que já rolou no Véu (`jaRolou`) pousa logo; com reduce,
     tudo pousa já com o número final. */
  const [rolandoN, setRolandoN] = useState(0);
  const [troca, setTroca] = useState(0);
  useEffect(() => {
    if (!ultimo || ultimo.jaRolou || semMovimento()) { setRolandoN(0); return undefined; }
    setRolandoN(n); setTroca(0);
    const passo = setInterval(() => setTroca((x) => x + 1), MOVIMENTO_DO_DADO.troca);
    const fim = setTimeout(() => { clearInterval(passo); setRolandoN(0); }, MOVIMENTO_DO_DADO.rolar);
    return () => { clearInterval(passo); clearTimeout(fim); };
  }, [n]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!ultimo) return null;
  const rolando = rolandoN === n;
  const linha = aLinhaDoLancamento(ultimo);
  const desfecho = NOME_DO_DESFECHO[ultimo.desfecho] || "";
  const corD = ultimo.desfecho === "critico" ? T.amberSoft : ultimo.desfecho === "sucesso" ? T.ok : ultimo.desfecho === "falha" || ultimo.desfecho === "desastre" ? T.danger : T.inkMeio;
  const anteriores = lista.slice(1);

  if (!fresca) {
    return (
      <div role="group" aria-label={`Últimos dados: ${lista.map(aLinhaDoLancamento).join("; ")}`}
        style={{ display: "flex", alignItems: "center", gap: BANDEJA.espaco + 4, padding: "4px 2px" }}>
        {lista.map((l, i) => (
          <span key={l.n} style={{ display: "inline-flex", gap: 2, opacity: i === 0 ? 0.9 : 0.5 }}>
            {l.dados.filter((d) => !d.posto).slice(0, 3).map((d, j) => <Corpo key={j} faces={d.faces === 100 ? 10 : d.faces} legenda={d.faces === 100 ? String(d.valor % 10) : String(d.valor)} papel={d.papel} tam={BANDEJA.dadoPequeno} />)}
          </span>
        ))}
      </div>
    );
  }

  const tam = ultimo.dados.length > 3 ? BANDEJA.dado - 12 : BANDEJA.dado;
  return (
    <div className="tv-fade tv-bandeja" role="group" aria-label="Os dados na mesa"
      style={{ display: "flex", alignItems: "center", gap: BANDEJA.espaco + 4, padding: `0 ${BANDEJA.espaco + 6}px`, borderRadius: BANDEJA.raio,
        border: `1px solid ${T.line}`, background: T.pagina, boxShadow: "inset 0 2px 6px rgba(0,0,0,.6)" }}>
      <span style={{ display: "inline-flex", gap: BANDEJA.espaco + 4, alignItems: "center", padding: "6px 0" }}>
        {ultimo.dados.map((d, i) => <DadoDoLance key={`${n}-${i}`} d={d} tam={tam} rolando={rolando && !d.posto} desfecho={ultimo.desfecho} troca={troca + i} />)}
      </span>
      <span style={{ flex: 1, minWidth: 0 }} aria-live="polite">
        <span className="tv-mono" style={{ display: "block", fontSize: TIPOS.rotulo, color: T.inkMeio, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {rolando ? (ultimo.rotulo || "…") : linha}
        </span>
        {!rolando && desfecho && (
          <span className="tv-dado-veredito" style={{ display: "block", fontSize: TIPOS.corpo, fontWeight: 700, color: corD, animationDuration: `${MOVIMENTO_DO_DADO.veredito}ms` }}>
            {SELO[ultimo.desfecho] ? `${SELO[ultimo.desfecho]} ` : ""}{desfecho}
          </span>
        )}
      </span>
      {anteriores.length > 0 && (
        <span style={{ display: "inline-flex", gap: BANDEJA.espaco, alignItems: "center" }} aria-hidden="true">
          {anteriores.map((l) => (
            <span key={l.n} style={{ display: "inline-flex", gap: 2, opacity: 0.45 }}>
              {l.dados.filter((d) => !d.posto).slice(0, 2).map((d, j) => <Corpo key={j} faces={d.faces === 100 ? 10 : d.faces} legenda={d.faces === 100 ? String(d.valor % 10) : String(d.valor)} papel={d.papel} tam={BANDEJA.dadoPequeno} />)}
            </span>
          ))}
        </span>
      )}
    </div>
  );
}
