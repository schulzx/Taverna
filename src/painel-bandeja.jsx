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

   O SOM (TE, decisão da pessoa de 09/11; som-da-mesa.js): o lance novo
   soa quando POUSA — no fim da rolagem, ou logo, com o reduce (o som fica
   com quem pediu menos movimento). O que já rolou no Véu (jaRolou) não
   soa aqui: soou lá. Um som que estoura cala-se; o dado pousa na mesma.
   ============================================================ */
import { useEffect, useRef, useState } from "react";
import { T, TIPOS, FORMAS_DO_DADO, PAPEL_DO_DADO, BANDEJA, MOVIMENTO_DO_DADO, GOLPE_SENTIDO } from "./estilo.js";
import { Glifo, FacesDoD20 } from "./ui.jsx";
/* CB 15 (decisão do coordenador, 09/11): o d20 do ataque rola AQUI, com as
   faces que acertam acesas ANTES de pousar («precisas de 6+»). O lançamento
   do golpe (`lancamentoDoAtaque`, motor/a-bandeja.js) traz `golpe`,
   `acertam` e `criticoEm`; as faces são as mesmas que a coluna acende
   (`golpePorExtenso`). Rola GOLPE_SENTIDO.dadoNaBandeja, um toque na bandeja
   salta, e nada disto prende a entrada: o golpe já está aplicado. */
import { golpePorExtenso } from "./batalha-na-tela.js";
import { aLinhaDoLancamento, NOME_DO_DESFECHO } from "./motor/a-bandeja.js";
import { tocarDado } from "./som-da-mesa.js";

/* o dado pousou: o som, e nunca o turno */
const soarDado = () => { try { tocarDado(); } catch { /* um som que estoura cala-se */ } };

/* o crítico não tem letra: a faísca desenha-se (FAISCA), a casa não pede glifo à fonte */
const SELO = { sucesso: "✓", falha: "✕", critico: "", desastre: "!" };
const TEM_SELO = { sucesso: true, falha: true, critico: true, desastre: true };
const FAISCA = "M0 -1 L0.28 -0.28 L1 0 L0.28 0.28 L0 1 L-0.28 0.28 L-1 0 L-0.28 -0.28 Z";
const corDoSelo = (d) => (d === "sucesso" ? T.ok : d === "critico" ? T.amber : T.danger);
const RACHA = "M30 6 L26 18 L33 24 L27 36 L31 46";
const RAIOS = [0, 45, 90, 135, 180, 225, 270, 315];

const semMovimento = () => {
  try { return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches); } catch { return false; }
};

/* Um corpo de dado (um d10 do d100 também): a forma, as facetas e o número.
   Exportado (AR 12, 07/11): o dado de uso dos mantimentos é este mesmo corpo,
   papel uso — não se desenha um segundo dado. */
export function Corpo({ faces, legenda, papel, tam, desfecho = "livre", rolando = false, apagado = false }) {
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
  if (!TEM_SELO[desfecho]) return null;
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
        {desfecho === "critico"
          ? <path d={FAISCA} transform={`translate(${BANDEJA.selo / 2} ${BANDEJA.selo / 2}) scale(${BANDEJA.selo * 0.32})`} fill={T.onAccent} />
          : <text x={BANDEJA.selo / 2} y={BANDEJA.selo / 2} textAnchor="middle" dominantBaseline="central" fontSize={BANDEJA.selo * 0.62} fontWeight="700" fill={T.onAccent}>{SELO[desfecho]}</text>}
      </g>
    </svg>
  );
}

/* Um dado do lance. O d100 é dois d10 (dezenas e unidades), com a marca à volta dos dois.
   Exportado (CB 17.1, 09/11): o d20 que rola no alvo (`DadoNoAlvo`, grade-de-batalha.jsx)
   é este mesmo dado — não se desenha um segundo. Nada muda na Bandeja de fora da luta. */
export function DadoDoLance({ d, tam, rolando, desfecho, troca }) {
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
  const pousarRef = useRef(null);
  useEffect(() => {
    if (!ultimo || ultimo.jaRolou) { setRolandoN(0); return undefined; }
    if (semMovimento()) { setRolandoN(0); soarDado(); return undefined; }
    setRolandoN(n); setTroca(0);
    const inicio = Date.now();
    const passo = setInterval(() => setTroca(Math.floor((Date.now() - inicio) / MOVIMENTO_DO_DADO.troca)), MOVIMENTO_DO_DADO.troca);
    let pousou = false;
    const pousar = () => { if (pousou) return; pousou = true; clearInterval(passo); clearTimeout(fim); setRolandoN(0); soarDado(); pousarRef.current = null; };
    const fim = setTimeout(pousar, ultimo.golpe ? GOLPE_SENTIDO.dadoNaBandeja : MOVIMENTO_DO_DADO.rolar);
    pousarRef.current = pousar;
    return () => { clearInterval(passo); clearTimeout(fim); pousarRef.current = null; };
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
  /* o golpe: as 20 faces, as que acertam acesas; pousado, a que saiu marcada */
  const doGolpe = ultimo.golpe && Array.isArray(ultimo.acertam) ? golpePorExtenso({ faces: ultimo.acertam, criticoEm: ultimo.criticoEm }) : null;
  const natural = (ultimo.dados.find((d) => !d.posto) || {}).valor;
  return (
    <div className="tv-fade tv-bandeja" role="group" aria-label="Os dados na mesa"
      onClick={rolando && pousarRef.current ? () => { try { pousarRef.current && pousarRef.current(); } catch { /* saltar nunca custa o turno */ } } : undefined}
      title={rolando ? "toque para o dado pousar já" : undefined}
      style={{ display: "flex", alignItems: "center", gap: BANDEJA.espaco + 4, padding: `0 ${BANDEJA.espaco + 6}px`, borderRadius: BANDEJA.raio,
        border: `1px solid ${T.line}`, background: T.pagina, boxShadow: BANDEJA.sombraInterior }}>
      <span style={{ display: "inline-flex", gap: BANDEJA.espaco + 4, alignItems: "center", padding: "6px 0" }}>
        {ultimo.dados.map((d, i) => <DadoDoLance key={`${n}-${i}`} d={d} tam={tam} rolando={rolando && !d.posto} desfecho={ultimo.desfecho} troca={troca + i} />)}
      </span>
      <span style={{ flex: 1, minWidth: 0 }} aria-live="polite">
        <span className="tv-mono" style={{ display: "block", fontSize: TIPOS.rotulo, color: T.inkMeio, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {rolando ? (ultimo.rotulo || "…") : linha}
        </span>
        {doGolpe && doGolpe.faces && (
          <span style={{ display: "block", marginTop: 4 }}>
            <FacesDoD20 faces={doGolpe.faces} saiu={rolando ? null : natural} rotulo={doGolpe.legenda} />
          </span>
        )}
        {!rolando && desfecho && (
          <span className="tv-dado-veredito" style={{ display: "block", fontSize: TIPOS.corpo, fontWeight: 700, color: corD, animationDuration: `${MOVIMENTO_DO_DADO.veredito}ms` }}>
            {ultimo.desfecho === "critico" ? <><Glifo nome="faisca" tamanho={14} cor={corD} />{" "}</> : SELO[ultimo.desfecho] ? `${SELO[ultimo.desfecho]} ` : ""}{desfecho}
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
