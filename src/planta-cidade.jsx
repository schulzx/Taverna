/* ============================================================
   A PLANTA DA CIDADE (v9.51) — a segunda escala do mapa

   O mundo já era gerado inteiro na criação: vinte cidades com bioma,
   região e estrada, e dentro de cada uma a taverna, a forja, o
   cemitério, a gente com nome e vontade. Nada disso o jogador via. O
   painel de mapa mostrava o continente — pontos e estradas — e a
   cidade era um ponto entre outros.

   Aqui o mesmo pergaminho ganha a segunda escala. É uma PLANTA, não um
   mapa: muralha, portões, a rua que corta, a praça no meio, e os
   locais que a base já tinha inventado ocupando os quarteirões.

   TRÊS DECISÕES:

   1) A CIDADE NÃO TEM NÉVOA. Quem passa uma tarde numa vila sabe onde
      é a forja — não é descoberta, é paisagem. O que continua escondido
      é o que está DENTRO dela (quem, o quê, o segredo), que é a
      matéria do teste de percepção e do achado.

   2) A PLANTA É DETERMINÍSTICA. Mesma semente, mesma cidade, mesma
      planta para sempre — a forja fica onde ficava na primeira visita,
      e é isso que faz a cidade virar lugar em vez de cenário.

   3) OS ARREDORES ENTRAM AQUI. A fazenda e o moinho não são cidade nem
      viagem: são o cinturão em volta, a minutos de caminhada. Ficam
      fora da muralha, ligados por trilha, e é daqui que o jogador
      descobre que eles existem.
   ============================================================ */

import React from "react";
import { T } from "./constantes.js";
import { rngDe } from "./geografia.js";
import { locaisDaCidade } from "./mundo-base.js";
import { arredoresDaCidade, tempoDeIda } from "./arredores.js";

/* A muralha: um polígono irregular deterministicamente amassado, para
   nenhuma cidade sair redonda de compasso. */
function muralha(rnd, raio = 33) {
  const pontos = [];
  const lados = 11;
  for (let i = 0; i < lados; i++) {
    const a = (i / lados) * Math.PI * 2;
    const r = raio * (0.86 + rnd() * 0.26);
    pontos.push([50 + Math.cos(a) * r * 1.18, 50 + Math.sin(a) * r]);
  }
  return "M " + pontos.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L ") + " Z";
}

/* Onde cada local se planta. A praça fica no meio; o resto se distribui
   em dois anéis, para uma capital de sete locais não virar uma fila. */
function plantarLocais(rnd, locais) {
  const n = locais.length;
  return locais.map((l, i) => {
    if (l.tipo === "mercado") return { ...l, x: 50, y: 50, praca: true };
    const anel = i % 2 === 0 ? 17 : 26;
    const a = (i / Math.max(1, n - 1)) * Math.PI * 2 + rnd() * 0.5;
    return { ...l, x: 50 + Math.cos(a) * anel * 1.15, y: 50 + Math.sin(a) * anel };
  });
}

export function PlantaCidade({ semente, cidade, genero, molde, lugar, aoSelecionar, selecionado }) {
  if (!cidade || !cidade.nome) {
    return <div className="tv-body text-sm italic" style={{ color: T.inkDim }}>Você não está em cidade nenhuma agora — o mapa do mundo mostra onde você anda.</div>;
  }
  const rnd = rngDe(`${semente}|planta|${cidade.nome}`);
  const locais = plantarLocais(rnd, locaisDaCidade(semente, cidade, genero, molde));
  const fora = arredoresDaCidade(semente, cidade);
  const dMuro = muralha(rngDe(`${semente}|muro|${cidade.nome}`));
  /* onde o herói está: dentro dos muros, ou num dos arredores */
  const noArredor = lugar && fora.find((a) => a.nome.toLowerCase() === String(lugar.nome || "").toLowerCase());

  return (
    <div>
      <div className="relative rounded-xl mb-3" style={{ border: `1px solid ${T.line}`, aspectRatio: "1 / 1", overflow: "hidden", background: "#dcd0ae" }}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <defs>
            <filter id="tvPapelC"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="n" /><feColorMatrix in="n" type="matrix" values="0 0 0 0 0.45 0 0 0 0 0.38 0 0 0 0 0.26 0 0 0 0.24 0" /></filter>
          </defs>
          {/* campo em volta */}
          <rect x="0" y="0" width="100" height="100" fill="#cfc49f" />
          {/* trilhas até os arredores — saem do centro e furam a muralha */}
          {fora.map((a, i) => {
            const px = 50 + Math.cos(a.ang) * 47, py = 50 + Math.sin(a.ang) * 47;
            return <line key={`tr-${i}`} x1="50" y1="50" x2={px} y2={py} stroke="#a08a5e" strokeWidth="0.7" strokeDasharray="2 1.6" opacity="0.75" />;
          })}
          {/* dentro dos muros */}
          <path d={dMuro} fill="#eadfc1" stroke="#6d5c40" strokeWidth="1.4" />
          <path d={dMuro} fill="none" stroke="#8d7a56" strokeWidth="0.4" />
          {/* as duas ruas-mestras e a praça */}
          <line x1="50" y1="12" x2="50" y2="88" stroke="#c8b98f" strokeWidth="3.2" />
          <line x1="12" y1="50" x2="88" y2="50" stroke="#c8b98f" strokeWidth="3.2" />
          <circle cx="50" cy="50" r="8" fill="#c8b98f" />
          <circle cx="50" cy="50" r="8" fill="none" stroke="#a08a5e" strokeWidth="0.3" />
          {/* portões: onde a rua encontra o muro */}
          {[[50, 13], [50, 87], [13, 50], [87, 50]].map(([x, y], i) => (
            <rect key={`pt-${i}`} x={x - 2} y={y - 1.2} width="4" height="2.4" fill="#6d5c40" opacity="0.9" rx="0.5" />
          ))}
          <rect x="0" y="0" width="100" height="100" filter="url(#tvPapelC)" opacity="0.5" />
          <rect x="0.8" y="0.8" width="98.4" height="98.4" fill="none" stroke="#5c4a30" strokeWidth="0.7" opacity="0.8" />
        </svg>
        {/* os locais de dentro */}
        {locais.map((l, i) => {
          const aberto = selecionado === l.id;
          return (
            <div key={l.id} style={{ position: "absolute", left: `${l.x}%`, top: `${l.y}%`, transform: "translate(-50%,-50%)", textAlign: "center", cursor: "pointer" }}
              onClick={() => aoSelecionar && aoSelecionar(aberto ? null : l.id)}>
              <div style={{ fontSize: l.praca ? 15 : 13, lineHeight: 1, filter: aberto ? "drop-shadow(0 0 5px #c9a45a)" : "drop-shadow(0 1px 1px #00000030)" }}>{l.icone}</div>
              <div className="tv-mono" style={{ fontSize: 6.5, color: "#3a2e1c", marginTop: 1, whiteSpace: "nowrap", fontWeight: 600, textShadow: "0 1px 2px #f0e6cc, 0 -1px 2px #f0e6cc" }}>{l.nome}</div>
            </div>
          );
        })}
        {/* o cinturão de fora */}
        {fora.map((a, i) => {
          const px = 50 + Math.cos(a.ang) * 44, py = 50 + Math.sin(a.ang) * 44;
          const aberto = selecionado === a.id;
          return (
            <div key={a.id} style={{ position: "absolute", left: `${px}%`, top: `${py}%`, transform: "translate(-50%,-50%)", textAlign: "center", cursor: "pointer" }}
              onClick={() => aoSelecionar && aoSelecionar(aberto ? null : a.id)}>
              <div style={{ fontSize: 12, lineHeight: 1, opacity: 0.92, filter: aberto ? "drop-shadow(0 0 5px #c9a45a)" : "none" }}>{a.icone}</div>
              <div className="tv-mono" style={{ fontSize: 6, color: "#4a3c26", marginTop: 1, whiteSpace: "nowrap", textShadow: "0 1px 2px #dcd0ae" }}>{a.nome}</div>
            </div>
          );
        })}
        {/* VOCÊ */}
        {(() => {
          const p = noArredor ? { x: 50 + Math.cos(noArredor.ang) * 44, y: 50 + Math.sin(noArredor.ang) * 44 } : { x: 50, y: 50 };
          return (
            <div style={{ position: "absolute", left: `${p.x}%`, top: `${p.y}%`, transform: "translate(-50%,-50%)", pointerEvents: "none", textAlign: "center" }}>
              <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#f0e6cc", border: "2.5px solid #b4322e", boxShadow: "0 0 9px #b4322e", margin: "0 auto" }} />
            </div>
          );
        })()}
        {/* o nome da cidade, em cima */}
        <div style={{ position: "absolute", left: "50%", top: 6, transform: "translateX(-50%)", pointerEvents: "none" }}>
          <div className="tv-display" style={{ fontSize: 13, color: "#5c4a30", letterSpacing: "0.08em", whiteSpace: "nowrap", textShadow: "0 1px 2px #f0e6cc" }}>{cidade.nome}</div>
        </div>
      </div>

      <div className="tv-mono text-[10px] uppercase tracking-widest mb-1.5" style={{ color: T.inkDim }}>Dentro dos muros ({locais.length})</div>
      <div className="space-y-1.5 mb-3">
        {locais.map((l) => (
          <div key={l.id} className="rounded-lg px-3 py-2 flex items-center gap-2" onClick={() => aoSelecionar && aoSelecionar(selecionado === l.id ? null : l.id)}
            style={{ background: T.panelSoft, border: `1px solid ${selecionado === l.id ? T.amber : T.line}`, cursor: "pointer" }}>
            <span style={{ fontSize: 14 }}>{l.icone}</span>
            <span className="tv-body text-sm" style={{ color: T.ink }}>{l.nome}</span>
            <span className="tv-mono text-[9px] ml-auto" style={{ color: T.inkDim }}>{l.tipo}</span>
          </div>
        ))}
      </div>

      {fora.length > 0 && (
        <>
          <div className="tv-mono text-[10px] uppercase tracking-widest mb-1.5" style={{ color: T.inkDim }}>Fora dos muros ({fora.length})</div>
          <div className="space-y-1.5">
            {fora.map((a) => (
              <div key={a.id} className="rounded-lg px-3 py-2" onClick={() => aoSelecionar && aoSelecionar(selecionado === a.id ? null : a.id)}
                style={{ background: T.panelSoft, border: `1px solid ${selecionado === a.id ? T.amber : noArredor && noArredor.id === a.id ? T.amberSoft : T.line}`, cursor: "pointer" }}>
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 14 }}>{a.icone}</span>
                  <span className="tv-body text-sm" style={{ color: T.ink }}>{noArredor && noArredor.id === a.id ? "📍 " : ""}{a.nome}</span>
                  <span className="tv-mono text-[9px] ml-auto shrink-0" style={{ color: T.violetSoft }}>{tempoDeIda(a)}</span>
                </div>
                {selecionado === a.id && <div className="tv-body text-xs mt-1" style={{ color: T.inkDim }}>Mora lá: {a.dono}.</div>}
              </div>
            ))}
          </div>
        </>
      )}
      <div className="tv-mono text-[10px] mt-3 px-2 py-1.5 rounded-lg" style={{ background: T.panelSoft, border: `1px dashed ${T.line}`, color: T.inkDim }}>
        A planta não tem névoa: uma tarde na cidade basta para saber onde ficam as coisas. O que há DENTRO delas — quem, o quê, o segredo — continua sendo descoberta sua.
      </div>
    </div>
  );
}
