/* ============================================================
   O ROSTO (v9.158) — a xilogravura — Taverna

   O rosto antigo era um desenho animado: elipses chapadas, olhos
   arregalados de brinquedo, cinco penteados de massinha. Dentro de uma
   moldura de tarô séria, num jogo âmbar-sobre-violeta que se leva a
   sério, ele era o único elemento que pedia desculpas.

   O novo é XILOGRAVURA: traço de tinta com peso, hachura no lugar de
   sombra, preenchimento mudo. É o estilo das cartas de tarô de verdade
   — e é o único estilo de retrato que fica MELHOR em SVG do que em
   qualquer imagem gerada, porque xilogravura É linha.

   ---------------- OS QUATRO EIXOS ----------------

   SEMENTE   queixo, cabelo, marca — o que faz cada pessoa uma pessoa
   SEXO      a geometria: maxilar, pescoço, ombro, cílio, barba
   CLASSE    o traje: o retrato de um mago tem de DIZER mago à distância
   SUBCLASSE uma cor de acento, num detalhe só — a pena, a gema, a faixa

   Os três últimos moram na FICHA (`ente`), não no sorteio. Um retrato
   que sorteia a classe de quem já escolheu classe está mentindo sobre a
   única coisa que o jogador decidiu.

   ---------------- O QUE NÃO MUDOU ----------------

   O quadro: sempre 64×64 com o rosto em (32,30) — quem quiser outro
   tamanho embrulha num <g transform>. E o estado: normal | ferido |
   grave | furioso, por cima, sem tocar nos traços de base. Os dois
   leitores (a bolinha do grupo e a carta de tarô) continuam pedindo a
   mesma peça, e é por isso que ninguém tem dois rostos.
   ============================================================ */
import React from "react";
import { tracos, feicoes, acentoDe } from "./semente.js";

/* A tinta é UMA: o mesmo quase-preto violeta da casa em todo traço.
   Xilogravura com três tons de linha vira desenho digital na hora. */
const TINTA = "#120E1A";
const PANO = "#241D33";
const PANO_FUNDO = "#1B1528";

/* O contexto da apresentação: a escolha é do MUNDO (feita uma vez, na
   criação), e os retratos são desenhados em dezenas de lugares. Passar a
   escolha de mão em mão por sete painéis é como uma regra deixa de valer
   num dos caminhos — alguém desenha o oitavo retrato e esquece. */
export const AjusteDoRetrato = React.createContext({ apresentacao: "estrita" });

/* ---------------- as peças ---------------- */

function Olho({ ex, ey, dir, olhos, fem, furioso, grave }) {
  /* olho de gravura: pálpebra grossa em cima, íris pequena, linha fraca
     embaixo. O olho arregalado de bolinha branca era o coração do
     desenho animado antigo. */
  const queda = furioso ? 0.8 : grave ? 0.5 : 0;
  return (
    <g>
      <path d={`M ${ex - dir * 2.8} ${ey + 0.4} Q ${ex} ${ey - 2 + queda * 1.4} ${ex + dir * 2.8} ${ey - 0.3 + queda}`}
        stroke={TINTA} strokeWidth="1.25" fill="none" strokeLinecap="round" />
      <circle cx={ex} cy={ey + 0.1} r="1.3" fill={olhos} />
      <circle cx={ex} cy={ey + 0.1} r="0.55" fill={TINTA} />
      <path d={`M ${ex - dir * 2.2} ${ey + 1.4} Q ${ex} ${ey + 2.1} ${ex + dir * 2.2} ${ey + 1.2}`}
        stroke={TINTA} strokeWidth="0.5" fill="none" opacity="0.55" />
      {fem && <path d={`M ${ex + dir * 2.8} ${ey - 0.4} l ${dir * 1.3} -1`} stroke={TINTA} strokeWidth="0.85" strokeLinecap="round" />}
    </g>
  );
}

/* hachura: o jeito de a gravura dizer "sombra" sem pintar nada */
function Hachura({ linhas, opacity = 0.5, w = 0.65 }) {
  return <path d={linhas.join(" ")} stroke={TINTA} strokeWidth={w} fill="none" opacity={opacity} strokeLinecap="round" />;
}

/* ---------------- o cabelo, por apresentação ----------------
   Quatro estilos por apresentação. `atras` desenha antes da cabeça (a
   massa), `frente` depois (a moldura do rosto). */
function cabeloMasc(i, g, cor) {
  const { hw } = g;
  const contorno = { fill: cor, stroke: TINTA, strokeWidth: 1 };
  const domo = `M ${32 - hw - 0.6} 28 C ${32 - hw - 1.4} 14.6 ${32 + hw + 1.4} 14.6 ${32 + hw + 0.6} 28 L ${32 + hw - 0.8} 27`;
  if (i === 0) return { // corte curto
    frente: <path d={`${domo} C ${32 + hw - 1} 19.8 ${32 - hw + 1} 19.8 ${32 - hw + 0.8} 27 Z`} {...contorno} />,
  };
  if (i === 1) return { // penteado para trás
    frente: (<g>
      <path d={`${domo} C ${32 + hw - 2} 18.5 ${32 - hw + 4} 17.5 ${32 - hw + 0.8} 25 Z`} {...contorno} />
      <Hachura linhas={[`M ${32 - 4} 17.5 q 3 -1 7 0`, `M ${32 - 7} 19 q 4 -1.6 9 -0.6`]} w={0.55} />
    </g>),
  };
  if (i === 2) return { // raspado
    frente: <Hachura linhas={[`M ${32 - 7} 19.5 l 2 -1`, `M ${32 - 3} 18.4 l 2 -0.8`, `M ${32 + 1.5} 18.2 l 2 -0.4`, `M ${32 + 5.5} 19 l 2 0.2`]} opacity={0.45} />,
  };
  return { // juba até o ombro
    atras: <path d={`M ${32 - hw - 3} 24 C ${32 - hw - 5} 40 ${32 - hw - 4} 47 ${32 - hw - 6} 51 L ${32 + hw + 6} 51 C ${32 + hw + 4} 47 ${32 + hw + 5} 40 ${32 + hw + 3} 24 C ${32 + hw - 2} 13 ${32 - hw + 2} 13 ${32 - hw - 3} 24 Z`} fill={cor} stroke={TINTA} strokeWidth="1" />,
    frente: (<g>
      <path d={`${domo} C ${32 + hw - 2} 18.5 ${32 - hw + 4} 17.5 ${32 - hw + 0.8} 25 Z`} fill={cor} stroke={TINTA} strokeWidth="1" />
      <Hachura linhas={[`M ${32 - hw - 4} 34 q -1 8 0.5 14`, `M ${32 + hw + 4} 34 q 1 8 -0.5 14`]} w={0.6} />
    </g>),
  };
}

function cabeloFem(i, g, cor) {
  const { hw } = g;
  const contorno = { fill: cor, stroke: TINTA, strokeWidth: 1 };
  const domo = `M ${32 - hw - 0.6} 28 C ${32 - hw - 1.4} 14.6 ${32 + hw + 1.4} 14.6 ${32 + hw + 0.6} 28 L ${32 + hw - 0.8} 26`;
  const capa = <path d={`${domo} C ${32 + hw - 2} 19 ${32 - hw + 2} 19 ${32 - hw + 0.8} 26 Z`} {...contorno} />;
  if (i === 0) return { // solto, longo
    atras: <path d={`M ${32 - hw - 3.5} 24 C ${32 - hw - 6} 42 ${32 - hw - 4} 50 ${32 - hw - 5.5} 56 L ${32 + hw + 5.5} 56 C ${32 + hw + 4} 50 ${32 + hw + 6} 42 ${32 + hw + 3.5} 24 C ${32 + hw - 2} 12.5 ${32 - hw + 2} 12.5 ${32 - hw - 3.5} 24 Z`} fill={cor} stroke={TINTA} strokeWidth="1" />,
    frente: (<g>
      {capa}
      <path d={`M ${32 - hw - 1.5} 24 C ${32 - hw - 3} 33 ${32 - hw - 2} 39 ${32 - hw - 3} 45 L ${32 - hw + 1.5} 44 C ${32 - hw + 0.5} 37 ${32 - hw + 0.5} 30 ${32 - hw + 0.8} 26 Z`} {...contorno} />
      <path d={`M ${32 + hw + 1.5} 24 C ${32 + hw + 3} 33 ${32 + hw + 2} 39 ${32 + hw + 3} 45 L ${32 + hw - 1.5} 44 C ${32 + hw - 0.5} 37 ${32 + hw - 0.5} 30 ${32 + hw - 0.8} 26 Z`} {...contorno} />
    </g>),
  };
  if (i === 1) return { // trança lateral
    atras: <path d={`M ${32 - hw - 2.5} 24 C ${32 - hw - 4} 34 ${32 - hw - 3} 38 ${32 - hw - 3} 41 L ${32 + hw + 3} 41 C ${32 + hw + 3} 38 ${32 + hw + 4} 34 ${32 + hw + 2.5} 24 C ${32 + hw - 2} 13.5 ${32 - hw + 2} 13.5 ${32 - hw - 2.5} 24 Z`} fill={cor} stroke={TINTA} strokeWidth="1" />,
    frente: (<g>
      {capa}
      {[0, 1, 2, 3].map((k) => (
        <ellipse key={k} cx={32 + hw + 1.5 - k * 0.4} cy={40 + k * 4.6} rx="2.6" ry="2.8" fill={cor} stroke={TINTA} strokeWidth="0.9" />
      ))}
    </g>),
  };
  if (i === 2) return { // chanel, na altura do queixo
    atras: <path d={`M ${32 - hw - 4} 26 C ${32 - hw - 6} 36 ${32 - hw - 5} 41 ${32 - hw - 2} 43.5 L ${32 + hw + 2} 43.5 C ${32 + hw + 5} 41 ${32 + hw + 6} 36 ${32 + hw + 4} 26 C ${32 + hw - 2} 13 ${32 - hw + 2} 13 ${32 - hw - 4} 26 Z`} fill={cor} stroke={TINTA} strokeWidth="1" />,
    frente: capa,
  };
  return { // coque
    atras: <circle cx={32} cy={15.2} r="4" fill={cor} stroke={TINTA} strokeWidth="1" />,
    frente: (<g>
      {capa}
      <path d={`M ${32 + hw - 1} 26 q 2.5 4 1.5 9`} stroke={TINTA} strokeWidth="0.6" fill="none" opacity="0.7" />
    </g>),
  };
}

/* ---------------- o traje, por classe ----------------
   Cada classe é UM gesto reconhecível a 44 pixels: o chapéu do mago, o
   capuz do ladino, os óculos do engenheiro. O acento da subclasse entra
   num detalhe só de cada traje — a faixa, a pena, a gema. Classe fora
   da tabela veste o colarinho simples de qualquer pessoa do mundo. */
const TRAJES = {
  Guerreiro: (g, ac) => (<g>
    <path d={`M ${32 - g.sw - 2.5} 68 L ${32 - g.sw - 3.5} 54 L ${32 - 9} 49.5 L ${32 - 6} 53 L ${32 - 7} 68 Z`} fill="#3A3450" stroke={TINTA} strokeWidth="1" />
    <path d={`M ${32 + g.sw + 2.5} 68 L ${32 + g.sw + 3.5} 54 L ${32 + 9} 49.5 L ${32 + 6} 53 L ${32 + 7} 68 Z`} fill="#3A3450" stroke={TINTA} strokeWidth="1" />
    <circle cx={32 - g.sw + 1.5} cy={55} r="1.1" fill={ac} />
    <circle cx={32 + g.sw - 1.5} cy={55} r="1.1" fill={ac} />
    <path d={`M ${32 - 7} 52.5 Q 32 56.5 ${32 + 7} 52.5 L ${32 + 6} 57 Q 32 60 ${32 - 6} 57 Z`} fill="#4A4462" stroke={TINTA} strokeWidth="0.9" />
  </g>),
  Mago: (g, ac) => (<g>
    {/* o cone nasce DENTRO da aba e sobe torto — chapéu de mago reto é
       chapéu de festa. A faixa fica na base do cone, curta: atravessada
       na testa ela virava um visor. */}
    <path d={`M ${32 - g.hw + 1} 19 C ${32 - 4} 3.5 ${36} 2 ${38.5} 3.5 C ${33.5} 6 ${36} 12 ${32 + g.hw - 0.5} 18.6 Z`} fill={PANO} stroke={TINTA} strokeWidth="1.1" />
    <ellipse cx={32} cy={19.6} rx={g.hw + 4.5} ry="2.7" fill={PANO} stroke={TINTA} strokeWidth="1.1" />
    <path d={`M ${32 - 6.5} 16.6 Q 32 18.4 ${32 + 6} 16.2`} stroke={ac} strokeWidth="1.7" fill="none" />
  </g>),
  Ladino: (g, ac) => (<g>
    <path fillRule="evenodd" d={`M ${32 - 18} 68 C ${32 - 19} 38 ${32 - 14} 20.5 32 19 C ${32 + 14} 20.5 ${32 + 19} 38 ${32 + 18} 68 L ${32 + 10.5} 68 C ${32 + 12.5} 41 ${32 + 9.5} 25.5 32 24.5 C ${32 - 9.5} 25.5 ${32 - 12.5} 41 ${32 - 10.5} 68 Z`} fill={PANO_FUNDO} stroke={TINTA} strokeWidth="1" />
    <circle cx={32} cy={52} r="1.4" fill={ac} />
  </g>),
  "Clérigo": (g, ac) => (<g>
    <path d={`M ${32 - g.hw - 0.8} 30 C ${32 - g.hw - 2} 15.5 ${32 + g.hw + 2} 15.5 ${32 + g.hw + 0.8} 30 L ${32 + g.hw - 1.5} 41 L ${32 + g.hw - 3.5} 41 L ${32 + g.hw - 1.6} 28 C ${32 + g.hw - 3} 20 ${32 - g.hw + 3} 20 ${32 - g.hw + 1.6} 28 L ${32 - g.hw + 3.5} 41 L ${32 - g.hw + 1.5} 41 Z`} fill={PANO} stroke={TINTA} strokeWidth="1" />
    <circle cx={32} cy={56} r="2.4" fill="none" stroke={ac} strokeWidth="1.1" />
    <path d={`M 32 54.2 V 57.8 M 30.2 56 H 33.8`} stroke={ac} strokeWidth="0.9" />
  </g>),
  "Caçador": (g, ac) => (<g>
    <path d={`M ${32 - g.sw} 68 C ${32 - g.sw - 1} 50 ${32 - 8} 44.5 32 44.5 C ${32 + 8} 44.5 ${32 + g.sw + 1} 50 ${32 + g.sw} 64`} fill="none" stroke={TINTA} strokeWidth="1.1" />
    <path d={`M ${32 - g.sw + 2} 68 L ${32 + 8} 50`} stroke={TINTA} strokeWidth="1.4" />
    <path d={`M ${32 + g.sw - 4} 53 C ${32 + g.sw + 1} 46 ${32 + g.sw + 1} 41 ${32 + g.sw - 2} 37.5 C ${32 + g.sw - 6} 41 ${32 + g.sw - 7} 47 ${32 + g.sw - 7} 52 Z`} fill={ac} stroke={TINTA} strokeWidth="0.8" />
    <path d={`M ${32 + g.sw - 4.5} 51 C ${32 + g.sw - 3.5} 46 ${32 + g.sw - 3.5} 43 ${32 + g.sw - 2.5} 39.5`} stroke={TINTA} strokeWidth="0.7" fill="none" opacity="0.7" />
  </g>),
  Bardo: (g, ac) => (<g>
    <path d={`M ${32 - g.hw - 3} 22 C ${32 - g.hw - 2} 15 ${32 + g.hw - 2} 12.5 ${32 + g.hw + 3.5} 17.5 C ${32 + g.hw + 5.5} 20 ${32 + g.hw + 2} 22 ${32 + g.hw - 1} 21.5 C ${32} 19.5 ${32 - g.hw + 2} 20 ${32 - g.hw - 3} 22 Z`} fill={PANO} stroke={TINTA} strokeWidth="1" />
    <path d={`M ${32 + g.hw + 2} 17 q 4 -6 3 -11 q -4.5 4.5 -5.5 10`} fill={ac} stroke={TINTA} strokeWidth="0.7" />
  </g>),
  Monge: (g, ac) => (<g>
    {/* faixa FINA com as pontas soltas do nó: larga demais ela virava véu
       de freira em quem tem cabelo comprido */}
    <path d={`M ${32 - g.hw - 0.4} 23.4 L ${32 + g.hw + 0.4} 23.4 L ${32 + g.hw + 0.2} 25.1 L ${32 - g.hw - 0.2} 25.1 Z`} fill={ac} stroke={TINTA} strokeWidth="0.7" />
    <path d={`M ${32 + g.hw + 0.3} 24.2 q 3 1.5 3.5 4.5 M ${32 + g.hw + 0.3} 24.4 q 1.8 2.5 1.2 5.5`} stroke={ac} strokeWidth="1.1" fill="none" strokeLinecap="round" />
    <path d={`M ${32 - 8} 51 L 32 58 L ${32 + 8} 51`} fill="none" stroke={TINTA} strokeWidth="1.3" />
    <path d={`M ${32 - 6.5} 52.5 L 32 58.8 L ${32 + 6.5} 52.5`} fill="none" stroke={TINTA} strokeWidth="0.7" opacity="0.6" />
  </g>),
  Druida: (g, ac) => (<g>
    {/* galhada de verdade: tronco grosso que bifurca, saindo de TRÁS da
       têmpora — dois fiapos com bolinha eram antenas de inseto */}
    <path d={`M ${32 - g.hw - 0.5} 24 C ${32 - g.hw - 3} 18 ${32 - g.hw - 2.5} 13 ${32 - g.hw - 4.5} 9.5 M ${32 - g.hw - 2.7} 15.5 q -3.5 -1 -5 -4 M ${32 - g.hw - 2.2} 18.5 q -3 0.5 -5.5 -1`} stroke={TINTA} strokeWidth="1.5" fill="none" strokeLinecap="round" />
    <path d={`M ${32 + g.hw + 0.5} 24 C ${32 + g.hw + 3} 18 ${32 + g.hw + 2.5} 13 ${32 + g.hw + 4.5} 9.5 M ${32 + g.hw + 2.7} 15.5 q 3.5 -1 5 -4 M ${32 + g.hw + 2.2} 18.5 q 3 0.5 5.5 -1`} stroke={TINTA} strokeWidth="1.5" fill="none" strokeLinecap="round" />
    <path d={`M ${32 - g.hw - 4.5} 10.5 q -1.5 -2 -0.5 -4 q 2 1 1.5 3.5 Z`} fill={ac} />
    <path d={`M ${32 + g.hw + 4.5} 10.5 q 1.5 -2 0.5 -4 q -2 1 -1.5 3.5 Z`} fill={ac} />
  </g>),
  Feiticeiro: (g, ac) => (<g>
    {/* o poder que vaza: faíscas subindo dos DOIS ombros — de um lado só,
       e finas, liam-se como fiapo de linha */}
    <path d={`M ${32 - 10} 50 L ${32 - 12} 44 L ${32 - 6} 47.5 M ${32 + 10} 50 L ${32 + 12} 44 L ${32 + 6} 47.5`} fill={PANO} stroke={TINTA} strokeWidth="1" />
    <path d={`M ${32 - g.sw + 1.5} 51 q -3 -5 0.5 -9 M ${32 - g.sw + 5} 52.5 q -2 -4.5 1 -8 M ${32 + g.sw - 1.5} 51 q 3 -5 -0.5 -9 M ${32 + g.sw - 5} 52.5 q 2 -4.5 -1 -8`} stroke={ac} strokeWidth="1.2" fill="none" strokeLinecap="round" />
    <circle cx={32 - g.sw + 0.5} cy={40.5} r="0.8" fill={ac} />
    <circle cx={32 + g.sw - 0.5} cy={40.5} r="0.8" fill={ac} />
  </g>),
  Bruxo: (g, ac) => (<g>
    <path d={`M ${32 - g.sw + 1} 68 C ${32 - g.sw} 51 ${32 - 8} 46 32 46 C ${32 + 8} 46 ${32 + g.sw} 51 ${32 + g.sw - 1} 64`} fill="none" stroke={TINTA} strokeWidth="1.1" />
    <path d={`M ${32 - g.nw} 49 L 32 54.5 L ${32 + g.nw} 49`} fill="none" stroke={TINTA} strokeWidth="0.7" />
    <path d={`M 32 54 l 2 2.6 l -2 2.6 l -2 -2.6 Z`} fill={ac} stroke={TINTA} strokeWidth="0.7" />
  </g>),
  Engenheiro: (g, ac) => (<g>
    {/* óculos NA TESTA, por cima do que houver: tira grossa, lentes com
       aro claro e ponte — pequenos e altos, viravam enfeite de cabelo */}
    <path d={`M ${32 - g.hw - 0.5} 22.8 L ${32 + g.hw + 0.5} 22.8`} stroke={TINTA} strokeWidth="2.2" />
    <circle cx={32 - 4.6} cy={22.6} r="2.9" fill={PANO} stroke={ac} strokeWidth="1.3" />
    <circle cx={32 + 4.6} cy={22.6} r="2.9" fill={PANO} stroke={ac} strokeWidth="1.3" />
    <path d={`M ${32 - 1.7} 22.6 L ${32 + 1.7} 22.6`} stroke={ac} strokeWidth="1" />
    <circle cx={32 - 5.4} cy={21.8} r="0.7" fill="#EAE4D6" opacity="0.55" />
    <circle cx={32 + 3.8} cy={21.8} r="0.7" fill="#EAE4D6" opacity="0.55" />
  </g>),
  Invocador: (g, ac) => (<g>
    {/* a gema desce para o meio da testa, onde há pele para contrastar; o
       familiar orbita com rastro — um ponto solto parecia sujeira */}
    <path d={`M ${32 - g.hw} 23.8 L ${32 + g.hw} 23.8`} stroke={TINTA} strokeWidth="1.1" />
    <path d={`M 32 23.2 l 2 2.7 l -2 2.7 l -2 -2.7 Z`} fill={ac} stroke={TINTA} strokeWidth="0.6" />
    <circle cx={49.5} cy={20} r="1.7" fill="none" stroke={ac} strokeWidth="1" />
    <circle cx={49.5} cy={20} r="0.6" fill={ac} />
    <path d={`M 46 24 A 6 6 0 0 1 46.5 15.5`} stroke={ac} strokeWidth="0.7" fill="none" opacity="0.55" />
  </g>),
};

/* ---------------- o rosto inteiro ---------------- */
export function Rosto({ semente, estado = "normal", ente = null, fixo = false }) {
  const { apresentacao } = React.useContext(AjusteDoRetrato);
  const grave = estado === "grave", ferido = estado === "ferido", furioso = estado === "furioso";
  const t = tracos(semente);
  const e = ente && typeof ente === "object" ? ente : {};
  const f = feicoes(semente, {
    genero: e.genero || "",
    apresentacao,
    /* quem escolheu a própria cara não entra no sorteio da apresentação */
    fixo: fixo || e.feicoesFixas === true,
  });

  /* a geometria da apresentação: maxilar, pescoço, ombro. As faixas se
     tocam de propósito — um homem de queixo fino e uma mulher de maxilar
     forte existem, e a semente decide DENTRO da faixa. */
  const hw = f.fem ? 11.4 + f.queixo * 1.2 : 12.6 + f.queixo * 1.4;
  const jw = hw * (f.fem ? 0.4 : 0.55);
  const chin = f.fem ? 43.5 : 44.5;
  const nw = f.fem ? 4.5 : 6;
  const sw = f.fem ? 16.5 : 19;
  const g = { hw, jw, chin, nw, sw };

  const sobAng = furioso ? 14 : grave ? -10 : ferido ? -5 : 0;
  const bocaCurva = furioso || grave ? -2.2 : ferido ? -0.8 : 0.8;
  const mw = f.fem ? 3.4 : 4.1;

  const cabelo = (f.fem ? cabeloFem : cabeloMasc)(f.cabelo, g, t.cabelo);
  const traje = TRAJES[e.classe] || null;
  /* a subclasse mora em dois lugares conforme a idade da ficha: o campo
     `subclasse` vem da criação, o mapa `subclasses` das escolhas por
     classe feitas depois — o acento aceita qualquer um dos dois */
  const acento = acentoDe((e.subclasses || {})[e.classe] || e.subclasse);
  /* o capuz do ladino cobre a cabeça: desenhar cabelo por baixo dele só
     criaria pontas vazando pela costura */
  const capuz = e.classe === "Ladino";

  const cabeca = `M ${32 - hw} 28 C ${32 - hw} 15.5 ${32 + hw} 15.5 ${32 + hw} 28 C ${32 + hw} 36 ${32 + jw + 2} ${chin - 3} ${32 + jw * 0.5} ${chin - 0.5} Q 32 ${chin + 1.2} ${32 - jw * 0.5} ${chin - 0.5} C ${32 - jw - 2} ${chin - 3} ${32 - hw} 36 ${32 - hw} 28 Z`;

  return (
    <g strokeLinejoin="round">
      {!capuz && cabelo.atras}
      {/* ombros e veste — o chão do busto */}
      <path d={`M ${32 - sw - 2} 68 C ${32 - sw - 1} ${52} ${32 - 9} ${47.8} ${32 - 4} ${47.4} L ${32 + 4} ${47.4} C ${32 + 9} ${47.8} ${32 + sw + 1} ${52} ${32 + sw + 2} 68 Z`}
        fill={PANO} stroke={TINTA} strokeWidth="1.1" />
      <path d={`M ${32 - nw - 1.5} 48.5 L 32 53.5 L ${32 + nw + 1.5} 48.5`} fill="none" stroke={TINTA} strokeWidth="0.8" opacity="0.8" />
      {/* pescoço, com a sombra que o queixo joga */}
      <path d={`M ${32 - nw} ${chin - 5} L ${32 - nw} 49 L ${32 + nw} 49 L ${32 + nw} ${chin - 5}`} fill={t.pele} stroke={TINTA} strokeWidth="1" />
      <Hachura linhas={[`M ${32 - nw + 1} ${chin - 1.5} h ${nw * 2 - 2}`, `M ${32 - nw + 1.5} ${chin + 0.5} h ${nw * 2 - 3}`]} opacity={0.4} w={0.6} />
      {/* a cabeça */}
      <path d={cabeca} fill={t.pele} stroke={TINTA} strokeWidth="1.2" />
      {/* orelhas */}
      <path d={`M ${32 - hw + 0.4} 29 c -2.4 -0.8 -2.6 3.6 0.2 3.8 M ${32 + hw - 0.4} 29 c 2.4 -0.8 2.6 3.6 -0.2 3.8`} fill={t.pele} stroke={TINTA} strokeWidth="0.9" />
      {/* hachura da face sombreada — a gravura escolhe um lado */}
      <Hachura linhas={[`M ${32 + hw - 2.5} 31 l -2.2 3.2`, `M ${32 + hw - 1.5} 34 l -2.2 3.2`, `M ${32 + jw + 1} ${chin - 5} l -1.8 2.6`]} opacity={0.45} />
      {/* sobrancelhas: a apresentação muda o peso, a expressão muda o ângulo */}
      <path d={f.fem
        ? `M ${32 - 8.2} 26.6 Q ${32 - 5.4} ${24.9} ${32 - 2.8} 26.2`
        : `M ${32 - 8.6} 26.4 L ${32 - 2.6} 25.8`}
        stroke={TINTA} strokeWidth={f.fem ? 1.1 : 1.8} fill="none" strokeLinecap="round"
        transform={`rotate(${-sobAng} ${32 - 5.5} 26)`} />
      <path d={f.fem
        ? `M ${32 + 2.8} 26.2 Q ${32 + 5.4} ${24.9} ${32 + 8.2} 26.6`
        : `M ${32 + 2.6} 25.8 L ${32 + 8.6} 26.4`}
        stroke={TINTA} strokeWidth={f.fem ? 1.1 : 1.8} fill="none" strokeLinecap="round"
        transform={`rotate(${sobAng} ${32 + 5.5} 26)`} />
      {/* olhos */}
      <Olho ex={32 - 5.4} ey={29.5} dir={-1} olhos={t.olhos} fem={f.fem} furioso={furioso} grave={grave} />
      <Olho ex={32 + 5.4} ey={29.5} dir={1} olhos={t.olhos} fem={f.fem} furioso={furioso} grave={grave} />
      {grave && <Hachura linhas={[`M ${32 - 7.4} 32.4 q 2 1.2 4 0.4`, `M ${32 + 3.4} 32.8 q 2 0.8 4 -0.4`]} opacity={0.4} w={0.55} />}
      {/* nariz: uma linha dobrada, como se corta na madeira */}
      <path d={`M 31.5 28.8 L 30.6 34.4 Q 32 35.7 33.4 34.5`} stroke={TINTA} strokeWidth="1.05" fill="none" strokeLinecap="round" />
      <circle cx={30.9} cy={34.9} r="0.4" fill={TINTA} opacity="0.7" />
      {/* barba antes da boca: a boca risca por cima dela */}
      {f.barba === 1 && <Hachura linhas={[`M ${32 - jw - 2.5} 37 l 1.2 2.6`, `M ${32 - jw} 39.5 l 1 2.4`, `M ${32 + jw + 2.5} 37 l -1.2 2.6`, `M ${32 + jw} 39.5 l -1 2.4`, `M ${32 - 2} ${chin - 1.5} l 1 1.6`, `M ${32 + 1.5} ${chin - 1.5} l -1 1.6`]} opacity={0.55} />}
      {f.barba === 2 && (<g>
        <path d={`M ${32 - hw + 1} 33.5 C ${32 - hw} 44 ${32 - 6} ${chin + 6} 32 ${chin + 6} C ${32 + 6} ${chin + 6} ${32 + hw} 44 ${32 + hw - 1} 33.5 C ${32 + jw + 1.5} 38.5 ${32 - jw - 1.5} 38.5 ${32 - hw + 1} 33.5 Z`} fill={t.cabelo} stroke={TINTA} strokeWidth="1" />
        <Hachura linhas={[`M ${32 - 5} ${chin} q 1 3 0 5`, `M ${32 + 5} ${chin} q -1 3 0 5`, `M 32 ${chin + 1} v 4`]} opacity={0.5} w={0.55} />
      </g>)}
      {f.barba === 3 && (<g>
        <path d={`M ${32 - 3} ${chin - 3.5} Q 32 ${chin - 2.2} ${32 + 3} ${chin - 3.5} L ${32 + 2.2} ${chin + 3} Q 32 ${chin + 4.5} ${32 - 2.2} ${chin + 3} Z`} fill={t.cabelo} stroke={TINTA} strokeWidth="0.9" />
        <path d={`M ${32 - 4.5} 37.2 Q 32 39 ${32 + 4.5} 37.2`} stroke={t.cabelo} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      </g>)}
      {/* boca */}
      <path d={`M ${32 - mw} ${38.4 - bocaCurva / 2} Q 32 ${38.4 + bocaCurva} ${32 + mw} ${38.4 - bocaCurva / 2}`}
        stroke={f.barba === 2 ? t.pele : TINTA} strokeWidth="1.2" fill="none" strokeLinecap="round" />
      {f.fem && !furioso && !grave && <path d={`M ${32 - 2.2} 40.2 Q 32 41 ${32 + 2.2} 40.2`} stroke={TINTA} strokeWidth="0.55" fill="none" opacity="0.5" />}
      {furioso && <path d={`M ${32 - 2.8} 40 L ${32 + 2.8} 40`} stroke={TINTA} strokeWidth="0.7" opacity="0.7" />}
      {/* marca da semente: cicatriz, pintura, sinal */}
      {t.marca === 0 && <path d={`M ${32 + 6.5} 24.5 L ${32 + 8.5} 33`} stroke={TINTA} strokeWidth="0.9" opacity="0.6" />}
      {t.marca === 1 && <path d={`M ${32 - 9.5} 28.5 q 1.8 -2.6 3.6 0`} stroke="#7A1F1F" strokeWidth="1.1" fill="none" opacity="0.7" />}
      {t.marca === 2 && <circle cx={32 - 6.5} cy={36} r="0.8" fill={TINTA} opacity="0.55" />}
      {/* cabelo da frente e a franja */}
      {!capuz && cabelo.frente}
      {!capuz && f.franja && f.cabelo !== 2 && (
        <path d={`M ${32 - hw + 1} 25.5 Q ${32 - hw * 0.55} 21 ${32 - 2.5} 24.5 Q 32 21.5 ${32 + 2.5} 24.5 Q ${32 + hw * 0.55} 21 ${32 + hw - 1} 25.5 Q 32 18.5 ${32 - hw + 1} 25.5 Z`} fill={t.cabelo} stroke={TINTA} strokeWidth="0.8" />
      )}
      {/* o traje da classe, com o acento da subclasse */}
      {traje && traje(g, acento, t, f)}
      {/* o estado, por cima, sem tocar nos traços de base */}
      {(ferido || grave) && <path d={`M ${32 - hw + 3} 33 L ${32 - hw + 6.5} 37`} stroke="#7A1F1F" strokeWidth="1.2" opacity="0.85" />}
      {grave && (<g>
        <path d={cabeca} fill={TINTA} opacity="0.14" />
        <rect x={32 - 2} y={19.5} width="11.5" height="3.4" rx="1.6" fill="#CFC6B4" stroke={TINTA} strokeWidth="0.6" transform={`rotate(16 32 21)`} />
        <circle cx={32 + hw - 4} cy={38.5} r="1.2" fill="#7A1F1F" opacity="0.75" />
      </g>)}
    </g>
  );
}
