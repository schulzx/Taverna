/* ============================================================
   PRIMITIVAS DE INTERFACE (v8.8) — Taverna
   Botão, ícones, barra, retrato procedural e utilitários de
   semente. Compartilhados por todos os painéis.
   Extraído do App.jsx na modularização.
   ============================================================ */
import React from "react";
import { T } from "./constantes.js";
/* A semente é conta (`semente.js`) e o rosto é desenho (`rosto.jsx`). O
   `Retrato` daqui é uma das duas molduras que usam esse rosto — a outra é a
   carta de tarô. É por isso que o rosto saiu deste arquivo: sem um dono só,
   os dois desenhos divergiriam no primeiro ajuste. */
import { Rosto } from "./rosto.jsx";
import { tracos } from "./semente.js";
import { CartaDeTaro } from "./carta-taro.jsx";

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


/* ---------------- OS ÍCONES DO MENU (v9.169) ----------------
   Vieram do redesenho `taverna-menu-v2-game` e são traçados de 2px. Entram
   como COMPONENTES, e não como <img>, pela mesma razão que o d20 e a caneca
   entram: um ícone que é arquivo não herda a cor do token — e o menu pinta
   cada um com uma cor diferente da paleta.

   A geometria é a exportada do Figma, caractere por caractere. O que mudou
   foi só a cor, que virou prop com o padrão do desenho. */
export function IconeSeta({ tamanho = 16, cor = T.ink }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 16 16" fill="none">
      <path d="M3.3328 8H12.6672M8 12.6672L12.6672 8L8 3.3328" stroke={cor} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconeLivro({ tamanho = 20, cor = T.violetSoft }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 20 20" fill="none">
      <path d="M10 5.83333V17.5M10 5.83333C10 4.94928 9.64878 4.10143 9.02361 3.47631C8.39844 2.85119 7.55053 2.5 6.6664 2.5H2.4994C2.27837 2.5 2.06639 2.5878 1.9101 2.74408C1.7538 2.90036 1.666 3.11232 1.666 3.33333V14.1667C1.666 14.3877 1.7538 14.5996 1.9101 14.7559C2.06639 14.9122 2.27837 15 2.4994 15H7.4998C8.16289 15 8.79883 15.2634 9.26771 15.7322C9.73659 16.2011 10 16.837 10 17.5M10 5.83333C10 4.94928 10.3512 4.10143 10.9764 3.47631C11.6016 2.85119 12.4495 2.5 13.3336 2.5H17.5006C17.7216 2.5 17.9336 2.5878 18.0899 2.74408C18.2462 2.90036 18.334 3.11232 18.334 3.33333V14.1667C18.334 14.3877 18.2462 14.5996 18.0899 14.7559C17.9336 14.9122 17.7216 15 17.5006 15H12.5002C11.8371 15 11.2012 15.2634 10.7323 15.7322C10.2634 16.2011 10 16.837 10 17.5" stroke={cor} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconeFaiscas({ tamanho = 20, cor = T.amber }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 20 20" fill="none">
      <path d="M16.6672 1.66763V5.00083M18.334 3.33423H15.0004M9.18077 2.3463C9.21648 2.15515 9.31792 1.9825 9.46754 1.85825C9.61715 1.73401 9.80551 1.666 10 1.666C10.1945 1.666 10.3828 1.73401 10.5325 1.85825C10.6821 1.9825 10.7835 2.15515 10.8192 2.3463L11.6951 6.97779C11.7573 7.30706 11.9174 7.60994 12.1544 7.84689C12.3913 8.08385 12.6943 8.24387 13.0236 8.30607L17.6556 9.18187C17.8468 9.21757 18.0195 9.31901 18.1437 9.4686C18.268 9.6182 18.336 9.80654 18.336 10.001C18.336 10.1955 18.268 10.3838 18.1437 10.5334C18.0195 10.683 17.8468 10.7844 17.6556 10.8201L13.0236 11.6959C12.6943 11.7581 12.3913 11.9182 12.1544 12.1551C11.9174 12.3921 11.7573 12.6949 11.6951 13.0242L10.8192 17.6557C10.7835 17.8469 10.6821 18.0195 10.5325 18.1437C10.3828 18.268 10.1945 18.336 10 18.336C9.80551 18.336 9.61715 18.268 9.46754 18.1437C9.31792 18.0195 9.21648 17.8469 9.18077 17.6557L8.30486 13.0242C8.24265 12.6949 8.08262 12.3921 7.84564 12.1551C7.60865 11.9182 7.30574 11.7581 6.97642 11.6959L2.34438 10.8201C2.1532 10.7844 1.98053 10.683 1.85628 10.5334C1.73202 10.3838 1.664 10.1955 1.664 10.001C1.664 9.80654 1.73202 9.6182 1.85628 9.4686C1.98053 9.31901 2.1532 9.21757 2.34438 9.18187L6.97642 8.30607C7.30574 8.24387 7.60865 8.08385 7.84564 7.84689C8.08262 7.60994 8.24265 7.30706 8.30486 6.97779L9.18077 2.3463ZM4.99964 16.667C4.99964 17.5875 4.25338 18.3336 3.33284 18.3336C2.41229 18.3336 1.66603 17.5875 1.66603 16.667C1.66603 15.7466 2.41229 15.0004 3.33284 15.0004C4.25338 15.0004 4.99964 15.7466 4.99964 16.667Z" stroke={cor} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconeDois({ tamanho = 20, cor = T.violetSoft }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 20 20" fill="none">
      <path d="M15.0005 17.5C15.0005 15.7319 14.2981 14.0362 13.0477 12.786C11.7974 11.5357 10.1015 10.8333 8.33326 10.8333M8.33326 10.8333C6.565 10.8333 4.86915 11.5357 3.6188 12.786C2.36844 14.0362 1.666 15.7319 1.666 17.5M8.33326 10.8333C10.6347 10.8333 12.5003 8.96785 12.5003 6.66667C12.5003 4.36548 10.6347 2.5 8.33326 2.5C6.03187 2.5 4.16622 4.36548 4.16622 6.66667C4.16622 8.96785 6.03187 10.8333 8.33326 10.8333ZM18.334 16.6668C18.334 13.8585 16.6672 11.2502 15.0004 10.0002C15.5483 9.58914 15.9864 9.0494 16.276 8.42872C16.5655 7.80804 16.6976 7.12555 16.6605 6.44166C16.6234 5.75777 16.4183 5.09357 16.0634 4.50783C15.7084 3.92209 15.2145 3.43288 14.6253 3.0835" stroke={cor} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconeArquivo({ tamanho = 20, cor = T.amberSoft }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 20 20" fill="none">
      <path d="M3.3328 6.66667V15.8333C3.3328 16.2754 3.50841 16.6993 3.82099 17.0118C4.13358 17.3244 4.55754 17.5 4.9996 17.5H15.0004C15.4425 17.5 15.8664 17.3244 16.179 17.0118C16.4916 16.6993 16.6672 16.2754 16.6672 15.8333V6.66667M8.3332 10H11.6668M2.4994 2.5H17.5006C17.9609 2.5 18.334 2.8731 18.334 3.33333V5.83333C18.334 6.29357 17.9609 6.66667 17.5006 6.66667H2.4994C2.03913 6.66667 1.666 6.29357 1.666 5.83333V3.33333C1.666 2.8731 2.03913 2.5 2.4994 2.5Z" stroke={cor} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconeAviso({ tamanho = 16, cor = T.amber }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 16 16" fill="none">
      <path d="M8 10.6669V8M8 5.33312H8.00667M14.6672 8C14.6672 11.6822 11.6822 14.6672 8 14.6672C4.31781 14.6672 1.3328 11.6822 1.3328 8C1.3328 4.31781 4.31781 1.3328 8 1.3328C11.6822 1.3328 14.6672 4.31781 14.6672 8Z" stroke={cor} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/* O ponto que respira ao lado de "Continuar aventura". O desfoque é do
   desenho e é o que o faz parecer aceso em vez de impresso — e o id do
   filtro tem de ser único, senão dois pontos na mesma tela compartilham
   o mesmo e o segundo herda o do primeiro. */
export function PontoAtivo({ tamanho = 12, cor = T.danger }) {
  const id = React.useId();
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 12 12" fill="none">
      <defs>
        <filter id={id} x="0" y="0" width="12" height="12" filterUnits="userSpaceOnUse">
          <feGaussianBlur stdDeviation="1" />
        </filter>
      </defs>
      <circle cx="6" cy="6" r="4" fill={cor} filter={`url(#${id})`} />
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

/* ---------------- O RETRATO, E A CARTA POR TRÁS DELE (v9.126) ----------------
   O retrato abre a própria carta. A alternativa era o App guardar "que carta
   está aberta" e enfiar um `aoTocar` em cada painel que desenha gente — e
   são sete lugares, dentro de quatro componentes que hoje não sabem nada
   sobre cartas. Prop atravessando componente que não usa é como uma regra
   deixa de valer num dos caminhos: alguém acrescenta o oitavo retrato e
   esquece de passar.

   Aqui basta entregar a PESSOA. Sem `ente`, o retrato continua o que sempre
   foi: uma bolinha que não faz nada quando você toca. */
export function Retrato({ semente, tamanho = 44, anel = T.line, corSubstituta, estado = "normal", ente = null, inimigo = false, legenda = "", lex = null, semCarta = false }) {
  const [aberta, setAberta] = React.useState(false);
  const t = tracos(semente);
  /* `semCarta` existe para o retrato que já mora dentro de outro botão
     (o do cabeçalho abre a ficha): ele precisa do `ente` para vestir o
     traje da classe, mas botão dentro de botão falha no dedo */
  const abre = ente && !semCarta ? () => setAberta(true) : null;
  return (
    <>
      <svg width={tamanho} height={tamanho} viewBox="0 0 64 64"
        role={abre ? "button" : undefined} tabIndex={abre ? 0 : undefined}
        onClick={abre || undefined}
        onKeyDown={abre ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setAberta(true); } } : undefined}
        style={{ borderRadius: "50%", border: `2px solid ${anel}`, background: corSubstituta || t.fundo, display: "block", cursor: abre ? "pointer" : "default" }}>
        {abre ? <title>Ver a carta de {ente.nome || "quem é este"}</title> : null}
        <Rosto semente={semente} estado={estado} ente={ente} />
      </svg>
      {aberta && <CartaDeTaro ente={ente} inimigo={inimigo} legenda={legenda} lex={lex} aoFechar={() => setAberta(false)} />}
    </>
  );
}
