/* ============================================================
   A CARTA DE TARÔ (v9.126) — Taverna

   O jogo já tinha rosto: `tracos()` deriva pele, cabelo, olhos, penteado,
   barba e cicatriz de uma semente fixada na criação, e o mesmo personagem
   dá sempre a mesma cara — de graça, instantâneo, e para um elenco que não
   tem fim. O que faltava era um lugar onde esse rosto fosse GRANDE.

   Numa bolinha de 44 px o rosto é um crachá: serve para não confundir dois
   companheiros. A carta é outra coisa — é onde a pessoa vira uma FIGURA,
   com moldura, nicho, emblema e nome gravado. E como a moldura é desenho, e
   não arquivo, ela custa zero byte e vale para o mendigo do beco e para a
   nêmesis da campanha igualmente.

   TRÊS COISAS SÃO DERIVADAS, E NENHUMA É SORTEADA NA HORA:
   - o NÚMERO da carta é o nível, em romano. Uma carta cujo número sobe é a
     única numeração honesta aqui: diz onde a pessoa está agora, e muda com
     ela.
   - o NAIPE é o atributo mais alto. Não é enfeite: é a frase mais curta que
     se pode dizer sobre alguém que ainda não se conhece, e sai de um número
     que o sistema já tem.
   - a VESTE e o fundo saem da semente, então a carta de Fulano é sempre a
     mesma carta.

   Zero decisão nova. Tudo o que aparece aqui já era calculado.
   ============================================================ */
import React from "react";
import { T, ATRIBUTOS } from "./constantes.js";
import { tracos, sementeDe, estadoDe, hashSemente, rng, escolher } from "./semente.js";
import { Rosto } from "./rosto.jsx";
import { romano, naipeDe } from "./taro.js";
import { chamadoDaRaca } from "./lexico.js";

/* O EMBLEMA DE CADA NAIPE. Quem escolhe o naipe é o `taro.js`; aqui só há
   traço. Cada desenho cabe num quadro de 24×24 com o centro em (12,12),
   para poder ser carimbado em qualquer tamanho sem recontar coordenada. */
const EMBLEMAS = {
  forca: (c) => (<g stroke={c} strokeWidth="1.4" fill="none" strokeLinecap="round"><path d="M12 3 L12 17" /><path d="M8 15 L16 15" /><path d="M12 17 L10.5 20 L12 21.5 L13.5 20 Z" fill={c} stroke="none" /><path d="M12 3 L10.6 5 L12 6 L13.4 5 Z" fill={c} stroke="none" /></g>),
  destreza: (c) => (<g stroke={c} strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20 L19 5" /><path d="M13 5 L19 5 L19 11" /><path d="M4 20 L4 16 M4 20 L8 20" /></g>),
  vigor: (c) => (<g stroke={c} strokeWidth="1.4" fill="none" strokeLinejoin="round"><path d="M12 3 L20 6 V12 C20 16.5 16.5 19.8 12 21.5 C7.5 19.8 4 16.5 4 12 V6 Z" /><path d="M12 7.5 V16" opacity="0.6" /><path d="M8 11 H16" opacity="0.6" /></g>),
  intelecto: (c) => (<g stroke={c} strokeWidth="1.4" fill="none" strokeLinejoin="round"><path d="M12 6.5 C10 4.8 7 4.4 4 5 V18 C7 17.4 10 17.8 12 19.5 C14 17.8 17 17.4 20 18 V5 C17 4.4 14 4.8 12 6.5 Z" /><path d="M12 6.5 V19.5" opacity="0.6" /></g>),
  presenca: (c) => (<g stroke={c} strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 4 H17.5 L16 11 C15.4 13.4 13.8 14.6 12 14.6 C10.2 14.6 8.6 13.4 8 11 Z" /><path d="M12 14.6 V19" /><path d="M8 20.5 H16" /></g>),
  percepcao: (c) => (<g stroke={c} strokeWidth="1.4" fill="none" strokeLinejoin="round"><path d="M2.5 12 C6 7 9 5.5 12 5.5 C15 5.5 18 7 21.5 12 C18 17 15 18.5 12 18.5 C9 18.5 6 17 2.5 12 Z" /><circle cx="12" cy="12" r="3.2" /><circle cx="12" cy="12" r="1" fill={c} stroke="none" /></g>),
};

const VESTES = ["#6B1F2E", "#23385E", "#2C4A38", "#5A3B14", "#3A3350", "#4A2340", "#1F4448", "#5A2A1E"];
const FORROS = ["#C9A227", "#B0A5EC", "#7BC98F", "#E8A33D", "#D86A5B", "#EAE4D6"];

/* ---------------- A CARTA ---------------- */
export function CartaDeTaro({ ente, legenda = "", lex = null, inimigo = false, aoFechar = null }) {
  if (!ente) return null;
  const semente = sementeDe(ente);
  const t = tracos(semente);
  const r = rng(hashSemente(semente + "·carta"));
  const veste = escolher(r, VESTES);
  const forro = escolher(r, FORROS);
  const raios = 9 + Math.floor(r() * 5);
  const estrelas = Array.from({ length: 14 }, () => ({ x: 44 + r() * 212, y: 76 + r() * 210, o: 0.15 + r() * 0.5, s: 0.6 + r() * 1.5 }));
  const naipe = naipeDe(ente);
  const nivel = Number(ente.nivel) || 0;
  const pv = Math.max(0, Number(ente.vida) || 0), pvMax = Math.max(0, Number(ente.vidaMax) || 0);
  const frac = pvMax > 0 ? pv / pvMax : 1;
  /* os limiares do ferimento são de `estadoDe`, e não daqui. Escrevi-os à
     mão na primeira versão e não deu outra: dois lugares decidindo quando
     alguém está grave é o começo de uma carta que mostra sangue enquanto a
     bolinha do grupo mostra a pessoa inteira. */
  const estado = estadoDe(pv, pvMax, inimigo);
  const regua = inimigo ? T.danger : estado === "grave" ? T.danger : T.amber;
  const nome = [ente.nome, ente.sobrenome].filter(Boolean).join(" ") || "sem nome";
  const abaixo = [chamadoDaRaca(lex, ente.raca), ente.classe, ente.subclasse].filter(Boolean).join(" · ");

  /* o losango do número acompanha o número: XVIII não cabe onde V sobra */
  const num = romano(nivel);
  const meioLosango = Math.max(13, num.length * 5.4 + 7);

  const carta = (
    <svg viewBox="0 0 300 480" style={{ width: "100%", height: "auto", display: "block", filter: "drop-shadow(0 18px 40px rgba(0,0,0,0.55))" }}>
      <defs>
        <radialGradient id="ct-brilho" cx="50%" cy="42%" r="62%">
          <stop offset="0%" stopColor={forro} stopOpacity="0.30" />
          <stop offset="60%" stopColor={t.fundo} stopOpacity="0.9" />
          <stop offset="100%" stopColor="#0B0912" stopOpacity="1" />
        </radialGradient>
        <linearGradient id="ct-carta" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1B1628" />
          <stop offset="100%" stopColor="#120F1C" />
        </linearGradient>
        {/* O NICHO é recorte, e não moldura por cima: o que passar da arcada
            fica de fora, então o busto pode ser desenhado à vontade sem medo
            de vazar para cima do nome. */}
        <clipPath id="ct-nicho">
          <path d="M40 300 L40 190 A110 110 0 0 1 260 190 L260 300 Z" />
        </clipPath>
      </defs>

      <rect x="1" y="1" width="298" height="478" rx="16" fill="url(#ct-carta)" stroke={regua} strokeWidth="2" opacity="0.98" />
      <rect x="11" y="11" width="278" height="458" rx="10" fill="none" stroke={regua} strokeWidth="0.8" opacity="0.45" />
      <rect x="16" y="16" width="268" height="448" rx="7" fill="none" stroke={regua} strokeWidth="0.5" opacity="0.25" />

      {/* cantos: quatro pequenas folhas, o mínimo que faz uma borda parecer
          lavrada em vez de impressa */}
      {[[22, 22, 1, 1], [278, 22, -1, 1], [22, 458, 1, -1], [278, 458, -1, -1]].map(([x, y, sx, sy], i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(${sx} ${sy})`} stroke={regua} strokeWidth="0.9" fill="none" opacity="0.55">
          <path d="M0 14 C0 6 6 0 14 0" />
          <path d="M3 17 C3 9 9 3 17 3" opacity="0.5" />
          <circle cx="5" cy="5" r="1.4" fill={regua} stroke="none" />
        </g>
      ))}

      {/* o número: o nível, em romano */}
      <g transform="translate(150 46)">
        <path d={`M${-meioLosango} 0 L0 -9 L${meioLosango} 0 L0 9 Z`} fill="none" stroke={regua} strokeWidth="0.8" opacity="0.5" />
        <text className="tv-display" textAnchor="middle" dominantBaseline="central" fill={regua}
          style={{ fontSize: 16, fontWeight: 700, letterSpacing: 1.4 }}>{num}</text>
      </g>
      <line x1="46" y1="46" x2={144 - meioLosango} y2="46" stroke={regua} strokeWidth="0.6" opacity="0.35" />
      <line x1={156 + meioLosango} y1="46" x2="254" y2="46" stroke={regua} strokeWidth="0.6" opacity="0.35" />

      {/* ---- o nicho ---- */}
      <g clipPath="url(#ct-nicho)">
        <rect x="40" y="70" width="220" height="230" fill="url(#ct-brilho)" />
        {/* raios saindo de trás da cabeça — o truque mais velho do tarô para
            dizer "esta pessoa importa" sem escrever nada */}
        <g opacity="0.13">
          {Array.from({ length: raios }).map((_, i) => (
            <path key={i} d="M150 180 L142 -70 L158 -70 Z" fill={forro}
              transform={`rotate(${(360 / raios) * i} 150 180)`} />
          ))}
        </g>
        {estrelas.map((e, i) => (
          <circle key={i} cx={e.x} cy={e.y} r={e.s} fill={forro} opacity={e.o} />
        ))}
        {/* o busto agora é o do PRÓPRIO rosto (v9.158): a xilogravura traz
            ombros, veste e o traje da classe. A capa genérica que a carta
            desenhava por baixo viraria um segundo corpo — saiu. O que fica
            da carta é o pedestal: a saia que leva os ombros até a base do
            nicho, no tom da veste da carta, para a figura não flutuar. */}
        <path d="M97 260 C90 274 84 288 79 302 L221 302 C216 288 210 274 203 260 L150 265 Z" fill={veste} />
        <path d="M79 302 C84 288 90 274 97 260" fill="none" stroke={forro} strokeWidth="1.2" opacity="0.4" />
        <path d="M221 302 C216 288 210 274 203 260" fill="none" stroke={forro} strokeWidth="1.2" opacity="0.4" />
        {/* e o rosto, o MESMO que a bolinha do grupo desenha */}
        <g transform="translate(150 176) scale(2.5) translate(-32 -30)">
          <Rosto semente={semente} estado={estado} ente={ente} />
        </g>
      </g>
      <path d="M40 300 L40 190 A110 110 0 0 1 260 190 L260 300" fill="none" stroke={regua} strokeWidth="1.6" opacity="0.8" />
      <path d="M46 300 L46 191 A104 104 0 0 1 254 191 L254 300" fill="none" stroke={regua} strokeWidth="0.6" opacity="0.35" />
      <line x1="40" y1="300" x2="260" y2="300" stroke={regua} strokeWidth="1.6" opacity="0.8" />

      {/* a vida encosta na base do nicho, e não no rodapé: ali ela é a
          moldura da figura, e o rodapé fica livre para o nome */}
      {pvMax > 0 && (
        <g transform="translate(150 314)">
          <rect x="-52" y="-2.5" width="104" height="5" rx="2.5" fill="#0B0912" stroke={T.line} strokeWidth="0.5" />
          <rect x="-51" y="-1.5" width={Math.max(0, 102 * frac)} height="3" rx="1.5"
            fill={frac <= 1 / 3 ? T.danger : frac <= 2 / 3 ? T.amber : T.ok} />
        </g>
      )}

      {/* ---- o naipe ---- */}
      <g transform="translate(150 342)">
        <line x1="-84" y1="0" x2="-22" y2="0" stroke={regua} strokeWidth="0.6" opacity="0.35" />
        <line x1="22" y1="0" x2="84" y2="0" stroke={regua} strokeWidth="0.6" opacity="0.35" />
        <g transform="translate(-12 -12)">{(EMBLEMAS[naipe.id] || EMBLEMAS.forca)(regua)}</g>
      </g>

      {/* ---- o nome gravado ---- */}
      <text className="tv-display" x="150" y="388" textAnchor="middle" fill={T.ink}
        style={{ fontSize: nome.length > 18 ? 21 : nome.length > 13 ? 25 : 29, letterSpacing: 0.5 }}>{nome}</text>
      {abaixo ? (
        <text className="tv-mono" x="150" y="410" textAnchor="middle" fill={T.amberSoft}
          style={{ fontSize: 9, letterSpacing: 1.6, textTransform: "uppercase" }}>{abaixo}</text>
      ) : null}
      <text className="tv-mono" x="150" y="430" textAnchor="middle" fill={T.inkDim}
        style={{ fontSize: 8.5, letterSpacing: 1.2, textTransform: "uppercase" }}>
        {naipe.nome}{naipe.daFicha ? " · " + (ATRIBUTOS.find((a) => a.id === naipe.id) || {}).nome : ""}
      </text>
      {legenda ? (
        <text className="tv-body" x="150" y="452" textAnchor="middle" fill={T.violetSoft}
          style={{ fontSize: 11, fontStyle: "italic" }}>{legenda}</text>
      ) : null}
    </svg>
  );

  if (!aoFechar) return carta;
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-5" style={{ background: "rgba(8,6,14,0.92)", backdropFilter: "blur(3px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) aoFechar(); }}>
      <div className="tv-fade" style={{ width: "100%", maxWidth: "min(84vw, 42vh)" }}>{carta}</div>
      <button onClick={aoFechar} className="mt-4 rounded-xl px-5 py-2 tv-mono text-sm"
        style={{ background: T.amber, color: T.onAccent, fontWeight: 600 }}>Fechar</button>
    </div>
  );
}
