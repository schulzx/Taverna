/* ============================================================
   PAINEL ASCENSÃO — graus divinos, fé, milagres e caminhos (v8.8) — Taverna
   Extraído do App.jsx na modularização.
   ============================================================ */
import React from "react";
import { T } from "./constantes.js";
import { GRAUS, MILAGRES, NIVEL_DESPERTAR, grauDe, tituloDe, proximoPatamar, pfMaximo, pfPorDia } from "./divindades.js";
import { Botao } from "./ui.jsx";

export function PainelAscensao({ divindade, nivel, onDespertar, onRecalibrar, recalibrando, onMilagre }) {
  const dv = divindade || garantirDivindade(null);
  const gd = grauDe(dv);
  const prox = proximoPatamar(dv);
  const podeDespertar = (nivel || 1) >= NIVEL_DESPERTAR;
  const comparar = (gdOutro) => {
    const b = bonusDivino(gd, gdOutro);
    if (b > 0) return { txt: `vantagem +${b}`, cor: "#7BC98F" };
    if (b < 0) return { txt: `desvantagem ${b}`, cor: T.danger };
    return { txt: "equilíbrio", cor: T.inkDim };
  };
  if (!dv.despertar) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <div className="rounded-2xl p-4" style={{ background: T.panel, border: `1px solid ${T.amber}` }}>
          <div className="tv-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: T.amberSoft }}>Ascensão</div>
          <div className="tv-display text-2xl" style={{ color: T.ink }}>O cosmos ainda não te enxerga</div>
          <div className="tv-body text-sm mt-2 leading-relaxed" style={{ color: T.inkDim }}>
            A trilha dos três estágios (Servo Escolhido → Semideus → Nova Divindade) abre no nível {NIVEL_DESPERTAR}.
            {podeDespertar ? " Você já cruzou esse marco — o despertar acontece sozinho no próximo turno, ou agora, pelo botão abaixo." : " Siga lendário até lá."}
          </div>
          {podeDespertar && (
            <div className="mt-3 space-y-2">
              <button onClick={onDespertar} className="tv-btn w-full rounded-xl py-2.5 tv-mono text-xs uppercase tracking-widest" style={{ background: T.amber, color: "#1A1206" }}>🌟 Despertar agora</button>
              <button onClick={onRecalibrar} disabled={recalibrando} className="tv-btn w-full rounded-xl py-2.5 tv-mono text-xs uppercase tracking-widest" style={{ background: T.panelSoft, border: `1px solid ${T.violetSoft}`, color: T.violetSoft }}>{recalibrando ? "⚖ Lendo sua lenda…" : "⚖ Recalibrar com a IA"}</button>
              <div className="tv-body text-[11px]" style={{ color: T.inkDim }}>Já é divindade na história? A recalibração lê o livro da aventura e o cânone e ajusta GD, fiéis, domínio e panteão pelo que de fato aconteceu — nada é inventado.</div>
            </div>
          )}
        </div>
      </div>
    );
  }
  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="rounded-2xl p-4" style={{ background: T.panel, border: `1px solid ${T.amber}` }}>
        <div className="tv-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: T.amberSoft }}>Seu lugar no cosmos</div>
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="tv-display text-3xl" style={{ color: T.ink }}>GD {gd} · {tituloDe(gd)}</span>
          <span className="tv-mono text-xs" style={{ color: T.inkDim }}>nível {nivel}</span>
        </div>
        <div className="tv-body text-sm mt-1" style={{ color: T.inkDim }}>{GRAUS[gd].desc}</div>
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="rounded-xl p-2.5 text-center" style={{ background: T.panelSoft, border: `1px solid ${T.line}` }}>
            <div className="tv-display text-xl" style={{ color: T.amber }}>{dv.fieis.toLocaleString("pt-BR")}</div>
            <div className="tv-mono text-[9px] uppercase tracking-widest" style={{ color: T.inkDim }}>fiéis</div>
          </div>
          <div className="rounded-xl p-2.5 text-center" style={{ background: T.panelSoft, border: `1px solid ${T.line}` }}>
            <div className="tv-display text-xl" style={{ color: T.violetSoft }}>{dv.pf}<span className="tv-mono text-[10px]" style={{ color: T.inkDim }}>/{pfMaximo(dv)}</span></div>
            <div className="tv-mono text-[9px] uppercase tracking-widest" style={{ color: T.inkDim }}>pontos de fé · +{pfPorDia(dv)}/dia</div>
          </div>
        </div>
        <div className="mt-4">
          <div className="tv-mono text-[10px] uppercase tracking-widest mb-2" style={{ color: T.violetSoft }}>Milagres — no que gastar a fé</div>
          <div className="space-y-1.5">
            {MILAGRES.map((m) => {
              const liberado = m.gd <= gd;
              const podePagar = (dv.pf || 0) >= m.pf;
              const ativo = liberado && podePagar;
              return (
                <button key={m.id} disabled={!ativo} onClick={() => onMilagre && onMilagre(m.id)}
                  className="w-full text-left rounded-lg px-3 py-2 flex items-center gap-2.5"
                  style={{ background: ativo ? T.panelSoft : "transparent", border: `1px solid ${ativo ? T.violet : T.line}`, opacity: liberado ? 1 : 0.4, cursor: ativo ? "pointer" : "default" }}>
                  <span style={{ fontSize: 15 }}>{m.icone}</span>
                  <span className="flex-1 min-w-0">
                    <span className="tv-body text-sm" style={{ color: T.ink }}>{m.nome}</span>
                    <span className="tv-body text-xs block" style={{ color: T.inkDim }}>{m.desc}</span>
                  </span>
                  <span className="tv-mono text-[10px] shrink-0 text-right" style={{ color: podePagar && liberado ? T.violetSoft : T.inkDim }}>
                    {m.pf} PF{!liberado && <span className="block" style={{ color: T.inkDim }}>GD {m.gd}</span>}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        {prox ? (
          <div className="mt-3">
            <div className="flex justify-between tv-mono text-[10px] mb-1" style={{ color: T.inkDim }}>
              <span>rumo a GD {prox.gd} · {prox.titulo}</span><span>faltam {prox.falta.toLocaleString("pt-BR")} fiéis</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: T.panelSoft }}>
              <div className="h-full rounded-full" style={{ width: `${Math.round(prox.progresso * 100)}%`, background: T.amber }} />
            </div>
          </div>
        ) : <div className="tv-mono text-[10px] mt-3 uppercase tracking-widest" style={{ color: T.amber }}>Topo da escala — não há mais degraus acima de você.</div>}
        {(dv.dominio || dv.patrono) && (
          <div className="tv-body text-sm mt-3" style={{ color: T.ink }}>
            {dv.dominio && <div>🌌 Domínio: <b>{dv.dominio}</b></div>}
            {dv.patrono && <div>🙏 Patrono: <b>{dv.patrono}</b></div>}
          </div>
        )}
      </div>

      <div className="rounded-2xl p-4" style={{ background: T.panel, border: `1px solid ${T.line}` }}>
        <div className="tv-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: T.violetSoft }}>A Regra do Degrau</div>
        <div className="tv-body text-xs leading-relaxed" style={{ color: T.inkDim }}>
          Cada degrau de diferença de GD dá <b style={{ color: T.ink }}>+2 ao mais forte e −2 ao mais fraco</b> em ataques, defesas e resistências (o sistema aplica nos dados). Mortais não ferem divindades de GD 3+ sem artefato lendário ou bênção. Fé se ganha com feitos testemunhados, santuários e conversões — e se gasta em milagres (pequeno ~5 PF, médio ~20, grande ~50).
        </div>
      </div>

      <div className="rounded-2xl p-4" style={{ background: T.panel, border: `1px solid ${T.line}` }}>
        <div className="tv-mono text-[10px] uppercase tracking-widest mb-2" style={{ color: T.amberSoft }}>Panteão conhecido</div>
        {dv.panteao.length === 0 ? (
          <div className="tv-body text-sm italic" style={{ color: T.inkDim }}>Nenhuma divindade se revelou ainda. Os geradores do mundo apresentarão deuses conforme sua ascensão avança.</div>
        ) : (
          <div className="space-y-2">
            {dv.panteao.map((d) => {
              const cmp = comparar(d.gd);
              const imune = imunePorEscopo(gd, d.gd);
              return (
                <div key={d.id || d.nome} className="rounded-xl p-3" style={{ background: T.panelSoft, border: `1px solid ${T.line}` }}>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="tv-display text-lg" style={{ color: T.ink }}>{d.icone} {d.nome} <span className="tv-body text-sm" style={{ color: T.inkDim }}>{d.dominio}</span></span>
                    <span className="tv-mono text-[10px] px-1.5 py-0.5 rounded" style={{ border: `1px solid ${cmp.cor}`, color: cmp.cor }}>{cmp.txt}</span>
                  </div>
                  <div className="tv-mono text-[10px] mt-1" style={{ color: T.inkDim }}>GD {d.gd} · {tituloDe(d.gd)} · {(d.fieis || 0).toLocaleString("pt-BR")} fiéis · culto: {d.culto}</div>
                  {d.nota && <div className="tv-body text-xs mt-1 italic" style={{ color: T.inkDim }}>{d.nota}</div>}
                  {imune && <div className="tv-body text-[11px] mt-1" style={{ color: T.danger }}>⚠ Imune ao seu dano comum — cresça antes de desafiá-lo (ou enfraqueça a fé dele).</div>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <button onClick={onRecalibrar} disabled={recalibrando} className="tv-btn w-full rounded-xl py-2.5 tv-mono text-[10px] uppercase tracking-widest" style={{ background: T.panelSoft, border: `1px solid ${T.violetSoft}`, color: T.violetSoft }}>
        {recalibrando ? "⚖ Lendo sua lenda…" : "⚖ Recalibrar ascensão com a IA"}
      </button>
    </div>
  );
}
