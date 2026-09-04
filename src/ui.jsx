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

/* ---------------- OS ÍCONES DA MESA (v9.170) ----------------
   Vieram de `mesa-jogo-v2`. Mesma regra dos do menu: geometria exportada
   caractere por caractere, cor virando prop.

   O do MAPA saiu do Figma com `stroke="black"` — invisível sobre o fundo
   da casa. O padrão aqui é o token, que é o que o desenho mostra na tela;
   um preto literal seria copiar o descuido em vez do desenho. */
export function IconeBandeira({ tamanho = 14, cor = T.amber }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 14 14" fill="none">
      <path d="M2.3338 12.8338V2.33296C2.3338 2.24239 2.35488 2.15307 2.39538 2.07206C2.43587 1.99106 2.49467 1.9206 2.56711 1.86626C3.17289 1.41184 3.90968 1.1662 4.6669 1.1662C6.41672 1.1662 7.58327 2.33296 8.94406 2.33296C9.72176 2.33296 10.3181 2.17739 10.733 1.86626C10.8196 1.80125 10.9227 1.76167 11.0305 1.75194C11.1384 1.74221 11.2469 1.76272 11.3438 1.81117C11.4407 1.85962 11.5221 1.9341 11.5791 2.02626C11.636 2.11842 11.6662 2.22462 11.6662 2.33296V8.16676C11.6662 8.25733 11.6451 8.34665 11.6046 8.42766C11.5641 8.50866 11.5053 8.57912 11.4329 8.63346C10.8271 9.08788 10.0903 9.33352 9.3331 9.33352C7.58327 9.33352 6.41672 8.16676 4.6669 8.16676C3.80605 8.16678 2.97542 8.48414 2.3338 9.05817" stroke={cor} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconeCaveira({ tamanho = 24, cor = T.violetSoft }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="none">
      <path d="M15.7067 21.7079C15.5192 21.8954 15.2649 22.0008 14.9997 22.0008H9.0003C8.73511 22.0008 8.48078 21.8954 8.29327 21.7079C8.10575 21.5203 8.0004 21.266 8.0004 21.0007V20.0007C7.62375 20.0004 7.25481 19.8938 6.93608 19.6931C6.61735 19.4924 6.36178 19.2057 6.19879 18.8661C6.0358 18.5265 5.97201 18.1477 6.01479 17.7734C6.05756 17.3992 6.20515 17.0446 6.44056 16.7505C5.2947 15.6427 4.5058 14.2179 4.17501 12.6587C3.84423 11.0995 3.98664 9.47699 4.58399 7.99928C5.18133 6.52157 6.20638 5.256 7.52769 4.36485C8.849 3.4737 10.4063 2.9976 12 2.9976C13.5937 2.9976 15.151 3.4737 16.4723 4.36485C17.7936 5.256 18.8187 6.52157 19.416 7.99928C20.0134 9.47699 20.1558 11.0995 19.825 12.6587C19.4942 14.2179 18.7053 15.6427 17.5594 16.7505C17.7949 17.0446 17.9424 17.3992 17.9852 17.7734C18.028 18.1477 17.9642 18.5265 17.8012 18.8661C17.6382 19.2057 17.3827 19.4924 17.0639 19.6931C16.7452 19.8938 16.3763 20.0004 15.9996 20.0007V21.0007C15.9996 21.266 15.8943 21.5203 15.7067 21.7079Z" stroke={cor} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconeEspada({ tamanho = 24, cor = T.violetSoft }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="none">
      <path d="M11 19L5 13M5 21L3 19M8 16L4 20M9.5 17.5L21 6V3H18L6.5 14.5" stroke={cor} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconeBolsa({ tamanho = 24, cor = T.violetSoft }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="none">
      <path d="M21 16V20C21 20.2652 20.8946 20.5196 20.7071 20.7071C20.5196 20.8946 20.2652 21 20 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H18C18.2652 3 18.5196 3.10536 18.7071 3.29289C18.8946 3.48043 19 3.73478 19 4V7M3 5C3 5.53043 3.21071 6.03914 3.58579 6.41421C3.96086 6.78929 4.46957 7 5 7H20C20.2652 7 20.5196 7.10536 20.7071 7.29289C20.8946 7.48043 21 7.73478 21 8V12M21 12H18C17.4696 12 16.9609 12.2107 16.5858 12.5858C16.2107 12.9609 16 13.4696 16 14C16 14.5304 16.2107 15.0391 16.5858 15.4142C16.9609 15.7893 17.4696 16 18 16H21M21 12C21.2652 12 21.5196 12.1054 21.7071 12.2929C21.8946 12.4804 22 12.7348 22 13V15C22 15.2652 21.8946 15.5196 21.7071 15.7071C21.5196 15.8946 21.2652 16 21 16" stroke={cor} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconeMapa({ tamanho = 24, cor = T.violetSoft }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="none">
      <path d="M9 3.2352C8.68967 3.2352 8.3836 3.30741 8.106 3.44613L3.553 5.72313C3.38692 5.80612 3.24722 5.93371 3.14956 6.09161C3.05189 6.2495 3.0001 6.43147 3 6.61713V19.3801C2.99958 19.5508 3.04284 19.7187 3.12565 19.8679C3.20846 20.0171 3.32808 20.1426 3.47312 20.2325C3.61816 20.3224 3.78379 20.3737 3.95426 20.3816C4.12473 20.3894 4.29436 20.3534 4.447 20.2771L8.106 18.4471C8.3836 18.3084 8.68967 18.2362 9 18.2362C9.31033 18.2362 9.6164 18.3084 9.894 18.4471L14.106 20.5531C14.3836 20.6918 14.6897 20.7641 15 20.7641C15.3103 20.7641 15.6164 20.6918 15.894 20.5531L20.447 18.2761C20.6131 18.1931 20.7528 18.0656 20.8505 17.9077C20.9481 17.7498 20.9999 17.5678 21 17.3821V4.61813C21.0003 4.44757 20.9569 4.27978 20.874 4.13071C20.7911 3.98165 20.6715 3.85626 20.5265 3.76646C20.3814 3.67667 20.2159 3.62546 20.0455 3.6177C19.8751 3.60994 19.7056 3.64589 19.553 3.72213L15.894 5.55213C15.6164 5.69085 15.3103 5.76306 15 5.76306C14.6897 5.76306 14.3836 5.69085 14.106 5.55213L9.894 3.44613C9.6164 3.30741 9.31033 3.2352 9 3.2352ZM15 5.76306L15 20.7625M9 3.2352L9 18.2352" stroke={cor} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconeGota({ tamanho = 12, cor = T.danger }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 12 12" fill="none">
      <path d="M8.47516 9.97523C7.8187 10.6316 6.92836 11.0004 6 11.0004C5.07164 11.0004 4.1813 10.6316 3.52484 9.97523C2.86839 9.31883 2.4996 8.42855 2.4996 7.50025C2.4996 6.50021 2.99966 5.55017 3.99977 4.75014C4.99989 3.9501 5.74997 2.75005 6 1.5C6.25003 2.75005 7.00011 3.9501 8.00023 4.75014C9.00034 5.55017 9.5004 6.50021 9.5004 7.50025C9.5004 8.42855 9.13161 9.31883 8.47516 9.97523Z" stroke={cor} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconeCirculoX({ tamanho = 12, cor = T.ok }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 12 12" fill="none">
      <path d="M7.50012 4.49988L4.49988 7.50012M4.49988 4.49988L7.50012 7.50012M11.0004 6C11.0004 8.76164 8.76164 11.0004 6 11.0004C3.23836 11.0004 0.9996 8.76164 0.9996 6C0.9996 3.23836 3.23836 0.9996 6 0.9996C8.76164 0.9996 11.0004 3.23836 11.0004 6Z" stroke={cor} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconeLosango({ tamanho = 12, cor = T.violetSoft }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 12 12" fill="none">
      <path d="M1.08903 5.54102C1.14966 5.39476 1.23852 5.26188 1.35054 5.14998L5.14518 1.35534C5.25708 1.24332 5.38996 1.15446 5.53622 1.09383C5.68249 1.03321 5.83927 1.002 5.9976 1.002C6.15593 1.002 6.31271 1.03321 6.45897 1.09383C6.60524 1.15446 6.73812 1.24332 6.85002 1.35534L10.6447 5.14998C10.7567 5.26188 10.8455 5.39476 10.9062 5.54102C10.9668 5.68729 10.998 5.84407 10.998 6.0024C10.998 6.16073 10.9668 6.31751 10.9062 6.46377C10.8455 6.61004 10.7567 6.74292 10.6447 6.85482L6.85002 10.6495C6.73812 10.7615 6.60524 10.8503 6.45897 10.911C6.31271 10.9716 6.15593 11.0028 5.9976 11.0028C5.83927 11.0028 5.68249 10.9716 5.53622 10.911C5.38996 10.8503 5.25708 10.7615 5.14518 10.6495L1.35054 6.85482C1.23852 6.74292 1.14966 6.61004 1.08903 6.46377C1.02841 6.31751 0.9972 6.16073 0.9972 6.0024C0.9972 5.84407 1.02841 5.68729 1.08903 5.54102Z" stroke={cor} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconeBalao({ tamanho = 16, cor = T.inkDim }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 16 16" fill="none">
      <path d="M14.2766 12.2762C14.5267 12.0261 14.6672 11.687 14.6672 11.3334V3.33334C14.6672 2.97972 14.5267 2.64058 14.2766 2.39053C14.0266 2.14048 13.6874 2 13.3338 2H2.66624C2.31259 2 1.97342 2.14048 1.72336 2.39053C1.47329 2.64058 1.3328 2.97972 1.3328 3.33334V14.1907C1.33281 14.2843 1.36058 14.3758 1.4126 14.4537C1.46461 14.5315 1.53854 14.5922 1.62503 14.628C1.71152 14.6638 1.80669 14.6732 1.8985 14.6549C1.99032 14.6367 2.07466 14.5916 2.14086 14.5254L3.60898 13.0574C3.85899 12.8073 4.1981 12.6668 4.55172 12.6667H13.3338C13.6874 12.6667 14.0266 12.5262 14.2766 12.2762Z" stroke={cor} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/* O ponto do "MESTRE ATIVO": mesma ideia do ponto do menu, cor da casa. */
export function PontoMestre({ tamanho = 16, cor = T.amber }) {
  const id = React.useId();
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 16 16" fill="none">
      <defs>
        <filter id={id} x="0" y="0" width="16" height="16" filterUnits="userSpaceOnUse">
          <feGaussianBlur stdDeviation="1.5" />
        </filter>
      </defs>
      <circle cx="8" cy="8" r="4" fill={cor} filter={`url(#${id})`} />
    </svg>
  );
}

/* ---------------- OS ÍCONES DO COMBATE (v9.172) ----------------
   De `mesa-combate-v2`. Todos em caixa de 14, que é o tamanho que o
   desenho usa nos botões de ação e no selo da ameaça. */
export function IconeEscudoAlerta({ tamanho = 14, cor = T.danger }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 14 14" fill="none">
      <path d="M7 4.66631V6.99972M7 9.33313H7.00583M11.6662 7.58334C11.6662 10.5001 9.62474 11.9585 7.19831 12.8043C7.07125 12.8474 6.93324 12.8453 6.80752 12.7985C4.37526 11.9585 2.3338 10.5001 2.3338 7.58334V3.49987C2.3338 3.34516 2.39525 3.19678 2.50464 3.08738C2.61402 2.97798 2.76238 2.91652 2.91708 2.91652C4.08362 2.91652 5.54181 2.2165 6.55671 1.3298C6.68028 1.22421 6.83747 1.1662 7 1.1662C7.16253 1.1662 7.31972 1.22421 7.44329 1.3298C8.46402 2.22233 9.91637 2.91652 11.0829 2.91652C11.2376 2.91652 11.386 2.97798 11.4954 3.08738C11.6047 3.19678 11.6662 3.34516 11.6662 3.49987V7.58334Z" stroke={cor} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconeEscudo({ tamanho = 14, cor = T.ink }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 14 14" fill="none">
      <path d="M7.19831 12.8043C9.62474 11.9585 11.6662 10.5001 11.6662 7.58334V3.49987C11.6662 3.34516 11.6047 3.19678 11.4954 3.08738C11.386 2.97798 11.2376 2.91652 11.0829 2.91652C9.91637 2.91652 8.46402 2.22233 7.44329 1.3298C7.31972 1.22421 7.16253 1.1662 7 1.1662C6.83747 1.1662 6.68028 1.22421 6.55671 1.3298C5.54181 2.2165 4.08362 2.91652 2.91708 2.91652C2.76238 2.91652 2.61402 2.97798 2.50464 3.08738C2.39525 3.19678 2.3338 3.34516 2.3338 3.49987V7.58334C2.3338 10.5001 4.37526 11.9585 6.80752 12.7985C6.93324 12.8453 7.07125 12.8474 7.19831 12.8043Z" stroke={cor} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconeSetaEsq({ tamanho = 14, cor = T.ink }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 14 14" fill="none">
      <path d="M7 2.9162L2.9162 7L7 11.0838M2.9162 7H11.0838" stroke={cor} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconeFrasco({ tamanho = 14, cor = T.ink }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 14 14" fill="none">
      <path d="M2.625 1.75H11.375M3.5 1.75V11.0833C3.5 11.3928 3.62292 11.6895 3.84171 11.9083C4.0605 12.1271 4.35725 12.25 4.66667 12.25H9.33333C9.64275 12.25 9.9395 12.1271 10.1583 11.9083C10.3771 11.6895 10.5 11.3928 10.5 11.0833V1.75M3.5 8.16667H10.5" stroke={cor} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconeOlho({ tamanho = 14, cor = T.ink }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 14 14" fill="none">
      <path d="M1.20266 6.79757C1.15405 6.92854 1.15405 7.07261 1.20266 7.20357C1.67615 8.35166 2.47988 9.3333 3.51194 10.024C4.54401 10.7148 5.75794 11.0835 6.99983 11.0835C8.24172 11.0835 9.45565 10.7148 10.4877 10.024C11.5198 9.3333 12.3235 8.35166 12.797 7.20357C12.8456 7.07261 12.8456 6.92854 12.797 6.79757C12.3235 5.64949 11.5198 4.66785 10.4877 3.9771C9.45565 3.28635 8.24172 2.9176 6.99983 2.9176C5.75794 2.9176 4.54401 3.28635 3.51194 3.9771C2.47988 4.66785 1.67615 5.64949 1.20266 6.79757Z" stroke={cor} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/* ---------------- OS ÍCONES DOS GÊNEROS (v9.173) ----------------
   De `criacao-mundo-v2`. O horror cósmico e o pós-apocalíptico reusam o
   olho e a caveira que já existem — é o mesmo glifo do Lucide, só noutra
   caixa, e o viewBox escala sozinho.

   A BÚSSOLA VEIO QUEBRADA do Figma: só o círculo exportou, sem a agulha.
   Fica como veio, porque completá-la de cabeça seria eu desenhando um
   ícone e chamando de "o desenho" — e um círculo pelado ao lado de
   "Steampunk" é justamente o tipo de coisa que se conserta reexportando. */
export function IconeCastelo({ tamanho = 20, cor = T.amberSoft }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 20 20" fill="none">
      <path d="M8.3332 4.16667V2.5M11.6668 4.16667V2.5M12.5002 17.5V15C12.5002 14.337 12.2368 13.7011 11.7679 13.2322C11.299 12.7634 10.6631 12.5 10 12.5C9.33691 12.5 8.70097 12.7634 8.23209 13.2322C7.76321 13.7011 7.4998 14.337 7.4998 15V17.5M15.0004 2.5V9.16667M15.0004 4.16667H4.9996M18.334 9.16667H1.666M18.334 7.5V15.8333C18.334 16.2754 18.1584 16.6993 17.8458 17.0118C17.5332 17.3244 17.1093 17.5 16.6672 17.5H3.3328C2.89074 17.5 2.46678 17.3244 2.15419 17.0118C1.84161 16.6993 1.666 16.2754 1.666 15.8333V7.5M4.9996 2.5V9.16667" stroke={cor} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconeTerminal({ tamanho = 20, cor = T.amberSoft }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 20 20" fill="none">
      <path d="M10 15.834H16.666M3.334 14.1671L8.3335 9.16657L3.334 4.166" stroke={cor} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconeFoguete({ tamanho = 20, cor = T.amberSoft }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 20 20" fill="none">
      <path d="M10.0007 12.4993V16.666C10.0007 16.666 12.5257 16.2077 13.334 14.9993C14.234 13.6493 13.334 10.8327 13.334 10.8327M10.0007 12.4993C11.1646 12.0564 12.2813 11.498 13.334 10.8327M10.0007 12.4993L7.50067 9.99954M7.50067 9.99954C7.94412 8.84906 8.5025 7.74626 9.16733 6.70787C10.1383 5.15536 11.4904 3.87708 13.0948 2.99462C14.6993 2.11215 16.5029 1.65485 18.334 1.66621C18.334 3.93287 17.684 7.916 13.334 10.8327M7.50067 9.99954L3.334 9.999C3.334 9.999 3.79233 7.474 5.00067 6.66566C6.35067 5.76566 9.16733 6.70787 9.16733 6.70787M3.75067 13.7496C2.50067 14.7996 2.084 17.9163 2.084 17.9163C2.084 17.9163 5.20067 17.4996 6.25067 16.2496C6.84233 15.5496 6.834 14.4746 6.17567 13.8246C5.85176 13.5154 5.42508 13.3368 4.97752 13.323C4.52997 13.3091 4.09306 13.461 3.75067 13.7496Z" stroke={cor} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconeBussola({ tamanho = 20, cor = T.amberSoft }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 20 20" fill="none">
      <path d="M10 18.334C14.6027 18.334 18.334 14.6027 18.334 10C18.334 5.39726 14.6027 1.666 10 1.666C5.39726 1.666 1.666 5.39726 1.666 10C1.666 14.6027 5.39726 18.334 10 18.334Z" stroke={cor} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/* ---------------- A DIVISÓRIA RÚNICA (v9.173) ----------------
   Linha, gema, linha. Aparece oito vezes na criação do mundo e é o que
   transforma uma rolagem longuíssima em capítulos — sem ela, a tela é um
   formulário de três mil pixels sem respiro nenhum. */
export function DivisoriaRunica() {
  return (
    <div className="flex items-center gap-5 w-full py-2" aria-hidden="true">
      <div className="flex-1 h-px" style={{ background: T.line }} />
      <div className="shrink-0" style={{ width: 8, height: 8, transform: "rotate(45deg)", border: `1px solid ${T.amber}` }} />
      <div className="flex-1 h-px" style={{ background: T.line }} />
    </div>
  );
}

export function IconeDado({ tamanho = 28, cor = T.amberSoft }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 28 28" fill="none">
      <path d="M18.6667 9.33333H18.6783M18.6667 14H18.6783M18.6667 18.6667H18.6783M9.33333 9.33333H9.345M9.33333 14H9.345M9.33333 18.6667H9.345M5.83333 3.5H22.1667C23.4553 3.5 24.5 4.54467 24.5 5.83333V22.1667C24.5 23.4553 23.4553 24.5 22.1667 24.5H5.83333C4.54467 24.5 3.5 23.4553 3.5 22.1667V5.83333C3.5 4.54467 4.54467 3.5 5.83333 3.5Z" stroke={cor} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
/* ============================================================
   AS PRIMITIVAS DAS TELAS DE CRIAÇÃO (v9.176)

   Elas moram AQUI FORA, e a razão é um defeito de verdade que custou
   uma tela inteira: na v9.174 elas estavam definidas DENTRO de
   `TelaPersonagem`, e o resultado foi que só dava para escrever uma
   letra por vez em nome, sobrenome e conceito.

   O motivo é a identidade do componente. `const Campo = (...) => ...`
   dentro do corpo de uma função de render cria uma FUNÇÃO NOVA a cada
   render. Para o React, função nova é TIPO novo — e tipo novo não é o
   mesmo componente que estava ali: ele desmonta a subárvore inteira e
   monta outra no lugar. O `<input>` morre e nasce a cada tecla, e com
   ele morre o foco e o cursor. O jogador digita uma letra, o campo se
   fecha, ele clica de novo, digita outra.

   A regra que sai disso, e ela vale para toda tela nova deste projeto:
   COMPONENTE NÃO SE DEFINE DENTRO DE OUTRO COMPONENTE. Se ele precisa
   de algo do de fora, isso vira prop. É a mesma lei que `check-escopo`
   já cobra dos componentes declarados antes de `Taverna`, agora pela
   segunda razão: lá era escopo, aqui é remontagem.
   ============================================================ */
export function RotuloDoCampo({ children }) {
  return <div className="tv-mono text-[10px] uppercase tracking-[1px]" style={{ color: T.inkDim }}>{children}</div>;
}

export function TituloDeSecao({ children, direita }) {
  return (
    <div className="flex items-end justify-between gap-4 w-full">
      <div className="tv-display text-2xl leading-[1.2]" style={{ color: T.amberSoft }}>{children}</div>
      {direita}
    </div>
  );
}

export function CabecalhoDeSecao({ sobre, titulo, diz }) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="tv-mono text-[10px] uppercase tracking-[1px]" style={{ color: T.violetSoft }}>{sobre}</div>
      <div className="tv-display text-2xl leading-[1.2]" style={{ color: T.amberSoft }}>{titulo}</div>
      <div className="tv-body text-[11px] leading-[1.5]" style={{ color: T.inkDim }}>{diz}</div>
    </div>
  );
}

export function CampoRotulado({ rotulo, children }) {
  return (
    <div className="flex-1 min-w-0 flex flex-col gap-2">
      <RotuloDoCampo>{rotulo}</RotuloDoCampo>
      {children}
    </div>
  );
}

export function DescricaoCurta({ children, cor }) {
  return <div className="tv-body text-xs leading-[1.55]" style={{ color: cor || T.inkDim }}>{children}</div>;
}

/* o cartão de escolha é o mesmo para gênero, molde, arco e voz — o que
   muda é o que se põe dentro dele */
export function CartaoDeEscolha({ ativo, aoClicar, compacto, children }) {
  return (
    <button onClick={aoClicar} className={`text-left w-full rounded-xl flex flex-col gap-2 transition-all ${compacto ? "p-4" : "p-5"}`}
      style={{
        background: T.panel,
        border: `${ativo ? 1.5 : 1}px solid ${ativo ? T.amber : T.line}`,
        boxShadow: ativo ? "0 4px 8px rgba(232,163,61,0.12)" : "none",
      }}>
      {children}
    </button>
  );
}

export function LinhaDoCartao({ Glifo, titulo, ativo }) {
  return (
    <div className="flex items-center justify-between w-full gap-3">
      <div className="flex items-center gap-3 min-w-0">
        {Glifo && <span className="shrink-0"><Glifo tamanho={20} cor={ativo ? T.amberSoft : T.inkDim} /></span>}
        <span className="tv-display text-xl leading-[1.25] truncate" style={{ color: T.ink }}>{titulo}</span>
      </div>
      {ativo && <span className="shrink-0 rounded-full" style={{ width: 10, height: 10, background: T.amber }} />}
    </div>
  );
}

/* As escolhas em duas colunas. A lista chega inteira e se parte no meio,
   porque duas colunas escritas à mão saem do lugar quando o catálogo
   cresce — e ele cresceu de quatro para oito arcos numa leva só.

   É função, não componente: ela devolve JSX mas não é montada como tipo,
   então não sofre da remontagem descrita acima. */
export function duasColunas(lista, desenhar) {
  const meio = Math.ceil(lista.length / 2);
  return (
    <div className="flex flex-col md:flex-row gap-4 md:gap-5 w-full">
      {[lista.slice(0, meio), lista.slice(meio)].map((col, i) => (
        <div key={i} className="flex-1 min-w-0 flex flex-col gap-4">{col.map(desenhar)}</div>
      ))}
    </div>
  );
}


/* ---------------- OS ÍCONES DA SALA (v9.177) ---------------- */
export function IconeChevronEsq({ tamanho = 16, cor = T.ink }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 16 16" fill="none">
      <path d="M10 12L6 8L10 4" stroke={cor} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconeCheck({ tamanho = 10, cor = T.ok }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 10 10" fill="none">
      <path d="M8.333 2.5L3.75013 7.083L1.667 4.99982" stroke={cor} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconeMaisGente({ tamanho = 18, cor = T.inkDim }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 18 18" fill="none">
      <path d="M12.0002 15.75V14.25C12.0002 13.4544 11.6841 12.6913 11.1215 12.1287C10.5588 11.5661 9.79571 11.25 9 11.25H4.49964C3.70393 11.25 2.9408 11.5661 2.37815 12.1287C1.8155 12.6913 1.4994 13.4544 1.4994 14.25V15.75M14.2504 6V10.5M16.5006 8.25H12.0002M9.75006 5.25C9.75006 6.90685 8.40681 8.25 6.74982 8.25C5.09283 8.25 3.74958 6.90685 3.74958 5.25C3.74958 3.59315 5.09283 2.25 6.74982 2.25C8.40681 2.25 9.75006 3.59315 9.75006 5.25Z" stroke={cor} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconePartilhar({ tamanho = 16, cor = T.violetSoft }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 16 16" fill="none">
      <path d="M5.72656 9.00659L10.2799 11.6601M10.2732 4.33955L5.72656 6.9931M14 3.33296C14 4.43762 13.1046 5.33312 12 5.33312C10.8954 5.33312 10 4.43762 10 3.33296C10 2.2283 10.8954 1.3328 12 1.3328C13.1046 1.3328 14 2.2283 14 3.33296ZM6 8C6 9.10466 5.10457 10.0002 4 10.0002C2.89543 10.0002 2 9.10466 2 8C2 6.89534 2.89543 5.99984 4 5.99984C5.10457 5.99984 6 6.89534 6 8ZM14 12.667C14 13.7717 13.1046 14.6672 12 14.6672C10.8954 14.6672 10 13.7717 10 12.667C10 11.5624 10.8954 10.6669 12 10.6669C13.1046 10.6669 14 11.5624 14 12.667Z" stroke={cor} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconePlay({ tamanho = 16, cor = T.bg }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 16 16" fill="none">
      <path d="M3.51208 2.66554C3.39457 2.8686 3.33273 3.09905 3.3328 3.33364V12.6664C3.33273 12.9009 3.39457 13.1314 3.51208 13.3345C3.62958 13.5375 3.7986 13.706 4.00205 13.8228C4.2055 13.9397 4.43619 14.0008 4.67082 14C4.90546 13.9992 5.13573 13.9365 5.33838 13.8183L13.3394 9.15192C13.541 9.03446 13.7083 8.86614 13.8245 8.66378C13.9407 8.46142 14.0018 8.2321 14.0016 7.99876C14.0014 7.76541 13.9399 7.53621 13.8234 7.33405C13.7068 7.13189 13.5392 6.96385 13.3374 6.84674L5.33838 2.18172C5.13573 2.06348 4.90546 2.0008 4.67082 2.00001C4.43619 1.99921 4.2055 2.06033 4.00205 2.17718C3.7986 2.29404 3.62958 2.46249 3.51208 2.66554Z" stroke={cor} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/* o alfinete de `momento-lugar-novo-v2` — o único glifo do desenho que a
   casa ainda não tinha */
export function IconeAlfinete({ tamanho = 13, cor = T.amberSoft }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 13 13" fill="none">
      <path d="M6.82551 11.8083C7.83291 10.9384 10.8329 8.12143 10.8329 5.41663C10.8329 4.26726 10.3764 3.16495 9.56382 2.35222C8.75125 1.53949 7.64916 1.0829 6.5 1.0829C5.35084 1.0829 4.24875 1.53949 3.43618 2.35222C2.6236 3.16495 2.1671 4.26726 2.1671 5.41663C2.1671 8.12143 5.16709 10.9384 6.17449 11.8083C6.26834 11.8789 6.38258 11.9171 6.5 11.9171C6.61742 11.9171 6.73166 11.8789 6.82551 11.8083Z" stroke={cor} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/* ============================================================
   AS PRIMITIVAS DOS PAINÉIS (v9.183)

   Os painéis laterais do Figma (`painel-ficha-v2` e irmãos) falam todos a
   mesma língua, e é uma língua boa: cartão rotulado, ladrilho de número,
   linha de nome-e-valor, barra de medida, item com glifo, etiqueta. Elas
   entram AQUI uma a uma, à medida que o painel que as usa chega: primitiva
   sem leitor é export morto, e a catraca de `teste-ligacao` cobra isso na
   mesma hora — foi ela que apontou as cinco escritas cedo demais.

   Elas moram AQUI FORA pela lei da v9.176: componente definido dentro de
   outro componente é tipo novo a cada render, e o React remonta a
   subárvore — o que num painel com campo de texto significa perder o foco
   a cada tecla. Ver [[componente-dentro-do-render]].
   ============================================================ */

/* o cartão rotulado: mesma ideia do ladrilho, mas para texto em vez de
   número — nome de raça, de antecedente, de ofício */
export function CartaoDeDado({ rotulo, valor, titulo, borda }) {
  return (
    <div className="w-full flex flex-col gap-0.5 p-2.5 rounded-[10px]" title={titulo || undefined}
      style={{ background: T.bg, border: `1px solid ${borda || T.line}` }}>
      <div className="tv-mono text-[9px] uppercase tracking-[0.9px]" style={{ color: T.inkDim }}>{rotulo}</div>
      <div className="tv-body text-[11px] leading-[1.5]" style={{ color: T.ink }}>{valor}</div>
    </div>
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
