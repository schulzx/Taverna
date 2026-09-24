/* ============================================================
   O ROSTO DA CENA (R13, etapa B) — a xilogravura do lugar

   96 px no topo do papel, dentro da página, fixa. É o topo do papel, não
   um acontecimento: aparece sempre, e muda só quando o lugar muda.

   POR QUE ELA EXISTE, com o número do `jogo` (`mente/r13-mesa.md`): das
   21 mensagens de prosa de R6, **10 abrem com descrição de lugar, hora
   ou clima**, média de 14,3 palavras — 37 % das 38 palavras que o
   telefone mostrava. E as 10 são quase todas CHEGADAS A UM LUGAR NOVO: a
   faixa devolve a frase de abertura exactamente nos turnos em que o
   jogador está mais perdido.

   A CONTA NÃO MORA AQUI. `gravura-da-cena.js` decide a gramática, a
   hachura, a luz e todos os pontos, a partir de `hashSemente` + `rng` +
   `escolher` de `semente.js` — as mesmas três funções puras do
   `rosto.jsx`. Aqui só se pinta. É a lei da casa: conta se prova, tela
   se olha.

   AS TRÊS BANDAS (`formas.md`): o céu 0–62 (gradiente da luz + o astro +
   hachura que adensa para o horizonte) · o horizonte ~40–62 (a silhueta
   do bioma, uma massa de tinta, sem meio-tom) · o chão 62–96 (a cor da
   luz + hachura diagonal + a linha do chão).

   NÃO ANIMA, e é decisão dos dois: uma imagem que transiciona a cada
   cena é UM PISCAR POR TURNO, e nunca pode custar o turno. A chegada a
   um lugar novo marca-se no NOME, pelo eixo `Chegada` que `A oferta` já
   tem — decai por turno, nunca por relógio. Zero movimento novo.

   A ESCALA, e é a única decisão de desenho deste arquivo: a SILHUETA
   vive em 0..100 e é esticada para a largura real (o horizonte de uma
   cena larga é o mesmo horizonte, mais largo); a HACHURA vive em px e
   NÃO se estica. É o que um prelo faz — a chapa cresce, o buril não. Com
   as duas esticadas, os talhos deitavam-se e a gravura lia-se
   esborratada; com as duas em px, o horizonte mudava de forma ao mudar
   de ecrã, e a mesma semente deixava de dar a mesma cripta.
   ============================================================ */
import React from "react";
import { T, TIPOS, LUZ_DA_CENA } from "./estilo.js";
import { gravuraDaCena, BANDAS, LARGURA_DE_REFERENCIA } from "./gravura-da-cena.js";

/* A tinta é UMA — `LUZ_DA_CENA.tinta`. Três tons de linha e uma
   xilogravura vira desenho digital, que é a lição que `rosto.jsx` já
   tinha escrito e que esta peça herda. */

/* A HACHURA, e ela é a mesma peça em todas as bandas: um `path` com
   todos os talhos de uma vez. Um `<path>` por linha seriam ~200 nós no
   DOM por cena; um só é um nó. `vector-effect` mantém o traço com a
   mesma espessura quando a faixa estica — sem ele, um ecrã largo
   engrossaria os talhos do céu e afinaria os do chão. */
function Talhos({ linhas, largura, opacidade, tinta }) {
  if (!linhas || !linhas.length) return null;
  return (
    <path className="tv-gravura-tinta" d={linhas.join(" ")} stroke={tinta} strokeWidth={largura}
      fill="none" opacity={opacidade} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
  );
}

/* A legenda mora na banda do chão e é HTML, não SVG, por uma razão só:
   TRUNCAR. `text-overflow: ellipsis` é a única reticência que conhece a
   largura real da caixa — em SVG teríamos de medir o texto à mão e
   adivinhar a fonte. E a regra da degradação é escrita: a legenda trunca
   o LUGAR e NUNCA a hora. */
function Legenda({ lugar, palavraDaHora }) {
  return (
    <div className="absolute flex items-baseline gap-2 pointer-events-none"
      style={{ left: 12, right: 12, top: BANDAS.legenda - 12 }}>
      <span className="tv-body truncate" style={{ fontSize: TIPOS.corpo, fontWeight: 500, color: T.ink, minWidth: 0 }}>
        {lugar}
      </span>
      <span className="tv-mono shrink-0 uppercase" style={{ fontSize: TIPOS.maquina, color: T.mundo, letterSpacing: "0.06em" }}>
        {palavraDaHora}
      </span>
    </div>
  );
}

export function RostoDaCena({ semente = "", bioma = "", lugar = "", hora = 12, largura = LARGURA_DE_REFERENCIA }) {
  const w = Math.max(80, Math.min(2000, Number.isFinite(largura) ? Math.round(largura) : LARGURA_DE_REFERENCIA));
  /* O DESENHO É MEMOIZADO PELOS CINCO EIXOS QUE O DECIDEM. Sem isto a
     gravura inteira — ~200 talhos — é recalculada a cada render do App,
     e o App re-renderiza a cada tecla do campo do turno. A memória é o
     que faz "não anima" ser verdade também no custo, e não só na tela. */
  const g = React.useMemo(
    () => gravuraDaCena({ semente, bioma, lugar, hora, largura: w }),
    [semente, bioma, lugar, hora, w],
  );
  const luz = LUZ_DA_CENA[g.luz] || LUZ_DA_CENA.dia;
  const tinta = LUZ_DA_CENA.tinta;
  /* A GRAVURA DE LINHA BRANCA — e é por isto que são DUAS tintas e não
     uma. A primeira versão desta peça pintava as quatro coisas com
     `tinta`, e medida deu 1,08:1 entre o talho e o chão da noite: o
     buril não existia. O `desenho` foi ver se havia um chão que
     servisse aos dois e provou que NÃO HÁ — a legenda em AAA pede um
     chão com L ≤ 0,0775 e uma hachura escura a 3:1 pede L ≥ 0,1108, e
     nenhum número está nos dois lados. O defeito nunca foram os
     valores: era haver UMA tinta.

     A saída é a de Thomas Bewick e tem duzentos anos: no bloco escuro o
     buril TIRA matéria, e a linha sai BRANCA. Acima do horizonte ele
     escurece (o céu é claro, a silhueta e o talho do céu são `tinta`);
     abaixo dele clareia (o chão é escuro, o talho é `luz.talho`).

     O `|| tinta` é a degradação, e é de propósito: uma luz futura que
     nasça sem `talho` desenha um chão pobre em vez de um chão sem
     chão — `undefined` num `stroke` apaga a hachura inteira, calada. */
  const talho = luz.talho || tinta;
  const id = React.useId();
  const alto = BANDAS.altura;
  const [ceuDe, ceuAte] = BANDAS.ceu;
  const [chaoDe] = BANDAS.chao;
  /* o astro: alto ou baixo é a receita da luz, nunca o sorteio */
  const astroY = luz.astroAlto ? 16 : BANDAS.horizonte - 10;

  return (
    <div className="relative overflow-hidden w-full" style={{ height: alto, background: luz.chao }}
      role="img" aria-label={`${lugar || "lugar desconhecido"}, ${g.luz}`}>
      <svg width="100%" height={alto} viewBox={`0 0 ${w} ${alto}`} preserveAspectRatio="none"
        aria-hidden="true" style={{ display: "block" }}>
        <defs>
          <linearGradient id={`${id}-ceu`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={luz.ceuAlto} />
            <stop offset="100%" stopColor={luz.ceuBaixo} />
          </linearGradient>
        </defs>

        {/* A BANDA DO CÉU e a BANDA DO CHÃO são só cor: em `forced-colors`
            desaparecem por regra da folha (`.tv-gravura-fundo`) e sobra o
            desenho sobre o fundo do sistema, que é a degradação escrita. */}
        <rect className="tv-gravura-fundo" x="0" y={ceuDe} width={w} height={ceuAte} fill={`url(#${id}-ceu)`} />
        <rect className="tv-gravura-fundo" x="0" y={chaoDe} width={w} height={alto - chaoDe} fill={luz.chao} />
        <circle className="tv-gravura-fundo" cx={g.astro.x} cy={astroY} r={g.astro.raio}
          fill={luz.astro} opacity={luz.astroAlfa} />

        <Talhos linhas={g.d.ceu} largura={0.7} opacidade={0.45} tinta={tinta} />

        {/* A SILHUETA — uma massa de tinta, sem meio-tom. Vive em 0..100 e
            é a única coisa que a largura estica. */}
        <g transform={`scale(${g.escala} 1)`}>
          <path className="tv-gravura-tinta" d={g.d.silhueta} fill={tinta} fillRule="evenodd" />
        </g>

        {/* O CHÃO É LINHA BRANCA, e a opacidade é MEDIDA, não escolhida:
            o talho composto sobre o chão dá 2,27:1 a 0,50 (reprova o
            piso de 3), 3,55 a 0,75 e 4,19 a 0,85. Uma hachura a meia
            opacidade é uma hachura que só se vê em duas das quatro
            luzes — e as duas em que não se via eram a noite e a
            madrugada, que é metade do jogo. */}
        <Talhos linhas={g.d.chao} largura={0.75} opacidade={0.85} tinta={talho} />
        <path className="tv-gravura-tinta" d={g.linhaDoChao} stroke={talho} strokeWidth="1.1"
          fill="none" vectorEffect="non-scaling-stroke" />

        {/* A MARCA DA CHAPA — 1 px de `T.inkMeio` em cima e em baixo, e o
            token não foi escolhido: foi o único dos quatro candidatos que
            sobreviveu à medição (`formas.md`, R13). `paginaFio` dá 1,67:1
            dentro da faixa, `lineStrong` 2,10 e a própria tinta 1,08;
            `inkMeio` dá 4,78. É o que um prelo deixa no papel. */}
        <path className="tv-gravura-tinta" d={`M 0 0.5 L ${w} 0.5 M 0 ${alto - 0.5} L ${w} ${alto - 0.5}`}
          stroke={T.inkMeio} strokeWidth="1" fill="none" vectorEffect="non-scaling-stroke" />
      </svg>

      <Legenda lugar={lugar || "—"} palavraDaHora={g.luz} />
    </div>
  );
}
