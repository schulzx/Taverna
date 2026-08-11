/* ============================================================
   OS RELÓGIOS NA TELA (v9.18) — Taverna

   Uma faixa fina acima da cena, com um anel por relógio. O anel é
   uma rosca fatiada: cada fatia cheia é um passo dado. Escolhi
   anel e não barra por um motivo prático — três barras empilhadas
   comem a altura da cena, e a cena é o jogo; três anéis de 26px
   cabem numa linha e são lidos de relance.

   A regra de desenho é a mesma do resto: o jogador tem que
   entender SEM clicar. Por isso o nome fica ao lado do anel e a
   cor diz o gênero da coisa (vermelho vem contra você, verde vem
   a favor). O detalhe — o que acontece ao encher, o que faz o
   ponteiro andar — mora no título, para quem quiser parar o mouse.

   Um anel quase cheio pulsa. É o único enfeite, e ele existe
   porque "faltam dois passos" é a informação mais acionável que
   esta faixa tem.
   ============================================================ */

import React from "react";
import { T } from "./constantes.js";
import { tipoDe, GATILHOS } from "./relogios.js";

const COR = { danger: T.danger, ok: T.ok, amber: T.amber };

function Anel({ r, tam = 26 }) {
  const t = tipoDe(r.tipo);
  const cor = COR[t.cor] || T.amber;
  const raio = tam / 2 - 2.5;
  const centro = tam / 2;
  const passo = 360 / r.segmentos;
  /* uma fatia por segmento, com um respiro de 4 graus entre elas: sem o
     respiro, um relógio de 8 vira um círculo sólido e o jogador perde a
     conta — que é justamente a única coisa que ele precisa ler aqui. */
  const fatia = (i) => {
    const a0 = (i * passo - 90 + 2) * Math.PI / 180;
    const a1 = ((i + 1) * passo - 90 - 2) * Math.PI / 180;
    const x0 = centro + raio * Math.cos(a0), y0 = centro + raio * Math.sin(a0);
    const x1 = centro + raio * Math.cos(a1), y1 = centro + raio * Math.sin(a1);
    return `M ${x0} ${y0} A ${raio} ${raio} 0 ${passo > 180 ? 1 : 0} 1 ${x1} ${y1}`;
  };
  return (
    <svg width={tam} height={tam} viewBox={`0 0 ${tam} ${tam}`} className="shrink-0">
      {Array.from({ length: r.segmentos }).map((_, i) => (
        <path key={i} d={fatia(i)} fill="none" strokeLinecap="round"
          stroke={i < r.cheios ? cor : T.line} strokeWidth={i < r.cheios ? 3.5 : 2.5}
          style={{ transition: "stroke .4s" }} />
      ))}
    </svg>
  );
}

export function FaixaRelogios({ relogios = [] }) {
  if (!relogios.length) return null;
  return (
    <div className="flex items-center gap-3 flex-wrap px-4 md:px-8 pb-1.5" style={{ paddingRight: "68px" }}>
      {relogios.map((r) => {
        const t = tipoDe(r.tipo);
        const cor = COR[t.cor] || T.amber;
        const quase = r.cheios >= r.segmentos - 1;
        return (
          <div key={r.id}
            title={`${t.rotulo}: ${r.nome}\n${r.cheios}/${r.segmentos} passos · avança ${GATILHOS[r.gatilho] ? GATILHOS[r.gatilho].rotulo : ""}${r.consequencia ? `\n\nAo encher: ${r.consequencia}` : ""}`}
            className={`flex items-center gap-1.5 rounded-full pl-1 pr-2.5 py-0.5 ${quase ? "tv-pulse" : ""}`}
            style={{ background: T.panel, border: `1px solid ${quase ? cor : T.line}` }}>
            <Anel r={r} />
            <div className="min-w-0">
              <div className="tv-body text-[11px] leading-tight truncate" style={{ color: T.ink, maxWidth: 180 }}>
                {t.icone} {r.nome}
              </div>
              <div className="tv-mono text-[8px] leading-tight" style={{ color: quase ? cor : T.inkDim }}>
                {r.cheios}/{r.segmentos}{quase ? " · quase lá" : ""}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
