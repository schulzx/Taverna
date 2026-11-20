/* ============================================================
   O FIM DA LUTA — a vitória-cerimônia (V6 parte 2 · 19/11/2026)

   formas.md §«A Mesa do Mestre · F4» §3 «CERIMONIA_DA_VITORIA» e §4; as
   decisões que a planta não tomou estão em formas.md §«V6 parte 2».
   Saiu de painel-batalha.jsx (A1, 10/10: «o momento do ganho, na própria
   mesa») para casa própria, e cresceu: o tapete recua sob um véu, o título
   entra, o recibo da luta é o de A1 (a peça Recibo, em tamanho de momento),
   e o que caiu no chão pousa de verso e VIRA, da mais comum à mais rara.
   (A barra de XP na carta do herói, as moedas que voam e o lacre na tira
   do Mestre, do F4, NÃO estão aqui: a carta de pé e a tira não existem na
   mesa de batalha de hoje — formas.md §«V6 parte 2».) Um toque
   pula para o fim; com movimento reduzido tudo aparece já posto.

   Duas peças, dois lugares: `FimDaLuta` cobre o tapete (as cartas pousam
   onde a luta foi); `SaidaDaLuta` mora onde estava a mão de ações, com o
   preço por baixo («volta à página · o que ficar no chão, fica») — o
   veredito antes do clique.

   A ordem, os tempos e as contas moram em luta-na-mesa.js (provado em Node);
   aqui só se pinta. O FOCO vai ao título (`tabIndex -1`, `role="status"`) e
   NÃO ao «Respirar fundo»: um Enter que ainda viesse a caminho sairia da
   luta sem o jogador ver o que ganhou (a regra de A1, que fica).
   ============================================================ */
import React from "react";
import { T, ALVOS, TIPOS, alfa, SOMBRA_DA_MESA } from "./estilo.js";
import { Glifo, Recibo } from "./ui.jsx";
import { CERIMONIA_DA_VITORIA as CV, CARTA_DE_ACAO, ordemDoEspolio, CARTA_DO_ESPOLIO as CE, faceDoEspolio } from "./luta-na-mesa.js";
import { CasaDeItem } from "./pecas-da-mesa.jsx";
import { letraDaMesa } from "./mesa-do-mestre.js";

/* As palavras dos desfechos são do `jogo` (A1); a forma é do `desenho`. Na
   fuga e na queda o recibo diz só a perda; a luta encerrada diz o que houver. */
const DESFECHOS_NA_MESA = {
  vitoria:   { titulo: "Vitória",        recibo: "tudo",  chao: true },
  fuga:      { titulo: "Você escapou",   recibo: "perda", chao: false },
  queda:     { titulo: "Você tombou",    recibo: "perda", chao: false },
  encerrada: { titulo: "A luta acabou",  recibo: "tudo",  chao: false },
  /* MM (a luta tem saída, 11/10): o meu lado inteiro caiu e acordou */
  derrota:   { titulo: "Derrota",        recibo: "perda", chao: false },
};

const parado = () => {
  try { return !!(typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches); }
  catch { return false; }
};

/* a cerimônia fica posta no teto (relógio de parede, um temporizador só,
   não um contador de quadros); um toque pula para o fim */
function usarCerimoniaPosta(reduzido) {
  const [posta, setPosta] = React.useState(reduzido);
  React.useEffect(() => {
    if (reduzido) return undefined;
    const id = setTimeout(() => setPosta(true), CV.teto);
    return () => clearTimeout(id);
  }, [reduzido]);
  return [posta, React.useCallback(() => setPosta(true), [])];
}

/* UMA CARTA DO ESPÓLIO: pousa de verso e vira. Tocar recolhe (vai para a
   bolsa); recolhida, fica com «na bolsa» e sem toque.
   F4 §10 lacuna 3 (19/11): a face é a CARTA_DO_ESPOLIO do F6 a dois terços —
   a palavra da raridade, a casa de item com o glifo do item, o nome, uma frase
   do que ele faz e o pé (para onde vai). A raridade é moldura (borda, cantos
   de latão, lacre), palavra e tempo; o verso é igual para todas, e a raridade
   só se sabe ao virar. As medidas e a face moram em luta-na-mesa.js. */
function CantosDeLatao({ largura, altura }) {
  const c = CE.canto;
  return (
    <svg aria-hidden="true" width={largura} height={altura} viewBox={`0 0 ${largura} ${altura}`} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {[[0, 0, 1, 1], [largura, 0, -1, 1], [0, altura, 1, -1], [largura, altura, -1, -1]].map(([x, y, sx, sy], i) => (
        <path key={i} d={`M${x} ${y}h${sx * c}L${x} ${y + sy * c}z`} fill={T.latao} />
      ))}
    </svg>
  );
}
function CartaDoEspolio({ coisa, recolhida, aoRecolher, telefone, posta }) {
  const G = telefone ? CE.celular : CE.mesa;
  const W = G.largura, H = G.altura;
  const face = faceDoEspolio(coisa);
  const M = CE.moldura[face.moldura] || CE.moldura.comum;
  const V = CE.verso;
  const anima = !posta;
  const linhas = (n) => ({ display: "-webkit-box", WebkitLineClamp: n, WebkitBoxOrient: "vertical", overflow: "hidden" });
  const texto = { position: "absolute", left: (W - G.texto) / 2, width: G.texto, textAlign: "center" };
  return (
    <button type="button" data-recolher={recolhida ? undefined : ""} onClick={recolhida ? undefined : aoRecolher} aria-disabled={recolhida || undefined}
      aria-label={recolhida ? `${coisa.nome}, ${CE.naBolsa}` : `Recolher ${coisa.nome}, ${face.palavra}${face.frase ? `: ${face.frase}` : ""}`}
      className={`tv-anel-foco shrink-0${anima ? " tv-carta-pousa" : ""}`}
      style={{ width: W, height: H, padding: 0, border: 0, background: "transparent", perspective: 600, cursor: recolhida ? "default" : "pointer",
        "--tv-pousa-ms": `${CV.cartas.viraMs}ms`, "--tv-pousa-em": `${coisa.pousaEm}ms` }}>
      <span className={anima ? "tv-carta-vira" : undefined}
        style={{ position: "relative", display: "block", width: "100%", height: "100%", transformStyle: "preserve-3d",
          "--tv-vira-ms": `${CV.cartas.viraMs}ms`, "--tv-vira-em": `${coisa.viraEm}ms` }}>
        {/* a face */}
        <span data-face-do-espolio={face.moldura}
          style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", borderRadius: CE.raio, overflow: "visible",
            background: T[CE.chao], border: `${M.px}px solid ${T[M.borda]}`, boxShadow: SOMBRA_DA_MESA.peca, opacity: recolhida ? 0.55 : 1 }}>
          {M.cantos && <CantosDeLatao largura={W - M.px * 2} altura={H - M.px * 2} />}
          <span style={{ ...texto, top: G.yPalavra, ...letraDaMesa("rotulo"), color: face.brasa ? T.brasaNoPergaminho : T.tintaDoPergaminhoDim }}>{recolhida ? CE.naBolsa : face.palavra}</span>
          <span style={{ position: "absolute", left: G.xCasa - M.px, top: G.yCasa - M.px }}>
            <CasaDeItem item={coisa} lado={G.casa} sobre="papel" />
          </span>
          <span style={{ ...texto, top: G.yNome, ...letraDaMesa("nome"), color: T.tintaDoPergaminho, ...linhas(G.linhasNome) }}>{coisa.nome}</span>
          {!telefone && face.frase && <span style={{ ...texto, top: G.yFrase, ...letraDaMesa("servico"), textTransform: "none", color: T.tintaDoPergaminho, ...linhas(G.linhasFrase) }}>{face.frase}</span>}
          {!telefone && <span style={{ ...texto, top: G.yPe, ...letraDaMesa("notaDoMestre"), color: T.tintaDoPergaminhoDim, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{face.pe}</span>}
          {M.lacre && !telefone && (
            <span aria-hidden="true" style={{ position: "absolute", right: -CE.lacre / 3, top: -CE.lacre / 3, width: CE.lacre, height: CE.lacre, borderRadius: "50%",
              background: `radial-gradient(circle at 35% 35%, ${T.lacreLume}, ${T.lacre} 60%, ${T.lacreSombra})`, boxShadow: SOMBRA_DA_MESA.peca }} />
          )}
        </span>
        {/* o verso, igual para todas: couro, aro de latão, o fio a 8 px e o losango */}
        <span aria-hidden="true"
          style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", transform: "rotateY(180deg)", borderRadius: CE.raio,
            background: T[V.chao], border: `${V.aroPx}px solid ${T[V.aro]}`, boxShadow: SOMBRA_DA_MESA.peca }}>
          <span style={{ position: "absolute", inset: V.fio - V.aroPx, borderRadius: CE.raio - 2, border: `1px solid ${alfa(T[V.aro], V.fioAlfa)}` }} />
          <svg width={V.losango * 1.5} height={V.losango * 1.5} viewBox={`0 0 ${V.losango * 1.5} ${V.losango * 1.5}`} style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}>
            <rect x={V.losango * 0.75 - V.losango / 2} y={V.losango * 0.75 - V.losango / 2} width={V.losango} height={V.losango} transform={`rotate(45 ${V.losango * 0.75} ${V.losango * 0.75})`} fill="none" stroke={T[V.aro]} strokeWidth={V.losangoPx} />
          </svg>
        </span>
      </span>
    </button>
  );
}

/* A CERIMÔNIA, sobre o tapete. `linha` (MM, a luta tem saída): o que quem
   ficou de pé fez com os caídos; vazia, 0 px. */
export function FimDaLuta({ desfecho = "encerrada", recibo = [], chao = [], linha = "", aoRecolher, telefone = false }) {
  const d = DESFECHOS_NA_MESA[desfecho] || DESFECHOS_NA_MESA.encerrada;
  const reduzido = React.useMemo(parado, []);
  const [posta, pular] = usarCerimoniaPosta(reduzido);
  const tituloRef = React.useRef(null);
  const [recolhidas, setRecolhidas] = React.useState([]);
  React.useEffect(() => { try { if (tituloRef.current) tituloRef.current.focus(); } catch (e) { /* sem foco, a tela continua */ } }, []);
  const chips = (Array.isArray(recibo) ? recibo : []).filter((c) => c && (d.recibo === "tudo" || Number(c.delta) < 0));
  /* o que foi recolhido continua na mesa (a dizer «na bolsa») mesmo que o App
     o tire do chão: a carta não some debaixo do dedo */
  const coisas = (() => {
    const vindas = (Array.isArray(chao) ? chao : []).filter((c) => c && c.id != null);
    const ids = new Set(vindas.map((c) => String(c.id)));
    return ordemDoEspolio([...vindas, ...recolhidas.filter((c) => !ids.has(String(c.id)))]);
  })();
  const recolhida = (c) => !!c.recolhido || recolhidas.some((r) => String(r.id) === String(c.id));
  const recolher = (c) => {
    try {
      setRecolhidas((rs) => (rs.some((r) => String(r.id) === String(c.id)) ? rs : [...rs, { id: c.id, nome: c.nome, raridade: c.raridade }]));
      if (aoRecolher) aoRecolher(c.id);
    } catch (e) { console.warn("FimDaLuta: recolher falhou", e); }
  };
  const porRecolher = d.chao ? coisas.filter((c) => !recolhida(c)) : [];
  const vencedor = desfecho === "vitoria";
  return (
    <div data-cerimonia={desfecho} onPointerDown={posta ? undefined : pular}
      className="flex flex-col items-center justify-center overflow-y-auto tv-scroll"
      style={{ position: "absolute", inset: 0, zIndex: 30, gap: telefone ? 12 : 18, padding: telefone ? 12 : 24, textAlign: "center",
        background: alfa(T.veuDaNoite, CV.veu) }}>
      <h3 ref={tituloRef} tabIndex={-1} role="status" className="tv-display tv-fim-entra"
        style={{ fontSize: CV.titulo.corpo, color: vencedor ? T.amberSoft : T.ink, fontWeight: 700, lineHeight: 1.2, margin: 0, letterSpacing: 1 }}>
        {d.titulo}
      </h3>
      {chips.length > 0 && <div className="min-w-0 flex justify-center" style={{ width: "100%", maxWidth: CV.recibo }}><Recibo chips={chips} telefone={telefone} momento /></div>}
      {typeof linha === "string" && linha.trim() && (
        <p data-fim-linha="" className="tv-body" style={{ fontSize: TIPOS.corpo, color: T.ink, lineHeight: 1.45, margin: 0, maxWidth: 560 }}>{linha}</p>
      )}
      {d.chao && coisas.length > 0 && (
        <div className="flex flex-wrap items-center justify-center" style={{ gap: telefone ? 8 : 14 }}>
          {coisas.map((c) => (
            <CartaDoEspolio key={String(c.id)} coisa={c} recolhida={recolhida(c)} telefone={telefone} posta={posta || reduzido} aoRecolher={() => recolher(c)} />
          ))}
        </div>
      )}
      {/* F4c: com UMA carta também — na luta jogada a vitória com uma carta só não
          dizia que a carta era o botão (ela diz «vai para a bolsa»; aqui, «Recolher») */}
      {porRecolher.length >= 1 && (
        <button type="button" onClick={() => porRecolher.forEach(recolher)} className="tv-anel-foco tv-display"
          style={{ minHeight: ALVOS.piso, padding: "0 20px", borderRadius: CARTA_DE_ACAO.raio, background: T.panelSoft, border: `1px solid ${T.lineStrong}`, color: T.ink, fontSize: TIPOS.corpo, fontWeight: 600 }}>
          {porRecolher.length > 1 ? CE.recolher.todas : CE.recolher.uma}
        </button>
      )}
    </div>
  );
}

/* A SAÍDA, onde estava a mão de ações: o botão âmbar e o preço por baixo —
   presente e tocável desde o primeiro quadro, nunca desabilitado. */
export function SaidaDaLuta({ aoSair, telefone = false, comChao = false }) {
  return (
    <div className="flex flex-col items-center min-w-0 w-full" style={{ gap: 4 }}>
      <button onClick={aoSair} className="tv-anel-foco tv-display text-lg w-full"
        style={{ minHeight: CV.respirar.altura, maxWidth: telefone ? "none" : CV.respirar.largura, borderRadius: CARTA_DE_ACAO.raio, background: T.amber, color: T.onAccent, fontWeight: 700 }}>
        Respirar fundo →
      </button>
      <span className="tv-body" style={{ fontSize: TIPOS.piso, color: T.inkMeio, fontStyle: "italic" }}>
        {comChao ? CV.preco : CV.preco.split(" · ")[0]}
      </span>
    </div>
  );
}
