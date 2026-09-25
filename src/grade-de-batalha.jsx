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
import { T, ALVOS } from "./constantes.js";
import { garantirGrade, custosDe, ocupacaoDe, adjacentes, caminhar, quadradosDe, ladoDe, tamanhoDe, ehParede, ehEstorvo, terrenoDificil, temCobertura, nomeDoLugar, distanciaM, alcanceNatural, metrosTxt } from "./grid.js";
/* E4: a geometria do que se escreve DENTRO da casa sai da tabela. `T` e
   `ALVOS` continuam a vir por `constantes.js`, que os reexporta deste
   mesmo arquivo — é o mesmo objeto, e não uma segunda paleta. */
import { TELA_DE_BATALHA } from "./estilo.js";
/* v9.161: a ficha do tabuleiro ganha ROSTO — o mesmo da bolinha do grupo e
   da carta de tarô, porque uma pessoa com três caras conforme o painel é o
   defeito que o rosto único veio matar. E a faixa do chefe lê a MESMA
   tabela de viradas que o sistema aplicou: `viradasFeitas` guarda o limiar
   cruzado, e `fasesDoChefe` é determinístico pelo nome — reler não é
   recalcular, é abrir o mesmo livro na mesma página. */
import { Rosto } from "./rosto.jsx";
import { sementeDe, estadoDe } from "./semente.js";
import { fasesDoChefe, viradaPorId } from "./masmorras.js";
import { IconeEscudoAlerta, Glifo } from "./ui.jsx";
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
function RotuloDaRegua({ texto, grau, coluna, parado }) {
  const d = GRAUS_DA_REGUA[grau] || GRAUS_DA_REGUA.repouso;
  /* Sob `prefers-reduced-motion` a troca pousa no ESTADO FINAL — a cor de
     chegada, de uma vez. Nenhuma classe nova nasce por causa disto: a
     transição é do elemento, e a saída é o próprio tempo a zero. */
  const anda = `${parado ? 0 : MS_DA_REGUA}ms linear`;
  return (
    <div style={{ flex: 1, minWidth: 0, minHeight: 0, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
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
function Ficha({ ent, tipo, cor, x, y, lado, ms, grande, rotulo = null }) {
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
  return (
    <g style={{ transform: `translate(${cx}px, ${cy}px)`, transition: `transform ${ms}ms linear` }}>
      {tipo === "heroi" && <circle r={r * 1.5} fill={T.amber} opacity={0.12} />}
      <circle r={r} fill="#100e1a" stroke={cor} strokeWidth={lado * 0.055} />
      <clipPath id={uid}><circle r={r * 0.94} /></clipPath>
      <g clipPath={`url(#${uid})`} style={{ pointerEvents: "none" }}>
        <g transform={`translate(${-32 * s} ${-30.5 * s}) scale(${s})`}>
          <Rosto semente={sementeDe(ent)} estado={estadoDe(pv, pvMax, tipo === "inimigo")} ente={ent} />
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
    </g>
  );
}

/* `ladoFixo` (E3): o lado da casa em píxeis, imposto por quem monta. Com
   ele o tabuleiro deixa de ser "o campo inteiro espremido no espaço que
   houver" e passa a ser uma JANELA SOBRE UM CAMPO — *quem encolhe é o
   campo visível, nunca o alvo*. A tela da batalha passa `ALVOS.piso`
   (48), que é o menor lado que passa em WCAG 2.5.5, HIG e Material ao
   mesmo tempo, e nenhum dos quatro tamanhos de antes lá chegava (23,8 no
   embutido 16×16, 36,6 no ampliado). Zero (o defeito) mantém, byte a
   byte, a conta antiga — quem não pede janela continua com o relance. */
export function GridDeBatalha({ combate, grupo = [], heroiFicha = null, previsao = null, passoM = 9, passoTotal = 9, ignoraDificil = false, podeMover = true, onMover, mira = null, onMirar, alcanceMira = null, ladoFixo = 0, aoMedirOPasso = null }) {
  const [aberto, setAberto] = React.useState(false);

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
    for (const { ent, id } of todos) {
      const v = Math.max(0, ent.vida || 0);
      agora.set(id, v);
      const antes = vidasRef.current.get(id);
      if (antes != null && v !== antes) {
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
  const naArea = new Set(((previsao && previsao.quadrados) || []).map((q) => K(q.x, q.y)));
  const noAlcance = (alcanceMira && alcanceMira.quadrados) || new Set();

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
  const ladoEmPx = (grande) => {
    try {
      if (!grande) return ladoFixo > 0 ? ladoFixo : Math.min(40, 380 / g.altura);
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
    /* rotula uma a cada N; as outras levam só um traço. Na mesa (48 px)
       N = 1; no aperto máximo que existe — 18 colunas em 375 px, 18,8 px
       de lado — N = 2. A letra nunca precisa de sair. */
    const passoDoRotulo = Math.max(1, Math.ceil(LADO_QUE_CABE_UM_ROTULO / Math.max(1, ladoEmPx(grande))));
    const parado = movimentoParado();
    /* O NÚMERO SÓ SE ESCREVE ONDE ELE SE LÊ. O corpo é dado em píxeis
       sobre a casa de `ALVOS.piso`, e dentro do SVG ele escala com a
       casa: numa casa de 24 px o 10 vira 5, e cinco píxeis de mono não
       são um número, são sujidade. Abaixo do piso do alvo, nada. */
    const escreveOCusto = !mirando && custoDoPasso.size > 0 && ladoEmPx(grande) >= ALVOS.piso;
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
    <div style={{ display: "grid", gridTemplateColumns: `${CALHA_DA_REGUA}px 1fr`, gridTemplateRows: `${CALHA_DA_REGUA}px auto`,
      /* com lado imposto a caixa NÃO encolhe: é a janela que corta o campo,
         e é o rolador do pai que mostra o resto. Sem ele, `width: 100%`
         devolveria a casa ao tamanho do buraco — o defeito que E1 mediu. */
      width: !grande && ladoFixo > 0 ? larguraDoCampo + CALHA_DA_REGUA : "100%",
      flexShrink: 0,
      maxWidth: grande ? `calc(${larguraDoCampo} + ${CALHA_DA_REGUA}px)` : larguraDoCampo + CALHA_DA_REGUA, margin: "0 auto", background: T.bg }}>
      {/* o canto é `bg` e não leva rótulo: `A1` não se escreve duas vezes */}
      <div aria-hidden="true" />
      <div aria-hidden="true" style={{ display: "flex", alignItems: "stretch" }}>
        {Array.from({ length: g.largura }).map((_, x) => (
          <RotuloDaRegua key={`rc${x}`} coluna parado={parado} grau={grauDaColuna(x)}
            texto={x % passoDoRotulo === 0 ? (LETRAS_DA_GRADE[x] || "") : ""} />
        ))}
      </div>
      <div aria-hidden="true" style={{ display: "flex", flexDirection: "column", alignItems: "stretch" }}>
        {Array.from({ length: g.altura }).map((_, y) => (
          <RotuloDaRegua key={`rn${y}`} coluna={false} parado={parado} grau={grauDaLinha(y)}
            texto={y % passoDoRotulo === 0 ? String(y + 1) : ""} />
        ))}
      </div>
      {/* e o campo, no quadrante que sobra. `position: relative` é o chão
          da faixa do chefe, e continua a ser. */}
      <div style={{ position: "relative", width: "100%", aspectRatio: `${g.largura} / ${g.altura}` }}>
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
          <pattern id="tv-lama" width="0.5" height="0.5" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
            <line x1="0" y1="0" x2="0" y2="0.5" stroke="rgba(190,150,90,0.30)" strokeWidth="0.07" />
          </pattern>
        </defs>

        {/* AS REGIÕES SÃO O VOCABULÁRIO DO MESTRE (v9.125): ele narra "no vão
            da porta", nunca "quadrado 3,8". Antes o nome só existia no balão
            de ajuda; agora está escrito no chão, e o jogador lê a cena com as
            mesmas palavras que vai ouvir de volta. */}
        {g.regioes.map((r, i) => (
          <g key={r.nome + i}>
            <rect x={r.x0} y={r.y0} width={r.x1 - r.x0 + 1} height={r.y1 - r.y0 + 1}
              fill={i % 2 ? "rgba(255,255,255,0.016)" : "transparent"} />
            {/* no canto da faixa, e não no meio dela: o meio é onde as fichas
                andam, e um nome de lugar por baixo de um inimigo não é nome
                nenhum. No canto ele fica como legenda de planta baixa. */}
            <text className="tv-mono" x={r.x0 + 0.22} y={r.y0 + 0.48} textAnchor="start" dominantBaseline="central"
              fill={T.ink} opacity={0.26}
              style={{ fontSize: Math.min(0.32, (r.x1 - r.x0 + 1) / (r.nome.length * 0.75)), pointerEvents: "none", textTransform: "uppercase", letterSpacing: 0.03 }}>
              {r.nome}
            </text>
          </g>
        ))}

        {/* terreno difícil e cobertura: o chão que cobra e o chão que protege */}
        {dificeis.map(([x, y]) => <rect key={`d${x},${y}`} x={x} y={y} width="1" height="1" fill="url(#tv-lama)" />)}
        {coberturas.map(([x, y]) => <rect key={`c${x},${y}`} x={x} y={y} width="1" height="1" fill="rgba(120,140,190,0.09)" />)}

        {/* a malha, fina o bastante para orientar e apagada o bastante para
            não competir com nada que esteja em cima dela */}
        <g stroke={T.line} strokeWidth="0.025" opacity="0.9">
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

        {/* o estorvo é a mesa virada, o barril, a estalagmite: não bloqueia
            passagem nem visão, e dá cobertura a quem se cola nele */}
        {estorvos.map(([x, y]) => (
          <g key={`e${x},${y}`}>
            <ellipse cx={x + 0.5} cy={y + 0.58} rx="0.31" ry="0.26" fill="#2b2340" stroke="#544877" strokeWidth="0.045" />
            <ellipse cx={x + 0.5} cy={y + 0.45} rx="0.31" ry="0.2" fill="#3a3157" stroke="#544877" strokeWidth="0.03" />
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
            {veu.map(([x, y]) => <rect key={`v${x},${y}`} x={x} y={y} width="1" height="1" fill="rgba(7,5,12,0.46)" />)}
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
            <Contorno linhas={contorno(alcanceCheio)} cor={mirando ? T.violetSoft : T.amber} largura={0.045} tracejado="0.22 0.18" opacidade={0.6} />
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
            px o número não se lê, e o relance compacto não é para agir. */}
        {escreveOCusto && (
          <g className="tv-mono" style={{ pointerEvents: "none" }}>
            {[...custoDoPasso].map(([k, metros]) => {
              const [cx, cy] = k.split(",").map(Number);
              return (
                <text key={`custo${k}`} x={cx + 0.5} y={cy + TELA_DE_BATALHA.casa.linhaDoCusto}
                  textAnchor="middle" dominantBaseline="central" fill={T.amberSoft}
                  style={{ fontSize: TELA_DE_BATALHA.casa.corpoDoCusto / ALVOS.piso, fontWeight: 700 }}>
                  {metrosTxt(metros)}
                </text>
              );
            })}
          </g>
        )}

        {/* AS FICHAS */}
        <g style={{ pointerEvents: "none" }}>
          {aliados.map((a, i) => (a.vida || 0) > 0 && a.x != null ? (
            <Ficha key={`al${i}`} ent={a} tipo="aliado" cor={T.ok} x={a.x} y={a.y} lado={ladoDe(a)} ms={260} grande={grande} />
          ) : null)}
          {inimigos.map((e, i) => e.x != null ? (
            <Ficha key={`in${e.nome}-${i}`} ent={e} tipo="inimigo" cor={T.danger} x={e.x} y={e.y} lado={ladoDe(e)} ms={260} grande={grande} />
          ) : null)}
          {heroi && heroi.x != null && (
            /* a ficha completa entra por baixo: a entidade da grade só tem
               nome e lugar, e o rosto precisa da classe e da vida — a
               posição da grade ganha por cima, que é a verdade do turno */
            <Ficha ent={{ ...(heroiFicha || {}), ...heroi }} rotulo="você" tipo="heroi" cor={T.amber} lado={ladoDe(heroi)} grande={grande}
              x={andando ? andando.rota[andando.i].x : heroi.x}
              y={andando ? andando.rota[andando.i].y : heroi.y}
              ms={andando ? andando.ms : 260} />
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
            strokeWidth={TELA_DE_BATALHA.casa.anelDaParagem / ALVOS.piso}
            x={casaDaParagem.x + TELA_DE_BATALHA.casa.anelDaParagem / ALVOS.piso / 2}
            y={casaDaParagem.y + TELA_DE_BATALHA.casa.anelDaParagem / ALVOS.piso / 2}
            width={1 - TELA_DE_BATALHA.casa.anelDaParagem / ALVOS.piso}
            height={1 - TELA_DE_BATALHA.casa.anelDaParagem / ALVOS.piso} />
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
                const veredito = tiro ? `dá para fazer ${alcanceMira.nome} cair aqui`
                  : mirando ? `${(alcanceMira && alcanceMira.nome) || "a habilidade"} não alcança ${end}`
                  : souEu ? `você já está em ${end}`
                  : parede ? `${end} é pedra`
                  : oc ? `${oc.ent.nome} está em ${end}`
                  : indo ? "dá para chegar aqui"
                  : passoM <= 0 ? `o seu passo acabou — ${end} fica para o próximo turno`
                  : podeMover ? `${end} fica fora do seu passo nesta rodada`
                  : `não dá para andar até ${end} agora`;
                const nomeDaCasa = [end, quem, lugar, veredito].filter(Boolean).join(" · ");
                const agir = () => { if (!clicavel) return; if (mirando) onMirar({ x, y }); else onMover && onMover({ x, y }); };
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
                    role="gridcell" aria-label={nomeDaCasa} tabIndex={ehAParagem ? 0 : -1}
                    onClick={agir}
                    onKeyDown={(ev) => {
                      if (ev.key === "Enter" || ev.key === " ") {
                        /* a casa que não dá NÃO engole a tecla: quem a
                           preme numa casa impedida já ouviu o veredito no
                           nome dela, e roubar-lhe a barra de espaço seria
                           cobrar-lhe o gesto duas vezes */
                        if (!clicavel) return;
                        ev.preventDefault(); agir(); return;
                      }
                      andarComTecla(ev, x, y);
                    }}
                    className="tv-anel-foco-no-campo"
                    onFocus={() => { setFocada({ x, y }); setParagem({ x, y }); }} onBlur={() => setFocada(null)}
                    onMouseEnter={() => setSobre({ x, y })} onMouseLeave={() => setSobre(null)}
                    style={{ cursor: clicavel ? "pointer" : "default" }} />
                );
              })}
            </g>
          ))}
        </g>
      </svg>
      </div>
    </div>
    );
  };

  const cabecalho = (
    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
      <span className="tv-mono text-[9px] uppercase tracking-widest" style={{ color: T.inkDim }}>
        campo · {g.largura}×{g.altura} quadrados de 1,5 m
      </span>
      {colados.length > 0 && (
        <span className="tv-mono text-[9px]" style={{ color: T.danger }} title="Sair de perto de um inimigo dá a ele um golpe livre">
          <Glifo nome="espadas" tamanho={12} /> sair custa {colados.length === 1 ? "um golpe livre" : `${colados.length} golpes livres`}
        </span>
      )}
      <span className="tv-mono text-[9px]" style={{ color: passoM > 0 ? T.inkDim : T.danger }}
        title="O que sobra do seu passo nesta rodada. Andar não gasta a ação: dá para dar dois passos, contornar e ainda golpear.">
        <Glifo nome="passo" tamanho={12} /> {metrosTxt(passoM)} de {metrosTxt(passoTotal)} m nesta rodada
      </span>
      {rotaPrevista && (
        <span className="tv-mono text-[9px]" style={{ color: T.amberSoft }}>
          ↳ {metrosTxt(rotaPrevista.custoM)} m até ali
        </span>
      )}
      {/* a de alvo único diz o alcance em palavras, já que não tem botão */}
      {!podeMirar && alcanceMira && alcanceMira.nome && (
        <span className="tv-mono text-[9px] px-2 py-0.5 rounded-full" style={{ color: T.violetSoft, border: `1px solid ${T.violet}` }}
          title="O tracejado roxo é até onde esta habilidade chega. Fora dele, não há disparo — e o PM não é gasto.">
          ◎ {alcanceMira.nome} alcança {metrosTxt(alcanceMira.alcanceM)} m
        </span>
      )}
      {podeMirar && (
        <button onClick={() => setModo((m) => (m === "mirar" ? "andar" : "mirar"))}
          title={mirando ? "Voltar a andar pelo tabuleiro" : `Escolher onde ${alcanceMira.nome} vai cair`}
          className="tv-mono text-[9px] px-2 py-0.5 rounded-full"
          style={{ background: mirando ? T.violet : "transparent", color: mirando ? T.onSecond : T.violetSoft, border: `1px solid ${T.violet}` }}>
          {mirando ? `◎ mirando ${alcanceMira.nome} — toque onde cai` : <><Glifo nome="passo" tamanho={12} /> andando — toque para mirar {alcanceMira.nome}</>}
        </button>
      )}
      {previsao && (
        <span className="tv-mono text-[9px] px-2 py-0.5 rounded-full" style={{ color: previsao.aliados.length ? T.danger : T.amberSoft, border: `1px solid ${previsao.aliados.length ? T.danger : T.amber}` }}>
          {previsao.aliados.length ? <Glifo nome="espadas" tamanho={12} rotulo="atinge aliados" /> : "◎"} {previsao.nome} ({previsao.forma}{previsao.raio ? ` de ${previsao.raio} m` : ""}): {previsao.inimigos.length} inimigo{previsao.inimigos.length === 1 ? "" : "s"}
          {previsao.aliados.length ? ` · PEGA ${previsao.aliados.join(", ")}` : " · nenhum aliado na área"}
        </span>
      )}
      <button onClick={() => setAberto(true)} title="Abrir o campo em tela cheia"
        className="tv-anel-foco tv-mono text-[9px] ml-auto px-3 rounded-lg flex items-center justify-center"
        style={{ minHeight: ALVOS.piso, minWidth: ALVOS.piso, border: `1px solid ${T.line}`, color: T.inkDim }}>
        ⤢ ampliar
      </button>
    </div>
  );

  return (
    <div className="mb-2">
      {/* quantas casas o passo acende, dito a quem monta a tela: é o
          número que decide se o verbo do passo pode armar. Uma vez só,
          fora dos dois tabuleiros — a medida é do conjunto, não do
          desenho dele. */}
      <MedidorDoConjunto casas={podeIr.size} aoMedir={aoMedirOPasso} />
      {cabecalho}
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
