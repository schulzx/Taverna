/* ============================================================
   A FOGUEIRA (Fase MM-C · C6, F1) — src/painel-fogueira.jsx

   A noite em que se escolhe com quem se senta. A forma é de
   `mente/formas.md` § Fogueira e do Figma (`ffWFqD7TueSb88Mkeg9bhW`,
   página `09 · Fogueira`, `196:2`); o momento é do `jogo`
   (`mente/coracao-c1-c2.md` §6). Este arquivo SÓ MONTA A TELA: não decide
   quem tem o que dizer, não aplica o descanso, não fala com o Narrador, não
   guarda nada. Quem decide é o motor (`nucleo.js`, `quemAoFogo` e vizinhos);
   quem liga é o `App.jsx` (o `oficial`, no «Descanso longo»).

   ------------------------------------------------------------
   O CONTRATO, prop a prop (para o `backend` e o `oficial` casarem)
   ------------------------------------------------------------
   <PainelFogueira
     roda        = [{ pessoa, voz, gesto }]
                   · NA ORDEM DOS PAPÉIS (companheiro, elo, voz, balança,
                     porta), nunca por quem tem o que dizer: o atalho 1–5 é
                     o lugar, e não troca de dono de noite para noite.
                   · só quem está presente; SEM o vilão; até FOGUEIRA.lugaresMax
                     (5) — o que passar disso não se desenha.
                   · `pessoa`: o ente do núcleo — lê-se `nome`, e `id` (ou o
                     nome, se não houver id) como chave; `semente` ou o nome
                     fazem o rosto (`sementeDe`).
                   · `voz`: "pedido" | "ficha" | null. Não-nulo = TEM O QUE
                     DIZER (a brasa, o lugar aceso, o gesto em inkMeio). null =
                     calado, e continua clicável.
                   · `gesto`: a linha sob o nome, já na voz do mundo — «enrola
                     a corda de treze nós nos dedos», ou «quer falar com você»
                     para o pedido maduro. NUNCA nome de mecanismo.
     abertura    = "A lenha estala. Ninguém tem pressa de dormir."  (opcional, A)
     fala        = { pessoa, texto }                                (B · C · B2)
                   · `texto`: a página na voz dela — string (parágrafos
                     separados por linha em branco) ou lista de parágrafos.
                   · `pessoa` pode ser um ente da `roda` (os outros ficam
                     «ao redor do fogo») ou outro com `nome`.
     escolha     = { a: { verbo, preco }, b: { verbo, preco }, adiar }   (C)
                   · os dois lados, do mesmo peso, o preço EM MUNDO.
                   · `adiar` (opcional): o preço de «Dormir sem responder»
                     («ela pergunta de novo amanhã»); sem ele, a frase neutra
                     de `PALAVRAS.adiar`.
     aguentaNoite= false   · C: true acende «Dormir sem responder». Sem ele, a
                             noite pede um lado.
     portaAberta = false   · B2: true acende «Ficar mais um pouco, só vocês
                             dois». SÓ quando o jogador a abriu (C3).
     manha       = { frase, recibo }                                (D · E)
                   · a linha do ladrilho que abre a manhã: o que ficou
                     decidido (D) ou quem ficou junto ao fogo (E), e o recibo
                     do descanso. A prosa da manhã é do Narrador, por baixo,
                     fora deste painel.
     escolhido   = chave | pessoa | null   · o lugar tocado, enquanto o
                   Narrador escreve: fica marcado (rosa) e os outros não
                   respondem a segundo toque.
     formato     = "mesa" | "baixa" | undefined   · sem ele, o painel mede-se
                   (FOGUEIRA.mesaPede e a tabela dos lugares).
     aoSentar(pessoa)        · A: sentar-se com alguém (um turno do Narrador)
     aoEscolher("a" | "b")   · C: o lado — fecha a noite
     aoDormir()              · A «Dormir já», B/B2 «Dormir», C «Dormir sem
                               responder» — fecha a noite sem lado
     aoFicar()               · B2: ficar mais um pouco
   />

   QUAL ESTADO SE DESENHA, e é a ordem dos dados que o decide:
     manha → D/E (só a linha do ladrilho) · fala → B, C (com `escolha`) ou B2
     (com `portaAberta`) · roda com alguém → A · nada → null.
   O E da secção («presentes, ninguém com o que dizer: a noite não toma a
   tela») NÃO é a roda sem brasas: é o App não abrir a noite e mandar só a
   `manha`. A roda com todos calados desenha-se (é escolha também), mas o App
   não deve chegar lá.

   O QUE NÃO SOUBE E DECIDI, o mais simples, anotado:
   · o corte Mesa × Baixa (o desenho fixou os dois quadros, não o corte) —
     ver `FOGUEIRA.mesaPede` em `estilo.js`;
   · o anel do retrato: a peça `Retrato` de § Retratos (papel por cor) ainda
     não existe em código; vai o `Retrato` de hoje com o anel `line`, e no
     dia em que a nova nascer é só aqui que troca;
   · o preço de «Dormir sem responder» sem `escolha.adiar` — a frase neutra;
   · Enter só arma «Dormir» quando o foco não está noutro controlo nem num
     campo de escrita (o compositor é do jogador).

   Nenhum componente nasce dentro do render (o foco). O movimento é da folha
   (`.tv-fogueira-*`, `MOVIMENTO_CSS`), com saída no reduced-motion.
   ============================================================ */
import React from "react";
import { T, ALVOS } from "./constantes.js";
import { TIPOS, LADRILHO, FOGUEIRA } from "./estilo.js";
import { Retrato, VerboComPreco, LadrilhoDoAssunto } from "./ui.jsx";
import { sementeDe } from "./semente.js";

/* AS PALAVRAS DA NOITE — o que é da tela e não vem do motor. Todas são da
   voz do mundo (§6: batida, ficha, núcleo, papel, subtrama, romance,
   afinidade, pedido NUNCA aparecem). */
const PALAVRAS = {
  pergunta: "Com quem você se senta esta noite?",
  dormirJa: { verbo: "Dormir já", preco: "a noite passa em silêncio" },
  dormir: { verbo: "Dormir", preco: "até de manhã" },
  adiar: { verbo: "Dormir sem responder", preco: "a pergunta fica para amanhã" },
  ficar: { verbo: "Ficar mais um pouco, só vocês dois", preco: "a conversa continua · a fogueira apaga-se devagar" },
  aFogueira: "à fogueira",
  aoRedor: "ao redor do fogo",
  sentar: "Sentar-me com",
  roda: "À fogueira",
};

/* O DESENHO DO FOGO E DA BRASA — a geometria dos nós `197:34` (Mesa e
   Baixa) e `197:7`, copiada do SVG exportado. A cor não mora aqui: vem de
   FOGUEIRA na hora de pintar. */
const DESENHO_DO_FOGO = {
  mesa: {
    w: 240, h: 132, fio: 1.3,
    lenha: [
      "M160.838 84.8512L77.8063 98.0021C75.2061 98.414 73.4322 100.856 73.844 103.456C74.2558 106.056 76.6975 107.83 79.2976 107.418L162.329 94.2672C164.929 93.8554 166.703 91.4137 166.292 88.8135C165.88 86.2134 163.438 84.4394 160.838 84.8512Z",
      "M162.194 98.0021L79.1621 84.8512C76.5619 84.4394 74.1202 86.2134 73.7084 88.8135C73.2966 91.4137 75.0706 93.8554 77.6707 94.2672L160.702 107.418C163.303 107.83 165.744 106.056 166.156 103.456C166.568 100.856 164.794 98.414 162.194 98.0021Z",
    ],
    chama: "M120 25.7525C124.667 39.6275 138.667 48.8775 138.667 67.3775C138.667 83.565 130.5 95.1275 120 95.1275C109.5 95.1275 101.333 83.565 101.333 67.3775C101.333 55.815 108.333 48.8775 111.833 39.6275C113 48.8775 116.5 53.5025 120 54.6587C120 44.2525 117.667 35.0025 120 25.7525Z",
    cerne: "M120 58.1275C123.5 66.2212 129.333 70.8462 129.333 78.94C129.333 87.0337 124.667 92.815 120 92.815C115.333 92.815 110.667 87.0337 110.667 78.94C110.667 73.1587 114.167 69.69 116.5 65.065C117.667 69.69 118.833 70.8462 120 72.0025C120 66.2212 118.833 62.7525 120 58.1275Z",
    faiscas: [[97.5, 25.26, 1.5], [140.2, 14.2, 1], [154.85, 35.57, 1.25]],
  },
  baixa: {
    w: 160, h: 48, fio: 0.6,
    lenha: [
      "M98.8483 31.1498L60.526 37.2195C59.3259 37.4095 58.5071 38.5365 58.6972 39.7365C58.8873 40.9366 60.0142 41.7554 61.2143 41.5653L99.5366 35.4956C100.737 35.3056 101.555 34.1786 101.365 32.9786C101.175 31.7785 100.048 30.9597 98.8483 31.1498Z",
      "M99.474 37.2195L61.1517 31.1498C59.9516 30.9597 58.8247 31.7785 58.6346 32.9786C58.4446 34.1786 59.2633 35.3056 60.4634 35.4956L98.7857 41.5653C99.9858 41.7554 101.113 40.9366 101.303 39.7365C101.493 38.5365 100.674 37.4095 99.474 37.2195Z",
    ],
    chama: "M80 8.86625C81.8333 14.3038 87.3333 17.9288 87.3333 25.1788C87.3333 31.5225 84.125 36.0538 80 36.0538C75.875 36.0538 72.6667 31.5225 72.6667 25.1788C72.6667 20.6475 75.4167 17.9288 76.7917 14.3038C77.25 17.9288 78.625 19.7413 80 20.1944C80 16.1163 79.0833 12.4913 80 8.86625Z",
    cerne: "M80 21.5537C81.375 24.7256 83.6667 26.5381 83.6667 29.71C83.6667 32.8819 81.8333 35.1475 80 35.1475C78.1667 35.1475 76.3333 32.8819 76.3333 29.71C76.3333 27.4444 77.7083 26.085 78.625 24.2725C79.0833 26.085 79.5417 26.5381 80 26.9912C80 24.7256 79.5417 23.3662 80 21.5537Z",
    faiscas: [[65.5, 10.14, 1.5], [93.8, 5.8, 1], [103.65, 13.73, 1.25]],
  },
};
/* a chama pequena (a da brasa e a do ladrilho): o recorte 9 × 12 do nó `197:7` */
const CHAMA_PEQUENA = {
  caixa: "6.75 4.75 9 12",
  chama: "M11.25 5.125C12 7.375 14.25 8.875 14.25 11.875C14.25 14.5 12.9375 16.375 11.25 16.375C9.5625 16.375 8.25 14.5 8.25 11.875C8.25 10 9.375 8.875 9.9375 7.375C10.125 8.875 10.6875 9.625 11.25 9.8125C11.25 8.125 10.875 6.625 11.25 5.125Z",
  cerne: "M11.25 10.375C11.8125 11.6875 12.75 12.4375 12.75 13.75C12.75 15.0625 12 16 11.25 16C10.5 16 9.75 15.0625 9.75 13.75C9.75 12.8125 10.3125 12.25 10.6875 11.5C10.875 12.25 11.0625 12.4375 11.25 12.625C11.25 11.6875 11.0625 11.125 11.25 10.375Z",
  /* o disco da brasa: raio 10,625 com fio de 1,25 por fora, centro 11,25 —
     a caixa de 20 começa em 1,25 e o disco transborda 1,25 de cada lado,
     como o `inset -6,25 %` do nó */
  disco: { centro: 11.25, raio: 10.625, fio: 1.25, caixa: "1.25 1.25 20 20" },
};

const chaveDe = (p) => (p && (p.id != null ? p.id : p.nome)) || null;
const nomeDe = (p) => (p && p.nome) || "";
const paragrafos = (texto) => (Array.isArray(texto) ? texto : String(texto || "").split(/\n\s*\n/))
  .map((s) => String(s || "").trim()).filter(Boolean);

/* ============================================================
   AS PEÇAS (biblioteca `197:2`) — todas fora do render
   ============================================================ */

/* A chama em dois tons, sem moldura: a do ladrilho e a de dentro da brasa. */
function Chama({ largura, altura }) {
  return (
    <svg width={largura} height={altura} viewBox={CHAMA_PEQUENA.caixa} aria-hidden="true" focusable="false" style={{ display: "block" }}>
      <path d={CHAMA_PEQUENA.chama} fill={FOGUEIRA.chama} />
      <path d={CHAMA_PEQUENA.cerne} fill={FOGUEIRA.cerne} />
    </svg>
  );
}

/* `Fogueira/Brasa` (`197:7`): a marca de quem tem o que dizer. É FORMA (a
   chama num disco de poço), nunca a palavra — e é aria-hidden: o nome
   acessível do lugar já diz o gesto. */
function Brasa({ style }) {
  const D = CHAMA_PEQUENA.disco;
  return (
    <svg width={FOGUEIRA.brasa} height={FOGUEIRA.brasa} viewBox={D.caixa} overflow="visible" aria-hidden="true" focusable="false" style={{ display: "block", flexShrink: 0, ...style }}>
      <circle cx={D.centro} cy={D.centro} r={D.raio} fill={T.pagina} stroke={T.pagina} strokeWidth={D.fio} />
      <path d={CHAMA_PEQUENA.chama} fill={FOGUEIRA.chama} />
      <path d={CHAMA_PEQUENA.cerne} fill={FOGUEIRA.cerne} />
    </svg>
  );
}

/* `Fogueira/O fogo` (`197:34`): decorativo, aria-hidden, não segura clique
   nenhum (pointer-events none). O clarão é o gradiente radial âmbar com a
   opacidade do NÓ em `claraoCentro` — a armadilha 4 de § Fogueira: a
   transparência vai no nó, não na paragem. */
function OFogo({ formato = "mesa", style }) {
  const G = DESENHO_DO_FOGO[formato] || DESENHO_DO_FOGO.mesa;
  const id = "tv-clarao-" + React.useId().replace(/:/g, "");
  const cx = G.w / 2, cy = G.h / 2;
  return (
    <svg width={G.w} height={G.h} viewBox={`0 0 ${G.w} ${G.h}`} aria-hidden="true" focusable="false"
      style={{ display: "block", overflow: "visible", pointerEvents: "none", ...style }}>
      <defs>
        <radialGradient id={id} cx={0} cy={0} r={1} gradientUnits="userSpaceOnUse" gradientTransform={`translate(${cx} ${cy}) scale(${cx} ${cy})`}>
          {FOGUEIRA.claraoParadas.map(([onde, a]) => <stop key={onde} offset={onde} stopColor={FOGUEIRA.clarao} stopOpacity={a} />)}
        </radialGradient>
      </defs>
      <ellipse cx={cx} cy={cy} rx={cx} ry={cy} fill={`url(#${id})`} opacity={FOGUEIRA.claraoCentro} />
      {G.lenha.map((d) => <path key={d.slice(0, 12)} d={d} fill={FOGUEIRA.lenha} stroke={FOGUEIRA.lenhaFio} strokeWidth={G.fio} />)}
      <g className="tv-fogueira-chama">
        <path d={G.chama} fill={FOGUEIRA.chama} />
        <path d={G.cerne} fill={FOGUEIRA.cerne} />
      </g>
      {G.faiscas.map(([x, y, r], i) => <circle key={i} className="tv-fogueira-faisca" style={{ "--tv-ordem": i }} cx={x} cy={y} r={r} fill={FOGUEIRA.cerne} />)}
    </svg>
  );
}

/* `Fogueira/Lugar` (`198:156`): É BOTÃO. Tem o que dizer → três canais (a
   brasa, o lugar aceso, o gesto em inkMeio); calado → panel, gesto em
   inkDim, sem brasa, e continua clicável. Escolhido = a gramática de `A
   escolha` com a cor da mão: contorno rosa + o filete de 3 embaixo. O foco
   é o anel da casa. A ordem (`--tv-ordem`) é a da entrada em sequência. */
const Lugar = React.forwardRef(function Lugar({ item, atalho, formato, escolhido, tabIndex, ordem, aoTocar, aoTeclar, style }, ref) {
  const p = item.pessoa || {};
  const tem = item.voz != null;
  const mesa = formato === "mesa";
  const LM = FOGUEIRA.lugarMesa, LB = FOGUEIRA.lugarBaixa;
  const nome = nomeDe(p);
  const rotulo = `${PALAVRAS.sentar} ${nome}${item.gesto ? " — " + item.gesto : ""}`;
  const corDoGesto = tem ? T.inkMeio : T.inkDim;
  return (
    <button ref={ref} type="button" tabIndex={tabIndex} onClick={aoTocar} onKeyDown={aoTeclar}
      aria-label={rotulo} aria-keyshortcuts={String(atalho)} aria-pressed={escolhido || undefined}
      className={`tv-anel-foco tv-fogueira-lugar relative flex ${mesa ? "flex-col items-center text-center" : "items-center text-left"}`}
      style={{
        "--tv-ordem": ordem,
        width: mesa ? FOGUEIRA.lugar.mesa : "100%",
        minHeight: mesa ? LM.altura : ALVOS.piso,
        height: mesa ? undefined : FOGUEIRA.lugar.baixa,
        padding: mesa ? `${LM.cima}px ${LM.lado}px ${LM.baixo}px` : `${LB.cima}px ${LB.direita}px ${LB.cima}px ${LB.esquerda}px`,
        gap: mesa ? LM.entre : LB.entre,
        borderRadius: FOGUEIRA.raio,
        border: `1px solid ${escolhido ? FOGUEIRA.escolhido : T.lineStrong}`,
        background: tem ? FOGUEIRA.lugarAceso : T.panel,
        overflow: "hidden", cursor: "pointer", ...style,
      }}>
      <span className="relative shrink-0" style={{ width: mesa ? FOGUEIRA.rosto.cartao : FOGUEIRA.rosto.chip, height: mesa ? FOGUEIRA.rosto.cartao : FOGUEIRA.rosto.chip }}>
        <Retrato semente={sementeDe(p)} ente={p.nome ? p : null} semCarta tamanho={mesa ? FOGUEIRA.rosto.cartao : FOGUEIRA.rosto.chip} anel={T.line} />
        {mesa && tem ? <Brasa style={{ position: "absolute", left: LM.brasa[0], top: LM.brasa[1] }} /> : null}
      </span>
      {mesa ? (
        <>
          <span className="tv-display" style={{ fontSize: FOGUEIRA.letra.nomeNoLugar, fontWeight: 600, color: T.ink, lineHeight: "normal" }}>{nome}</span>
          {item.gesto ? <span className="tv-body" style={{ fontSize: TIPOS.rotulo, fontStyle: "italic", color: corDoGesto, lineHeight: "normal" }}>{item.gesto}</span> : null}
          <span aria-hidden="true" className="tv-mono absolute" style={{ left: LM.atalho[0], top: LM.atalho[1], fontSize: TIPOS.maquina, color: T.inkDim }}>{atalho}</span>
        </>
      ) : (
        <>
          <span className="flex flex-col flex-1 min-w-0" style={{ lineHeight: "normal" }}>
            <span className="tv-body truncate" style={{ fontSize: TIPOS.corpo, fontWeight: 500, color: T.ink }}>{nome}</span>
            {item.gesto ? <span className="tv-body truncate" style={{ fontSize: TIPOS.piso, fontStyle: "italic", color: corDoGesto }}>{item.gesto}</span> : null}
          </span>
          {tem ? <Brasa /> : null}
          <span aria-hidden="true" className="tv-mono shrink-0" style={{ fontSize: TIPOS.maquina, color: T.inkDim }}>{atalho}</span>
        </>
      )}
      {escolhido ? <span aria-hidden="true" className="absolute" style={{ left: -1, right: -1, bottom: -1, height: FOGUEIRA.filete, background: FOGUEIRA.escolhido }} /> : null}
    </button>
  );
});

/* ============================================================
   O FORMATO — Mesa ou Baixa, medido (ver FOGUEIRA.mesaPede)
   ============================================================ */

/* A largura mínima da roda para N lugares, da própria tabela: nenhum lugar
   sai da roda nem pousa em cima do vizinho com quem divide a altura; e o
   fogo cabe. */
function larguraDaRoda(n) {
  const pos = FOGUEIRA.lugares[n] || [];
  const L = FOGUEIRA.lugar.mesa, A = FOGUEIRA.lugarMesa.altura;
  let w = FOGUEIRA.roda.fogo.mesa;
  pos.forEach(([fx, y], i) => {
    w = Math.max(w, (L / 2) / fx, (L / 2) / (1 - fx));
    pos.forEach(([gx, gy], j) => {
      if (j > i && Math.abs(y - gy) < A && gx !== fx) w = Math.max(w, L / Math.abs(gx - fx));
    });
  });
  return Math.ceil(w);
}
const larguraDaFala = () => FOGUEIRA.fala.coluna + FOGUEIRA.fala.entre + 2 * FOGUEIRA.verboSo + FOGUEIRA.fala.entreLados;

function useFormato(el, forcado, estado, n) {
  const [medida, setMedida] = React.useState(() => ({ largura: 0, altura: typeof window !== "undefined" ? window.innerHeight : 0 }));
  React.useLayoutEffect(() => {
    if (!el || typeof window === "undefined") return undefined;
    const medir = () => {
      try { setMedida({ largura: el.getBoundingClientRect().width, altura: window.innerHeight }); } catch (e) { /* fica a medida anterior */ }
    };
    medir();
    let obs = null;
    try { obs = typeof ResizeObserver !== "undefined" ? new ResizeObserver(medir) : null; if (obs) obs.observe(el); } catch (e) { obs = null; }
    window.addEventListener("resize", medir);
    return () => { if (obs) obs.disconnect(); window.removeEventListener("resize", medir); };
  }, [el]);
  if (forcado === "mesa" || forcado === "baixa") return forcado;
  const M = FOGUEIRA.mesaPede;
  if (estado === "roda") return medida.largura >= larguraDaRoda(n) && medida.altura >= M.roda + M.moldura ? "mesa" : "baixa";
  if (estado === "fala") return medida.largura >= larguraDaFala() && medida.altura >= M.fala + M.moldura ? "mesa" : "baixa";
  return "mesa";
}

/* o alvo de uma tecla é de escrever (o compositor, um campo)? então a tecla é dele */
const deEscrever = (el) => !!el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName || ""));
/* Enter só é da noite quando o foco não está noutro controlo */
const focoLivre = (el) => !el || el === document.body || !/^(BUTTON|A|INPUT|TEXTAREA|SELECT)$/.test(el.tagName || "");

/* ============================================================
   OS ESTADOS — cada um num componente de fora
   ============================================================ */

/* A · com quem você se senta */
function ARoda({ roda, abertura, formato, escolhido, aoSentar, aoDormir }) {
  const mesa = formato === "mesa";
  const n = roda.length;
  const refs = React.useRef([]);
  const primeiraVoz = Math.max(0, roda.findIndex((r) => r.voz != null));
  const [paragem, setParagem] = React.useState(primeiraVoz);
  const parada = Math.min(paragem, n - 1);
  const chaveEscolhida = escolhido && typeof escolhido === "object" ? chaveDe(escolhido) : escolhido;
  const sentar = (item) => { if (chaveEscolhida == null && aoSentar) aoSentar(item.pessoa); };
  /* a paragem: setas andam, Home/End vão às pontas; na Baixa, cima/baixo
     saltam a linha da grade de duas colunas */
  const teclar = (i) => (e) => {
    const linha = mesa ? 1 : 2;
    const vai = { ArrowRight: i + 1, ArrowLeft: i - 1, ArrowDown: i + linha, ArrowUp: i - linha, Home: 0, End: n - 1 }[e.key];
    if (vai == null) return;
    e.preventDefault();
    const j = Math.max(0, Math.min(n - 1, vai));
    setParagem(j);
    const el = refs.current[j];
    if (el) el.focus();
  };
  const lugar = (item, i, style) => (
    <Lugar key={chaveDe(item.pessoa) || i} ref={(el) => { refs.current[i] = el; }} item={item} atalho={i + 1} formato={formato} ordem={i}
      escolhido={chaveEscolhida != null && chaveDe(item.pessoa) === chaveEscolhida}
      tabIndex={i === parada ? 0 : -1} aoTocar={() => sentar(item)} aoTeclar={teclar(i)} style={style} />
  );
  const dormirJa = <VerboComPreco papel="recuo" verbo={PALAVRAS.dormirJa.verbo} preco={PALAVRAS.dormirJa.preco} atalho={n + 1} aoTocar={aoDormir} className="w-full" />;

  if (mesa) {
    const pos = FOGUEIRA.lugares[n] || [];
    return (
      <div className="flex flex-col items-center" style={{ gap: FOGUEIRA.ritmoDaRoda }}>
        {abertura ? <p className="tv-display text-center" style={{ fontSize: TIPOS.display, fontWeight: 500, color: T.ink, lineHeight: "normal" }}>{abertura}</p> : null}
        <p className="tv-body text-center" style={{ fontSize: TIPOS.prosa, fontStyle: "italic", color: T.inkMeio, lineHeight: "normal" }}>{PALAVRAS.pergunta}</p>
        <div role="group" aria-label={PALAVRAS.pergunta} className="relative w-full" style={{ height: FOGUEIRA.roda.altura }}>
          <OFogo formato="mesa" style={{ position: "absolute", left: `calc(50% - ${FOGUEIRA.roda.fogo.mesa / 2}px)`, top: FOGUEIRA.roda.fogoY }} />
          {roda.map((item, i) => {
            const [fx, y] = pos[i] || [0.5, 0];
            return lugar(item, i, { position: "absolute", left: `calc(${fx * 100}% - ${FOGUEIRA.lugar.mesa / 2}px)`, top: y });
          })}
        </div>
        <div style={{ width: FOGUEIRA.verboSo, maxWidth: "100%" }} className="flex">{dormirJa}</div>
      </div>
    );
  }
  /* Baixa: o fogo pequeno ao lado da abertura; a grade de duas colunas na
     mesma ordem; o Dormir já na grade, depois do último lugar */
  return (
    <div className="flex flex-col" style={{ gap: FOGUEIRA.baixa.ritmo }}>
      <div className="flex items-center" style={{ gap: FOGUEIRA.baixa.ritmo }}>
        <OFogo formato="baixa" style={{ flexShrink: 0 }} />
        <div className="flex flex-col min-w-0">
          {abertura ? <p className="tv-display" style={{ fontSize: TIPOS.titulo, fontWeight: 500, color: T.ink, lineHeight: "normal" }}>{abertura}</p> : null}
          <p className="tv-body" style={{ fontSize: TIPOS.corpo, fontStyle: "italic", color: T.inkMeio, lineHeight: "normal" }}>{PALAVRAS.pergunta}</p>
        </div>
      </div>
      <div role="group" aria-label={PALAVRAS.pergunta} className="grid" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: FOGUEIRA.baixa.entre }}>
        {roda.map((item, i) => lugar(item, i))}
        {dormirJa}
      </div>
    </div>
  );
}

/* a fila «ao redor do fogo»: os outros, sem borda — não são alvo (Mesa só) */
function AoRedor({ outros }) {
  if (!outros.length) return null;
  return (
    <div className="flex items-center flex-wrap" style={{ gap: FOGUEIRA.fala.entreChips }}>
      <span className="tv-mono uppercase" style={{ fontSize: TIPOS.maquina, color: T.inkDim, letterSpacing: `${FOGUEIRA.letra.rastreioDoRedor}em` }}>{PALAVRAS.aoRedor}</span>
      {outros.map((item, i) => (
        <span key={chaveDe(item.pessoa) || i} className="flex items-center" style={{ gap: FOGUEIRA.fala.chip }}>
          <Retrato semente={sementeDe(item.pessoa)} ente={item.pessoa && item.pessoa.nome ? item.pessoa : null} semCarta tamanho={FOGUEIRA.rosto.chip} anel={T.line} />
          <span className="tv-body" style={{ fontSize: TIPOS.rotulo, color: T.inkDim }}>{nomeDe(item.pessoa)}</span>
        </span>
      ))}
    </div>
  );
}

/* B · C · B2 — a fala, e o que se pode fazer depois dela */
function AFala({ roda, fala, escolha, aguentaNoite, portaAberta, formato, aoEscolher, aoDormir, aoFicar }) {
  const mesa = formato === "mesa";
  const quem = fala.pessoa || {};
  const nome = nomeDe(quem);
  const chave = chaveDe(quem);
  const outros = roda.filter((r) => chaveDe(r.pessoa) !== chave);
  const F = FOGUEIRA.fala;
  const rostoLado = mesa ? FOGUEIRA.rosto.ficha : FOGUEIRA.rosto.cartao;

  /* os controles: C = os dois lados (+ adiar se a noite aguenta); B2 = ficar
     + Dormir; B = Dormir. Dormir é o armado (↵) quando não há lados. */
  let controles;
  if (escolha && escolha.a && escolha.b) {
    const adiar = aguentaNoite
      ? <VerboComPreco papel="recuo" verbo={PALAVRAS.adiar.verbo} preco={escolha.adiar || PALAVRAS.adiar.preco} atalho={3} aoTocar={aoDormir} className="w-full" />
      : null;
    controles = (
      <>
        <div className={mesa ? "flex w-full" : "grid w-full"} style={mesa ? { gap: F.entreLados } : { gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: FOGUEIRA.baixa.entre }}>
          <VerboComPreco verbo={escolha.a.verbo} preco={escolha.a.preco} atalho={1} aoTocar={() => aoEscolher && aoEscolher("a")} className="flex-1 min-w-0" />
          <VerboComPreco verbo={escolha.b.verbo} preco={escolha.b.preco} atalho={2} aoTocar={() => aoEscolher && aoEscolher("b")} className="flex-1 min-w-0" />
          {!mesa && adiar}
        </div>
        {mesa && adiar ? <div className="flex" style={{ width: FOGUEIRA.verboSo, maxWidth: "100%" }}>{adiar}</div> : null}
      </>
    );
  } else {
    const dormir = <VerboComPreco papel="armado" verbo={PALAVRAS.dormir.verbo} preco={PALAVRAS.dormir.preco} atalho="↵" aoTocar={aoDormir} className="flex-1 min-w-0" />;
    const ficar = portaAberta ? <VerboComPreco verbo={PALAVRAS.ficar.verbo} preco={PALAVRAS.ficar.preco} atalho={1} aoTocar={aoFicar} className="flex-1 min-w-0" /> : null;
    controles = (
      <div className={mesa ? "flex w-full" : "grid w-full"} style={mesa ? { gap: F.entreLados, maxWidth: ficar ? undefined : FOGUEIRA.verboSo } : { gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: FOGUEIRA.baixa.entre }}>
        {dormir}{ficar}
      </div>
    );
  }

  return (
    <div className="flex items-start" style={{ gap: mesa ? F.entre : FOGUEIRA.baixa.entreColunas }}>
      <div className="flex flex-col items-center shrink-0" style={{ width: mesa ? F.coluna : FOGUEIRA.baixa.coluna, gap: F.entreRostoENome }}>
        {mesa ? (
          <div className="relative" style={{ width: F.coluna, height: F.coluna }}>
            <OFogo formato="mesa" style={{ position: "absolute", left: F.fogoEm[0], top: F.fogoEm[1] }} />
            <div className="absolute tv-fogueira-vira" style={{ left: F.rostoEm[0], top: F.rostoEm[1] }}>
              <Retrato semente={sementeDe(quem)} ente={quem.nome ? quem : null} tamanho={rostoLado} anel={T.line} />
            </div>
          </div>
        ) : (
          <div className="tv-fogueira-vira"><Retrato semente={sementeDe(quem)} ente={quem.nome ? quem : null} tamanho={rostoLado} anel={T.line} /></div>
        )}
        <p className="tv-display text-center" style={{ fontSize: mesa ? FOGUEIRA.letra.nomeDaFala : TIPOS.corpo, fontWeight: 600, color: T.ink, lineHeight: "normal" }}>{nome}</p>
      </div>
      <div className="flex flex-col flex-1 min-w-0 items-start" style={{ gap: mesa ? F.ritmo : FOGUEIRA.baixa.ritmo }}>
        {mesa ? (
          <p className="tv-mono uppercase" style={{ fontSize: TIPOS.maquina, fontWeight: 500, color: T.amberSoft, letterSpacing: `${FOGUEIRA.letra.rastreioDaVoz}em` }}>
            {nome} · {PALAVRAS.aFogueira}
          </p>
        ) : null}
        {paragrafos(fala.texto).map((s, i) => (
          <p key={i} className="tv-body" style={{ fontSize: TIPOS.prosa, color: T.ink, lineHeight: FOGUEIRA.letra.entrelinhaDaFala }}>{s}</p>
        ))}
        {mesa ? <AoRedor outros={outros} /> : null}
        {controles}
      </div>
    </div>
  );
}

/* D · E — a linha que abre a manhã: `O ladrilho do assunto` com a brasa */
function AManha({ manha }) {
  return (
    <div className="flex items-start" style={{ gap: LADRILHO.espaco, paddingBottom: FOGUEIRA.manha.respiro, borderBottom: `1px solid ${T.line}` }}>
      <LadrilhoDoAssunto><Chama largura={LADRILHO.glifo * 3 / 4} altura={LADRILHO.glifo} /></LadrilhoDoAssunto>
      <div className="flex flex-col flex-1 min-w-0" style={{ gap: FOGUEIRA.manha.palavras, lineHeight: "normal" }}>
        <p className="tv-body" style={{ fontSize: TIPOS.corpo, color: T.ink }}>{manha.frase}</p>
        {manha.recibo ? <p className="tv-mono" style={{ fontSize: TIPOS.maquina, color: T.inkDim }}>{manha.recibo}</p> : null}
      </div>
    </div>
  );
}

/* ============================================================
   O PAINEL
   ============================================================ */
export function PainelFogueira({
  roda = [], abertura = "", fala = null, escolha = null, aguentaNoite = false, portaAberta = false,
  manha = null, escolhido = null, formato, aoSentar, aoEscolher, aoDormir, aoFicar,
}) {
  /* `= []` não cobre null (a lei da casa) */
  const lista = (Array.isArray(roda) ? roda : []).filter((r) => r && r.pessoa).slice(0, FOGUEIRA.lugaresMax);
  const estado = manha && manha.frase ? "manha" : fala && fala.pessoa ? "fala" : lista.length ? "roda" : null;
  const [raiz, setRaiz] = React.useState(null);
  const forma = useFormato(raiz, formato, estado, lista.length);

  /* OS ATALHOS — números e Enter, nunca quando a tecla é de um campo de
     escrever. Um handler que estoura não pode custar a noite. */
  const atual = React.useRef(null);
  atual.current = { estado, lista, escolha, aguentaNoite, portaAberta, escolhido, aoSentar, aoEscolher, aoDormir, aoFicar };
  React.useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const aoTeclar = (e) => {
      try {
        if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey || deEscrever(e.target)) return;
        const a = atual.current;
        const d = /^[1-9]$/.test(e.key) ? Number(e.key) : 0;
        const fazer = (f) => { e.preventDefault(); if (f) f(); };
        if (a.estado === "roda") {
          if (d >= 1 && d <= a.lista.length) { if (a.escolhido == null && a.aoSentar) fazer(() => a.aoSentar(a.lista[d - 1].pessoa)); }
          else if (d === a.lista.length + 1) fazer(a.aoDormir);
        } else if (a.estado === "fala") {
          if (a.escolha && a.escolha.a && a.escolha.b) {
            if (d === 1) fazer(() => a.aoEscolher && a.aoEscolher("a"));
            else if (d === 2) fazer(() => a.aoEscolher && a.aoEscolher("b"));
            else if (d === 3 && a.aguentaNoite) fazer(a.aoDormir);
          } else {
            if (d === 1 && a.portaAberta) fazer(a.aoFicar);
            else if (e.key === "Enter" && focoLivre(e.target)) fazer(a.aoDormir);
          }
        }
      } catch (erro) { /* nunca pode custar o turno */ }
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, []);

  if (!estado) return null;
  return (
    <section ref={setRaiz} aria-label={PALAVRAS.roda} className="w-full">
      <div key={estado} className="tv-fogueira-entra">
      {estado === "roda" ? (
        <ARoda roda={lista} abertura={abertura} formato={forma} escolhido={escolhido} aoSentar={aoSentar} aoDormir={aoDormir} />
      ) : estado === "fala" ? (
        <AFala roda={lista} fala={fala} escolha={escolha} aguentaNoite={aguentaNoite} portaAberta={portaAberta} formato={forma}
          aoEscolher={aoEscolher} aoDormir={aoDormir} aoFicar={aoFicar} />
      ) : (
        <AManha manha={manha} />
      )}
      </div>
    </section>
  );
}
