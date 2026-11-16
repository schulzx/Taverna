/* ============================================================
   A MESA CHEIA (V4 · F1 §6 · 16/11/2026)

   A tela principal — onde se passa 90 % do jogo — deixa de ser «um pano
   verde com uma folha no meio» (analise-visual §3.4: ~40 % de conteúdo a
   1440) e vira a mesa do F1: à esquerda o grupo de pé, quem está em cena, a
   nota da quest e as pistas; ao centro a página; à direita a bandeja no
   feltro com a vela-relógio, as pilhas que se contam, os quatro objetos
   pousados. A barra de topo saiu: o lugar foi para a estampa da página, a
   hora para a vela, as pistas para as cartas na mesa.

   Este arquivo só DESENHA. Qual composição vale em qual janela, onde cada
   zona pousa, a luz e a estampa são contas puras de mesa-do-mestre.js
   (composicaoDaJanela, estadoDaEstampa, cenaDaEstampa, luzDaMesa), com
   suíte em Node (testes/teste-painel-mesa.mjs). O App passa os dados e as
   portas (as mesmas de antes: abrir a ficha, o painel, o tempo, as pistas)
   e nada aqui decide regra nem turno.

   As medidas saem de COMPOSICAO_DA_MESA e PECAS_DA_MESA, as cores de T e
   LUZ_DA_MESA, a letra de letraDaMesa (o piso de 12/13 depois do
   multiplicador do escudo). Nenhum número de forma solto.
   ============================================================ */
import React from "react";
import { T, COMPOSICAO_DA_MESA, PECAS_DA_MESA, SOMBRA_DA_MESA, alfa } from "./estilo.js";
import { letraDaMesa, CartaDePe, Estampa, ObjetoPousado, PecaDeRecurso, VelaRelogio } from "./pecas-da-mesa.jsx";

const C = COMPOSICAO_DA_MESA;
const P = PECAS_DA_MESA;

function poucoMovimento() {
  try { return !(typeof window !== "undefined" && window.matchMedia) || window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return true; }
}

/* um rótulo de zona na mesa (Cinzel 12, inkMeio: no feltro a letra é ink
   ou inkMeio — inkDim sai do feltro, F1 §2) */
function RotuloDaZona({ children }) {
  return <h2 style={{ margin: 0, color: T.inkMeio, ...letraDaMesa("rotulo") }}>{children}</h2>;
}

/* ---------------- A LUZ DA MESA ----------------
   O feltro do modo, o halo da vela (radial: alfa × 1,6 no centro, alfa a
   45 %, zero na borda) e a penumbra das bordas. A borda de couro de 8 com
   o fio de latão a 9. A luz que muda de modo leva 900 ms no feltro; com
   prefers-reduced-motion, troca seca. */
export function fundoDaLuz(luz) {
  const l = luz || {};
  const halo = `radial-gradient(circle ${Math.round(l.haloRaio || 0)}px at 76% 12%, ${alfa(T.haloDaVela, (l.haloAlfa || 0) * 1.6)} 0%, ${alfa(T.haloDaVela, l.haloAlfa || 0)} 45%, ${alfa(T.haloDaVela, 0)} 100%)`;
  const penumbra = `radial-gradient(ellipse at center, ${alfa(T.veuDaNoite, 0)} 62%, ${alfa(T.veuDaNoite, l.penumbra || 0)} 100%)`;
  return { backgroundColor: l.feltro || T.bg, backgroundImage: `${halo}, ${penumbra}` };
}

/* ---------------- O PÉ DA PÁGINA, NA MESA ----------------
   A página do F1 é UMA folha: a prosa, as propostas e a linha da pena em
   cima do mesmo papel. O App monta o pé (a soleira, o campo, o dado) com as
   peças de sempre — o comportamento do turno não muda —, e aqui só se lhes
   veste a forma do F1, por CSS de âmbito (só dentro da mesa cheia):
   · o papel passa da folha que rola para a página inteira (main);
   · as ofertas viram tiras de papel (a forma da Proposta: osso, fio de
     tinta, raio 3, Spectral Medium 16);
   · a pílula do campo vira a linha da pena (sem chão, uma regra de 1 px que
     engrossa a 2 ao escrever, Spectral itálico 17 em tinta); o dado ao lado
     continua a ser o «dizer». */
export function cssDaPaginaNaMesa() {
  const Pr = P.proposta;
  return [
    "[data-mesa-cheia] main.tv-folha { border-radius: " + Pr.raio + "px; box-shadow: " + SOMBRA_DA_MESA.pousado + "; overflow: hidden; padding-bottom: 18px; }",
    "[data-mesa-cheia] main.tv-folha > .tv-espaco-abas { padding-inline: " + C.paginaMargem + "px; }",
    "[data-mesa-cheia] main.tv-folha [data-tv-pagina] { margin: 0 !important; background: transparent !important; box-shadow: none !important; border-radius: 0 !important; }",
    "[data-mesa-cheia] [aria-label='O que o mundo oferece agora'] button { background: " + T.ossoLume + " !important; color: " + T.tintaDoPergaminho + " !important; border: 1px solid " + T.tintaDoPergaminhoDim + " !important; border-radius: " + Pr.raio + "px !important; box-shadow: " + SOMBRA_DA_MESA.peca + " !important; font-family: 'Spectral', Georgia, serif !important; font-weight: 500; min-height: " + Pr.alto + "px; }",
    "[data-mesa-cheia] [aria-label='O que o mundo oferece agora'] button * { color: inherit; }",
    "[data-mesa-cheia] [aria-label='O que o mundo oferece agora'] .rounded-xl { background: transparent !important; border: 0 !important; padding: 0 !important; }",
    "[data-mesa-cheia] [aria-label='O que o mundo oferece agora'] .rounded-xl > button { flex: 1 1 auto; }",
    "[data-mesa-cheia] [aria-label='O que o mundo oferece agora'] button:focus-visible { border: 2px solid " + T.tintaDoPergaminho + " !important; }",
    /* a mono sai da vista do jogador (F1 §3): o que ainda a pedir dentro da página veste a Spectral */
    "[data-mesa-cheia] main .tv-mono { font-family: 'Spectral', Georgia, serif !important; letter-spacing: 0 !important; }",
    "[data-mesa-cheia] .tv-pilula-do-campo { background: transparent !important; border: 0 !important; border-bottom: 1px solid " + T.tintaDoPergaminhoDim + " !important; border-radius: 0 !important; min-height: " + P.pena.alto + "px; }",
    "[data-mesa-cheia] .tv-pilula-do-campo:focus-within { border-bottom-width: 2px !important; }",
    "[data-mesa-cheia] .tv-campo-do-turno { color: " + T.tintaDoPergaminho + " !important; font-family: 'Spectral', Georgia, serif !important; font-style: italic; font-size: " + letraDaMesa("falaDoJogador").fontSize + " !important; }",
    "[data-mesa-cheia] .tv-campo-do-turno::placeholder { color: " + T.tintaDoPergaminhoDim + "; opacity: 1; }",
  ].join("\n");
}

/* ---------------- A MESA ----------------
   As três zonas numa grelha: a esquerda e a direita em px, a página entre
   o mínimo e o máximo da faixa. As colunas rolam por dentro se a janela for
   baixa (o feltro nunca rola, e a página nunca sai da vista). */
export function MesaCheia({ composicao, luz = null, esquerda = null, direita = null, children }) {
  const f = composicao || C.faixas[0];
  const reduz = poucoMovimento();
  return (
    <div data-mesa-cheia={f.nome} data-luz={luz ? luz.modo : "dia"} className="flex-1 min-h-0 min-w-0"
      style={{ display: "grid", gridTemplateColumns: `${f.esquerda}px minmax(${f.paginaMin}px, ${f.pagina}px) ${f.direita}px`, columnGap: f.vao, justifyContent: "space-between",
        padding: `0 ${f.lado}px`, height: "100%", overflow: "hidden", ...fundoDaLuz(luz),
        boxShadow: `inset 0 0 0 8px ${T.couroBaixo}, inset 0 0 0 9px ${T.latao}`,
        transition: reduz ? "none" : `background-color ${P.movimento.luz}ms ease` }}>
      <style>{cssDaPaginaNaMesa()}</style>
      <aside aria-label="O grupo e a quest" className="tv-scroll min-h-0" style={{ overflowY: "auto", overflowX: "hidden", padding: "36px 0 24px", display: "flex", flexDirection: "column", gap: C.esquerda.entreZonas }}>{esquerda}</aside>
      <div className="min-h-0 min-w-0 flex flex-col" style={{ padding: `${f.cima}px 0`, position: "relative" }}>{children}<VeuDaPagina alfa={luz ? luz.veuDaPagina : 0} cima={f.cima} /></div>
      <aside aria-label="A mesa: o dado, a vela, os mantimentos e os objetos" className="tv-scroll min-h-0" style={{ overflowY: "auto", overflowX: "hidden", padding: "36px 0 112px", display: "flex", flexDirection: "column", gap: C.direita.entreZonas }}>{direita}</aside>
    </div>
  );
}

/* ---------------- A ESQUERDA: o grupo, em cena, a quest, as pistas ---------------- */
function NotaDaQuest({ quest }) {
  if (!quest || !quest.titulo) return null;
  const Q = C.esquerda.quest;
  return (
    <div role="note" aria-label={`A quest: ${quest.titulo}`} style={{ width: "100%", maxWidth: Q.largura, background: T.ossoLume, borderRadius: 3, padding: "14px 18px 16px", boxShadow: SOMBRA_DA_MESA.pousado, transform: poucoMovimento() ? "none" : `rotate(${Q.rodada}deg)` }}>
      <span style={{ display: "block", color: T.brasaNoPergaminho, ...letraDaMesa("nome") }}>{quest.titulo}</span>
      {quest.feita ? <span style={{ display: "block", color: T.tintaDoPergaminhoDim, textDecoration: "line-through", ...letraDaMesa("notaDoMestre"), fontStyle: "normal" }}>{quest.feita}</span> : null}
      {quest.atual ? <span style={{ display: "block", marginTop: 4, color: T.tintaDoPergaminho, ...letraDaMesa("proposta") }}>{quest.atual}</span> : null}
      {quest.seguinte ? <span style={{ display: "block", marginTop: 4, color: T.tintaDoPergaminhoDim, ...letraDaMesa("notaDoMestre") }}>{quest.seguinte}</span> : null}
    </div>
  );
}

/* a carta de pista na mesa: a virada em osso (a face e de onde veio), a por
   virar em couro com o losango de latão e as costas («uma pessoa») */
function CartaDePista({ carta }) {
  const Pi = C.esquerda.pista;
  const virada = carta.estado === "virada" || carta.estado === "preco";
  return (
    <span data-pista={virada ? "virada" : "costas"} style={{ width: Pi.largura, minHeight: Pi.alto, flex: "none", borderRadius: 4, padding: "12px 12px", display: "flex", flexDirection: "column", gap: 6, boxShadow: SOMBRA_DA_MESA.pousado, textAlign: "left",
      background: virada ? T.ossoLume : T.couroBaixo, border: `1px solid ${virada ? T.tintaDoPergaminhoDim : T.latao}` }}>
      {virada ? (
        <>
          <span style={{ color: T.brasaNoPergaminho, ...letraDaMesa("rotulo") }}>{carta.costas}</span>
          <span style={{ color: T.tintaDoPergaminho, ...letraDaMesa("servico") }}>{carta.face}</span>
        </>
      ) : (
        <>
          <svg aria-hidden="true" width="56" height="56" viewBox="0 0 56 56" style={{ alignSelf: "center", marginTop: 14 }}><path d="M28 4L52 28 28 52 4 28z" fill="none" stroke={T.latao} strokeWidth="1.6" /></svg>
          <span style={{ marginTop: "auto", color: T.inkMeio, ...letraDaMesa("notaDoMestre") }}>{carta.costas}</span>
        </>
      )}
    </span>
  );
}

export function ColunaDoGrupo({ composicao, heroi = null, companheiros = [], emCena = null, quest = null, pistas = null, aoAbrirPistas = null, refPistas = null, pistasAbertas = false }) {
  const f = composicao || C.faixas[0];
  const cartas = [heroi, ...(Array.isArray(companheiros) ? companheiros : [])].filter(Boolean);
  const vivas = pistas && Array.isArray(pistas.cartas) ? pistas.cartas.filter((c) => c && c.estado !== "perdida") : [];
  return (
    <>
      <section aria-label="O grupo" className="flex flex-col" style={{ gap: 12 }}>
        <RotuloDaZona>O grupo</RotuloDaZona>
        <div className="flex flex-wrap" style={{ columnGap: f.cartasEntre, rowGap: 12 }}>
          {cartas.map((c, i) => <CartaDePe key={(c.nome || "") + i} {...c} />)}
        </div>
      </section>
      {emCena ? (
        <section aria-label="Em cena" className="flex flex-col" style={{ gap: 10 }}>
          <RotuloDaZona>Em cena</RotuloDaZona>
          {emCena}
        </section>
      ) : null}
      <NotaDaQuest quest={quest} />
      {pistas ? (
        <section aria-label="As pistas" className="flex flex-col" style={{ gap: 10 }}>
          <button ref={refPistas} type="button" onClick={aoAbrirPistas || undefined} aria-expanded={!!pistasAbertas} className="tv-anel-foco text-left"
            aria-label={`As pistas: ${pistas.sabe} de ${pistas.de}. Abrir o quadro da quest.`}
            style={{ background: "transparent", border: 0, padding: 0, cursor: aoAbrirPistas ? "pointer" : "default", display: "flex", flexDirection: "column", gap: 10, minHeight: 44 }}>
            <span className="flex items-center" style={{ gap: 8 }}>
              <span style={{ color: T.inkMeio, ...letraDaMesa("rotulo") }}>{`Pistas · ${pistas.sabe} de ${pistas.de}`}</span>
              {pistas.novo ? <span aria-label="pista nova" style={{ width: 8, height: 8, borderRadius: "50%", background: T.amber }} /> : null}
            </span>
            {f.pistas && vivas.length ? (
              <span className="flex" style={{ gap: 12 }}>{vivas.slice(0, C.esquerda.pista.quantas).map((c) => <CartaDePista key={c.id} carta={c} />)}</span>
            ) : null}
          </button>
        </section>
      ) : null}
    </>
  );
}

/* ---------------- A DIREITA: a bandeja, a vela, as peças, os objetos ---------------- */
export function ColunaDasPecas({ bandeja = null, hora = 12, falaDaHora = "", tempoAberto = false, aoAbrirTempo = null, prazo = "", recursos = null, aoAbrirRecursos = null, objetos = [], rodape = null, fundoDaBandeja = null }) {
  const B = C.direita.bandeja;
  const O = C.direita.objetos;
  const r = recursos || {};
  return (
    <>
      <div className="flex items-start" style={{ gap: 8 }}>
        {/* a bandeja de hoje, num tabuleiro de couro afundado no feltro (F1 §4); o lance novo é do V3 */}
        <div data-bandeja-no-feltro="" style={{ flex: 1, minWidth: 0, minHeight: B.alto, maxHeight: B.teto, overflow: "hidden", borderRadius: B.raio, background: T.couro, border: `1px solid ${T.latao}`, padding: 8, boxShadow: SOMBRA_DA_MESA.pousado }}>
          <div style={{ borderRadius: B.raio - 6, background: fundoDaBandeja || T.couroBaixo, minHeight: B.alto - 16, boxShadow: `inset 0 2px 6px ${alfa(T.veuDaNoite, 0.6)}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {bandeja || <span style={{ color: T.inkMeio, padding: 12, textAlign: "center", ...letraDaMesa("notaDoMestre") }}>A bandeja espera o dado.</span>}
          </div>
        </div>
        <button type="button" onClick={aoAbrirTempo || undefined} aria-expanded={!!tempoAberto} aria-label={falaDaHora || "O tempo"} title="O tempo — esperar, acampar, os prazos"
          className="tv-anel-foco flex flex-col items-center" style={{ flex: "none", background: "transparent", border: 0, padding: 0, cursor: aoAbrirTempo ? "pointer" : "default" }}>
          <VelaRelogio hora={hora} />
          {prazo ? <span style={{ color: T.lacreLume, maxWidth: P.vela.caixa.largura + 8, textAlign: "center", ...letraDaMesa("rotulo") }}>{prazo}</span> : null}
        </button>
      </div>
      {recursos ? (
        <section aria-label="Na mesa" className="flex flex-col" style={{ gap: 12 }}>
          <RotuloDaZona>Na mesa</RotuloDaZona>
          <button type="button" onClick={aoAbrirRecursos || undefined} aria-label={`Os mantimentos: ${r.racoes || 0} rações, ${r.agua || 0} de água, ${r.tochas || 0} tochas e ${r.moedas || 0} moedas. Abrir na bolsa.`}
            className="tv-anel-foco flex items-start justify-between" style={{ background: "transparent", border: 0, padding: 0, cursor: aoAbrirRecursos ? "pointer" : "default", width: "100%" }}>
            <PecaDeRecurso tipo="racoes" quantidade={r.racoes || 0} />
            <PecaDeRecurso tipo="agua" quantidade={r.agua || 0} />
            <PecaDeRecurso tipo="tochas" quantidade={r.tochas || 0} />
            <PecaDeRecurso tipo="moedas" quantidade={r.moedas || 0} />
          </button>
        </section>
      ) : null}
      <nav aria-label="Os objetos da mesa" style={{ display: "grid", gridTemplateColumns: `repeat(${O.colunas}, ${P.objeto.alvo.largura}px)`, columnGap: O.entreColunas, rowGap: O.entreLinhas }}>
        {(Array.isArray(objetos) ? objetos : []).filter(Boolean).map((o) => (
          <ObjetoPousado key={o.chave || o.objeto} objeto={o.objeto} rotulo={o.rotulo || null} aoAbrir={o.aoAbrir || null} erguido={!!o.erguido} novo={!!o.novo} />
        ))}
      </nav>
      {rodape}
    </>
  );
}

/* ---------------- A ESTAMPA NA PÁGINA ----------------
   O lugar mora aqui agora (a barra de topo saiu). Tocar abre o horizonte,
   como tocar no lugar da barra abria. Sem horizonte, só a figura. */
export function EstampaDaPagina({ estado = "recolhida", cena = "", lugar = "", sub = "", aoTocar = null, aberta = false }) {
  if (!lugar) return null;
  const miolo = <Estampa cena={cena} lugar={lugar} sub={sub} estado={estado} />;
  if (!aoTocar) return <div data-estampa-da-pagina={estado} style={{ position: "relative", zIndex: 1, padding: estado === "aberta" ? 0 : "0 24px" }}>{miolo}</div>;
  return (
    <button type="button" onClick={aoTocar} aria-expanded={!!aberta} aria-label={`${[lugar, sub].filter(Boolean).join(", ")}. Abrir o horizonte.`} data-estampa-da-pagina={estado}
      className="tv-anel-foco text-left" style={{ position: "relative", zIndex: 1, display: "block", width: "100%", background: "transparent", border: 0, padding: estado === "aberta" ? 0 : "0 24px", cursor: "pointer", flex: "none" }}>
      {miolo}
    </button>
  );
}

/* O VÉU DA PÁGINA: à noite e na masmorra a folha escurece, com teto de
   12 % (luzDaMesa já o aplica; aqui só se desenha). Cobre a página inteira — a folha que rola e o pé — para não haver costura entre os dois. */
export function VeuDaPagina({ alfa: a = 0, cima = 0 }) {
  if (!(a > 0)) return null;
  return <span aria-hidden="true" data-veu-da-pagina={a} style={{ position: "absolute", left: 0, right: 0, top: cima, bottom: cima, borderRadius: P.proposta.raio, background: alfa(T.veuDaNoite, a), pointerEvents: "none", zIndex: 30 }} />;
}

/* ---------------- A CASCA ----------------
   O App monta a página uma vez só; a casca decide se ela pousa entre as
   três zonas (larga e media) ou fica sozinha (a composição do telefone, que
   o App continua a montar com a barra de 48 e a tira de baixo). */
export function CascaDaMesa({ tresZonas = false, children, ...resto }) {
  /* a mono sai da folha em todas as janelas (F1 §3): o que ainda a pedir dentro da página veste a Spectral */
  if (!tresZonas) return <><style>{"[data-tv-pagina] .tv-mono { font-family: 'Spectral', Georgia, serif !important; letter-spacing: 0 !important; }"}</style>{children}</>;
  return <MesaCheia {...resto}>{children}</MesaCheia>;
}
