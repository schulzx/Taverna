/* ============================================================
   O ROSTO (v9.126) — Taverna

   Saiu do `ui.jsx` porque passou a ter dois leitores: a bolinha do grupo e
   a carta de tarô. Se cada um desenhasse o seu, divergiriam no primeiro
   ajuste — e uma pessoa com dois rostos, dependendo de onde se olha, é o
   tipo de defeito que ninguém reporta porque parece impressão.

   Módulo sem tela e sem estado: dá traços a partir de uma semente e desenha
   uma cara. Quem embrulha em moldura é outro.
   ============================================================ */
import React from "react";
import { tracos } from "./semente.js";

/* ---------------- O ROSTO, SOZINHO (v9.126) ----------------
   Estava soldado dentro do `Retrato`, que é uma bolinha de 44 px. Quando a
   carta de tarô precisou do MESMO rosto num tamanho em que se vê a cara,
   copiar o desenho teria criado duas versões da mesma pessoa — e elas
   divergiriam no primeiro ajuste, que é como um personagem passa a ter dois
   rostos dependendo de onde você olha. Então o rosto virou peça, e os dois
   desenhos pedem a mesma peça.

   O quadro é sempre 64×64 com o rosto em (32,30); quem quiser outro tamanho
   embrulha num <g transform>. */
export function Rosto({ semente, estado = "normal" }) {
  const grave = estado === "grave", ferido = estado === "ferido", furioso = estado === "furioso";
  const sobAng = furioso ? 12 : grave ? -10 : ferido ? -5 : 0;   // + = brava, − = aflita
  const bocaCurva = furioso || grave ? -2.5 : ferido ? -1 : 2;   // + sorriso, − careta
  const t = tracos(semente);
  const cx = 32, cy = 30;
  const rostoW = t.formatoRosto === 1 ? 20 : t.formatoRosto === 2 ? 15 : 17;
  const rostoH = t.formatoRosto === 2 ? 23 : 21;
  return (
    <g>
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
    </g>
  );
}
