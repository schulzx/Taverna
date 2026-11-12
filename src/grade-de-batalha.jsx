/* ============================================================
   GRADE DE BATALHA — o campo desenhado (v9.125) — Taverna
   Extraída do App.jsx, onde nasceu na v9.34 como uma malha de <button>.

   O QUE MUDOU, E POR QUÊ: a regra não mudou nada. Os mesmos alcançáveis
   saídos de `alcancaveisDe`, a mesma área saída de `quadradosDaArea`, o
   mesmo `onMover` que cobra o caminho e o golpe livre. O que mudou foi a
   PINTURA — e ela importava mais do que parecia.

   A malha de botões dizia a verdade inteira e parecia uma planilha: célula
   colorida, emoji dentro, um pixel de vão. O resto do jogo é grimório
   noturno, e a luta — o momento mais tenso da mesa — era o único lugar que
   parecia Excel. Além disso o lado do quadrado ficava preso entre 9 e 18
   pixels, e 18 px não é alvo de dedo: no telefone o tabuleiro compacto era
   decorativo e só a tela cheia servia para jogar.

   Em SVG o quadrado é uma unidade e o tamanho é problema do CSS, então o
   mesmo desenho serve o polegar e o mouse. E o que era cor de fundo vira
   coisa: a parede tem massa e aresta iluminada, o estorvo é um vulto no
   chão, o alcance tem CONTORNO em vez de mil bordinhas, e o passo deixa de
   ser teletransporte.
   ============================================================ */
import React from "react";
/* B1: o pé da arena mora na tela que monta (fora da janela que rola), e é
   lá que o tabuleiro escreve a legenda do alcance — por portal, para a
   lógica das tarjas (o passo, o golpe livre, a mira, o ampliar) continuar
   num sítio só. */
import { createPortal } from "react-dom";
import { T, ALVOS } from "./constantes.js";
import { garantirGrade, custosDe, ocupacaoDe, adjacentes, caminhar, quadradosDe, ladoDe, tamanhoDe, ehParede, ehEstorvo, terrenoDificil, temCobertura, nomeDoLugar, distanciaM, alcanceNatural, metrosTxt } from "./grid.js";
/* E4: a geometria do que se escreve DENTRO da casa sai da tabela. `T` e
   `ALVOS` continuam a vir por `constantes.js`, que os reexporta deste
   mesmo arquivo — é o mesmo objeto, e não uma segunda paleta. */
import { TELA_DE_BATALHA } from "./estilo.js";
/* B1 (Figma `151:1662`): o chão desenhado do quadro — a textura de cada
   planta (só o deserto tem) e as medidas do chão, em píxeis de tela. */
import { MESA_DE_BATALHA as MB, TERRENO_DO_TABULEIRO } from "./estilo.js";
/* v9.161: a ficha do tabuleiro ganha ROSTO — o mesmo da bolinha do grupo e
   da carta de tarô, porque uma pessoa com três caras conforme o painel é o
   defeito que o rosto único veio matar. E a faixa do chefe lê a MESMA
   tabela de viradas que o sistema aplicou: `viradasFeitas` guarda o limiar
   cruzado, e `fasesDoChefe` é determinístico pelo nome — reler não é
   recalcular, é abrir o mesmo livro na mesma página. */
import { Rosto } from "./rosto.jsx";
import { sementeDe, estadoDe } from "./semente.js";
import { fasesDoChefe, viradaPorId } from "./masmorras.js";
import { IconeEscudoAlerta, Glifo, PilulaDaPrevisao, PilulaDaIntencao } from "./ui.jsx";
/* CB 18 (lote 3, formas.md §CB 18): o degrau, as superfícies, os objetos, o
   empurrão e a reação. As peças leem por props (o contrato está no cabeçalho
   das props); a conta é de batalha-na-tela.js, as medidas das tabelas de CB 18. */
import { PilulaDoEmpurrao, RotuloDoEmpurrao } from "./ui.jsx";
import { ALTURA_NA_MESA, SUPERFICIES_NO_CHAO, OBJETOS_NA_MESA, EMPURRAO_NA_MESA, REACAO_NA_MESA } from "./estilo.js";
import { alturaDe, patamares, subidaDaFicha, manchasDoChao, campoDoChao, desenhoDoPadrao, desenhoDoObjeto, selosDoObjeto, previsaoDoObjetoNaMesa, rotulosDoEmpurrao, setaDoEmpurrao, trocosDoCaminho, tempoDaReacao, aneisDaReacao, letreiroDaReacao, chaveDaReacao } from "./batalha-na-tela.js";
/* CB (09/11, formas.md §CB 3–§CB 5): a previsão sob o alvo, a intenção no
   canto da ficha, o caminho no chão e o golpe sentido. O que se mostra é
   decidido em batalha-na-tela.js; as medidas saem das tabelas de CB. */
import { PREVISAO_DO_GOLPE, CAMINHO_NO_CHAO, INTENCAO_NA_MESA, GOLPE_SENTIDO, FECHO_DA_QUEDA, TIPOS, alfa } from "./estilo.js";
/* §CB 16: o Pé do campo (a altura dos botões dele, os chips) e o telefone
   sem calha (a régua presa desenha-se por cima das casas) */
import { BATALHA_EM_TRES as B3 } from "./estilo.js";
import { variacaoDoGolpe, pilulaDaPrevisao, chipDaQueda } from "./batalha-na-tela.js";
import { GLIFOS, tracoNaGrelha } from "./glifos.js";
import { tocarGolpe, tocarDado } from "./som-da-mesa.js";
/* CB 17 (lote 2): o d20 do ataque rola NO ALVO (formas.md §CB 17.1) e o turno
   deles conta-se em passos (§CB 17.2). O corpo do dado é o da bandeja
   (DadoDoLance), as faces que acertam são as do motor (facesQueAcertam), e
   as medidas e os tempos moram em DADO_NO_ALVO e TURNO_DELES. */
import { DADO_NO_ALVO, TURNO_DELES } from "./estilo.js";
import { DadoDoLance } from "./painel-bandeja.jsx";
import { FacesDoD20 } from "./ui.jsx";
import { facesQueAcertam } from "./previsao.js";
/* A1 · o custo onde surpreende e a legenda do passo são contas puras */
import { casasQueSurpreendem, legendaDoPasso } from "./glifos.js";
/* E2 — A GRAMÁTICA DO ENDEREÇO NÃO É NOVA, E ISSO É LEI. `LETRAS_DA_GRADE`
   (`coordenadas.js:151`) é a única tabela de letras do jogo: o pergaminho
   escreve `H13` com ela desde a v9.118, e o tabuleiro escreve `K14` com a
   MESMA. Uma segunda tabela de letras seria uma segunda verdade sobre o
   mesmo chão — exatamente a doença que esta etapa existe para impedir, um
   andar abaixo. As vinte letras cobrem tudo: a planta mais larga tem 18
   colunas. */
import { LETRAS_DA_GRADE } from "./coordenadas.js";

const K = (x, y) => `${x},${y}`;

/* ============================================================
   E4 · AS TECLAS DA GRELHA — o padrão `grid` da WAI-ARIA, numa tabela

   O NÚMERO QUE OBRIGA A ISTO, medido pelo `jogo` em duas lutas: da
   borda de cima da tela da luta até `Atacar` iam **84 paragens de
   `Tab`** com o passo cheio e **1** com o passo gasto — *na mesma luta,
   na mesma tela*. Nas dez plantas, de 28 a 91.

   > ### A distância até ao verbo não é longa: é IMPOSSÍVEL DE APRENDER.

   Ela era o tamanho do conjunto alcançável, e esse muda a cada passo, a
   cada planta e a cada rodada. Ninguém forma o hábito *"Atacar fica a N
   tabulações"* quando N nunca é o mesmo duas vezes.

   E O QUE ISTO COMPRA NÃO É CONFORMIDADE, É JOGO. Antes, o `Tab` andava
   pelo conjunto em ordem de DOM — linha a linha sobre o tabuleiro
   inteiro —, e da casa onde estava o seguinte podia cair cinco casas ao
   lado: **quem joga de teclado não tinha como dizer "a casa à minha
   esquerda". Tinha uma lista, não um mapa.** Com as setas por dentro
   ganha o que o rato sempre teve: um cursor que anda uma casa de cada
   vez sobre um mapa.

   `role="grid"` e `role="gridcell"` já estavam postos desde E2; faltava
   só o cursor. Escrito como TABELA e não como `switch` porque é a lista
   das teclas que a norma nomeia, e uma lista que a suíte pode ler de
   volta é a única forma de provar que nenhuma ficou de fora. */
const TECLAS_DA_GRELHA = {
  ArrowRight: { dx: 1, dy: 0 },
  ArrowLeft:  { dx: -1, dy: 0 },
  ArrowDown:  { dx: 0, dy: 1 },
  ArrowUp:    { dx: 0, dy: -1 },
  Home:       { aoInicioDaLinha: true },
  End:        { aoFimDaLinha: true },
  PageUp:     { aoTopo: true },
  PageDown:   { aoFundo: true },
};

/* O MEDIDOR DO CONJUNTO — quantas casas o passo acende, dito a quem
   monta. O número nasce aqui porque é aqui que a busca acontece; medi-lo
   outra vez na tela seria a segunda busca, e duas buscas divergem no dia
   em que alguém mexer numa delas.

   É COMPONENTE, e não um efeito no corpo desta grade, porque a grade tem
   um `return null` cedo (a luta sem terreno) e um hook depois de um
   return condicional é ilegal. E é de MÓDULO, nunca do render: a lei que
   já custou o foco de um campo de texto a esta casa. */
function MedidorDoConjunto({ casas, aoMedir }) {
  React.useEffect(() => { if (aoMedir) aoMedir(casas); }, [casas, aoMedir]);
  return null;
}

/* B1 · O LADO QUE A CASA GANHOU, dito a quem monta — é com ele que a
   câmara enquadra. Pela mesma razão do medidor de cima: é aqui que a conta
   acontece, e fazê-la outra vez na tela seria a segunda conta. */
function MedidorDoLado({ lado, aoMedir }) {
  React.useEffect(() => { if (aoMedir) aoMedir(lado); }, [lado, aoMedir]);
  return null;
}

/* ============================================================
   E2 · O ENDEREÇO DA CASA — UM SÓ SÍTIO NESTE ARQUIVO

   `LETRAS_DA_GRADE[x]` mais `y + 1` é a MESMA composição que `gradeDe`
   já faz para o mundo (`coordenadas.js:157`). Mas a conversão
   endereço↔coordenada é REGRA, e regra é do `backend`: no dia em que
   `enderecoDaCasa(x, y)` e `casaDoEndereco(texto, grade)` nascerem em
   `coordenadas.js` — extraídas de `gradeDe`, que já faz esta conta —,
   esta linha MORRE e o arquivo passa a importá-las, com o mesmo nome.

   Até lá, um sítio só. Ela é função e não está colada dentro de três
   `aria-label` justamente porque três composições do mesmo endereço já
   seriam as três verdades que a lei acima recusa.

   E os dois espaços são diferentes de propósito: `gradeDe` recebe uma
   coordenada do MUNDO e passa por `coordDaCelula`; esta recebe índices
   de QUADRADO. Mesma tabela, dois espaços — nunca a mesma função.
   ============================================================ */
const enderecoDaCasa = (x, y) => `${LETRAS_DA_GRADE[x] || "?"}${y + 1}`;

/* ============================================================
   E2 · A RÉGUA NA BORDA — o topo e a esquerda, nunca as quatro

   POR QUE SÓ DUAS BORDAS. A régua existe para o jogador dizer "vou até
   K14" sem contar quadrados com o dedo. Uma letra em cima e um número à
   esquerda acham qualquer casa; as outras duas bordas repetiriam a mesma
   informação e cobrariam 22 px de campo cada uma — e no telefone o campo
   não tem 22 px para dar duas vezes.

   POR QUE FORA DO SVG. Dentro dele a letra disputaria com as fichas e
   com os nomes de região já escritos no chão, e cairia de 6,40:1 para
   6,00:1 (V1; eram 6,62/6,37 — o par é `T.inkDim` sobre `bg`/`panel`).
   Na calha, sobre `bg`, fica em 6,40:1 e não tapa nada.

   O CANTO (22×22) É `bg` E NÃO LEVA RÓTULO: `A1` não se escreve duas
   vezes.

   E A RÉGUA É `aria-hidden`. Um leitor de tela a ler trinta e quatro
   letras e números seguidos não lê nada — o endereço mora no nome
   acessível de cada casa, que é onde ele significa alguma coisa.

   O CUSTO NO TELEFONE É ZERO, e a prova não é a igualdade — é a folga:
   sem a régua sobravam 23 px e 40 px, e uma casa pede 48. Nenhuma
   daquelas folgas podia virar casa. A régua é paga inteira de espaço que
   casa nenhuma podia ocupar.
   ============================================================ */
const CALHA_DA_REGUA = 22;   /* medido na peça: o glifo de 12 px mede 16 px de linha, e dois dígitos medem 15 px de largura */
const CORPO_DA_REGUA = 12;   /* um degrau acima do piso citado (HIG 11 pt, Material 11 sp): sobrevive a quem já aumentou o texto do sistema */
const MS_DA_REGUA = 90;      /* o mesmo número da casa, porque é o mesmo evento */
/* N = ceil(30 / lado). Os 30 px são conta: a etiqueta mais larga são dois
   dígitos de mono (13,2 px) e duas etiquetas não se lêem como duas com
   menos de ~16 px de vão. 13,2 + 16 = 29,2 → 30. */
const LADO_QUE_CABE_UM_ROTULO = 30;

/* OS TRÊS GRAUS, e o canal que não é cor é a EXISTÊNCIA do filete: de
   Repouso para Procurada muda o filete, não a cor dele. `procurada` é
   `ink` e não um âmbar fraco de propósito — a diferença fica em
   luminância, não em saturação, e saturação é o que morre primeiro num
   telefone ao sol.

   `procurada` NÃO TEM GATILHO HOJE, e está aqui de propósito: é o estado
   de "ele escreveu K e ainda não há número", que pertence à frase
   digitada — e a frase digitada precisa de `casaDoEndereco(texto, grade)`,
   que é do `backend` e ainda não existe. Fica como VALOR possível do
   mesmo `grau`, nunca como caminho separado: no dia em que o motor
   nascer, quem a chama é ele, e nada aqui muda de forma. */
const GRAUS_DA_REGUA = {
  repouso:   { cor: T.inkDim,    filete: null },
  procurada: { cor: T.ink,       filete: T.lineStrong },
  realcada:  { cor: T.amberSoft, filete: T.amber },
};

/* Definido FORA do render de propósito: um componente declarado lá dentro
   nasce outro a cada quadro e mata o foco de quem estiver focado — e aqui
   o foco é justamente o que acende o rótulo. */
/* §CB 9 / §CB 16.3 · A RÉGUA PRESA (o telefone) escreve no CANTO de cada
   casa, por cima das casas e sem lhes tirar um píxel: o quadro 358:1250 põe
   a letra e o número a ~2 px do canto, mono 12 `inkDim` a 85 %. No canto da
   primeira fila à vista a letra e o número cairiam um em cima do outro (o
   quadro resolve-o omitindo o número dessa fila, o que uma régua que rola não
   pode fazer); por isso o número desce uma linha de letra (16, a linha que o
   glifo de 12 mede — ver CALHA_DA_REGUA). */
const CANTO_DA_REGUA = { recuo: 2, alfa: 0.85, linhaDaLetra: 16 };
function RotuloDaRegua({ texto, grau, coluna, parado, canto = false }) {
  const d = GRAUS_DA_REGUA[grau] || GRAUS_DA_REGUA.repouso;
  /* Sob `prefers-reduced-motion` a troca pousa no ESTADO FINAL — a cor de
     chegada, de uma vez. Nenhuma classe nova nasce por causa disto: a
     transição é do elemento, e a saída é o próprio tempo a zero. */
  const anda = `${parado ? 0 : MS_DA_REGUA}ms linear`;
  return (
    <div style={{ flex: 1, minWidth: 0, minHeight: 0, position: "relative", display: "flex", alignItems: canto ? "flex-start" : "center", justifyContent: canto ? "flex-start" : "center",
      /* o recuo por lado, e nunca o atalho padding ao lado de paddingTop: o React
         avisava a cada render que os dois se pisam (11 mil avisos numa sessao) */
      paddingRight: canto ? CANTO_DA_REGUA.recuo : 0, paddingBottom: canto ? CANTO_DA_REGUA.recuo : 0, paddingLeft: canto ? CANTO_DA_REGUA.recuo : 0,
      paddingTop: canto ? (!coluna ? CANTO_DA_REGUA.recuo + CANTO_DA_REGUA.linhaDaLetra : CANTO_DA_REGUA.recuo) : 0,
      opacity: canto ? CANTO_DA_REGUA.alfa : 1 }}>
      {texto ? (
        <span className="tv-mono" style={{ fontSize: CORPO_DA_REGUA, fontWeight: 700, lineHeight: 1, color: d.cor, transition: `color ${anda}` }}>{texto}</span>
      ) : (
        /* a que não é rotulada leva só um traço — é o que uma régua de
           verdade faz quando não cabe uma etiqueta em cada risco */
        <span style={{ background: d.cor, opacity: 0.55, width: coluna ? 1 : 5, height: coluna ? 5 : 1, transition: `background ${anda}` }} />
      )}
      <span style={{
        position: "absolute", background: d.filete || "transparent", transition: `background ${anda}`,
        ...(coluna ? { left: 0, right: 0, bottom: 0, height: 2 } : { top: 0, bottom: 0, right: 0, width: 2 }),
      }} />
    </div>
  );
}

/* O movimento reduzido, perguntado uma vez por render e não uma vez por
   rótulo — são dezoito rótulos por tabuleiro e dois tabuleiros nesta
   componente. O padrão é o do `CampoDeBrasas` (`ui.jsx:589`), e o
   try/catch é a lei da casa: um `matchMedia` que estoure não pode custar
   o turno. */
const movimentoParado = () => {
  try { return !!(typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches); }
  catch { return false; }
};

/* O CONTORNO DA UNIÃO (v9.125): a borda de um conjunto de quadrados são as
   arestas que não têm vizinho dentro do conjunto. Desenhar isso em vez de
   uma borda por célula é o que faz "até onde eu chego" virar uma FORMA —
   uma mancha com beirada — em vez de um mosaico de quadradinhos com risco
   em volta de cada um. */
function contorno(conjunto) {
  const linhas = [];
  for (const k of conjunto) {
    const [x, y] = k.split(",").map(Number);
    if (!conjunto.has(K(x, y - 1))) linhas.push([x, y, x + 1, y]);
    if (!conjunto.has(K(x, y + 1))) linhas.push([x, y + 1, x + 1, y + 1]);
    if (!conjunto.has(K(x - 1, y))) linhas.push([x, y, x, y + 1]);
    if (!conjunto.has(K(x + 1, y))) linhas.push([x + 1, y, x + 1, y + 1]);
  }
  return linhas;
}

/* SEM BURACOS (v9.125): um quadrado ocupado não é alcançável — não dá para
   parar em cima de ninguém — e a parede também não. Sem isto, cada ficha e
   cada bloco de pedra dentro do seu passo abria um furo no conjunto, e o
   contorno desenhava uma caixinha tracejada em volta de cada um: o tabuleiro
   ficava com cara de que tudo estava selecionado. O que interessa é a BEIRA
   do que se alcança, então o que não escoa até a borda do campo é buraco e
   entra no conjunto só para o desenho. */
function semBuracos(conjunto, largura, altura) {
  const fora = new Set();
  const fila = [];
  const poe = (x, y) => {
    if (x < 0 || y < 0 || x >= largura || y >= altura) return;
    const k = K(x, y);
    if (fora.has(k) || conjunto.has(k)) return;
    fora.add(k); fila.push([x, y]);
  };
  for (let x = 0; x < largura; x++) { poe(x, 0); poe(x, altura - 1); }
  for (let y = 0; y < altura; y++) { poe(0, y); poe(largura - 1, y); }
  while (fila.length) {
    const [x, y] = fila.pop();
    poe(x + 1, y); poe(x - 1, y); poe(x, y + 1); poe(x, y - 1);
  }
  const cheio = new Set(conjunto);
  for (let y = 0; y < altura; y++) for (let x = 0; x < largura; x++) {
    const k = K(x, y);
    if (!cheio.has(k) && !fora.has(k)) cheio.add(k);
  }
  return cheio;
}

const Contorno = ({ linhas, cor, largura = 0.05, tracejado = null, opacidade = 1 }) => (
  <g stroke={cor} strokeWidth={largura} strokeLinecap="round" opacity={opacidade} strokeDasharray={tracejado || undefined}>
    {linhas.map(([x1, y1, x2, y2], i) => <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />)}
  </g>
);

/* Uma ficha no tabuleiro. O <g> anda por CSS `transform`, e não pelo
   atributo do SVG, porque só a propriedade do CSS aceita transição — é
   dela que sai o deslizamento. Quem move de verdade é o sistema; isto aqui
   só evita que a ficha pisque de um canto ao outro. */
/* CB 5 · O GOLPE NA FICHA. `golpe` é a variação de batalha-na-tela.js com a
   chave do evento: a chave remonta o <g> de dentro, e a animação corre uma
   vez por golpe. O tremor mede-se em píxeis de tela (--tremor, convertido
   para casas, porque o SVG mede em casas). `anel`: o anel tracejado âmbar
   do alvo da previsão, ou o realce de quem está sob o rato na fila. */
/* CB 17.2 · `age`: o `Anel de quem age` (Figma 364:1469) — traço 3 em `danger`
   (`ok` num aliado), a `folga` px por fora do disco, e o brilho a 35 % por
   baixo dele (tv-anel-age, que sai com o movimento reduzido). */
function Ficha({ ent, tipo, cor, x, y, lado, ms, grande, rotulo = null, pxDaCasa = 0, golpe = null, anel = null, age = null }) {
  /* o clipPath precisa de id único e ESTÁVEL: derivado de x,y ele trocaria
     no meio do deslizamento e o rosto piscaria a cada passo */
  const uid = React.useId();
  const r = lado * 0.40;
  const cx = x + lado / 2, cy = y + lado / 2;
  const pv = Math.max(0, ent.vida || 0), pvMax = Math.max(0, ent.vidaMax || 0);
  const frac = pvMax > 0 ? Math.max(0, Math.min(1, pv / pvMax)) : null;
  const rArco = r + lado * 0.07;
  const volta = 2 * Math.PI * rArco;
  const corVida = frac == null ? cor : frac <= 1 / 3 ? T.danger : frac <= 2 / 3 ? T.amber : T.ok;
  /* O ROSTO, E NÃO A INICIAL (v9.161): a inicial da v9.125 era o certo
     enquanto o rosto era desenho animado — "T" dizia mais que um boneco.
     A xilogravura inverteu a conta: Troll 1 e Troll 2 têm caras diferentes
     (a semente sai do nome), o mago tem chapéu no tabuleiro como tem na
     carta, e o estado muda a expressão AQUI também — o inimigo pressionado
     fica furioso no quadrado dele. Uma pessoa, uma cara, em todo painel. */
  const s = (2 * r * 0.94) / 64;
  const umPx = 1 / Math.max(1, pxDaCasa || 1);
  const tremorPx = golpe ? (GOLPE_SENTIDO[golpe.variante] && GOLPE_SENTIDO[golpe.variante].tremor ? GOLPE_SENTIDO[golpe.variante].tremor.px : 0) : 0;
  return (
    <g style={{ transform: `translate(${cx}px, ${cy}px)`, transition: `transform ${ms}ms linear` }}>
      {anel && (
        <circle r={r + lado * 0.13} fill="none" stroke={anel} strokeWidth={PREVISAO_DO_GOLPE.anelDoAlvo.traco * umPx}
          strokeDasharray={PREVISAO_DO_GOLPE.anelDoAlvo.tracejado.map((n) => n * umPx).join(" ")} />
      )}
      {age && (() => {
        const A = TURNO_DELES.anel;
        const rA = r + lado * 0.07 + (A.folga + A.traco / 2) * umPx;
        return (
          <>
            <circle className="tv-anel-age" r={rA} fill="none" stroke={age} strokeWidth={(A.traco + A.raio * 2) * umPx} />
            <circle r={rA} fill="none" stroke={age} strokeWidth={A.traco * umPx} />
          </>
        );
      })()}
      <g key={golpe ? golpe.chave : "quieta"} className={golpe ? [golpe.classes.tremor, golpe.classes.afunda].filter(Boolean).join(" ") : undefined}
        style={golpe ? { "--tremor": `${tremorPx * umPx}px` } : undefined}>
      {tipo === "heroi" && <circle r={r * 1.5} fill={T.amber} opacity={0.12} />}
      <circle r={r} fill="#100e1a" stroke={cor} strokeWidth={lado * 0.055} />
      <clipPath id={uid}><circle r={r * 0.94} /></clipPath>
      <g clipPath={`url(#${uid})`} style={{ pointerEvents: "none" }}>
        <g transform={`translate(${-32 * s} ${-30.5 * s}) scale(${s})`}>
          {/* A1: o rosto sabe em quantos píxeis é desenhado — o disco da ficha
              é 2 × r = 0,8 × o lado da casa —, para o sinal de quem não é
              gente ter o traço do tamanho em que se vê */}
          <Rosto semente={sementeDe(ent)} estado={estadoDe(pv, pvMax, tipo === "inimigo")} ente={ent} lado={2 * r * (pxDaCasa || 1)} />
        </g>
      </g>
      {frac != null && (
        <circle r={rArco} fill="none" stroke={corVida} strokeWidth={0.075} strokeLinecap="round"
          strokeDasharray={`${volta * frac} ${volta}`} transform="rotate(-90)" opacity={0.85} />
      )}
      {grande && (
        <text className="tv-mono" textAnchor="middle" y={r + lado * 0.4} fill={cor} opacity={0.8}
          style={{ fontSize: 0.26, pointerEvents: "none" }}>{rotulo || ent.nome}</text>
      )}
      {/* a pausa no impacto: a ficha pisca (ink a 35 %) o tempo da pausa */}
      {golpe && golpe.classes.pausa && <circle className={golpe.classes.pausa} r={r} fill={T.ink} opacity={0} />}
      </g>
    </g>
  );
}

/* CB 4 · o glifo desenhado DENTRO do SVG do tabuleiro (a chama no chão da
   área, as espadas na casa do golpe livre, a caveira de quem caiu): o mesmo
   `d` de GLIFOS, escalado à casa, com o traço em píxeis de tela */
function GlifoNaCasa({ nome, x, y, lado = 0.5, cor, px }) {
  const g = GLIFOS[nome];
  if (!g) return null;
  const k = lado / 24;
  return (
    <path d={g.d} fill="none" stroke={cor} strokeWidth={(2 * px) / k} strokeLinecap="round" strokeLinejoin="round"
      transform={`translate(${x + 0.5 - lado / 2} ${y + 0.5 - lado / 2}) scale(${k})`} style={{ pointerEvents: "none" }} />
  );
}

/* ============================================================
   CB 18 · AS PEÇAS DO CHÃO E DO CENÁRIO (formas.md §CB 18; Figma 373:2203
   Superficie no chao, 373:2216 Degrau, 373:2259 Objeto do cenario). A conta
   (os patamares, as manchas, o desenho do padrão, as frases) mora em
   batalha-na-tela.js; aqui só se pinta, com as medidas de ALTURA_NA_MESA,
   SUPERFICIES_NO_CHAO, OBJETOS_NA_MESA e EMPURRAO_NA_MESA e as tintas de T.
   ============================================================ */
/* o glifo de GLIFOS com o centro em (cx, cy) e `lado` em casas; o traço é o
   da família para o tamanho em píxeis (tracoNaGrelha), como o `Glifo` */
function GlifoEm({ nome, cx, cy, lado, cor, px, rodar = 0 }) {
  const g = GLIFOS[nome];
  if (!g || !(lado > 0)) return null;
  const k = lado / 24;
  return (
    <path d={g.d} fill="none" stroke={cor} strokeWidth={tracoNaGrelha(lado / Math.max(px, 1e-6))} strokeLinecap="round" strokeLinejoin="round"
      transform={`translate(${cx - lado / 2} ${cy - lado / 2}) scale(${k})${rodar ? ` rotate(${rodar} 12 12)` : ""}`} style={{ pointerEvents: "none" }} />
  );
}

/* O PADRÃO DE CADA CHÃO, um `<pattern>` de uma casa (a malha é inteira, e o
   padrão casa com ela). O traço e o alfa são os do tipo; a água eletrificada
   desenha as ondas da água e o raio por cima (`sobre`). */
function PadroesDoChao() {
  const S = SUPERFICIES_NO_CHAO;
  return (
    <>
      {Object.entries(S.tipos).map(([tipo, d]) => {
        const sob = d.sobre ? Object.values(S.tipos).find((o) => o.padrao === d.sobre) : null;
        return (
          <pattern key={tipo} id={`tv-chao-${tipo}`} width="1" height="1" patternUnits="userSpaceOnUse">
            {sob && <path d={desenhoDoPadrao(d.sobre)} fill="none" stroke={sob.traco} strokeOpacity={sob.alfaDoTraco} strokeWidth={S.traco} strokeLinecap="round" strokeLinejoin="round" />}
            <path d={desenhoDoPadrao(d.padrao)} fill="none" stroke={d.traco} strokeOpacity={d.alfaDoTraco} strokeWidth={d.sobre ? S.tracoDoRaio : S.traco} strokeLinecap="round" strokeLinejoin="round" />
          </pattern>
        );
      })}
    </>
  );
}

/* O OBJETO DO CENÁRIO (Figma 373:2259 — barril · candeeiro · feno ·
   caixote), desenhado na grelha de 48 da peça e escalado à casa, como o
   estorvo de B1. O barril de óleo leva o óleo que escorre pela tampa: é o
   desenho que avisa antes do selo. */
function ObjetoDoCenario({ objeto }) {
  const O = OBJETOS_NA_MESA, C = O.cor, g = O.grelha;
  const desenho = desenhoDoObjeto(objeto.tipo);
  const oleo = /oleo/.test(String(objeto.tipo || ""));
  return (
    <svg x={objeto.x} y={objeto.y} width="1" height="1" viewBox={`0 0 ${g} ${g}`} style={{ pointerEvents: "none" }}>
      {desenho === "barril" && (
        <>
          <ellipse cx="24" cy="40" rx="15" ry="4" fill={T.bg} opacity={O.sombra} />
          <rect x="12" y="14" width="24" height="26" fill={C.corpo} />
          <path d="M12 33H36M12 20H36" fill="none" stroke={C.aro} strokeWidth="2" />
          <ellipse cx="24" cy="14" rx="12" ry="4.5" fill={C.tampa} stroke={C.aro} strokeWidth="1.5" />
          {oleo && <path d="M30 16C30 16 28 19 28 20.5C28 21.6 28.9 22.5 30 22.5C31.1 22.5 32 21.6 32 20.5C32 19 30 16 30 16Z" fill={SUPERFICIES_NO_CHAO.tipos.oleo.traco} />}
        </>
      )}
      {desenho === "candeeiro" && (
        <>
          <ellipse cx="24" cy="41" rx="9" ry="3" fill={T.bg} opacity={O.sombra} />
          <path d="M24 40V22" fill="none" stroke={C.aro} strokeWidth="2.5" />
          <rect x="17" y="9" width="14" height="14" fill={C.tampa} stroke={C.aro} strokeWidth="1.5" />
          <path d="M24 12C25.3 14 26.5 15 26.5 16.8C26.5 18.3 25.4 19.5 24 19.5C22.6 19.5 21.5 18.3 21.5 16.8C21.5 15.5 22.5 14.5 24 12Z" fill={C.chama} />
        </>
      )}
      {desenho === "feno" && (
        <>
          <ellipse cx="24" cy="41" rx="20" ry="4" fill={T.bg} opacity={O.sombra} />
          <rect x="6" y="20" width="36" height="18" fill={C.corpo} stroke={C.aro} strokeWidth="1.5" />
          <path d="M8 20C18.67 8 29.33 8 40 20" fill={C.corpo} stroke={C.feno} strokeWidth="1.5" />
          <path d="M36 18L34 12M14 18L18 10M22 18L24 8M30 18L30 9" fill="none" stroke={C.feno} strokeWidth="1.25" strokeLinecap="round" />
          <circle cx="14" cy="39" r="4" fill={C.tampa} stroke={C.aro} strokeWidth="1.5" />
          <circle cx="34" cy="39" r="4" fill={C.tampa} stroke={C.aro} strokeWidth="1.5" />
        </>
      )}
      {desenho === "caixote" && (
        <>
          <ellipse cx="24" cy="40.5" rx="17" ry="3.5" fill={T.bg} opacity={O.sombra} />
          <rect x="10" y="12" width="28" height="28" fill={C.corpo} />
          <path d="M10 12H38V40H10ZM38 12L10 40M10 12L38 40" fill="none" stroke={C.aro} strokeWidth="1.5" />
        </>
      )}
    </svg>
  );
}

/* OS SELOS DO OBJETO: até dois discos de 16 px no canto de cima à direita,
   2 px entre eles, a subir 4 px por cima da peça — o disco `pagina`, o aro e
   o glifo 10 na cor da etiqueta. Dizem o que ele faz antes de ser usado. */
function SelosDoObjeto({ objeto, px }) {
  const S = OBJETOS_NA_MESA.selo;
  const selos = selosDoObjeto(objeto);
  if (!selos.length) return null;
  const r = (S.lado / 2) * px;
  return (
    <g style={{ pointerEvents: "none" }}>
      {selos.map((s, i) => {
        const cx = objeto.x + 1 - r - i * (S.lado + S.entre) * px;
        const cy = objeto.y - S.sobe * px + r;
        return (
          <g key={s.etiqueta}>
            <circle cx={cx} cy={cy} r={r - (S.aro * px) / 2} fill={T.pagina} stroke={s.cor} strokeWidth={S.aro * px} />
            <GlifoEm nome={s.glifo} cx={cx} cy={cy} lado={S.glifo * px} cor={s.cor} px={px} />
          </g>
        );
      })}
    </g>
  );
}

/* O SELO DA SUPERFÍCIE (`Selo da superficie`, §CB 18.2): uma vez por mancha,
   no canto de baixo à esquerda da âncora, por cima das fichas. `pagina` a
   0,92, o aro da cor do traço (tracejado na última rodada), o glifo 12 e as
   rodadas que faltam em mono 12 bold `ink` — sem número quando não acaba. */
function SeloDaSuperficie({ mancha, largura, altura }) {
  const S = SUPERFICIES_NO_CHAO;
  const d = S.tipos[mancha.tipo];
  if (!d || !mancha.ancora) return null;
  const a = mancha.ancora;
  return (
    <span className="tv-mono inline-flex items-center" aria-hidden="true"
      style={{ position: "absolute", zIndex: 1, left: `${(a.x / largura) * 100}%`, top: `${((a.y + 1) / altura) * 100}%`,
        transform: `translate(${S.selo.margem}px, calc(-100% - ${S.selo.margem}px))`,
        height: S.selo.alto, borderRadius: S.selo.raio, padding: `0 ${S.selo.enchimento[1]}px 0 ${S.selo.enchimento[0]}px`, gap: S.selo.entre,
        background: alfa(T.pagina, S.selo.fundo), border: `${S.contorno}px ${mancha.ultima ? "dashed" : "solid"} ${d.traco}`,
        fontSize: TIPOS.piso, fontWeight: 700, color: T.ink, whiteSpace: "nowrap" }}>
      <Glifo nome={d.glifo} tamanho={S.selo.glifo} cor={d.traco} />
      {mancha.rodadas != null && <span>{mancha.rodadas}</span>}
    </span>
  );
}

/* A COTA DO DEGRAU: os chevrons no canto de cima à esquerda, um por nível.
   O degrau 2 é o glifo `degrau` (os dois chevrons de `Degrau · Nivel=2`); o
   degrau 1 é o chevron de baixo dele, centrado no quadro (no Figma o vetor
   de `Nivel=1` sai do quadro de 10, e a forma é a mesma). */
const CHEVRON_DO_DEGRAU_UM = "M4 15.5L12 8.5L20 15.5";
function CotaDoDegrau({ x, y, nivel, px }) {
  const C = ALTURA_NA_MESA.cota;
  const lado = C.lado, k = lado / 24;
  const d = nivel >= 2 ? GLIFOS[ALTURA_NA_MESA.glifo].d : CHEVRON_DO_DEGRAU_UM;
  return (
    <path d={d} fill="none" stroke={ALTURA_NA_MESA.cor.cota} strokeWidth={(C.traco * px) / k} strokeLinecap="round" strokeLinejoin="round"
      transform={`translate(${x + C.folga} ${y + C.folga}) scale(${k})`} style={{ pointerEvents: "none" }} />
  );
}

/* O LETREIRO DA REAÇÃO (Figma 373:2280 · primeira): Cormorant 22 `ink` sobre
   `perigoFundo` e a linha em mono 12, por cima da área — por baixo dela se
   couber, senão por cima (a regra de pousar do dado, §CB 17.1). Esvanece no
   fim da leitura; com movimento reduzido sai sem transição. */
const ENTRELINHA_DO_LETREIRO = { titulo: 1.15, linha: 1.4 };
function LetreiroDaReacao({ reacao, largura, altura, parado, ladoPx }) {
  const L = REACAO_NA_MESA.letreiro;
  const l = reacao.letreiro;
  if (!l) return null;
  const cs = reacao.casas.length ? reacao.casas : reacao.ev.origem ? [reacao.ev.origem] : [];
  if (!cs.length) return null;
  const x0 = Math.min(...cs.map((q) => q.x)), x1 = Math.max(...cs.map((q) => q.x)) + 1;
  const y0 = Math.min(...cs.map((q) => q.y)), y1 = Math.max(...cs.map((q) => q.y)) + 1;
  const altoEmCasas = (L.titulo * ENTRELINHA_DO_LETREIRO.titulo + L.linha * ENTRELINHA_DO_LETREIRO.linha + L.enchimento.y * 3) / Math.max(1, ladoPx || 1);
  const cabePorBaixo = y1 + altoEmCasas <= altura;
  const pos = cabePorBaixo
    ? { top: `${(y1 / altura) * 100}%`, transform: `translate(-50%, ${L.enchimento.y}px)` }
    : { top: `${(y0 / altura) * 100}%`, transform: `translate(-50%, calc(-100% - ${L.enchimento.y}px))` };
  return (
    <span role="status" style={{ position: "absolute", zIndex: 5, left: `${(((x0 + x1) / 2) / largura) * 100}%`, ...pos,
      display: "inline-flex", flexDirection: "column", alignItems: "center", padding: `${L.enchimento.y}px ${L.enchimento.x}px`,
      borderRadius: L.raio, background: T.perigoFundo, border: `${L.aro}px solid ${T.danger}`, whiteSpace: "nowrap",
      opacity: reacao.fase === "esvai" ? 0 : 1, transition: parado ? "none" : `opacity ${REACAO_NA_MESA.esvai}ms ease-in` }}>
      <span className="tv-display" style={{ fontSize: L.titulo, color: T.ink, lineHeight: ENTRELINHA_DO_LETREIRO.titulo }}>{l.titulo}</span>
      {l.linha && <span className="tv-mono" style={{ fontSize: L.linha, color: T.inkMeio, lineHeight: ENTRELINHA_DO_LETREIRO.linha }}>{l.linha}</span>}
    </span>
  );
}

/* CB 5 · O NÚMERO DO GOLPE (Figma 342:183) — substitui o flutuante. Salta
   (0,6 → 1,25), assenta e sobe 12 px; fica para se ler e esvanece. O
   crítico é maior e âmbar, com «CRÍTICO»; o erro é itálico e baço; o golpe
   em ti é perigo. É HTML por cima do tabuleiro (o tamanho é de tela, não
   de casa), e não toca no toque. */
const TOM_DO_NUMERO = { dano: "ink", critico: "amber", erro: "inkDim", emTi: "danger", cura: "ok" };
function NumeroDoGolpe({ variacao, reduzido = false }) {
  if (!variacao) return null;
  const cor = T[TOM_DO_NUMERO[variacao.tom]] || T.ink;
  const erro = variacao.tom === "erro";
  return (
    <span aria-hidden="true" className={`${erro ? "tv-body" : "tv-display"} ${variacao.classes.salto}${reduzido ? " tv-golpe-reduzido" : ""}`}
      style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", lineHeight: 1, color: cor, fontSize: variacao.tamanho,
        fontWeight: erro ? 400 : 700, fontStyle: erro ? "italic" : "normal", whiteSpace: "nowrap",
        WebkitTextStroke: erro ? undefined : `${GOLPE_SENTIDO.numero.contorno / 2}px ${T.bg}`, paintOrder: "stroke fill" }}>
      {variacao.texto}
      {variacao.etiqueta && <span className="tv-mono" style={{ fontSize: TIPOS.piso, letterSpacing: 2, fontWeight: 700, color: T.amberSoft, WebkitTextStroke: "0" }}>{variacao.etiqueta}</span>}
    </span>
  );
}

/* ============================================================
   CB 17.1 · O DADO NO ALVO (Figma 363:1649) — a pílula da previsão vira o
   dado. Seis estados: rola (aro âmbar tracejado 4/3, o d20 a balançar e o
   número a trocar, «precisas de N+»), acerta, critico (aro 2,5, «✦ CRÍTICO»),
   erra (aro lineStrong, o d20 a 70 %), deles-acerta e deles-erra (o d20 a 28,
   pousado, «Goblin · 14 +4 contra 16», aro danger / lineStrong).
   O relógio do NÚMERO é desta peça (troca a cada DADO_NO_ALVO.troca); o
   relógio do POUSO é da grade (`pousou`), que o encurta com qualquer toque.
   Fora do toque: o toque é das casas, por baixo.
   `lance`: { alvo, dados: [{ natural, bonus, total, defesa, desfecho }],
   deles (o nome de quem ataca, no turno deles), rola, pousaEm: [ms],
   letal, salvam } — já normalizado pela grade.
   §CB 17.8 (o dado que te pode derrubar): o d20 deles cuja intenção
   anunciou a caveira sobre ti ROLA, com «precisa de N+ para te acertar» e
   as faces que te salvam acesas em `ok`.
   ============================================================ */
const sinal = (n) => (Number(n) >= 0 ? `+${Number(n) || 0}` : `−${Math.abs(Number(n))}`);
const precisaDe = (d) => { const f = facesQueAcertam(d.bonus, d.defesa, 20); return f.length ? f[0] : 20; };
function DadoNoAlvo({ lance, pousou, telefone = false, parado = false }) {
  const L = DADO_NO_ALVO;
  const dados = Array.isArray(lance && lance.dados) ? lance.dados : [];
  const pousaEm = Array.isArray(lance && lance.pousaEm) ? lance.pousaEm : [];
  const ultimoPouso = Math.max(0, ...pousaEm);
  const [passou, setPassou] = React.useState(0);
  React.useEffect(() => {
    if (pousou || parado || !lance || !lance.rola) return undefined;
    const inicio = Date.now();
    const id = setInterval(() => {
      const ms = Date.now() - inicio;
      setPassou(ms);
      if (ms >= ultimoPouso) clearInterval(id);
    }, L.troca);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pousou]);
  if (!lance || !dados.length) return null;
  const rolaODado = (i) => !!lance.rola && !pousou && !parado && passou < (pousaEm[i] || 0);
  const rolando = dados.some((_, i) => rolaODado(i));
  const deles = !!lance.deles;
  const lado = deles && !lance.rola ? L.lado.deles : telefone ? L.lado.telefone : L.lado.mesa;
  const alto = lado + L.respiro * 2;
  const critico = !rolando && dados.some((d) => d.desfecho === "critico");
  const acertou = dados.some((d) => d.desfecho === "acerta" || d.desfecho === "critico");
  const aro = rolando ? T.amber : deles ? (acertou ? T.danger : T.lineStrong) : acertou ? T.amber : T.lineStrong;
  const grossura = critico && !deles ? L.aroCritico : L.aro;
  const d0 = dados[0];
  const conta = (d) => (d.natural === 20 && !deles ? "20 no dado"
    : deles ? `${d.natural} ${sinal(d.bonus)} contra ${d.defesa}`
      : `${d.natural} ${sinal(d.bonus)} = ${d.total != null ? d.total : d.natural + (Number(d.bonus) || 0)} contra ${d.defesa}`);
  const linha1 = rolando
    ? (deles ? `precisa de ${precisaDe(d0)}+ para te acertar` : `precisas de ${precisaDe(d0)}+`)
    : `${deles ? `${lance.deles} · ` : ""}${dados.map(conta).join(" · ")}`;
  const desfechoDe = (d) => (d.desfecho === "critico" && !deles ? "CRÍTICO" : d.desfecho === "acerta" || d.desfecho === "critico" ? "acerta" : "erra");
  const corDoDesfecho = !acertou ? T.inkDim : deles ? T.danger : critico ? T.amber : T.ok;
  const rotulo = rolando
    ? `o dado rola contra ${lance.alvo}; ${linha1}`
    : `${lance.alvo}: ${dados.map((d) => `${conta(d)}, ${desfechoDe(d).toLowerCase()}`).join("; ")}`;
  /* as faces que te salvam (§CB 17.8): só no dado letal deles */
  const salvam = lance.letal && Array.isArray(lance.salvam) ? new Set(lance.salvam) : null;
  const P = PREVISAO_DO_GOLPE;
  return (
    <span role="status" aria-label={rotulo} className="inline-flex flex-col items-center" style={{ gap: L.entre }}>
      <span className="inline-flex items-center" style={{ position: "relative", height: alto, borderRadius: alto / 2, gap: L.entre,
        padding: `0 ${L.direita}px 0 ${L.respiro}px`, background: T.pagina, whiteSpace: "nowrap" }}>
        {/* o aro em SVG: o tracejado 4/3 da peça não sai de um border dashed */}
        <svg aria-hidden="true" width="100%" height="100%" style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }}>
          <rect x="0" y="0" width="100%" height="100%" rx={alto / 2} fill="none" stroke={aro} strokeWidth={grossura}
            strokeDasharray={rolando ? L.tracejadoRola.join(" ") : undefined} />
        </svg>
        <span aria-hidden="true" className="inline-flex" style={{ gap: L.respiro }}>
          {dados.map((d, i) => (
            <span key={i} className={rolaODado(i) ? "tv-dado-no-alvo" : undefined}
              style={{ display: "inline-flex", opacity: !rolaODado(i) && desfechoDe(d) === "erra" ? L.erraAlfa : 1 }}>
              <DadoDoLance d={{ faces: 20, valor: d.natural, papel: "teste" }} tam={lado} rolando={rolaODado(i)} desfecho="livre" troca={Math.floor(passou / L.troca) + i} />
            </span>
          ))}
        </span>
        <span aria-hidden="true" className="tv-mono flex flex-col" style={{ lineHeight: 1.25 }}>
          <span style={{ fontSize: TIPOS.piso, color: rolando ? T.amberSoft : T.inkMeio }}>{linha1}</span>
          {rolando
            ? <span style={{ fontSize: TIPOS.piso, color: T.inkDim }}>o dado rola…</span>
            : (
              <span style={{ fontSize: TIPOS.rotulo, fontWeight: 700, color: corDoDesfecho }}>
                {critico && !deles && <><Glifo nome="faisca" tamanho={TIPOS.rotulo} cor={T.amber} />{" "}</>}
                {[...new Set(dados.map(desfechoDe))].join(" · ")}
              </span>
            )}
        </span>
      </span>
      {salvam && (
        <span style={{ padding: L.respiro, borderRadius: P.raio / 2, background: T.pagina, maxWidth: P.faces.lado[0] * 10 + P.faces.entre * 9 + L.respiro * 2 }}>
          <FacesDoD20 tom="salva" faces={Array.from({ length: 20 }, (_, i) => ({ n: i + 1, acerta: salvam.has(i + 1) }))}
            saiu={rolando ? null : d0.natural} rotulo={`as faces que te salvam: ${[...salvam].join(", ") || "nenhuma"}`} />
        </span>
      )}
    </span>
  );
}

/* o desfecho do d20 deles, lido do evento do golpe (a variante do golpe sentido) */
const desfechoDoEvento = (ev) => { const v = variacaoDoGolpe(ev); return !v ? "erra" : v.variante === "erro" ? "erra" : v.variante === "critico" ? "critico" : "acerta"; };
/* a chave estável de um passo (o índice e quem age): muda quando o passo muda */
const chaveDoPasso = (p) => (p && p.quem ? `${p.i != null ? p.i : ""}:${p.quem}` : "");

/* ============================================================
   CB 17.1 · OS LANCES NA MESA — a conta, pura (provada em Node pela suíte)
   Os do herói (`lance`, um ou uma lista) e os do passo deles (o d20 de cada
   golpe, que pousa já — menos o letal, §CB 17.8, que rola). Cada dado ganha
   o instante em que pousa: DADO_NO_ALVO.rola (a metade com 2×), mais
   `entreDados` por dado a seguir, nunca além de `tetoDeVarios`. O golpe de
   fuga é o golpe livre do herói, e não é um d20 deles.
   ============================================================ */
export function lancesNaMesa(lance, passo, o) {
  const { heroi = "", acelerado = false } = o && typeof o === "object" ? o : {};
  const kDoDado = acelerado ? TURNO_DELES.acelerado : 1;
  const out = [];
  let ordem = 0;
  const pousos = (n, rola) => Array.from({ length: n }, () => (rola ? Math.min(DADO_NO_ALVO.rola * kDoDado + (ordem++) * DADO_NO_ALVO.entreDados, DADO_NO_ALVO.tetoDeVarios * kDoDado) : 0));
  const doHeroi = (Array.isArray(lance) ? lance : lance ? [lance] : []).filter((l) => l && l.alvo && Array.isArray(l.dados) && l.dados.length);
  for (const l of doHeroi) {
    const dados = l.dados.filter((d) => d && Number.isFinite(Number(d.natural))).map((d) => ({ natural: Number(d.natural), bonus: Number(d.bonus) || 0, total: d.total != null ? Number(d.total) : null, defesa: d.defesa != null ? Number(d.defesa) : null, desfecho: d.desfecho || "erra" }));
    if (!dados.length) continue;
    out.push({ chave: `h:${l.n != null ? l.n : ""}:${l.alvo}`, alvo: String(l.alvo), dados, deles: null, rola: true, pousaEm: pousos(dados.length, true), heroi: true, acertam: l.acertam || null, criticoEm: l.criticoEm || null });
  }
  const kp = chaveDoPasso(passo);
  (passo && Array.isArray(passo.golpes) ? passo.golpes : []).forEach((gp, j) => {
    if (!gp || !gp.dado || !gp.alvo || passo.lado === "inimigo" && passo.tipo === "fugir") return;
    const letal = !!heroi && gp.alvo === heroi && Number.isFinite(Number(gp.abateAnunciado)) && Number(gp.abateAnunciado) >= INTENCAO_NA_MESA.abateQueSeAnuncia;
    const d = { natural: Number(gp.dado.natural), bonus: Number(gp.dado.bonus) || 0, total: gp.dado.total, defesa: gp.dado.defesa, desfecho: desfechoDoEvento(gp.evento) };
    out.push({ chave: `d:${kp}:${j}`, alvo: String(gp.alvo), dados: [d], deles: passo.quem, rola: letal, letal, salvam: gp.salvam || null, pousaEm: pousos(1, letal), de: passo.para || passo.de || null });
  });
  return out;
}
/* quem espera pelo dado: os alvos de um lance que ainda rola (o número do
   golpe neles nasce no pouso, §CB 17.1); depois do pouso, ninguém */
export function alvosQueEsperam(lances, pousou) {
  if (pousou || !Array.isArray(lances)) return new Set();
  return new Set(lances.filter((l) => l && l.rola).map((l) => l.alvo));
}

/* `ladoFixo` (E3): o lado da casa em píxeis, imposto por quem monta. Com
   ele o tabuleiro deixa de ser "o campo inteiro espremido no espaço que
   houver" e passa a ser uma JANELA SOBRE UM CAMPO — *quem encolhe é o
   campo visível, nunca o alvo*. A tela da batalha passa `ALVOS.piso`
   (48), que é o menor lado que passa em WCAG 2.5.5, HIG e Material ao
   mesmo tempo, e nenhum dos quatro tamanhos de antes lá chegava (23,8 no
   embutido 16×16, 36,6 no ampliado). Zero (o defeito) mantém, byte a
   byte, a conta antiga — quem não pede janela continua com o relance. */
/* A1 · `legendaCede` (N7): com a janela da reação aberta, a legenda do pé
   sai — o "deixar passar" encavalava-se na "ÁREA DE MOVIMENTO". As tarjas e
   o `ampliar` ficam; quem decide é a reação, e a área continua dita pelo
   tracejado do chão. */
export function GridDeBatalha({ combate, grupo = [], heroiFicha = null, previsao = null, passoM = 9, passoTotal = 9, ignoraDificil = false, podeMover = true, onMover, mira = null, onMirar, alcanceMira = null, ladoFixo = 0, aoMedirOPasso = null, larguraDaJanela = 0, alturaDaJanela = 0, tetoDoLado = 0, aoMedirOLado = null, pe = null, peCompacto = false, legendaCede = false,
  /* CB (formas.md §CB 13, item 3). As de hoje (`mira`, `previsao`) não
     mudam de sentido: `mira` é a retícula da área, `previsao` a área que
     ela apanha. As novas:
       previsaoDoGolpe — previsaoDoHeroi(...) com `alvo` (o nome) e, se a
                         fiação souber, `semVista`: a pílula sob o alvo;
       intencoes       — intencoesDaRodada(...).lista: a pílula no canto da
                         ficha, a seta do ataque e as casas do sopro;
       caminho         — { pontos: [{x,y}], metros, sobraM, golpeLivreEm:
                         [{x,y}] }: o caminho no chão antes de andar e atacar;
       golpes          — os eventoDoGolpe da rajada, cada um com `chave`
                         única: o golpe sentido e o número;
       aoApontarInimigo(nome|null), aoTocarInimigo(nome) — o rato e o toque
                         na ficha do inimigo (prever; andar e atacar);
       realce          — o nome de quem está sob o rato na fila da vez;
       reguaPresa      — as letras e os números colados à janela (telefone);
       heroiNome       — o nome do herói (o golpe «em ti»);
       quedas          — [{ chave, nome, escolha }]: a queda do meio, que não
                         pára a mesa; o chip pousa na casa 4 s com o outro lado
                         a um toque (aoMudarQueda(chave, escolha));
       veuDoUltimo     — o nome do último (ou do importante): o véu a 45 %
                         sobre o campo, menos a casa dele, com o anel âmbar. */
  previsaoDoGolpe = null, intencoes = null, caminho = null, golpes = null, aoApontarInimigo = null, aoTocarInimigo = null, realce = null, reguaPresa = false, heroiNome = "",
  quedas = null, aoMudarQueda = null, veuDoUltimo = null,
  /* CB 17 (formas.md §CB 17.6, item 3):
       lance    — o d20 do herói, que rola NO ALVO: { alvo, dados: [{ natural,
                  bonus, total, defesa, desfecho ("acerta"|"critico"|"erra") }],
                  n, acertam?, criticoEm? } (ou uma lista, um por alvo, no
                  Ataque Extra). Enquanto há lance, a previsão daquele alvo
                  cala-se, e o número do golpe nele ESPERA pelo dado;
       passo    — o passo corrente do turno deles (passosDoTurno, com `i` e
                  `porVir`: [{ quem, de }] — quem ainda não agiu fica onde
                  estava): o anel de quem age, o caminho, a origem, o deslizar
                  da ficha, o pulso do sopro e o d20 deles no alvo;
       agiram   — os nomes de quem já agiu (a intenção deles sai da mesa);
       acelerado — o 2× do turno deles (o dado rola a metade);
       vista    — no telefone, a janela da câmara ({ x0, y0, janela }): o dado
                  que não cabe por baixo do alvo sobe para cima dele;
       aoLance({ alvo, rolando, saiu, acertam, criticoEm } | null) — o estado
                  do lance do herói, para «O teu golpe» acender a face. */
  lance = null, passo = null, agiram = null, acelerado = false, vista = null, aoLance = null,
  /* CB 18 (formas.md §CB 18.7, item 3) — ausentes, a mesa é a de hoje:
       alturas     — { "x,y": 1|2 } (grade.alturas): o degrau (lume, face,
                     aresta, cota) e a ficha que sobe metade da face;
       superficies — [{ x, y, tipo, rodadas }] (combate.superficies; tipos
                     oleo, agua, gelo, fogo, veneno, eletrica; rodadas null =
                     não acaba; `consequencia` opcional, texto do motor): as
                     manchas com o padrão, o contorno e o selo;
       objetos     — [{ x, y, tipo, etiquetas, nome?, previsao? }]
                     (grade.objetos; previsao = previsaoDoObjeto: { casas,
                     dano, deixa, verbo }): a peça no lugar do estorvo, os
                     selos, e a área do objeto sob o rato;
       empurrao    — { alvo (o nome), previsao (previsaoDoEmpurrao: { casas,
                     para, queda, dano: { queda, colisao, superficie, total },
                     colideCom, superficie, efeito, chance, alto?, derruba? }),
                     de? }: a seta, o fantasma, a pílula e os rótulos;
       reacoes     — os eventos de reação da resolução: [{ tipo, casas
                     ([{x,y}] ou o número), dano, primeira, origem: {x,y},
                     alvos: [{ nome, dano }], objeto, chave? }].
     E o `caminho` ganha `perigos: [{ x, y, tipo, dano, teste }]` (o troço
     em `danger` e o preço no rótulo do destino); a `previsaoDoGolpe`
     ganha `alto: +2 | −2 | 0` (a pílula «+2 do alto»). */
  alturas = null, superficies = null, objetos = null, empurrao = null, reacoes = null }) {
  const [aberto, setAberto] = React.useState(false);
  const paradoAgora = movimentoParado();
  const heroiDoGolpe = heroiNome || (heroiFicha && heroiFicha.nome) || "";

  /* ---------------- CB 17.1 · OS LANCES NA MESA ----------------
     Os do herói (`lance`) e os do passo deles (o d20 de cada golpe, que
     pousa já — menos o letal, §CB 17.8, que rola). O relógio do pouso é um
     só: rola DADO_NO_ALVO.rola (a metade com 2×); vários dados pousam com
     `entreDados` entre si e nunca passam de `tetoDeVarios`. Qualquer toque,
     clique ou tecla pousa já, e é aceite (a entrada nunca espera). Depois do
     pouso, o golpe sentido, a leitura e o esvanecer; e a pílula sai. */
  const lances = (() => { try { return lancesNaMesa(lance, passo, { heroi: heroiDoGolpe, acelerado }); } catch (e) { console.warn("GridDeBatalha: o lance não se leu", e); return []; } })();
  const chaveDosLances = lances.map((l) => l.chave).join("|");
  const pousoMax = Math.max(0, ...lances.flatMap((l) => l.pousaEm));
  const [estadoDoLance, setEstadoDoLance] = React.useState({ chave: "", pousou: false, acabou: false });
  const lanceAgora = estadoDoLance.chave === chaveDosLances ? estadoDoLance : { chave: chaveDosLances, pousou: paradoAgora || pousoMax === 0, acabou: false };
  const pousarJaRef = React.useRef(null);
  React.useEffect(() => {
    if (!chaveDosLances) { pousarJaRef.current = null; return undefined; }
    const chave = chaveDosLances;
    const depois = GOLPE_SENTIDO.teto + GOLPE_SENTIDO.leitura + GOLPE_SENTIDO.esvai;
    const rolou = lances.some((l) => l.rola);
    let tFim = null, pousado = false;
    const pousar = () => {
      if (pousado) return;
      pousado = true; clearTimeout(tPouso); pousarJaRef.current = null;
      setEstadoDoLance({ chave, pousou: true, acabou: false });
      if (rolou) { try { tocarDado(); } catch { /* um som que estoura cala-se */ } }
      tEsvai = setTimeout(() => setEstadoDoLance({ chave, pousou: true, acabou: false, esvai: true }), depois - GOLPE_SENTIDO.esvai);
      tFim = setTimeout(() => setEstadoDoLance({ chave, pousou: true, acabou: true }), depois);
    };
    let tEsvai = null;
    const tPouso = setTimeout(pousar, paradoAgora ? 0 : pousoMax);
    pousarJaRef.current = pousar;
    return () => { clearTimeout(tPouso); clearTimeout(tEsvai); clearTimeout(tFim); pousarJaRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chaveDosLances]);
  const rolandoAgora = !!chaveDosLances && !lanceAgora.pousou;
  /* o toque que pousa: qualquer, em qualquer sítio, e nunca consumido */
  React.useEffect(() => {
    if (!rolandoAgora || typeof window === "undefined" || !window.addEventListener) return undefined;
    const ja = () => { try { if (pousarJaRef.current) pousarJaRef.current(); } catch { /* saltar nunca custa o turno */ } };
    window.addEventListener("pointerdown", ja, true);
    window.addEventListener("keydown", ja, true);
    return () => { window.removeEventListener("pointerdown", ja, true); window.removeEventListener("keydown", ja, true); };
  }, [rolandoAgora]);
  /* o lance do herói dito a quem monta («O teu golpe» marca a face) */
  const lanceDoHeroi = lances.find((l) => l.heroi) || null;
  const sinalDoLance = lanceDoHeroi && !lanceAgora.acabou ? `${lanceDoHeroi.chave}|${lanceAgora.pousou ? "p" : "r"}` : "";
  React.useEffect(() => {
    if (!aoLance) return;
    try {
      aoLance(lanceDoHeroi && !lanceAgora.acabou ? { alvo: lanceDoHeroi.alvo, rolando: !lanceAgora.pousou, saiu: lanceAgora.pousou ? lanceDoHeroi.dados[lanceDoHeroi.dados.length - 1].natural : null, acertam: lanceDoHeroi.acertam, criticoEm: lanceDoHeroi.criticoEm } : null);
    } catch (e) { console.warn("GridDeBatalha: dizer o lance falhou", e); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sinalDoLance]);
  /* quem espera pelo dado: os alvos de um lance que ainda rola */
  const alvosAEspera = alvosQueEsperam(lances, !rolandoAgora);
  const esperaRef = React.useRef([]);

  /* ---------------- CB 5 · O GOLPE SENTIDO ----------------
     Cada evento novo (pela chave) entra na mesa uma vez: a ficha treme, o
     número salta, o som nasce no impacto. Fica o tempo do golpe, da leitura
     e do esvanecer, e sai. NADA ESPERA POR ISTO: o estado já está aplicado
     quando a animação começa, e o toque seguinte é aceite em qualquer
     quadro. Um som que estoura cala-se; o golpe pousa na mesma. */
  const golpesVistosRef = React.useRef(new Set());
  const [golpesNaMesa, setGolpesNaMesa] = React.useState([]);
  const tidsDosGolpesRef = React.useRef([]);
  React.useEffect(() => {
    if (!Array.isArray(golpes) || !golpes.length) return undefined;
    const novos = [];
    for (const ev of golpes) {
      try {
        if (!ev || ev.chave == null || golpesVistosRef.current.has(ev.chave)) continue;
        golpesVistosRef.current.add(ev.chave);
        const v = variacaoDoGolpe(ev, { heroi: heroiNome || (heroiFicha && heroiFicha.nome) || "" });
        /* CB 17.1: O NÚMERO ESPERA PELO DADO. O golpe no alvo de um lance que
           ainda rola guarda-se, e nasce (com o som) no pouso — se saltasse
           antes, estragava o dado */
        if (v && alvosAEspera.has(ev.alvo)) { esperaRef.current.push({ v: { ...v, chave: ev.chave, alvo: ev.alvo }, ev }); continue; }
        if (v) novos.push({ ...v, chave: ev.chave, alvo: ev.alvo });
        try { tocarGolpe(ev); } catch { /* um som que estoura cala-se */ }
      } catch (e) { console.warn("GridDeBatalha: o golpe não pousou", e); }
    }
    if (!novos.length) return undefined;
    setGolpesNaMesa((g) => [...g, ...novos]);
    /* 10/11: os timers de saída vivem num ref e só se limpam ao desmontar.
       Limpá-los quando a lista `golpes` mudava (a cada passo do turno deles)
       deixava golpes presos na mesa — e `golpeComBorda` (um find) apanhava o
       preso, e a moldura «em ti» deixava de acender nos golpes seguintes */
    for (const n of novos) tidsDosGolpesRef.current.push(setTimeout(() => setGolpesNaMesa((g) => g.filter((x) => x.chave !== n.chave)), n.dura));
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [golpes]);
  React.useEffect(() => () => tidsDosGolpesRef.current.forEach(clearTimeout), []);
  /* o pouso solta os golpes que esperavam (o número nasce agora, com o som) */
  const tidsDoPousoRef = React.useRef([]);
  React.useEffect(() => {
    if (rolandoAgora || !esperaRef.current.length) return;
    const soltos = esperaRef.current;
    esperaRef.current = [];
    try {
      setGolpesNaMesa((g) => [...g, ...soltos.map((x) => x.v)]);
      for (const x of soltos) {
        try { tocarGolpe(x.ev); } catch { /* um som que estoura cala-se */ }
        tidsDoPousoRef.current.push(setTimeout(() => setGolpesNaMesa((g) => g.filter((y) => y.chave !== x.v.chave)), x.v.dura));
      }
    } catch (e) { console.warn("GridDeBatalha: o golpe depois do dado não pousou", e); }
  }, [rolandoAgora, golpes]);
  React.useEffect(() => () => tidsDoPousoRef.current.forEach(clearTimeout), []);
  const golpeEm = (nome) => { for (let i = golpesNaMesa.length - 1; i >= 0; i--) if (golpesNaMesa[i].alvo === nome) return golpesNaMesa[i]; return null; };
  const golpeComBorda = golpesNaMesa.find((x) => x.borda) || null;
  const golpeQueTremeAMesa = golpesNaMesa.find((x) => x.mesa) || null;

  /* ---------------- CB 6 · A QUEDA DO MEIO NÃO PÁRA A MESA ----------------
     O chip fica FECHO_DA_QUEDA.chip na casa de quem caiu e para sempre no
     registo da rodada; tocar no outro lado muda só aquela queda. */
  const quedasVistasRef = React.useRef(new Set());
  const [quedasNaMesa, setQuedasNaMesa] = React.useState([]);
  /* 19.ª sessão, defeito 5: o relógio de cada chip é DELE, e só a
     desmontagem o apaga. Antes os relógios morriam na limpeza do efeito —
     e o efeito volta a correr a cada queda nova ou a cada «matar/poupar»
     tocado: o chip da queda anterior perdia o relógio e ficava para sempre
     por cima das casas (na luta 3, C8 a E8). */
  const relogiosDasQuedasRef = React.useRef(new Map());
  React.useEffect(() => () => {
    relogiosDasQuedasRef.current.forEach((id) => clearTimeout(id));
    relogiosDasQuedasRef.current.clear();
  }, []);
  React.useEffect(() => {
    if (!Array.isArray(quedas) || !quedas.length) return undefined;
    const novas = quedas.filter((q) => q && q.chave != null && !quedasVistasRef.current.has(q.chave));
    if (!novas.length) {
      /* a mesma queda com a escolha mudada: o chip troca o texto, o relógio não recomeça */
      setQuedasNaMesa((qs) => qs.map((q) => { const n = quedas.find((x) => x && x.chave === q.chave); return n ? { ...q, escolha: n.escolha } : q; }));
      return undefined;
    }
    novas.forEach((q) => quedasVistasRef.current.add(q.chave));
    setQuedasNaMesa((qs) => [...qs, ...novas.map((q) => ({ ...q }))]);
    novas.forEach((q) => {
      const id = setTimeout(() => {
        relogiosDasQuedasRef.current.delete(q.chave);
        setQuedasNaMesa((qs) => qs.filter((x) => x.chave !== q.chave));
      }, FECHO_DA_QUEDA.chip);
      relogiosDasQuedasRef.current.set(q.chave, id);
    });
    return undefined;
  }, [quedas]);

  /* ---------------- CB 18.5 · O MOMENTO DA REAÇÃO ----------------
     Cada evento novo (pela chave) entra na mesa uma vez. O estado já está
     aplicado no 0: a superfície nova já está em `superficies`, e a onda só
     a revela anel a anel. A primeira daquele tipo na luta pausa e acende o
     clarão (tempoDaReacao), as outras e as do turno deles só fazem a onda
     curta; o movimento reduzido é corte seco. Os números dos atingidos
     nascem no fim da onda, pelo GOLPE_SENTIDO; o letreiro da primeira pousa
     no tabuleiro (o das outras é uma linha no Pé, painel-batalha.jsx).
     NADA PRENDE A ENTRADA: qualquer toque ou tecla leva ao fim, e é aceite. */
  const reacoesVistasRef = React.useRef(new Set());
  const alvosDaReacaoRef = React.useRef(new Set());
  const [reacoesNaMesa, setReacoesNaMesa] = React.useState([]);
  const tidsDasReacoesRef = React.useRef([]);
  React.useEffect(() => {
    if (!Array.isArray(reacoes) || !reacoes.length) return undefined;
    const novas = [];
    reacoes.forEach((ev, i) => {
      try {
        if (!ev || typeof ev !== "object") return;
        const chave = chaveDaReacao(ev, i);
        if (reacoesVistasRef.current.has(chave)) return;
        reacoesVistasRef.current.add(chave);
        const tempo = tempoDaReacao(ev, { reduzido: paradoAgora, deles: !!passo, acelerado });
        novas.push({ chave, ev, tempo, casas: aneisDaReacao(ev.casas, ev.origem, tempo.aneis), letreiro: letreiroDaReacao(ev), fase: "viva" });
      } catch (e) { console.warn("GridDeBatalha: a reação não se leu", e); }
    });
    if (!novas.length) return undefined;
    /* quem a reação feriu não ganha o flutuante (o número dele vem aqui) */
    alvosDaReacaoRef.current = new Set(novas.flatMap((n) => (Array.isArray(n.ev.alvos) ? n.ev.alvos : []).map((a) => a && a.nome).filter(Boolean)));
    tidsDasReacoesRef.current.push(setTimeout(() => { alvosDaReacaoRef.current = new Set(); }, 0));
    setReacoesNaMesa((r) => [...r, ...novas]);
    const heroiAgora = heroiNome || (heroiFicha && heroiFicha.nome) || "";
    for (const n of novas) {
      const alvos = (Array.isArray(n.ev.alvos) ? n.ev.alvos : []).filter((a) => a && a.nome && Number(a.dano) > 0);
      if (alvos.length) {
        tidsDasReacoesRef.current.push(setTimeout(() => {
          try {
            const vs = alvos.map((a, j) => {
              const v = variacaoDoGolpe({ tipo: "golpe", alvo: a.nome, dano: Number(a.dano), desfecho: "acerta" }, { heroi: heroiAgora });
              return v ? { ...v, chave: `reacao:${n.chave}:${j}`, alvo: a.nome } : null;
            }).filter(Boolean);
            setGolpesNaMesa((g) => [...g, ...vs]);
            for (const v of vs) tidsDasReacoesRef.current.push(setTimeout(() => setGolpesNaMesa((g) => g.filter((x) => x.chave !== v.chave)), v.dura));
          } catch (e) { console.warn("GridDeBatalha: o número da reação não pousou", e); }
        }, n.tempo.total));
      }
      tidsDasReacoesRef.current.push(setTimeout(() => setReacoesNaMesa((r) => r.map((x) => (x.chave === n.chave ? { ...x, fase: "esvai" } : x))), n.tempo.total + n.tempo.leitura));
      tidsDasReacoesRef.current.push(setTimeout(() => setReacoesNaMesa((r) => r.filter((x) => x.chave !== n.chave)), n.tempo.total + n.tempo.leitura + n.tempo.esvai));
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reacoes]);
  React.useEffect(() => () => tidsDasReacoesRef.current.forEach(clearTimeout), []);
  const reagindo = reacoesNaMesa.length > 0;
  React.useEffect(() => {
    if (!reagindo || typeof window === "undefined" || !window.addEventListener) return undefined;
    const fim = () => { try { setReacoesNaMesa([]); } catch { /* saltar nunca custa o turno */ } };
    window.addEventListener("pointerdown", fim, true);
    window.addEventListener("keydown", fim, true);
    return () => { window.removeEventListener("pointerdown", fim, true); window.removeEventListener("keydown", fim, true); };
  }, [reagindo]);
  /* §CB 18.2 · o chão que nasce fora de uma reação entra em 200 ms: o que
     a mesa já tinha no quadro anterior não volta a nascer */
  const chaoAntesRef = React.useRef(null);
  const chaveDoChao = Array.isArray(superficies) ? superficies.filter((s) => s && s.x != null && s.y != null).map((s) => `${s.x},${s.y}:${s.tipo}`).sort().join("|") : "";
  React.useEffect(() => { chaoAntesRef.current = new Set(chaveDoChao ? chaveDoChao.split("|") : []); }, [chaveDoChao]);

  /* ---------------- O DANO FLUTUA (v9.161) ----------------
     O golpe acontecia em dois lugares desligados: o número na linha do
     sistema e o anel de vida encolhendo. Agora o próprio tabuleiro diz
     QUANTO e EM QUEM — o número sobe do quadrado de quem apanhou e some.
     Escuta a MUDANÇA da vida, como o clarão do bloco do herói: a vida cai
     por golpe, veneno, área, e um efeito sobre o número pega todos. */
  const seqRef = React.useRef(0);
  const vidasRef = React.useRef(new Map());
  const [flutuantes, setFlutuantes] = React.useState([]);
  React.useEffect(() => {
    if (!combate) { vidasRef.current = new Map(); return; }
    const agora = new Map();
    const todos = [];
    const h = combate.heroi;
    if (h && h.x != null) todos.push({ ent: { ...(heroiFicha || {}), ...h }, id: "heroi" });
    (combate.aliados || []).forEach((a, i) => { const ent = { ...a, ...(grupo[i] || {}), x: a.x, y: a.y }; if (ent.x != null) todos.push({ ent, id: `al:${ent.nome || i}` }); });
    (combate.inimigos || []).forEach((e, i) => { if (e.x != null) todos.push({ ent: e, id: `in:${e.nome || i}` }); });
    const novos = [];
    /* CB 5: o número do golpe substitui o flutuante; o flutuante fica para o
       que não vem de golpe (o veneno, a área, a cura) */
    const comGolpe = new Set((Array.isArray(golpes) ? golpes : []).filter((g) => g && g.chave != null).map((g) => g.alvo));
    /* CB 18.5: quem a reação deste quadro feriu ganha o número dela, não o flutuante */
    alvosDaReacaoRef.current.forEach((nome) => comGolpe.add(nome));
    for (const { ent, id } of todos) {
      const v = Math.max(0, ent.vida || 0);
      agora.set(id, v);
      const antes = vidasRef.current.get(id);
      const nomeDele = id === "heroi" ? ((heroiFicha && heroiFicha.nome) || heroiNome) : ent.nome;
      if (antes != null && v !== antes && !(v < antes && comGolpe.has(nomeDele))) {
        const delta = v - antes;
        novos.push({
          chave: seqRef.current++,
          x: ent.x + ladoDe(ent) / 2, y: ent.y + 0.22,
          texto: delta > 0 ? `+${delta}` : `${delta}`,
          cor: delta > 0 ? T.ok : "#FF9A85",
        });
      }
    }
    vidasRef.current = agora;
    if (novos.length) {
      setFlutuantes((f) => [...f, ...novos]);
      const chaves = new Set(novos.map((n) => n.chave));
      const tid = setTimeout(() => setFlutuantes((f) => f.filter((x) => !chaves.has(x.chave))), 1400);
      return () => clearTimeout(tid);
    }
  }, [combate]);

  /* ---------------- A FAIXA DO CHEFE (v9.161) ----------------
     A virada já valia (v9.151: ameaça, defesa, capangas ou vida — números
     que o sistema aplica) e já saía como linha no chat. Mas a linha rola
     para cima com o resto; o MOMENTO merece o palco. `viradasFeitas`
     guarda o limiar cruzado, e o nome do chefe reabre a mesma tabela
     determinística — a faixa não decide nada, anuncia o que foi feito. */
  const viradasRef = React.useRef(null);
  const [faixa, setFaixa] = React.useState(null);
  React.useEffect(() => {
    const lista = (combate && combate.inimigos) || [];
    /* na primeira leitura só se memoriza: uma luta retomada de um save no
       meio da segunda fase não pode reanunciar a virada antiga */
    if (viradasRef.current == null) {
      viradasRef.current = new Map(lista.map((e) => [e.nome, (e.viradasFeitas || []).length]));
      return;
    }
    for (const e of lista) {
      const n = (e.viradasFeitas || []).length;
      const antes = viradasRef.current.get(e.nome) || 0;
      viradasRef.current.set(e.nome, n);
      if (n > antes) {
        const limiar = (e.viradasFeitas || [])[n - 1];
        const fase = fasesDoChefe(e.nome).find((x) => x.em === limiar);
        const v = viradaPorId(fase && fase.virada);
        /* v9.172: a vida vai junto. `mesa-combate-v2` põe a barra do chefe
           dentro da faixa — anunciar "ele endureceu" sem dizer quanto falta
           é meia notícia, e é a metade menos útil das duas. */
        setFaixa({ nome: e.nome, diz: v.diz, nota: v.nota, vida: e.vida, vidaMax: e.vidaMax, chave: seqRef.current++ });
        const tid = setTimeout(() => setFaixa(null), 3200);
        return () => clearTimeout(tid);
      }
    }
  }, [combate]);
  /* ---------------- ANDAR OU MIRAR (v9.41) ----------------
     O toque no quadrado passou a querer dizer duas coisas, e duas coisas
     sem aviso é ambiguidade. Então há um modo, e ele diz na cara qual é:
     sem habilidade selecionada só existe andar; com uma habilidade de
     área selecionada, o tabuleiro abre já mirando, porque quem acabou de
     escolher Bola de Fogo quer dizer ONDE ela cai, não dar dois passos. */
  /* ---------------- SÓ A ÁREA SE MIRA (v9.128) ----------------
     Achado jogando: com Projétil Arcano selecionado — alvo único, sem área —
     o tabuleiro abria o modo de mirar e deixava marcar quadrados à frente do
     inimigo. O ponto não fazia nada: o disparo só lê a mira quando a
     habilidade tem forma. Marcar um lugar que o sistema ignora é pior do que
     não poder marcar: o jogador acha que decidiu onde a magia cai.

     O ALCANCE continua aparecendo para as duas — é informação, e é o que
     responde "daqui eu acerto?". Mirar, não: isso é das que têm forma. */
  const podeMirar = !!(alcanceMira && alcanceMira.area && alcanceMira.tamanho && onMirar);
  const [modo, setModo] = React.useState("andar");
  React.useEffect(() => { setModo(podeMirar ? "mirar" : "andar"); }, [podeMirar, alcanceMira && alcanceMira.nome]);
  const mirando = podeMirar && modo === "mirar";
  const [sobre, setSobre] = React.useState(null);
  /* E2: a casa sob o FOCO DO TECLADO acende a régua pelo mesmo caminho da
     casa sob o dedo — são o mesmo gesto em dois aparelhos, e uma régua que
     só responde ao rato deixa sem endereço exatamente quem mais precisa
     dele. O foco ganha do rato quando os dois apontam: quem está a tabular
     não tirou a mão de onde estava. */
  const [focada, setFocada] = React.useState(null);
  /* A POSIÇÃO LEMBRADA DO CURSOR (E4). `com foco` diz onde o teclado
     ESTÁ; `a paragem` diz onde ele VOLTA. Nunca acendem na mesma casa, e
     há no máximo uma de cada no tabuleiro inteiro — sem ela, o jogador
     não sabe onde vai cair quando voltar com o `Tab`. */
  const [paragem, setParagem] = React.useState(null);
  /* os `<rect>` por chave, para que a seta possa dar o foco à vizinha.
     A chave leva o tamanho junto porque os DOIS tabuleiros — o compacto e
     o de tela cheia — podem estar montados ao mesmo tempo, e sem isso o
     segundo apagaria as casas do primeiro do mapa. */
  const casasRef = React.useRef(new Map());
  const [andando, setAndando] = React.useState(null);

  const grade = combate && combate.grade ? combate.grade : null;
  const g = garantirGrade(grade);
  const heroi = combate && combate.heroi;

  /* O PASSO DESENHADO (v9.125): `caminhar` sempre devolveu o caminho e nada
     olhava para ele — o x,y do herói trocava e a ficha aparecia do outro
     lado do salão. Aqui o caminho é refeito entre onde ele estava e onde
     ele está, e a ficha o percorre quadrado a quadrado. É a mesma busca,
     determinística: mesma origem, mesmo destino e mesmos ocupados devolvem
     a mesma rota que o sistema cobrou.

     Só o herói ganha rota; os outros deslizam em linha reta pela transição
     do CSS. Um inimigo anda um ou dois quadrados por rodada, e para isso a
     reta é indistinguível do caminho. */
  const antesRef = React.useRef(null);
  const posHeroi = heroi && heroi.x != null ? K(heroi.x, heroi.y) : "";
  React.useEffect(() => {
    if (!heroi || heroi.x == null || !grade) { antesRef.current = null; return; }
    const antes = antesRef.current;
    antesRef.current = { x: heroi.x, y: heroi.y };
    if (!antes || (antes.x === heroi.x && antes.y === heroi.y)) return;
    const de = { ...heroi, x: antes.x, y: antes.y };
    const alvo = { x: heroi.x, y: heroi.y };
    const ocup = ocupacaoDe([...((combate && combate.inimigos) || []), ...((combate && combate.aliados) || [])], heroi);
    const tenta = (semDificil) => caminhar(grade, de, alvo, { ocupados: ocup, deslocamentoM: 999, ignoraDificil: semDificil });
    const r = (() => { const a = tenta(ignoraDificil); return a.ok ? a : tenta(true); })();
    const rota = r.ok ? [antes, ...r.caminho] : [antes, alvo];
    const ms = Math.max(55, Math.min(110, Math.round(420 / rota.length)));
    let i = 0;
    setAndando({ rota, i: 0, ms });
    const id = setInterval(() => {
      i += 1;
      if (i >= rota.length) { clearInterval(id); setAndando(null); }
      else setAndando({ rota, i, ms });
    }, ms);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posHeroi]);

  /* ---------------- CB 17.2 · O PASSO DELES ----------------
     A ficha de quem age desliza pelo caminho a TURNO_DELES.porCasa por casa,
     com teto de andarTeto (a metade com 2×). Com movimento reduzido salta
     para o destino (o caminho fica desenhado o passo inteiro). O estado já
     está aplicado: isto é só leitura do que aconteceu. */
  const kpAgora = chaveDoPasso(passo);
  const [andaDeles, setAndaDeles] = React.useState(null);
  React.useEffect(() => {
    const cam = passo && Array.isArray(passo.caminho) ? passo.caminho.filter((q) => q && q.x != null) : [];
    if (cam.length < 2 || movimentoParado()) { setAndaDeles(null); return undefined; }
    const ms = Math.max(1, Math.round(Math.min(TURNO_DELES.porCasa, TURNO_DELES.andarTeto / (cam.length - 1)) * (acelerado ? TURNO_DELES.acelerado : 1)));
    /* lê o relógio, não conta tiques (D5e): numa aba de fundo a ficha salta
       para a casa em que já devia estar */
    const inicio = Date.now();
    setAndaDeles({ chave: kpAgora, rota: cam, i: 0, ms });
    const id = setInterval(() => {
      const i = Math.floor((Date.now() - inicio) / ms);
      if (i >= cam.length) { clearInterval(id); setAndaDeles({ chave: kpAgora, rota: cam, i: cam.length - 1, ms }); }
      else setAndaDeles({ chave: kpAgora, rota: cam, i, ms });
    }, ms);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kpAgora]);

  if (!g) return null;

  const aliados = ((combate.aliados) || []).map((a, i) => ({ ...a, ...(grupo[i] || {}), x: a.x, y: a.y }));
  const inimigos = ((combate.inimigos) || []).filter((e) => !e.derrotado && (e.vida || 0) > 0);
  const colados = heroi ? adjacentes(heroi, inimigos) : [];
  const ocupados = ocupacaoDe([...inimigos, ...aliados], heroi);
  /* O CONJUNTO E O PREÇO SÃO A MESMA BUSCA (E4). `alcancaveisDe` sempre
     teve o custo de cada casa na mão e deitava-o fora na última linha;
     `custosDe` é ela sem esse desperdício. O número do `jogo`: em SEIS
     das dez plantas o custo real diverge 100 % do que o olho conta,
     porque o herói ABRE dentro da lama — o passo cai de ~83 casas para
     27 no primeiro fotograma, e o único sinal era o véu ser menor. */
  const custoDoPasso = (heroi && podeMover && !mirando) ? custosDe(grade, heroi, { ocupados, deslocamentoM: passoM, ignoraDificil }) : new Map();
  const podeIr = new Set(custoDoPasso.keys());
  /* A1 · A EMENDA À LEI DE E4 (`formas.md` §A1 6): o número escreve-se onde
     SURPREENDE — custo ≠ o que o olho conta —, e sempre sob o dedo. A área
     de movimento (o tracejado e o véu de fora) diz o alvo; o número diz a
     exceção. A conta é pura (`casasQueSurpreendem`, glifos.js) e lê o MESMO
     mapa que a área. */
  const surpreendem = (() => { try { return casasQueSurpreendem(custoDoPasso, heroi); } catch (e) { return new Set(custoDoPasso.keys()); } })();
  const naArea = new Set(((previsao && previsao.quadrados) || []).map((q) => K(q.x, q.y)));
  /* CB 4 · as intenções, por inimigo; as casas do sopro; quem é o alvo */
  /* CB 17.2: no turno deles a intenção de quem age e a de quem já agiu saem
     da mesa (cumpriu-se; o dado e o caminho dizem-no agora) */
  const jaCumpriu = new Set([...(Array.isArray(agiram) ? agiram.map(String) : []), ...(passo && passo.quem ? [String(passo.quem)] : [])]);
  const intencaoDe = new Map((Array.isArray(intencoes) ? intencoes : []).filter((i) => i && i.inimigo && i.vista && !jaCumpriu.has(i.inimigo)).map((i) => [i.inimigo, i.vista]));
  const casasDoSopro = new Set();
  for (const v of intencaoDe.values()) if (v.tipo === "sopro" && Array.isArray(v.area)) v.area.forEach((q) => casasDoSopro.add(K(q.x, q.y)));
  const alvoDaPrevisao = previsaoDoGolpe && previsaoDoGolpe.alvo ? String(previsaoDoGolpe.alvo) : "";
  const pontosDoCaminho = caminho && Array.isArray(caminho.pontos) ? caminho.pontos.filter((q) => q && q.x != null) : [];
  const golpeLivreEm = new Set((caminho && Array.isArray(caminho.golpeLivreEm) ? caminho.golpeLivreEm : []).map((q) => K(q.x, q.y)));
  const caidosComCasa = ((combate.inimigos) || []).filter((e) => e && e.x != null && (e.derrotado || (e.vida || 0) <= 0));
  const noAlcance = (alcanceMira && alcanceMira.quadrados) || new Set();
  /* CB 17.2 · quem age, quem já agiu e onde cada um se vê durante o passo:
     quem age no caminho (no começo dele antes de deslizar), quem ainda não
     agiu na casa de onde parte (`porVir`), os outros onde o estado os pôs */
  const quemAge = passo && passo.quem ? String(passo.quem) : "";
  const camDoPasso = passo && Array.isArray(passo.caminho) ? passo.caminho.filter((q) => q && q.x != null) : [];
  const porVir = new Map((passo && Array.isArray(passo.porVir) ? passo.porVir : []).filter((x) => x && x.quem && x.de && x.de.x != null && x.quem !== quemAge).map((x) => [String(x.quem), x.de]));
  const ondeEsta = (ent) => {
    if (!ent || ent.x == null) return ent;
    if (quemAge && ent.nome === quemAge && camDoPasso.length > 1 && !paradoAgora) {
      const q = andaDeles && andaDeles.chave === kpAgora ? andaDeles.rota[andaDeles.i] : camDoPasso[0];
      return q ? { x: q.x, y: q.y } : ent;
    }
    const pv = porVir.get(ent.nome);
    return pv ? { x: pv.x, y: pv.y } : ent;
  };
  const msDoPasso = (ent) => (quemAge && ent && ent.nome === quemAge && andaDeles && andaDeles.chave === kpAgora ? andaDeles.ms : 260);
  /* o sopro de quem age pulsa (as casas do passo); o vazio apaga-se */
  const soproDoPasso = passo && passo.tipo === "sopro" && passo.intencao !== "perdido" && Array.isArray(passo.area) ? passo.area.filter((q) => q && q.x != null) : [];

  /* quem ocupa cada quadrado — o rótulo fica no canto superior esquerdo de
     quem ocupa mais de um, que é onde a ficha é desenhada */
  const mapa = new Map();
  const poe = (ent, tipo, cor) => {
    if (!ent || ent.x == null) return;
    quadradosDe(ent).forEach((q, i) => mapa.set(K(q.x, q.y), { ent, tipo, cor, chefe: i === 0 }));
  };
  aliados.forEach((a) => { if ((a.vida || 0) > 0) poe(a, "aliado", T.ok); });
  inimigos.forEach((e) => poe(e, "inimigo", T.danger));
  poe(heroi, "heroi", T.amber);

  /* A ROTA ANTES DO CLIQUE: passar o cursor por um quadrado alcançável
     mostra por onde se vai e quanto custa. No dedo não existe passar por
     cima, e é por isso que isto é enfeite e não muleta — a informação que
     decide (dá para chegar? custa golpe livre?) continua no contorno e na
     tarja de cima, que existem nos dois. */
  const rotaPrevista = (() => {
    if (!sobre || mirando || !heroi || andando) return null;
    if (!podeIr.has(K(sobre.x, sobre.y))) return null;
    const r = caminhar(grade, heroi, sobre, { ocupados, deslocamentoM: passoM, ignoraDificil });
    return r.ok ? { pontos: [heroi, ...r.caminho], custoM: r.custoM } : null;
  })();

  const paredes = [], dificeis = [], coberturas = [], estorvos = [];
  for (let y = 0; y < g.altura; y++) for (let x = 0; x < g.largura; x++) {
    if (ehParede(grade, x, y)) { paredes.push([x, y]); continue; }
    if (ehEstorvo(grade, x, y)) estorvos.push([x, y]);
    if (terrenoDificil(grade, x, y)) dificeis.push([x, y]);
    else if (temCobertura(grade, x, y)) coberturas.push([x, y]);
  }
  const setParedes = new Set(paredes.map(([x, y]) => K(x, y)));
  /* ---------------- CB 18 · O CHÃO, O DEGRAU E O CENÁRIO ----------------
     Props ausentes = a mesa de hoje: sem alturas não há degrau, sem
     superfícies não há mancha, sem objetos o estorvo é o genérico. */
  const degraus = (() => { try { return patamares(alturas); } catch (e) { console.warn("GridDeBatalha: os degraus não se leram", e); return []; } })();
  const manchas = (() => { try { return manchasDoChao(superficies, new Set(mapa.keys())); } catch (e) { console.warn("GridDeBatalha: o chão não se leu", e); return []; } })();
  const manchaEm = new Map();
  manchas.forEach((m) => m.casas.forEach((q) => manchaEm.set(K(q.x, q.y), m)));
  const objetosNaMesa = Array.isArray(objetos) ? objetos.filter((o) => o && o.x != null && o.y != null) : [];
  const objetoEm = new Map(objetosNaMesa.map((o) => [K(o.x, o.y), o]));
  const sobeEm = (ent) => { try { return ent && ent.x != null ? subidaDaFicha(alturas, ent.x, ent.y) : 0; } catch { return 0; } };
  const campoDaCasa = (x, y) => { try { return campoDoChao({ nivel: alturaDe(alturas, x, y), superficie: manchaEm.get(K(x, y)) || null, objeto: objetoEm.get(K(x, y)) || null }); } catch { return ""; } };
  /* apontar um objeto mostra o que ele faria (§CB 18.3) */
  const objetoApontado = (sobre && objetoEm.get(K(sobre.x, sobre.y))) || null;
  const previsaoDoObjeto = objetoApontado ? (() => { try { return previsaoDoObjetoNaMesa(objetoApontado); } catch { return null; } })() : null;
  const casasDoObjeto = new Set(previsaoDoObjeto ? previsaoDoObjeto.casas.map((q) => K(q.x, q.y)) : []);
  /* §CB 18.4 a · o empurrão armado sobre um alvo: a seta, o fantasma, os rótulos */
  const emp = empurrao && typeof empurrao === "object" && empurrao.previsao && typeof empurrao.previsao === "object" ? empurrao : null;
  const alvoDoEmpurrao = emp ? (inimigos.find((e) => e.nome === emp.alvo) || aliados.find((a) => a.nome === emp.alvo) || null) : null;
  const deDoEmpurrao = alvoDoEmpurrao && alvoDoEmpurrao.x != null ? { x: alvoDoEmpurrao.x, y: alvoDoEmpurrao.y } : (emp && emp.de) || null;
  const setaDoEmp = emp ? (() => { try { return setaDoEmpurrao(deDoEmpurrao, emp.previsao.para, !!emp.previsao.colideCom); } catch { return null; } })() : null;
  const rotulosDoEmp = emp ? (() => { try { return rotulosDoEmpurrao(emp.previsao, { vida: alvoDoEmpurrao ? alvoDoEmpurrao.vida : null }); } catch { return null; } })() : null;
  /* §CB 18.4 c · o caminho que atravessa perigo */
  const caminhoPerigoso = pontosDoCaminho.length > 1 && caminho && Array.isArray(caminho.perigos) && caminho.perigos.length
    ? (() => { try { return trocosDoCaminho(pontosDoCaminho, caminho.perigos); } catch { return null; } })() : null;
  /* §CB 18.5 · as casas da onda (a reação viva mais recente ganha) e o
     chão que nasce fora dela */
  const ondaEm = new Map();
  reacoesNaMesa.forEach((r) => { if (r.tempo.porAnel > 0) r.casas.forEach((q) => ondaEm.set(K(q.x, q.y), { anel: q.anel, tempo: r.tempo })); });
  const chaoAntes = chaoAntesRef.current;

  /* o que este turno alcança — o passo, ou o alcance da habilidade quando se
     está mirando. O quadrado de quem olha entra junto: ninguém precisa de
     véu por cima de si mesmo. */
  const alcance = new Set(mirando ? noAlcance : podeIr);
  if (alcance.size && heroi && heroi.x != null) quadradosDe(heroi).forEach((q) => alcance.add(K(q.x, q.y)));
  /* o mesmo conjunto sem buracos serve ao véu e ao contorno: sem isso a
     ficha do inimigo dentro do seu passo ficava sentada numa mancha escura,
     porque o quadrado dele não é "alcançável" — não dá para parar em cima
     dele — embora esteja bem debaixo do seu nariz. */
  const alcanceCheio = alcance.size ? semBuracos(alcance, g.largura, g.altura) : alcance;
  const veu = [];
  if (alcance.size) for (let y = 0; y < g.altura; y++) for (let x = 0; x < g.largura; x++) if (!alcanceCheio.has(K(x, y))) veu.push([x, y]);

  const viaDoCaminho = (pontos) => pontos.map((p, i) => `${i ? "L" : "M"}${p.x + 0.5} ${p.y + 0.5}`).join(" ");

  /* E2: a casa apontada — pelo foco do teclado antes do rato, porque quem
     tabula não tirou a mão de onde estava. É ela que acende a coluna e a
     linha da régua, e é o único gatilho de `realcada` que existe hoje. */
  const apontada = focada || sobre;

  /* ONDE O CURSOR DE TECLADO VOLTA (E4). A casa lembrada, presa dentro do
     campo — uma planta menor que a anterior deixaria o cursor fora do
     tabuleiro, e um `tabIndex=0` numa casa que não existe é a grelha sem
     porta de entrada nenhuma.

     O PADRÃO É O HERÓI, e não a casa A1: quem entra na grelha pela
     primeira vez entra por onde está, que é de onde ele ia querer andar.
     É a mesma decisão do enquadramento de entrada, um andar abaixo. */
  const casaDaParagem = (() => {
    const cabe = (c) => !!c && c.x >= 0 && c.y >= 0 && c.x < g.largura && c.y < g.altura;
    if (cabe(paragem)) return paragem;
    if (heroi && heroi.x != null && cabe({ x: heroi.x, y: heroi.y })) return { x: heroi.x, y: heroi.y };
    return { x: 0, y: 0 };
  })();

  /* O LADO DA CASA, EM PIXELS — a mesma conta que o `maxWidth` abaixo faz
     em CSS, refeita aqui em número porque `N = ceil(30 / lado)` precisa
     dela. No compacto o teto é a altura (380 px de campo) com um chão de
     40 px por casa; no ampliado é `min(94vw, 68·L/A vh)`, e o vw/vh saem
     da janela.

     É honesta em vez de medida, e o preço está escrito: não há ref nem
     observador de tamanho, então virar o telefone só muda QUANTOS rótulos
     aparecem até ao render seguinte — nunca o endereço de casa nenhuma. */
  /* B1 · A CASA ENCHE A JANELA. Com `larguraDaJanela` medida, o lado é a
     largura útil (sem a calha da régua) ÷ colunas — nunca abaixo do
     `ladoFixo`, que é o piso do alvo. Sem ela, é o `ladoFixo` de sempre. A
     casa continua QUADRADA: a distância do jogo é por casa, e uma casa
     retangular (as 62 × 51 do quadro) mentiria a distância. */
  /* B1b · E O TABULEIRO INTEIRO NA CAIXA. Com `alturaDaJanela` medida (só o
     monitor a passa), o lado é o MENOR entre a largura útil ÷ colunas e a
     altura útil ÷ linhas — a calha da régua sai das duas, porque ela mora
     em cima e à esquerda —, com `tetoDoLado` por cima e `ladoFixo` por
     baixo. O piso ganha sempre: abaixo dele é a janela que rola. Sem altura
     (o telefone), é a conta de B1, byte a byte. */
  const ladoPelaLargura = larguraDaJanela > 0 ? Math.floor((larguraDaJanela - CALHA_DA_REGUA) / g.largura) : Infinity;
  const ladoPelaAltura = alturaDaJanela > 0 ? Math.floor((alturaDaJanela - CALHA_DA_REGUA) / g.altura) : Infinity;
  const ladoNaJanela = ladoFixo > 0 && larguraDaJanela > 0
    ? Math.max(ladoFixo, Math.min(tetoDoLado > 0 ? tetoDoLado : Infinity, ladoPelaLargura, ladoPelaAltura))
    : ladoFixo;
  const ladoEmPx = (grande) => {
    try {
      if (!grande) return ladoFixo > 0 ? ladoNaJanela : Math.min(40, 380 / g.altura);
      const vw = (typeof window !== "undefined" && window.innerWidth) || 1280;
      const vh = (typeof window !== "undefined" && window.innerHeight) || 860;
      return Math.min(0.94 * vw, (Math.round((68 * g.largura) / g.altura) * vh) / 100) / g.largura;
    } catch { return 40; }
  };

  const tabuleiro = (grande) => {
    /* O COMPACTO CONTINUA SENDO UM RELANCE (v9.125): a malha antiga travava o
       quadrado entre 9 e 18 px e ficava pequena demais para o dedo; deixar o
       SVG crescer à vontade cai no defeito oposto, que a v9.34 já tinha
       diagnosticado — um tabuleiro de 16×16 com 34 px de lado empurra a
       narração para fora da tela. Então o teto é a ALTURA: 320 px de campo,
       e o quadrado fica com o que sobrar. A tela cheia é que serve o dedo. */
    /* v9.161: o campo compacto cresceu de 320 para 380 px de teto — o
       combate é o momento mais tenso da mesa e era o painel mais espremido
       dela. `position: relative` é o chão da faixa do chefe. */
    const larguraDoCampo = grande ? `min(94vw, ${Math.round((68 * g.largura) / g.altura)}vh)` : g.largura * ladoEmPx(false);
    /* §CB 16.3: com a régua PRESA (o telefone) não há calha — as letras e os
       números desenham-se por cima das casas, colados ao topo e à esquerda
       da janela, e a câmara mede a janela inteira. Na vista ⤢ a régua
       continua na calha de sempre. */
    const presa = reguaPresa && !grande;
    const calha = presa ? B3.telefone.calha : CALHA_DA_REGUA;
    /* rotula uma a cada N; as outras levam só um traço. Na mesa (48 px)
       N = 1; no aperto máximo que existe — 18 colunas em 375 px, 18,8 px
       de lado — N = 2. A letra nunca precisa de sair. */
    const passoDoRotulo = Math.max(1, Math.ceil(LADO_QUE_CABE_UM_ROTULO / Math.max(1, ladoEmPx(grande))));
    /* B1 · UM PÍXEL DE TELA EM UNIDADES DA GRELHA. O chão do quadro é medido
       em píxeis (o traço de 2 px da casa do herói, o nome da zona a 11 px),
       e o SVG mede em casas: dividir pelo lado REAL é o que mantém o traço
       com 2 px numa casa de 48 e numa de 62. Dividir pelo piso, como antes,
       engrossava tudo assim que a casa crescia. */
    const px = 1 / Math.max(1, ladoEmPx(grande));
    /* a zona onde o herói está acende no chão, como acende no topo do campo */
    const zonaDoHeroi = heroi && heroi.x != null ? nomeDoLugar(grade, heroi.x, heroi.y) : "";
    /* a textura do quadro — só a planta que a pessoa desenhou tem uma */
    const chao = TERRENO_DO_TABULEIRO[g.cenario] || null;
    const parado = movimentoParado();
    /* O NÚMERO SÓ SE ESCREVE ONDE ELE SE LÊ. Era "abaixo do piso do alvo,
       nada", porque o corpo escalava com a casa (numa casa de 24 px o 10
       virava 5). Desde B1 o corpo é dado em píxeis de TELA (o SVG divide
       pelo lado real): o número tem 11 px em qualquer casa, e "13,5" em
       mono 11 mede ~27 px. B1b: logo o piso que decide é o piso da casa
       que a tela impôs — 32 no monitor, 48 no telefone —, e o relance sem
       piso imposto continua na regra de sempre (`ALVOS.piso`). */
    const escreveOCusto = !mirando && custoDoPasso.size > 0 && ladoEmPx(grande) >= (ladoFixo > 0 ? ladoFixo : ALVOS.piso);
    /* a chave do mapa de casas leva o tamanho: os dois tabuleiros podem
       estar montados ao mesmo tempo, e sem isto o de tela cheia apagaria
       as casas do compacto do mapa — e a seta daria o foco ao invisível */
    const chaveDoFoco = (x, y) => `${grande ? "g" : "c"}:${K(x, y)}`;
    /* AS SETAS ANDAM POR DENTRO. Presas ao campo de propósito: um cursor
       que dá a volta pelo outro lado faz o jogador perder a noção de onde
       está num tabuleiro que ele não vê inteiro. */
    const andarComTecla = (ev, x, y) => {
      const d = TECLAS_DA_GRELHA[ev.key];
      if (!d) return false;
      ev.preventDefault();
      const nx = d.aoInicioDaLinha ? 0 : d.aoFimDaLinha ? g.largura - 1 : x + (d.dx || 0);
      const ny = d.aoTopo ? 0 : d.aoFundo ? g.altura - 1 : y + (d.dy || 0);
      const px = Math.max(0, Math.min(g.largura - 1, nx));
      const py = Math.max(0, Math.min(g.altura - 1, ny));
      const el = casasRef.current.get(chaveDoFoco(px, py));
      /* o foco chega pela TECLA, e por isso `:focus-visible` acende — um
         `.focus()` disparado fora de um evento de teclado não acende, e
         foi assim que a medição de E3 se enganou a si própria */
      if (el && el.focus) el.focus();
      return true;
    };
    const grauDaColuna = (x) => (apontada && apontada.x === x ? "realcada" : "repouso");
    const grauDaLinha = (y) => (apontada && apontada.y === y ? "realcada" : "repouso");
    return (
    /* A CALHA: o canto, as letras em cima, os números à esquerda, e o campo
       no quadrante que sobra. O `maxWidth` cresce os 22 px da calha para
       que o tabuleiro fique do mesmo tamanho que tinha antes dela. */
    <div style={{ display: "grid", gridTemplateColumns: `${calha}px 1fr`, gridTemplateRows: `${calha}px auto`,
      /* com lado imposto a caixa NÃO encolhe: é a janela que corta o campo,
         e é o rolador do pai que mostra o resto. Sem ele, `width: 100%`
         devolveria a casa ao tamanho do buraco — o defeito que E1 mediu. */
      width: !grande && ladoFixo > 0 ? larguraDoCampo + calha : "100%",
      flexShrink: 0,
      maxWidth: grande ? `calc(${larguraDoCampo} + ${CALHA_DA_REGUA}px)` : larguraDoCampo + calha, margin: "0 auto", background: T.bg }}>
      {/* o canto é `bg` e não leva rótulo: `A1` não se escreve duas vezes */}
      <div aria-hidden="true" style={presa ? { position: "sticky", top: 0, left: 0, zIndex: 4 } : undefined} />
      {/* presa: a faixa tem altura zero na grelha e a régua pende dela por
          cima da primeira fila (e da primeira coluna), sem apanhar toque */}
      <div aria-hidden="true" style={presa ? { position: "sticky", top: 0, zIndex: 3, height: 0, overflow: "visible", pointerEvents: "none" } : { display: "flex", alignItems: "stretch" }}>
        <div style={presa ? { display: "flex", alignItems: "stretch", height: CALHA_DA_REGUA } : { display: "contents" }}>
          {Array.from({ length: g.largura }).map((_, x) => (
            <RotuloDaRegua key={`rc${x}`} coluna canto={presa} parado={parado} grau={grauDaColuna(x)}
              texto={x % passoDoRotulo === 0 ? (LETRAS_DA_GRADE[x] || "") : ""} />
          ))}
        </div>
      </div>
      <div aria-hidden="true" style={presa ? { position: "sticky", left: 0, zIndex: 3, width: 0, overflow: "visible", pointerEvents: "none" } : { display: "flex", flexDirection: "column", alignItems: "stretch" }}>
        <div style={presa ? { display: "flex", flexDirection: "column", alignItems: "stretch", width: CALHA_DA_REGUA, height: "100%" } : { display: "contents" }}>
          {Array.from({ length: g.altura }).map((_, y) => (
            <RotuloDaRegua key={`rn${y}`} coluna={false} canto={presa} parado={parado} grau={grauDaLinha(y)}
              texto={y % passoDoRotulo === 0 ? String(y + 1) : ""} />
          ))}
        </div>
      </div>
      {/* e o campo, no quadrante que sobra. `position: relative` é o chão
          da faixa do chefe, e continua a ser. */}
      <div className={golpeQueTremeAMesa ? "tv-golpe-mesa" : undefined} style={{ position: "relative", width: "100%", aspectRatio: `${g.largura} / ${g.altura}` }}>
      {faixa && (
        /* v9.172 (`mesa-combate-v2`): a faixa deixa de ser um letreiro
           centrado e vira o CABEÇALHO do chefe — nome em vermelho de perigo à
           esquerda, o selo da ameaça à direita, e a barra de vida embaixo
           atravessando a largura toda. O degradê some: o desenho usa o fundo
           escuro da casa com uma borda, que deixa o tabuleiro visível por
           trás em vez de apagá-lo no meio da luta. */
        <div className="tv-faixa" style={{ position: "absolute", left: 0, right: 0, top: 0, pointerEvents: "none", zIndex: 5 }}>
          <div className="px-4 pt-3 pb-2.5" style={{ background: "linear-gradient(175deg, rgba(14,12,21,0.94) 25%, rgba(23,19,34,0.75) 60%, rgba(14,12,21,1) 75%)", borderBottom: `1px solid ${T.line}` }}>
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="min-w-0">
                <div className="tv-display" style={{ color: T.danger, fontSize: "clamp(15px, 2.6vw, 24px)", fontWeight: 700, lineHeight: 1.1 }}>{faixa.nome} {faixa.diz}</div>
                <div className="tv-mono text-[10px] uppercase tracking-[1px] mt-1" style={{ color: T.inkDim }}>{faixa.nota}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <IconeEscudoAlerta tamanho={14} />
                <span className="tv-mono text-[11px]" style={{ color: T.ink, fontWeight: 700 }}>AMEAÇA CRÍTICA</span>
              </div>
            </div>
            <div className="h-2 rounded overflow-hidden w-full" style={{ background: "rgba(46,39,69,0.48)" }}>
              <div className="h-full" style={{ width: `${Math.max(0, Math.min(100, (faixa.vida / (faixa.vidaMax || 1)) * 100))}%`, background: T.danger }} />
            </div>
          </div>
        </div>
      )}
      {/* E1/E2: o fundo do campo era `#141020`, um literal que não passou por
          decisão de tema nenhuma. Em `T.bg` a diferença é invisível a olho nu
          e paga duas coisas de uma vez: sai um literal da contagem, e o vão de
          2 px do anel de foco — que sobre `#141020` dava 1,04:1 e simplesmente
          não se separava do fundo — volta a funcionar como foi desenhado. */}
      <svg viewBox={`0 0 ${g.largura} ${g.altura}`} style={{ width: "100%", height: "100%", display: "block", borderRadius: 10, background: T.bg, border: `1px solid ${T.line}` }}>
        <defs>
          {/* B1: as "Hachuras da areia" do quadro — o fio âmbar a 0,125, a
              37,5°, com o passo medido em píxeis. Era um castanho literal a
              0,30, mais grosso e mais denso. */}
          <pattern id="tv-lama" width={MB.chao.passoDaHachura * px} height={MB.chao.passoDaHachura * px} patternUnits="userSpaceOnUse" patternTransform={`rotate(${MB.chao.anguloDaHachura})`}>
            <line x1="0" y1="0" x2="0" y2={MB.chao.passoDaHachura * px} stroke={T.amber} strokeOpacity={MB.alfa.hachura} strokeWidth={MB.chao.malha * px} />
          </pattern>
          {/* CB 18.2: o padrão de cada superfície, uma casa por ladrilho */}
          {manchas.length > 0 && <PadroesDoChao />}
        </defs>

        {/* AS REGIÕES SÃO O VOCABULÁRIO DO MESTRE (v9.125): ele narra "no vão
            da porta", nunca "quadrado 3,8". Antes o nome só existia no balão
            de ajuda; agora está escrito no chão, e o jogador lê a cena com as
            mesmas palavras que vai ouvir de volta. */}
        {/* B1 · O CHÃO DO QUADRO. A textura (só onde a pessoa a desenhou —
            `TERRENO_DO_TABULEIRO`) e, por cima dela, o "Véu noturno" do
            quadro: `bg` a 0,73. A imagem corta como o quadro corta (`slice`):
            o campo nunca estica a areia. */}
        {chao && (
          <g style={{ pointerEvents: "none" }}>
            <image href={chao} x="0" y="0" width={g.largura} height={g.altura} preserveAspectRatio="xMidYMid slice" />
            <rect x="0" y="0" width={g.largura} height={g.altura} fill={T.bg} opacity={MB.alfa.veuDoTerreno} />
          </g>
        )}
        {g.regioes.map((r, i) => {
          const acesa = r.nome === zonaDoHeroi;
          return (
          <g key={r.nome + i}>
            {/* a zona do herói acende no chão (B1: "Areia solta", o âmbar a
                0,08) — a mesma que acende no topo do campo. As outras ficam
                no chão como está: a alternância de faixas que havia aqui era
                um branco literal a 0,016 que a textura apaga. */}
            {acesa && (
              <rect x={r.x0} y={r.y0} width={r.x1 - r.x0 + 1} height={r.y1 - r.y0 + 1}
                fill={T.amber} opacity={MB.alfa.zonaAcesa} />
            )}
            {/* no canto da faixa, e não no meio dela: o meio é onde as fichas
                andam, e um nome de lugar por baixo de um inimigo não é nome
                nenhum. No canto ele fica como legenda de planta baixa. B1:
                na PRIMEIRA LINHA da zona, a 18 px da borda, mono 11 espaçado —
                âmbar a da zona do herói, violeta as outras, como no quadro. */}
            <text className="tv-mono" x={r.x0 + MB.chao.recuoDoNome * px} y={r.y0 + 0.5} textAnchor="start" dominantBaseline="central"
              fill={acesa ? T.amberSoft : T.violetSoft} opacity={acesa ? MB.alfa.nomeDaZonaAcesa : MB.alfa.nomeDaZona}
              style={{ fontSize: Math.min(MB.chao.corpoDoNome * px, (r.x1 - r.x0 + 1) / (r.nome.length * 0.75)), pointerEvents: "none", textTransform: "uppercase", letterSpacing: MB.chao.rastreioDoNome * px }}>
              {r.nome}
            </text>
          </g>
          );
        })}

        {/* CB 18.1 · O DEGRAU, por baixo de tudo o que é chão: o lume (`ink`
            a 6 ou 10 %) e a face (`pagina`) na borda de baixo que dá para uma
            casa mais baixa. Decoração: quem leva a informação é a aresta e a
            cota, mais acima. */}
        {degraus.length > 0 && (
          <g style={{ pointerEvents: "none" }}>
            {degraus.map((d) => (
              <g key={`deg${d.x},${d.y}`}>
                <rect x={d.x} y={d.y} width="1" height="1" fill={ALTURA_NA_MESA.cor.lume} opacity={d.lume} />
                {d.face > 0 && <rect x={d.x} y={d.y + 1 - d.face} width="1" height={d.face} fill={ALTURA_NA_MESA.cor.face} />}
              </g>
            ))}
          </g>
        )}
        {/* terreno difícil e cobertura: o chão que cobra e o chão que protege */}
        {dificeis.map(([x, y]) => <rect key={`d${x},${y}`} x={x} y={y} width="1" height="1" fill="url(#tv-lama)" />)}
        {coberturas.map(([x, y]) => <rect key={`c${x},${y}`} x={x} y={y} width="1" height="1" fill="rgba(120,140,190,0.09)" />)}

        {/* CB 18.2 · AS SUPERFÍCIES: o chão (a cor do tipo, ao alfa dele) e o
            padrão, casa a casa; depois o contorno de cada mancha (tracejado
            na última rodada). A forma basta sozinha (WCAG 2.2, 1.4.1). Um
            chão que nasce entra em 200 ms; numa reação, a onda revela-o anel
            a anel a partir da origem. */}
        {manchas.length > 0 && (
          <g style={{ pointerEvents: "none" }}>
            {manchas.map((m) => m.casas.map((q) => {
              const d = SUPERFICIES_NO_CHAO.tipos[m.tipo];
              const k = K(q.x, q.y);
              const onda = ondaEm.get(k);
              const nasce = !onda && !parado && chaoAntes && !chaoAntes.has(`${k}:${m.tipo}`);
              const classe = onda ? "tv-reacao-onda" : nasce ? "tv-chao-nasce" : undefined;
              const estilo = onda ? { "--anel": `${onda.tempo.pausa + onda.anel * onda.tempo.porAnel}ms`, "--porAnel": `${onda.tempo.porAnel}ms` } : undefined;
              return (
                <g key={`sup${k}`} className={classe} style={estilo}>
                  <rect x={q.x} y={q.y} width="1" height="1" fill={d.chao} fillOpacity={d.alfa} />
                  <rect x={q.x} y={q.y} width="1" height="1" fill={`url(#tv-chao-${m.tipo})`} />
                </g>
              );
            }))}
            {manchas.map((m, i) => (
              <Contorno key={`cm${i}`} linhas={m.contorno} cor={SUPERFICIES_NO_CHAO.tipos[m.tipo].traco} largura={SUPERFICIES_NO_CHAO.contorno * px}
                tracejado={m.ultima ? SUPERFICIES_NO_CHAO.ultima.contorno.map((n) => n * px).join(" ") : null} />
            ))}
          </g>
        )}
        {/* a malha, fina o bastante para orientar e apagada o bastante para
            não competir com nada que esteja em cima dela */}
        {/* B1: a malha do quadro é um fio claro a 0,16, de 1 px — sobre a
            textura, o `line` de antes desaparecia */}
        <g stroke={T.inkDim} strokeWidth={MB.chao.malha * px} opacity={MB.alfa.malha}>
          {Array.from({ length: g.largura - 1 }).map((_, i) => <line key={`v${i}`} x1={i + 1} y1="0" x2={i + 1} y2={g.altura} />)}
          {Array.from({ length: g.altura - 1 }).map((_, i) => <line key={`h${i}`} x1="0" y1={i + 1} x2={g.largura} y2={i + 1} />)}
        </g>

        {/* PAREDE COM MASSA: o bloco escuro mais a aresta iluminada só do
            lado que dá para o salão. É o que separa "aqui é pedra" de "aqui
            é uma casa mais escura". */}
        <g>
          {paredes.map(([x, y]) => <rect key={`p${x},${y}`} x={x} y={y} width="1" height="1" fill="#07060c" />)}
          <Contorno linhas={contorno(setParedes)} cor="#463d63" largura={0.06} />
        </g>

        {/* CB 18.1 · A ARESTA E A COTA DO DEGRAU, por cima da malha: a aresta
            `inkMeio` 1,5 em cima e à esquerda (6,98 sobre o alto) e os
            chevrons (9,13 sobre `bg`), que passam 3:1 com folga. */}
        {degraus.length > 0 && (
          <g style={{ pointerEvents: "none" }}>
            {degraus.map((d) => {
              const a = (ALTURA_NA_MESA.aresta * px) / 2;
              return (
                <g key={`ar${d.x},${d.y}`}>
                  {d.aresta.cima && <line x1={d.x} y1={d.y + a} x2={d.x + 1} y2={d.y + a} stroke={ALTURA_NA_MESA.cor.aresta} strokeWidth={ALTURA_NA_MESA.aresta * px} />}
                  {d.aresta.esquerda && <line x1={d.x + a} y1={d.y} x2={d.x + a} y2={d.y + 1 - d.face} stroke={ALTURA_NA_MESA.cor.aresta} strokeWidth={ALTURA_NA_MESA.aresta * px} />}
                  <CotaDoDegrau x={d.x} y={d.y} nivel={d.nivel} px={px} />
                </g>
              );
            })}
          </g>
        )}
        {/* o estorvo é a mesa virada, o barril, a estalagmite: não bloqueia
            passagem nem visão, e dá cobertura a quem se cola nele */}
        {/* B1: o "Obstáculo" do quadro — o topo, a base e a sombra, 38 × 34
            numa casa de 62, desenhados na grelha dele e escalados à casa (o
            `<svg>` de dentro recorta a sombra, como o quadro recorta). A base
            é `panelSoft`; o topo e os dois fios são os do quadro, que `T` não
            tem (eram três literais e são três). */}
        {/* CB 18.3: onde a casa tem um objeto, a peça dele toma o lugar do
            estorvo; e as três cores literais do estorvo genérico passaram a
            `panelSoft`, `lineStrong` e `pagina` (OBJETOS_NA_MESA.cor) */}
        {estorvos.filter(([x, y]) => !objetoEm.has(K(x, y))).map(([x, y]) => {
          const w = MB.estorvo.largura / MB.estorvo.casa, h = MB.estorvo.altura / MB.estorvo.casa;
          return (
            <svg key={`e${x},${y}`} x={x + (1 - w) / 2} y={y + (1 - h) / 2} width={w} height={h}
              viewBox={`0 0 ${MB.estorvo.largura} ${MB.estorvo.altura}`} style={{ pointerEvents: "none" }}>
              <ellipse cx="19" cy="12.5" rx="18.5" ry="12" fill={OBJETOS_NA_MESA.cor.corpo} stroke={OBJETOS_NA_MESA.cor.aro} />
              <ellipse cx="19" cy="21" rx="18" ry="12" fill={T.panelSoft} stroke={OBJETOS_NA_MESA.cor.tampa} strokeWidth="2" />
              <ellipse cx="19" cy="29" rx="23" ry="9" fill={T.bg} opacity={MB.estorvo.alfaDaSombra} />
            </svg>
          );
        })}

        {/* CB 18.3 · OS OBJETOS COMO PEÇAS: no lugar do estorvo genérico,
            com os selos das etiquetas do motor no canto de cima à direita */}
        {objetosNaMesa.map((o) => (
          <g key={`obj${o.x},${o.y}`}>
            <ObjetoDoCenario objeto={o} />
            <SelosDoObjeto objeto={o} px={px} />
          </g>
        ))}
        {/* O VÉU (v9.125): a primeira versão PINTAVA de dourado o que dá para
            alcançar — e o alcance quase sempre é a maior parte do tabuleiro,
            então o campo inteiro virava uma mancha de lama com buracos onde
            havia gente. Escurecer o que NÃO se alcança diz a mesma coisa e
            deixa o chão em paz: a taverna continua com cara de taverna, e o
            que some é o que não interessa neste turno.

            A cor do contorno é que carrega o sentido — âmbar é o seu passo,
            violeta é o alcance da habilidade. */}
        {alcance.size > 0 && (
          <g>
            {/* B1: o véu fica (é ele que diz "isto não é seu neste turno"),
                mas aliviado — a 0,46 de um quase-preto ele apagava a textura
                inteira fora do passo. O dentro ganha o âmbar a 0,03 do quadro
                ("Área de movimento"). */}
            {veu.map(([x, y]) => <rect key={`v${x},${y}`} x={x} y={y} width="1" height="1" fill={T.bg} opacity={MB.alfa.foraDoPasso} />)}
            {[...alcanceCheio].map((k) => { const [x, y] = k.split(",").map(Number); return <rect key={`d${k}`} x={x} y={y} width="1" height="1" fill={mirando ? T.violetSoft : T.amber} opacity={MB.alfa.dentroDoPasso} />; })}
            {/* O ROXO DO TRAÇO É O violetSoft: o tracejado da mira
                dava 2,575:1 contra o pior chão real do tabuleiro, e a WCAG 2.1
                SC 1.4.11 (Non-text Contrast, AA) pede 3:1 para o que não é
                texto. Com violetSoft dá 3,615:1 — passa a norma e o piso da
                casa (3,272) com 10,5% de folga. O âmbar (3,662) e a opacidade
                não se tocam.

                É token e não opacidade por três motivos que valem por si:
                (1) violetSoft JÁ é a cor da mira neste arquivo — a retícula da
                casa mirada e o cabeçalho "tracejado roxo" da legenda; hoje o
                anel da mira e o contorno do alcance dela falam dois roxos
                diferentes, e o conserto de acessibilidade é, por acaso, o
                conserto dessa inconsistência;
                (2) as duas línguas do tabuleiro passam a ser igualmente
                legíveis — a mesma linha era 42% mais fraca em violeta (2,575
                contra 3,662 do âmbar), e passa a 1,3% de diferença: um
                tabuleiro que fala duas línguas não pode dizer uma delas mais
                baixo;
                (3) a regra que fica: violet é tinta de SUPERFÍCIE (corpo e
                borda, lida contra o panel — o selo e o botão lá embaixo) e
                violetSoft é tinta de TRAÇO sobre o tabuleiro. violet não
                perde emprego. */}
            {/* B1: o tracejado do quadro — 1,5 px, inteiro, com o traço em
                píxeis (era 0,045 da casa a 0,6). */}
            <Contorno linhas={contorno(alcanceCheio)} cor={mirando ? T.violetSoft : T.amber} largura={MB.chao.tracoDoPasso * px} tracejado={`${MB.chao.tracoDoPassoTracejado * px} ${MB.chao.tracoDoPassoTracejado * px}`} opacidade={1} />
          </g>
        )}
        {/* v9.128: a habilidade de alvo único não se mira, mas ALCANÇA — e é
            o alcance que responde à pergunta que o jogador está fazendo
            quando olha o tabuleiro com uma magia na mão. Sai como contorno,
            por cima do véu do passo, sem disputar com ele. */}
        {!mirando && alcanceMira && alcanceMira.quadrados && alcanceMira.quadrados.size > 0 && (
          <Contorno linhas={contorno(alcanceMira.quadrados)} cor={T.violetSoft} largura={0.05} tracejado="0.12 0.2" opacidade={0.7} />
        )}
        {naArea.size > 0 && (
          <g>
            {[...naArea].map((k) => { const [x, y] = k.split(",").map(Number); return <rect key={`a${k}`} x={x} y={y} width="1" height="1" fill="rgba(216,106,91,0.26)" />; })}
            <Contorno linhas={contorno(naArea)} cor={T.danger} largura={0.06} />
          </g>
        )}

        {/* CB 18.3 · O OBJETO APONTADO mostra o que faria: as casas pintam-se
            como a área do sopro (`Casa marcada · area`) */}
        {casasDoObjeto.size > 0 && (
          <g style={{ pointerEvents: "none" }}>
            {[...casasDoObjeto].map((k) => {
              const [x, y] = k.split(",").map(Number);
              const A = INTENCAO_NA_MESA.area;
              return (
                <rect key={`ao${k}`} x={x + (A.aro * px) / 2} y={y + (A.aro * px) / 2} width={1 - A.aro * px} height={1 - A.aro * px}
                  fill={alfa(T.danger, A.chao)} stroke={T.danger} strokeWidth={A.aro * px} strokeDasharray={A.tracejado.map((n) => n * px).join(" ")} />
              );
            })}
          </g>
        )}
        {/* CB 18.5 · O CLARÃO da primeira reação: `ink`, dentro da pausa */}
        {reacoesNaMesa.filter((r) => r.tempo.clarao > 0 && r.fase === "viva").map((r) => (
          <g key={`clarao${r.chave}`} className="tv-reacao-clarao" style={{ pointerEvents: "none" }}>
            {r.casas.map((q) => <rect key={`cl${q.x},${q.y}`} x={q.x} y={q.y} width="1" height="1" fill={T.ink} />)}
          </g>
        ))}
        {/* CB 4 · AS CASAS DO SOPRO: o chão a 22 % é decoração (1,33 contra o
            feltro), e de propósito — quem leva a informação é o aro tracejado
            (5,11) e a chama (3,83), os dois acima de 3 (WCAG 2.2, 1.4.11) */}
        {casasDoSopro.size > 0 && (
          <g style={{ pointerEvents: "none" }}>
            {[...casasDoSopro].map((k) => {
              const [x, y] = k.split(",").map(Number);
              const A = INTENCAO_NA_MESA.area;
              return (
                <g key={`sopro${k}`}>
                  <rect x={x + (A.aro * px) / 2} y={y + (A.aro * px) / 2} width={1 - A.aro * px} height={1 - A.aro * px}
                    fill={alfa(T.danger, A.chao)} stroke={T.danger} strokeWidth={A.aro * px} strokeDasharray={A.tracejado.map((n) => n * px).join(" ")} />
                  <GlifoNaCasa nome={INTENCAO_NA_MESA.glifo.sopro} x={x} y={y} lado={0.42} cor={T.danger} px={px} />
                </g>
              );
            })}
          </g>
        )}
        {/* CB 17.2 · O SOPRO DE QUEM AGE: as casas pulsam do chão da área ao
            segundo alfa (22 → 45 → 22 %, no tempo de pintar), com o aro e a
            chama de sempre; o sopro vazio não se desenha (a linha di-lo) */}
        {soproDoPasso.length > 0 && (
          <g key={`soproPasso${kpAgora}`} style={{ pointerEvents: "none" }}>
            {soproDoPasso.map((q) => {
              const A = INTENCAO_NA_MESA.area;
              return (
                <g key={`sp${q.x},${q.y}`}>
                  <rect className="tv-sopro-pulsa" x={q.x + (A.aro * px) / 2} y={q.y + (A.aro * px) / 2} width={1 - A.aro * px} height={1 - A.aro * px}
                    fill={T.danger} fillOpacity={TURNO_DELES.sopro.alfa[0]} stroke={T.danger} strokeWidth={A.aro * px} strokeDasharray={A.tracejado.map((n) => n * px).join(" ")} />
                  <GlifoNaCasa nome={INTENCAO_NA_MESA.glifo.sopro} x={q.x} y={q.y} lado={0.42} cor={T.danger} px={px} />
                </g>
              );
            })}
          </g>
        )}
        {/* CB 17.2 · O CAMINHO DELES (`Casa marcada · caminho-deles`, Figma
            364:1470): a linha da intenção (traço 2, tracejado 5/4, `danger`)
            pelos centros, um ponto em cada casa do meio, e o aro tracejado
            `lineStrong` na casa de onde veio. Fica o passo inteiro. */}
        {camDoPasso.length > 1 && (
          <g style={{ pointerEvents: "none" }}>
            <path d={viaDoCaminho(camDoPasso)} fill="none" stroke={T.danger} strokeWidth={INTENCAO_NA_MESA.seta.traco * px}
              strokeDasharray={INTENCAO_NA_MESA.seta.tracejado.map((n) => n * px).join(" ")} strokeLinecap="round" strokeLinejoin="round" />
            {camDoPasso.slice(1, -1).map((q, i) => <circle key={`cd${i}`} cx={q.x + 0.5} cy={q.y + 0.5} r={(CAMINHO_NO_CHAO.ponto / 2) * px} fill={T.danger} />)}
            <circle cx={camDoPasso[0].x + 0.5} cy={camDoPasso[0].y + 0.5} r={0.4} fill="none" stroke={T.lineStrong}
              strokeWidth={TURNO_DELES.origem.aro * px} strokeDasharray={TURNO_DELES.origem.tracejado.map((n) => n * px).join(" ")} />
          </g>
        )}
        {/* CB 4 · A SETA DO ATAQUE: da ficha dele à do alvo, tracejada */}
        {[...intencaoDe.entries()].map(([nome, v]) => {
          if (v.tipo !== "atacar" || !v.alvo) return null;
          const de = inimigos.find((e) => e.nome === nome);
          const ehHeroi = v.alvo === ((heroiFicha && heroiFicha.nome) || heroiNome);
          const para = ehHeroi ? heroi : aliados.find((a) => a.nome === v.alvo);
          if (!de || !para || de.x == null || para.x == null) return null;
          const S = INTENCAO_NA_MESA.seta;
          return (
            <line key={`seta${nome}`} x1={de.x + ladoDe(de) / 2} y1={de.y + ladoDe(de) / 2} x2={para.x + ladoDe(para) / 2} y2={para.y + ladoDe(para) / 2}
              stroke={T.danger} strokeWidth={S.traco * px} strokeDasharray={S.tracejado.map((n) => n * px).join(" ")} strokeLinecap="round" style={{ pointerEvents: "none" }} />
          );
        })}
        {/* CB 3 · O CAMINHO NO CHÃO antes de andar e atacar: a linha une os
            centros (traço 3 âmbar), um ponto em cada casa; a casa que sai do
            alcance de quem ameaça pinta-se de perigo, com as espadas (o golpe
            livre); o destino leva o aro tracejado */}
        {pontosDoCaminho.length > 1 && (
          <g style={{ pointerEvents: "none" }}>
            {!caminhoPerigoso && <path d={viaDoCaminho(pontosDoCaminho)} fill="none" stroke={T.amber} strokeWidth={CAMINHO_NO_CHAO.traco * px} strokeLinecap="round" strokeLinejoin="round" />}
            {/* CB 18.4 c: com perigos, troço a troço — o que entra (ou sai) de
                uma casa de perigo é `danger` tracejado, o resto âmbar */}
            {caminhoPerigoso && caminhoPerigoso.trocos.map((tr, i) => (
              <line key={`tr${i}`} x1={tr.de.x + 0.5} y1={tr.de.y + 0.5} x2={tr.para.x + 0.5} y2={tr.para.y + 0.5} stroke={tr.perigo ? T.danger : T.amber}
                strokeWidth={CAMINHO_NO_CHAO.traco * px} strokeLinecap="round" strokeDasharray={tr.perigo ? CAMINHO_NO_CHAO.perigo.tracejado.map((n) => n * px).join(" ") : undefined} />
            ))}
            {pontosDoCaminho.slice(1, -1).map((q, i) => <circle key={`pc${i}`} cx={q.x + 0.5} cy={q.y + 0.5} r={(CAMINHO_NO_CHAO.ponto / 2) * px} fill={T.amber} />)}
            {[...golpeLivreEm].map((k) => {
              const [x, y] = k.split(",").map(Number);
              const L = CAMINHO_NO_CHAO.golpeLivre;
              return (
                <g key={`gl${k}`}>
                  <rect x={x + (L.aro * px) / 2} y={y + (L.aro * px) / 2} width={1 - L.aro * px} height={1 - L.aro * px}
                    fill={alfa(T.danger, L.chao)} stroke={T.danger} strokeWidth={L.aro * px} strokeDasharray={L.tracejado.map((n) => n * px).join(" ")} />
                  <GlifoNaCasa nome="espadas" x={x} y={y} lado={0.42} cor={T.danger} px={px} />
                </g>
              );
            })}
            {(() => {
              const d = pontosDoCaminho[pontosDoCaminho.length - 1];
              const D = CAMINHO_NO_CHAO.destino;
              const l = D.lado * px;
              return (
                <rect x={d.x + 0.5 - l / 2} y={d.y + 0.5 - l / 2} width={l} height={l} rx={D.raio * px}
                  fill={alfa(T.amber, D.chao)} stroke={T.amber} strokeWidth={D.aro * px} strokeDasharray={D.tracejado.map((n) => n * px).join(" ")} />
              );
            })()}
          </g>
        )}
        {/* CB 18.4 a · O EMPURRÃO ANTES DO CLIQUE: a seta âmbar da borda da
            ficha à borda do fantasma, com a ponta e uma marca em cada casa
            atravessada; o fantasma tracejado `inkMeio` a 60 % na casa onde ele
            pára; a explosão `danger` no impacto, se bate */}
        {setaDoEmp && (() => {
          const E = EMPURRAO_NA_MESA;
          const s = setaDoEmp;
          const comp = Math.hypot(s.para.x - s.de.x, s.para.y - s.de.y);
          const r = E.fantasma.lado / 2;
          if (!(comp > 0)) return null;
          const ux = (s.para.x - s.de.x) / comp, uy = (s.para.y - s.de.y) / comp;
          const x1 = s.de.x + 0.5 + ux * r, y1 = s.de.y + 0.5 + uy * r;
          const x2 = s.para.x + 0.5 - ux * r, y2 = s.para.y + 0.5 - uy * r;
          const p = E.seta.ponta * px;
          const ponta = `${x2},${y2} ${x2 - ux * p - uy * p * 0.6},${y2 - uy * p + ux * p * 0.6} ${x2 - ux * p + uy * p * 0.6},${y2 - uy * p - ux * p * 0.6}`;
          return (
            <g style={{ pointerEvents: "none" }}>
              <line x1={x1} y1={y1} x2={x2 - ux * p * 0.5} y2={y2 - uy * p * 0.5} stroke={T.amber} strokeWidth={E.seta.traco * px} strokeLinecap="round" />
              <polygon points={ponta} fill={T.amber} />
              {s.marcas.map((q) => <circle key={`em${q.x},${q.y}`} cx={q.x + 0.5} cy={q.y + 0.5} r={(E.seta.marca / 2) * px} fill={T.amber} />)}
              <circle cx={s.para.x + 0.5} cy={s.para.y + 0.5} r={r - (E.fantasma.traco * px) / 2} fill="none" stroke={T.inkMeio} strokeOpacity={E.fantasma.alfa}
                strokeWidth={E.fantasma.traco * px} strokeDasharray={E.fantasma.tracejado.map((n) => n * px).join(" ")} />
              {s.impacto && <GlifoEm nome={E.impacto} cx={s.impacto.x} cy={s.impacto.y} lado={0.42} cor={T.danger} px={px} />}
            </g>
          );
        })()}
        {/* CB 5 · quem caiu deixa a caveira na casa */}
        {caidosComCasa.map((e, i) => <GlifoNaCasa key={`caido${e.nome}-${i}`} nome={INTENCAO_NA_MESA.caveira} x={e.x + (ladoDe(e) - 1) / 2} y={e.y + (ladoDe(e) - 1) / 2} lado={0.46} cor={T.inkDim} px={px} />)}

        {/* o caminho: o previsto pontilhado, o andado inteiro */}
        {rotaPrevista && (
          <g>
            <path d={viaDoCaminho(rotaPrevista.pontos)} fill="none" stroke={T.amber} strokeWidth="0.09" strokeDasharray="0.2 0.18" strokeLinecap="round" opacity="0.8" />
            <circle cx={sobre.x + 0.5} cy={sobre.y + 0.5} r="0.2" fill={T.amber} opacity="0.9" />
          </g>
        )}
        {andando && andando.i > 0 && (
          <path d={viaDoCaminho(andando.rota.slice(0, andando.i + 1))} fill="none" stroke={T.amberSoft} strokeWidth="0.1" strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />
        )}

        {mira && (
          <g opacity="0.95" style={{ pointerEvents: "none" }}>
            <circle cx={mira.x + 0.5} cy={mira.y + 0.5} r="0.36" fill="none" stroke={T.violetSoft} strokeWidth="0.07" />
            <line x1={mira.x + 0.5} y1={mira.y + 0.12} x2={mira.x + 0.5} y2={mira.y + 0.88} stroke={T.violetSoft} strokeWidth="0.04" />
            <line x1={mira.x + 0.12} y1={mira.y + 0.5} x2={mira.x + 0.88} y2={mira.y + 0.5} stroke={T.violetSoft} strokeWidth="0.04" />
          </g>
        )}

        {/* ============================================================
            E4 · O CUSTO ESCRITO DENTRO DA CASA

            A lei de E1, agora com a medida que a salva da acusação de
            planilha: das dez plantas, QUATRO dão 0 % de divergência entre
            o custo real e o que o olho conta, e SEIS dão 100 %. Não há
            meio-termo — ou o número confirma o que o olho já sabe, ou é o
            ÚNICO canal que existe. E como o jogador não sabe em que
            planta está antes de a ver, a regra só serve se for a mesma
            nas duas.

            NASCE EM ALCANÇÁVEL, NÃO SOB O DEDO: quem pousa o dedo numa
            casa já escolheu; quem precisa do número é quem ainda está a
            escolher, e esse está a olhar para o conjunto inteiro. Um
            custo que só aparece sob o dedo obriga a visitar 83 casas para
            comparar duas.

            E O QUE NÃO SE ESCREVE É O DENOMINADOR. O preço unitário é
            verdade sobre UM passo; o total é o que a rodada de graça
            tornava mentira. *Um preço unitário verdadeiro pode viver sem
            orçamento; um orçamento falso não pode viver de todo.*

            A CASA MUDA FICA MUDA, e a mudez é a informação: o que é alvo
            tem o custo escrito dentro; o que não tem nada escrito dentro
            não é alvo. Abaixo do piso do alvo nada se escreve — a 20–28
            px o número não se lê, e o relance compacto não é para agir.

            A1 · A EMENDA (assinada pelo `desenho`, `formas.md` §A1 6): a
            medida de E4 continua certa — nas seis plantas de lama, na
            abertura, 100 % das casas surpreendem e TODAS levam número —,
            mas a lei cobrava o número também onde o olho acerta (na T8 do
            ANTES, 0 de 80 casas surpreendiam: 80 números para dizer o que
            o tracejado já diz). Agora: escreve-se onde SURPREENDE, e sempre
            sob o dedo (o rato ou o foco do teclado) — o preço antes do
            clique continua em todas as casas, só deixou de estar em todas
            AO MESMO TEMPO. A metade antiga "o que não tem nada escrito não
            é alvo" aposenta-se: quem diz o alvo é a área. */}
        {escreveOCusto && (
          <g className="tv-mono" style={{ pointerEvents: "none" }}>
            {[...custoDoPasso].filter(([k]) => surpreendem.has(k) || (sobre && k === K(sobre.x, sobre.y)) || (focada && k === K(focada.x, focada.y))).map(([k, metros]) => {
              const [cx, cy] = k.split(",").map(Number);
              return (
                <text key={`custo${k}`} x={cx + 0.5} y={cy + TELA_DE_BATALHA.casa.linhaDoCusto}
                  textAnchor="middle" dominantBaseline="central" fill={T.amberSoft}
                  style={{ fontSize: TELA_DE_BATALHA.casa.corpoDoCusto * px }}>
                  {metrosTxt(metros)}
                </text>
              );
            })}
          </g>
        )}

        {/* B1 · A CASA DE QUEM ESTÁ NELA — "Casa atual" e "Casa aliada" do
            quadro: o herói com o âmbar a 0,13 e o fio de 2 px; o aliado com o
            verde a 0,08 e 1 px; o inimigo, com a mesma forma na cor dele. O
            traço vai POR DENTRO da casa, para não pintar a vizinha. */}
        <g style={{ pointerEvents: "none" }}>
          {[...mapa.values()].filter((o) => o.chefe).map((o, i) => {
            const n = ladoDe(o.ent), eu = o.tipo === "heroi";
            const tr = (eu ? MB.chao.tracoDoHeroi : MB.chao.tracoDosOutros) * px;
            const naMesa = eu ? o.ent : ondeEsta(o.ent);
            const ox = eu && andando ? andando.rota[andando.i].x : naMesa.x, oy = eu && andando ? andando.rota[andando.i].y : naMesa.y;
            return (
              <rect key={`casa${i}`} x={ox + tr / 2} y={oy + tr / 2} width={n - tr} height={n - tr}
                fill={o.cor} fillOpacity={eu ? MB.alfa.casaDoHeroi : MB.alfa.casaDosOutros} stroke={o.cor} strokeWidth={tr} />
            );
          })}
        </g>

        {/* AS FICHAS */}
        <g style={{ pointerEvents: "none" }}>
          {aliados.map((a, i) => (a.vida || 0) > 0 && a.x != null ? (
            <Ficha key={`al${i}`} ent={a} tipo="aliado" cor={T.ok} x={ondeEsta(a).x} y={ondeEsta(a).y - sobeEm(ondeEsta(a))} lado={ladoDe(a)} ms={msDoPasso(a)} grande={grande} pxDaCasa={ladoEmPx(grande)}
              golpe={golpeEm(a.nome)} anel={realce && realce === a.nome ? T.amber : null} age={quemAge === a.nome ? T.ok : null} />
          ) : null)}
          {inimigos.map((e, i) => e.x != null ? (
            <Ficha key={`in${e.nome}-${i}`} ent={e} tipo="inimigo" cor={T.danger} x={ondeEsta(e).x} y={ondeEsta(e).y - sobeEm(ondeEsta(e))} lado={ladoDe(e)} ms={msDoPasso(e)} grande={grande} pxDaCasa={ladoEmPx(grande)}
              golpe={golpeEm(e.nome)} anel={alvoDaPrevisao === e.nome || (realce && realce === e.nome) ? T.amber : null} age={quemAge === e.nome ? T.danger : null} />
          ) : null)}
          {caidosComCasa.filter((e) => { const gq = golpeEm(e.nome); return gq && gq.variante === "abate"; }).map((e, i) => (
            <Ficha key={`cai${e.nome}-${i}`} ent={e} tipo="inimigo" cor={T.danger} x={e.x} y={e.y} lado={ladoDe(e)} ms={0} grande={grande} pxDaCasa={ladoEmPx(grande)} golpe={golpeEm(e.nome)} />
          ))}
          {heroi && heroi.x != null && (
            /* a ficha completa entra por baixo: a entidade da grade só tem
               nome e lugar, e o rosto precisa da classe e da vida — a
               posição da grade ganha por cima, que é a verdade do turno */
            <Ficha ent={{ ...(heroiFicha || {}), ...heroi }} rotulo="você" tipo="heroi" cor={T.amber} lado={ladoDe(heroi)} grande={grande} pxDaCasa={ladoEmPx(grande)}
              x={andando ? andando.rota[andando.i].x : heroi.x}
              y={(andando ? andando.rota[andando.i].y : heroi.y) - sobeEm(andando ? andando.rota[andando.i] : heroi)}
              ms={andando ? andando.ms : 260}
              golpe={golpeEm((heroiFicha && heroiFicha.nome) || heroiNome)} anel={realce && realce === ((heroiFicha && heroiFicha.nome) || heroiNome) ? T.amber : null} />
          )}
        </g>

        {/* O DANO FLUTUA: por cima das fichas, fora do alcance do toque */}
        {flutuantes.length > 0 && (
          <g style={{ pointerEvents: "none" }}>
            {flutuantes.map((f) => (
              <text key={f.chave} className="tv-mono tv-flutua" x={f.x} y={f.y} textAnchor="middle"
                fill={f.cor} stroke="#0B0912" strokeWidth="0.035" paintOrder="stroke"
                style={{ fontSize: 0.55, fontWeight: 700 }}>{f.texto}</text>
            ))}
          </g>
        )}

        {/* A PARAGEM DO CURSOR DE TECLADO (E4) — onde o `Tab` volta.

            SÓ APARECE QUANDO O TECLADO NÃO ESTÁ NA GRELHA: com o foco
            dentro, quem manda é o anel de `:focus-visible`, e os dois ao
            mesmo tempo seriam duas marcas a dizer a mesma coisa em sítios
            diferentes.

            DOIS CANAIS E NENHUM DELES É SÓ A COR: a luminância (um degrau
            de 2,3× — `ink` a 15,31:1 contra `inkDim` a 6,63:1) e a
            ESPESSURA (3 px contra 2). E um terceiro que veio de graça: o
            anel tem cantos rectos e a borda de alcançável tem raio, logo
            lê-se como outro objeto e não como uma borda mais grossa.

            E a defesa de por que a luminância chega AQUI, onde noutros
            sítios não chegaria: a distinção não é entre duas casas, é
            entre dois MOMENTOS — o jogador vê o forte enquanto o teclado
            está na grelha e o fraco quando não está, e nunca tem os dois
            lado a lado para comparar. */}
        {!focada && podeIr.size > 0 && (
          <rect aria-hidden="true" pointerEvents="none" fill="none" stroke={T.inkDim}
            strokeWidth={TELA_DE_BATALHA.casa.anelDaParagem * px}
            x={casaDaParagem.x + TELA_DE_BATALHA.casa.anelDaParagem * px / 2}
            y={casaDaParagem.y + TELA_DE_BATALHA.casa.anelDaParagem * px / 2}
            width={1 - TELA_DE_BATALHA.casa.anelDaParagem * px}
            height={1 - TELA_DE_BATALHA.casa.anelDaParagem * px} />
        )}

        {/* A CAMADA DO TOQUE, por último e por cima — e em E2 ela vira o
            `grid` do WAI-ARIA: casca `role="grid"`, uma linha por `y`, e
            `role="gridcell"` em TODAS as casas, alcançáveis ou não. Antes a
            casa impedida não tinha `role` nenhum, e é precisamente ela que
            mais precisa de ser lida: é a que explica por que não dá.

            E O `<title>` SAIU, não foi duplicado. Ele fazia duas coisas ao
            mesmo tempo, e a segunda é um defeito conhecido desta casa: era
            nome acessível e era o BALÃO DO RATO — um canal que no telefone
            não existe, e um balão de ~340 px a aparecer por cima do campo
            depois de um segundo de paragem, tapando exatamente as casas
            para onde o jogador ia andar. Duas strings sobre a mesma casa
            seriam duas verdades; o nome mora no `aria-label`, e nada se
            perde: o custo já está dentro da casa, o veredito na linha do
            veredito, e o nome da região está escrito no chão logo acima. */}
        <g role="grid" aria-label={g.cenario ? `o campo · ${g.cenario}` : "o campo"}>
          {Array.from({ length: g.altura }).map((_, y) => (
            <g key={`li${y}`} role="row">
              {Array.from({ length: g.largura }).map((__, x) => {
                const k = K(x, y);
                const oc = mapa.get(k);
                const tiro = mirando && noAlcance.has(k);
                const indo = podeIr.has(k);
                const clicavel = mirando ? tiro : indo;
                const end = enderecoDaCasa(x, y);
                const parede = setParedes.has(k);
                const souEu = !!(oc && oc.tipo === "heroi");
                /* O NOME ACESSÍVEL TEM QUATRO CAMPOS, nesta ordem:
                   `endereço · quem está lá · o lugar · o veredito`.

                   O endereço à frente porque quem tabula ouve oitenta e seis
                   nomes de casa seguidos, e o endereço é o único campo que
                   muda sempre — é a única ordem que deixa saltar. */

                /* 2 · QUEM ESTÁ LÁ. A parede entra aqui e não no campo do
                   lugar: ela não está NUM lugar, ela É o lugar. */
                const quem = souEu ? "você"
                  : oc ? `${oc.ent.nome}${ladoDe(oc.ent) > 1 ? `, ${tamanhoDe(oc.ent).nome.toLowerCase()}` : ""}${oc.ent.vidaMax ? `, ${oc.ent.vida} de ${oc.ent.vidaMax} PV` : ""}`
                  : parede ? "pedra" : "";
                /* 3 · O LUGAR, com o que o chão cobra. O nome vem do `grid.js`
                   já com a preposição ("no beco estreito"): é o mesmo
                   vocabulário que o Mestre vai usar de volta, e por isso não
                   se remenda artigo nenhum aqui. */
                const lugar = parede ? "" : [
                  nomeDoLugar(grade, x, y),
                  terrenoDificil(grade, x, y) ? "terreno difícil" : "",
                  temCobertura(grade, x, y) ? "cobertura +2" : "",
                  /* CB 18: «no alto (degrau 2)», o chão e o objeto (FRASE_DO_CHAO) */
                  campoDaCasa(x, y),
                ].filter(Boolean).join(", ");
                /* 4 · O VEREDITO, E ELE NUNCA FICA VAZIO. Antes, quando a
                   casa não dava, o `<title>` simplesmente acabava — e
                   silêncio lê-se como "não há nada a dizer", nunca como
                   "não dá". O campo diz sempre o que acontece se ele agir
                   ali, inclusive quando a resposta é não.

                   DÍVIDA DECLARADA: a lei de `formas.md` manda que este
                   campo seja, palavra por palavra, a `curta` de
                   `RECUSAS_DO_PASSO` — para o ouvido e o olho lerem a mesma
                   frase e a catraca dos 54 caracteres proteger os dois
                   canais. Essa tabela é do `backend` e ainda não existe, e
                   inventá-la aqui seria a segunda verdade que ela veio
                   matar. Então hoje está a frase mais curta e mais honesta
                   que esta componente consegue dizer SOZINHA, e ela é
                   substituída inteira quando `vereditoDoPasso` nascer — é
                   de lá que vêm o custo em metros e o "vá até K11", que
                   são conta de caminho e não são deste lado da mesa. */
                /* CB 3: o inimigo desta casa, e se o toque nele prevê/ataca */
                const inimigoAqui = oc && oc.tipo === "inimigo" ? oc.ent.nome : "";
                const tocaInimigo = !!inimigoAqui && !mirando && !!aoTocarInimigo;
                /* o alvo da previsão diz a previsão no veredito da casa: o ouvido
                   ouve o mesmo que o olho lê debaixo da ficha (CB 3) */
                const daPrevisao = inimigoAqui && inimigoAqui === alvoDaPrevisao ? (() => { try { const v = pilulaDaPrevisao(previsaoDoGolpe); return v ? v.rotulo.replace(`${inimigoAqui}: `, "") : ""; } catch { return ""; } })() : "";
                const veredito = daPrevisao ? daPrevisao
                  : tocaInimigo ? "toque para prever o golpe"
                  : tiro ? `dá para fazer ${alcanceMira.nome} cair aqui`
                  : mirando ? `${(alcanceMira && alcanceMira.nome) || "a habilidade"} não alcança ${end}`
                  : souEu ? `você já está em ${end}`
                  : parede ? `${end} é pedra`
                  : oc ? `${oc.ent.nome} está em ${end}`
                  : indo ? "dá para chegar aqui"
                  : passoM <= 0 ? `o seu passo acabou — ${end} fica para o próximo turno`
                  : podeMover ? `${end} fica fora do seu passo nesta rodada`
                  : `não dá para andar até ${end} agora`;
                const nomeDaCasa = [end, quem, lugar, veredito].filter(Boolean).join(" · ");
                /* CB 3 · O INIMIGO SE TOCA: o rato prevê (aoApontarInimigo), o
                   clique anda e ataca; no telefone o primeiro toque prevê e o
                   segundo confirma — quem decide qual é a tela, por
                   aoTocarInimigo. Mirar uma área continua a ganhar. */
                const agir = () => {
                  if (tocaInimigo) { try { aoTocarInimigo(inimigoAqui); } catch (e) { console.warn("GridDeBatalha: tocar o inimigo falhou", e); } return; }
                  if (!clicavel) return; if (mirando) onMirar({ x, y }); else onMover && onMover({ x, y });
                };
                const apontar = (nome) => { if (!aoApontarInimigo) return; try { aoApontarInimigo(nome); } catch (e) { console.warn("GridDeBatalha: apontar falhou", e); } };
                /* ============================================================
                   E4 · UM PONTO DE PARAGEM, E AS SETAS POR DENTRO

                   Antes: `tabIndex={clicavel ? 0 : undefined}`. Duas
                   doenças numa linha só.

                   A PRIMEIRA, medida: 84 paragens de `Tab` até `Atacar`
                   com o passo cheio e 1 com o passo gasto, NA MESMA LUTA.

                   A SEGUNDA, pior e mais calada: quando o passo acabava, a
                   grelha inteira deixava de responder ao teclado — 196
                   casas sem um único ponto de foco. E o veredito de cada
                   casa (o campo que E2 pôs no nome acessível justamente
                   para que a casa impedida EXPLIQUE por que não dá)
                   deixava de ser alcançável no exacto momento em que ele
                   era a única coisa que havia para dizer. *Silêncio lê-se
                   como "nada a dizer", nunca como "não dá".*

                   Agora TODA casa é focável (`-1`) e UMA é a paragem
                   (`0`): o `Tab` entra e sai da grelha numa batida, e
                   dentro dela as setas andam casa a casa. O veredito de
                   qualquer casa — parede, lama, fora do passo — está
                   sempre a uma seta de distância. */
                const ehAParagem = casaDaParagem.x === x && casaDaParagem.y === y;
                return (
                  <rect key={k} x={x} y={y} width="1" height="1" fill="transparent"
                    ref={(el) => { const m = casasRef.current; const ck = chaveDoFoco(x, y); if (el) m.set(ck, el); else m.delete(ck); }}
                    role="gridcell" aria-label={nomeDaCasa} tabIndex={ehAParagem ? 0 : -1} data-inimigo={inimigoAqui ? "" : undefined}
                    onClick={agir}
                    onKeyDown={(ev) => {
                      if (ev.key === "Enter" || ev.key === " ") {
                        /* a casa que não dá NÃO engole a tecla: quem a
                           preme numa casa impedida já ouviu o veredito no
                           nome dela, e roubar-lhe a barra de espaço seria
                           cobrar-lhe o gesto duas vezes */
                        if (!clicavel && !tocaInimigo) return;
                        ev.preventDefault(); agir(); return;
                      }
                      andarComTecla(ev, x, y);
                    }}
                    className="tv-anel-foco-no-campo"
                    onFocus={() => { setFocada({ x, y }); setParagem({ x, y }); }} onBlur={() => setFocada(null)}
                    onMouseEnter={() => { setSobre({ x, y }); if (inimigoAqui) apontar(inimigoAqui); }} onMouseLeave={() => { setSobre(null); if (inimigoAqui) apontar(null); }}
                    style={{ cursor: clicavel || tocaInimigo ? "pointer" : "default" }} />
                );
              })}
            </g>
          ))}
        </g>
      </svg>
      {/* CB · A CAMADA DE CIMA, em HTML: a previsão 8 px abaixo da ficha do
          alvo, a intenção no canto de cima da ficha (as duas nunca se tapam),
          o rótulo do caminho junto ao destino, e o número do golpe. Fora do
          toque: o toque é das casas, por baixo. */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {/* CB 18.2 · o selo de cada mancha, por cima das fichas */}
        {manchas.map((m, i) => <SeloDaSuperficie key={`selo${i}`} mancha={m} largura={g.largura} altura={g.altura} />)}
        {[...intencaoDe.entries()].map(([nome, v]) => {
          const e = inimigos.find((x) => x.nome === nome);
          if (!e || e.x == null) return null;
          const n = ladoDe(e);
          const cimaOcupada = e.y > 0 && mapa.has(K(e.x + n - 1, e.y - 1));
          const pos = cimaOcupada
            ? { left: `${((e.x + n) / g.largura) * 100}%`, top: `${((e.y + n / 2) / g.altura) * 100}%`, transform: "translate(4px, -50%)" }
            : { left: `${((e.x + n) / g.largura) * 100}%`, top: `${(e.y / g.altura) * 100}%`, transform: "translate(-40%, -60%)" };
          return (
            <span key={`int${nome}`} style={{ position: "absolute", zIndex: 2, ...pos }}>
              <PilulaDaIntencao vista={v} distanciaM={heroi ? Math.round(distanciaM(heroi, e) * 10) / 10 : null} />
            </span>
          );
        })}
        {/* CB 17.1 · O DADO NO ALVO: pousa 8 px abaixo da ficha do alvo (onde
            a previsão estava) e, se não cabe por baixo — a borda do tabuleiro
            ou a janela da câmara —, sobe para cima dela. O d20 deles pousa do
            lado do alvo OPOSTO a quem ataca, para o caminho e o atacante
            ficarem à vista. Esvanece no fim da leitura. */}
        {!lanceAgora.acabou && lances.map((l) => {
          const ehHeroi = !!heroiDoGolpe && l.alvo === heroiDoGolpe;
          const e = ehHeroi ? heroi : inimigos.find((x) => x.nome === l.alvo) || aliados.find((x) => x.nome === l.alvo) || caidosComCasa.find((x) => x.nome === l.alvo);
          if (!e || e.x == null) return null;
          const n = ladoDe(e);
          const ladoPx = Math.max(1, ladoEmPx(grande));
          const altoEmCasas = (DADO_NO_ALVO.lado.mesa + DADO_NO_ALVO.respiro * 2 + DADO_NO_ALVO.abaixoDaFicha) / ladoPx;
          const fundo = vista && Array.isArray(vista.janela) && !grande ? Math.min(g.altura, (vista.y0 || 0) + vista.janela[1]) : g.altura;
          const cx = `${((e.x + n / 2) / g.largura) * 100}%`;
          let pos;
          if (l.deles && l.de && l.de.x != null) {
            const dx = l.de.x - e.x, dy = l.de.y - e.y;
            pos = Math.abs(dx) > Math.abs(dy)
              ? (dx < 0
                ? { left: `${((e.x + n) / g.largura) * 100}%`, top: `${((e.y + n / 2) / g.altura) * 100}%`, transform: `translate(${DADO_NO_ALVO.entre}px, -50%)` }
                : { left: `${(e.x / g.largura) * 100}%`, top: `${((e.y + n / 2) / g.altura) * 100}%`, transform: `translate(calc(-100% - ${DADO_NO_ALVO.entre}px), -50%)` })
              : (dy > 0
                ? { left: cx, top: `${(e.y / g.altura) * 100}%`, transform: `translate(-50%, calc(-100% - ${DADO_NO_ALVO.abaixoDaFicha}px))` }
                : { left: cx, top: `${((e.y + n) / g.altura) * 100}%`, transform: `translate(-50%, ${DADO_NO_ALVO.abaixoDaFicha}px)` });
          } else {
            const cabePorBaixo = e.y + n + altoEmCasas <= fundo;
            pos = cabePorBaixo
              ? { left: cx, top: `${((e.y + n) / g.altura) * 100}%`, transform: `translate(-50%, ${DADO_NO_ALVO.abaixoDaFicha}px)` }
              : { left: cx, top: `${(e.y / g.altura) * 100}%`, transform: `translate(-50%, calc(-100% - ${DADO_NO_ALVO.abaixoDaFicha}px))` };
          }
          return (
            <span key={`dado${l.chave}`} style={{ position: "absolute", zIndex: 4, ...pos, opacity: lanceAgora.esvai ? 0 : 1, transition: `opacity ${GOLPE_SENTIDO.esvai}ms ease-in` }}>
              <DadoNoAlvo lance={l} pousou={lanceAgora.pousou} telefone={reguaPresa} parado={parado} />
            </span>
          );
        })}
        {alvoDaPrevisao && !(emp && emp.alvo === alvoDaPrevisao) && !(lanceDoHeroi && !lanceAgora.acabou && lances.some((l) => l.heroi && l.alvo === alvoDaPrevisao)) && (() => {
          const e = inimigos.find((x) => x.nome === alvoDaPrevisao);
          if (!e || e.x == null) return null;
          const n = ladoDe(e);
          return (
            <span style={{ position: "absolute", zIndex: 3, left: `${((e.x + n / 2) / g.largura) * 100}%`, top: `${((e.y + n) / g.altura) * 100}%`, transform: `translate(-50%, ${PREVISAO_DO_GOLPE.abaixoDaFicha}px)` }}>
              <PilulaDaPrevisao previsao={previsaoDoGolpe} caminho={pontosDoCaminho.length > 1 ? { metros: caminho.metros } : null} />
            </span>
          );
        })()}
        {/* CB 18.4 a · a pílula do empurrão debaixo do alvo, e os rótulos
            empilhados ao lado da casa final (colisão → queda → superfície);
            do lado de dentro do tabuleiro quando a casa final encosta à
            direita */}
        {emp && alvoDoEmpurrao && alvoDoEmpurrao.x != null && (() => {
          const n = ladoDe(alvoDoEmpurrao);
          return (
            <span style={{ position: "absolute", zIndex: 3, left: `${((alvoDoEmpurrao.x + n / 2) / g.largura) * 100}%`, top: `${((alvoDoEmpurrao.y + n) / g.altura) * 100}%`, transform: `translate(-50%, ${PREVISAO_DO_GOLPE.abaixoDaFicha}px)` }}>
              <PilulaDoEmpurrao previsao={emp.previsao} vida={alvoDoEmpurrao.vida} />
            </span>
          );
        })()}
        {setaDoEmp && rotulosDoEmp && (() => {
          const d = setaDoEmp.para;
          const R = EMPURRAO_NA_MESA.rotulo;
          const aDireita = d.x + 1 < g.largura * 0.7;
          return (
            <span style={{ position: "absolute", zIndex: 3, display: "flex", flexDirection: "column", alignItems: aDireita ? "flex-start" : "flex-end", gap: R.entre,
              left: `${((aDireita ? d.x + 1 : d.x) / g.largura) * 100}%`, top: `${((d.y + 0.5) / g.altura) * 100}%`,
              transform: aDireita ? `translate(${R.entre * 2}px, -50%)` : `translate(calc(-100% - ${R.entre * 2}px), -50%)` }}>
              {rotulosDoEmp.rotulos.map((r) => <RotuloDoEmpurrao key={r.tipo} rotulo={r} />)}
            </span>
          );
        })()}
        {/* CB 18.3 · o rótulo do objeto apontado: «barril de óleo · explode: −9 em 9 casas, deixa fogo» */}
        {objetoApontado && previsaoDoObjeto && (
          <span className="tv-mono" style={{ position: "absolute", zIndex: 3, left: `${((objetoApontado.x + 0.5) / g.largura) * 100}%`, top: `${(objetoApontado.y / g.altura) * 100}%`,
            transform: `translate(-50%, calc(-100% - ${OBJETOS_NA_MESA.selo.lado}px))`, fontSize: CAMINHO_NO_CHAO.rotulo, fontWeight: 700, color: T.ink, background: T.pagina,
            border: `${EMPURRAO_NA_MESA.rotulo.aro}px solid ${T.danger}`, borderRadius: PREVISAO_DO_GOLPE.raio, padding: `2px ${EMPURRAO_NA_MESA.rotulo.enchimento.x}px`, whiteSpace: "nowrap" }}>
            {previsaoDoObjeto.rotulo}
          </span>
        )}
        {/* CB 18.5 · o letreiro da primeira reação de cada tipo */}
        {reacoesNaMesa.filter((r) => r.tempo.primeira && r.letreiro).map((r) => (
          <LetreiroDaReacao key={`let${r.chave}`} reacao={r} largura={g.largura} altura={g.altura} parado={parado} ladoPx={ladoEmPx(grande)} />
        ))}
        {pontosDoCaminho.length > 1 && caminho.metros != null && (() => {
          const d = pontosDoCaminho[pontosDoCaminho.length - 1];
          return (
            <span className="tv-mono" style={{ position: "absolute", zIndex: 2, left: `${((d.x + 0.5) / g.largura) * 100}%`, top: `${((d.y + 1) / g.altura) * 100}%`, transform: "translate(-50%, 2px)",
              fontSize: CAMINHO_NO_CHAO.rotulo, fontWeight: 700, color: T.ink, background: T.pagina, border: `1px solid ${T.amber}`, borderRadius: PREVISAO_DO_GOLPE.raio, padding: "2px 8px", whiteSpace: "nowrap" }}>
              {metrosTxt(caminho.metros)} m{caminho.sobraM != null ? ` · sobra ${metrosTxt(caminho.sobraM)}` : ""}
              {/* CB 18.4 c: o preço do perigo no mesmo rótulo — «· [bolhas] atravessa veneno · −3» */}
              {caminhoPerigoso && caminhoPerigoso.avisos.map((a) => (
                <span key={`av${a.tipo}`} style={{ color: T.danger }}> · {a.glifo && <Glifo nome={a.glifo} tamanho={TIPOS.piso} cor={SUPERFICIES_NO_CHAO.tipos[a.tipo].traco} />} {a.texto}</span>
              ))}
            </span>
          );
        })()}
        {veuDoUltimo && (() => {
          const e = ((combate.inimigos) || []).find((x) => x && x.nome === veuDoUltimo && x.x != null);
          if (!e) return null;
          const n = ladoDe(e);
          const L = g.largura, A = g.altura;
          /* o véu em quatro faixas à volta da casa dele: a casa fica limpa */
          const x0 = (e.x / L) * 100, x1 = ((e.x + n) / L) * 100, y0 = (e.y / A) * 100, y1 = ((e.y + n) / A) * 100;
          const veu = { position: "absolute", background: alfa(T.bg, FECHO_DA_QUEDA.veuDoUltimo) };
          return (
            <>
              <span aria-hidden="true" style={{ ...veu, left: 0, top: 0, right: 0, height: `${y0}%` }} />
              <span aria-hidden="true" style={{ ...veu, left: 0, top: `${y1}%`, right: 0, bottom: 0 }} />
              <span aria-hidden="true" style={{ ...veu, left: 0, top: `${y0}%`, width: `${x0}%`, height: `${y1 - y0}%` }} />
              <span aria-hidden="true" style={{ ...veu, left: `${x1}%`, top: `${y0}%`, right: 0, height: `${y1 - y0}%` }} />
              <span aria-hidden="true" style={{ position: "absolute", left: `${x0}%`, top: `${y0}%`, width: `${x1 - x0}%`, height: `${y1 - y0}%`, borderRadius: "50%", border: `${PREVISAO_DO_GOLPE.anelDoAlvo.traco}px solid ${T.amber}` }} />
            </>
          );
        })()}
        {quedasNaMesa.map((q) => {
          const e = ((combate.inimigos) || []).find((x) => x && x.nome === q.nome && x.x != null);
          const c = chipDaQueda(q.nome, q.escolha);
          if (!e || !c) return null;
          const n = ladoDe(e);
          return (
            /* 19.ª sessão, defeito 5: o chip pousa SOBRE as casas de baixo, e
               o texto dele não é alvo — o toque atravessa-o até à casa (o
               Mover que armava e desarmava sem mexer). Só o botão do outro
               lado apanha o toque, e esse toque não é «tocar o campo»: não
               desarma o verbo (stopPropagation no pointerdown). */
            <span key={`queda${q.chave}`} role="status" className="tv-mono inline-flex items-center"
              style={{ position: "absolute", zIndex: 5, pointerEvents: "none", left: `${((e.x + n / 2) / g.largura) * 100}%`, top: `${((e.y + n) / g.altura) * 100}%`, transform: "translate(-50%, 4px)",
                minHeight: FECHO_DA_QUEDA.alto, borderRadius: FECHO_DA_QUEDA.raio, padding: `1px 2px 1px 10px`, gap: 6, whiteSpace: "nowrap",
                fontSize: TIPOS.piso, color: T.ink, background: T.pagina, border: `1px solid ${T.lineStrong}` }}>
              {c.texto}
              {aoMudarQueda && (
                <button onPointerDown={(ev) => ev.stopPropagation()}
                  onClick={() => { try { aoMudarQueda(q.chave, c.outraEscolha); } catch (er) { console.warn("GridDeBatalha: mudar a queda falhou", er); } }}
                  className="tv-anel-foco tv-mono" style={{ pointerEvents: "auto", minHeight: FECHO_DA_QUEDA.alto - 2, padding: "0 8px", borderRadius: FECHO_DA_QUEDA.raio, fontSize: TIPOS.piso, fontWeight: 700,
                    color: c.outraEscolha === "letal" ? T.danger : T.ok, border: `1px solid ${T.line}`, background: T.panelSoft }}>
                  {c.outro}
                </button>
              )}
            </span>
          );
        })}
        {golpesNaMesa.map((gq) => {
          const ehHeroi = gq.alvo === ((heroiFicha && heroiFicha.nome) || heroiNome);
          const ent = ehHeroi ? heroi : inimigos.find((x) => x.nome === gq.alvo) || aliados.find((x) => x.nome === gq.alvo) || caidosComCasa.find((x) => x.nome === gq.alvo);
          if (!ent || ent.x == null) return null;
          const n = ladoDe(ent);
          return (
            <span key={`num${gq.chave}`} style={{ position: "absolute", zIndex: 4, left: `${((ent.x + n / 2) / g.largura) * 100}%`, top: `${((ent.y + 0.1) / g.altura) * 100}%`, transform: "translate(-50%, -50%)" }}>
              <NumeroDoGolpe variacao={gq} reduzido={parado} />
            </span>
          );
        })}
      </div>
      </div>
    </div>
    );
  };

  /* AS TARJAS DO CAMPO — o golpe livre, o passo, a rota, a mira, a área.
     B1: são as mesmas nos dois sítios onde o campo as escreve (o cabeçalho
     de sempre, e o pé da arena da tela da batalha), e por isso nascem uma
     vez só. */
  /* §CB 16.3 · OS CHIPS DO PÉ DO CAMPO, a 12 (`TIPOS.piso`; as tarjas
     estavam a 9, abaixo do piso). Cada coisa foi para onde já era dita: a
     tarja do passo («6 de 9 m») mora na Economia (coluna Tu e tira) e o seu
     `title` passou ao movimento de lá; o resumo da área é o TEXTO DO
     VEREDITO enquanto se mira (painel-batalha.jsx); a legenda do passo é a
     primeira linha da vista ⤢. Ficam o golpe livre, a rota, o andar/mirar
     da área e o alcance do alvo único. */
  const chip = { display: "inline-flex", alignItems: "center", gap: 4, height: B3.chipDoPe.alto, padding: `0 ${MB.chipLadoX / 2 + 2}px`, borderRadius: B3.chipDoPe.raio, fontSize: TIPOS.piso, whiteSpace: "nowrap", flexShrink: 0 };
  const altoDoBotaoDoPe = peCompacto ? B3.telefone.pe : B3.pe;
  const tarjas = (
    <>
      {colados.length > 0 && (
        <span className="tv-mono" style={{ ...chip, color: T.danger, border: `1px solid ${T.danger}` }} title="Sair de perto de um inimigo dá a ele um golpe livre">
          <Glifo nome="espadas" tamanho={12} /> sair: {colados.length === 1 ? "golpe livre" : `${colados.length} golpes livres`}
        </span>
      )}
      {rotaPrevista && (
        <span className="tv-mono" style={{ ...chip, color: T.amberSoft }}>
          ↳ {metrosTxt(rotaPrevista.custoM)} m até ali
        </span>
      )}
      {/* a de alvo único diz o alcance em palavras, já que não tem botão */}
      {!podeMirar && alcanceMira && alcanceMira.nome && (
        <span className="tv-mono" style={{ ...chip, color: T.violetSoft, border: `1px solid ${T.violet}` }}
          title="O tracejado roxo é até onde esta habilidade chega. Fora dele, não há disparo — e o PM não é gasto.">
          ◎ {alcanceMira.nome} alcança {metrosTxt(alcanceMira.alcanceM)} m
        </span>
      )}
      {podeMirar && (
        <button onClick={() => setModo((m) => (m === "mirar" ? "andar" : "mirar"))}
          title={mirando ? "Voltar a andar pelo tabuleiro" : `Escolher onde ${alcanceMira.nome} vai cair`}
          className="tv-anel-foco tv-mono"
          style={{ ...chip, height: altoDoBotaoDoPe, minHeight: altoDoBotaoDoPe, borderRadius: altoDoBotaoDoPe / 2, background: mirando ? T.violet : "transparent", color: mirando ? T.onSecond : T.violetSoft, border: `1px solid ${T.violet}` }}>
          {mirando ? `◎ mirando ${alcanceMira.nome} — toque onde cai` : <><Glifo nome="passo" tamanho={12} /> andando — toque para mirar {alcanceMira.nome}</>}
        </button>
      )}
    </>
  );
  /* B1b: no pé da arena do MONITOR o `⤢ ampliar` fica no piso da casa de
     rato (32, WCAG 2.5.8 AA) — o pé do quadro mede 22, e um botão de 48 ali
     comia 26 px ao tabuleiro, que é a vista que agora cabe inteira. No
     telefone (`peCompacto`) e fora da mesa, o piso do dedo de sempre. */
  /* §CB 16.3: e passa a botão-glifo no fim do Pé do campo — 32 × 32 no
     monitor, 44 × 44 no telefone (`B3.telefone.pe`), o nome no
     `aria-label` e no `title` */
  const alvoDoAmpliar = pe && !peCompacto ? MB.casaMinimaNoMonitor : peCompacto ? B3.telefone.pe : ALVOS.piso;
  const ampliar = (
      <button onClick={() => setAberto(true)} title="Ver o campo inteiro" aria-label="Ver o campo inteiro"
        className="tv-anel-foco tv-mono ml-auto rounded-lg flex items-center justify-center shrink-0"
        style={{ width: alvoDoAmpliar, height: alvoDoAmpliar, minHeight: alvoDoAmpliar, minWidth: alvoDoAmpliar, border: `1px solid ${T.line}`, color: T.inkDim, fontSize: TIPOS.piso + 4 }}>
        <span aria-hidden="true">⤢</span>
      </button>
  );
  const cabecalho = (
    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
      <span className="tv-mono uppercase tracking-widest" style={{ color: T.inkDim, fontSize: TIPOS.piso }}>
        campo · {g.largura}×{g.altura} quadrados de 1,5 m
      </span>
      {tarjas}
      {ampliar}
    </div>
  );

  /* ============================================================
     B1 · O PÉ DA ARENA — a "Legenda do alcance" do quadro

     À esquerda `ÁREA DE MOVIMENTO`; à direita os custos DISTINTOS que o
     conjunto aceso tem, em ordem (no quadro, `3 · 6 · 9 — CUSTO NO
     TERRENO`). Saem do MESMO mapa que escreve o número dentro de cada
     casa (`custosDe`) — uma segunda busca divergiria no dia em que alguém
     mexesse numa delas. Sem passo aceso, a legenda cala: dizer "área de
     movimento" sem área nenhuma seria a tela a mentir.

     As tarjas e o `⤢ ampliar` vêm junto: o quadro não as desenha, mas
     são o passo que sobra, o golpe livre, a mira e a vista inteira — *nada
     se corta, traduz-se* (lei 3 da Fase V). Moram no pé, fora da janela
     que rola, como a legenda. ============================================ */
  /* A1 · A LEGENDA MUDA DE CONTEÚDO, NÃO DE FORMA (`formas.md` §A1 6): em vez
     da lista dos custos distintos (uma planilha ao pé de outra), a regra e a
     exceção em língua de mundo — `1,5 m por casa`, e `· na encosta, 3 m` só
     quando o conjunto aceso tem terreno difícil (`legendaDoPasso`, glifos.js,
     sobre o MESMO mapa). */
  const custosAcesos = [...new Set(custoDoPasso.values())].sort((a, b) => a - b);
  const legendaDoPe = { fontSize: MB.letra.legenda, letterSpacing: MB.rastreio, textTransform: "uppercase" };
  const textoDaLegenda = (() => { try { return legendaDoPasso(custoDoPasso, grade, { ignoraDificil }); } catch (e) { return ""; } })();
  /* §CB 16.3: o pé da arena dissolve-se no Pé do campo (painel-batalha.jsx),
     que tem altura fixa — aqui ficam só os chips e o ⤢, numa linha que não
     quebra. «Área de movimento» e a legenda do passo vão para a primeira
     linha da legenda da vista ⤢; o custo continua escrito em cada casa. */
  const peDaArena = (
    <div className="flex items-center justify-end min-w-0" style={{ gap: MB.entreVerbos, height: "100%" }}>
      {tarjas}
      {ampliar}
    </div>
  );

  return (
    /* B1b: dentro da janela da mesa (`pe`) o tabuleiro não leva margem por
       baixo — oito píxeis a mais que o lado não conta seriam oito píxeis de
       rolagem num tabuleiro que cabe */
    <div className={pe ? "" : "mb-2"}>
      {/* quantas casas o passo acende, dito a quem monta a tela: é o
          número que decide se o verbo do passo pode armar. Uma vez só,
          fora dos dois tabuleiros — a medida é do conjunto, não do
          desenho dele. */}
      <MedidorDoConjunto casas={podeIr.size} aoMedir={aoMedirOPasso} />
      {/* B1: e o lado que a casa ganhou, para a câmara enquadrar certo */}
      <MedidorDoLado lado={ladoEmPx(false)} aoMedir={aoMedirOLado} />
      {pe ? createPortal(peDaArena, pe) : cabecalho}
      {golpeComBorda && !movimentoParado() && (
        <div key={`borda${golpeComBorda.chave}`} aria-hidden="true" className="tv-golpe-borda"
          style={{ position: "fixed", inset: 0, zIndex: 60, pointerEvents: "none", boxShadow: `inset 0 0 0 ${GOLPE_SENTIDO.emTi.borda}px ${alfa(T.danger, GOLPE_SENTIDO.emTi.alfa)}` }} />
      )}
      {tabuleiro(false)}
      {aberto && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4" style={{ background: "rgba(8,6,14,0.92)", backdropFilter: "blur(3px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setAberto(false); }}>
          <div className="tv-mono text-xs uppercase tracking-widest mb-2 text-center" style={{ color: T.amberSoft, maxWidth: "100%" }}>
            {g.cenario} · {g.largura}×{g.altura} quadrados de 1,5 m
          </div>
          {tabuleiro(true)}
          {/* v9.125: a legenda falava de 🧍🛡👹, que saíram do tabuleiro. Uma
              legenda que descreve o desenho anterior é pior do que nenhuma —
              ela ensina a procurar o que não está lá. */}
          {/* §CB 16.3: a primeira linha da legenda é a do passo, que saiu do pé */}
          {custosAcesos.length > 0 && !mirando && (
            <div className="flex flex-wrap items-center justify-center mt-3 tv-mono" style={{ gap: MB.chipLadoX, fontSize: TIPOS.piso, maxWidth: "min(640px, 100%)" }}>
              <span style={{ ...legendaDoPe, fontSize: TIPOS.piso, color: T.amberSoft }}>Área de movimento</span>
              {textoDaLegenda && <span style={{ ...legendaDoPe, fontSize: TIPOS.piso, color: T.inkDim }}>{textoDaLegenda}</span>}
            </div>
          )}
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 mt-3 tv-mono text-[10px]" style={{ color: T.inkDim, maxWidth: "min(640px, 100%)" }}>
            <span style={{ color: T.amberSoft }}>◍ o rosto de cada um</span>
            <span>· o anel é a vida</span>
            <span>· <b style={{ color: T.amber }}>tracejado dourado</b>: até onde se chega neste turno</span>
            <span>· <b style={{ color: T.violetSoft }}>tracejado roxo</b>: até onde a habilidade alcança</span>
            <span>· <b style={{ color: T.danger }}>vermelho</b>: a área da magia</span>
            <span>· o escuro está fora do seu alcance</span>
          </div>
          {(inimigos.length > 0 && heroi) && (
            <div className="tv-body text-[11px] mt-2 text-center" style={{ color: T.inkDim, maxWidth: "min(640px, 100%)" }}>
              {inimigos.map((e) => `${e.nome} a ${Math.round(distanciaM(heroi, e))} m${ladoDe(e) > 1 ? ` (${tamanhoDe(e).nome.toLowerCase()}, alcança ${alcanceNatural(e)} m)` : ""}`).join(" · ")}
            </div>
          )}
          <button onClick={() => setAberto(false)} className="mt-3 rounded-xl px-5 py-2 tv-mono text-sm" style={{ background: T.amber, color: T.onAccent, fontWeight: 600 }}>
            Fechar e agir →
          </button>
        </div>
      )}
    </div>
  );
}
