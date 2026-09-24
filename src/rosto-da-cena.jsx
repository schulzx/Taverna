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
function Talhos({ linhas, largura, opacidade, tinta, recorte }) {
  if (!linhas || !linhas.length) return null;
  return (
    <path className="tv-gravura-tinta" d={linhas.join(" ")} stroke={tinta} strokeWidth={largura}
      fill="none" opacity={opacidade} strokeLinecap="round" vectorEffect="non-scaling-stroke"
      clipPath={recorte} />
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
     buril TIRA matéria, e a linha sai BRANCA.

     R15 — E A LEI DE R13 ESTAVA ERRADA, NÃO O VALOR. Ela dizia que
     acima do horizonte o buril escurece, *porque o céu é a fonte de
     luz*. Isso é verdade DO HORIZONTE, não do céu: o céu desta peça é
     um gradiente, e o alto dele é escuro nas quatro luzes (L do
     `ceuAlto`: noite 0,0070 · madrugada 0,0153 · entardecer 0,0413 ·
     dia 0,0610, contra 0,0036 da `tinta`). Ao alto da noite o buril e o
     campo estavam a **1,03:1 um do outro antes de qualquer alfa** — e
     nenhum alfa salva uma diferença que não existe. A lei nova é mais
     curta:

         A MARCA É O CONTRÁRIO DO CAMPO QUE A RECEBE.
         Campo claro, o buril põe tinta. Campo escuro, o buril tira-a.

     Os dois campos são escuros, logo os dois buris clareiam: `talho`
     abaixo do horizonte, `talhoDoCeu` acima. A SILHUETA não é marca —
     é MASSA — e continua `tinta`, uma, nas quatro luzes. A textura do
     céu no pior ponto das quatro passa de 1,09 (27 % abaixo do piso)
     para 2,14 (43 % acima), e a hachura deixa de APAGAR 16–19 % da
     profundidade que o gradiente declara para lhe acrescentar 12–29 %.

     O ALFA É UM E VEM DA TABELA. Vivia solto aqui — 0,85 no chão, 0,45
     no céu — e é um número de que os pisos dependem, logo é tabela.
     Sobe para 0,85 nos dois pela razão e não pela afinação: *um corte
     de buril não é translúcido, é o papel.* Os 0,45 eram herança do
     tempo da tinta escura, onde o alfa não fazia diferença nenhuma.

     O `|| tinta` é a degradação, e é de propósito: uma luz futura que
     nasça sem `talho` desenha um chão pobre em vez de um chão sem
     chão — `undefined` num `stroke` apaga a hachura inteira, calada. */
  const talho = luz.talho || tinta;            /* o buril ABAIXO do horizonte */
  const talhoCeu = luz.talhoDoCeu || tinta;    /* o buril ACIMA dele (R15) */
  const alfa = LUZ_DA_CENA.alfaDoTalho;        /* um alfa, dois buris */
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
          {/* O TALHO PARA NA BORDA DO ASTRO (R15) — e é a dívida que o
              `desenho` declarou e não inventou, porque é forma: *o
              segundo canal do astro é ser o único SÓLIDO num campo
              talhado, e um disco atravessado por talhos não é um
              sólido, é mais campo.*

              É um RECORTE e não uma máscara: uma máscara pinta a sua
              própria tinta (branco e preto) e este arquivo não tem
              direito a um literal de cor — `clip-rule="evenodd"` faz o
              buraco com a geometria que já existe, sem uma cor nova e
              num nó só. O disco é o do `g.astro`, com o raio dele: não
              há número novo aqui, há o mesmo número lido duas vezes.

              O QUE ISTO COMPRA, MEDIDO E NÃO PROMETIDO, porque a dívida
              era menor do que parecia: dentro do disco, o talho media
              **1,08:1** contra o próprio disco — as duas marcas claras
              quase se confundiam, e o disco já era quase sólido. O
              recorte leva esse 1,08 a **1,00 exacto**, e o disco contra
              o campo talhado do entardecer sobe de 2,50 para **2,54**.
              O ganho grande é OUTRO e é de acessibilidade: em
              `forced-colors` o astro é `tv-gravura-fundo` e DESAPARECE —
              com o recorte ele passa a existir como um disco vazio no
              meio da hachura, que é uma forma onde antes não havia
              nada. */}
          <clipPath id={`${id}-semOAstro`} clipPathUnits="userSpaceOnUse">
            <path clipRule="evenodd" d={`M 0 0 H ${w} V ${alto} H 0 Z `
              + `M ${g.astro.x - g.astro.raio} ${astroY} `
              + `a ${g.astro.raio} ${g.astro.raio} 0 1 0 ${g.astro.raio * 2} 0 `
              + `a ${g.astro.raio} ${g.astro.raio} 0 1 0 ${-g.astro.raio * 2} 0 Z`} />
          </clipPath>
        </defs>

        {/* A BANDA DO CÉU e a BANDA DO CHÃO são só cor: em `forced-colors`
            desaparecem por regra da folha (`.tv-gravura-fundo`) e sobra o
            desenho sobre o fundo do sistema, que é a degradação escrita. */}
        <rect className="tv-gravura-fundo" x="0" y={ceuDe} width={w} height={ceuAte} fill={`url(#${id}-ceu)`} />
        <rect className="tv-gravura-fundo" x="0" y={chaoDe} width={w} height={alto - chaoDe} fill={luz.chao} />
        {/* O ASTRO SAI DO TOPO DA TABELA, não da receita da luz (R15):
            `T.danger` era mais escuro que o céu que ele devia acender —
            no entardecer nenhum alfa chegava a 2,0, e a 1,0 opaco dava
            1,77. Varridos os 24 tokens de `T`, `T.ink` é o ÚNICO que
            passa 3:1 nas quatro luzes, e é o que devia ser desde o
            princípio: *o astro é o sítio onde o bloco é cortado até ao
            papel*, e `ink` é o papel desta casa. 1,42 → 3,41 na pior.
            A hora continua a colori-lo — através dos 15 % de céu que
            lhe atravessam o disco, não através de um valor por modo.
            `astroAlto` fica por luz: posição é luz, opacidade era
            afinação. */}
        <circle className="tv-gravura-fundo" cx={g.astro.x} cy={astroY} r={g.astro.raio}
          fill={LUZ_DA_CENA.astro} opacity={LUZ_DA_CENA.astroAlfa} />

        <Talhos linhas={g.d.ceu} largura={0.7} opacidade={alfa} tinta={talhoCeu}
          recorte={`url(#${id}-semOAstro)`} />

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
            madrugada, que é metade do jogo. O NÚMERO É O MESMO; o que
            mudou (R15) é onde ele mora: `LUZ_DA_CENA.alfaDoTalho`, para
            a suíte o poder ler de volta. */}
        <Talhos linhas={g.d.chao} largura={0.75} opacidade={alfa} tinta={talho} />
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
