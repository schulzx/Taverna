/* ============================================================
   PAINEL DIPLOMACIA — Taverna

   v9.142: reescrito quando a decisão saiu da IA. Antes, este painel tinha
   quatro botões que mandavam a proposta para o Narrador decidir, e o
   jogador não fazia ideia do que ia acontecer nem por quê. Agora ele vê,
   antes de apertar: o que a potência quer, o que ela teme, o que ela acha
   de você — e qual seria a resposta.

   Mostrar o veredito de antemão não estraga a decisão: a decisão é o que
   você faz para MUDAR o veredito. Sem isso, apertar botão é jogar dado.
   ============================================================ */
import React from "react";
import { T } from "./constantes.js";
import { RELACOES, TRATADOS } from "./mapa.js";
import { apetitePorId, medoPorId, aprecoDe, fichaDe, custoDoPresente } from "./diplomacia.js";

const CORES = { aceita: T.ok, exige: T.amber, adia: T.inkDim, recusa: T.danger };
const ROTULO = { aceita: "aceitaria", exige: "aceitaria com condição", adia: "pediria tempo", recusa: "recusaria" };

export function PainelDiplomacia({ potencias = [], dip = null, veredito, onDiplomacia, onPresente, onCumprir, cofre = 0, temCasa = false }) {
  const fs = (potencias || []).filter((p) => p && !p.doJogador);
  if (!fs.length) {
    return <div className="tv-body text-sm italic text-center py-10" style={{ color: T.inkDim }}>Nenhuma potência conhecida ainda. As casas do mundo e as facções que aparecerem na história entram aqui — e você poderá propor comércio, aliança, vassalagem… ou declarar guerra.</div>;
  }
  const ACOES = [
    { id: "comercio", rotulo: "◉ comércio", dica: "+5% de renda por parceiro" },
    { id: "alianca", rotulo: "🤝 aliança", dica: "+5% e apoio mútuo" },
    { id: "vassalagem", rotulo: "♜ vassalagem", dica: "tributo de 10/dia — e ninguém se curva a quem é menor" },
    { id: "guerra", rotulo: "⚔ guerra", dica: "não se propõe: se declara. E custa ânimo nos seus domínios, todo dia.", perigo: true },
  ];
  return (
    <div className="space-y-2.5">
      {fs.map((p) => {
        const rel = RELACOES[p.relacao] || RELACOES.neutra;
        const tr = TRATADOS[p.tratado] || TRATADOS.nenhum;
        const ap = apetitePorId(p.apetite);
        const md = medoPorId(p.medo);
        const apreco = aprecoDe(dip, p.nome);
        const f = fichaDe(dip, p.nome);
        const custo = custoDoPresente(p);
        return (
          <div key={p.nome} className="rounded-xl p-3" style={{ background: T.panelSoft, border: `1px solid ${f.exigencia ? T.amber : T.line}` }}>
            <div className="flex items-baseline justify-between gap-2">
              <span className="tv-display text-lg leading-tight" style={{ color: T.ink }}>{p.nome}</span>
              <div className="flex gap-1.5 shrink-0">
                <span className="tv-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ border: `1px solid ${rel.cor}`, color: rel.cor }}>{rel.rotulo}</span>
                {p.tratado && p.tratado !== "nenhum" && <span className="tv-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ border: `1px solid ${tr.cor}`, color: tr.cor }}>{tr.rotulo}</span>}
              </div>
            </div>
            <div className="tv-body text-xs italic" style={{ color: T.inkDim }}>
              {[p.tipo, p.lider ? `líder: ${p.lider}` : "", p.sede ? `sede ${p.sede}` : "", `poder ${p.poder}`].filter(Boolean).join(" · ")}
            </div>

            {/* O QUE ELA QUER. Sem isto, os quatro botões são um sorteio. */}
            <div className="tv-body text-xs mt-1.5" style={{ color: T.ink }}>{ap.o}.</div>
            <div className="tv-body text-xs" style={{ color: T.inkDim }}>{md.o}.</div>

            <div className="flex items-center gap-2 mt-1.5">
              <span className="tv-mono text-[9px] uppercase tracking-wider" style={{ color: T.inkDim }}>apreço</span>
              <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: T.panel }}>
                <div className="h-full rounded-full" style={{ width: `${apreco}%`, background: apreco >= 65 ? T.ok : apreco >= 40 ? T.amberSoft : T.danger }} />
              </div>
              <span className="tv-mono text-[9px] shrink-0" style={{ color: T.inkDim }}>{apreco}/100</span>
            </div>

            {/* A CONDIÇÃO PENDENTE, se houver: é o que a mesa está esperando */}
            {f.exigencia && (
              <div className="rounded-lg px-2 py-1.5 mt-2 flex items-center gap-2" style={{ border: `1px solid ${T.amber}` }}>
                <span className="tv-body text-[11px] flex-1" style={{ color: T.amberSoft }}>Ela exige {f.exigencia.o}.</span>
                <button onClick={() => onCumprir && onCumprir(p.nome)} className="tv-mono text-[10px] px-2 py-1 rounded shrink-0"
                  style={{ background: T.amber, color: T.onAccent, fontWeight: 600 }}>cumprir</button>
              </div>
            )}

            {onDiplomacia && (
              <div className="grid grid-cols-2 gap-1.5 mt-2">
                {ACOES.map((a) => {
                  /* O VEREDITO ANTES DE APERTAR. A decisão é o que você faz
                     para mudá-lo — não adivinhar qual é. */
                  const v = veredito && a.id !== "guerra" ? veredito(p, a.id) : null;
                  const cor = v ? CORES[v.resposta] : (a.perigo ? T.danger : T.line);
                  return (
                    <button key={a.id} onClick={() => onDiplomacia(p.nome, a.id)}
                      title={v ? `${ROTULO[v.resposta]} — ${v.porques.join("; ")}` : a.dica}
                      className="tv-mono text-[10px] px-1.5 py-1.5 rounded text-left"
                      style={{ border: `1px solid ${cor}`, color: a.perigo ? T.danger : T.ink }}>
                      <div>{a.rotulo}</div>
                      {v && <div className="tv-mono text-[9px]" style={{ color: cor }}>{ROTULO[v.resposta]}</div>}
                    </button>
                  );
                })}
                {onPresente && (() => {
                  /* ---------------- O PRESENTE DIZ SE PEGA (v9.190) ----------------
                     Redesenhado em `painel-diplomacia-v2`. Todas as quatro
                     propostas desta grade mostram o veredito ANTES do clique —
                     é a lei desta tela. O presente era a única que não: ele
                     mostrava o preço, e escondia num `title` a única coisa que
                     importa, que é se ele PEGA. Num telefone o title não
                     existe, então lá o botão era um sorteio de ◉ 200.

                     `ap.presente` é o multiplicador do apreço desta potência
                     por ouro — quem mede poder não se compra com moeda, e é
                     isso que a linha de baixo passa a dizer em voz alta. */
                  const semCasa = !temCasa;
                  const semCofre = (cofre || 0) < custo;
                  const pega = ap.presente >= 1.1 ? { diz: "isto impressiona", cor: T.ok }
                    : ap.presente >= 0.9 ? { diz: "isto serve", cor: T.amberSoft }
                      : { diz: "pode soar pouco — ela não se compra com ouro", cor: T.danger };
                  return (
                    <button onClick={() => onPresente(p.nome)} disabled={semCasa || semCofre}
                      title={semCasa ? "Presentear exige uma casa (o cofre e os mensageiros são dela)" : `${ap.o}`}
                      className="tv-mono text-[10px] px-1.5 py-1.5 rounded col-span-2 text-left"
                      style={{ border: `1px solid ${T.amber}`, color: T.amberSoft, opacity: (semCasa || semCofre) ? 0.4 : 1 }}>
                      <div>🎁 presentear · ◉ {custo} do cofre</div>
                      <div className="tv-mono text-[9px]" style={{ color: semCasa ? T.inkDim : semCofre ? T.danger : pega.cor }}>
                        {semCasa ? "exige uma casa" : semCofre ? `o cofre tem ◉ ${cofre || 0}` : pega.diz}
                      </div>
                    </button>
                  );
                })()}
              </div>
            )}
          </div>
        );
      })}
      <div className="tv-body text-xs" style={{ color: T.inkDim }}>
        Quem decide é o sistema, e não o Narrador: pesa o apreço, o que ela quer, o que ela teme, o poder dos dois lados, a sua fama e o que você fez desde a última vez. O Narrador encena a resposta — ele não a escolhe. Guerra não se propõe: se declara, e ela custa ânimo nos seus domínios todo dia.
      </div>
    </div>
  );
}
