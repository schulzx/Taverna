/* ============================================================
   PAINEL DIÁRIO — arco da campanha, missões e fios do mundo (v8.8) — Taverna
   Extraído do App.jsx na modularização.
   ============================================================ */
import React from "react";
import { T } from "./constantes.js";
import { ESTRUTURAS, estruturaPorId } from "./historia.js";

export function PainelDiario({ historia, quests, trocarArco, eventos, diaAtual }) {
  const [trocando, setTrocando] = React.useState(false);
  const est = estruturaPorId((historia || {}).estrutura);
  const etapaIdx = Math.min((historia || {}).etapa || 0, est.etapas.length - 1);
  const ativas = (quests || []).filter((q) => q.status === "ativa");
  const principais = ativas.filter((q) => q.tipo === "principal");
  const secundarias = ativas.filter((q) => q.tipo !== "principal");
  const encerradas = (quests || []).filter((q) => q.status !== "ativa");
  const Missao = ({ q }) => (
    <div className="rounded-lg px-3 py-2.5" style={{ background: T.panelSoft, border: `1px solid ${q.status === "concluida" ? T.ok : q.status === "falhada" ? T.danger : q.tipo === "principal" ? T.amber : T.line}`, opacity: q.status === "ativa" ? 1 : 0.65 }}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="tv-body text-sm" style={{ color: T.ink }}>{q.status === "concluida" ? "✓ " : q.status === "falhada" ? "✗ " : ""}{q.titulo}</span>
        {q.tipo === "principal" && q.status === "ativa" && <span className="tv-mono text-[9px] px-1.5 py-0.5 rounded shrink-0" style={{ color: T.amberSoft, border: `1px solid ${T.amber}` }}>PRINCIPAL</span>}
      </div>
      {q.descricao && <div className="tv-body text-xs mt-0.5" style={{ color: T.inkDim }}>{q.descricao}</div>}
      {q.objetivo && q.status === "ativa" && <div className="tv-body text-xs mt-1" style={{ color: T.amberSoft }}>🎯 {q.objetivo}</div>}
      {q.nota && <div className="tv-body text-xs mt-1 italic" style={{ color: T.violetSoft }}>» {q.nota}</div>}
    </div>
  );
  return (
    <div>
      <div className="rounded-xl p-4 mb-4" style={{ background: T.panelSoft, border: `1px solid ${T.violet}` }}>
        <div className="flex items-center justify-between mb-1">
          <div className="tv-mono text-[10px] uppercase tracking-widest" style={{ color: T.violetSoft }}>Arco da campanha</div>
          <button onClick={() => setTrocando((v) => !v)} className="tv-mono text-[10px] px-2 py-0.5 rounded" style={{ border: `1px solid ${T.line}`, color: T.inkDim }}>↺ trocar arco</button>
        </div>
        <div className="tv-display text-xl" style={{ color: T.ink }}>{est.nome}</div>
        {trocando && (
          <div className="mt-3 space-y-2">
            <div className="tv-body text-xs" style={{ color: T.inkDim }}>Mudar a perspectiva da campanha — o mundo e a história vividos permanecem; só o rumo dramático muda.</div>
            {ESTRUTURAS.filter((e) => e.id !== (historia || {}).estrutura).map((e) => (
              <button key={e.id} onClick={() => { trocarArco(e.id); setTrocando(false); }} className="w-full text-left rounded-lg p-3" style={{ background: T.panel, border: `1px solid ${T.line}` }}>
                <div className="tv-display text-base" style={{ color: T.amberSoft }}>{e.nome}</div>
                <div className="tv-body text-xs mt-0.5" style={{ color: T.inkDim }}>{e.desc}</div>
              </button>
            ))}
          </div>
        )}
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          {est.etapas.map((et, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span className="tv-mono text-[10px] px-2 py-0.5 rounded-full" style={{ background: i === etapaIdx ? T.amber : i < etapaIdx ? T.panel : "transparent", color: i === etapaIdx ? T.onAccent : i < etapaIdx ? T.ok : T.inkDim, border: `1px solid ${i === etapaIdx ? T.amber : T.line}`, fontWeight: i === etapaIdx ? 700 : 400 }}>{i < etapaIdx ? "✓ " : ""}{et.nome}</span>
              {i < est.etapas.length - 1 && <span style={{ color: T.inkDim, fontSize: 9 }}>→</span>}
            </div>
          ))}
        </div>
      </div>
      {ativas.length === 0 && <div className="tv-body text-sm italic mb-4" style={{ color: T.inkDim }}>Nenhuma missão ativa ainda — elas surgem conforme a história se abre.</div>}
      {principais.length > 0 && (<><div className="tv-mono text-[10px] uppercase tracking-widest mb-1.5" style={{ color: T.amberSoft }}>Missão principal</div><div className="space-y-2 mb-4">{principais.map((q, i) => <Missao key={i} q={q} />)}</div></>)}
      {secundarias.length > 0 && (<><div className="tv-mono text-[10px] uppercase tracking-widest mb-1.5" style={{ color: T.inkDim }}>Missões secundárias</div><div className="space-y-2 mb-4">{secundarias.map((q, i) => <Missao key={i} q={q} />)}</div></>)}
      {encerradas.length > 0 && (<><div className="tv-mono text-[10px] uppercase tracking-widest mb-1.5" style={{ color: T.inkDim }}>Encerradas</div><div className="space-y-2">{encerradas.map((q, i) => <Missao key={i} q={q} />)}</div></>)}

      {/* FIOS DO MUNDO (v7.2): evento global em curso + fios locais com prazo */}
      {eventos && eventos.global && (
        <>
          <div className="tv-mono text-[10px] uppercase tracking-widest mt-5 mb-1.5" style={{ color: T.danger }}>🌍 Evento global em curso</div>
          <div className="rounded-lg px-3 py-2.5 mb-2" style={{ background: T.panelSoft, border: `1px solid ${T.danger}` }}>
            <div className="flex items-baseline justify-between gap-2">
              <span className="tv-body text-sm font-bold" style={{ color: T.ink }}>{eventos.global.nome}</span>
              <span className="tv-mono text-[9px] shrink-0" style={{ color: T.danger }}>etapa {eventos.global.etapa + 1}/{eventos.global.etapas.length}</span>
            </div>
            <div className="tv-body text-xs mt-0.5" style={{ color: T.inkDim }}>{eventos.global.semente}</div>
            <div className="tv-body text-xs mt-1" style={{ color: T.amberSoft }}>▶ Agora: {eventos.global.etapas[eventos.global.etapa]}</div>
          </div>
        </>
      )}
      {eventos && (eventos.locais || []).length > 0 && (
        <>
          <div className="tv-mono text-[10px] uppercase tracking-widest mt-4 mb-1.5" style={{ color: T.inkDim }}>🌱 Fios do mundo (se resolvem sem você)</div>
          <div className="space-y-2">
            {eventos.locais.map((l) => (
              <div key={l.id} className="rounded-lg px-3 py-2.5" style={{ background: T.panelSoft, border: `1px solid ${T.line}` }}>
                <div className="tv-body text-xs" style={{ color: T.ink }}>{l.icone} {l.texto}</div>
                <div className="flex items-baseline justify-between gap-2 mt-1">
                  <span className="tv-body text-[11px] italic" style={{ color: T.violetSoft }}>{l.gancho}</span>
                  <span className="tv-mono text-[9px] shrink-0" style={{ color: diaAtual >= l.expiraEm ? T.danger : T.inkDim }}>até dia {l.expiraEm}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* PainelMapa extraído para ./painel-mapa.js (v8.8) */
