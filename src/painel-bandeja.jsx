/* ============================================================
   A BANDEJA (04/11/2026) — src/painel-bandeja.jsx

   A faixa da mesa onde os dados pousam, entre a página e o campo. A pessoa:
   «um rpg precisa de constantes rolagens… além de que são diferentes dados
   jogados». Cada dado tem a forma dele — d4 triângulo, d6 quadrado, d8
   losango, d10 pipa, d12 pentágono, d20 hexágono com o triângulo, d100 como
   dois d10 (dezenas e unidades) — e a cor do papel que tem no lance.

   DUAS ALTURAS:
     · FRESCA — logo depois do lance: o dado grande, a conta por extenso e o
       desfecho; os dois lances anteriores encostados à direita, pequenos.
     · RECOLHIDA — o jogador já mandou outro turno: só a fileira dos dados
       pequenos, para a mesa lembrar o que saiu sem tirar altura à página.

   O DADO NÃO MENTE. A peça nunca sorteia: o número que pousa é o que o
   sistema rolou (`src/motor/a-bandeja.js`). Enquanto rola, a face fica sem
   número — trocar números ao acaso seria mostrar resultados que não houve.
   O d20 do teste chega com `jaRolou` (o Véu já o rolou) e pousa direto.

   As formas e as cores são PROVISÓRIAS: a spec é do `desenho`, na página
   «Mesa C · 04/11» do Figma, e quando chegar troca-se aqui, num sítio só.
   ============================================================ */
import { useEffect, useState } from "react";
import { T, TIPOS } from "./estilo.js";
import { A_BANDEJA, aLinhaDoLancamento, NOME_DO_DESFECHO } from "./motor/a-bandeja.js";

/* a forma de cada face, num viewBox 48×48 */
const FORMAS = {
  4: { pontos: "24,4 45,43 3,43", ny: 35 },
  6: { rect: true, ny: 30 },
  8: { pontos: "24,2 46,24 24,46 2,24", ny: 29 },
  10: { pontos: "24,2 45,20 24,46 3,20", ny: 27 },
  12: { pontos: "24,2 46,18 38,45 10,45 2,18", ny: 31 },
  20: { pontos: "24,1 45,12.5 45,35.5 24,47 3,35.5 3,12.5", tri: "24,9 38,34 10,34", ny: 30 },
};

/* a cor do papel do dado */
const COR_DO_PAPEL = {
  teste: () => T.amber, dano: () => T.danger, cura: () => T.ok, sorte: () => T.mundo, uso: () => T.inkMeio,
};
const corDoDesfecho = (d) => (d === "critico" ? T.amberSoft : d === "sucesso" ? T.ok : d === "falha" || d === "desastre" ? T.danger : T.inkMeio);

function Face({ faces, valor, cor, tam, rolando, apagado, legenda }) {
  const f = FORMAS[faces] || FORMAS[20];
  const tinta = T.onAccent;
  const letra = Math.round(tam * (String(legenda).length > 2 ? 0.27 : 0.36));
  return (
    <svg width={tam} height={tam} viewBox="0 0 48 48" aria-hidden="true"
      className={rolando ? "tv-dado-rola" : "tv-dado-pousa"}
      style={{ opacity: apagado ? 0.35 : 1, animationDuration: `${rolando ? A_BANDEJA.rolarMs : A_BANDEJA.pousoMs}ms`, flex: "none" }}>
      {f.rect
        ? <rect x="5" y="5" width="38" height="38" rx="7" fill={cor} />
        : <polygon points={f.pontos} fill={cor} />}
      {f.tri && <polygon points={f.tri} fill="none" stroke={tinta} strokeOpacity=".35" strokeWidth="1.5" />}
      {!rolando && (
        <text x="24" y={f.ny} textAnchor="middle" fontFamily="'JetBrains Mono', ui-monospace, monospace" fontWeight="700" fontSize={Math.max(9, letra) * (48 / tam)} fill={tinta}>{legenda}</text>
      )}
    </svg>
  );
}

/* um dado do lance: o d100 desenha-se como dois d10 */
function DadoDoLance({ d, tam, rolando }) {
  const cor = (COR_DO_PAPEL[d.papel] || COR_DO_PAPEL.teste)();
  if (d.faces === 100) {
    const v = d.valor % 100;
    const dezenas = String(Math.floor(v / 10) * 10).padStart(2, "0");
    return (
      <span style={{ display: "inline-flex", gap: 2 }}>
        <Face faces={10} valor={0} legenda={dezenas} cor={cor} tam={tam} rolando={rolando} apagado={d.posto} />
        <Face faces={10} valor={0} legenda={String(v % 10)} cor={cor} tam={tam} rolando={rolando} apagado={d.posto} />
      </span>
    );
  }
  return <Face faces={d.faces} valor={d.valor} legenda={String(d.valor)} cor={cor} tam={tam} rolando={rolando} apagado={d.posto} />;
}

export function Bandeja({ lancamentos = [], fresca = true }) {
  const lista = Array.isArray(lancamentos) ? lancamentos.filter(Boolean) : [];
  const ultimo = lista[0] || null;
  const n = ultimo ? ultimo.n : 0;
  /* o lance novo rola por `rolarMs` e depois pousa; o que já rolou no Véu
     pousa logo. O estado vive aqui e reinicia a cada número de ordem novo. */
  const [rolandoN, setRolandoN] = useState(0);
  useEffect(() => {
    if (!ultimo || ultimo.jaRolou) { setRolandoN(0); return undefined; }
    let parado = false;
    try { parado = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches); } catch { parado = false; }
    if (parado) { setRolandoN(0); return undefined; }
    setRolandoN(n);
    const id = setTimeout(() => setRolandoN(0), A_BANDEJA.rolarMs);
    return () => clearTimeout(id);
  }, [n]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!ultimo) return null;
  const rolando = rolandoN === n;
  const linha = aLinhaDoLancamento(ultimo);
  const desfecho = NOME_DO_DESFECHO[ultimo.desfecho] || "";
  const corD = corDoDesfecho(ultimo.desfecho);
  const anteriores = lista.slice(1);

  if (!fresca) {
    return (
      <div role="group" aria-label={`Últimos dados: ${lista.map(aLinhaDoLancamento).join("; ")}`}
        style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 2px", opacity: 0.8 }}>
        {lista.map((l, i) => (
          <span key={l.n} style={{ display: "inline-flex", gap: 2, opacity: i === 0 ? 1 : 0.6 }}>
            {l.dados.filter((d) => !d.posto).slice(0, 3).map((d, j) => <DadoDoLance key={j} d={d} tam={20} rolando={false} />)}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="tv-fade" role="group" aria-label="Os dados na mesa"
      style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 12px", borderRadius: 12,
        border: `1px solid ${rolando ? T.line : corD}`, background: T.panel, minHeight: 56 }}>
      <span style={{ display: "inline-flex", gap: 4, alignItems: "center" }}>
        {ultimo.dados.map((d, i) => <DadoDoLance key={`${n}-${i}`} d={d} tam={ultimo.dados.length > 3 ? 30 : 40} rolando={rolando && !d.posto} />)}
      </span>
      <span style={{ flex: 1, minWidth: 0 }} aria-live="polite">
        <span style={{ display: "block", fontSize: TIPOS.rotulo, color: T.inkMeio, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {rolando ? (ultimo.rotulo || "…") : linha}
        </span>
        {!rolando && desfecho && (
          <span style={{ display: "block", fontSize: TIPOS.corpo, fontWeight: 700, color: corD, letterSpacing: ".02em" }}>{desfecho}</span>
        )}
      </span>
      {anteriores.length > 0 && (
        <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }} aria-hidden="true">
          {anteriores.map((l) => (
            <span key={l.n} style={{ display: "inline-flex", gap: 2, opacity: 0.5 }}>
              {l.dados.filter((d) => !d.posto).slice(0, 2).map((d, j) => <DadoDoLance key={j} d={d} tam={18} rolando={false} />)}
            </span>
          ))}
        </span>
      )}
    </div>
  );
}
