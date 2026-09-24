/* ============================================================
   PRIMITIVAS DE INTERFACE (v8.8) — Taverna
   Botão, ícones, barra, retrato procedural e utilitários de
   semente. Compartilhados por todos os painéis.
   Extraído do App.jsx na modularização.
   ============================================================ */
import React from "react";
import { T, ALVOS } from "./constantes.js";
/* `TIPOS` (a escala de letra) e `SOLEIRA` (o teto de ofertas) nascem em
   R2 e moram em `estilo.js`, como `T`/`ALVOS`. Não vêm de
   `constantes.js` porque esse arquivo é território do `oficial` nesta
   etapa (o bump de `VERSAO` é a última edição antes do commit dele) —
   importar direto da folha é o mesmo dado, sem tocar num arquivo que
   não é meu agora. */
import { TIPOS, SOLEIRA, CINTA, MARCA_DA_PORTA } from "./estilo.js";
/* A semente é conta (`semente.js`) e o rosto é desenho (`rosto.jsx`). O
   `Retrato` daqui é uma das duas molduras que usam esse rosto — a outra é a
   carta de tarô. É por isso que o rosto saiu deste arquivo: sem um dono só,
   os dois desenhos divergiriam no primeiro ajuste. */
import { Rosto } from "./rosto.jsx";
import { tracos } from "./semente.js";
import { CartaDeTaro } from "./carta-taro.jsx";
/* A brasa e conta (`brasas.js`) e o campo e desenho — mesma divisao do rosto. */
import { quantasBrasas, HALO, brasaEm, forcaDoHalo } from "./brasas.js";
/* R13 · a gravura e o selo sao CONTA e moram em `gravura-da-cena.js`; o
   rosto da cena e DESENHO e mora em `rosto-da-cena.jsx`. A mesma divisao
   do rosto e da brasa, tres linhas acima. O re-export existe para o
   `App.jsx` ter UM import de interface, e nao dois. */
import { areiaDaAmpulheta, apertoDoPrazo, palavraDoPrazo } from "./gravura-da-cena.js";
export { RostoDaCena } from "./rosto-da-cena.jsx";

/* `corpo` (R2, NOVO — padrão false): o verbo de `A Oferta` é fala, não
   máquina — `formas.md` pede Spectral `TIPOS.corpo` (15) para ele, e o
   `Botao` de sempre é sempre `tv-mono`, maiúsculo e rastreado, porque é
   a voz do SISTEMA (rótulo de comando). Trocar a fonte por CSS puro não
   dava: `tv-mono` vem DEPOIS de `tv-body` em `FONT_CSS`, e o último da
   cascata ganha empate de especificidade — somar as duas classes deixava
   o mono vencendo sempre. A saída é o `<button>` escolher UMA das duas,
   nunca as duas. Com `corpo=false` (o padrão) nada muda para quem já
   chama `Botao` hoje — é opt-in, e o resto da casa continua bit a bit
   igual.

   `ariaLabel` (R5d, NOVO — padrão undefined): existe porque o nome
   acessível "a partir do conteúdo" de um `<button>` deveria alcançar
   texto dentro de QUALQUER filho, por norma (accname é recursivo) — mas
   `A Oferta` mediu ao vivo que, com o verbo dentro de um `<span>` (para
   o `line-clamp-2` do R5c), o nome sumiu do botão inteiro, na mesa e no
   telefone. `formas.md` ("O nome acessível da casa: aria-label") já é
   lei nesta casa para exatamente este risco: um nome que depende de um
   detalhe de estrutura é um nome que a próxima refatoração apaga em
   silêncio. Com `ariaLabel`, o nome vira explícito e para de depender de
   COMO os filhos estão organizados — undefined não muda nada para quem
   já chama `Botao` sem o passar. */
export function Botao({ children, onClick, primario, desativado, pequeno, corpo = false, className = "", ariaLabel }) {
  return (
    <button onClick={onClick} disabled={desativado} aria-label={ariaLabel}
      className={`${corpo ? "tv-body tv-anel-foco" : "tv-mono"} rounded-lg transition-all ${pequeno ? "px-3 py-1.5 text-xs" : corpo ? "px-5 py-3" : "px-5 py-3 text-sm"} ${className}`}
      style={{
        background: primario ? T.amber : "transparent",
        color: primario ? T.onAccent : T.inkDim,
        /* borda do não-primário: lineStrong, não line — é borda de controlo,
           e 1.4.11 pede piso de 3:1 para elemento de interface. */
        border: primario ? "none" : `1px solid ${T.lineStrong}`,
        opacity: desativado ? 0.4 : 1, cursor: desativado ? "not-allowed" : "pointer",
        fontWeight: corpo ? 400 : 600, letterSpacing: corpo ? "normal" : "0.04em",
        fontSize: corpo ? TIPOS.corpo : undefined,
        /* R4a: a variante `corpo` media 47px — falhava `ALVOS.piso` por 1px,
           porque a altura nascia do padding + entrelinha, um resto de conta
           que ninguém escrevia (a mesma doença que `ALVOS.piso` existe para
           curar). Ela é o verbo de `Agir →` (App.jsx:22275, o alvo mais
           tocado da tela principal) e de toda `Oferta` da soleira — por
           isso o piso lê a tabela em vez de confiar no padding. inline-flex
           + alignItems centram o texto dentro do piso sem mudar um pixel
           do padding que já existia (quem não é `corpo` não muda). */
        minHeight: corpo ? ALVOS.piso : undefined,
        display: corpo ? "inline-flex" : undefined,
        alignItems: corpo ? "center" : undefined,
        justifyContent: corpo ? "center" : undefined,
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

/* A MOCHILA — o glifo de 24x24 que era `IconeBolsa` ate R13.

   NAO E UM RENOMEAR COSMETICO: `formas.md` (R13, os quatro glifos) da o
   nome `IconeBolsa` a MOEDA — aro r 5,5 a traco 1,1 com miolo r 2,2
   cheio, no quadro 12x12 da cinta —, e este desenho aqui e uma mochila
   de 24x24. Dois glifos com o mesmo nome era impossivel; apagar o antigo
   era tirar a tela ao unico leitor que ele tem (a aba `inv`, em
   `App.jsx`), calado. Fica com o nome que sempre foi o dele.

   QUEM CHAMAVA `IconeBolsa` PARA A ABA DO INVENTARIO CONTINUA A
   COMPILAR, e e por isso que esta linha vai no relato: a aba passa a
   mostrar a MOEDA ate alguem trocar o nome do lado do `App.jsx`. O
   conserto e uma palavra, e nao e meu — o arquivo tem dono. */
export function IconeMochila({ tamanho = 24, cor = T.violetSoft }) {
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

/* ============================================================
   OS QUATRO GLIFOS DA CINTA (R13) — quadro 12x12, tinta unica

   O mesmo quadro de `IconeGota` e `IconeCheck`, e tinta unica como em
   `rosto.jsx`: cada um recebe UMA cor e nao decide nenhuma. Sao 4 dos
   ~21 glifos que R8 conta, e os caminhos sao os de `formas.md` (R13),
   byte a byte — um glifo redesenhado a mao neste arquivo seria a mesma
   acao com duas caras, que e o defeito que a mesa existe para evitar.

   `cor` NAO TEM OMISSAO DE PROPOSITO, ao contrario dos glifos antigos
   deste arquivo: na cinta a cor CARREGA SENTIDO (o corte semantico e
   `formas.md`, R13 — a esquerda sao as cores do heroi, a direita e
   `T.mundo`, e so ali). Um default aqui seria a peca a escolher um lado
   do corte por quem a chama.
   ============================================================ */

/* O CORACAO, cheio. PV. */
export function IconeVida({ tamanho = 12, cor }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M 6 10.6 C 2 7.9 0.7 5.7 0.7 4 C 0.7 2.4 2 1.3 3.4 1.3 C 4.5 1.3 5.5 1.9 6 2.8 C 6.5 1.9 7.5 1.3 8.6 1.3 C 10 1.3 11.3 2.4 11.3 4 C 11.3 5.7 10 7.9 6 10.6 Z" fill={cor} />
    </svg>
  );
}

/* O LOSANGO com miolo. PM — e e irmao de `IconeLosango` (24x24) sem ser
   o mesmo desenho: aquele e so contorno, este tem nucleo, e e o nucleo
   que o faz ler como "mana" e nao como "escolha" a 12 px. */
export function IconeMana({ tamanho = 12, cor }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M 6 0.7 L 11.3 6 L 6 11.3 L 0.7 6 Z" stroke={cor} strokeWidth="1.1" fill="none" strokeLinejoin="round" />
      <path d="M 6 3.7 L 8.3 6 L 6 8.3 L 3.7 6 Z" fill={cor} />
    </svg>
  );
}

/* A MOEDA — o saldo. `formas.md` chama-lhe `IconeBolsa` porque na cinta
   ele e a BOLSA do heroi; o desenho e uma moeda de canto, que e o que se
   le a 12 px (uma mochila a 12 px e uma mancha).

   E A BOLSA E OBRIGATORIA, com o numero do `jogo`: a soleira ofereceu
   205 e 115, o mercado mostrou 30 precos, e a tela NUNCA disse quanto o
   jogador tinha. Uma oferta com preco e sem saldo e meio veredito. */
export function IconeBolsa({ tamanho = 12, cor }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <circle cx="6" cy="6" r="5" stroke={cor} strokeWidth="1.1" fill="none" />
      <circle cx="6" cy="6" r="2.2" fill={cor} />
    </svg>
  );
}

/* A AMPULHETA, e a areia dela e uma FUNCAO — `areiaDaAmpulheta`, que se
   prova em Node. Ela desenha a fraccao que FALTA e e o canal PRIMARIO
   do selo de prazo: geometria pura, sobrevive aos tres daltonismos, ao
   cinzento e ao tamanho. Nasceu de reparar que o glifo ja era um
   medidor. */
export function IconeAmpulheta({ tamanho = 12, cor, fracao = 1 }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M 2.6 1 L 9.4 1 L 6 6 L 9.4 11 L 2.6 11 L 6 6 Z" stroke={cor} strokeWidth="1.05" fill="none" strokeLinejoin="round" />
      <path d={areiaDaAmpulheta(fracao)} fill={cor} />
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

/* `IconeBalao` MORREU AQUI (R17, depois de o `oficial` tirá-lo da linha do
   turno: "um campo de texto não precisa de um ícone a dizer que é um
   campo", e custava 56 px na peça mais apertada da tela — ver
   `App.jsx:23287` e `estilo.js:498`, os dois narrando a aposentadoria).
   Confirmado zero chamadores em `src/` inteiro (nenhum `<IconeBalao` em
   parte nenhuma) antes de apagar — a mesma vara que já aposentou
   `VinhetaDaCena` neste ciclo: uma peça de biblioteca sem chamador não
   fica à espera de voltar, some. Se um dia o balão de `A Consequência`
   (`ui.jsx`, mais acima) precisar de um ícone de fala, é uma decisão do
   `desenho` desenhar um de novo — não ressuscitar este por economia. */

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
        /* borda do inativo: lineStrong, não line — delimita alvo de toque,
           e 1.4.11 pede piso de 3:1 para elemento de interface. */
        border: `${ativo ? 1.5 : 1}px solid ${ativo ? T.amber : T.lineStrong}`,
        boxShadow: ativo ? "0 4px 8px rgba(232,163,61,0.12)" : "none",
      }}>
      {children}
    </button>
  );
}

/* A PÍLULA DE ESCOLHA — `A escolha` *Forma=Pílula* (Figma `20:77`), a
   segunda forma da mesma peça de que `CartaoDeEscolha` é a primeira.

   A ALTURA SAI DE `ALVOS.piso` E NUNCA DE `padding` + `font-size`. É a
   lição de K3 com endereço: a fila da ficha media 27,5 px porque a sua
   altura era o resto de uma conta que ninguém tinha escrito.

   A GRAMÁTICA DO ESCOLHIDO É UMA SÓ (`formas.md`): borda `amber` de 1 px
   + filete de 3 px do lado de entrada + o visto. NUNCA preenchimento
   âmbar cheio — `background: T.amber` tem 37 usos e é a assinatura da
   AÇÃO da tela; usá-lo para dizer «selecionado» faz uma opção parecer o
   botão principal.

   A COLUNA DO VISTO É FIXA (`1ch`) E EXISTE NOS QUATRO ESTADOS. Esconder
   um filho colapsa o espaço e arrasta as palavras: com visto e sem, o
   texto começa no mesmo x, e a largura da pílula não depende de ela
   estar escolhida. O `padding-left` é 15 e não 12 porque os 3 px do
   filete não podem comer a goteira do texto.

   O FILETE VAI POR VARIÁVEL CSS (`--tv-filete`), NUNCA POR `boxShadow`
   INLINE — achado vivo no navegador (K4): estilo inline vence folha de
   estilo sempre, e o anel de foco (`.tv-anel-foco:focus-visible`) é
   `box-shadow`. Um `boxShadow` escrito aqui, no `style`, apagava o anel
   nos quatro estados — o `<button>` antigo do `App.jsx` não tinha
   `boxShadow` inline nenhum, e foi só por isso que K3 provou o anel
   vivo. A folha (`estilo.js`) é quem compõe o filete com o anel.

   O REPOUSO NUNCA É `"none"` — é uma SOMBRA NULA (`inset 0 0 0 0
   transparent`). Achado vivo, segunda rodada (K4): `box-shadow: <sombra>,
   <sombra>, none` é CSS INVÁLIDO — `none` só vale como a propriedade
   INTEIRA, nunca como um item de uma lista de sombras. Com `--tv-filete`
   valendo `"none"`, a regra composta do `:focus-visible`
   (`estilo.js`) virava uma declaração inválida e o navegador a
   DESCARTAVA EM SILÊNCIO: nenhum erro no console, e o anel continuava
   apagado mesmo com a cascata e a especificidade certas. E de brinde:
   uma sombra nula TRANSITA para `inset 3px …` (as duas são a mesma
   "forma" de sombra, só o tamanho muda); `"none"` não transita — a
   troca de 120ms saltava em vez de animar. */
export function PilulaDeEscolha({ rotulo, escolhida, impedida, razao, aoClicar }) {
  return (
    <button type="button" disabled={impedida} aria-pressed={!!escolhida}
      onClick={impedida ? undefined : aoClicar} title={razao || undefined}
      className="tv-anel-foco tv-mono text-[9px] rounded-full tv-escolha-troca"
      style={{
        display: "inline-flex", alignItems: "center",
        minHeight: ALVOS.piso, padding: "0 12px 0 15px",
        background: T.panel,
        color: escolhida ? T.amberSoft : T.inkDim,
        border: `1px solid ${escolhida ? T.amber : T.lineStrong}`,
        "--tv-filete": escolhida ? `inset 3px 0 0 0 ${T.amber}` : "inset 0 0 0 0 transparent",
        fontWeight: escolhida ? 600 : 400,
        opacity: impedida ? 0.45 : 1,
        cursor: impedida ? "not-allowed" : "pointer",
      }}>
      <span aria-hidden="true" style={{ display: "inline-block", width: "1ch", marginRight: 4, textAlign: "center" }}>
        {escolhida ? "✓" : ""}
      </span>
      {rotulo}
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

/* ============================================================
   O CAMPO DE BRASAS (v9.198) — o fogo que o menu ganhou no Figma

   A tabela mora em `brasas.js` e prova-se em Node; aqui só se pinta.

   TRÊS DECISÕES QUE NÃO SÃO ENFEITE:

   1. O halo dos cantos é ESTÁTICO — não depende do tempo. Redesenhá-lo
      a cada quadro seria refazer sessenta vezes por segundo uma imagem
      que nunca muda. Fica guardado e é carimbado.

   2. Quem não quer movimento recebe UM quadro parado, e não uma tela
      vazia: o desenho continua lá, só não anda. Tirar as brasas inteiras
      de quem pediu menos animação seria tirar a taverna junto.

   3. A tela é `aria-hidden` e não recebe dedo. É atmosfera; não há nada
      aqui que alguém precise ler ou tocar.
   ============================================================ */
export function CampoDeBrasas({ className = "" }) {
  const telaRef = React.useRef(null);

  React.useEffect(() => {
    const tela = telaRef.current;
    if (!tela || typeof window === "undefined") return;
    const ctx = tela.getContext("2d");
    if (!ctx) return;   /* navegador sem canvas 2D: a tela fica só escura */

    const parado = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let larg = 0, alt = 0, halo = null, pedido = 0, vivo = true;

    /* o halo, pintado uma vez em tiras: a força é altura × borda, então
       cada tira horizontal é um degradê lateral só */
    const guardarHalo = () => {
      halo = document.createElement("canvas");
      halo.width = Math.max(1, Math.round(larg)); halo.height = Math.max(1, Math.round(alt));
      const h = halo.getContext("2d");
      if (!h) { halo = null; return; }
      const TIRAS = 28, [r, g, b] = HALO.rgb;
      for (let i = 0; i < TIRAS; i++) {
        const y = (i + 0.5) / TIRAS;
        const meio = forcaDoHalo(0, y);           /* a borda decide o resto */
        if (meio <= 0.002) continue;
        const grad = h.createLinearGradient(0, 0, halo.width, 0);
        for (let k = 0; k <= 10; k++) {
          const fx = k / 10;
          grad.addColorStop(fx, `rgba(${r},${g},${b},${forcaDoHalo(fx, y).toFixed(4)})`);
        }
        h.fillStyle = grad;
        h.fillRect(0, (i / TIRAS) * halo.height, halo.width, halo.height / TIRAS + 1);
      }
    };

    const medir = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const cx = tela.getBoundingClientRect();
      larg = cx.width; alt = cx.height;
      if (larg < 1 || alt < 1) return false;
      tela.width = Math.round(larg * dpr); tela.height = Math.round(alt * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      guardarHalo();
      return true;
    };

    const pintar = (tempo) => {
      ctx.clearRect(0, 0, larg, alt);
      if (halo) ctx.drawImage(halo, 0, 0, larg, alt);
      /* aditivo: brasa é luz, e luz soma — sobrepostas, clareiam */
      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < quantasBrasas(larg); i++) {
        const b = brasaEm(i, tempo);
        if (b.forca <= 0.01 || b.y < -0.05 || b.y > 1.2) continue;
        const px = b.x * larg, py = b.y * alt;
        const [r, g, bl] = b.cor.rgb;
        /* O BRILHO EM VOLTA DO NÚCLEO: quatro vezes e meia o raio, e a
           TRÊS DÉCIMOS da força — os dois números são do shader. Escrevi
           0,55 na primeira versão e as brasas viraram bokeh: bolas moles
           do tamanho de uma moeda passando por cima do texto do cartão.
           O que faz brasa parecer brasa é o núcleo pequeno e aceso, não
           o halo; o halo é só o ar quente em volta dele. */
        const brilho = ctx.createRadialGradient(px, py, 0, px, py, b.raio * 4.5);
        brilho.addColorStop(0, `rgba(${r},${g},${bl},${(b.forca * 0.3).toFixed(3)})`);
        brilho.addColorStop(1, `rgba(${r},${g},${bl},0)`);
        ctx.fillStyle = brilho;
        ctx.beginPath(); ctx.arc(px, py, b.raio * 4.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = `rgba(${r},${g},${bl},${Math.min(1, b.forca).toFixed(3)})`;
        ctx.beginPath(); ctx.arc(px, py, b.raio, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
    };

    const nascimento = performance.now();
    const quadro = (agora) => {
      if (!vivo) return;
      pintar((agora - nascimento) / 1000);
      pedido = requestAnimationFrame(quadro);
    };

    if (!medir()) return undefined;
    if (parado) pintar(0); else pedido = requestAnimationFrame(quadro);

    const aoRedimensionar = () => { if (medir() && parado) pintar(0); };
    const observador = typeof ResizeObserver !== "undefined" ? new ResizeObserver(aoRedimensionar) : null;
    if (observador) observador.observe(tela); else window.addEventListener("resize", aoRedimensionar);

    return () => {
      vivo = false;
      if (pedido) cancelAnimationFrame(pedido);
      if (observador) observador.disconnect(); else window.removeEventListener("resize", aoRedimensionar);
    };
  }, []);

  return <canvas ref={telaRef} aria-hidden className={`absolute inset-0 w-full h-full pointer-events-none ${className}`} />;
}

/* ============================================================
   AS PEÇAS DE R2 — "A página iluminada" (23/09/2026)

   Três peças pedidas pelo `jogo` e fabricadas pelo `desenho` em R1,
   fechadas por escrito em `mente/formas.md` (seção "R1 · o que o jogo e
   o desenho fecharam entre si"). NENHUMA tem consumidor no `App.jsx`
   ainda — é o `oficial` quem as liga, com o bastão, na etapa seguinte.
   Nascem aqui fabricadas e providas; a suíte que segura a catraca de
   export morto (`teste-ligacao`) mora em `testes/teste-r2-pecas.mjs`.
   ============================================================ */

/* ---------------- A OFERTA (R2) ----------------
   O que o mundo abriu e você ainda não atravessou, tocável, com o preço
   na tela. Nasce da medida de R1: "Aceito o trabalho do Yorick" esperou
   14,3 s e não foi ouvido — o Narrador, sem saber que "aceitar" é verbo
   de sistema, improvisou ◉80 contra os ◉60 da tabela. A aceitação
   existe, funciona e está bonita: é o cartão de contrato de
   `PainelMural` (`App.jsx:1546`, protótipo — leia, não edite). Falta
   ela poder viver fora do painel.

   TRÊS CAMPOS OBRIGATÓRIOS NA TELA, NENHUM EM `title`: o verbo, o
   preço, o retorno. R1 mediu ZERO dos 20 controles de ação de hoje
   dizendo o preço na tela, e OITO escondendo-o em `title` — balão de
   rato que no telefone não existe. "O veredito antes do clique" é lei
   da casa, e aqui ela se cumpre por um canal que todo aparelho tem.

   A DÍVIDA DECLARADA, e é a única desta etapa: `formas.md` pede que o
   preço monte uma instância de `Consequencia` (variante Longa). Varrido
   `src/` inteiro: `Consequencia` NÃO EXISTE em código nenhum — zero
   declarações — e `formas.md` marca "[ainda não existe]" em pelo menos
   cinco entradas próprias sobre ela. A lei do `aprendiz` é não inventar
   forma: "se não existirem como precisa, diga-me em vez de as
   duplicar" está escrita na própria etapa que pediu esta peça. Desenhar
   os 4 tons × 2 formas × larguras de `Consequencia` por conta própria
   seria inventar um componente maior que esta peça inteira — por isso
   o preço e o retorno saem em TEXTO PLANO (mono, `TIPOS.rotulo`, tingido
   pelo `tom`) até `Consequencia` nascer de verdade. Quando nascer, é
   só aqui que troca: o resto da peça — o verbo, a moldura, os três
   eixos — não muda uma linha.

   Eixos:
   · `tom` — "convite" (`T.mundo`, o mundo abriu, não custa) · "preco"
     (`T.amber`, custa, e o custo está escrito) · "semVolta"
     (`T.danger`, não se desfaz).
   · `estado` — "repouso" · "impedida" · "tomada": herda a gramática de
     `Botao` (`desativado`). "foco" NÃO é um valor que se passa — é
     automático via `:focus-visible` (o próprio `Botao` não tem prop de
     foco), e inventar um aqui seria a segunda gramática que a lei da
     casa proíbe.
   · `chegada` — "assentada" · "agora": a marca de "novo neste turno".
     DECAI NO TURNO SEGUINTE, NUNCA POR RELÓGIO — quem decide a troca é
     o `App.jsx`; esta peça só lê a prop e reusa `tv-slide` (a entrada
     lateral que a casa já tem) em vez de inventar uma animação nova.
     Nem `O realce` nem `Selo Mudou=Agora` servem aqui — os dois foram
     recusados por escrito em `formas.md`: `O realce` é o degrau 2 da
     cerimônia (usá-lo tornaria cada contrato um acontecimento), e
     `Selo` marca ESTADO de uma coisa — uma oferta não é um estado, é
     uma porta.
   · `janela` — R15, E É O QUARTO CAMPO. Ver o bloco logo abaixo. */
/* ---------------- R15: O QUARTO CAMPO, E ELE ENTRA PELA PENEIRA ----------------
   `A oferta` tem TRÊS campos porque três era o que CABIA: a soleira era
   55 % do ecrã quando ela foi desenhada. Depois de R13 é 14 %, e o
   orçamento que a apertava deixou de existir. **O que isso não autoriza
   é enchê-la** — e o quarto campo não entra por caber, entra pela
   peneira do `jogo`: *a soleira é o que o jogador PERDE se não agir
   agora.* **Uma peça cuja razão de existir é a perda tem de dizer
   quanto tempo falta**, e a de hoje não diz. Medido em R6: a oferta do
   Yorick esteve viva QUATRO TURNOS e a tela nunca disse que eram
   quatro.

   E O QUINTO CAMPO É DEFEITO, e é lei varrível e não gosto:
   `SOLEIRA.camposDaOferta = 4` (verbo · preço · retorno · janela). O
   quinto faz a oferta deixar de se ler de relance e passar a ser um
   formulário — e uma soleira de formulários é o *point-and-click* que a
   medida dos 990 ms existe para apanhar.

   A JANELA NÃO É TEXTO: é `O selo de prazo`, que já existe, com o eixo
   `Conta` que R15 lhe deu (Noites · Turnos). *Uma ação, uma forma* —
   desenhar aqui um segundo selo seria a mesma contagem com duas caras.

   ELA É GRÁTIS, E É A MEDIDA QUE O DIZ (Figma, `desenho`): a oferta com
   janela mede 108 px e **sem janela mede os mesmos 108**, porque viaja
   numa linha que já existia — partilha a do preço, alinhada à direita.
   `Janela=Nenhuma` não deixa buraco: não se reserva lugar para nada.

   A FORMA DA PROP, e ela é tolerante de propósito porque quem a monta é
   o `App.jsx` a partir de dois motores diferentes: `{ quanto, conta,
   urgente }`, ou um número solto, que se lê como noites. Sem prop
   nenhuma, a peça é byte a byte a de ontem.

   QUEM CEDE QUANDO NÃO COUBER É O RETORNO, e ele é o único que pode: o
   preço é um número que não encolhe sem mentir, a janela é uma contagem
   que não encolhe sem mentir. **O retorno é prosa, e prosa trunca.** */
export function Oferta({ verbo, preco, retorno, quem, onde, tom = "convite", estado = "repouso", chegada = "assentada", janela, aoClicar }) {
  const impedida = estado === "impedida";
  const tomada = estado === "tomada";
  const corDoTom = tom === "semVolta" ? T.danger : tom === "preco" ? T.amber : T.mundo;
  const quemOnde = [quem, onde].filter(Boolean).join(" · ");
  /* `= {}` no destructuring NÃO cobre `null` — a lei da casa, escrita no
     `CLAUDE.md` e paga em sangue noutro sítio. Daí o `|| {}`. */
  const j = typeof janela === "number" ? { quanto: janela } : (janela || {});
  const temJanela = Number.isFinite(j.quanto) || j.urgente === true;
  /* R4a — A CORREÇÃO DE ALTURA, com o número escrito: a peça media ~97px
     contra o orçamento de 48–56 (`mente/r1-desenho.md` §5: "Teto de três
     na mesa… 3 × 48 + 2 × 8 = 160 px"). O culpado não era um campo a
     mais — era DUAS linhas empilhadas (o verbo + uma segunda fila de
     quem/onde) dentro de um `p-3` que somava por cima do `minHeight` do
     próprio `Botao`. A saída é composição, não corte, como o pedido
     manda: os TRÊS campos obrigatórios (verbo, preço, retorno) continuam
     todos na tela — na MESA, numa linha só; ver R5c abaixo para o
     telefone, onde a linha única deixou de caber. `quem`/`onde` não é um
     dos três campos obrigatórios (`formas.md` só marca verbo/preço/
     retorno assim); ele cede o LUGAR — encolhe por `truncate` num
     `flex-1 min-w-0` e pode chegar a zero de largura — quando o verbo e
     o preço já tomaram o espaço. Com `Botao corpo` agora lendo
     `ALVOS.piso` (a correção acima), o piso da peça na mesa é o do
     próprio botão: 48 de conteúdo + a folga mínima do `py-0.5` (4px) +
     a borda (2px) = 54px de repouso — dentro da janela 48–56 que o
     pedido fixou.

     R5c — O TELEFONE PRECISA DE UMA FORMA PRÓPRIA, E NÃO É ENCOLHER A
     LETRA. Medido vivo pelo `oficial` a 375px: 142px, e o verbo (uma
     frase inteira, não uma palavra — "Aceitar: Praga em as terras
     baixas") quebrava em SEIS linhas dentro do espaço que sobrava ao
     lado do preço e do retorno, porque a linha única da mesa não é a
     forma certa quando o botão precisa dividir a largura com mais duas
     coisas E o texto não cabe de jeito nenhum. `TIPOS.piso` (12) é o
     piso da casa — reduzir a letra para caber estava fora de cogitação.
     A primeira saída (still R5c) forçava o botão a `w-full` sempre
     abaixo de `md:` — resolvia o verbo comprido, mas cobrava a MESMA
     linha inteira de qualquer verbo, mesmo `Esperar` (sete letras), que
     é o mais frequente de todos. R5d corrigiu isso (abaixo).

     R5d — A LINHA SÓ QUEBRA QUANDO O VERBO PRECISA DELA, POR
     `flex-wrap` PURO, SEM `w-full`. O `oficial` mediu que forçar
     `w-full` sempre cobrava 3,8 pontos de prosa no turno TÍPICO
     (`Esperar` a tomar a mesma linha que um contrato de 34 caracteres)
     para ganhar 7,0 no turno raro — "ganhar o pior caso pagando o caso
     comum é a troca errada". A correção não precisou de `min-width` nem
     de estado nenhum: **`flex-wrap` já decide isso sozinho**, pela regra
     de sempre do CSS — um item entra na linha corrente pelo seu tamanho
     NATURAL (o conteúdo, sem forçar largura), e só desce para a linha
     seguinte quando não cabe. O botão do verbo voltou a `w-auto`
     (nenhuma classe de largura própria): `Esperar` é estreito, cabe ao
     lado de `quem`/preço/retorno e a linha fica com os três, igual à
     mesa; um contrato de 34+ caracteres já não cabe sozinho ao lado dos
     outros dois, e a MESMA regra de `flex-wrap` empurra `quem`/preço/
     retorno para a linha de baixo — sem o botão ter de saber que é
     "comprido". `quemOnde` mantém a classe `flex-1` (`flex-basis: 0%`),
     que já valia zero para efeito de "cabe nesta linha" — é por isso que
     ela nunca é o item que decide a quebra.

     E O VERBO GANHA UM TETO DE DUAS LINHAS, NÃO SEIS — E AS RETICÊNCIAS
     SÃO GARANTIDAS, NÃO TORCIDAS DE UMA CLASSE DO TAILWIND: a classe
     utilitária `line-clamp-2` (CDN) mediu `display: flow-root` ao vivo,
     e o corte funcionava (via `overflow:hidden`) mas sem reticência
     nenhuma — e um comentário que promete "…" que não aparece é pior que
     nenhum comentário. A saída (R5d) foi trocar a classe por `style`
     inline com as MESMAS quatro declarações (`display:"-webkit-box"`,
     `WebkitBoxOrient:"vertical"`, `WebkitLineClamp:2`,
     `overflow:"hidden"`), que nunca perde para a folha gerada por
     especificidade. MEDIDO DE NOVO AO VIVO (375px, título de 239
     caracteres): `getComputedStyle` AINDA reporta `display: flow-root` —
     é assim que o Chrome hoje serializa o `display` resolvido de um
     bloco com `-webkit-line-clamp` (a implementação nativa moderna do
     corte deixou de precisar do hack do flexbox por baixo; o valor
     computado é só como o motor NOMEIA o resultado, não o resultado em
     si) — MAS a reticência aparece na tela: `scrollHeight` 135 contra
     `clientHeight` 45 (corta) e o pixel mostra "…engolir Forte…" no fim
     da segunda linha, confirmado por captura de tela, não calculado.
     `flow-root` deixa de ser sintoma de bug: é só o nome que o motor deu
     ao próprio corte. Uma oferta que precisa de mais que duas linhas
     para dizer o que é já não é um verbo, é um parágrafo — cortar com
     reticências é honesto (diferente de esconder o preço em `title`): o
     verbo CONTINUA por inteiro no DOM (leitor de tela lê tudo, e agora
     também o nome acessível do botão — ver `ariaLabel` em `Botao`,
     acima), só a TINTA é que para em duas linhas com "…" no fim. */
  return (
    <div className={`rounded-xl flex flex-wrap md:flex-nowrap items-center gap-2 md:gap-3 px-3 py-1 md:py-0.5 ${chegada === "agora" ? "tv-slide" : ""}`}
      style={{
        minHeight: ALVOS.piso,
        background: T.panel,
        border: `1px solid ${tomada ? T.lineStrong : corDoTom}`,
        opacity: impedida ? 0.55 : 1,
      }}>
      <Botao onClick={impedida || tomada ? undefined : aoClicar} desativado={impedida || tomada} corpo primario ariaLabel={verbo}>
        {/* R5d — nome acessível explícito em `Botao` (`ariaLabel`),
            porque o `<span>` abaixo (preciso para o teto de duas linhas)
            apagava o nome-a-partir-do-conteúdo em pelo menos um
            instrumento de leitura. Nem `w-full` nem `md:w-auto` aqui: o
            `flex-wrap` do cartão decide sozinho, pelo tamanho natural do
            texto, se este botão cabe ao lado de `quem`/preço/retorno ou
            se precisa da linha para si — ver R5d acima. O `style` faz o
            teto de duas linhas com reticências garantidas (não a classe
            `line-clamp-2`, que a CDN gerou sem `-webkit-box`). */}
        <span style={{ display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: 2, overflow: "hidden" }}>
          {verbo}
        </span>
      </Botao>
      {quemOnde && (
        <div className="tv-mono truncate flex-1 min-w-0" style={{ fontSize: TIPOS.rotulo, color: T.inkMeio }}>
          {quemOnde}
        </div>
      )}
      {/* A DÍVIDA DECLARADA no comentário grande acima: isto NÃO É
          `Consequencia` — é o texto plano que a espera até ela nascer.
          Mono/`TIPOS.rotulo` porque preço e retorno são fala DA
          MÁQUINA, não da prosa; nunca abaixo de `TIPOS.piso`. */}
      {(preco || retorno || temJanela) && (
        <div className="tv-mono flex items-center gap-2 shrink-0 md:ml-auto" style={{ fontSize: TIPOS.rotulo }}>
          {preco && <span style={{ color: corDoTom, fontWeight: 600 }}>{preco}</span>}
          {/* O RETORNO AINDA NÃO TRUNCA, e digo-o em vez de o fingir:
              `formas.md` decide que quem cede é ele, *pelo fim, com
              reticências* — mas `truncate` dentro de um `shrink-0` é uma
              classe que promete "…" e nunca a desenha, que é
              exactamente o defeito que o comentário de R5d acima existe
              para não repetir. Fazê-lo a sério pede a fila do preço
              poder encolher, e isso muda o `flex-wrap` que R5d mediu e
              fixou. **Fica dito ao `desenho`, não remendado aqui.** */}
          {retorno && <span style={{ color: T.inkDim }}>{retorno}</span>}
          {/* A JANELA É A ÚLTIMA DA LINHA, e por isso a mais à direita —
              é o que `formas.md` pede. `quantos` fica em 1: o `+N` do
              selo conta OUTROS prazos da cinta, e uma oferta tem uma
              janela só. */}
          {temJanela && (
            <SeloDePrazo noites={j.quanto} urgente={j.urgente === true} conta={j.conta || "noites"} />
          )}
        </div>
      )}
    </div>
  );
}

/* ---------------- A DOBRA (R15) ----------------
   REVELAR MAIS ITENS NA PRÓPRIA LISTA. O nome é o da folha de papel:
   dobra-se, e o que lá está continua lá.

   POR QUE ELA NASCE AGORA, E É UMA DÍVIDA A SER PAGA. R10 precisou
   desta forma para o `+N` da soleira, viu que a forma fechada de
   `formas.md` (*Véu + Fechar*) é para SOBREPOSIÇÕES — e esta não cobre
   a tela, não tem véu, não precisa de `Esc` — e então **compôs com
   peças que já eram lei em vez de inventar**, deixando a dívida
   escrita: *"vai reaparecer — abas, inventário, bolsa —, e na segunda
   vez já não é composição, é forma por nomear."* Reapareceu: com quatro
   verbos e teto 1 no telefone, o `+N` deixa de ser raro e passa a ser o
   caminho NORMAL. Então nomeia-se.

   A LEI DA DOBRA, e ela resolve o conflito com o teto da soleira:

       O TETO PROTEGE A PÁGINA DO SISTEMA, NÃO DO JOGADOR.

   A soleira nunca passa do teto (`SOLEIRA`) **por decisão do jogo**; a
   dobra passa-o **por decisão de quem joga**, e por isso pode. *Um teto
   que o jogador não pode levantar não é um teto: é uma porta trancada.*

   A BORDA É TRACEJADA, E É DE PROPÓSITO: **é a única peça da soleira
   que não é uma porta do MUNDO — é uma porta da LISTA.** O tracejado
   diz isso sem uma palavra e não gasta cor nenhuma. Dar-lhe um acento
   seria pô-la a competir com as ofertas que ela esconde, e a lei de R1
   é que cor viva só vai em coisa com que se interage — ela é
   interagível, mas não é uma oferta.

   DIZ O NÚMERO **E** O SUBSTANTIVO — `mais 3 ofertas`, nunca só `+3`:
   o número é o que deixa o jogador decidir se vale abrir, e o
   substantivo é o que o impede de ser o `▸ Mural` a renascer (uma marca
   que promete que há mais e não se sabe de quê). Aberta, diz `dobrar de
   volta` — e fecha-se **no mesmo alvo**, que continua o último da
   lista: *o polegar não volta a procurar.*

   NASCE PARA TODOS, como a lei da mesa manda: abas, inventário e bolsa
   passam a ter esta forma disponível, e por isso o substantivo entra por
   prop. A próxima vez que alguém precisar de "mostrar mais na própria
   lista" já não compõe — instancia.

   `prefers-reduced-motion`: aparece e desaparece **sem transição** —
   cumprido por construção, porque esta peça não tem movimento nenhum
   para cortar. Nunca bloqueia e nunca atrasa o `Agir →`. */
export function Dobra({ quantos = 0, singular = "oferta", plural = "ofertas", estado = "dobrada", aoAlternar }) {
  const aberta = estado === "aberta";
  return (
    <button type="button" onClick={aoAlternar} aria-expanded={aberta}
      className="tv-anel-foco tv-mono rounded-lg self-start inline-flex items-center gap-2"
      style={{
        minHeight: ALVOS.piso, padding: "0 14px", fontSize: TIPOS.rotulo,
        color: T.ink, background: T.panel,
        /* `rounded-lg` JÁ É o raio 8 que `formas.md` pede — escrevê-lo
           outra vez em `style` seria o mesmo número em dois sítios. */
        border: `1px dashed ${T.lineStrong}`,
        cursor: "pointer",
      }}>
      {/* O GLIFO É `T.inkDim` — a segunda voz, nunca a primeira: quem
          carrega o sentido é a frase, e o chevron só diz para que lado.
          É a seta que a casa já tem, virada: uma peça que abre PARA
          BAIXO aponta para baixo, e dobrada de volta aponta para cima —
          sem um ícone novo e sem uma segunda gramática de direcção. */}
      <span aria-hidden="true" className="inline-flex"
        style={{ transform: `rotate(${aberta ? -90 : 90}deg)` }}>
        <IconeSeta tamanho={14} cor={T.inkDim} />
      </span>
      {aberta ? "dobrar de volta" : `mais ${quantos} ${quantos === 1 ? singular : plural}`}
    </button>
  );
}

/* ---------------- A CONSEQUÊNCIA (D4 → R17) ----------------
   "O QUE O JOGO DIZ QUE VAI ACONTECER" — declarada em `formas.md` desde
   D4, e nunca tinha código: `Consequencia` NÃO EXISTIA — zero declarações
   em `src/` inteiro — e o próprio comentário da `Oferta` (acima, R2) e
   das 105 chamadas de `title` no `App.jsx` viviam à espera dela. É a
   peça que cumpre *"o veredito antes do clique"* fora do `Botao`
   (a razão de uma recusa é dela, nunca do botão — ver `formas.md`,
   "As 4 gramáticas do veredito antes do clique").

   OS QUATRO EIXOS QUE JÁ EXISTIAM NO FIGMA (D4), sem código até agora:
   · `tom` — a quem o facto pertence: "impedimento" (você age, não pode,
     `T.danger`) · "espera" (alguém mais está a decidir — `T.mundo`, que
     já é a cor "do que espera" na casa) · "preco" (o que isto custa,
     `T.amber`) · "estado" (uma confirmação neutra — "copiado" — `T.inkMeio`).
   · `forma` — "linha" (vive sempre na árvore, e é a única construída —
     ver a nota grande antes do `return linha` no fim da função: `formas.md`
     fixa o MOVIMENTO de "balao" mas não a forma de repouso dele, e
     inventar essa aparência aqui seria a lei do `aprendiz` sendo
     quebrada). NO TABULEIRO a Consequência é SEMPRE "linha" mesmo depois
     de "balao" nascer: quatro segundos de balão tapam as casas para
     onde o jogador ia andar — decisão de quem chama, não desta peça.
   · `largura` — "cabe" (o de sempre: a peça mede o que o texto pede) ·
     "ocupa" (`width:100%`, a razão QUEBRA em vez de crescer — o eixo
     que existe para a razão nunca ser cortada).
   · `frase` / `colidiu` — a prosa, e "o que colidiu": vazio por
     omissão, e quando existe escreve o nome entre «» em `T.inkMeio` —
     uma fenda da peça, não texto à mão montado em cada chamada.

   O EIXO NOVO DE R17 — `saida`: "tem" · "nao" · `undefined` (o eixo não
   se aplica; é o comportamento de sempre, colorido por `tom`). Nasceu
   do cartaz que só pode falhar (`mente/formas.md`, R17, PARTE I): o
   mural filtrava por título exato e o aceite recusava por cinco motivos
   que o desenho nunca perguntava — quatro em cinco botões do mural real
   da pessoa não podiam dar certo. `Saída` é a resposta: "Tem" = o
   jogador desfaz isto com a mão (larga um contrato, vai ver o Diário);
   "Não tem" = não há o que fazer, o serviço já está feito.

   OS CINCO CANAIS QUE DISTINGUEM "Tem" DE "Não tem" — E A COR NÃO É UM
   DELES (formas.md, R17 §2: geometria primeiro, palavra segundo, forma
   terceiro, cor por último — e aqui a cor nem entra):
     1. o ALVO — "tem" desenha uma porta real (`<button>`, minHeight
        `ALVOS.piso`); "nao" não desenha nenhum alvo — é o canal mais
        forte porque se testa com o dedo, não com o olho.
     2. o GLIFO `▸` — só em "tem", no fim da linha.
     3. a GRAMÁTICA — "tem" traz um `rotulo` imperativo (quem chama
        escreve "largue um contrato…", "ver no Diário…"); "nao" não tem
        rotulo nenhum, porque não tem porta.
     4. o TAMANHO — "tem" cresce até ao piso do alvo (é maior, por ter
        um alvo de verdade); "nao" fica do tamanho da própria frase — o
        encolhimento da PEÇA-MÃE (o cartão que a contém) é de quem
        chama, não desta peça.
     5. a COR — a MESMA nos dois: `T.inkDim`, nunca a cor viva do `tom`.
        É lei de R1 ("cor viva só em coisa com que se interage") a
        cobrar-se sozinha: o âmbar da porta já é o acento; pintar a
        razão de vermelho/o-que-for gastaria esse canal em texto inerte.
        Por isso, com `saida` definido, `tom` deixa de tingir a prosa —
        só continua a existir para quem ainda usa a peça sem este eixo.

   O QUE ESTA PEÇA NÃO FAZ, DE PROPÓSITO: não encolhe o CARTÃO que a
   contém quando `saida==="nao"` — isso é o `formas.md` §5 chamar de
   "uma `A dobra` fechada", e é decisão de composição de quem monta a
   tela (o `oficial`/`App.jsx`), não desta peça de biblioteca. O que
   `Consequencia` garante é só a SUA PRÓPRIA forma: com alvo ou sem
   alvo, com porta ou sem porta.

   CONTRASTE, MEDIDO (fórmula WCAG, luminância relativa sRGB, as MESMAS
   cores de `T`): `T.inkDim` sobre `T.panel` = 6,44:1 (5,82:1 sobre
   `T.panelSoft`) — a prosa neutra do eixo `saida`. `T.amber` sobre
   `T.panel` = 8,02:1 (7,25 sobre `panelSoft`) — a porta. Sem `saida`:
   `T.danger` 6,37:1 (5,76) · `T.mundo` 10,09:1 (9,12) · `T.inkMeio`
   8,75:1 (7,91). As seis folgam acima do piso AA de texto pequeno
   (4,5:1) — a pior é `T.danger`/`panelSoft`, com 28% de folga.

   `prefers-reduced-motion`: esta peça (Forma=Linha) não anima nada — não
   entra nem sai, só troca de conteúdo quando quem chama troca as props.
   Nada para cortar é a forma mais barata de cumprir a lei. */
export function Consequencia({
  tom = "impedimento", forma = "linha", largura = "cabe",
  frase = "", colidiu = "", saida, rotulo, aoAbrir, className = "",
}) {
  const CORES_DO_TOM = { impedimento: T.danger, espera: T.mundo, preco: T.amber, estado: T.inkMeio };
  const corDoTom = CORES_DO_TOM[tom] || T.inkMeio;
  const temEixo = saida === "tem" || saida === "nao";
  const ehPorta = saida === "tem";
  /* Canal 5: com o eixo `Saída` ativo a prosa é sempre `T.inkDim` — ver
     o comentário grande acima. Sem o eixo, o comportamento de sempre:
     a cor viva do `tom` tinge a frase (como `Oferta.preco` já faz). */
  const corDaFrase = temEixo ? T.inkDim : corDoTom;

  const conteudo = (
    <>
      <span>{frase}</span>
      {/* R17, emenda depois de o `oficial` ligar a peça: `vereditoDoCartaz`
          (e qualquer chamador futuro) devolve `frase` a parar exatamente
          onde `colidiu` entraria — sem «» e sem espaço. É esta peça, não
          quem chama, que cerca o nome com «» e o tinge de `T.inkMeio`
          (a "fenda" de `formas.md`); o espaço antes do glifo é literal
          (`{" "}`) porque JSX colapsa espaço em texto solto. */}
      {colidiu && <> {" "}«<span style={{ color: T.inkMeio }}>{colidiu}</span>»</>}
      {ehPorta && (
        <span aria-hidden="true" style={{ color: T.amber, marginLeft: 8, whiteSpace: "nowrap" }}>
          {rotulo} ▸
        </span>
      )}
    </>
  );
  const nomeAcessivel = ehPorta ? [frase, colidiu, rotulo].filter(Boolean).join(" ") : undefined;

  const estiloComum = {
    fontSize: TIPOS.piso, lineHeight: 1.5, color: corDaFrase,
    width: largura === "ocupa" ? "100%" : undefined,
  };

  /* Canal 1, a mais forte das cinco: só "tem" vira alvo de verdade. */
  const linha = ehPorta ? (
    <button type="button" onClick={aoAbrir} aria-label={nomeAcessivel}
      className={`tv-anel-foco tv-mono text-left rounded-lg ${className}`}
      style={{ ...estiloComum, minHeight: ALVOS.piso, padding: "4px 8px", background: "transparent", border: "none", cursor: "pointer" }}>
      {conteudo}
    </button>
  ) : (
    <div className={`tv-mono ${className}`} style={estiloComum}>
      {conteudo}
    </div>
  );

  /* FORMA=BALÃO, E POR QUE ELA NÃO ESTÁ CONSTRUÍDA: `formas.md` (D4)
     fixa o MOVIMENTO do balão (abre em 120ms, não fecha sozinho antes de
     4s, abre no dedo e no rato) mas não a FORMA DE REPOUSO — o que fica
     visível ANTES do hover/toque, para o jogador saber que há algo ali.
     Inventar essa aparência aqui seria exatamente o que a lei do
     `aprendiz` proíbe ("se não existir como precisa, diga em vez de
     duplicar"): um balão não é só timing, é também um gatilho, e nenhum
     gatilho de "consequência escondida" está desenhado em `formas.md`
     nem no Figma. Por isso `forma="balao"` hoje DEGRADA para `linha`
     (sempre na árvore) em vez de fingir uma forma que ninguém fechou —
     é o mesmo raciocínio que fez a `Oferta` sair em texto plano até
     esta peça nascer. Quando o primeiro consumidor precisar do balão de
     verdade (nenhum pede hoje), é ao `desenho` que se pergunta a forma
     de repouso — não a este comentário. */
  return linha;
}

/* ---------------- A SOLEIRA (R2) ----------------
   Onde as ofertas moram: região fixa, fora do rolamento, entre a página
   e o campo do turno. O nome é do `desenho`, por lei e não por gosto —
   já existe `FaixaRelogios` na mesma tela e `tv-faixa` na folha, e um
   segundo "A faixa" no mesmo ecrã seria "uma ação, uma forma" violada
   um andar acima (`formas.md`, "R1 · A soleira").

   VAZIA NÃO DEIXA BURACO: sem oferta nenhuma, `null` — zero altura,
   zero margem, zero borda. Região que reserva espaço para nada é
   mobília a mentir.

   O TETO SAI DE TABELA (`SOLEIRA`, `estilo.js`), nunca de aritmética de
   leiaute — e desde R5a é 2 na mesa, 1 no telefone (a conta do `jogo`
   e do `regente` vive no comentário de `SOLEIRA`, não aqui: um número
   só tem uma casa). "+N" abre o resto.

   NO TELEFONE DESFAZ-SE, NÃO VIRA GAVETA — a lição de E4: uma tira
   apertada não ganha um menu escondido, esvazia-se. As duas listas
   abaixo (`hidden md:flex` / `flex md:hidden`) são CSS puro: nenhuma
   media query em JS, nenhum estado de "aberto" para o telefone perder
   ao girar a tela. O `aberto` que existe (R5a, abaixo) é outra coisa:
   não decide QUAL lista aparece — isso é sempre CSS —, decide se ELA
   mostra o teto ou o total, e as duas listas leem o mesmo estado.

   R5a — O "+N" VIRA PORTA, NÃO FICA TEXTO. Media ao vivo pelo `oficial`:
   no telefone, com teto 1, o `+3 ofertas` escondia `Aceitar`, `Negociar
   aqui` e `Esperar` sem forma nenhuma de lá chegar. O `jogo` deu-lhe o
   nome do próprio defeito que a soleira nasceu para matar: *"+N ofertas"
   como texto é o `▸ Mural` a renascer dentro da peça que o matou — uma
   marca que promete que há mais e não se toca.* A régua, dele: é porta,
   48 px (`ALVOS.piso`), e diz quantas.

   NÃO É UM "abrir e fechar um painel" (`formas.md`) — não é sobreposição:
   não cobre a tela, não tem véu, não precisa de `Esc` nem de saída pelo
   fundo, porque não sai do lugar onde já estava. É revelação no próprio
   fluxo da lista — mais perto de "navegar entre abas" (uma escolha que
   troca o que está visível na mesma região) do que de um véu. `formas.md`
   ainda não nomeia essa forma; até o `desenho` decidir um nome para ela,
   este botão usa só peças já fechadas noutro lugar — `ALVOS.piso`,
   `tv-anel-foco`, `tv-mono`, `T.inkDim`/`T.lineStrong` (a borda de
   controlo que `Voz`, acima, já usa) — e nenhuma cor, raio ou movimento
   novo. Sem esta peça ter nome próprio, é a forma mais parecida que já
   existe, não uma forma inventada.

   R5c — A PORTA FICA NA SUA PRÓPRIA LINHA. O `oficial` mediu o custo —
   56px = 7,3 pontos de prosa, a diferença entre 50,3% e 43,0% na mesa
   no pior caso — e perguntou se ela não devia partilhar linha com a
   última oferta em vez de abrir uma fileira só sua. Decisão: NÃO, por
   três razões.
   (1) Cada `Oferta` já ocupa 100% da largura da soleira (é um cartão de
   `flex-col`, não uma coluna estreita); colar a porta a ela exigiria a
   `Oferta` aceitar e desenhar um filho estranho ao seu próprio contrato
   — a peça deixaria de ser "uma oferta" para virar "uma oferta, e às
   vezes mais uma coisa que não é dela", só para a última da lista.
   (2) A porta é do CONJUNTO, não do último item: colada ao cartão do
   Yorick, por exemplo, um jogador podia ler "+1 oferta" como se fosse
   PARTE do contrato do Yorick — a mesma ambiguidade que R1b já matou
   (`▸ Mural`: uma marca que não se sabe do que é dona).
   (3) O custo só existe no ramo raro: com teto 2 e a tábua fora da
   soleira (R5b), o turno típico tem 0–1 oferta — a porta só aparece
   quando o teto foi de fato atingido, e otimizar esse ramo às custas da
   clareza do caso comum (que é a imensa maioria dos turnos) troca o
   problema errado. E é justamente no turno mais carregado que a porta
   precisa de ser a MAIS clara, não a mais espremida.
   O piso de 48px (`ALVOS.piso`) já é o mínimo que a lei de acessibilidade
   da casa aceita para "toda peça em que se toca" — não há gordura para
   cortar sem violar essa régua primeiro. */
export function Soleira({ ofertas = [] }) {
  /* um estado só, partilhado pelas duas listas (mesa/telefone) — quem
     decide qual delas está visível continua a ser o CSS acima, nunca
     este estado. Abrir na mesa e depois encolher a janela para telefone
     mantém a lista de telefone também aberta: é o MESMO "aberto", não
     dois. */
  const [aberto, setAberto] = React.useState(false);
  const lista = (ofertas || []).filter(Boolean);
  if (lista.length === 0) return null;

  const foraDaMesa = Math.max(0, lista.length - SOLEIRA.tetoNaMesa);
  const naMesa = aberto ? lista : lista.slice(0, SOLEIRA.tetoNaMesa);
  const foraDoTelefone = Math.max(0, lista.length - SOLEIRA.tetoNoTelefone);
  const noTelefone = aberto ? lista : lista.slice(0, SOLEIRA.tetoNoTelefone);

  /* R15 — A PORTA DEIXA DE SER COMPOSTA AQUI E PASSA A SER `A dobra`.
     O comentário de R5a acima dizia, com todas as letras, que esta peça
     não tinha nome em `formas.md` e que por isso ela era montada com
     peças já fechadas noutro lugar, *até o `desenho` decidir um nome
     para ela*. Decidiu, e chama-se `A dobra` — e o que muda não é só o
     nome: ganha a borda TRACEJADA (que diz, sem uma palavra, que esta é
     a única porta da soleira que não abre para o MUNDO mas para a
     LISTA), o glifo de direcção, e o substantivo em vez do `+N` seco.
     *Uma lei que se escreve e não se instancia é uma intenção.* */
  const porta = (n) => (
    <Dobra quantos={n} estado={aberto ? "aberta" : "dobrada"}
      aoAlternar={() => setAberto((a) => !a)} />
  );

  return (
    <div className="w-full flex flex-col gap-2" role="region" aria-label="O que o mundo oferece agora">
      <div className="hidden md:flex flex-col gap-2">
        {naMesa}
        {foraDaMesa > 0 && porta(foraDaMesa)}
      </div>
      <div className="flex md:hidden flex-col gap-2">
        {noTelefone}
        {foraDoTelefone > 0 && porta(foraDoTelefone)}
      </div>
    </div>
  );
}

/* ---------------- A VOZ (R2) ----------------
   O cabeçalho de quem fala dentro da página. Hoje o "Mestre" é um
   `<div>` de 10 px mono com um botão de ouvir de 22×22 colado, escrito
   à mão em dois sítios do `App.jsx`. Com a narração virando página, é
   esta peça quem separa uma voz da seguinte — e é aqui que o botão de
   ouvir ganha os seus 48 px em vez dos 22 de hoje.

   Eixos: `quem` (mestre · voce · mundo) × `voz` (muda · lendo ·
   preparando) — os únicos TRÊS valores que `App.jsx` de fato escreve
   como autor de mensagem, contados em R1 (sistema 503 · jogador 43 ·
   mestre 1). O NPC que fala não é uma quarta voz: numa mesa de verdade
   o Mestre É a voz dos NPC, e Yorick/Quorin falam em travessão dentro
   da prosa do Mestre e continuam lá.

   O GLIFO DE OUVIR ENTRA POR PROP (`glifoDeOuvir`), NUNCA FIXO AQUI: os
   81 emoji do sistema viram glifo desenhado numa etapa PRÓPRIA (R1,
   item 6 da lista) — decidir o ícone aqui seria essa etapa por atalho.
   Até lá, quem chama `Voz` passa o que já usa hoje (o 🔊).

   O ALVO CRESCE PARA `ALVOS.piso` SEM CRESCER A TINTA: o `<button>`
   mede 48×48 e o glifo lá dentro continua do tamanho que sempre foi.
   É "o enchimento" que a etapa pediu como solução — não um `::after`
   fantasma —, porque um botão sem fundo nem borda não paga custo de
   leiaute nenhum por ser maior que o próprio desenho.

   ---------------- R4a: O EIXO `Resposta` (formas.md:5406-5422) ----------------
   Só vale em `Quem=Você`: a fala do jogador cai na página em espera do
   Mestre, e durante os 14,3 s medidos em R1 ela é o ÚNICO sinal de que o
   turno foi enviado — "uma espera muda de catorze segundos é o jogador
   a perguntar se clicou". O FILETE (a barra sob o cabeçalho, que em toda
   `Voz` já separa uma fala da seguinte) é quem carrega a resposta:
   repouso `lineStrong` sempre — é a peça de controlo, não a tinta de
   prosa —, e em `Resposta=Espera-se` vira `amber` (a cor do Mestre,
   porque é ELE que ainda não respondeu) e respira.

   POR QUE `lineStrong` E NÃO `bordaViva`: `formas.md`/`r1-desenho.md`
   escrevem `bordaViva` — o nome que a PROPOSTA de paleta usava para "a
   borda de controlo". A paleta que de fato foi ao ar (R2, `estilo.js`)
   manteve o nome antigo para esse mesmo papel: `T.lineStrong` já É "o
   degrau que falta entre `line` e `ink` para uma borda de CONTROLE"
   (`estilo.js:75`). Ler a tabela existente em vez de inventar uma
   entrada nova chamada `bordaViva` — se o nome tiver de mudar, é o
   `desenho` quem decide, porque `T` tem quinze leitores fora daqui.

   A SAÍDA É O ACONTECIMENTO, NUNCA O RELÓGIO: quando `resposta` deixa de
   ser `"espera-se"`, a classe `tv-respira` some no mesmo render — nada
   aqui usa `setTimeout`/`setInterval`. `prefers-reduced-motion`: o pulso
   não acontece (regra em `estilo.js`, irmã de `.tv-pulse`) e a legenda
   escreve a mesma informação em texto — a mesma troca que `CampoDeBrasas`
   e `grade-de-batalha.jsx` já fazem, lida uma vez por render.

   O `matchMedia` mora DENTRO da função, não num helper de módulo (ao
   contrário de `grade-de-batalha.jsx`): um helper solto entre `Soleira`
   e `Voz` cairia dentro do RECORTE DE TEXTO que `teste-r2-pecas.mjs` faz
   de `Soleira` (do export dela até o próximo `export function`) e a
   faria parecer dona de um `matchMedia` que não é seu — achado pela
   própria suíte ao rodar esta correção. */
export function Voz({ quem = "mestre", voz = "muda", resposta, aoOuvir, glifoDeOuvir }) {
  const ROTULO_DE_QUEM = { mestre: "O Mestre", voce: "Você", mundo: "O mundo" };
  const ROTULO_DA_VOZ = { lendo: "a ler…", preparando: "a preparar…" };
  const corDoNome = quem === "mestre" ? T.amberSoft : quem === "mundo" ? T.mundoSoft : T.ink;
  /* `resposta` só é lido em Quem=Você — nas outras vozes o eixo não existe. */
  const espera = quem === "voce" && resposta === "espera-se";
  let parado = false;
  if (espera) {
    try { parado = !!(typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches); }
    catch { parado = false; }
  }
  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex items-baseline justify-between gap-2 w-full">
        <div className="flex items-baseline gap-2 min-w-0">
          <span className="tv-mono uppercase tracking-[1px] truncate" style={{ fontSize: TIPOS.rotulo, fontWeight: 600, color: corDoNome }}>
            {ROTULO_DE_QUEM[quem] || quem}
          </span>
          {ROTULO_DA_VOZ[voz] && (
            <span className="tv-mono truncate" style={{ fontSize: TIPOS.rotulo, color: T.inkDim }}>{ROTULO_DA_VOZ[voz]}</span>
          )}
          {parado && (
            <span className="tv-mono truncate" style={{ fontSize: TIPOS.rotulo, color: T.amberSoft }}>o Mestre está a tecer</span>
          )}
        </div>
        {aoOuvir && (
          <button type="button" onClick={aoOuvir} aria-label={`Ouvir ${ROTULO_DE_QUEM[quem] || quem}`}
            className="tv-anel-foco shrink-0 rounded-full flex items-center justify-center"
            style={{ width: ALVOS.piso, height: ALVOS.piso, background: "transparent", border: "none", cursor: "pointer" }}>
            {glifoDeOuvir}
          </button>
        )}
      </div>
      {/* O filete: sempre presente (separa uma voz da seguinte), sob
          `Resposta=Espera-se` acende e respira — nunca no texto, que não
          se move um pixel (formas.md:5414). */}
      <div className={`h-0.5 rounded-full w-full ${espera && !parado ? "tv-respira" : ""}`}
        style={{ background: espera ? T.amber : T.lineStrong }} aria-hidden="true" />
    </div>
  );
}

/* ============================================================
   O SELO DE PRAZO (R13) — conta o que falta, e distingue-se por FORMA

   Vive dentro do alvo do tempo, a direita da cinta. NUNCA mostra o nome
   do contrato: era o que ocupava a linha na fita antiga, e e a parte que
   o jogador ja sabe. E nunca escreve `1/4` — conta ao contrario,
   `3 noites` → `2 noites` → `esta noite`.

   A MEDICAO QUE MUDOU O DESENHO ANTES DE ELE EXISTIR. O primeiro esboco
   tinha TRES CORES. Medido pelo `desenho`: calmo x a apertar
   (`mundo` x `amber`) da 1,26:1 em visao normal e 1,12:1 em
   deuteranopia — pior do que o defeito que R9 acusou (`ok` x `amber`,
   1,37:1) e que esta etapa foi mandada nao herdar. Mediu-se antes de
   construir, e e por isso que nao foi construido assim.

   OS QUATRO CANAIS, POR ORDEM DE FORCA, e a ordem e o desenho:

     1. A AREIA desenha a fraccao que falta. Geometria pura — sobrevive
        aos tres daltonismos, ao cinzento e ao tamanho. E o PRIMARIO.
     2. A PALAVRA e o numero.
     3. A FORMA: a ultima noite ENCHE. A area muda de luminancia em
        6,37:1, e luminancia nao e cor.
     4. A COR — e e a ULTIMA leitura, nunca a primeira.

   POR QUE AS OUTRAS DUAS NAO PRECISAM DE UM CANAL FORTE: `5 noites` e
   `2 noites` nao sao estados que se distinguem de relance — sao um
   numero que se le. O unico que tem de saltar aos olhos e a ultima
   noite, e esse enche.

   NAO E UM ALVO: o alvo de 48 e o do TEMPO inteiro, que o embrulha
   (`mente/r13-mesa.md`, §2.6). Dois alvos encaixados seriam duas
   portas para a mesma sala — a mesma accao com duas caras.

   ---------------- R15: O EIXO `Conta` (Noites · Turnos) ----------------
   `A oferta` ganhou uma JANELA (§4 de `formas.md`), e a janela nao e
   texto: e esta peca. Mas a peticao do correio conta NOITES de
   calendario e uma oferta de encontro conta TURNOS — e a resposta do
   `desenho` a isso foi um EIXO e NAO um gemeo, que e a lei de sempre:
   *uma accao, uma forma.* A areia e a mesma geometria nos dois, e e ela
   o canal primario; o que muda e a palavra, e a palavra sai de
   `CONTAS`, em `gravura-da-cena.js`.

   `conta` e OPCIONAL e cai em `noites`: sem ela a peca e byte a byte a
   de ontem, e as chamadas vivas da cinta nao mudam uma letra. */
export function SeloDePrazo({ noites, quantos = 1, urgente = false, conta = "noites" }) {
  const aperto = apertoDoPrazo(noites, urgente);
  const palavra = palavraDoPrazo(noites, urgente, conta);
  const cheio = aperto.cheio;
  /* A COR SAI DA TABELA POR NOME, nunca por valor: `APERTOS` diz
     `token`, e quem o traduz em tinta e esta linha, uma vez. */
  const tinta = T[aperto.token] || T.mundo;
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-flex items-center gap-1" style={cheio ? {
        background: T.danger, color: T.onAccent, borderRadius: 4, padding: "4px 8px",
      } : { color: tinta }}>
        <IconeAmpulheta tamanho={12} cor={cheio ? T.onAccent : tinta} fracao={aperto.areia} />
        <span className="tv-mono" style={{ fontSize: TIPOS.maquina, letterSpacing: "0.02em" }}>{palavra}</span>
      </span>
      {/* `Quantos = Um e mais N`: o toque abre-os todos, e quem abre e o
          alvo do tempo. O `+N` e um NUMERO, nao um botao — dar-lhe alvo
          proprio dentro de outro alvo era a segunda porta de novo. */}
      {quantos > 1 && (
        <span className="tv-mono" style={{ fontSize: TIPOS.maquina, color: T.inkDim }}
          aria-label={`mais ${quantos - 1} prazo${quantos - 1 > 1 ? "s" : ""}`}>
          +{quantos - 1}
        </span>
      )}
    </span>
  );
}

/* ============================================================
   O SINAL DE GUARDADO (R13) — 0 px permanentes, e ainda assim se ve

   Ele vivia no cabecalho que morre, e NUM JOGO CUJO SAVE MORA SO NO
   `localStorage` E A UNICA COISA NA TELA QUE DIZ AO JOGADOR QUE A VIDA
   DELE ESTA SEGURA. Por isso nao cai, e por isso nao paga px: a fita de
   sempre custava uma linha permanente para dizer, de vez em quando, uma
   coisa que dura dois segundos.

   DUAS CAMADAS, PARA NAO DEPENDER DE UMA SO:

     1. A MARCA DA CHAPA ACENDE. O fio de 1 px do pe da cinta passa de
        `T.lineStrong` a `T.ok` e VARRE uma vez, da esquerda para a
        direita, 600 ms (`.tv-guardado-varre`). Zero px, zero
        deslocamento — e a propria borda do que guarda o seu estado a
        dizer que o guardou.
     2. `✓ guardado`, mono `TIPOS.maquina` em `T.ok`, NA FOLGA de
        `CINTA.folgaMinima`, em absoluto. Nao empurra nada e nao tapa
        tinta nenhuma — e e por isso que a posicao sai de `CINTA` e nao
        de um "centrado no pai": centrado no pai, a 375 px, ele cairia em
        cima do saldo da bolsa.

   A DEGRADACAO, ESCRITA E NAO ACIDENTAL: abaixo de 67 px de folga
   (telefone estreito, letra de sistema aumentada) o rotulo nao aparece e
   fica a varredura sozinha — a regra e da folha, `.tv-guardado-rotulo`.
   `prefers-reduced-motion`: sem varredura; o fio fica `T.ok` e
   desvanece quando `visivel` cai. E A TERCEIRA CAMADA NUNCA CAI: uma
   regiao `aria-live="polite"` fora do alcance da vista diz *guardado* a
   quem nao ve nenhuma das duas. Ela e SEPARADA do rotulo de propriamente
   — um `aria-live` com `display: none` nao anuncia nada, e a media
   query acima apaga o rotulo no telefone estreito, que e exactamente o
   aparelho onde esta linha mais importa.

   O QUE ELE PEDE A QUEM O MONTA: um pai `position: relative` — a
   cinta. Nada mais. */
export function SinalDeGuardado({ visivel }) {
  /* A CASA DO ROTULO E A FOLGA, E ELE NAO SAI DELA. Ancorado pelos DOIS
     lados — do fim da ficha ao inicio do tempo — ele nao pode pintar por
     cima de nenhum dos dois alvos, aconteca o que acontecer a largura.
     Ancorado so pela direita (a primeira versao) ele entrava 5 px no
     saldo da bolsa a 375, e so se via desenhado. */
  const daEsquerda = CINTA.enchimento + CINTA.ficha;
  const daDireita = CINTA.enchimento + CINTA.tempo;
  return (
    <>
      {/* 1 · a marca da chapa */}
      <span aria-hidden="true" className={visivel ? "tv-guardado-varre" : ""}
        style={{
          position: "absolute", left: 0, right: 0, bottom: 0, height: 1,
          background: T.ok, pointerEvents: "none", opacity: visivel ? 1 : 0,
        }} />
      {/* 2 · o rotulo, na folga */}
      <span aria-hidden="true" className="tv-mono tv-guardado-rotulo"
        style={{
          position: "absolute", left: daEsquerda, right: daDireita, top: "50%",
          transform: "translateY(-50%)", textAlign: "center", overflow: "hidden",
          fontSize: TIPOS.maquina, color: T.ok, whiteSpace: "nowrap",
          pointerEvents: "none", opacity: visivel ? 1 : 0,
        }}>
        ✓ guardado
      </span>
      {/* 3 · a camada que nunca cai */}
      <span className="sr-only" aria-live="polite">{visivel ? "guardado" : ""}</span>
    </>
  );
}

/* ============================================================
   A MARCA DA PORTA (R21) — `mente/formas.md`, "### R21 · a fabricação"
   §4. O disco que avisa "há algo aqui que você ainda não abriu", no
   canto do retrato da cinta (16×16, absoluto, a transbordar 4 px — zero
   px de leiaute, e é a única forma de caber numa cinta com 12 px de
   folga).

   O RECORTE NÃO É ENFEITE, É MEDIDA: o disco `Novo` é `amber` cheio, e
   sem um fundo sólido por baixo dele `amber` sobre o anel `amber` do
   próprio retrato mede 1,00:1 — desaparece. O recorte pinta um disco
   inteiro na cor da cinta (`T.panel`) por baixo de tudo; o disco de fora
   fica sempre `MARCA_DA_PORTA.lado − 2 × MARCA_DA_PORTA.recorte` = 12.

   O CANAL QUE NÃO É COR: `novo` é cheio e sem seta; `porta`/`aberta` são
   vazados e com seta (que desce ou sobe, conforme o estado da porta). Em
   cinzentos a leitura sobrevive — o disco claro contra o escuro.

   `aria-hidden`: o nome acessível mora na PORTA (o retrato que a
   carrega), nunca aqui — é `nomeDaPorta` (`marca-da-porta.js`) quem monta
   a frase inteira ("A ficha" / "A ficha — há novo no diário"). */
export function MarcaDaPorta({ estado = "porta" }) {
  const lado = MARCA_DA_PORTA.lado;
  const c = lado / 2;
  const r = c - MARCA_DA_PORTA.recorte;
  const novo = estado === "novo";
  const aberta = estado === "aberta";
  return (
    <svg aria-hidden="true" width={lado} height={lado} viewBox={`0 0 ${lado} ${lado}`}
      className={novo ? "tv-mudou-agora" : ""}>
      {/* o recorte: um disco cheio na cor da cinta, por baixo de tudo — o
          que garante contraste seja qual for o anel do retrato por trás */}
      <circle cx={c} cy={c} r={c} fill={T.panel} />
      {novo ? (
        <circle cx={c} cy={c} r={r} fill={T.amber} />
      ) : (
        <>
          <circle cx={c} cy={c} r={r} fill={T.panelSoft} stroke={T.lineStrong} strokeWidth="1" />
          {/* a seta: desce quando a porta está fechada (há o que abrir),
              sobe quando já está aberta (há o que fechar) */}
          <polyline
            points={aberta ? "5.5,9.5 8,7 10.5,9.5" : "5.5,6.5 8,9 10.5,6.5"}
            fill="none" stroke={T.inkDim} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
    </svg>
  );
}

/* ============================================================
   A ESCOLHA, *Forma=Aba com glifo* (R21) — `mente/formas.md`,
   "### R21 · a fabricação" §3 (Figma `20:77`, variantes `212:5412` ·
   `212:5419` · `212:5427`).

   NÃO É UMA ABA NOVA: é `A escolha` (`formas.md`, "navegar entre abas"),
   que já tinha forma e nunca ganhou código — o trilho de hoje
   (`TrilhoAbas`, em `App.jsx`) é escrito à mão. Isto dá à peça que já
   existe a composição com glifo que a fita do alforje e o trilho da mesa
   desenham; a aba no alforje e a aba no trilho são a MESMA peça em duas
   composições — não duas verdades sobre "o que é uma aba".

   56 de alto (`ALVOS.chamado`), glifo 24 em cima, rótulo mono Bold 12 —
   o PISO da casa (`TIPOS.piso`), não os 9px que `TrilhoAbas` escreve
   hoje (dívida da mesa; a coluna larga converte-se numa etapa própria).

   SEM O `✓` NA ESCOLHIDA — só nesta composição, nas outras Formas da
   peça o `✓` fica. Medido: seis rótulos com o `✓` pedem 366px contra 351
   úteis a 375; sem ele, 315. O canal que não é cor passa a ser o aro +
   o filete de baixo (forma presente contra ausente — WCAG 1.4.1).

   LARGURA PELO CONTEÚDO, NÃO IGUAIS: `flex: 1 1 0; min-width:
   max-content` — cada aba pede só o que o rótulo precisa; a maior
   (`ASCENSÃO`, 61px medidos) não estica as outras.

   `soGlifo` esconde o rótulo — a degradação abaixo de
   `ALFORJE.larguraParaSeisRotulos` com seis abas na tela — e o nome não
   some: vai para o `aria-label`. QUEM DECIDE O LIMIAR é quem monta a
   fita (pode ser CSS, uma media query, sem medir); esta peça só sabe
   desenhar as duas formas. */
export function AbaComGlifo({ id, rotulo, Glifo, escolhida, novo, contador, soGlifo, onClick, ...aria }) {
  const cor = escolhida ? T.amberSoft : T.inkDim;
  return (
    <button
      id={id}
      type="button"
      onClick={onClick}
      role="tab"
      aria-selected={!!escolhida}
      aria-label={soGlifo ? rotulo : undefined}
      className="relative flex flex-col items-center justify-center gap-1"
      style={{
        flex: "1 1 0", minWidth: "max-content", height: ALVOS.chamado,
        padding: "0 4px",
        background: escolhida ? T.panelSoft : "transparent",
        borderBottom: `3px solid ${escolhida ? T.amber : "transparent"}`,
        color: cor,
      }}
      {...aria}>
      <span style={{ position: "relative", display: "inline-flex" }}>
        {Glifo ? <Glifo tamanho={24} cor={cor} /> : null}
        {novo && (
          <span style={{ position: "absolute", top: -6, right: -8 }}>
            <MarcaDaPorta estado="novo" />
          </span>
        )}
      </span>
      {!soGlifo && (
        <span className="tv-mono uppercase tracking-wide"
          style={{ fontSize: TIPOS.piso, fontWeight: 700, lineHeight: 1, whiteSpace: "nowrap" }}>
          {rotulo}
        </span>
      )}
      {/* o contador `nGrupo` da aba Gestão — `Selo`, *Tom=Neutro*: é uma
          CONTAGEM, não uma novidade, e por isso nunca sobe à marca */}
      {contador > 0 && (
        <span className="tv-mono rounded-full px-1"
          style={{
            position: "absolute", top: 2, right: 2, fontSize: TIPOS.piso, lineHeight: 1.4,
            background: T.violet, color: T.onSecond,
          }}>
          {contador}
        </span>
      )}
    </button>
  );
}
