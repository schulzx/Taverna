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

/* A LARGURA MÁXIMA NO MONITOR (decisão do `desenho`, K3 §4). A região do
   veredito mede até 1400 px a 1536×816 (`mente/k3-jogo.md` §4.3), e o
   trilho é 100% da largura que o cartão ocupa — sem um teto aqui, o
   relógio ganharia 1400 px de percurso num monitor largo, quando a
   composição inteira foi pensada a 375. O cartão fica à ESQUERDA da
   região, nunca centralizado — é onde a linha do veredito já mora. */
const LARGURA_MAXIMA_PX = 560;

/* Fora do render, sempre: um componente definido dentro do corpo de
   outro reinicia a cada render e mata o foco (armadilha da casa). */
function LinhaDoRecuo({ refExterno, onClick, disabled, comoMenuItem, focado }) {
  return (
    <button
      ref={refExterno}
      type="button"
      role={comoMenuItem ? "menuitem" : undefined}
      tabIndex={comoMenuItem ? (focado ? 0 : -1) : undefined}
      disabled={disabled}
      onClick={onClick}
      className="tv-anel-foco tv-body text-xs"
      style={{
        display: "block", width: "100%", textAlign: "left",
        padding: "10px 12px", minHeight: ALVOS.piso, marginTop: 6,
        background: "transparent", border: `1px solid ${T.line}`, borderRadius: 8,
        color: T.inkDim, cursor: disabled ? "default" : "pointer",
      }}
    >
      deixar passar
    </button>
  );
}

/* O verbo armado com o preço — a peça que se repete no chamado (uma
   reação) e em cada linha do leque (duas ou mais). */
function LinhaDoVerbo({ innerRef, reacao, onClick, disabled, comoMenuItem, focado }) {
  return (
    <button
      ref={innerRef}
      type="button"
      role={comoMenuItem ? "menuitem" : undefined}
      tabIndex={comoMenuItem ? (focado ? 0 : -1) : undefined}
      disabled={disabled}
      onClick={onClick}
      className="tv-anel-foco tv-mono text-xs"
      style={{
        display: "block", width: "100%", textAlign: "left",
        padding: "12px 12px", minHeight: ALVOS.chamado, borderRadius: 8,
        background: T.panelSoft, border: `1px solid ${T.amber}`,
        color: T.ink, fontWeight: 600, cursor: disabled ? "default" : "pointer",
      }}
    >
      {reacao.icone} {precoDoVerbo(reacao)}
    </button>
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
}) {
  const [aberto, setAberto] = React.useState(false);   // Chamando -> Escolhendo
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
  const trilho = trilhoVisivel && (
    reduzido ? (
      <div className="tv-mono" style={{ color: corDoTrilho, fontSize: 18, marginTop: 6 }} aria-hidden="true">{numeralContagem}</div>
    ) : (
      <div className="tv-trilho-entra" style={{ width: "100%", height: 4, marginTop: 8, borderRadius: 2, background: T.line, overflow: "hidden" }}>
        <div
          className="tv-janela-tempo"
          style={{
            width: "100%", height: "100%", background: corDoTrilho,
            "--tv-trilho-ms": `${oferta.trilhoMs}ms`,
            "--tv-trilho-desde": `${-Math.max(0, passou - oferta.folgaMs)}ms`,
          }}
        />
      </div>
    )
  );

  return (
    <div
      role={etapa === "Escolhendo" ? "menu" : undefined}
      onKeyDown={onKeyDownDoCartao}
      className={etapa === "Resolvida" ? "tv-resolve" : aberto ? "tv-leque-abre" : "tv-chamado-entra"}
      style={{ width: "100%", maxWidth: LARGURA_MAXIMA_PX, textAlign: "left" }}
    >
      {etapa !== "Resolvida" && (
        <div className="tv-body text-sm" style={{ color: T.ink }}>{linhaDoGolpe}</div>
      )}

      {/* O saldo de PM: só quando alguma reação oferecida custa PM — é a
          peça mínima que fecha a colisão medida no telefone, onde o
          cartão tapa a barra de PM no segundo em que pede para gastá-lo. */}
      {etapa !== "Resolvida" && mostrarSaldo && (
        <div className="tv-mono text-[10px]" style={{ color: T.inkDim, marginTop: 2 }}>PM {saldoPM}</div>
      )}

      {(etapa === "Direta" || etapa === "Chamando") && (
        <div style={{ marginTop: 6 }}>
          <LinhaDoVerbo innerRef={chamadoRef} reacao={reacoes[0]} onClick={abrirOuResponder} />
          {trilho}
          <LinhaDoRecuo refExterno={recuoDiretoRef} onClick={recusar} />
        </div>
      )}

      {etapa === "Escolhendo" && (
        <div style={{ marginTop: 6 }}>
          {reacoes.map((r, i) => (
            <div key={r.id} style={{ marginTop: i ? 6 : 0 }}>
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
          <LinhaDoRecuo refExterno={recuoDoLequeRef} onClick={recusar} comoMenuItem focado={focoIndex === reacoes.length} />
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
  );
}
