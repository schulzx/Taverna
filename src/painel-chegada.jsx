/* ============================================================
   A CHEGADA (V5 · F3 §2–§4 de mente/formas.md, 16/11/2026) — Taverna

   A primeira tela que alguém vê, e ela tem UMA ação: «Sentar à mesa».
   «Continuar», o «Anteriormente» e o arquivo só aparecem quando existe
   campanha. Sem barra de topo, sem rosa de botão: a mesa posta à noite,
   a marca, a arte de abertura. As peças comuns às duas telas (a mesa da
   noite, a marca, o botão da mesa, o vínculo, a carta do herói) moram
   aqui e a criação (painel-criacao.jsx) usa-as.

   Tudo é apresentação: o que mostrar e o que fazer chega por props. A
   conta (o save visto da porta, o sorteio) mora em criacao-da-mesa.js.
   ============================================================ */
import React from "react";
import { T, VELA, LUZ_DA_CHEGADA, ABERTURA_INSTANTANEA, CARTA_DO_HEROI, BOTAO_DA_MESA, SOMBRA_DA_MESA, GLIFOS_DA_CHEGADA, CSS_DA_CHEGADA, alfa } from "./estilo.js";
import { letraDaMesa } from "./mesa-do-mestre.js";
import { retratoDe } from "./retratos.js";
import { noSexo } from "./criacao-da-mesa.js";
import { haQuantoTempo } from "./registro-da-sessao.js";
import arteDeAbertura from "./assets/arte-de-abertura.webp";

/* O PEDIDO DA PORTA: o que o jogador escolheu na chegada antes de o jogo descer
   (main.jsx fornece; o App lê). null = o jogo abriu sem porta. */
export const PedidoDaPorta = React.createContext(null);

/* a janela é de telefone? (a composição muda abaixo de 768) */
export function useTelefone() {
  const ler = () => { try { return window.innerWidth < ABERTURA_INSTANTANEA.quebra; } catch { return false; } };
  const [tel, setTel] = React.useState(ler);
  React.useEffect(() => {
    const f = () => setTel(ler());
    try { window.addEventListener("resize", f); } catch { /* sem janela */ }
    return () => { try { window.removeEventListener("resize", f); } catch { /* idem */ } };
  }, []);
  return tel;
}

/* O QUE SÓ CARREGA DEPOIS: as peças da mesa e os ícones de gênero vivem no
   pedaço do jogo (puxam o motor inteiro). A chegada pede-os sob demanda; o
   jogo já desce em segundo plano, e quem falha ao carregar cala (null). */
class Calado extends React.Component {
  constructor(props) { super(props); this.state = { erro: false }; }
  static getDerivedStateFromError() { return { erro: true }; }
  componentDidCatch(e) { try { console.error("Taverna · uma peça da chegada calou:", e); } catch { /* nada mais */ } }
  render() { return this.state.erro ? null : this.props.children; }
}
const PecaDeRecursoTardia = React.lazy(() => import("./pecas-da-mesa.jsx").then((m) => ({ default: m.PecaDeRecurso })));
const GlifoDoGeneroTardio = React.lazy(() => import("./ui.jsx").then((m) => ({ default: ({ nome, tamanho, cor }) => React.createElement(m.glifoDoGenero(nome), { tamanho, cor }) })));
export function PecaDeRecurso(props) {
  return <Calado><React.Suspense fallback={null}><PecaDeRecursoTardia {...props} /></React.Suspense></Calado>;
}
export function GlifoDoGenero({ nome, tamanho = 24, cor = "currentColor" }) {
  const reserva = <GlifoDaMesa nome={nome === "castelo" ? "castelo" : "mapa"} tamanho={tamanho} cor={cor} />;
  return <Calado><React.Suspense fallback={reserva}><GlifoDoGeneroTardio nome={nome} tamanho={tamanho} cor={cor} /></React.Suspense></Calado>;
}

/* A VELA DA CHEGADA: a mesma vela da abertura em HTML (prato, cera, pavio,
   chama), em VELA.cor — sem o relógio das peças, que puxa o jogo inteiro */
export function VelaDaChegada({ escala = 1 }) {
  const C = VELA.cor;
  const p = (l, t, w, h, extra) => ({ position: "absolute", left: l, top: t, width: w, height: h, ...extra });
  return (
    <span aria-hidden="true" style={{ position: "relative", display: "block", width: 123 * escala, height: 241 * escala }}>
      <span style={{ position: "absolute", left: 0, top: 0, width: 123, height: 241, transform: "scale(" + escala + ")", transformOrigin: "0 0" }}>
        <i style={p(22, 174, 78, 22, { borderRadius: "50%", background: T.latao, boxShadow: "inset 0 -3px " + T.lataoSombra })} />
        <i style={p(48, 125, 28, 60, { borderRadius: "3px 3px 0 0", background: "linear-gradient(90deg, " + C.cera + " 65%, " + C.ceraSombra + " 0)" })} />
        <i style={p(60, 117, 2, 9, { background: C.pavio })} />
        <i className="tv-acende" style={p(55, 95, 13, 24, { borderRadius: "50%/60% 60% 40% 40%", background: "radial-gradient(at 50% 70%, " + C.nucleo + " 30%, " + C.chama + " 72%)", boxShadow: "0 0 40px 26px " + alfa(C.halo, 0.22) })} />
      </span>
    </span>
  );
}

/* um glifo da casa: os de GLIFOS_DA_CHEGADA (os novos do F3 e a cópia, presa
   pela suíte, dos de GLIFOS que a chegada usa) */
export function GlifoDaMesa({ nome, tamanho = 24, cor = "currentColor" }) {
  const d = GLIFOS_DA_CHEGADA[nome];
  if (!d) return null;
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="none" stroke={cor} strokeWidth={tamanho >= 48 ? 1.5 : 2}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d={d} /></svg>
  );
}

/* A MESA DA NOITE: feltro, halo, penumbra e (a partir de 768) a borda de couro */
export function MesaDaNoite({ telefone, halo = null, children }) {
  const L = LUZ_DA_CHEGADA;
  const h = halo || (telefone ? { x: `${ABERTURA_INSTANTANEA.telefone.halo.x}px`, y: `${ABERTURA_INSTANTANEA.telefone.halo.y}px` } : { x: ABERTURA_INSTANTANEA.mesa.halo.x, y: ABERTURA_INSTANTANEA.mesa.halo.y });
  const raio = telefone ? L.haloRaioTelefone : L.haloRaio;
  return (
    <div style={{
      position: "relative", minHeight: "100dvh", width: "100%", overflowX: "hidden", color: T.ink,
      background: `radial-gradient(${raio}px circle at ${h.x} ${h.y}, ${alfa(T.haloDaVela, L.haloAlfa + 0.11)}, ${alfa(T.haloDaVela, L.haloAlfa)} 45%, transparent 100%), radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,${L.penumbra})), ${L.feltro}`,
      boxShadow: telefone ? "none" : `inset 0 0 0 ${ABERTURA_INSTANTANEA.borda.couro}px ${T.couroBaixo}, inset 0 0 0 ${ABERTURA_INSTANTANEA.borda.fio}px ${T.latao}`,
    }}>
      <style>{CSS_DA_CHEGADA}</style>
      {children}
    </div>
  );
}

/* A MARCA: o lacre com o d20 e a palavra (o mesmo desenho da abertura em HTML) */
export function MarcaDaCasa({ deitada = false, escala = 1 }) {
  const A = deitada ? ABERTURA_INSTANTANEA.telefone.marca : ABERTURA_INSTANTANEA.mesa.marca;
  const selo = Math.round(A.selo * escala);
  const letra = Math.round(A.letra * escala);
  return (
    <div style={{ display: deitada ? "flex" : "block", alignItems: "center", gap: deitada ? 14 * escala : 0, textAlign: deitada ? "left" : "center" }} aria-label="Taverna" role="img">
      <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" style={{ display: "block", width: selo, height: selo, margin: deitada ? 0 : "0 auto 17px" }}>
        <path d="M43 5C47 7 53 9 56 13C59 17 59 23 60 28C61 33 62 38 60 43C58 47 54 51 50 55C46 58 41 62 37 63C32 63 26 61 22 59C17 57 12 54 9 51C5 47 2 41 2 37C1 32 4 26 5 22C7 17 10 12 13 9C17 6 23 4 28 3C32 3 38 3 43 5Z" fill={T.lacre} />
        <path d="M32 11 50 21.5v21L32 53 14 42.5v-21zM32 19 44.5 40.5h-25zM32 11v8M50 42.5l-5.5-2M14 42.5l5.5-2M50 21.5 32 19 14 21.5M44.5 40.5 32 53 19.5 40.5" stroke={T.sobreLacre} strokeWidth="2" strokeLinejoin="round" />
      </svg>
      <span style={{ display: "block", fontFamily: "'Cinzel', Georgia, serif", fontWeight: 700, fontSize: letra, lineHeight: `${Math.round(A.entrelinha * escala)}px`, letterSpacing: ".16em", marginRight: "-.16em", color: T.ink }}>TAVERNA</span>
    </div>
  );
}

/* O BOTÃO DA MESA (F3 §3): principal (âmbar, um por tela) ou secundário
   (aro de latão). Impedido: sem chão, aro tracejado, e a razão escrita. */
export function BotaoDaMesa({ principal = false, sobrePapel = false, impedido = false, razao = "", largura = null, onClick, children, rotulo }) {
  const B = sobrePapel ? BOTAO_DA_MESA.papel : principal ? BOTAO_DA_MESA.principal : BOTAO_DA_MESA.secundario;
  const id = React.useId();
  const cheio = principal && !impedido;
  return (
    <span style={{ display: "inline-flex", flexDirection: "column", gap: 6, width: largura || "auto", maxWidth: "100%" }}>
      <button type="button" onClick={impedido ? undefined : onClick} aria-disabled={impedido || undefined} aria-describedby={impedido && razao ? id : undefined} aria-label={rotulo}
        className="tv-mesa-foco tv-mesa-aperta"
        style={{
          height: B.altura, borderRadius: B.raio, padding: `0 ${BOTAO_DA_MESA.principal.respiro}px`, width: "100%", cursor: impedido ? "not-allowed" : "pointer",
          background: cheio ? T.amber : "transparent",
          border: impedido ? `${B.aro}px dashed ${T.inkMeio}` : `${B.aro}px solid ${sobrePapel ? T.tintaDoPergaminho : cheio ? T.brasaNoPergaminho : T.latao}`,
          color: sobrePapel ? T.tintaDoPergaminho : cheio ? T.onAccent : T.ink,
          fontFamily: principal ? "'Cinzel', Georgia, serif" : "'Spectral', Georgia, serif", fontWeight: principal ? 700 : 500,
          fontSize: B.letra || 16, textTransform: principal ? "uppercase" : "none", letterSpacing: principal ? ".04em" : 0,
          boxShadow: cheio ? SOMBRA_DA_MESA.peca : "none",
        }}>{children}</button>
      {impedido && razao ? <span id={id} style={{ ...letraDaMesa("notaDoMestre"), color: T.inkMeio }}>{razao}</span> : null}
    </span>
  );
}

/* O VÍNCULO: Spectral Medium sublinhado, alvo de 44 */
export function Vinculo({ onClick, children, sobrePapel = false, seta = false }) {
  return (
    <button type="button" onClick={onClick} className="tv-mesa-foco"
      style={{ minHeight: BOTAO_DA_MESA.vinculo.altura, background: "none", border: 0, padding: "0 4px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6,
        fontFamily: "'Spectral', Georgia, serif", fontWeight: 500, fontSize: BOTAO_DA_MESA.vinculo.letra, textDecoration: "underline", textUnderlineOffset: 3,
        color: sobrePapel ? T.tintaDoPergaminho : T.ink }}>
      {seta ? <span aria-hidden="true">‹</span> : null}{children}
    </button>
  );
}

/* A CARTA DO HERÓI (F3 §3): 340 × 476 a 1, a pintura cobre a carta, o pé de couro com o nome */
export function CartaDoHeroi({ heroi, escala = 1, rodada = true, falar = false }) {
  const C = CARTA_DO_HEROI;
  const h = heroi || {};
  let arquivo = null;
  try { const r = retratoDe({ raca: h.raca, classe: h.classe, genero: h.sexo, feicoesFixas: true, semente: h.semente || h.nome }, { fixo: true }); arquivo = r && r.arquivo; } catch { arquivo = null; }
  const linha = `${noSexo(h.raca, h.sexo)} · ${noSexo(h.classe, h.sexo)}`;
  const w = Math.round(C.largura * escala), a = Math.round(C.altura * escala);
  return (
    <div role="img" aria-label={`${h.nome || ""}, ${linha}`} aria-live={falar ? "polite" : undefined}
      style={{ position: "relative", width: w, height: a, borderRadius: C.raio * escala, border: `${Math.max(2, C.aro * escala)}px solid ${T.latao}`, overflow: "hidden",
        background: T.couroBaixo, boxShadow: SOMBRA_DA_MESA.erguido, transform: rodada ? `rotate(${C.rodada}deg)` : "none", flexShrink: 0 }}>
      {arquivo ? <img src={arquivo} alt="" decoding="async" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} /> : null}
      <div style={{ position: "absolute", inset: C.fio * escala, border: `1px solid ${alfa(T.lataoLume, 0.5)}`, borderRadius: Math.max(2, (C.raio - 4) * escala), pointerEvents: "none" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: C.pe * escala, background: `linear-gradient(to bottom, ${alfa(T.couroBaixo, 0)}, ${T.couroBaixo})` }} />
      {h.nivel ? <span style={{ position: "absolute", left: 14 * escala, top: 14 * escala, width: 32 * escala, height: 32 * escala, borderRadius: "50%", background: T.lacre, color: T.sobreLacre, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Spectral', Georgia, serif", fontWeight: 700, fontSize: Math.max(12, 14 * escala) }}>{h.nivel}</span> : null}
      {escala >= C.semNomeAbaixo ? (
        <div style={{ position: "absolute", left: 12, right: 12, bottom: 40 * escala, textAlign: "center" }}>
          <div style={{ fontFamily: "'Cinzel', Georgia, serif", fontWeight: 700, fontSize: Math.max(13, C.nome * escala), lineHeight: 1.2, color: T.ink, letterSpacing: ".03em" }}>{h.nome}</div>
          <div style={{ width: 56, height: 1, background: T.latao, margin: `${8 * escala}px auto` }} />
          {escala >= C.semLinhaAbaixo ? <div style={{ ...letraDaMesa("notaDoMestre"), color: T.inkMeio }}>{linha}</div> : null}
        </div>
      ) : null}
    </div>
  );
}

const ROTULO = { ...letraDaMesa("rotulo"), textTransform: "uppercase", letterSpacing: ".1em" };

/* 2 · A PRIMEIRA VISITA: uma ação */
function PrimeiraVisita({ telefone, aoSentar, aoArquivo }) {
  const A = ABERTURA_INSTANTANEA;
  if (telefone) {
    return (
      <div style={{ padding: `${A.telefone.marca.topo}px 16px 32px`, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <MarcaDaCasa deitada />
        <img src={arteDeAbertura} alt="" decoding="async" fetchpriority="high" width="852" height="840" style={{ width: "100%", maxWidth: 420, height: "auto", marginTop: 12 }} />
        <p style={{ fontFamily: "'Spectral', Georgia, serif", fontStyle: "italic", fontSize: 22, lineHeight: "30px", textAlign: "center", margin: "16px 0 24px", color: T.ink }}>Sente-se à mesa.<br />O Mestre já abriu o livro.</p>
        <BotaoDaMesa principal largura="100%" onClick={aoSentar}>Sentar à mesa</BotaoDaMesa>
        <p style={{ ...letraDaMesa("notaDoMestre"), color: T.inkMeio, textAlign: "center", margin: "16px 8px 0" }}>O Mestre sorteia um mundo e um herói para você. Dá para trocar tudo antes de começar.</p>
        <div style={{ marginTop: 24 }}><Vinculo onClick={aoArquivo}>Tenho uma campanha em arquivo</Vinculo></div>
      </div>
    );
  }
  return (
    <div style={{ position: "relative", minHeight: "100dvh" }}>
      <div style={{ position: "absolute", left: A.mesa.marca.x, top: A.mesa.marca.y, width: A.mesa.marca.largura }}>
        <MarcaDaCasa />
        <p style={{ fontFamily: "'Spectral', Georgia, serif", fontStyle: "italic", fontSize: 30, lineHeight: "40px", margin: `${A.mesa.frase.abaixo}px 0 32px`, color: T.ink, width: 420 }}>Sente-se à mesa.<br />O Mestre já abriu o livro.</p>
        <BotaoDaMesa principal largura={320} onClick={aoSentar}>Sentar à mesa</BotaoDaMesa>
        <p style={{ ...letraDaMesa("notaDoMestre"), color: T.inkMeio, width: 340, margin: "18px 0 0" }}>O Mestre sorteia um mundo e um herói para você. Dá para trocar tudo antes de começar.</p>
      </div>
      <img src={arteDeAbertura} alt="" decoding="async" fetchpriority="high" width="852" height="840"
        style={{ position: "absolute", left: "38.9vw", top: "6.7vh", width: "min(57vw, 820px)", height: "auto", maxHeight: "86vh", objectFit: "contain", pointerEvents: "none" }} />
      <div style={{ position: "absolute", left: A.mesa.marca.x, bottom: 40, display: "flex", alignItems: "center", gap: 24 }}>
        <span style={{ ...ROTULO, color: T.inkMeio }}>RPG de mesa · no navegador · em português</span>
        <Vinculo onClick={aoArquivo}>Tenho uma campanha em arquivo</Vinculo>
      </div>
    </div>
  );
}

/* V10 · «DA ÚLTIMA VEZ…» (F6, DA_ULTIMA_VEZ): «HÁ DOIS DIAS · SESSÃO 4», até
   três fatos do registro, a régua, «O FIO MAIS QUENTE» com a pergunta e o
   próximo passo, e onde você está. Tudo do save; nada de IA. */
function DaUltimaVez({ d, salvoEm, aoOuvir }) {
  const quando = haQuantoTempo(d.fim || salvoEm, Date.now());
  return (
    <>
      <div style={{ ...ROTULO, color: T.tintaDoPergaminhoDim }}>{[quando, `sessão ${d.n}`].filter(Boolean).join(" · ")}</div>
      <h2 style={{ ...letraDaMesa("titulo"), margin: "8px 0 14px", color: T.tintaDoPergaminho }}>Da última vez…</h2>
      {d.fatos.map((f, i) => <p key={i} style={{ ...letraDaMesa("prosa"), margin: "0 0 10px" }}>{f}</p>)}
      {d.fio && d.fio.pergunta ? (
        <>
          <div style={{ height: 1, background: alfa(T.tintaDoPergaminho, 0.25), margin: "16px 0 12px" }} />
          <div style={{ ...ROTULO, color: T.brasaNoPergaminho }}>O fio mais quente</div>
          <div style={{ ...letraDaMesa("titulo"), margin: "6px 0 4px", color: T.tintaDoPergaminho }}>{d.fio.pergunta}</div>
          {d.fio.passo ? <div style={{ fontFamily: "'Spectral', Georgia, serif", fontWeight: 500, fontSize: 16, lineHeight: "24px", color: T.tintaDoPergaminho }}>{d.fio.passo}</div> : null}
        </>
      ) : null}
      {d.lugar ? <div style={{ ...letraDaMesa("notaDoMestre"), color: T.tintaDoPergaminhoDim, marginTop: 14 }}>{`Você está em ${d.lugar}.`}</div> : null}
      <div style={{ height: 1, background: alfa(T.tintaDoPergaminho, 0.25), margin: "18px 0 10px" }} />
      <Vinculo sobrePapel onClick={aoOuvir}>Ouvir o Mestre contar</Vinculo>
    </>
  );
}

/* a página «Anteriormente» de quem volta (ou a da campanha que não abre) */
function PaginaDeQuemVolta({ resumo, naoAbre, aoOuvir }) {
  const quando = resumo.salvoEm ? new Date(resumo.salvoEm) : null;
  const dataDita = quando && !Number.isNaN(quando.getTime()) ? quando.toLocaleDateString("pt-BR", { day: "numeric", month: "long" }) : "";
  return (
    <div style={{ background: T.pergaminho, color: T.tintaDoPergaminho, borderRadius: 4, padding: "36px 40px", boxShadow: SOMBRA_DA_MESA.pousado, maxWidth: 560 }}>
      {naoAbre ? (
        <>
          <div style={{ ...ROTULO, color: T.tintaDoPergaminhoDim }}>A campanha guardada</div>
          <h2 style={{ ...letraDaMesa("titulo"), margin: "10px 0 14px", color: T.tintaDoPergaminho }}>Esta campanha não abre aqui</h2>
          <p style={{ ...letraDaMesa("prosa"), margin: 0 }}>{resumo.motivo === "nova"
            ? "Ela foi guardada por uma versão mais nova do jogo do que a desta página. Nada foi apagado: a campanha continua neste navegador."
            : "O que está guardado neste navegador não se deixa ler. Nada foi apagado: a campanha continua aqui, e um arquivo a leva inteira."}</p>
        </>
      ) : resumo.daUltimaVez && resumo.daUltimaVez.fatos && resumo.daUltimaVez.fatos.length ? (
        <DaUltimaVez d={resumo.daUltimaVez} salvoEm={resumo.salvoEm} aoOuvir={aoOuvir} />
      ) : (
        <>
          <div style={{ ...ROTULO, color: T.tintaDoPergaminhoDim }}>Anteriormente, em</div>
          <h2 style={{ ...letraDaMesa("titulo"), margin: "8px 0 6px", color: T.tintaDoPergaminho }}>{resumo.campanha || resumo.nome}</h2>
          <div style={{ ...letraDaMesa("notaDoMestre"), color: T.tintaDoPergaminhoDim }}>{[resumo.lugar, dataDita ? `jogado a ${dataDita}` : ""].filter(Boolean).join(" · ")}</div>
          <p style={{ ...letraDaMesa("prosa"), margin: "18px 0 0" }}>{`${resumo.nome} ${resumo.lugar ? `ficou em ${resumo.lugar}` : "ficou onde a história parou"}. A mesa está como você a deixou.`}</p>
          <div style={{ height: 1, background: alfa(T.tintaDoPergaminho, 0.25), margin: "22px 0 10px" }} />
          <Vinculo sobrePapel onClick={aoOuvir}>Ouvir o Mestre contar</Vinculo>
        </>
      )}
    </div>
  );
}

/* 3 · QUEM VOLTA (e 8b · a campanha que não abre) */
function QuemVolta({ telefone, resumo, aoContinuar, aoOuvir, aoNova, aoArquivo, aoAtualizar }) {
  const naoAbre = resumo.estado === "naoAbre";
  const heroi = naoAbre ? null : { nome: resumo.nome, raca: resumo.raca, classe: resumo.classe, sexo: resumo.sexo, semente: resumo.semente, nivel: resumo.nivel };
  const rec = resumo.recursos || {};
  const pecas = [["racoes", rec.racoes], ["agua", rec.agua], ["tochas", rec.tochas], ["moedas", rec.moedas]].filter(([, n]) => Number.isFinite(n));
  const botoes = naoAbre ? (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-start" }}>
      <BotaoDaMesa principal largura={telefone ? "100%" : 280} onClick={aoAtualizar}>Atualizar a página</BotaoDaMesa>
      <BotaoDaMesa largura={telefone ? "100%" : 264} onClick={aoArquivo}>Guardar em arquivo</BotaoDaMesa>
      <Vinculo onClick={aoNova}>Nova aventura</Vinculo>
    </div>
  ) : (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-start" }}>
      <BotaoDaMesa principal largura={telefone ? "100%" : 280} onClick={aoContinuar}>Continuar</BotaoDaMesa>
      <span style={{ display: "inline-flex", flexDirection: "column", gap: 6, width: telefone ? "100%" : 264 }}>
        <BotaoDaMesa largura="100%" onClick={aoNova}>Nova aventura</BotaoDaMesa>
        {/* o veredito antes do clique: a nova aventura SUBSTITUI a campanha neste navegador (o espaço do save é um só) */}
        <span style={{ ...letraDaMesa("notaDoMestre"), color: T.inkMeio }}>{`Uma nova aventura substitui a de ${String(resumo.nome).split(" ")[0]} neste navegador.`}</span>
      </span>
    </div>
  );
  return (
    <div style={{ padding: telefone ? "28px 16px 32px" : "40px 56px", display: "flex", flexDirection: "column", gap: telefone ? 20 : 28, minHeight: "100dvh", boxSizing: "border-box" }}>
      <MarcaDaCasa deitada escala={telefone ? 1 : 0.75 / 0.8} />
      <div style={{ display: "flex", flexDirection: telefone ? "column" : "row", gap: telefone ? 20 : 64, alignItems: telefone ? "stretch" : "flex-start", paddingLeft: telefone ? 0 : 84 }}>
        {heroi ? <div style={{ alignSelf: telefone ? "center" : "flex-start", marginTop: telefone ? 0 : 56 }}><CartaDoHeroi heroi={heroi} escala={telefone ? CARTA_DO_HEROI.escala.telefone * 1.4 : 1} /></div> : null}
        <div style={{ display: "flex", flexDirection: "column", gap: 24, flex: 1, maxWidth: 560 }}>
          <PaginaDeQuemVolta resumo={resumo} naoAbre={naoAbre} aoOuvir={aoOuvir} />
          {botoes}
        </div>
        {!telefone && pecas.length ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 260 }}>
            <span style={{ ...ROTULO, color: T.inkMeio }}>A mesa como você deixou</span>
            <div style={{ display: "flex", gap: 12 }}>{pecas.map(([tipo, n]) => <PecaDeRecurso key={tipo} tipo={tipo} quantidade={n} />)}</div>
          </div>
        ) : null}
      </div>
      <div style={{ marginTop: "auto" }}><Vinculo onClick={aoArquivo}>A campanha em arquivo</Vinculo></div>
    </div>
  );
}

/* A CHEGADA: o estado do save decide qual das três */
export function Chegada({ resumo, aoSentar, aoContinuar, aoOuvir, aoArquivo, aoAtualizar }) {
  const telefone = useTelefone();
  const r = resumo && resumo.estado ? resumo : { estado: "nenhum" };
  return (
    <MesaDaNoite telefone={telefone}>
      {r.estado === "nenhum"
        ? <PrimeiraVisita telefone={telefone} aoSentar={aoSentar} aoArquivo={aoArquivo} />
        : <QuemVolta telefone={telefone} resumo={r} aoContinuar={aoContinuar} aoOuvir={aoOuvir} aoNova={aoSentar} aoArquivo={aoArquivo} aoAtualizar={aoAtualizar} />}
    </MesaDaNoite>
  );
}
