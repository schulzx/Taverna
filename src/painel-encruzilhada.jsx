/* ============================================================
   A ENCRUZILHADA (BQ, 08/11/2026) — src/painel-encruzilhada.jsx
   formas.md §BQ 2; Figma 313:2 (as peças 313:108 · 313:109; a escolha
   a 375 em 318:900 · 318:1137 · 318:620, a 1905 em 317:11 · 317:452).

   A escolha de uma quest não é um formulário: é uma mão de cartas na
   mesa. Fechada, é a SoleiraDoMomento (`Momento=escolha`, a que
   `momentoDaEscolha` monta). Aberta, é esta peça:
     · no telefone, uma FOLHA que sobe da soleira até 8 px do topo, por
       cima do véu, com o rolo das cartas e o rodapé preso;
     · na mesa, um CARTÃO centrado, pousado 16 px acima do campo, com as
       cartas lado a lado.
   O CAMPO NUNCA SE TAPA: o véu cobre tudo menos a linha do campo, e o
   jogador pode escrever com a encruzilhada aberta (a frase pode ser uma
   destas cartas, ou outro caminho).

   CADA CARTA TEM DUAS FACES — o que ganhas por cima, o que custa por
   baixo, separadas por um picote. A GRAVIDADE LÊ-SE PELA FORMA, antes da
   cor: a ficha da bolsa (preço), o tracejado e «Esta história acaba
   aqui.» (fecha), o aro de perigo, a faixa escura e o rosto de quem pode
   morrer (vida). A carta virada diz que há outras maneiras sem as contar.

   ESCOLHER CUSTA DOIS TOQUES E NUNCA UM: tocar numa carta escolhe-a (sobe,
   aro âmbar, «A TUA ESCOLHA»); o botão de baixo confirma e DIZ O PREÇO no
   verbo («Escolher, e arriscar Brash»). O veredito antes do clique.

   Este arquivo SÓ MONTA A TELA. Quem decide (as opções, a gravidade, o
   risco, se a bolsa paga) é o motor (`vereditoDaEscolha`,
   biblioteca-de-quests.js); quem liga é o App, em `calou`. Onde um dado
   falta, a peça cala-se: sem `risco.quem` não há faixa da vida; sem o
   rosto, a faixa fica só com a frase.

   <Encruzilhada aberta veredito={…} quest="O Salvo-Conduto" titulo="O que Gil merece"
     telefone={bool} aoConfirmar={(opcaoId) => …} aoDepois aoEscrever
     preEscolhida="entregar" frase="entrego-o à guarda" rostoDe={(risco) => <Retrato…/>}
     bolsa={n} devolverFocoA={ref} baseDoCampo={px} />
   momentoDaEscolha(veredito, { titulo, aoAbrir, aoDepois }) → { qual: "escolha", momento } | null
   ============================================================ */
import React from "react";
import { createPortal } from "react-dom";
import { T, TIPOS, ALVOS, alfa, ENCAIXE, MOLDURA_POR_DEGRAU, ENCRUZILHADA, GRAVIDADE_DA_ESCOLHA, TIRA_DA_MESA, SOLEIRA_DO_MOMENTO } from "./estilo.js";
import { Glifo, TextoComMoeda } from "./ui.jsx";
import { GlifoAR } from "./painel-ar-pecas.jsx";

const E = ENCRUZILHADA;
const OURO = MOLDURA_POR_DEGRAU.ouro;   /* o aro do cartão e da folha (317:452 · 318:1137) */
const G = GRAVIDADE_DA_ESCOLHA;
const FOCAVEIS = "button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])";

/* ---------------- O QUE SE LÊ DE UMA OPÇÃO ----------------
   Nada aqui decide: lê o que o motor mandou. A gravidade é a do motor; se
   ela não vier, lê-se dos campos que vieram (o risco, o fecha, o custo),
   pela tabela de §BQ 2 — nunca se inventa uma que os dados não dizem. */
const encher = (modelo, mapa) => String(modelo || "").replace(/\{(\w+)\}/g, (_, k) => (mapa[k] != null ? String(mapa[k]) : ""));
const minuscula = (s) => { const x = String(s || ""); return x ? x[0].toLowerCase() + x.slice(1) : x; };
const custoDe = (o) => Math.max(0, Math.floor(Number(o && o.custo) || 0));
const quemDe = (o) => String((o && o.risco && o.risco.quem) || "").trim();

export function gravidadeDe(o) {
  if (!o || typeof o !== "object") return "leve";
  if (G.ordem.includes(o.gravidade)) return o.gravidade === "vida" && !quemDe(o) ? (o.fecha ? "fecha" : custoDe(o) > 0 ? "preco" : "leve") : o.gravidade;
  if (quemDe(o)) return "vida";
  if (o.fecha) return "fecha";
  if (custoDe(o) > 0) return "preco";
  return "leve";
}
function maisGrave(opcoes) {
  const gs = opcoes.map(gravidadeDe);
  return G.ordem.find((g) => gs.includes(g)) || "leve";
}
const impedidaDe = (o) => custoDe(o) > 0 && o.podeEscolher === false;
function faltamDe(o, bolsa) {
  if (Number.isFinite(Number(o.faltam)) && Number(o.faltam) > 0) return Math.floor(Number(o.faltam));
  if (bolsa == null || !Number.isFinite(Number(bolsa))) return null;
  const f = custoDe(o) - Math.max(0, Math.floor(Number(bolsa)));
  return f > 0 ? f : null;
}
function fraseDaVida(o) {
  const quem = quemDe(o);
  if (!quem) return "";
  return encher(o.risco.certo ? G.vida.frase.certo : G.vida.frase.pode, { quem });
}
/* o verbo do botão: diz a escolha e o preço (§BQ 2, «O botão de confirmar») */
export function verboDeConfirmar(o) {
  if (!o) return E.confirmar.calado;
  const g = gravidadeDe(o);
  const texto = String(o.texto || "").trim();
  if (g === "vida") return encher(G.vida.verbo, { quem: quemDe(o) });
  if (g === "preco") return encher(E.confirmar.preco, { n: custoDe(o) });
  if (g === "fecha") return encher(E.confirmar.fecha, { texto });
  return encher(E.confirmar.leve, { texto: minuscula(texto) });
}
/* o nome que o leitor de ecrã lê: a carta inteira, sem corte */
function nomeDaCarta(o, bolsa) {
  const X = E.textos;
  const partes = [String(o.texto || "").trim().replace(/\.?$/, ".")];
  if (o.ganha) partes.push(`${X.ganhas}: ${o.ganha}`);
  if (o.custa) partes.push(`${X.custa}: ${o.custa}`);
  const custo = custoDe(o);
  if (custo > 0) {
    const f = impedidaDe(o) ? faltamDe(o, bolsa) : null;
    partes.push(impedidaDe(o) ? (f ? `Faltam ${f} moedas.` : `${custo} moedas da tua bolsa, e não chegam.`) : `${custo} moedas da tua bolsa.`);
  }
  if (o.fecha) partes.push(G.fecha.frase);
  const vida = fraseDaVida(o);
  if (vida) partes.push(vida);
  return partes.join(" ");
}

/* ---------------- O MOMENTO NA SOLEIRA ----------------
   A escolha fechada: o glifo da encruzilhada, «Decidir · <a etapa>», o que
   está em jogo (que pode encurtar) e, no nó que nunca encurta, quantos
   caminhos — ou quem pode morrer, e então o botão é vermelho. */
export function momentoDaEscolha(veredito, { titulo = "", aoAbrir, aoDepois } = {}) {
  const opcoes = veredito && Array.isArray(veredito.opcoes) ? veredito.opcoes.filter((o) => o && o.id != null) : [];
  if (!opcoes.length) return null;
  const S = E.soleira;
  const grave = maisGrave(opcoes);
  const daVida = grave === "vida" ? opcoes.find((o) => gravidadeDe(o) === "vida") : null;
  const n = opcoes.length;
  const verbo = [S.verbo, String(titulo || "").trim()].filter(Boolean).join(" · ");
  return {
    qual: "escolha",
    momento: {
      verbo,
      cede: String(veredito.contexto || "").trim(),
      preco: daVida ? encher(G.vida.noSoleira, { quem: quemDe(daVida) }) : `${n} ${n === 1 ? S.caminhos.um : S.caminhos.varios}`,
      vida: !!daVida,
      aoPrincipal: aoAbrir,
      secundario: { rotulo: S.recuo, aoTocar: aoDepois },
    },
  };
}

/* ---------------- AS PEQUENAS ---------------- */
function Rotulo({ children, cor }) {
  const R = E.carta.rotulo;
  return <span className="tv-mono uppercase block" style={{ fontSize: R.tamanho, letterSpacing: `${R.espacamento}px`, color: cor, fontWeight: 700 }}>{children}</span>;
}
function Picote({ cor = E.carta.picote.cor }) {
  const P = E.carta.picote;
  return <span aria-hidden="true" className="block" style={{ height: 1, margin: `${E.carta.vao}px 0`, opacity: P.alfa, backgroundImage: `repeating-linear-gradient(90deg, ${cor} 0 ${P.traco[0]}px, transparent ${P.traco[0]}px ${P.traco[0] + P.traco[1]}px)` }} />;
}

/* ---------------- A CARTA DA ESCOLHA (313:108) ----------------
   Gravidade (leve · preco · fecha · vida) × Estado (repouso · escolhida),
   e preco/impedida. As outras não se esbatem quando uma é escolhida: são
   elas que o jogador está a comparar. */
export function CartaDaEscolha({ opcao, escolhida = false, aoTocar, rosto = null, bolsa = null, indice = 0 }) {
  if (!opcao) return null;
  const C = E.carta;
  const X = E.textos;
  const g = gravidadeDe(opcao);
  const custo = custoDe(opcao);
  const impedida = impedidaDe(opcao);
  const faltam = impedida ? faltamDe(opcao, bolsa) : null;
  const vida = fraseDaVida(opcao);
  const aro = escolhida ? `${C.escolhida.espessura}px solid ${C.escolhida.aro}`
    : g === "vida" ? `${G.vida.espessura}px solid ${G.vida.aro}`
    : impedida ? `1px dashed ${C.aro}`
    : `1px solid ${C.aro}`;
  const S = C.escolhida.sombra;
  const tocar = () => { if (impedida || !aoTocar) return; try { aoTocar(opcao.id); } catch { /* escolher nunca derruba a mesa */ } };
  return (
    /* a carta dá-se da soleira (o invólucro anima a entrada); o botão sobe
       quando escolhido (a transição é dele) — os dois movimentos não lutam
       pelo mesmo transform */
    <div className={`tv-carta-dada${indice > 0 ? ` tv-carta-dada-${Math.min(indice, 4)}` : ""}`} style={{ minWidth: 0 }}>
      <button type="button" onClick={tocar} aria-pressed={escolhida ? "true" : "false"} aria-disabled={impedida ? "true" : undefined}
        aria-label={nomeDaCarta(opcao, bolsa)} data-gravidade={g} data-impedida={impedida ? "sim" : undefined}
        className="tv-anel-foco tv-carta-escolha w-full text-left flex flex-col"
        style={{
          padding: C.enchimento, borderRadius: C.raio, background: C.chao, border: aro, color: C.tinta,
          cursor: impedida ? "not-allowed" : "pointer",
          boxShadow: escolhida ? `0 ${S.y}px ${S.raio}px ${alfa(ENCAIXE.sombra, S.alfa)}` : "none",
        }}>
        {escolhida ? (
          <span aria-hidden="true" className="tv-mono uppercase inline-flex items-center self-start" style={{
            gap: 6, marginBottom: C.vao, padding: "2px 8px", borderRadius: 4, background: C.escolhida.tag.chao, color: C.escolhida.tag.letra,
            fontSize: C.rotulo.tamanho, letterSpacing: `${C.rotulo.espacamento}px`, fontWeight: 700,
          }}>
            <GlifoAR nome="visto" tamanho={C.rotulo.tamanho} cor={C.escolhida.tag.letra} />{X.escolhida}
          </span>
        ) : null}
        <span aria-hidden="true" className="tv-display block" style={{ fontSize: C.verbo.tamanho, lineHeight: `${C.verbo.entrelinha}px`, fontWeight: 600, color: C.tinta, marginBottom: C.vao }}>{opcao.texto}</span>
        <span aria-hidden="true" className="block">
          <Rotulo cor={C.ganha}>{X.ganhas}</Rotulo>
          <span className="tv-body block" style={{ marginTop: 6, fontSize: C.texto.tamanho, lineHeight: `${C.texto.entrelinha}px`, color: C.tinta }}>{opcao.ganha}</span>
        </span>
        <Picote />
        <span aria-hidden="true" className="block">
          <Rotulo cor={C.custa}>{X.custa}</Rotulo>
          <span className="tv-body block" style={{ marginTop: 6, fontSize: C.texto.tamanho, lineHeight: `${C.texto.entrelinha}px`, color: C.tinta }}>{opcao.custa}</span>
        </span>
        {custo > 0 ? (
          <span aria-hidden="true" className="tv-mono inline-block self-start" data-ficha={impedida ? "impedida" : "preco"} style={{
            marginTop: C.vao, padding: "3px 10px", borderRadius: 6, fontSize: TIPOS.maquina, fontWeight: 700,
            background: impedida ? G.preco.impedida.chao : G.preco.chao, color: impedida ? G.preco.impedida.letra : G.preco.letra,
          }}>
            <TextoComMoeda texto={impedida && faltam ? encher(G.preco.impedida.frase, { n: faltam }) : encher(G.preco.frase, { n: custo })} />
          </span>
        ) : null}
        {opcao.fecha ? (
          <span aria-hidden="true" className="block">
            <Picote cor={G.fecha.cor} />
            <span className="flex items-center" style={{ gap: 8 }}>
              <span className="flex items-center justify-center shrink-0" style={{ width: G.fecha.selo, height: G.fecha.selo, borderRadius: G.fecha.selo, border: `1.5px solid ${G.fecha.cor}` }}>
                <GlifoAR nome="fechar" tamanho={TIPOS.maquina} cor={G.fecha.cor} />
              </span>
              <span className="tv-body italic" style={{ fontSize: C.texto.tamanho, color: G.fecha.cor }}>{G.fecha.frase}</span>
            </span>
          </span>
        ) : null}
        {vida ? (
          <span aria-hidden="true" className="flex items-center" data-faixa="vida" style={{
            gap: 10, marginTop: C.vao, padding: "10px 12px", borderRadius: G.vida.faixa.raio, background: G.vida.faixa.chao,
          }}>
            {rosto ? (
              <span className="shrink-0 overflow-hidden flex items-center justify-center" data-rosto="" style={{
                width: G.vida.faixa.rosto, height: G.vida.faixa.rosto, borderRadius: G.vida.faixa.rosto,
                border: `2px solid ${G.vida.faixa.aroDoRosto}`, background: T.couroBaixo,
              }}>{rosto}</span>
            ) : null}
            <span className="tv-body" style={{ fontSize: C.texto.tamanho, lineHeight: `${C.texto.entrelinha}px`, fontWeight: 600, color: G.vida.faixa.letra }}>{vida}</span>
          </span>
        ) : null}
      </button>
    </div>
  );
}

/* ---------------- A CARTA VIRADA (313:109) ----------------
   O verso: couro, aro de ouro, o medalhão da encruzilhada. Mostra que há
   caminhos sem os contar. Tocar põe o foco no campo; nunca escolhe nada. */
export function CartaVirada({ aoTocar, telefone = false, indice = 0 }) {
  const V = E.virada;
  const X = E.textos.virada;
  const tocar = () => { if (!aoTocar) return; try { aoTocar(); } catch { /* o campo nunca derruba a mesa */ } };
  return (
    <div className={`tv-carta-dada${indice > 0 ? ` tv-carta-dada-${Math.min(indice, 4)}` : ""}`} style={{ minWidth: 0 }}>
      <button type="button" onClick={tocar} aria-label={`${X.titulo} ${X.linha}`} data-carta="virada"
        className={`tv-anel-foco w-full flex ${telefone ? "flex-row text-left" : "flex-col text-center"} items-center justify-center`}
        style={{
          gap: 12, padding: E.carta.enchimento, borderRadius: E.carta.raio, background: V.chao, border: `1px solid ${V.aro}`,
          minHeight: telefone ? E.telefone.virada : 260, cursor: "text",
        }}>
        <span aria-hidden="true" className="flex items-center justify-center shrink-0" style={{ width: V.medalhao, height: V.medalhao, borderRadius: V.medalhao, border: `1.5px solid ${V.aro}`, background: T.couroBaixo }}>
          <Glifo nome="encruzilhada" tamanho={TIPOS.titulo} cor={T.amberSoft} />
        </span>
        <span aria-hidden="true" className="flex flex-col" style={{ gap: 6 }}>
          <span className="tv-display" style={{ fontSize: V.titulo, fontWeight: 600, color: T.ink, lineHeight: 1.2 }}>{X.titulo}</span>
          <span className="tv-body" style={{ fontSize: E.carta.texto.tamanho, lineHeight: `${E.carta.texto.entrelinha}px`, color: T.inkMeio }}>{X.linha}</span>
        </span>
      </button>
    </div>
  );
}

/* a pega da folha (a da MesaPuxada: 36 × 4) */
function Pega({ aoTocar }) {
  const P = TIRA_DA_MESA.pega;
  return (
    <button type="button" onClick={aoTocar} aria-label={E.soleira.recuo} className="tv-anel-foco flex justify-center shrink-0 w-full"
      style={{ minHeight: 20, paddingTop: P.cima, background: "transparent", border: "none", cursor: "grab" }}>
      <span aria-hidden="true" style={{ width: P.largura, height: P.alto, borderRadius: P.alto, background: alfa(P.cor, P.alfa) }} />
    </button>
  );
}

/* ---------------- A ENCRUZILHADA ---------------- */
export function Encruzilhada({ aberta = false, veredito = null, quest = "", titulo = "", telefone = false, aoConfirmar, aoDepois, aoEscrever,
  preEscolhida = null, frase = "", rostoDe = null, bolsa = null, devolverFocoA = null, baseDoCampo = 0 }) {
  const opcoes = veredito && Array.isArray(veredito.opcoes) ? veredito.opcoes.filter((o) => o && o.id != null) : [];
  const chave = veredito ? String(veredito.chave || "") : "";
  const valida = (id) => { const o = opcoes.find((x) => x.id === id); return o && !impedidaDe(o) ? id : null; };
  const [escolhida, setEscolhida] = React.useState(() => valida(preEscolhida));
  /* uma escolha nova (ou a frase que escolhe outra carta) recomeça a mão */
  React.useEffect(() => { setEscolhida(valida(preEscolhida)); }, [chave, preEscolhida]); // eslint-disable-line react-hooks/exhaustive-deps
  const caixa = React.useRef(null);
  React.useEffect(() => {
    if (!aberta) return undefined;
    const devolver = devolverFocoA;
    try { const f = caixa.current && caixa.current.querySelector(FOCAVEIS); if (f) f.focus(); } catch { /* sem foco, sem custo */ }
    return () => { try { if (devolver && devolver.current) devolver.current.focus(); } catch { /* idem */ } };
  }, [aberta]); // eslint-disable-line react-hooks/exhaustive-deps
  const arrasto = React.useRef(null);
  if (!aberta || !opcoes.length) return null;

  const depois = () => { try { if (aoDepois) aoDepois(); } catch { /* a forma nunca custa o turno */ } };
  const escrever = () => { try { if (aoEscrever) aoEscrever(); } catch { /* idem */ } };
  const aOpcao = opcoes.find((o) => o.id === escolhida) || null;
  const confirmar = () => { if (!aOpcao) return; try { if (aoConfirmar) aoConfirmar(aOpcao.id); } catch { /* idem */ } };
  const aoTeclar = (ev) => {
    if (ev.key === "Escape") { ev.stopPropagation(); depois(); return; }
    if (ev.key !== "Tab" || !caixa.current) return;
    const todos = Array.from(caixa.current.querySelectorAll(FOCAVEIS));
    if (!todos.length) return;
    const primeiro = todos[0], ultimo = todos[todos.length - 1];
    if (ev.shiftKey && document.activeElement === primeiro) { ev.preventDefault(); ultimo.focus(); }
    else if (!ev.shiftKey && document.activeElement === ultimo) { ev.preventDefault(); primeiro.focus(); }
  };
  const X = E.textos;
  const M = telefone ? E.telefone : E.mesa;
  const daVida = aOpcao && gravidadeDe(aOpcao) === "vida";
  /* baseDoCampo: do fundo da janela ao topo do campo. O véu e a folha param
     a uma folga da soleira acima dele (o campo fica à vista e vivo); o cartão
     da mesa pousa 16 acima do campo */
  const base = Math.max(0, Number(baseDoCampo) || 0);
  const baseDoVeu = base + SOLEIRA_DO_MOMENTO.vao;
  const nCartas = opcoes.length + 1;   /* a carta virada conta para a largura, não para os caminhos */
  const largura = nCartas >= 4 ? E.mesa.largura.com4 : E.mesa.largura.ate3;
  const fraseDoJogador = String(frase || "").trim();

  const cabeca = (
    <header className="flex flex-col shrink-0" style={{ gap: 4 }}>
      <span className="tv-mono uppercase flex items-center" style={{ gap: 6, fontSize: TIPOS.maquina, letterSpacing: `${E.carta.rotulo.espacamento}px`, color: T.amberSoft, fontWeight: 700 }}>
        <Glifo nome="encruzilhada" tamanho={TIPOS.maquina + 4} cor={T.amberSoft} />
        <span>{[X.cabeca, String(quest || "").trim()].filter(Boolean).join(" · ")}</span>
      </span>
      {titulo ? <h2 className="tv-display m-0" style={{ fontSize: M.titulo, fontWeight: 600, color: T.ink, lineHeight: 1.15 }}>{titulo}</h2> : null}
      {veredito.contexto ? <p className="tv-body italic m-0" style={{ fontSize: M.contexto.tamanho, lineHeight: `${M.contexto.entrelinha}px`, color: T.inkMeio }}>{veredito.contexto}</p> : null}
      {fraseDoJogador ? <p className="tv-body italic m-0" data-frase="" style={{ fontSize: M.contexto.tamanho, lineHeight: `${M.contexto.entrelinha}px`, color: T.ink }}>“{fraseDoJogador}”</p> : null}
    </header>
  );
  const cartas = (
    <div role="group" aria-label={titulo || X.cabeca} className={telefone ? "flex flex-col" : "grid items-start"}
      style={telefone ? { gap: M.vao } : { gap: M.vao, gridTemplateColumns: `repeat(${nCartas}, minmax(0, 1fr))` }}>
      {opcoes.map((o, i) => (
        <CartaDaEscolha key={o.id} opcao={o} indice={i} escolhida={o.id === escolhida} bolsa={bolsa}
          aoTocar={(id) => setEscolhida(id)}
          rosto={quemDe(o) && rostoDe ? (() => { try { return rostoDe(o.risco); } catch { return null; } })() : null} />
      ))}
      <CartaVirada aoTocar={escrever} telefone={telefone} indice={opcoes.length} />
    </div>
  );
  const corDoBotao = !aOpcao ? T.panelSoft : daVida ? G.vida.botao : T.amber;
  const rodape = (
    <footer className={`flex ${telefone ? "flex-col" : "items-center"} shrink-0`} style={{ gap: telefone ? 10 : 16 }}>
      <p className="tv-body m-0 flex-1" style={{ fontSize: TIPOS.rotulo, color: T.inkDim }}>{telefone ? X.rodape.telefone : X.rodape.mesa}</p>
      <div className="flex" style={{ gap: 10 }}>
        <button type="button" onClick={depois} className="tv-anel-foco tv-body shrink-0" style={{
          minHeight: E.confirmar.alto, padding: "0 18px", borderRadius: 10, background: T.panel, border: `1px solid ${T.lineStrong}`, color: T.ink, fontSize: TIPOS.corpo,
        }}>{E.soleira.recuo}</button>
        <button type="button" onClick={confirmar} disabled={!aOpcao} data-confirmar={aOpcao ? (daVida ? "vida" : "pronto") : "calado"}
          className="tv-anel-foco tv-body flex-1 flex items-center justify-center" style={{
            minHeight: E.confirmar.alto, padding: "0 18px", borderRadius: 10, border: "none", fontSize: TIPOS.corpo, fontWeight: 600,
            background: corDoBotao, color: aOpcao ? T.onAccent : T.inkDim, cursor: aOpcao ? "pointer" : "not-allowed", whiteSpace: telefone ? "normal" : "nowrap",
          }}>
          {/* num span: o flex do botão comeria o espaço antes da moeda */}
          <span><TextoComMoeda texto={verboDeConfirmar(aOpcao)} /></span>
        </button>
      </div>
    </footer>
  );

  const veu = (
    <div aria-hidden="true" className="tv-veu-da-escolha" onClick={depois}
      style={{ position: "fixed", left: 0, right: 0, top: 0, bottom: baseDoVeu, background: alfa(ENCAIXE.sombra, E.veu), zIndex: 60 }} />
  );
  const aoBaixar = (ev) => { arrasto.current = ev.clientY; };
  const aoSoltar = (ev) => { const y0 = arrasto.current; arrasto.current = null; if (y0 != null && ev.clientY - y0 >= ALVOS.piso) depois(); };
  const conteudo = telefone ? (
    <div onKeyDown={aoTeclar} data-encruzilhada="telefone">
      {veu}
      <section ref={caixa} role="dialog" aria-label={[X.cabeca, titulo].filter(Boolean).join(": ")} className="tv-folha-da-escolha flex flex-col"
        style={{
          position: "fixed", left: M.lado, right: M.lado, top: M.cima, bottom: baseDoVeu, zIndex: 61, background: T.panel, border: `${E.mesa.aro}px solid ${OURO.meio}`,
          borderRadius: `${M.raio.cima}px ${M.raio.cima}px ${M.raio.baixo}px ${M.raio.baixo}px`, overflow: "hidden",
          padding: `${M.enchimento[0]}px ${M.enchimento[1]}px ${M.enchimento[2]}px`, gap: M.vao,
        }}>
        <div onPointerDown={aoBaixar} onPointerUp={aoSoltar}><Pega aoTocar={depois} /></div>
        {cabeca}
        <div className="flex-1 min-h-0 overflow-y-auto" style={{ paddingTop: E.carta.escolhida.sobe }}>{cartas}</div>
        {rodape}
      </section>
    </div>
  ) : (
    <div onKeyDown={aoTeclar} data-encruzilhada="mesa">
      {veu}
      <section ref={caixa} role="dialog" aria-label={[X.cabeca, titulo].filter(Boolean).join(": ")} className="flex flex-col"
        style={{
          position: "fixed", left: "50%", transform: "translateX(-50%)", bottom: base + M.acimaDoCampo, zIndex: 61,
          width: `min(${largura}px, calc(100vw - 32px))`, maxHeight: `calc(100vh - ${M.topo + base + M.acimaDoCampo}px)`, overflowY: "auto",
          background: T.panel, border: `${M.aro}px solid ${OURO.meio}`, borderRadius: M.raio,
          padding: `${M.enchimento[0]}px ${M.enchimento[1]}px`, gap: M.vao,
        }}>
        {cabeca}
        <div style={{ paddingTop: E.carta.escolhida.sobe }}>{cartas}</div>
        {rodape}
      </section>
    </div>
  );
  return typeof document !== "undefined" && document.body ? createPortal(conteudo, document.body) : conteudo;
}
