/* ============================================================
   O CARTÃO DA REAÇÃO (K3) — src/painel-reacao.jsx

   Ele pergunta e devolve o gesto. NÃO decide nada: não rola dado, não
   debita PM, não decide a reação na ausência de gesto, não escreve no
   log, não fecha a janela sozinho. O contrato inteiro está em
   `mente/k3-desenho.md` §4 e `mente/k3-jogo.md` §3; a assinatura foi
   fixada pelo `regente` e não muda por nada — quem chama já está
   construído contra ela.

   Conta se prova, tela se olha: o módulo puro (`ritmo-da-reacao.js`)
   já decidiu SE a janela abre e QUANTO tempo ela tem; `reacoes.js` já
   decidiu O QUE cada verbo faz; `palavras-da-reacao.js` já escreveu
   a prosa. Este arquivo só monta a tela e devolve gestos.
   ============================================================ */
import React from "react";
import { T, ALVOS } from "./constantes.js";
import { TEMPOS_DO_CARTAO, temRelogio, janelaExpirouEm } from "./ritmo-da-reacao.js";
import { precoDoVerbo } from "./palavras-da-reacao.js";
/* V6 parte 2 (F4 «REACAO_NA_MESA»): a vela que queima e a carta por reação */
import { VELA_DA_REACAO, ceraDaVela, CARTA_DE_ACAO } from "./luta-na-mesa.js";
import { SOMBRA_DA_MESA, alfa } from "./estilo.js";
/* F4 §10 (19/11): a caixa da reação por dentro — a vela da altura da caixa, o
   bloco de quem acerta, as cartas de 308/202 e «você leva de X a Y» (RX-1) */
import { REACAO_NA_MAO as RM, alturaDaVela, larguraDaCartaDaReacao, oQueFicaDaReacao } from "./luta-na-mesa.js";
import { Glifo } from "./ui.jsx";
import { letraDaMesa } from "./mesa-do-mestre.js";

/* O QUE A MESA SABE E O APP NÃO PASSA AO CARTÃO: a intenção anunciada de quem
   acerta (a faixa do golpe) e a altura da caixa da mão. Quem dá é a tela da
   luta (painel-batalha.jsx); sem ela, o cartão é o de sempre. */
export const ContextoDaReacaoNaMesa = React.createContext(null);

/* UMA CARTA DA REAÇÃO NA MÃO: glifo 22, nome (Mesa/Lugar), o custo numa linha
   (brasa) e o resultado na outra — «você leva de 1 a 4» (Bold 20, perigo)
   quando a faixa do golpe é sabida; senão a forma provisória (o efeito da
   tabela, Bold 16 tinta). */
function CartaDaReacao({ innerRef, glifo, nome, custo, fica, efeito, largura, onClick, comoMenuItem, focado, falado, compacta = false }) {
  const C = RM.carta;
  /* no celular (o §10 não desenhou a reação ali): a carta em fluxo — o nome em
     até duas linhas, o custo e o resultado curto («leva 1–4»), para três
     cartas caberem lado a lado nos 363 da janela sem cortar o número */
  if (compacta) {
    return (
      <button ref={innerRef} type="button" role={comoMenuItem ? "menuitem" : undefined} tabIndex={comoMenuItem ? (focado ? 0 : -1) : undefined}
        onClick={onClick} aria-label={falado} className="tv-anel-foco flex flex-col items-start"
        style={{ flex: "1 1 0", minWidth: 0, minHeight: RM.alturaDaCarta, padding: 8, gap: 4, textAlign: "left", borderRadius: C.raio,
          background: T[CARTA_DE_ACAO.chao], border: `1px solid ${T[CARTA_DE_ACAO.borda]}`, filter: `drop-shadow(0 2px 3px ${alfa(T.veuDaNoite, 0.5)})`, cursor: "pointer" }}>
        <span aria-hidden="true" style={{ lineHeight: 0 }}><Glifo nome={glifo} tamanho={18} cor={T.onAccent} /></span>
        <span aria-hidden="true" style={{ ...letraDaMesa("nome"), letterSpacing: 0, color: T.tintaDoPergaminho, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{nome}</span>
        <span aria-hidden="true" style={{ ...letraDaMesa("servico"), textTransform: "none", color: T.brasaNoPergaminho }}>{custo}</span>
        <span aria-hidden="true" className="tv-body" style={{ fontWeight: 700, lineHeight: 1.2, fontSize: 15, color: fica ? T.perigoNoPergaminho : T.tintaDoPergaminho }}>{fica || efeito}</span>
      </button>
    );
  }
  return (
    <button ref={innerRef} type="button" role={comoMenuItem ? "menuitem" : undefined} tabIndex={comoMenuItem ? (focado ? 0 : -1) : undefined}
      onClick={onClick} aria-label={falado} className="tv-anel-foco shrink-0"
      style={{ position: "relative", width: largura || undefined, flex: largura ? undefined : "1 1 0", minWidth: 0, height: RM.alturaDaCarta, padding: 0, textAlign: "left", borderRadius: C.raio,
        background: T[CARTA_DE_ACAO.chao], border: `1px solid ${T[CARTA_DE_ACAO.borda]}`, filter: `drop-shadow(0 2px 3px ${alfa(T.veuDaNoite, 0.5)})`, cursor: "pointer" }}>
      <span aria-hidden="true" style={{ position: "absolute", left: C.xGlifo, top: C.yGlifo, lineHeight: 0 }}><Glifo nome={glifo} tamanho={C.glifo} cor={T.onAccent} /></span>
      <span aria-hidden="true" className="truncate" style={{ position: "absolute", left: C.xNome, right: 8, top: C.yGlifo, ...letraDaMesa(compacta ? "nome" : "lugar"), color: T.tintaDoPergaminho }}>{nome}</span>
      <span aria-hidden="true" className="truncate" style={{ position: "absolute", left: C.xGlifo, right: 8, top: C.yCusto, ...letraDaMesa("servico"), textTransform: "none", color: T.brasaNoPergaminho }}>{custo}</span>
      <span aria-hidden="true" className="tv-body truncate" style={{ position: "absolute", left: C.xGlifo, right: 8, top: C.yResultado, fontWeight: 700, lineHeight: 1.2,
        fontSize: fica ? (compacta ? 15 : 20) : (compacta ? 14 : 16), color: fica ? T.perigoNoPergaminho : T.tintaDoPergaminho }}>{fica || efeito}</span>
    </button>
  );
}
const faixaEmPalavras = (f) => (f.min === f.max ? `${f.min}` : `${f.min} ${RM.palavras.a} ${f.max}`);

/* A LARGURA MÁXIMA NO MONITOR (decisão do `desenho`, K3 §4). A região do
   veredito mede até 1400 px a 1536×816 (`mente/k3-jogo.md` §4.3), e o
   trilho é 100% da largura que o cartão ocupa — sem um teto aqui, o
   relógio ganharia 1400 px de percurso num monitor largo, quando a
   composição inteira foi pensada a 375. O cartão fica à ESQUERDA da
   região, nunca centralizado — é onde a linha do veredito já mora. */
const LARGURA_MAXIMA_PX = 560;

/* Fora do render, sempre: um componente definido dentro do corpo de
   outro reinicia a cada render e mata o foco (armadilha da casa). */
function LinhaDoRecuo({ refExterno, onClick, disabled, comoMenuItem, focado, naMesa = false }) {
  return (
    <button
      ref={refExterno}
      type="button"
      role={comoMenuItem ? "menuitem" : undefined}
      tabIndex={comoMenuItem ? (focado ? 0 : -1) : undefined}
      disabled={disabled}
      onClick={onClick}
      className="tv-anel-foco tv-body text-sm"
      style={{
        display: "block", width: "100%", textAlign: "left",
        padding: "10px 12px", minHeight: naMesa ? ALVOS.chamado : ALVOS.piso, marginTop: naMesa ? 0 : 6,
        background: "transparent", border: `1px dashed ${T.lineStrong}`, borderRadius: CARTA_DE_ACAO.raio,
        color: T.inkMeio, cursor: disabled ? "default" : "pointer",
      }}
    >
      deixar passar
    </button>
  );
}

/* O verbo armado com o preço — a peça que se repete no chamado (uma
   reação) e em cada linha do leque (duas ou mais). */
/* V6 parte 2 (F4 «REACAO_NA_MESA»): a linha vira CARTA de osso — o nome em
   Cinzel e, por baixo, o preço e o que ela faz em brasa («3 PM — anula»).
   O texto continua a ser o de precoDoVerbo (a prosa da tabela), partido em
   duas: o verbo em cima, o resto em baixo. */
function partesDoPreco(reacao) {
  const p = precoDoVerbo(reacao);
  const i = p.indexOf(" · ");
  return i < 0 ? { nome: p, resto: "" } : { nome: (reacao && reacao.nome) || p.slice(0, i), resto: p.slice(i + 3) };
}
function LinhaDoVerbo({ innerRef, reacao, onClick, disabled, comoMenuItem, focado }) {
  const { nome, resto } = partesDoPreco(reacao);
  const C = CARTA_DE_ACAO;
  return (
    <button
      ref={innerRef}
      type="button"
      role={comoMenuItem ? "menuitem" : undefined}
      tabIndex={comoMenuItem ? (focado ? 0 : -1) : undefined}
      disabled={disabled}
      onClick={onClick}
      aria-label={precoDoVerbo(reacao)}
      className="tv-anel-foco"
      style={{
        display: "block", width: "100%", textAlign: "left",
        padding: "8px 12px", minHeight: ALVOS.chamado, borderRadius: C.raio,
        background: T[C.chao], border: `${C.bordaArmadaPx}px solid ${T[C.bordaArmada]}`,
        /* a sombra é filter: o anel de foco da folha é box-shadow, e o inline o apagaria */
        filter: `drop-shadow(0 2px 3px ${alfa(T.veuDaNoite, 0.5)})`,
        color: T[C.letra], cursor: disabled ? "default" : "pointer",
      }}
    >
      <span aria-hidden="true" className="tv-display" style={{ display: "block", fontSize: 16, fontWeight: 700, lineHeight: 1.2 }}>{reacao.icone} {nome}</span>
      {resto && <span aria-hidden="true" className="tv-body" style={{ display: "block", fontSize: 14, fontWeight: 600, lineHeight: 1.3, color: T[C.custo] }}>{resto}</span>}
    </button>
  );
}

/* A VELA (F4 «REACAO_NA_MESA»): o prato de latão, o contorno tracejado da
   vela inteira e a cera que resta, com a chama. A cera é o MESMO relógio do
   trilho (a classe tv-janela-tempo, rodada a −90°: o que encolhia para a
   esquerda encolhe para baixo) — a duração continua a ser a da tabela, e
   com movimento reduzido a cera desce em degraus de 1 s (ceraDaVela). */
function VelaDaReacao({ oferta, passou, reduzido, aperto, curta = false, altura = null }) {
  const V = VELA_DA_REACAO;
  const cera = ceraDaVela(oferta, passou, { reduzido });
  if (!cera.tem) return null;
  const chama = aperto ? T[V.chamaAperto] : T[V.chama];
  const h = altura > 0 ? altura : curta ? V.vela.curta : V.vela.altura, w = V.vela.largura, P = V.pavio;
  const topoDaCera = reduzido ? h * (1 - cera.fracao) : 0;
  const formaDaChama = { position: "absolute", left: w / 2 - P.largura / 2, width: P.largura, height: P.altura, borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%", background: chama };
  return (
    <div aria-hidden="true" className="shrink-0 flex flex-col items-center" style={{ width: V.prato.largura }}>
      <div style={{ position: "relative", width: w, height: h + P.folga }}>
        <span style={{ position: "absolute", left: 0, top: P.folga, width: w, height: h, border: `1px dashed ${alfa(T[V.contorno], V.alfaDoContorno)}`, borderRadius: 3, boxSizing: "border-box" }} />
        {reduzido ? (
          <>
            <span style={{ position: "absolute", left: 0, top: P.folga + topoDaCera, width: w, height: h - topoDaCera, background: T[V.cera], borderRadius: 3 }} />
            <span style={{ ...formaDaChama, top: P.folga - P.altura + topoDaCera }} />
          </>
        ) : (
          <>
            <span style={{ position: "absolute", left: (w - h) / 2, top: P.folga + (h - w) / 2, width: h, height: w, transform: "rotate(-90deg)" }}>
              <span className="tv-janela-tempo" style={{ display: "block", width: "100%", height: "100%", background: T[V.cera], borderRadius: 3,
                "--tv-trilho-ms": `${oferta.trilhoMs}ms`, "--tv-trilho-desde": `${-Math.max(0, passou - oferta.folgaMs)}ms` }} />
            </span>
            <span className={aperto ? "tv-chama-treme" : undefined} style={{ ...formaDaChama, top: P.folga - P.altura, "--tv-treme-ms": `${V.tremeMs}ms`, boxShadow: `0 0 10px ${alfa(T.haloDaVela, 0.6)}` }} />
          </>
        )}
      </div>
      <span style={{ width: V.prato.largura, height: V.prato.altura, borderRadius: "50%", background: T[V.corDoPrato], marginTop: -4 }} />
    </div>
  );
}

export function PainelReacao({
  oferta,             // ritmoDaRodada().abre, tal e qual — ou null (= não há cartão)
  t0,                 // Date.now() do instante em que o cartão nasceu. DO APP, nunca interno.
  linhaDoGolpe,       // a frase já pronta, do App. O componente nunca a formata.
  saldoPM,            // número: o PM que o herói tem AGORA
  resolucao,          // null enquanto aberta. Depois { texto, numero, glifo, aviso }
  reduzido,           // prefers-reduced-motion, lido uma vez pelo App
  ultimoDispositivo,  // "teclado" | "ponteiro"
  aoResponder,        // (reacao | null) => void  ·  null = o relógio acabou, SEM GESTO
  aoRecusar,          // () => void               ·  o recuo: é um gesto, e uma resposta
  aoSair,             // () => void               ·  o cartão cumpriu a vida; pode desmontar
  naMesa = false,     // V6 parte 2: no lugar da mão de ações (a largura da mão, as cartas lado a lado)
}) {
  /* F4 §10: na mesa as cartas estão todas à vista desde o primeiro quadro (o
     leque já aberto); fora dela, o chamado e o leque de sempre */
  const [aberto, setAberto] = React.useState(() => !!naMesa && !!(oferta && oferta.reacoes && oferta.reacoes.length > 1));   // Chamando -> Escolhendo
  const mesa = React.useContext(ContextoDaReacaoNaMesa);
  const [focoIndex, setFocoIndex] = React.useState(0); // roving tabindex do leque
  const [, forcarNovoQuadro] = React.useReducer((x) => x + 1, 0); // só recalcula a leitura do relógio; não conta tique nenhum

  const chamadoRef = React.useRef(null);
  const recuoDiretoRef = React.useRef(null);
  const itensDoLequeRef = React.useRef([]);
  const recuoDoLequeRef = React.useRef(null);
  const focoAnteriorRef = React.useRef(null);
  const tAbriuLequeRef = React.useRef(0);
  const resolucaoRef = React.useRef(resolucao);
  resolucaoRef.current = resolucao;

  const reacoes = (oferta && oferta.reacoes) || [];
  const etapa = resolucao != null ? "Resolvida" : reacoes.length <= 1 ? "Direta" : aberto ? "Escolhendo" : "Chamando";

  /* ---------------- O RELÓGIO, LIDO — NUNCA CONTADO ----------------
     Um só relógio (`Date.now() - t0`); os `setTimeout` aqui não contam
     tiques, só acordam o componente nos instantes em que ALGUMA COISA
     precisa mudar (o trilho aparece, o segundo aperta, a janela
     expira) — cada um calcula o seu atraso a partir do relógio de
     parede, nunca soma um passo fixo ao anterior. */
  React.useEffect(() => {
    if (!oferta || resolucaoRef.current != null) return undefined;
    try {
      const passouAoNascer = Date.now() - t0;
      if (janelaExpirouEm(oferta, passouAoNascer)) {
        // Nasceu já vencida: não desenha barra nenhuma e não mexe no foco.
        aoResponder(null);
        return undefined;
      }
      // guarda o foco ANTES de mover — é o que devolve `restaurarFoco()`
      focoAnteriorRef.current = document.activeElement;
      if (chamadoRef.current) chamadoRef.current.focus();

      /* O RITMO `parado` (WCAG 2.2.1) NÃO TEM RELÓGIO NENHUM —
         `temRelogio(oferta)` é falso quando `janelaMs/trilhoMs/apertoMs`
         são todos 0. Sem isto, a checagem acima ("já nasceu vencida?")
         achava `0 >= 0` verdadeiro NO PRIMEIRO FRAME: a pílula que
         existe para tirar a pressa do caminho de quem pediu "sem
         pressa" resolvia a pergunta sozinha, na hora, e ainda somava um
         degrau à escada do silêncio de quem a escolheu — o oposto exato
         do que ela promete. A janela `parado` fica aberta até haver
         gesto: nenhum temporizador é armado, nenhum trilho e nenhuma
         contagem são desenhados (ver `trilhoVisivel` abaixo). */
      if (!temRelogio(oferta)) return undefined;

      const acordarEm = new Set([oferta.folgaMs, Math.max(0, oferta.janelaMs - oferta.apertoMs), oferta.janelaMs]);
      if (reduzido) for (let ms = oferta.folgaMs; ms <= oferta.janelaMs; ms += 1000) acordarEm.add(ms);
      const timers = [];
      for (const alvo of acordarEm) {
        const faltam = alvo - (Date.now() - t0);
        if (faltam < 0) continue;
        timers.push(setTimeout(() => {
          forcarNovoQuadro();
          if (alvo >= oferta.janelaMs && resolucaoRef.current == null) aoResponder(null);
        }, faltam));
      }
      return () => timers.forEach(clearTimeout);
    } catch (e) {
      console.warn("PainelReacao: o relógio da janela estourou", e);
      return undefined;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [oferta && oferta.ordem, t0]);

  /* A aba volta a ficar visível: o `setTimeout` pode ter atrasado sob
     estrangulamento, e o trilho tem de se realinhar com o relógio de
     parede — nunca com o quadro que passou. */
  React.useEffect(() => {
    const aoVoltar = () => { if (document.visibilityState === "visible") forcarNovoQuadro(); };
    document.addEventListener("visibilitychange", aoVoltar);
    return () => document.removeEventListener("visibilitychange", aoVoltar);
  }, []);

  /* O leque abre: a trava de 150 ms começa a contar AQUI, e o foco vai
     para a primeira reação — nunca para o recuo. */
  React.useEffect(() => {
    if (!aberto) return;
    tAbriuLequeRef.current = Date.now();
    setFocoIndex(0);
    const alvo = itensDoLequeRef.current[0];
    if (alvo) { try { alvo.focus(); } catch (e) { console.warn("PainelReacao: foco do leque falhou", e); } }
  }, [aberto]);

  /* `Etapa=Resolvida` cumpre a vida dela e sai — relógio de parede,
     nunca `animationend` (sob `prefers-reduced-motion` a saída não
     anima, e o evento nunca viria). */
  React.useEffect(() => {
    if (resolucao == null) return undefined;
    const id = setTimeout(() => { try { aoSair(); } catch (e) { console.warn("PainelReacao: aoSair estourou", e); } },
      TEMPOS_DO_CARTAO.resolucaoMs + TEMPOS_DO_CARTAO.saiMs);
    return () => clearTimeout(id);
  }, [resolucao, aoSair]);

  if (!oferta && resolucao == null) return null;

  const restaurarFoco = () => {
    const el = focoAnteriorRef.current;
    if (el && typeof el.focus === "function") { try { el.focus(); } catch (e) { console.warn("PainelReacao: restaurar foco falhou", e); } }
  };
  const responder = (reacao) => { restaurarFoco(); try { aoResponder(reacao); } catch (e) { console.warn("PainelReacao: aoResponder estourou", e); } };
  const recusar = () => { restaurarFoco(); try { aoRecusar(); } catch (e) { console.warn("PainelReacao: aoRecusar estourou", e); } };

  /* A trava de 150 ms: só as linhas RECÉM-REVELADAS do leque — nunca
     `Etapa=Direta` (não há revelação ali) e nunca o recuo (ele fica nos
     mesmos 716–764 nos dois degraus; não pode ter chegado debaixo de um
     dedo que já lá estava). */
  const podeAtivarNoLeque = () => Date.now() - tAbriuLequeRef.current >= TEMPOS_DO_CARTAO.travaMs;

  const passou = oferta ? Date.now() - t0 : 0;
  const temRelogioAgora = temRelogio(oferta);
  const noAperto = temRelogioAgora && passou >= oferta.janelaMs - oferta.apertoMs;
  // `parado` não tem trilho nem contagem: sem relógio, não há o que desenhar.
  const trilhoVisivel = etapa !== "Resolvida" && temRelogioAgora && passou >= oferta.folgaMs;
  const numeralContagem = temRelogioAgora ? Math.max(1, Math.min(4, Math.ceil((oferta.janelaMs - passou) / 1000))) : 0;
  const mostrarSaldo = reacoes.some((r) => (r.pm || 0) > 0);

  const onKeyDownDoCartao = (e) => {
    if (etapa === "Resolvida") return;
    if (e.key === "Escape") { e.preventDefault(); recusar(); return; }
    if (etapa === "Escolhendo" && ultimoDispositivo === "teclado") {
      if (e.key >= "1" && e.key <= "9") {
        const i = Number(e.key) - 1;
        if (i < reacoes.length) { e.preventDefault(); ativarDoLeque(reacoes[i]); }
        return;
      }
      if (e.key === "0") { e.preventDefault(); recusar(); return; }
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const total = reacoes.length + 1; // + o recuo, última linha
        const proximo = e.key === "ArrowDown" ? (focoIndex + 1) % total : (focoIndex - 1 + total) % total;
        setFocoIndex(proximo);
        const alvo = proximo === reacoes.length ? recuoDoLequeRef.current : itensDoLequeRef.current[proximo];
        if (alvo) { try { alvo.focus(); } catch (err) { console.warn("PainelReacao: mover foco no leque falhou", err); } }
      }
    }
  };

  const ativarDoLeque = (reacao) => { if (podeAtivarNoLeque()) responder(reacao); };
  const abrirOuResponder = () => { if (reacoes.length <= 1) responder(reacoes[0]); else setAberto(true); };

  const corDoTrilho = noAperto ? T.danger : T.amber;
  /* V6 parte 2: o tempo é a VELA ao lado (VelaDaReacao); com movimento
     reduzido fica também o numeral da contagem, que é o relógio que se lê */
  const trilho = trilhoVisivel && reduzido && (
    <div className="tv-mono" style={{ color: corDoTrilho, fontSize: 18, marginTop: 6 }} aria-hidden="true">{numeralContagem}</div>
  );
  /* a vela está à vista desde que a janela abre (na luta jogada de d3fb53a a
     reação fechava sozinha sem relógio nenhum à vista); na folga ela está inteira */
  const vela = temRelogioAgora && etapa !== "Resolvida" ? <VelaDaReacao oferta={oferta} passou={passou} reduzido={reduzido} aperto={noAperto} curta={naMesa}
    altura={naMesa && mesa ? alturaDaVela(mesa.caixa, !!mesa.celular) : null} /> : null;
  const cartasLadoALado = naMesa ? { display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(${VELA_DA_REACAO.cartaMinima}px, 1fr))`, gap: 6 } : null;

  /* ============ F4 §10 · A CAIXA DA REAÇÃO NA MÃO ============ */
  if (naMesa && mesa && etapa !== "Resolvida") {
    const vista = mesa.intencaoDe && oferta ? mesa.intencaoDe.get(oferta.inimigo) : null;
    const faixa = vista && vista.dano ? vista.dano : null;
    const vem = oQueFicaDaReacao(null, faixa);
    const P = RM.palavras;
    const todas = [...reacoes.map((r) => ({ r })), { r: null }];
    const largura = larguraDaCartaDaReacao(todas.length);
    const saldo = Number(saldoPM) || 0;
    return (
      <div role={reacoes.length > 1 ? "menu" : undefined} onKeyDown={onKeyDownDoCartao} data-reacao-da-mesa="" className="tv-chamado-entra"
        style={{ position: "relative", width: "100%", height: mesa.celular ? "auto" : mesa.caixa, minHeight: mesa.celular ? undefined : mesa.caixa, display: "flex", alignItems: mesa.celular ? "flex-start" : "center",
          flexWrap: mesa.celular ? "wrap" : "nowrap", gap: RM.entre, padding: mesa.celular ? 8 : `${RM.topo}px ${RM.topo}px ${RM.topo}px ${RM.xVela - VELA_DA_REACAO.prato.largura / 2}px`,
          boxSizing: "border-box", overflow: "hidden", borderRadius: RM.raio, background: T[RM.chao], border: `1px solid ${T[RM.borda]}` }}>
        {vela}
        <div className="flex flex-col min-w-0" style={{ marginLeft: mesa.celular ? 0 : RM.xBloco - RM.xVela - VELA_DA_REACAO.prato.largura / 2 - RM.entre, width: mesa.celular ? "auto" : undefined, flex: mesa.celular ? "1 1 0" : `0 1 ${RM.bloco}px`, gap: 2 }}>
          <span className="truncate" style={{ ...letraDaMesa("nome"), color: T.ink }}>{oferta.inimigo}</span>
          <span style={{ ...letraDaMesa("servico"), textTransform: "none", color: T.inkMeio }}>{P.acerta}</span>
          {vem && <span style={{ ...letraDaMesa("proposta"), color: T.ink }}>{P.vem} {faixaEmPalavras(vem)}</span>}
          {mostrarSaldo && <span style={{ ...letraDaMesa("servico"), textTransform: "none", color: T.inkMeio }}>{P.tem} {saldo} PM</span>}
          {reduzido && trilhoVisivel && <span className="tv-mono" aria-hidden="true" style={{ color: corDoTrilho, fontSize: 18 }}>{numeralContagem}</span>}
        </div>
        <div className="flex" style={{ flexShrink: mesa.celular ? 1 : 0, marginLeft: "auto", gap: RM.entre, flexWrap: "nowrap", width: mesa.celular ? "100%" : undefined }}>
          {todas.map(({ r }, i) => {
            const fica = oQueFicaDaReacao(r, faixa);
            const custo = r ? ((r.pm || 0) > 0 ? (mesa.celular ? `${r.pm} PM` : `${r.pm} PM · ${P.restam} ${Math.max(0, saldo - r.pm)}`) : P.semCusto) : P.semCusto;
            const efeito = r ? partesDoPreco(r).resto.replace(/^\d+ PM — /, "") : P.inteiro;
            const ditoFica = fica ? `${P.leva} ${faixaEmPalavras(fica)}` : "";
            const curtoFica = fica ? `${P.levaCurto} ${fica.min === fica.max ? fica.min : `${fica.min}–${fica.max}`}` : "";
            const nome = r ? r.nome : P.deixar;
            const ehRecuo = !r;
            return (
              <CartaDaReacao key={r ? r.id : "deixar"} glifo={RM.glifo[r ? r.id : "deixar"] || "escudo"} nome={nome} custo={custo} fica={mesa.celular ? curtoFica : ditoFica} efeito={efeito}
                largura={mesa.celular ? null : largura} compacta={!!mesa.celular} comoMenuItem={reacoes.length > 1} focado={focoIndex === i}
                falado={[nome, custo, ditoFica || efeito].filter(Boolean).join(", ")}
                innerRef={ehRecuo ? (reacoes.length > 1 ? recuoDoLequeRef : recuoDiretoRef) : reacoes.length > 1 ? (el) => { itensDoLequeRef.current[i] = el; } : chamadoRef}
                onClick={ehRecuo ? recusar : reacoes.length > 1 ? () => ativarDoLeque(r) : () => responder(r)} />
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div
      role={etapa === "Escolhendo" ? "menu" : undefined}
      onKeyDown={onKeyDownDoCartao}
      className={etapa === "Resolvida" ? "tv-resolve" : aberto ? "tv-leque-abre" : "tv-chamado-entra"}
      style={{ width: "100%", maxWidth: naMesa ? "none" : LARGURA_MAXIMA_PX, textAlign: "left",
        display: "flex", gap: 12, alignItems: "stretch", padding: naMesa ? 8 : 10, minHeight: naMesa ? "100%" : undefined, flex: naMesa ? "1 0 auto" : undefined, boxSizing: "border-box", borderRadius: CARTA_DE_ACAO.raio,
        background: T.pagina, border: `1px solid ${T.line}`, boxShadow: naMesa ? "none" : SOMBRA_DA_MESA.erguido }}
    >
      {etapa !== "Resolvida" && vela}
      <div style={{ flex: "1 1 0", minWidth: 0 }}>
      {etapa !== "Resolvida" && (
        <div className="tv-display" style={{ color: T.ink, fontSize: 17, lineHeight: 1.25 }}>{linhaDoGolpe}</div>
      )}

      {/* O saldo de PM: só quando alguma reação oferecida custa PM — é a
          peça mínima que fecha a colisão medida no telefone, onde o
          cartão tapa a barra de PM no segundo em que pede para gastá-lo. */}
      {etapa !== "Resolvida" && mostrarSaldo && (
        <div className="tv-mono text-[10px]" style={{ color: T.inkDim, marginTop: 2 }}>PM {saldoPM}</div>
      )}

      {(etapa === "Direta" || etapa === "Chamando") && (
        <div style={{ marginTop: 6 }}>
          <div style={cartasLadoALado || undefined}>
            <LinhaDoVerbo innerRef={chamadoRef} reacao={reacoes[0]} onClick={abrirOuResponder} />
            {naMesa && <LinhaDoRecuo refExterno={recuoDiretoRef} onClick={recusar} naMesa />}
          </div>
          {trilho}
          {!naMesa && <LinhaDoRecuo refExterno={recuoDiretoRef} onClick={recusar} />}
        </div>
      )}

      {etapa === "Escolhendo" && (
        <div style={{ marginTop: 6, ...(cartasLadoALado || {}) }}>
          {reacoes.map((r, i) => (
            <div key={r.id} style={{ marginTop: i && !naMesa ? 6 : 0 }}>
              <LinhaDoVerbo
                innerRef={(el) => { itensDoLequeRef.current[i] = el; }}
                reacao={r}
                onClick={() => ativarDoLeque(r)}
                comoMenuItem
                focado={focoIndex === i}
              />
            </div>
          ))}
          {trilho}
          <LinhaDoRecuo refExterno={recuoDoLequeRef} onClick={recusar} comoMenuItem focado={focoIndex === reacoes.length} naMesa={naMesa} />
        </div>
      )}

      {etapa === "Resolvida" && resolucao && (
        <div role="status" className="tv-body text-sm" style={{ color: T.ink, padding: "10px 0" }}>
          <div>{resolucao.glifo ? `${resolucao.glifo} ` : ""}{resolucao.texto}</div>
          {/* a segunda linha: o número, em mono — e não é texto novo daqui,
              já sai pronto de `resolverReacao` (k3-jogo.md §1.4) */}
          {resolucao.numero && (
            <div className="tv-mono text-[10px]" style={{ color: T.inkDim, marginTop: 2 }}>{resolucao.numero}</div>
          )}
          {resolucao.aviso && (
            <div className="tv-mono text-[10px]" style={{ color: T.inkDim, marginTop: 4 }}>{resolucao.aviso}</div>
          )}
        </div>
      )}
      </div>
    </div>
  );
}
