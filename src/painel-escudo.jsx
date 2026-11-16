/* ============================================================
   O ESCUDO DO MESTRE (V2 · F1 · 15/11/2026) — menu e pausa.

   formas.md §«A Mesa do Mestre · F1» §7 e as imagens F1-escudo-1440.png /
   F1-escudo-375.png. «Do lado de cá, as regras da casa.» Antes dele não
   havia menu: Esc não abria nada, e o som e o sair moravam a três toques,
   dentro de Bolsa › Perícias e detalhes. Agora: um toque (o canto, ou Esc).

   · Na mesa larga, três folhas de couro: Na luta + Na estrada · A casa ·
     A campanha. Abaixo de ESCUDO_DO_MESTRE.telefone.ate, uma folha só que
     rola, na ordem A casa · Na luta · Na estrada · A campanha, com o pé
     fixo de «Voltar à mesa».
   · A mesa fica atrás, parada (`inert` na raiz), sob o véu; o foco fica
     preso no escudo e volta ao canto ao fechar. Esc fecha (e não chega a
     mais ninguém); tocar no véu fecha.
   · Os rótulos das opções são os das tabelas de hoje (a reação e o golpe
     final do App, RITMOS_VIAGEM); as chaves de config são as mesmas —
     nada do save muda. O tamanho do texto é campo novo e aditivo da
     config (`taverna_cfg_texto`).

   `EscudoDoMestre` é o conteúdo, puro de props (a suíte o renderiza em
   Node); `PortaDoEscudo` é a moldura viva: portal, véu, inert e foco.
   ============================================================ */
import React from "react";
import { createPortal } from "react-dom";
import { T, ESCUDO_DO_MESTRE, SOMBRA_DA_MESA, TAMANHO_DO_TEXTO, alfa } from "./estilo.js";
import { tamanhoNaEscala } from "./mesa-do-mestre.js";
import { letraDaMesa, Lacre } from "./pecas-da-mesa.jsx";
import { somLigado, ligarSom } from "./som-da-mesa.js";

const E = ESCUDO_DO_MESTRE;

/* as palavras do escudo (PT-BR); as das opções vêm das tabelas de quem as tem */
export const PALAVRAS_DO_ESCUDO = {
  titulo: "O escudo do Mestre",
  sub: "Do lado de cá, as regras da casa. A mesa espera.",
  subTelefone: "As regras da casa. A mesa espera.",
  casa: "A casa", luta: "Na luta", estrada: "Na estrada", campanha: "A campanha",
  ligado: "ligado", desligado: "desligado",
  som: { rotulo: "Som", diz: "O dado no feltro, a pena, o lacre." },
  texto: { rotulo: "Tamanho do texto", diz: "Vale para a página inteira. Nenhuma letra fica abaixo de 12.", opcao: (m) => `Texto a ${Math.round(m * 100)} %` },
  rolagens: { rotulo: "Rolagens à vista", diz: "Os dados do mundo pousam na bandeja." },
  rolaPorMim: { rotulo: "O Mestre rola por mim", diz: "Ele lança; você só vê pousar." },
  guardar: { rotulo: "Guardar em arquivo", diz: "Baixa um arquivo com a campanha inteira. O save deste aparelho continua aqui." },
  voltar: { rotulo: "Voltar à mesa", diz: "Esc também volta." },
  /* V10: «Sair para o início» ganhou a cena de levantar da mesa (o cartão da sessão) */
  sair: { rotulo: "Levantar da mesa", diz: "O cartão da noite, para guardar. A campanha fica neste aparelho." },
};
const W = PALAVRAS_DO_ESCUDO;

/* ---------- os controles (definidos fora de todo render: o foco vive) ---------- */
function Secao({ titulo, children }) {
  return (
    <section aria-label={titulo} className="flex flex-col" style={{ gap: 14 }}>
      <h3 style={{ margin: 0, paddingBottom: 8, borderBottom: `1px solid ${alfa(T.latao, 0.6)}`, color: T.amberSoft, ...letraDaMesa("rotulo") }}>{titulo}</h3>
      {children}
    </section>
  );
}

function Interruptor({ rotulo, diz, ligado, aoMudar }) {
  const I = E.interruptor;
  return (
    <button type="button" role="switch" aria-checked={!!ligado} onClick={() => aoMudar && aoMudar(!ligado)} className="tv-anel-foco"
      style={{ minHeight: I.linha, width: "100%", display: "flex", alignItems: "center", gap: 12, background: "transparent", border: 0, padding: 0, textAlign: "left", cursor: "pointer" }}>
      <span className="flex flex-col" style={{ flex: 1, minWidth: 0 }}>
        <span style={{ color: T.ink, ...letraDaMesa("proposta") }}>{rotulo}</span>
        <span style={{ color: T.inkMeio, ...letraDaMesa("notaDoMestre") }}>{diz}</span>
      </span>
      <span aria-hidden="true" style={{ color: ligado ? T.amberSoft : T.inkMeio, ...letraDaMesa("servico") }}>{ligado ? W.ligado : W.desligado}</span>
      <span aria-hidden="true" style={{ flex: "none", position: "relative", width: I.trilho.largura, height: I.trilho.alto, borderRadius: I.trilho.alto, background: ligado ? T.amber : T.couroBaixo, border: `1px solid ${ligado ? T.amber : T.latao}` }}>
        <span style={{ position: "absolute", top: (I.trilho.alto - 2 - I.botao) / 2, left: ligado ? I.trilho.largura - 2 - I.botao - 2 : 2, width: I.botao, height: I.botao, borderRadius: "50%", background: T.osso, boxShadow: SOMBRA_DA_MESA.peca }} />
      </span>
    </button>
  );
}

function Escolha({ rotulo, opcoes, escolhida, aoEscolher, diz = "", rotuloDe = null }) {
  const C = E.escolha;
  return (
    <div className="flex flex-col" style={{ gap: 8 }}>
      <span style={{ color: T.ink, ...letraDaMesa("proposta") }}>{rotulo}</span>
      <div role="radiogroup" aria-label={rotulo} className="flex flex-wrap" style={{ gap: 8 }}>
        {opcoes.map((o) => {
          const sim = o.id === escolhida;
          return (
            <button key={o.id} type="button" role="radio" aria-checked={sim} aria-label={rotuloDe ? rotuloDe(o) : undefined} onClick={() => aoEscolher && aoEscolher(o.id)} className="tv-anel-foco"
              style={{ minHeight: C.alto, flex: "1 1 auto", minWidth: 72, padding: "0 10px", borderRadius: C.raio, cursor: "pointer",
                background: sim ? T.osso : "transparent", color: sim ? T.tintaDoPergaminho : T.ink, border: `1px solid ${sim ? T.osso : T.latao}`,
                ...letraDaMesa("proposta"), fontWeight: sim ? 600 : 500, ...(o.estilo || {}) }}>
              {o.rotulo}
            </button>
          );
        })}
      </div>
      {diz ? <span style={{ color: T.inkMeio, ...letraDaMesa("notaDoMestre") }}>{diz}</span> : null}
    </div>
  );
}

function BotaoDoEscudo({ papel = "secundario", rotulo, diz = "", aoTocar, refBotao = null }) {
  const B = E.botao;
  const principal = papel === "principal";
  const sair = papel === "sair";
  return (
    <div className="flex flex-col" style={{ gap: 8 }}>
      <button ref={refBotao} type="button" onClick={aoTocar} className="tv-anel-foco"
        style={{ minHeight: B.alto, width: "100%", borderRadius: B.raio, cursor: "pointer", background: principal ? T.amber : "transparent", color: principal ? T.onAccent : T.ink,
          border: `${sair ? 2 : 1}px solid ${principal ? T.amber : sair ? T.lacreLume : T.latao}`, boxShadow: principal ? SOMBRA_DA_MESA.peca : "none", ...letraDaMesa("proposta") }}>
        {rotulo}
      </button>
      {diz ? <span style={{ color: T.inkMeio, textAlign: principal ? "center" : "left", ...letraDaMesa("notaDoMestre") }}>{diz}</span> : null}
    </div>
  );
}

function Folha({ largura, alto, children, rola = true }) {
  const F = E.folha;
  return (
    <div style={{ width: largura, maxWidth: "100%", height: alto, maxHeight: "calc(100vh - 32px)", background: T.couro, border: `${F.borda}px solid ${T.couroBaixo}`, borderRadius: F.raio, boxShadow: SOMBRA_DA_MESA.erguido, padding: F.fio, flex: "none", display: "flex" }}>
      <div className={rola ? "tv-scroll" : ""} style={{ flex: 1, minHeight: 0, overflowY: rola ? "auto" : "visible", outline: `1px solid ${alfa(T.latao, 0.7)}`, outlineOffset: -1, borderRadius: 2, padding: F.padding - F.fio, boxShadow: `inset 0 0 0 ${F.costura - F.fio - 2}px ${T.couro}, inset 0 0 0 ${F.costura - F.fio - 1}px ${alfa(T.lataoLume, 0.45)}` }}>
        <div className="flex flex-col" style={{ gap: 22 }}>{children}</div>
      </div>
    </div>
  );
}

/* ============================================================
   O CONTEÚDO — puro de props
   ============================================================ */
export function EscudoDoMestre({
  telefone = false,
  som = true, aoSom = null,
  tamanhoDoTexto = TAMANHO_DO_TEXTO.padrao, aoTamanhoDoTexto = null,
  rolagens = true, aoRolagens = null,
  rolaPorMim = false, aoRolaPorMim = null,
  reacao = null, golpe = null, marcha = null,
  campanha = "", aoGuardar = null, aoSair = null, aoVoltar = null, refVoltar = null,
}) {
  const cabeca = (
    <header className={telefone ? "flex items-center" : "flex flex-col items-center"} style={{ gap: telefone ? 12 : 8, textAlign: telefone ? "left" : "center" }}>
      <Lacre tamanho={telefone ? "P" : "M"} tipo="quest" rotulo="" />
      <div>
        <h2 id="escudo-titulo" style={{ margin: 0, color: T.amberSoft, ...letraDaMesa("tituloObjeto") }}>{W.titulo}</h2>
        <p style={{ margin: 0, color: T.inkMeio, ...letraDaMesa("notaDoMestre") }}>{telefone ? W.subTelefone : W.sub}</p>
      </div>
    </header>
  );
  const opcoesDoTexto = TAMANHO_DO_TEXTO.opcoes.map((m) => ({ id: m, rotulo: "A", estilo: { fontSize: tamanhoNaEscala("proposta", m), fontFamily: "'Spectral', Georgia, serif", textTransform: "none" } }));
  const casa = (
    <Secao titulo={W.casa}>
      <Interruptor rotulo={W.som.rotulo} diz={W.som.diz} ligado={som} aoMudar={aoSom} />
      <Escolha rotulo={W.texto.rotulo} opcoes={opcoesDoTexto} escolhida={tamanhoDoTexto} aoEscolher={aoTamanhoDoTexto} diz={W.texto.diz} rotuloDe={(o) => W.texto.opcao(o.id)} />
      <Interruptor rotulo={W.rolagens.rotulo} diz={W.rolagens.diz} ligado={rolagens} aoMudar={aoRolagens} />
      <Interruptor rotulo={W.rolaPorMim.rotulo} diz={W.rolaPorMim.diz} ligado={rolaPorMim} aoMudar={aoRolaPorMim} />
    </Secao>
  );
  const luta = reacao || golpe ? (
    <Secao titulo={W.luta}>
      {reacao ? <Escolha rotulo={reacao.titulo} opcoes={reacao.fila} escolhida={reacao.escolhida} aoEscolher={reacao.aoEscolher} diz={reacao.diz || ""} /> : null}
      {golpe ? <Escolha rotulo={golpe.titulo} opcoes={golpe.fila} escolhida={golpe.escolhida} aoEscolher={golpe.aoEscolher} diz={golpe.diz || ""} /> : null}
    </Secao>
  ) : null;
  const estrada = marcha ? (
    <Secao titulo={W.estrada}>
      <Escolha rotulo={marcha.titulo} opcoes={marcha.fila} escolhida={marcha.escolhida} aoEscolher={marcha.aoEscolher} diz={marcha.diz || ""} />
    </Secao>
  ) : null;
  const daCampanha = (
    <Secao titulo={W.campanha}>
      {campanha ? <p style={{ margin: 0, color: T.inkMeio, ...letraDaMesa("notaDoMestre") }}>{campanha}</p> : null}
      {aoGuardar ? <BotaoDoEscudo rotulo={W.guardar.rotulo} diz={W.guardar.diz} aoTocar={aoGuardar} /> : null}
      {telefone ? null : <BotaoDoEscudo papel="principal" rotulo={W.voltar.rotulo} diz={W.voltar.diz} aoTocar={aoVoltar} refBotao={refVoltar} />}
      {aoSair ? <BotaoDoEscudo papel="sair" rotulo={W.sair.rotulo} diz={W.sair.diz} aoTocar={aoSair} /> : null}
    </Secao>
  );
  if (telefone) {
    return (
      <div data-forma="telefone" className="flex flex-col" style={{ width: "100%", height: "100%", background: T.couro }}>
        <div className="tv-scroll" style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: 16, margin: 8, outline: `1px solid ${alfa(T.latao, 0.7)}` }}>
          <div className="flex flex-col" style={{ gap: 22 }}>{cabeca}{casa}{luta}{estrada}{daCampanha}</div>
        </div>
        <div style={{ flex: "none", minHeight: E.telefone.pe, padding: "14px 16px", borderTop: `1px solid ${alfa(T.latao, 0.6)}`, background: T.couroBaixo }}>
          <BotaoDoEscudo papel="principal" rotulo={W.voltar.rotulo} aoTocar={aoVoltar} refBotao={refVoltar} />
        </div>
      </div>
    );
  }
  return (
    <div data-forma="mesa" className="flex items-center justify-center" style={{ gap: E.folhas.entre }}>
      <Folha largura={E.folhas.lado.largura} alto={E.folhas.lado.alto}>{luta}{estrada}</Folha>
      <Folha largura={E.folhas.centro.largura} alto={E.folhas.centro.alto}>{cabeca}{casa}</Folha>
      <Folha largura={E.folhas.lado.largura} alto={E.folhas.lado.alto}>{daCampanha}</Folha>
    </div>
  );
}

/* ============================================================
   A PORTA — portal no body, a mesa `inert` atrás, o véu, o foco preso e
   devolvido. Esc fecha aqui (stopPropagation: não chega a mais ninguém).
   ============================================================ */
const FOCAVEIS = 'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';
export function PortaDoEscudo({ aberto = false, aoFechar, refDevolver = null, ...resto }) {
  const caixa = React.useRef(null);
  const voltar = React.useRef(null);
  /* o som é do som-da-mesa.js (taverna_cfg_som), como era no interruptor da
     Bolsa: a porta lê-o e guarda-o sem passar pelo App */
  const [som, setSom] = React.useState(() => { try { return somLigado(); } catch (e) { return true; } });
  const aoSom = (v) => { try { setSom(ligarSom(!!v)); } catch (e) { /* nunca custa o turno */ } };
  const [telefone, setTelefone] = React.useState(() => { try { return window.innerWidth < E.telefone.ate; } catch (e) { return false; } });
  React.useEffect(() => {
    const medir = () => { try { setTelefone(window.innerWidth < E.telefone.ate); } catch (e) { /* segue */ } };
    window.addEventListener("resize", medir);
    return () => window.removeEventListener("resize", medir);
  }, []);
  React.useEffect(() => {
    if (!aberto) return undefined;
    const raiz = document.getElementById("root");
    try { if (raiz) raiz.setAttribute("inert", ""); } catch (e) { /* segue */ }
    const t = setTimeout(() => { try { (voltar.current || (caixa.current && caixa.current.querySelector(FOCAVEIS)))?.focus(); } catch (e) { /* segue */ } }, 0);
    return () => {
      clearTimeout(t);
      try { if (raiz) raiz.removeAttribute("inert"); } catch (e) { /* segue */ }
      try { if (refDevolver && refDevolver.current) refDevolver.current.focus(); } catch (e) { /* segue */ }
    };
  }, [aberto]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!aberto || typeof document === "undefined") return null;
  const tecla = (e) => {
    if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); aoFechar && aoFechar(); return; }
    if (e.key !== "Tab") return;
    try {
      const lista = [...caixa.current.querySelectorAll(FOCAVEIS)].filter((el) => el.offsetParent !== null || el === document.activeElement);
      if (!lista.length) return;
      const primeiro = lista[0], ultimo = lista[lista.length - 1];
      if (e.shiftKey && document.activeElement === primeiro) { e.preventDefault(); ultimo.focus(); }
      else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primeiro.focus(); }
    } catch (er) { /* o Tab segue o caminho de sempre */ }
  };
  return createPortal(
    <div role="dialog" aria-modal="true" aria-labelledby="escudo-titulo" data-escudo="aberto" onKeyDown={tecla}
      className="tv-fade" style={{ position: "fixed", inset: 0, zIndex: 80, display: "flex", alignItems: "center", justifyContent: "center", padding: telefone ? 0 : 16 }}>
      <div aria-hidden="true" onClick={() => aoFechar && aoFechar()} style={{ position: "absolute", inset: 0, background: alfa(T.couroBaixo, E.veu) }} />
      <div ref={caixa} style={{ position: "relative", width: telefone ? "100%" : "auto", height: telefone ? "100%" : "auto" }}>
        <EscudoDoMestre {...resto} som={som} aoSom={aoSom} telefone={telefone} aoVoltar={aoFechar} refVoltar={voltar} />
      </div>
    </div>,
    document.body,
  );
}
