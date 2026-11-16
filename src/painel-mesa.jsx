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
import { T, COMPOSICAO_DA_MESA, PECAS_DA_MESA, SOMBRA_DA_MESA, MESA_NO_TELEFONE, alfa } from "./estilo.js";
import { letraDaMesa, CartaDePe, Estampa, ObjetoPousado, PecaDeRecurso, VelaRelogio, DesenhoDoEscudo } from "./pecas-da-mesa.jsx";
import { DesenhoDoObjeto } from "./painel-mesa-do-mestre.jsx";
import { DadoDoLance } from "./painel-bandeja.jsx";
import { estadoDaCarta, pilhasDoRecurso } from "./mesa-do-mestre.js";

const C = COMPOSICAO_DA_MESA;
const P = PECAS_DA_MESA;
const MT = MESA_NO_TELEFONE;

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
export function cssDaPaginaNaMesa(escopo = "[data-mesa-cheia]", margem = C.paginaMargem) {
  const Pr = P.proposta;
  return [
    escopo + " main.tv-folha { border-radius: " + Pr.raio + "px; box-shadow: " + SOMBRA_DA_MESA.pousado + "; overflow: hidden; padding-bottom: 18px; }",
    escopo + " main.tv-folha > .tv-espaco-abas { padding-inline: " + margem + "px; }",
    escopo + " main.tv-folha [data-tv-pagina] { margin: 0 !important; background: transparent !important; box-shadow: none !important; border-radius: 0 !important; }",
    escopo + " [aria-label='O que o mundo oferece agora'] button { background: " + T.ossoLume + " !important; color: " + T.tintaDoPergaminho + " !important; border: 1px solid " + T.tintaDoPergaminhoDim + " !important; border-radius: " + Pr.raio + "px !important; box-shadow: " + SOMBRA_DA_MESA.peca + " !important; font-family: 'Spectral', Georgia, serif !important; font-weight: 500; min-height: " + Pr.alto + "px; }",
    escopo + " [aria-label='O que o mundo oferece agora'] button * { color: inherit; }",
    escopo + " [aria-label='O que o mundo oferece agora'] .rounded-xl { background: transparent !important; border: 0 !important; padding: 0 !important; }",
    escopo + " [aria-label='O que o mundo oferece agora'] .rounded-xl > button { flex: 1 1 auto; }",
    escopo + " [aria-label='O que o mundo oferece agora'] button:focus-visible { border: 2px solid " + T.tintaDoPergaminho + " !important; }",
    /* a mono sai da vista do jogador (F1 §3): o que ainda a pedir dentro da página veste a Spectral */
    escopo + " main .tv-mono { font-family: 'Spectral', Georgia, serif !important; letter-spacing: 0 !important; }",
    escopo + " .tv-pilula-do-campo { background: transparent !important; border: 0 !important; border-bottom: 1px solid " + T.tintaDoPergaminhoDim + " !important; border-radius: 0 !important; min-height: " + P.pena.alto + "px; }",
    escopo + " .tv-pilula-do-campo:focus-within { border-bottom-width: 2px !important; }",
    escopo + " .tv-campo-do-turno { color: " + T.tintaDoPergaminho + " !important; font-family: 'Spectral', Georgia, serif !important; font-style: italic; font-size: " + letraDaMesa("falaDoJogador").fontSize + " !important; }",
    escopo + " .tv-campo-do-turno::placeholder { color: " + T.tintaDoPergaminhoDim + "; opacity: 1; }",
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

export function ColunaDoGrupo({ composicao, heroi = null, companheiros = [], emCena = null, ninguemEmCena = false, quest = null, pistas = null, aoAbrirPistas = null, refPistas = null, pistasAbertas = false }) {
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
      ) : ninguemEmCena ? (
        /* V4b: sem ficha em cena a zona fica, como o lugar vazio de uma carta na
           mesa (a planta do F1 conta com ela; sem ela a mesa a 1440 cobria 68 %
           da janela). Sem palavra: na prova jogada o Mestre fazia falar alguém
           que não tinha ficha, e «ninguém à vista» mentiria ao lado da prosa. */
        <section aria-label="Em cena" className="flex flex-col" style={{ gap: 10 }}>
          <RotuloDaZona>Em cena</RotuloDaZona>
          <span data-em-cena-vazio="" aria-hidden="true" style={{ display: "block", minHeight: C.esquerda.emCenaVazio.alto, maxWidth: C.esquerda.quest.largura, borderRadius: 4, border: `1px dashed ${alfa(T.latao, 0.55)}` }} />
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
/* V4b: no telefone (estampa estreita) a bandeja de bolso pousa na ponta
   direita (F2: 56 × 48 em x 299 da página), e o nome do lugar ganha o
   limite da faixa menos o bolso, com reticências. A estampa e o bolso são
   dois botões irmãos (botão dentro de botão não existe). */
export function EstampaDaPagina({ estado = "recolhida", cena = "", lugar = "", sub = "", aoTocar = null, aberta = false, bolso = null }) {
  if (!lugar) return null;
  if (bolso) {
    return (
      <div data-estampa-com-bolso="" style={{ position: "relative", zIndex: 1, flex: "none", display: "flex", alignItems: "flex-start", gap: 8, padding: `0 0 0 ${MT.pagina.prosa}px` }}>
        <div className="tv-estampa-no-telefone" style={{ flex: 1, minWidth: 0 }}><EstampaSemBolso estado={estado} cena={cena} lugar={lugar} sub={sub} aoTocar={aoTocar} aberta={aberta} semMargem /></div>
        {bolso}
      </div>
    );
  }
  return <EstampaSemBolso estado={estado} cena={cena} lugar={lugar} sub={sub} aoTocar={aoTocar} aberta={aberta} />;
}
function EstampaSemBolso({ estado, cena, lugar, sub, aoTocar, aberta, semMargem = false }) {
  const miolo = <Estampa cena={cena} lugar={lugar} sub={sub} estado={estado} />;
  if (!aoTocar) return <div data-estampa-da-pagina={estado} style={{ position: "relative", zIndex: 1, padding: estado === "aberta" || semMargem ? 0 : "0 24px" }}>{miolo}</div>;
  return (
    <button type="button" onClick={aoTocar} aria-expanded={!!aberta} aria-label={`${[lugar, sub].filter(Boolean).join(", ")}. Abrir o horizonte.`} data-estampa-da-pagina={estado}
      className="tv-anel-foco text-left" style={{ position: "relative", zIndex: 1, display: "block", width: "100%", background: "transparent", border: 0, padding: estado === "aberta" || semMargem ? 0 : "0 24px", cursor: "pointer", flex: "none" }}>
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

/* ============================================================
   A MESA NO TELEFONE (V4b · F1 a 375 · F2 «no celular»)
   Abaixo de 1180: a faixa de 48 no alto, a página tomando a tela, a borda
   da mesa com as cinco portas em baixo. A barra de 48 de antes (lugar,
   pistas, hora em mono) e a tira de 72 aposentaram-se: o lugar mora na
   estampa, a hora na vela da faixa, os objetos nas portas.
   ============================================================ */

/* um retrato da faixa: 44 com o aro do estado, PV (conta) e PM (losango)
   em Cinzel 12 ao lado. Tocar abre a ficha (do herói ou do companheiro). */
const ARO_DO_RETRATO = { repouso: T.latao, vez: T.amber, ferido: T.lacreLume, caido: T.ossoSombra };
function RetratoDaFaixa({ nome = "", retrato = null, vida = 0, vidaMax = 0, mana = 0, manaMax = 0, aoTocar = null }) {
  const F = MT.faixa;
  const estado = estadoDaCarta({ vida, vidaMax });
  const numero = { color: T.ink, ...letraDaMesa("rotulo") };
  return (
    <button type="button" onClick={aoTocar || undefined} disabled={!aoTocar} className="tv-anel-foco flex items-center"
      aria-label={`${nome}: ${vida} de ${vidaMax} de vida${manaMax ? `, ${mana} de ${manaMax} de magia` : ""}. Abrir a ficha.`}
      style={{ gap: 6, minHeight: F.alto, padding: 0, background: "transparent", border: 0, cursor: aoTocar ? "pointer" : "default", flex: "none" }}>
      <span style={{ width: F.retrato, height: F.retrato, flex: "none", borderRadius: F.raio, border: `${F.aro}px solid ${ARO_DO_RETRATO[estado] || T.latao}`, overflow: "hidden", background: T.couroBaixo, boxShadow: SOMBRA_DA_MESA.peca, filter: estado === "caido" ? "grayscale(1) brightness(.7)" : "none" }}>
        {retrato ? <img src={retrato} alt="" draggable="false" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} /> : null}
      </span>
      <span className="flex flex-col" style={{ gap: 0, alignItems: "flex-start" }}>
        <span className="flex items-center" style={{ gap: 4 }}><span aria-hidden="true" style={{ width: 7, height: 7, borderRadius: "50%", background: T.lacreLume }} /><span style={numero}>{vida}</span></span>
        {manaMax ? <span className="flex items-center" style={{ gap: 4 }}><span aria-hidden="true" style={{ width: 7, height: 7, background: T.violet, transform: "rotate(45deg) scale(.85)" }} /><span style={numero}>{mana}</span></span> : null}
      </span>
    </button>
  );
}

/* uma pilha da faixa: três discos (osso; latão nas moedas) e o número */
function PilhaDaFaixa({ tipo, quantidade = 0 }) {
  const Pi = MT.faixa.pilha;
  const conta = pilhasDoRecurso(tipo, quantidade);
  const metal = tipo === "moedas";
  const n = conta.quantidade > 0 ? Pi.discos : 1;
  const alto = Pi.disco.alto + Pi.passo * (n - 1) + 2;
  return (
    <span className="inline-flex flex-col items-center" data-pilha={tipo} style={{ width: Pi.largura, flex: "none" }}>
      <svg aria-hidden="true" width={Pi.disco.largura} height={alto} viewBox={`0 0 ${Pi.disco.largura} ${alto}`}>
        {Array.from({ length: n }, (_, i) => {
          const y = alto - Pi.disco.alto - i * Pi.passo - 1;
          return <ellipse key={i} cx={Pi.disco.largura / 2} cy={y + Pi.disco.alto / 2} rx={Pi.disco.largura / 2 - 0.5} ry={Pi.disco.alto / 2} fill={conta.quantidade > 0 ? (i === n - 1 ? (metal ? T.lataoLume : T.ossoLume) : (metal ? T.latao : T.osso)) : "none"} stroke={metal ? T.lataoSombra : T.ossoSombra} strokeWidth="0.8" />;
        })}
      </svg>
      <span style={{ color: T.ink, ...letraDaMesa("rotulo") }}>{conta.quantidade}</span>
    </span>
  );
}

/* a vela da faixa: a cera na altura da hora, e a hora por baixo. Tocar abre o tempo. */
function VelaDaFaixa({ hora = "", prazo = "", fala = "", aberto = false, aoTocar = null }) {
  const V = MT.faixa.vela;
  const [h, m] = String(hora || "12:00").split(":").map((x) => Number(x) || 0);
  const desde6 = ((h + m / 60) - 6 + 24) % 24;
  const cera = Math.max(4, Math.round(V.alto * (1 - desde6 / 24)));
  return (
    <button type="button" onClick={aoTocar || undefined} aria-expanded={!!aberto} aria-label={[fala || "O tempo", prazo].filter(Boolean).join(". ")} title="O tempo — esperar, acampar, os prazos"
      className="tv-anel-foco inline-flex flex-col items-center justify-end" style={{ width: Math.max(V.largura, 44), minHeight: MT.faixa.alto, padding: 0, background: "transparent", border: 0, cursor: aoTocar ? "pointer" : "default", flex: "none", position: "relative" }}>
      <svg aria-hidden="true" width={V.largura} height={V.alto + 10} viewBox={`0 0 ${V.largura} ${V.alto + 10}`}>
        <rect x={(V.largura - V.cera) / 2} y={V.alto + 10 - cera} width={V.cera} height={cera} rx="1.5" fill={T.ossoLume} />
        <ellipse cx={V.largura / 2} cy={V.alto + 10 - cera - 4} rx="2.6" ry="4.5" fill={T.amber} />
      </svg>
      <span style={{ color: T.ink, ...letraDaMesa("rotulo") }}>{hora}</span>
      {prazo ? <span aria-hidden="true" data-prazo="" style={{ position: "absolute", top: 6, right: 6, width: 8, height: 8, borderRadius: "50%", background: T.lacreLume }} /> : null}
    </button>
  );
}

/* A FAIXA DO TELEFONE — 48 de altura: o grupo, as quatro pilhas, a vela.
   `children` pousa por cima (o sinal de guardado, o aviso de não guardou). */
export function FaixaDoTelefone({ heroi = null, companheiros = [], recursos = null, hora = "", prazo = "", falaDaHora = "", tempoAberto = false, aoAbrirTempo = null, aoAbrirRecursos = null, children = null }) {
  const F = MT.faixa;
  const r = recursos || {};
  const grupo = [heroi, ...(Array.isArray(companheiros) ? companheiros : [])].filter(Boolean).slice(0, F.retratos);
  return (
    <div data-faixa-do-telefone="" className="flex items-center justify-between" style={{ position: "relative", height: F.alto, padding: `0 ${F.lado}px`, gap: 6, background: T.couroBaixo, borderBottom: `1px solid ${alfa(T.latao, 0.5)}`, overflow: "hidden" }}>
      <div aria-label="O grupo" role="group" className="flex items-center" style={{ gap: 8, minWidth: 0 }}>
        {grupo.map((c, i) => <RetratoDaFaixa key={(c.nome || "") + i} {...c} />)}
      </div>
      {recursos ? (
        <button type="button" onClick={aoAbrirRecursos || undefined} className="tv-anel-foco flex items-end" aria-label={`Os mantimentos: ${r.racoes || 0} rações, ${r.agua || 0} de água, ${r.tochas || 0} tochas e ${r.moedas || 0} moedas. Abrir na bolsa.`}
          style={{ gap: 2, minHeight: 44, padding: 0, background: "transparent", border: 0, cursor: aoAbrirRecursos ? "pointer" : "default", flex: "none" }}>
          <PilhaDaFaixa tipo="racoes" quantidade={r.racoes || 0} />
          <PilhaDaFaixa tipo="agua" quantidade={r.agua || 0} />
          <PilhaDaFaixa tipo="tochas" quantidade={r.tochas || 0} />
          <PilhaDaFaixa tipo="moedas" quantidade={r.moedas || 0} />
        </button>
      ) : null}
      <VelaDaFaixa hora={hora} prazo={prazo} fala={falaDaHora} aberto={tempoAberto} aoTocar={aoAbrirTempo} />
      {children}
    </div>
  );
}

/* A BORDA DA MESA — as cinco portas de 70 × 68, todas sempre presentes:
   Livro · Carta · Bolsa · Grimório · Escudo. A porta aberta ergue o
   desenho e acende o rótulo; a gota de novidade é a do desenho. */
const DESENHO_DA_PORTA = { livro: "diario", carta: "mapa", bolsa: "bolsa", grimorio: "codex" };
const NOME_DA_PORTA = { livro: "Livro", carta: "Carta", bolsa: "Bolsa", grimorio: "Grimório", escudo: "Escudo" };
export function BordaDoTelefone({ objetos = [], aoAbrirEscudo = null, escudoAberto = false, refEscudo = null, largura = 0 }) {
  const B = MT.borda;
  const porObjeto = {};
  (Array.isArray(objetos) ? objetos : []).filter(Boolean).forEach((o) => { porObjeto[o.objeto] = o; });
  return (
    <nav aria-label="Os objetos da mesa" data-borda-do-telefone="" style={{ flex: "none", height: B.alto, background: T.couroBaixo, borderTop: `1px solid ${alfa(T.latao, 0.6)}`, boxShadow: `inset 0 1px 0 ${alfa(T.lataoLume, 0.15)}` }}>
      <div className="flex items-center justify-around" style={{ height: "100%", maxWidth: largura || undefined, margin: "0 auto" }}>
        {B.portas.map((p) => {
          const escudo = p === "escudo";
          const o = porObjeto[p] || null;
          const aoAbrir = escudo ? aoAbrirEscudo : o && o.aoAbrir;
          const aberta = escudo ? !!escudoAberto : !!(o && o.erguido);
          return (
            <button key={p} ref={escudo ? refEscudo : undefined} type="button" onClick={aoAbrir || undefined} disabled={!aoAbrir} data-porta={p}
              aria-label={escudo ? "O escudo do Mestre: som, texto, preferências e sair" : NOME_DA_PORTA[p]} aria-expanded={aberta} aria-haspopup={escudo ? "dialog" : undefined}
              className="tv-anel-foco inline-flex flex-col items-center justify-center"
              style={{ width: B.porta.largura, height: B.porta.alto, gap: 2, padding: 0, background: "transparent", border: 0, cursor: aoAbrir ? "pointer" : "default", opacity: aoAbrir ? 1 : 0.5 }}>
              <span style={{ display: "block", transform: aberta ? "translateY(-4px)" : "none", transition: "transform 140ms ease-out" }}>
                {escudo ? <DesenhoDoEscudo lado={B.desenho} /> : <DesenhoDoObjeto chave={DESENHO_DA_PORTA[p]} lado={B.desenho} novo={!!(o && o.novo)} />}
              </span>
              <span style={{ color: aberta ? T.amberSoft : T.ink, ...letraDaMesa("rotulo") }}>{NOME_DA_PORTA[p]}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

/* A BANDEJA DE BOLSO (F2, celular) — 56 × 48 na ponta da estampa
   recolhida; mostra o último dado a 40 com a forma do veredito. Vazia, o
   feltro sozinho. Tocar abre a gaveta. `emVoo`: o lance novo ainda rola
   na página, e o bolso mostra o de antes até ele pousar. */
export function BandejaDeBolso({ lancamentos = [], emVoo = false, aberta = false, aoTocar = null }) {
  const Bo = MT.bolso;
  const lista = (Array.isArray(lancamentos) ? lancamentos.filter(Boolean) : []).slice(emVoo ? 1 : 0);
  const ultimo = lista[0] || null;
  const d = ultimo && Array.isArray(ultimo.dados) ? (ultimo.dados.find((x) => x && !x.posto) || ultimo.dados[0]) : null;
  return (
    <button type="button" onClick={aoTocar || undefined} aria-expanded={!!aberta} data-bandeja-de-bolso={d ? "cheia" : "vazia"}
      aria-label={d ? `Os dados: o último deu ${d.valor}. Abrir a bandeja.` : "Os dados: a bandeja espera o dado. Abrir a bandeja."}
      className="tv-anel-foco" style={{ width: Bo.largura, height: Bo.alto, flex: "none", padding: (Bo.alto - Bo.feltro.alto) / 2, borderRadius: Bo.raio, background: T.couro, border: `1px solid ${T.latao}`, boxShadow: SOMBRA_DA_MESA.pousado, cursor: "pointer" }}>
      <span style={{ width: Bo.feltro.largura, height: Bo.feltro.alto, borderRadius: Bo.raio - 4, background: T.bg, boxShadow: `inset 0 2px 4px ${alfa(T.veuDaNoite, 0.6)}`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "visible" }}>
        {d ? <span style={{ transform: `scale(${Bo.feltro.alto / Bo.dado})`, display: "inline-flex" }}><DadoDoLance d={d} tam={Bo.dado} rolando={false} desfecho={ultimo.desfecho} troca={0} /></span> : null}
      </span>
    </button>
  );
}

/* A GAVETA DA BANDEJA — couro que sobe da borda da mesa com o histórico
   dos dados (a Bandeja de sempre, em coluna). Fica montada sempre (a
   Bandeja não rola de novo um lance velho ao abrir), escondida e inerte
   quando fechada. Fecha ao toque fora (o véu) e por Esc do App. */
export function GavetaDaBandeja({ aberta = false, aoFechar = null, baixo = MT.borda.alto, children }) {
  const G = MT.gaveta;
  const reduz = poucoMovimento();
  const ref = React.useRef(null);
  React.useEffect(() => { try { if (ref.current) { if (aberta) ref.current.removeAttribute("inert"); else ref.current.setAttribute("inert", ""); } } catch (e) { /* segue */ } }, [aberta]);
  return (
    <>
      {aberta ? <button type="button" aria-label="Fechar a bandeja" onClick={aoFechar || undefined} data-veu-da-gaveta="" style={{ position: "absolute", inset: 0, bottom: baixo, background: alfa(T.veuDaNoite, 0.25), border: 0, padding: 0, zIndex: 39, cursor: "default" }} /> : null}
      <div ref={ref} role="dialog" aria-label="Os dados na mesa" aria-hidden={!aberta} data-gaveta-da-bandeja={aberta ? "aberta" : "fechada"}
        style={{ position: "absolute", left: G.lado, right: G.lado, bottom: baixo, zIndex: 40, maxHeight: `${G.teto * 100}%`, overflowY: "auto",
          borderRadius: `${G.raio}px ${G.raio}px 0 0`, background: T.couro, border: `1px solid ${T.latao}`, borderBottom: 0, boxShadow: SOMBRA_DA_MESA.erguido,
          transform: aberta ? "translateY(0)" : "translateY(110%)", visibility: aberta ? "visible" : "hidden",
          transition: reduz ? "none" : `transform ${G.sobe}ms ${G.curva}, visibility 0s linear ${aberta ? 0 : G.sobe}ms` }}>
        <div style={{ margin: 10, borderRadius: G.raio - 6, background: T.bg, boxShadow: `inset 0 2px 6px ${alfa(T.veuDaNoite, 0.6)}` }}>
          {children || <p style={{ margin: 0, padding: 16, color: T.inkMeio, textAlign: "center", ...letraDaMesa("notaDoMestre") }}>A bandeja espera o dado.</p>}
        </div>
      </div>
    </>
  );
}

/* A JANELA BAIXA (V4b · 800 × 451, e o telefone com o teclado aberto):
   abaixo de MESA_NO_TELEFONE.janelaBaixa.alto a prosa ficava com 46 px.
   Larga e baixa (deitada), a borda vira um trilho à direita — a largura
   sobra, a altura não; estreita e baixa (o teclado subiu), a borda sai de
   vista enquanto se escreve. Nas duas, as propostas pousam lado a lado e o
   campo encolhe à linha da pena. A régua: ≥ 6 linhas de prosa visíveis. */
function cssDaJanelaBaixa() {
  const J = MT.janelaBaixa, B = MT.borda;
  const baixa = "@media (max-height: " + (J.alto - 1) + "px)";
  const deitada = "@media (max-height: " + (J.alto - 1) + "px) and (min-width: " + J.deitada + "px)";
  const teclado = "@media (max-height: " + (J.alto - 1) + "px) and (max-width: " + (J.deitada - 1) + "px)";
  return "\n" + deitada + " { [data-mesa-telefone] { flex-direction: row !important; }"
    + " [data-mesa-telefone] > [data-borda-do-telefone] { height: auto !important; width: " + J.trilho + "px; border-top: 0 !important; border-left: 1px solid " + alfa(T.latao, 0.6) + "; }"
    + " [data-mesa-telefone] > [data-borda-do-telefone] > div { flex-direction: column; justify-content: space-evenly; }"
    + " [data-mesa-telefone] [data-borda-do-telefone] button { height: " + J.portaNoTrilho + "px !important; }"
    + " [data-mesa-telefone] [data-gaveta-da-bandeja], [data-mesa-telefone] [data-veu-da-gaveta] { bottom: 0 !important; right: " + (J.trilho + MT.gaveta.lado) + "px !important; } }"
    + "\n" + teclado + " { [data-mesa-telefone] > [data-borda-do-telefone] { display: none; } [data-mesa-telefone] [data-gaveta-da-bandeja], [data-mesa-telefone] [data-veu-da-gaveta] { bottom: 0 !important; } }"
    + "\n" + baixa + " { [data-mesa-telefone] .tv-espaco-abas > .shrink-0 > div:has(> div > [aria-label='O que o mundo oferece agora']) { display: flex; flex-wrap: wrap; column-gap: 8px; }"
    + " [data-mesa-telefone] .tv-espaco-abas > .shrink-0 > div > div { flex: 1 1 100%; min-width: 0; }"
    + " [data-mesa-telefone] .tv-espaco-abas > .shrink-0 > div > div:has(> [aria-label='O que o mundo oferece agora']) { flex: 1 1 0; }"
    + " [data-mesa-telefone] .tv-campo-do-turno { max-height: " + B.porta.alto + "px; }"
    + " [data-mesa-telefone] .tv-pilula-do-campo { min-height: " + P.pena.dizer + "px !important; } }";
}

/* ---------------- A CASCA ----------------
   O App monta a página uma vez só; a casca decide se ela pousa entre as
   três zonas (larga e media) ou fica na mesa do telefone (V4b): a página a
   8 das bordas (a 680 no máximo na estreita, centrada), o mesmo pé do F1
   por CSS de âmbito, a gaveta da bandeja e a borda com as cinco portas. */
export function CascaDaMesa({ tresZonas = false, telefone = false, composicao = null, luz = null, borda = null, gaveta = null, children, ...resto }) {
  /* a mono sai da folha em todas as janelas (F1 §3): o que ainda a pedir dentro da página veste a Spectral */
  if (!tresZonas && !telefone) return <><style>{"[data-tv-pagina] .tv-mono { font-family: 'Spectral', Georgia, serif !important; letter-spacing: 0 !important; }"}</style>{children}</>;
  if (!tresZonas) {
    const f = composicao || C.faixas[C.faixas.length - 1];
    return (
      <div data-mesa-telefone={f.nome} data-luz={luz ? luz.modo : "dia"} className="flex-1 min-h-0 min-w-0 flex flex-col" style={{ position: "relative", height: "100%", overflow: "hidden", ...fundoDaLuz(luz) }}>
        <style>{"[data-tv-pagina] .tv-mono { font-family: 'Spectral', Georgia, serif !important; letter-spacing: 0 !important; }\n" + cssDaPaginaNaMesa("[data-mesa-telefone]", MT.pagina.prosa)
          + "\n[data-mesa-telefone] main.tv-folha { padding-bottom: 8px; }"
          + "\n[data-mesa-telefone] .tv-estampa-no-telefone figcaption { flex: 1; min-width: 0; }"
          + "\n[data-mesa-telefone] .tv-campo-do-turno::placeholder { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }"
          + cssDaJanelaBaixa()
          /* um âmbar por tela (F2-375-1): quando o Mestre pede o dado, «Rolar» é a ação
             principal e é ela a âmbar; «Mudar de ideia» fica no couro */
          + "\n[data-mesa-telefone] [aria-label='O Mestre pede o dado'] button[aria-label^='Rolar'] { background: " + T.amber + " !important; border: 2px solid " + T.brasaNoPergaminho + " !important; color: " + T.onAccent + " !important; }"
          + "\n[data-mesa-telefone] [aria-label='O Mestre pede o dado'] button[aria-label^='Rolar'] * { color: inherit !important; }"
          /* as pistas pousam no papel (eram da barra escura): o número em tinta */
          + "\n[data-mesa-telefone] [data-estampa-com-bolso] [data-sinal-do-quadro] span { color: " + T.tintaDoPergaminho + " !important; }"
          + "\n[data-mesa-telefone] .tv-estampa-no-telefone figcaption > span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }"}</style>
        <div className="flex-1 min-h-0 min-w-0 flex flex-col" style={{ padding: MT.pagina.margem, width: "100%", maxWidth: f.pagina ? f.pagina + 2 * MT.pagina.margem : undefined, margin: "0 auto", position: "relative" }}>
          {children}
          <VeuDaPagina alfa={luz ? luz.veuDaPagina : 0} cima={MT.pagina.margem} />
        </div>
        {gaveta}
        {borda}
      </div>
    );
  }
  return <MesaCheia composicao={composicao} luz={luz} {...resto}>{children}</MesaCheia>;
}
