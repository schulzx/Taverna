/* ============================================================
   PAINEL DIPLOMACIA — relações, tratados e presentes entre facções (v8.8) — Taverna
   Extraído do App.jsx na modularização.
   ============================================================ */
import React from "react";
import { T } from "./constantes.js";
import { RELACOES, TRATADOS } from "./mapa.js";
import { Botao } from "./ui.jsx";

export function PainelDiplomacia({ mapa, faccaoJogador, onDiplomacia, onPresente, cofre }) {
  const fs = (mapa?.faccoes || []).filter((f) => f.nome !== faccaoJogador);
  if (!fs.length) {
    return <div className="tv-body text-sm italic text-center py-10" style={{ color: T.inkDim }}>Nenhuma potência conhecida ainda. Guildas, reinos e cultos que você encontrar na história aparecem aqui — e você poderá propor alianças, comércio, vassalagem… ou declarar guerra.</div>;
  }
  const ACOES = [
    { id: "comercio", rotulo: "◉ propor comércio", dica: "+5% de renda por parceiro" },
    { id: "alianca", rotulo: "🤝 propor aliança", dica: "+5% e apoio mútuo" },
    { id: "vassalagem", rotulo: "♜ exigir vassalagem", dica: "tributo de 10/dia" },
    { id: "guerra", rotulo: "⚔ declarar guerra", dica: "sem volta fácil", perigo: true },
  ];
  return (
    <div className="space-y-2.5">
      {fs.map((f) => {
        const rel = RELACOES[f.relacao] || RELACOES.neutra;
        const tr = TRATADOS[f.tratado] || TRATADOS.nenhum;
        return (
          <div key={f.nome} className="rounded-xl p-3" style={{ background: T.panelSoft, border: `1px solid ${T.line}` }}>
            <div className="flex items-baseline justify-between gap-2">
              <span className="tv-display text-lg leading-tight" style={{ color: T.ink }}>{f.nome}</span>
              <div className="flex gap-1.5 shrink-0">
                <span className="tv-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ border: `1px solid ${rel.cor}`, color: rel.cor }}>{rel.rotulo}</span>
                {f.tratado && f.tratado !== "nenhum" && <span className="tv-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ border: `1px solid ${tr.cor}`, color: tr.cor }}>{tr.rotulo}</span>}
              </div>
            </div>
            <div className="tv-body text-xs italic" style={{ color: T.inkDim }}>{[f.tipo, f.lider ? `líder: ${f.lider}` : "", f.poder ? `poder ${f.poder}` : ""].filter(Boolean).join(" · ")}</div>
            {f.notas && <div className="tv-body text-xs mt-1" style={{ color: T.inkDim }}>{f.notas}</div>}
            {onDiplomacia && (
              <div className="grid grid-cols-2 gap-1.5 mt-2">
                {ACOES.map((a) => (
                  <button key={a.id} onClick={() => onDiplomacia(f.nome, a.id)} title={a.dica}
                    className="tv-mono text-[10px] px-1.5 py-1.5 rounded"
                    style={{ border: `1px solid ${a.perigo ? T.danger : T.line}`, color: a.perigo ? T.danger : T.ink }}>
                    {a.rotulo}
                  </button>
                ))}
                {onPresente && (
                  <button onClick={() => onPresente(f.nome)} disabled={!faccaoJogador || (cofre || 0) < 40}
                    title={faccaoJogador ? `◉ 40 do cofre — o líder reage na ficção (pode aquecer laços… ou se ofender)` : "Presentear exige uma guilda (o cofre e os mensageiros são dela)"}
                    className="tv-mono text-[10px] px-1.5 py-1.5 rounded col-span-2"
                    style={{ border: `1px solid ${T.amber}`, color: T.amberSoft, opacity: (!faccaoJogador || (cofre || 0) < 40) ? 0.4 : 1 }}>
                    🎁 presentear · ◉ 40 do cofre
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
      <div className="tv-body text-xs" style={{ color: T.inkDim }}>Propostas são decididas na história pelo Mestre (o líder pode aceitar, exigir algo, ou recusar). Tratados firmados têm efeito real e automático na sua renda.</div>
    </div>
  );
}

/* ---------------- CORREIO DOS REINOS (v7.0) ----------------
   O jogador escreve para facções; respostas e petições chegam por tabela,
   com prazo. Todo ato oficial entre facções passa por aqui. */
