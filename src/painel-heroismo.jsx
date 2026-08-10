/* ============================================================
   O CANTO DO HEROÍSMO (v9.16) — Taverna

   Um selo com três losangos e um painel que abre por cima da barra
   de ação. O desenho tem uma regra só, e ela é de gameplay: o
   jogador precisa ver os pontos SEM abrir nada, senão ele esquece
   que os tem — e recurso esquecido é recurso que não existe.

   Por isso os losangos ficam sempre na tela, acesos ou apagados, e
   o painel só abre quando ele clica. Dentro, cada gasto diz o que
   faz, quanto custa e — o mais importante — POR QUE não dá para
   usar agora, quando não dá. "Refazer · só durante uma rolagem" é
   uma linha que ensina o sistema; um botão cinza sem explicação é
   uma linha que irrita.
   ============================================================ */

import React, { useState } from "react";
import { T } from "./constantes.js";
import { GASTOS, HEROISMO_MAX, validarDeclaracao } from "./heroismo.js";

/* Os losangos. Cheio = ponto na mão; vazio = espaço que cabe. */
export function SeloHeroismo({ pontos, aoAbrir, aceso }) {
  return (
    <button onClick={aoAbrir} title={`Pontos de heroísmo: ${pontos}/${HEROISMO_MAX}`}
      className="flex items-center gap-1 rounded-full px-2 py-1"
      style={{ background: aceso ? T.panel : "transparent", border: `1px solid ${pontos ? T.violet : T.line}` }}>
      {Array.from({ length: HEROISMO_MAX }).map((_, i) => (
        <span key={i} style={{
          width: 9, height: 9, display: "inline-block", transform: "rotate(45deg)",
          background: i < pontos ? T.violetSoft : "transparent",
          border: `1px solid ${i < pontos ? T.violetSoft : T.line}`,
          transition: "background .3s",
        }} />
      ))}
    </button>
  );
}

export function PainelHeroismo({ pontos, contexto, aoGastar, aoFechar }) {
  const [declarando, setDeclarando] = useState(false);
  const [texto, setTexto] = useState("");
  const [erro, setErro] = useState("");

  /* Por que cada gasto está fora de alcance AGORA. A frase é a metade
     útil do botão desativado. */
  const impedimento = (g) => {
    if (pontos < g.custo) return `precisa de ${g.custo} ponto${g.custo > 1 ? "s" : ""}`;
    if (g.id === "refazer") return "só durante uma rolagem — o botão aparece no dado";
    if (g.id === "vantagem" && !contexto.rolagemPendente) return "só com um teste esperando o dado";
    if (g.id === "aguentar" && !contexto.golpeRecente) return "só logo depois de levar dano";
    if (g.id === "declarar" && contexto.emCombate) return "não no meio da luta — o mundo já está em movimento";
    return "";
  };

  const confirmarDeclaracao = () => {
    const v = validarDeclaracao(texto);
    if (!v.ok) { setErro(v.motivo); return; }
    setErro(""); setDeclarando(false); setTexto("");
    aoGastar("declarar", v.texto);
  };

  return (
    <div className="tv-slide rounded-2xl p-3 mb-2" style={{ background: T.panelSoft, border: `1px solid ${T.violet}` }}>
      <div className="flex items-center justify-between mb-2">
        <div className="tv-mono text-[10px] uppercase tracking-widest" style={{ color: T.violetSoft }}>
          Heroísmo · {pontos}/{HEROISMO_MAX}
        </div>
        <button onClick={aoFechar} className="tv-mono text-xs px-2" style={{ color: T.inkDim }}>✕</button>
      </div>

      {!pontos && (
        <div className="tv-body text-xs mb-2" style={{ color: T.inkDim }}>
          Sem pontos. Você ganha um a cada falha crítica, ao voltar de um 0 PV, ao concluir uma missão,
          ao subir de nível — e o descanso longo garante pelo menos um.
        </div>
      )}

      {declarando ? (
        <div>
          <div className="tv-body text-xs mb-1.5" style={{ color: T.inkDim }}>
            Estabeleça um <strong style={{ color: T.ink }}>detalhe pequeno</strong> desta cena. O Mestre é obrigado a aceitar
            como verdade — mas tem que ser algo que <em>existe</em>, não algo que <em>acontece</em> a seu favor.
          </div>
          <div className="tv-body text-[11px] mb-2 italic" style={{ color: T.inkDim }}>
            Ex.: "há uma escada de serviço nos fundos" · "o taverneiro deve um favor ao meu antigo regimento" · "chove forte lá fora"
          </div>
          <input value={texto} onChange={(e) => { setTexto(e.target.value); setErro(""); }}
            onKeyDown={(e) => { if (e.key === "Enter") confirmarDeclaracao(); }}
            placeholder="o que é verdade nesta cena…" autoFocus
            className="w-full rounded-lg px-3 py-2 tv-body text-sm outline-none mb-2"
            style={{ background: T.panel, border: `1px solid ${erro ? T.danger : T.line}`, color: T.ink }} />
          {erro && <div className="tv-body text-[11px] mb-2" style={{ color: T.danger }}>{erro}</div>}
          <div className="flex gap-2">
            <button onClick={confirmarDeclaracao} className="rounded-lg px-3 py-1.5 tv-mono text-xs"
              style={{ background: T.violet, color: T.onSecond, fontWeight: 600 }}>📜 Declarar · 2 pontos</button>
            <button onClick={() => { setDeclarando(false); setErro(""); }} className="rounded-lg px-3 py-1.5 tv-mono text-xs"
              style={{ color: T.inkDim, border: `1px solid ${T.line}` }}>voltar</button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {GASTOS.map((g) => {
            const imp = impedimento(g);
            return (
              <button key={g.id} disabled={!!imp}
                onClick={() => (g.id === "declarar" ? setDeclarando(true) : aoGastar(g.id))}
                className="text-left rounded-lg px-2.5 py-1.5"
                style={{ background: imp ? "transparent" : T.panel, border: `1px solid ${imp ? T.line : T.violet}`, opacity: imp ? 0.5 : 1 }}>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[12px]">{g.icone}</span>
                  <span className="tv-body text-[13px]" style={{ color: T.ink }}>{g.rotulo}</span>
                  <span className="tv-mono text-[9px]" style={{ color: T.violetSoft }}>{g.custo} ponto{g.custo > 1 ? "s" : ""}</span>
                </div>
                <div className="tv-body text-[11px] mt-0.5" style={{ color: T.inkDim }}>
                  {imp || g.desc}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
