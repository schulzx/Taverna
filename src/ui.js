/* ============================================================
   PRIMITIVAS DE INTERFACE (v8.8) — Taverna
   Botão, ícones, barra, retrato procedural e utilitários de
   semente. Compartilhados por todos os painéis.
   Extraído do App.jsx na modularização.
   ============================================================ */
import React from "react";
import { T } from "./constantes.js";

export function Botao({ children, onClick, primario, desativado, pequeno, className = "" }) {
  return (
    <button onClick={onClick} disabled={desativado}
      className={`tv-mono rounded-lg transition-all ${pequeno ? "px-3 py-1.5 text-xs" : "px-5 py-3 text-sm"} ${className}`}
      style={{
        background: primario ? T.amber : "transparent",
        color: primario ? T.onAccent : T.inkDim,
        border: primario ? "none" : `1px solid ${T.line}`,
        opacity: desativado ? 0.4 : 1, cursor: desativado ? "not-allowed" : "pointer",
        fontWeight: 600, letterSpacing: "0.04em",
      }}>
      {children}
    </button>
  );
}

export function IconeD20({ tamanho = 22, cor = T.amber }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="none">
      <path d="M12 2 L21 7.5 L21 16.5 L12 22 L3 16.5 L3 7.5 Z" stroke={cor} strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M12 2 L12 8.5 M12 8.5 L3 7.5 M12 8.5 L21 7.5 M12 8.5 L6.5 15.5 M12 8.5 L17.5 15.5 M6.5 15.5 L3 7.5 M17.5 15.5 L21 7.5 M6.5 15.5 L12 22 M17.5 15.5 L12 22 M6.5 15.5 L17.5 15.5" stroke={cor} strokeWidth="0.9" strokeLinejoin="round" opacity="0.7" />
    </svg>
  );
}

export function IconeCaneca({ tamanho = 20, cor = T.inkDim }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="none">
      <path d="M6 6 h10 v13 a1.5 1.5 0 0 1 -1.5 1.5 h-7 A1.5 1.5 0 0 1 6 19 Z" stroke={cor} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M16 9.5 h2.2 a2 2 0 0 1 2 2 v2.5 a2 2 0 0 1 -2 2 H16" stroke={cor} strokeWidth="1.5" />
      <path d="M6 6 c1 -2.2 9 -2.2 10 0" stroke={cor} strokeWidth="1.5" />
      <path d="M9 10 v7 M12.5 10 v7" stroke={cor} strokeWidth="1.1" opacity="0.55" />
    </svg>
  );
}

export function BarraMini({ rotulo, atual, max, cor, corBaixa }) {
  const pct = Math.max(0, Math.min(100, max > 0 ? (atual / max) * 100 : 0));
  const baixa = pct <= 33;
  return (
    <div className="flex items-center gap-1.5 min-w-0">
      <span className="tv-mono text-[10px] shrink-0" style={{ color: T.inkDim }}>{rotulo}</span>
      <div className="h-1.5 rounded-full flex-1 min-w-[32px] max-w-[90px] overflow-hidden" style={{ background: T.bg }}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: baixa && corBaixa ? corBaixa : cor }} />
      </div>
      <span className="tv-mono text-[10px] shrink-0" style={{ color: baixa && corBaixa ? corBaixa : T.ink }}>{atual}/{max}</span>
    </div>
  );
}

/* ---------------- Retratos determinísticos (rosto consistente) ----------------
   O rosto de cada personagem é derivado de uma "semente" (o nome + um sufixo fixo
   criado na criação). O mesmo personagem gera SEMPRE o mesmo rosto — sem IA de
   imagem, sem custo, instantâneo, e com consistência perfeita entre cenas.
   Vestimenta/equipamento podem mudar por cima; o rosto nunca muda. */

export function hashSemente(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0);
}
/* gerador pseudoaleatório determinístico a partir da semente */
export function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
}
export function escolher(rand, arr) { return arr[Math.floor(rand() * arr.length)]; }

export const PELE = ["#F2D2B6", "#E8B893", "#D89B6E", "#B87A4E", "#8C5A38", "#6B4226", "#F5DCC4", "#C68A5E"];
export const CABELO = ["#1A1310", "#3B2415", "#6B4226", "#A6641E", "#C9A227", "#8C8C8C", "#D8D8D8", "#5B2A86", "#7A1F1F", "#2E4A3B"];
export const OLHOS = ["#4A3728", "#5B7A3A", "#3A5A7A", "#6B4226", "#3B3B3B", "#7A5A2E"];

/* deriva os traços visuais a partir da semente (determinístico) */
export function tracos(semente) {
  const rand = rng(hashSemente(semente || "herói"));
  return {
    pele: escolher(rand, PELE),
    cabelo: escolher(rand, CABELO),
    olhos: escolher(rand, OLHOS),
    formatoRosto: Math.floor(rand() * 3),   // 0 oval, 1 quadrado, 2 fino
    penteado: Math.floor(rand() * 5),
    barba: rand() < 0.45 ? Math.floor(rand() * 3) + 1 : 0,
    sobrancelha: 0.2 + rand() * 0.3,
    marca: rand() < 0.3 ? Math.floor(rand() * 3) : -1, // cicatriz/pintura
    fundo: escolher(rand, ["#241C33", "#2A2036", "#1E2A33", "#33241C", "#2A2A33"]),
  };
}

/* estado: "normal" | "ferido" (PV ≤ 2/3) | "grave" (PV ≤ 1/3) | "furioso" (inimigo pressionado).
   O ROSTO BASE nunca muda (mesma semente = mesmos traços); só expressão e marcas mudam. */
export function estadoDe(vida, vidaMax, inimigo = false) {
  const r = vidaMax > 0 ? vida / vidaMax : 1;
  if (inimigo) return r <= 0.25 ? "grave" : r <= 0.55 ? "furioso" : "normal";
  return r <= 0.33 ? "grave" : r <= 0.66 ? "ferido" : "normal";
}

export function Retrato({ semente, tamanho = 44, anel = T.line, corSubstituta, estado = "normal" }) {
  const grave = estado === "grave", ferido = estado === "ferido", furioso = estado === "furioso";
  const sobAng = furioso ? 12 : grave ? -10 : ferido ? -5 : 0;   // + = brava, − = aflita
  const bocaCurva = furioso || grave ? -2.5 : ferido ? -1 : 2;   // + sorriso, − careta
  const t = tracos(semente);
  const cx = 32, cy = 30;
  const rostoW = t.formatoRosto === 1 ? 20 : t.formatoRosto === 2 ? 15 : 17;
  const rostoH = t.formatoRosto === 2 ? 23 : 21;
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 64 64" style={{ borderRadius: "50%", border: `2px solid ${anel}`, background: corSubstituta || t.fundo, display: "block" }}>
      {/* pescoço */}
      <rect x={cx - 6} y={cy + 12} width="12" height="12" rx="3" fill={t.pele} />
      {/* cabelo atrás */}
      {t.penteado !== 4 && <ellipse cx={cx} cy={cy - 2} rx={rostoW + 3} ry={rostoH} fill={t.cabelo} />}
      {/* rosto */}
      <ellipse cx={cx} cy={cy} rx={rostoW} ry={rostoH} fill={t.pele} />
      {/* orelhas */}
      <circle cx={cx - rostoW} cy={cy + 2} r="3" fill={t.pele} />
      <circle cx={cx + rostoW} cy={cy + 2} r="3" fill={t.pele} />
      {/* cabelo na frente (penteados) */}
      {t.penteado === 0 && <path d={`M${cx - rostoW - 2} ${cy - 4} Q${cx} ${cy - rostoH - 6} ${cx + rostoW + 2} ${cy - 4} Q${cx} ${cy - rostoH + 2} ${cx - rostoW - 2} ${cy - 4}`} fill={t.cabelo} />}
      {t.penteado === 1 && <path d={`M${cx - rostoW - 2} ${cy - 6} Q${cx - 4} ${cy - rostoH - 4} ${cx + rostoW + 2} ${cy - 8} L${cx + rostoW} ${cy - 2} Q${cx} ${cy - rostoH + 1} ${cx - rostoW - 2} ${cy - 2} Z`} fill={t.cabelo} />}
      {t.penteado === 2 && <><ellipse cx={cx} cy={cy - rostoH + 2} rx={rostoW} ry="7" fill={t.cabelo} /><rect x={cx - rostoW - 3} y={cy - 6} width="3" height="16" rx="1.5" fill={t.cabelo} /><rect x={cx + rostoW} y={cy - 6} width="3" height="16" rx="1.5" fill={t.cabelo} /></>}
      {t.penteado === 3 && <path d={`M${cx - rostoW - 1} ${cy - 3} Q${cx} ${cy - rostoH - 7} ${cx + rostoW + 1} ${cy - 3} L${cx + rostoW + 1} ${cy - 8} Q${cx} ${cy - rostoH - 2} ${cx - rostoW - 1} ${cy - 8} Z`} fill={t.cabelo} />}
      {t.penteado === 4 && <path d={`M${cx - rostoW + 2} ${cy - rostoH + 4} Q${cx} ${cy - rostoH - 3} ${cx + rostoW - 2} ${cy - rostoH + 4}`} stroke={t.cabelo} strokeWidth="3" fill="none" strokeLinecap="round" />}
      {/* sobrancelhas com ângulo de expressão */}
      <rect x={cx - 9} y={cy - 4} width="6" height="1.6" rx="0.8" fill={t.cabelo} opacity={t.sobrancelha + 0.4} transform={`rotate(${-sobAng} ${cx - 6} ${cy - 3})`} />
      <rect x={cx + 3} y={cy - 4} width="6" height="1.6" rx="0.8" fill={t.cabelo} opacity={t.sobrancelha + 0.4} transform={`rotate(${sobAng} ${cx + 6} ${cy - 3})`} />
      {/* olhos (semicerrados quando furioso; olheiras quando grave) */}
      <ellipse cx={cx - 6} cy={cy} rx="2.4" ry={furioso ? 2 : 2.8} fill="#FFF" />
      <ellipse cx={cx + 6} cy={cy} rx="2.4" ry={furioso ? 2 : 2.8} fill="#FFF" />
      <circle cx={cx - 6} cy={cy + 0.5} r="1.5" fill={t.olhos} />
      <circle cx={cx + 6} cy={cy + 0.5} r="1.5" fill={t.olhos} />
      {grave && <><path d={`M${cx - 8.5} ${cy + 3} q2.5 1.5 5 0`} stroke="#00000022" strokeWidth="1" fill="none" /><path d={`M${cx + 3.5} ${cy + 3} q2.5 1.5 5 0`} stroke="#00000022" strokeWidth="1" fill="none" /></>}
      {/* nariz */}
      <path d={`M${cx} ${cy} L${cx - 1.5} ${cy + 5} Q${cx} ${cy + 6.5} ${cx + 1.5} ${cy + 5}`} stroke={t.pele} strokeWidth="1" fill="none" style={{ filter: "brightness(0.8)" }} />
      <path d={`M${cx} ${cy + 1} L${cx - 1.5} ${cy + 5} Q${cx} ${cy + 6} ${cx + 1.5} ${cy + 5}`} stroke="#00000022" strokeWidth="1" fill="none" />
      {/* boca com curva de expressão */}
      <path d={`M${cx - 4} ${cy + 9 - bocaCurva / 2} Q${cx} ${cy + 9 + bocaCurva} ${cx + 4} ${cy + 9 - bocaCurva / 2}`} stroke="#00000044" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      {furioso && <path d={`M${cx - 3} ${cy + 10.5} L${cx + 3} ${cy + 10.5}`} stroke="#00000033" strokeWidth="0.8" />}
      {/* barba */}
      {t.barba === 1 && <path d={`M${cx - rostoW + 2} ${cy + 6} Q${cx} ${cy + rostoH + 4} ${cx + rostoW - 2} ${cy + 6} Q${cx} ${cy + rostoH - 2} ${cx - rostoW + 2} ${cy + 6}`} fill={t.cabelo} opacity="0.9" />}
      {t.barba === 2 && <ellipse cx={cx} cy={cy + rostoH - 4} rx="6" ry="5" fill={t.cabelo} opacity="0.9" />}
      {t.barba === 3 && <path d={`M${cx - 8} ${cy + 8} Q${cx} ${cy + 10} ${cx + 8} ${cy + 8} Q${cx + 6} ${cy + 16} ${cx} ${cy + 16} Q${cx - 6} ${cy + 16} ${cx - 8} ${cy + 8}`} fill={t.cabelo} opacity="0.85" />}
      {/* marca/cicatriz */}
      {t.marca === 0 && <line x1={cx + 5} y1={cy - 6} x2={cx + 8} y2={cy + 4} stroke="#00000055" strokeWidth="1" />}
      {t.marca === 1 && <path d={`M${cx - 10} ${cy - 2} q2 -3 4 0`} stroke="#7A1F1F" strokeWidth="1.2" fill="none" opacity="0.6" />}
      {t.marca === 2 && <circle cx={cx - 7} cy={cy + 6} r="1" fill="#00000033" />}
      {/* estado por cima (não altera o rosto base) */}
      {grave && <ellipse cx={cx} cy={cy} rx={rostoW} ry={rostoH} fill="#00000018" />}
      {(ferido || grave) && <line x1={cx - rostoW + 4} y1={cy + 3} x2={cx - rostoW + 8} y2={cy + 7} stroke="#7A1F1F" strokeWidth="1.3" opacity="0.8" />}
      {grave && <><rect x={cx - 2} y={cy - rostoH + 3} width="11" height="3.5" rx="1.7" fill="#D8D0C0" transform={`rotate(18 ${cx} ${cy - rostoH + 4})`} /><circle cx={cx + rostoW - 4} cy={cy + 8} r="1.4" fill="#7A1F1F" opacity="0.7" /></>}
    </svg>
  );
}

/* semente estável do personagem: fixada na criação e nunca mais alterada */
export function sementeDe(ent) {
  return ent?.semente || ent?.nome || "herói";
}
