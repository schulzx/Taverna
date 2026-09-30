/* ============================================================
   O ALFORJE — a moldura do painel no telefone (R21) — Taverna

   `mente/formas.md`, "### R21 · a fabricação" §§2, 6, 8. No telefone a
   ficha da cinta vira a porta de um ALFORJE: uma folha que sobe por
   cima da cena, com as abas no PÉ (não no cabeçalho — a razão é a
   reaprendizagem, `formas.md` §2). Na coluna larga (≥768px) esta MESMA
   moldura é, byte a byte no que se vê, o `aside` de hoje do
   `PainelLateral` (`App.jsx` ~l.2458-2466).

   ISTO É SÓ A MOLDURA. O miolo — Ficha, Bolsa, Mapa, Diário, Códex — não
   se duplica: continua sendo o que `PainelLateral` já desenha, e chega
   aqui como `children`. "O melhor uso do bastão é gastá-lo para não
   precisar mais dele" (`CLAUDE.md`): o `App.jsx` só passa `aba`,
   `setAba` e o conteúdo — nenhuma tela de painel é reescrita aqui.

   UM ÚNICO INVÓLUCRO, DUAS COMPOSIÇÕES, TROCADAS POR CSS — a mesma ideia
   de `CAMPO_DO_TURNO.colunaEstreita` e de `A soleira`: zero
   `matchMedia`, e rodar o telefone a meio do turno não parte nada. Onde
   uma medida (o topo, o raio de cima) só o React sabe calcular, ela
   entra por uma VARIÁVEL CSS (`--tv-alforje-topo`, `--tv-alforje-raio`)
   que duas classes de `estilo.js` (`.tv-alforje-topo`, `.tv-alforje-raio`)
   leem cada uma à sua maneira, conforme a media query — porque `style`
   sempre vence qualquer classe, em qualquer tela, e por isso a TROCA por
   tamanho não pode morar em `style` (ver o comentário ao lado dessas
   duas classes, em `estilo.js`).

   TODA FIAÇÃO DE EFEITO EM try/catch: o helper `calou(...)` só existe
   HOJE dentro de `App.jsx` (não é exportado de lugar nenhum fora dele),
   então aqui o mesmo papel é feito por um try/catch simples com
   `console.warn` — nunca deixar um efeito deste painel custar o turno.
   ============================================================ */
import React from "react";
import { T, ALVOS, CINTA, TIPOS, ALFORJE, VEU } from "./estilo.js";
import { AbaComGlifo, TiraDaResposta } from "./ui.jsx";

/* Um pequeno auxiliar PRIVADO, só para este arquivo: alfa sobre um token
   de `T`, sem escrever um dígito de cor novo no texto-fonte que a
   catraca de cor (`testes/check-formas.mjs`, D5a/D5b) lê — os
   componentes nascem de variáveis em tempo de execução, nunca de um
   literal. NÃO é o `alfa(cor, a)` que o cabeçalho de `estilo.js` promete
   para outro ciclo (aquele é a API pública, com decisão própria); este
   só resolve o que o véu do alforje precisa aqui dentro. */
function comAlfaSobre(hex, a) {
  const n = parseInt(String(hex).replace("#", ""), 16) || 0;
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return `rgba(${r},${g},${b},${a})`;
}

/* ---------------- A FAIXA DO FUNDO (R21 §8) ----------------
   Os 48px entre a cinta e o alforje — que já são "o fundo que fecha" (a
   primeira das seis saídas). `Velada`: só o véu por trás, sem conteúdo
   próprio. `Espreita`: a resposta do Mestre chegou com o alforje aberto,
   e a tira mostra a primeira linha dela — "a história a espreitar por
   cima do alforje", nunca um aviso do sistema.

   Definida FORA do render de `Alforje` — a lei da casa: componente
   declarado dentro do render mata o foco de qualquer campo de texto na
   árvore (não há um aqui, mas a lei não abre exceção por arquivo). */
function FaixaDoFundo({ espreita, aoTocar, reduzido }) {
  return (
    <button
      type="button"
      onClick={aoTocar}
      aria-label={espreita && espreita.texto ? espreita.texto : "Fechar"}
      className={`w-full flex items-center text-left ${reduzido ? "" : "tv-veu-entra"}`}
      style={{ height: ALVOS.piso, background: "transparent", border: "none", padding: 0 }}>
      {/* V5e: a tira é a peça da biblioteca (`TiraDaResposta`) — a mesma que a
          seta `Novo` da página desenha: uma ação, uma forma. */}
      {espreita && espreita.texto ? <TiraDaResposta texto={espreita.texto} /> : null}
    </button>
  );
}

/* ---------------- O ALFORJE ---------------- */
export function Alforje({
  aberto, titulo, abas = [], abaAtiva, aoEscolher, aoFechar, topo = CINTA.altura,
  espreita = null, aoTocarEspreita, reduzido = false, children,
}) {
  const tituloId = React.useId();
  const conteudoId = React.useId();
  const abasSeguras = Array.isArray(abas) ? abas : [];

  /* MONTAR/DESMONTAR COM UMA SAÍDA CURTA — nunca bloqueia: o alforje
     aceita toques desde o primeiro fotograma em que `aberto` vira
     verdadeiro (é o mesmo React.render de sempre, sem espera nenhuma).
     A espera só existe do OUTRO lado, ao fechar, e só para a animação de
     saída ter tempo de rodar; sob `reduzido` ela é zero. */
  const [visivel, setVisivel] = React.useState(!!aberto);
  const [saindo, setSaindo] = React.useState(false);
  React.useEffect(() => {
    /* R21k: reabrir (fechado → aberto) tem de fazer a entrada correr de
       novo — é por isso que `entrou` reseta aqui, no mesmo efeito que já
       decide `visivel`/`saindo`, e não onde ela é lida (mais abaixo). */
    if (aberto) { setVisivel(true); setSaindo(false); setEntrou(false); return; }
    if (!visivel) return;
    setSaindo(true);
    const ms = reduzido ? 0 : VEU.sai;
    const timer = setTimeout(() => { setVisivel(false); setSaindo(false); }, ms);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberto]);

  /* FOCO: guarda quem tinha o foco antes de abrir, move para a aba
     ESCOLHIDA ao abrir (ou a primeira, se nenhuma bater), e devolve ao
     fechar — a lei de "abrir e fechar um painel" (`formas.md`) aplicada
     ao padrão Tabs do WAI-ARIA APG. Lê o DOM em vez de guardar um `ref`
     por aba: `AbaComGlifo` é uma função simples (não passa por
     `React.forwardRef`), e mudar a assinatura dela para isto seria
     tocar uma peça que o `oficial` vai usar sem mudar uma linha. */
  const tablistRef = React.useRef(null);
  const focoAnteriorRef = React.useRef(null);
  React.useEffect(() => {
    if (!aberto) return;
    try {
      focoAnteriorRef.current = document.activeElement;
      const lista = tablistRef.current;
      const alvo = (lista && lista.querySelector('[role="tab"][aria-selected="true"]')) || (lista && lista.querySelector('[role="tab"]'));
      if (alvo && alvo.focus) alvo.focus();
    } catch (e) { console.warn("[Alforje] foco ao abrir", e); }
    return () => {
      try {
        const el = focoAnteriorRef.current;
        if (el && el.focus && document.contains(el)) el.focus();
      } catch (e) { console.warn("[Alforje] foco ao fechar", e); }
    };
  }, [aberto]);

  /* Esc fecha — a terceira das três portas de "abrir e fechar um
     painel" (as outras duas são o fundo e o Fechar, abaixo). */
  React.useEffect(() => {
    if (!aberto) return;
    const aoTeclar = (e) => { if (e.key === "Escape") { try { aoFechar && aoFechar(); } catch (err) { console.warn("[Alforje] Esc", err); } } };
    try { window.addEventListener("keydown", aoTeclar); } catch (e) { console.warn("[Alforje] Esc (montar)", e); }
    return () => { try { window.removeEventListener("keydown", aoTeclar); } catch (e) { console.warn("[Alforje] Esc (desmontar)", e); } };
  }, [aberto, aoFechar]);

  /* O GESTO DE DESCER (R21k, 29/09) — "um toque nunca é um arrasto".
     A CONSTRUÇÃO ANTERIOR começava o arrasto em QUALQUER pointerdown com o
     rolamento no topo: sem limiar, sem direção, e a partir de QUALQUER alvo —
     inclusive as sub-abas da Gestão (Ficha, Grupo…), que moram exatamente no
     topo do conteúdo. Resultado, em cadeia: o tremor do dedo virava
     translateY ("a tela desce e sobe sozinha"), o alvo saía de baixo do dedo
     ("não consigo abrir o grupo"), e ao soltar a animação de entrada
     recomeçava do zero ("começa a descer como se estivesse fechando").

     A CORREÇÃO: o pointerdown só ARMA UM CANDIDATO (`candidatoRef`, sem
     re-render nenhum). O arrasto de verdade só COMEÇA num pointermove que
     cruze `ALFORJE.limiarDoArrasto` para BAIXO, com o vertical a dominar o
     horizontal — e nunca a partir de um elemento tocável (botão, aba, link…,
     ver `SELETOR_TOCAVEL` abaixo). Um toque que não cruza o limiar não vira
     nada: o conteúdo continua a rolar como sempre (nenhum `preventDefault`
     é chamado enquanto o arrasto não começou). */
  const [arrastando, setArrastando] = React.useState(false);
  const [soltando, setSoltando] = React.useState(false); /* a transição de "volta ao sítio" */
  const [deslocamento, setDeslocamento] = React.useState(0);
  const candidatoRef = React.useRef(null); /* {x, y} do pointerdown, antes de o limiar decidir se é arrasto */
  const arrastandoRef = React.useRef(false); /* espelha `arrastando`, lido sem closure velha dentro dos listeners */
  const deslocamentoRef = React.useRef(0); /* idem, para o `soltar` decidir sem passar por um updater */
  const conteudoRef = React.useRef(null);

  /* V5 · A ALTURA DO CABEÇALHO, MEDIDA (conserto da prova do `jogo`,
     `v5-jogo.md` §8.4). O cartão que o toque num companheiro pede para abaixo
     do cabeçalho preso (`FOCO_NA_GAVETA`, estilo.js) lê esta medida em vez de
     uma soma escrita à mão, que deixava uma tira de ~8 px do cartão de cima
     debaixo do título. A medida vai para `--tv-cabecalho-da-gaveta` no
     contentor, que é antepassado do cartão; um `ResizeObserver` a refaz
     quando a letra ou a largura mudam. Nunca derruba a gaveta: sem medida,
     vale a reserva da tabela. */
  const observadorDoCabecalhoRef = React.useRef(null);
  const medirCabecalho = React.useCallback((el) => {
    try {
      if (observadorDoCabecalhoRef.current) { observadorDoCabecalhoRef.current.disconnect(); observadorDoCabecalhoRef.current = null; }
      if (!el) return;
      const pai = el.parentElement;
      const medir = () => {
        try { if (pai) pai.style.setProperty("--tv-cabecalho-da-gaveta", Math.round(el.getBoundingClientRect().height) + "px"); }
        catch (e) { console.warn("[Alforje] medir o cabeçalho", e); }
      };
      medir();
      if (typeof ResizeObserver === "function") {
        const ro = new ResizeObserver(medir);
        ro.observe(el);
        observadorDoCabecalhoRef.current = ro;
      }
    } catch (e) { console.warn("[Alforje] medir o cabeçalho", e); }
  }, []);
  React.useEffect(() => () => { try { if (observadorDoCabecalhoRef.current) observadorDoCabecalhoRef.current.disconnect(); } catch (e) { console.warn("[Alforje] medir o cabeçalho (desmontar)", e); } }, []);

  /* OS OUVINTES VIVEM ENQUANTO O ALFORJE EXISTE — não só enquanto já se
     está a arrastar (essa era a falha: religar o listener DEPOIS do estado
     mudar chega tarde demais para um toque rápido). Aqui eles ficam prontos
     desde o primeiro fotograma para reconhecer um candidato e decidir, no
     PRÓPRIO pointermove, se ele cruza o limiar — nunca no pointerdown. */
  React.useEffect(() => {
    if (!visivel) return;
    const mover = (e) => {
      try {
        if (!candidatoRef.current) return;
        const p = e.touches && e.touches[0] ? e.touches[0] : e;
        const y = p.clientY, x = p.clientX;
        if (typeof y !== "number") return;
        const dy = y - candidatoRef.current.y;
        const dx = x - candidatoRef.current.x;
        if (!arrastandoRef.current) {
          /* ainda é só um candidato: só vira arrasto para BAIXO, além do
             limiar, com o vertical a dominar — senão é o dedo a rolar ou a
             tremer, e o conteúdo já está a rolar sozinho (nada aqui chamou
             preventDefault). */
          if (dy < ALFORJE.limiarDoArrasto || dy <= 0 || Math.abs(dy) <= Math.abs(dx)) return;
          arrastandoRef.current = true;
          setArrastando(true);
          setSoltando(false); /* corta uma "volta ao sítio" que ainda estivesse a meio */
        }
        const d = Math.max(0, dy);
        deslocamentoRef.current = d;
        setDeslocamento(d);
      } catch (err) { console.warn("[Alforje] gesto de descer (mover)", err); }
    };
    const voltarOuFechar = (podeFechar) => {
      const comecara = arrastandoRef.current;
      candidatoRef.current = null;
      if (!comecara) return; /* só um toque: nada a desfazer, nada a fechar */
      arrastandoRef.current = false;
      setArrastando(false);
      const d = deslocamentoRef.current;
      deslocamentoRef.current = 0;
      setDeslocamento(0);
      if (podeFechar && d > 2 * ALVOS.piso) {
        try { aoFechar && aoFechar(); } catch (e) { console.warn("[Alforje] gesto de descer (fechar)", e); }
      } else if (!reduzido) {
        setSoltando(true); /* a transição de VEU.sai que devolve a folha ao sítio */
      }
    };
    /* soltar: acima de 2×ALVOS.piso fecha. pointercancel (o navegador a
       tomar o toque por rolagem/PTR): NUNCA fecha, só devolve ao sítio — e,
       se o arrasto nem tinha começado, só desarma o candidato. */
    const soltar = () => voltarOuFechar(true);
    const cancelar = () => voltarOuFechar(false);
    try {
      window.addEventListener("pointermove", mover);
      window.addEventListener("pointerup", soltar);
      window.addEventListener("pointercancel", cancelar);
    } catch (e) { console.warn("[Alforje] gesto de descer (ouvir)", e); }
    return () => {
      try {
        window.removeEventListener("pointermove", mover);
        window.removeEventListener("pointerup", soltar);
        window.removeEventListener("pointercancel", cancelar);
      } catch (e) { console.warn("[Alforje] gesto de descer (parar de ouvir)", e); }
    };
  }, [visivel, aoFechar, reduzido]);

  /* A ENTRADA CORRE UMA VEZ. Depois de tvAlforjeSobe/tvSlide terminar, a
     classe sai do elemento (não é reposta por nenhum re-render nem pelo fim
     de um arrasto) — o `onAnimationEnd` é o sinal principal, o temporizador é
     só a rede para o dia em que ele não disparar (ex.: o navegador engole o
     evento). 300ms cobre com folga tanto VEU.entra (180, telefone) quanto o
     .tv-slide de .25s do monitor — nunca corta a animação de verdade. Ao
     reabrir (fechado → aberto) a entrada volta a valer: `entrou` reseta no
     mesmo efeito que já cuida de `visivel`/`saindo`, lá em cima. */
  const [entrou, setEntrou] = React.useState(false);
  React.useEffect(() => {
    if (!aberto || entrou) return;
    const t = setTimeout(() => setEntrou(true), 300);
    return () => clearTimeout(t);
  }, [aberto, entrou]);
  const aoEntradaTerminar = (e) => {
    try { if (e.target === e.currentTarget) setEntrou(true); } catch (err) { console.warn("[Alforje] entrada terminou", err); }
  };
  const aoVoltarAoSitioTerminar = (e) => {
    try { if (e.target === e.currentTarget && e.propertyName === "transform") setSoltando(false); } catch (err) { console.warn("[Alforje] volta ao sítio terminou", err); }
  };

  /* O GESTO SÓ FAZ SENTIDO NA ESTREITA — na larga o alforje nem sobe nem
     desce, é o aside de sempre (ver a correção em estilo.js, junto de
     .tv-alforje-sobe/-desce). A pega já é md:hidden (sem alvo nenhum na
     larga); o conteúdo, não — ele é a MESMA área que rola dos dois lados
     —, então é aqui que a régua precisa ser conferida. Uma leitura de
     largura no instante do toque não é o `matchMedia` reativo que a
     lei da casa proíbe para leiaute (nenhum estado, nenhum re-render):
     é só a pergunta "posso começar um arrasto?", feita uma vez por
     toque. */
  const emColunaEstreita = () => {
    try { return window.matchMedia("(max-width: 767px)").matches; } catch { return true; }
  };
  /* NUNCA a partir de um elemento tocável — R21k: o pointerdown no conteúdo
     não pode armar um candidato quando o dedo pousou num botão, aba, link,
     campo… (senão o próprio toque nessas peças é que dispara o arrasto). A
     pega não precisa desta exclusão: não tem nada tocável dentro dela. */
  const SELETOR_TOCAVEL = 'button, a, input, select, textarea, label, summary, [role="tab"], [role="button"], [role="link"], [contenteditable="true"]';
  const armarCandidato = (clienteX, clienteY) => { candidatoRef.current = { x: clienteX, y: clienteY }; };
  const aoPressionarPega = (e) => { try { armarCandidato(e.clientX, e.clientY); } catch (err) { console.warn("[Alforje] pega", err); } };
  const aoPressionarConteudo = (e) => {
    try {
      if (!emColunaEstreita()) return;
      if (e.target && e.target.closest && e.target.closest(SELETOR_TOCAVEL)) return;
      if (conteudoRef.current && conteudoRef.current.scrollTop <= 0) armarCandidato(e.clientX, e.clientY);
    } catch (err) { console.warn("[Alforje] conteúdo (início do arrasto)", err); }
  };

  /* NAVEGAÇÃO POR SETAS entre abas — o padrão Tabs do WAI-ARIA APG:
     move o foco E a escolha juntos (ativação automática), porque a fita
     é uma tira curta e não uma lista longa de conteúdo pesado.
     `tablistRef` já foi declarado lá em cima (o efeito de foco também o
     usa). */
  const aoTeclarNaFita = (e) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    if (abasSeguras.length < 2) return;
    try {
      const idx = abasSeguras.findIndex((a) => a.id === abaAtiva);
      const base = idx < 0 ? 0 : idx;
      const prox = e.key === "ArrowRight" ? (base + 1) % abasSeguras.length : (base - 1 + abasSeguras.length) % abasSeguras.length;
      aoEscolher && aoEscolher(abasSeguras[prox].id);
      const el = tablistRef.current && tablistRef.current.querySelectorAll('[role="tab"]')[prox];
      if (el && el.focus) el.focus();
      e.preventDefault();
    } catch (err) { console.warn("[Alforje] navegação por setas", err); }
  };

  const aoClicarNaAba = (id) => {
    try {
      if (id === abaAtiva) { aoFechar && aoFechar(); return; } /* tocar a escolhida outra vez fecha */
      aoEscolher && aoEscolher(id);
    } catch (err) { console.warn("[Alforje] escolher aba", err); }
  };

  const aoTocarAFaixa = () => {
    try {
      if (espreita) aoTocarEspreita && aoTocarEspreita();
    } catch (err) { console.warn("[Alforje] tocar a espreita", err); }
    try { aoFechar && aoFechar(); } catch (err) { console.warn("[Alforje] fechar pela faixa", err); }
  };

  if (!visivel) return null;

  const topoPx = Math.round(topo) + ALVOS.piso;
  /* R21k: a classe de entrada só existe até `entrou` virar true — depois
     disso nenhum re-render (nem o fim de um arrasto) a repõe. A saída
     continua igual, sempre que `saindo`. */
  const classeEntradaSaida = reduzido ? "" : (saindo ? "tv-alforje-desce" : (entrou ? "" : "tv-alforje-sobe"));
  const classeVeu = reduzido ? "" : (saindo ? "tv-veu-sai" : "tv-veu-entra");
  /* `animation: "none"` fica como rede: com `entrou` true a classe já não
     declara animação nenhuma, mas um arrasto iniciado NO MEIO da entrada
     (janela rara de ~180ms) ainda teria a keyframe a disputar o `transform`
     com o dedo sem isto. */
  const estiloArrasto = arrastando
    ? { transform: `translateY(${deslocamento}px)`, transition: "none", animation: "none" }
    : soltando
      ? { transform: "translateY(0px)", transition: `transform ${VEU.sai}ms ease-out` } /* volta ao sítio, sem repor a entrada */
      : null;

  return (
    <>
      {/* O VÉU — na estreita começa abaixo da cinta (a cinta fica viva
          por cima); na larga cobre tudo, como o fundo de hoje do
          PainelLateral (e mata o rgba(0,0,0,.45) que ele usa hoje). */}
      <div
        aria-hidden="true"
        onClick={aoFechar}
        className={`tv-alforje-topo fixed inset-x-0 bottom-0 md:left-0 md:right-0 z-40 ${classeVeu}`}
        style={{ "--tv-alforje-topo": `${topo}px`, background: comAlfaSobre(T.bg, VEU.leve) }}
      />

      {/* A FAIXA DO FUNDO — só existe na estreita (na larga o véu cobre a
          tela inteira, sem faixa própria); é o próprio "fundo que
          fecha". */}
      <div
        className="tv-alforje-topo fixed inset-x-0 z-40 md:hidden"
        style={{ "--tv-alforje-topo": `${topo}px`, height: ALVOS.piso }}>
        <FaixaDoFundo espreita={espreita} aoTocar={aoTocarAFaixa} reduzido={reduzido} />
      </div>

      {/* A MOLDURA — um único invólucro; a coluna larga é o `aside` de
          hoje, byte a byte no que se vê (fixed right-0, md:w-80,
          md:max-w-[88vw], background T.panel, borda T.line). */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        onAnimationEnd={aoEntradaTerminar}
        onTransitionEnd={aoVoltarAoSitioTerminar}
        className={
          "tv-alforje-topo tv-alforje-raio tv-scroll fixed inset-x-0 bottom-0 z-40 flex flex-col overflow-hidden " +
          "md:left-auto md:right-0 md:w-80 md:max-w-[88vw] md:overflow-y-auto " +
          "border-t md:border-t-0 md:border-l " +
          (classeEntradaSaida ? classeEntradaSaida + " " : "")
        }
        style={{
          "--tv-alforje-topo": `${topoPx}px`,
          "--tv-alforje-raio": `${ALFORJE.raio}px`,
          background: T.panel,
          borderTopColor: T.lineStrong,
          borderLeftColor: T.line,
          ...(estiloArrasto || {}),
        }}>
        {/* a pega — só no telefone; arrasta para fechar. `touchAction: none`
           (R21k): a pega nunca rola, então o navegador nunca precisa de
           decidir entre o nosso arrasto e um gesto nativo dele. */}
        <div className="md:hidden flex justify-center shrink-0" style={{ paddingTop: ALFORJE.pega.topo, touchAction: "none" }}
          onPointerDown={aoPressionarPega}>
          <span aria-hidden="true" style={{
            width: ALFORJE.pega.largura, height: ALFORJE.pega.altura, borderRadius: ALFORJE.pega.altura / 2,
            background: T.lineStrong,
          }} />
        </div>

        {/* o cabeçalho — título + Fechar, nos dois tamanhos de tela. A
            pega (acima) já cobre o gesto de descer nesta região; o
            cabeçalho em si não duplica o listener para não competir com
            o toque no título ou no botão de fechar.

            V4d · NA MESA ELE FICA COLADO AO TOPO ao rolar (`md:sticky`): na
            larga a gaveta rola inteira, e o toque num companheiro (V4) rolava
            o cartão dele até o topo — o título e o ✕ saíam de vista. No
            telefone nada muda (lá só o conteúdo rola, entre o cabeçalho e a
            fita). O cartão pedido para abaixo dele por `scroll-margin-top`
            (`FOCO_NA_GAVETA`, no `App.jsx`), com a altura medida aqui. */}
        <div className="flex items-center justify-between shrink-0 px-4 md:px-5 md:pt-5 md:sticky md:top-0 md:z-10"
          style={{ minHeight: ALVOS.chamado, background: T.panel }} ref={medirCabecalho}>
          <h2 id={tituloId} className="tv-display text-xl md:text-2xl" style={{ color: T.ink }}>{titulo}</h2>
          <button type="button" onClick={aoFechar} aria-label="Fechar" className="tv-mono flex items-center justify-center"
            style={{ minWidth: ALVOS.piso, minHeight: ALVOS.piso, color: T.inkDim, fontSize: 18, background: "transparent", border: "none" }}>
            ✕
          </button>
        </div>

        {/* o conteúdo — na estreita rola sozinho entre o cabeçalho e a
            fita; na larga rola junto com tudo, como hoje (é por isso que
            `overflow-y-auto`/`flex-1` somem em `md:`).

            `overscrollBehavior: "contain"` (R21k, ponto 6): com o rolamento
            no topo, um arrasto começado aqui pode ser tomado pelo navegador
            como pull-to-refresh/overscroll (que manda `pointercancel`, e o
            gesto some antes de decidir se era um toque ou um arrasto). Isto
            contém o efeito de rebote NESTE contentor, sem impedir o scroll
            normal — e é a defesa mais simples que a lei pede para tentar
            primeiro. Não fui até o `touchmove` com `{ passive: false }`: ele
            só entraria se esta linha não bastasse, e nada medido aqui pediu
            isso — acrescentá-lo sem essa prova seria inventar problema. */}
        <div ref={conteudoRef} id={conteudoId} onPointerDown={aoPressionarConteudo}
          className="flex-1 min-h-0 overflow-y-auto tv-scroll md:overflow-visible md:flex-none px-4 pb-4 md:px-5 md:pb-5 flex flex-col gap-5"
          style={{ overscrollBehavior: "contain" }}>
          {children}
        </div>

        {/* a fita — só no telefone; a larga mantém `TrilhoAbas` como
            está (fora deste componente, no `App.jsx`).

            SEIS ABAS SÓ VIRAM GLIFO POR CSS (`.tv-fita-seis`, em
            `estilo.js`, abaixo de `ALFORJE.larguraParaSeisRotulos`) — não
            por uma conta em JS que valia em qualquer largura. `soGlifo`
            fica `false` sempre: quem escondia o rótulo por dentro do
            componente também apagava o nome acessível junto (`soGlifo
            ? rotulo : undefined`); aqui o `aria-label` vem de FORA,
            sempre presente, e só o traço visível some — nunca o nome. */}
        <div ref={tablistRef} role="tablist" aria-label="Painéis" onKeyDown={aoTeclarNaFita}
          className={"md:hidden shrink-0 flex" + (abasSeguras.length >= 6 ? " tv-fita-seis" : "")}
          style={{
            padding: `${ALFORJE.enchimentoDaFita}px 0`,
            paddingBottom: `calc(${ALFORJE.enchimentoDaFita}px + env(safe-area-inset-bottom, 0px))`,
            gap: ALFORJE.espacoEntreAbas, background: T.panel,
          }}>
          {abasSeguras.map((aba) => (
            <AbaComGlifo
              key={aba.id}
              id={`tv-aba-${aba.id}`}
              rotulo={aba.rotulo}
              Glifo={aba.Glifo}
              escolhida={aba.id === abaAtiva}
              novo={!!aba.novo}
              contador={aba.contador}
              soGlifo={false}
              onClick={() => aoClicarNaAba(aba.id)}
              tabIndex={aba.id === abaAtiva ? 0 : -1}
              aria-controls={conteudoId}
              aria-label={aba.rotulo}
            />
          ))}
        </div>
      </div>
    </>
  );
}
