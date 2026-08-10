/* ============================================================
   PAINEL MAPA — pergaminho com continente, territórios e estradas (v8.8) — Taverna
   Extraído do App.jsx na modularização.
   ============================================================ */
import React from "react";
import { T } from "./constantes.js";
import { RELACOES, blobPath, centrosDeRegiao, gerarEstradas } from "./mapa.js";
import { ESTADOS_FE, estadoFe, feDaCidade, temploDaCidade, temploDe, fieisDaCidade, heresiaDaCidade, patronoDaCidade, resumoNumerico } from "./devocao.js";

export function PainelMapa({ mapa, faccaoJogador, cidadeAtual, devocao, divindade }) {
  const [selecionada, setSelecionada] = React.useState(null);
  /* CAMADAS (v8.9): o mesmo pergaminho conta duas histórias — quem manda
     (política) e quem reza (fé). A camada de fé só existe depois do despertar. */
  const desperto = !!(divindade && divindade.despertar);
  const [camada, setCamada] = React.useState("politica");
  const verFe = desperto && camada === "fe";
  const dev = devocao || { cidades: {} };
  const panteao = (divindade && divindade.panteao) || [];
  const numFe = desperto ? resumoNumerico(mapa, dev) : null;
  const corDaCidade = (c) => (verFe ? estadoFe(c, dev).cor : (RELACOES[c.relacao] || RELACOES.neutra).cor);
  /* NÉVOA (v9.14): o painel mostra só o que o herói conhece. O que falta vira
     UM número no rodapé — saber que há mundo lá fora é parte da graça; saber
     o nome dele sem nunca ter ido, não. */
  const todas = (mapa?.cidades || []);
  const cidades = todas.filter((c) => c.descoberta !== false);
  const ocultas = todas.length - cidades.length;
  const faccoes = (mapa?.faccoes || []);
  const dominadas = cidades.filter((c) => c.relacao === "jogador").length;
  const regioes = [...new Set(cidades.map((c) => c.regiao).filter(Boolean))];
  const gruposRegiao = {};
  cidades.forEach((c) => { if (c.regiao) (gruposRegiao[c.regiao] = gruposRegiao[c.regiao] || []).push(c); });
  if (cidades.length === 0) {
    return <div className="tv-body text-sm italic" style={{ color: T.inkDim }}>O mapa ainda está em branco. Conforme você explora, cidades e territórios aparecem aqui — e ficam salvos, para o mundo nunca mais se perder.</div>;
  }
  const rodapeNevoa = ocultas > 0 ? (
    <div className="tv-mono text-[10px] mt-2 px-2 py-1.5 rounded-lg" style={{ background: T.panelSoft, border: `1px dashed ${T.line}`, color: T.inkDim }}>
      🌫 Há {ocultas} {ocultas === 1 ? "lugar" : "lugares"} neste mundo que você ainda não conhece. Viaje até eles, ou compre o mapa da região num armazém ou casa de relíquias.
    </div>
  ) : null;
  return (
    <div>
      {faccaoJogador && (
        <div className="rounded-xl p-3 mb-3" style={{ background: T.panelSoft, border: `1px solid ${T.amber}` }}>
          <div className="tv-mono text-[10px] uppercase tracking-widest" style={{ color: T.amberSoft }}>Sua facção</div>
          <div className="tv-display text-xl" style={{ color: T.ink }}>{faccaoJogador}</div>
          <div className="tv-body text-xs" style={{ color: T.inkDim }}>Domina {dominadas} {dominadas === 1 ? "cidade" : "cidades"}.</div>
        </div>
      )}
      {/* alternador de camadas: quem manda × quem reza */}
      {desperto && (
        <div className="flex gap-1.5 mb-2">
          {[{ id: "politica", rotulo: "🏳 Política" }, { id: "fe", rotulo: "🙏 Fé" }].map((k) => (
            <button key={k.id} onClick={() => setCamada(k.id)}
              className="tv-mono text-[10px] px-2.5 py-1.5 rounded-full"
              style={{ background: camada === k.id ? T.amber : T.panelSoft, color: camada === k.id ? T.onAccent : T.inkDim, border: `1px solid ${camada === k.id ? T.amber : T.line}`, fontWeight: 600 }}>
              {k.rotulo}
            </button>
          ))}
        </div>
      )}
      {verFe && numFe && (
        <div className="rounded-xl p-3 mb-3" style={{ background: T.panelSoft, border: `1px solid ${T.violet}` }}>
          <div className="tv-mono text-[10px] uppercase tracking-widest" style={{ color: T.violetSoft }}>Onde o seu nome é rezado</div>
          <div className="tv-display text-xl" style={{ color: T.ink }}>{numFe.fieis.toLocaleString("pt-BR")} fiéis</div>
          <div className="tv-body text-xs" style={{ color: T.inkDim }}>
            {numFe.lugares} lugar(es) · {numFe.templos} templo(s) · {numFe.santas} cidade(s) santa(s) · {numFe.heregias} onde você é herege
            {numFe.andarilhos ? ` · ${numFe.andarilhos.toLocaleString("pt-BR")} andarilhos sem cidade` : ""}
          </div>
        </div>
      )}
      {/* mapa visual — pergaminho */}
      <div className="relative rounded-xl mb-3" style={{ border: `1px solid ${T.line}`, aspectRatio: "4 / 3", overflow: "hidden", background: "#96b7ae" }}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <defs>
            <filter id="tvPapel"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="n" /><feColorMatrix in="n" type="matrix" values="0 0 0 0 0.45 0 0 0 0 0.38 0 0 0 0 0.26 0 0 0 0.28 0" /></filter>
            <filter id="tvCosta" x="-25%" y="-25%" width="150%" height="150%"><feTurbulence type="fractalNoise" baseFrequency="0.055" numOctaves="3" seed="7" result="t" /><feDisplacementMap in="SourceGraphic" in2="t" scale="3.2" /></filter>
          </defs>
          {/* mar */}
          <rect x="0" y="0" width="100" height="100" fill="#96b7ae" />
          {/* continente (halo costeiro + terra) */}
          {cidades.length > 0 && (() => {
            const dCont = blobPath(cidades, 17, "continente|" + cidades.length);
            return (
              <g filter="url(#tvCosta)">
                <path d={dCont} fill="none" stroke="#f0e7cf" strokeWidth="2.6" opacity="0.55" />
                <path d={dCont} fill="#eadfc1" stroke="#6d5c40" strokeWidth="0.5" />
              </g>
            );
          })()}
          {/* territórios de região (tinta + divisa tracejada) —
              na camada de fé a tinta é a da cidade mais devota da região */}
          {Object.entries(gruposRegiao).map(([nomeR, csR], i) => {
            const cor = verFe
              ? corDaCidade([...csR].sort((a, b) => feDaCidade(dev, b.nome) - feDaCidade(dev, a.nome))[0])
              : (centrosDeRegiao(csR)[0] || {}).cor || "#9A93A6";
            return (
              <g key={`terr-${i}`} filter="url(#tvCosta)">
                <path d={blobPath(csR, 8.5, "regiao|" + nomeR)} fill={cor} opacity="0.14" stroke="#6d5c40" strokeOpacity="0.55" strokeWidth="0.35" strokeDasharray="1.6 1.2" />
              </g>
            );
          })}
          {/* estradas */}
          {gerarEstradas(cidades).map((rt, i) => {
            const a = cidades[rt.a], b = cidades[rt.b];
            if (!a || !b) return null;
            return <line key={`rd-${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#7a5f3d" strokeOpacity={rt.mesmaRegiao ? 0.55 : 0.35} strokeWidth={rt.mesmaRegiao ? 0.5 : 0.4} strokeDasharray={rt.mesmaRegiao ? "" : "1.2 1.2"} />;
          })}
          {/* montanhas decorativas por região */}
          {centrosDeRegiao(cidades).map((r, i) => (
            <g key={`mt-${i}`} stroke="#6d5c40" strokeWidth="0.4" fill="none" opacity="0.6">
              <path d={`M ${r.x - 4.4} ${r.y - 4.6} L ${r.x - 3} ${r.y - 6.6} L ${r.x - 1.6} ${r.y - 4.6}`} />
              <path d={`M ${r.x - 1.2} ${r.y - 4.4} L ${r.x + 0.4} ${r.y - 6.9} L ${r.x + 2} ${r.y - 4.4}`} />
              <path d={`M ${r.x + 2.4} ${r.y - 4.6} L ${r.x + 3.8} ${r.y - 6.4} L ${r.x + 5.2} ${r.y - 4.6}`} />
            </g>
          ))}
          {/* textura de papel sobre tudo */}
          <rect x="0" y="0" width="100" height="100" filter="url(#tvPapel)" opacity="0.55" />
          {/* rosa dos ventos */}
          <g transform="translate(90.5,88)">
            <path d="M0,-6.2 L1.3,-1.3 L6.2,0 L1.3,1.3 L0,6.2 L-1.3,1.3 L-6.2,0 L-1.3,-1.3 Z" fill="#5c4a30" opacity="0.85" />
            <path d="M0,-3.6 L0.9,-0.9 L3.6,0 L0.9,0.9 L0,3.6 L-0.9,0.9 L-3.6,0 L-0.9,-0.9 Z" fill="#c9a45a" transform="rotate(45)" opacity="0.9" />
            <circle r="0.7" fill="#eadfc1" />
          </g>
          {/* barra de escala */}
          <g transform="translate(6,93.5)">
            {[0, 1, 2, 3].map((k) => <rect key={k} x={k * 5} y="0" width="5" height="1.1" fill={k % 2 ? "#eadfc1" : "#5c4a30"} stroke="#5c4a30" strokeWidth="0.15" />)}
          </g>
          {/* moldura dupla */}
          <rect x="0.8" y="0.8" width="98.4" height="98.4" fill="none" stroke="#5c4a30" strokeWidth="0.7" opacity="0.8" />
          <rect x="2.2" y="2.2" width="95.6" height="95.6" fill="none" stroke="#5c4a30" strokeWidth="0.25" opacity="0.6" />
        </svg>
        {/* nomes das regiões */}
        {centrosDeRegiao(cidades).map((r, i) => (
          <div key={`rn-${i}`} style={{ position: "absolute", left: `${r.x}%`, top: `${r.y - 10}%`, transform: "translate(-50%,-50%)", pointerEvents: "none" }}>
            <div className="tv-display" style={{ fontSize: 12, color: "#5c4a30", opacity: 0.75, letterSpacing: "0.06em", whiteSpace: "nowrap", textShadow: "0 1px 1px #f0e6cc" }}>{r.regiao}</div>
          </div>
        ))}
        {/* cidades */}
        {cidades.map((c, i) => {
          const atual = cidadeAtual && c.nome.toLowerCase() === String(cidadeAtual).toLowerCase();
          const cor = corDaCidade(c);
          const est = verFe ? estadoFe(c, dev) : null;
          const templo = verFe ? temploDe(temploDaCidade(dev, c.nome)) : null;
          /* na camada de fé, cidade santa ganha halo dourado e herege, brasa vermelha */
          const halo = est && (est.chave === "santa" || est.chave === "devota") ? `0 0 10px ${est.cor}`
            : est && (est.chave === "hostil" || est.chave === "herege") ? `0 0 8px ${est.cor}`
            : (atual || selecionada === c.nome) ? "0 0 8px #c9a45a" : "0 1px 2px #00000040";
          return (
            <div key={i} style={{ position: "absolute", left: `${c.x}%`, top: `${c.y}%`, transform: "translate(-50%,-50%)", textAlign: "center" }}>
              <div onClick={() => setSelecionada(selecionada === c.nome ? null : c.nome)} style={{ width: c.sede ? 15 : 10, height: c.sede ? 15 : 10, borderRadius: c.tipo === "capital" || c.sede ? 3 : "50%", background: cor, border: (atual || selecionada === c.nome) ? `2px solid #3a2e1c` : `1.5px solid #3a2e1c`, boxShadow: halo, margin: "0 auto", cursor: "pointer" }} />
              <div className="tv-mono" style={{ fontSize: 7, color: "#3a2e1c", marginTop: 1, whiteSpace: "nowrap", fontWeight: 600, textShadow: "0 1px 2px #f0e6cc, 0 -1px 2px #f0e6cc" }}>
                {templo ? `${templo.icone} ` : ""}{c.nome}{c.sede ? " ★" : ""}{verFe && feDaCidade(dev, c.nome) >= 8 ? ` ${Math.round(feDaCidade(dev, c.nome))}%` : ""}
              </div>
            </div>
          );
        })}
      </div>
      {/* legenda — muda com a camada */}
      <div className="flex flex-wrap gap-2 mb-3">
        {(verFe ? Object.entries(ESTADOS_FE) : Object.entries(RELACOES)).map(([k, v]) => (
          <div key={k} className="flex items-center gap-1"><span style={{ width: 8, height: 8, borderRadius: "50%", background: v.cor, display: "inline-block" }} /><span className="tv-mono text-[9px]" style={{ color: T.inkDim }}>{v.rotulo}</span></div>
        ))}
      </div>
      {/* facções conhecidas */}
      {faccoes.length > 0 && (
        <div className="mb-3">
          <div className="tv-mono text-[10px] uppercase tracking-widest mb-1.5" style={{ color: T.inkDim }}>Facções</div>
          <div className="space-y-1.5">
            {faccoes.map((f, i) => {
              const rel = RELACOES[f.relacao] || RELACOES.neutra;
              return (
                <div key={i} className="rounded-lg px-3 py-2 flex items-center justify-between gap-2" style={{ background: T.panelSoft, border: `1px solid ${T.line}` }}>
                  <div><span className="tv-body text-sm" style={{ color: T.ink }}>{f.nome}</span>{f.lider ? <span className="tv-body text-xs" style={{ color: T.inkDim }}> · {f.lider}</span> : null}</div>
                  <span className="tv-mono text-[9px] px-1.5 py-0.5 rounded shrink-0" style={{ color: rel.cor, border: `1px solid ${rel.cor}` }}>{rel.rotulo}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {/* lista de cidades por região */}
      <div className="tv-mono text-[10px] uppercase tracking-widest mb-1.5" style={{ color: T.inkDim }}>Cidades ({cidades.length})</div>
      <div className="space-y-2">
        {cidades.map((c, i) => {
          const rel = RELACOES[c.relacao] || RELACOES.neutra;
          const aberta = selecionada === c.nome;
          const atual = cidadeAtual && c.nome.toLowerCase() === String(cidadeAtual).toLowerCase();
          const est = desperto ? estadoFe(c, dev) : null;
          const fe = desperto ? feDaCidade(dev, c.nome) : 0;
          const templo = desperto ? temploDe(temploDaCidade(dev, c.nome)) : null;
          const etiqueta = verFe && est ? { rotulo: est.rotulo, cor: est.cor } : { rotulo: rel.rotulo, cor: rel.cor };
          const patrono = desperto ? patronoDaCidade(c, panteao) : null;
          return (
            <div key={i} className="rounded-lg px-3 py-2" style={{ background: T.panelSoft, border: `1px solid ${aberta ? T.amber : atual ? T.amberSoft : T.line}`, cursor: "pointer" }} onClick={() => setSelecionada(aberta ? null : c.nome)}>
              <div className="flex items-center justify-between gap-2">
                <span className="tv-body text-sm" style={{ color: T.ink }}>{c.sede ? "★ " : ""}{atual ? "📍 " : ""}{templo ? `${templo.icone} ` : ""}{c.nome}</span>
                <span className="tv-mono text-[9px] px-1.5 py-0.5 rounded shrink-0" style={{ color: etiqueta.cor, border: `1px solid ${etiqueta.cor}` }}>{etiqueta.rotulo}</span>
              </div>
              <div className="tv-body text-xs mt-0.5" style={{ color: T.inkDim }}>{c.tipo}{c.regiao ? ` · ${c.regiao}` : ""}{c.faccao ? ` · ${c.faccao}` : ""}</div>
              {verFe && (
                <div className="mt-1.5">
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: T.panel }}>
                    <div className="h-full rounded-full" style={{ width: `${Math.round(fe)}%`, background: est.cor }} />
                  </div>
                  <div className="tv-mono text-[9px] mt-0.5" style={{ color: T.inkDim }}>
                    {Math.round(fe)}% devotos · ≈{fieisDaCidade(c, dev).toLocaleString("pt-BR")} fiéis
                    {templo ? ` · ${templo.nome}` : ""}
                    {patrono && heresiaDaCidade(c, dev) >= 25 ? ` · culto de ${patrono.nome} resiste (${heresiaDaCidade(c, dev)}%)` : ""}
                  </div>
                </div>
              )}
              {aberta && (verFe || c.notas || (c.locais || []).length > 0) && (
                <div className="mt-2 pt-2" style={{ borderTop: `1px solid ${T.line}` }}>
                  {verFe && est && <div className="tv-body text-xs mb-1" style={{ color: est.cor }}>{est.icone} Ao chegar: {est.recepcao}.</div>}
                  {c.notas && <div className="tv-body text-xs" style={{ color: T.inkDim }}>{c.notas}</div>}
                  {(c.locais || []).length > 0 && <div className="tv-body text-xs mt-1" style={{ color: T.violetSoft }}>Locais: {c.locais.join(", ")}</div>}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {rodapeNevoa}
    </div>
  );
}

/* Painel de PESSOAS: todo o elenco conhecido, com retrato determinístico,
   relação colorida e o que se sabe de cada um. Segredos ficam FORA da tela —
   são memória do Mestre, não spoiler para o jogador. */
