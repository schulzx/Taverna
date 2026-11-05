/* ============================================================
   A CERIMÓNIA DA SUBIDA DE NÍVEL (AAA · 05/11/2026) — formas.md §AAA §4
   Figma: os quadros 1 a 5 a 375 (256:501 · 256:533 · 256:581 · 256:617 ·
   256:669) e a escolha a 1280 (256:790).

   Tela cheia, e é a dopamina — mas nunca custa o turno:
     1. o véu: a mesa escurece; o medalhão do herói ao centro (×2,4);
     2. a luz âmbar sobe de baixo; SÓ quando o degrau muda (5, 10, 15) a
        camada nova forja-se à volta do retrato e saltam as faíscas; nos
        outros níveis o aro dá um pulso;
     3. «NÍVEL» e o número;
     4. os ganhos, linha a linha (os números de sempre — subida-de-nivel.js);
        se a subclasse abriu, a gema acende e o nome dela aparece;
     5. a escolha: os seis discos; tocar põe um ponto, tocar outra vez
        desfaz; o primário diz o preço («Confirmar · Intelecto +3 → +4»);
        «Gastar depois» guarda os pontos, como hoje.

   A SAÍDA, SEMPRE: o primeiro toque (ou Esc) salta para o quadro 5 —
   nunca fecha sem a escolha. Com prefers-reduced-motion só aparece o
   quadro 5, num esvanecer, com a moldura nova e a gema já acesas.

   Os tempos são todos de CERIMONIA_DO_NIVEL e vivem no CSS
   (.tv-cerimonia-*); aqui só se põe o atraso de cada um. Nenhum relógio de
   JavaScript: o fim da entrada da escolha (animationend) é o fim da
   cerimónia. Tudo chega por props; nada se lê do App.
   ============================================================ */
import React from "react";
import { T, ATRIBUTOS } from "./constantes.js";
import { CERIMONIA_DO_NIVEL, CERIMONIA_DA_TELA, TAMANHOS_DA_MOLDURA, VB_DA_MOLDURA, TIPOS, FICHA_CARTA, alfa } from "./estilo.js";
import { Botao, Retrato } from "./ui.jsx";
import { Moldura, Gema, Disco } from "./painel-moldura.jsx";
import { molduraDe, degrauDaMoldura } from "./moldura.js";
import { sementeDe } from "./semente.js";
import { subclasseDoHeroi } from "./marca-da-subclasse.js";
import { tetoAtributo, podeSubirAtributo } from "./atributos.js";
import { degrauMudou, gemaQueAcendeu, ganhosDaSubida, alternarPonto, planoDosPontos, rotuloDoConfirmar } from "./subida-de-nivel.js";

const C = CERIMONIA_DO_NIVEL, V = CERIMONIA_DA_TELA;
const sinal = (n) => (n >= 0 ? "+" : "−") + Math.abs(n);
const atraso = (ms) => ({ animationDelay: `${ms}ms` });

/* quem pediu menos movimento vê só o quadro 5 (§4); nunca lança */
function querParado() {
  try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; }
}

/* um ganho em texto curto: «PV 68 → 74», «+2 pontos de habilidade» */
export function textoDoGanho(g) {
  if (!g) return "";
  if (g.mais != null) return `+${g.mais} ${g.rotulo}`;
  return `${g.rotulo} ${g.antes} → ${g.depois}`;
}

/* O MEDALHÃO DA CERIMÓNIA, com a forja ou o pulso, e a gema que acende.
   `vivo` = a linha do tempo corre (senão, tudo no estado final). */
function MedalhaoDaCerimonia({ p, nivel, gemaNova, vivo, lex }) {
  const px = Math.round(TAMANHOS_DA_MOLDURA.medalhao.aro * V.escalaDoMedalhao);
  const k = px / 80, vb = VB_DA_MOLDURA.medalhao;
  let m = { degrau: "ferro", gema: null, selo: false };
  try { m = molduraDe(p, "heroi"); } catch (e) { /* ferro vazio */ }
  const forja = degrauMudou(nivel);
  const rosto = (lado) => <Retrato semente={sementeDe(p)} ente={p} lex={lex} tamanho={lado} anel={null} semCarta />;
  /* a gema que acende entra por cima do engaste vazio, no seu tempo */
  const gemaDaMoldura = gemaNova && vivo ? null : m.gema;
  const caixa = { width: vb[2] * k, height: vb[3] * k };
  return (
    <div className="relative" style={caixa}>
      {forja && vivo ? (
        <>
          <span className="absolute inset-0">
            <Moldura tamanho="medalhao" aro={px} degrau={degrauDaMoldura(nivel - 1)} lado="heroi" gema={gemaDaMoldura} selo={m.selo} nivel={nivel}>{rosto}</Moldura>
          </span>
          <span className="absolute inset-0 tv-cerimonia-forja" style={atraso(C.forja.de)}>
            <Moldura tamanho="medalhao" aro={px} degrau={m.degrau} lado="heroi" gema={gemaDaMoldura} selo={m.selo} nivel={nivel}>{rosto}</Moldura>
          </span>
          {Array.from({ length: C.forja.faiscas }, (_, i) => (
            <span key={i} aria-hidden="true" className="absolute rounded-full tv-cerimonia-faisca pointer-events-none"
              style={{
                left: (50 - vb[0]) * k - V.faisca / 2, top: (50 - vb[1]) * k - V.faisca / 2, width: V.faisca, height: V.faisca,
                background: T.amberSoft, "--a": `${(360 / C.forja.faiscas) * i}deg`, "--d": `${Math.round(px * V.alcance)}px`, ...atraso(C.forja.de),
              }} />
          ))}
        </>
      ) : (
        <span className={`absolute inset-0 ${vivo ? "tv-cerimonia-pulso" : ""}`} style={vivo ? atraso(C.pulso.de) : undefined}>
          <Moldura tamanho="medalhao" aro={px} degrau={m.degrau} lado="heroi" gema={gemaDaMoldura} selo={m.selo} nivel={nivel}>{rosto}</Moldura>
        </span>
      )}
      {gemaNova && vivo ? (
        <span className="absolute tv-cerimonia-gema" style={{ left: (V.gema.x - vb[0] - V.gema.r) * k, top: (V.gema.y - vb[1] - V.gema.r) * k, ...atraso(C.gema.de) }}>
          <Gema gema={gemaNova} degrau={m.degrau} tamanho={Math.round(2 * V.gema.r * k)} />
        </span>
      ) : null}
    </div>
  );
}

/* A CERIMÓNIA. Props, por extenso:
   · nivel — o nível alcançado;
   · antes — a ficha antes da subida (opcional: sem ela, os máximos de antes
     são os de depois menos o degrau da tabela);
   · depois — a ficha de agora (nível, vidaMax, manaMax, atributos, classe…);
   · pontos — os pontos de atributo a gastar AQUI (os que o nível deu mais os
     que já esperavam); por omissão, depois.pontosAtr;
   · ganhos — as linhas dos ganhos, se o App as quiser ditar (por omissão,
     ganhosDaSubida(nivel, antes, depois));
   · subclasse — o nome da subclasse que abriu agora, se o App souber (por
     omissão, a gema que acendeu entre antes e depois);
   · aoEscolher(attrId) — um ponto num atributo; chamado uma vez por ponto,
     pela ordem dos toques, ao confirmar;
   · aoFechar() — depois de confirmar (ou sem pontos, ao continuar);
   · aoGastarDepois() — os pontos ficam em pontosAtr, como hoje;
   · lex — o léxico do mundo, para o retrato. */
export function PainelSubidaDeNivel({ nivel, antes = null, depois, pontos = null, ganhos = null, subclasse = null, aoEscolher = () => {}, aoFechar = () => {}, aoGastarDepois = () => {}, lex = null }) {
  const p = depois || {};
  const nv = Math.max(1, Number(nivel) || Number(p.nivel) || 1);
  const [estado, setEstado] = React.useState(() => (querParado() ? "parado" : "correndo")); /* correndo | saltou | acabou | parado */
  const [escolhas, setEscolhas] = React.useState([]);
  const vivo = estado === "correndo";
  const base = React.useMemo(() => ({ ...p, pontosAtr: pontos != null ? Math.max(0, Number(pontos) || 0) : Number(p.pontosAtr) || 0 }), [p, pontos]);
  let linhasDosGanhos = [];
  try { linhasDosGanhos = Array.isArray(ganhos) ? ganhos : ganhosDaSubida(nv, antes, p); } catch (e) { linhasDosGanhos = []; }
  let gemaNova = null;
  try { gemaNova = subclasse ? (molduraDe(p).gema || null) : antes ? gemaQueAcendeu(antes, p) : null; } catch (e) { gemaNova = null; }
  let nomeDaSubclasse = subclasse || "";
  try { if (!nomeDaSubclasse && gemaNova) nomeDaSubclasse = subclasseDoHeroi(p) || ""; } catch (e) { nomeDaSubclasse = ""; }
  let plano = { linhas: [], feitas: [], restam: base.pontosAtr, pers: base };
  try { plano = planoDosPontos(base, escolhas); } catch (e) { /* sem plano, nada se confirma */ }
  const teto = tetoAtributo(nv);
  const primeiroDisco = React.useRef(null);

  const saltar = React.useCallback(() => setEstado((e) => (e === "correndo" ? "saltou" : e)), []);
  React.useEffect(() => {
    const tecla = (e) => { if (e.key === "Escape") saltar(); };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [saltar]);
  React.useEffect(() => {
    if (estado === "correndo") return;
    try { const b = primeiroDisco.current && primeiroDisco.current.querySelector("button"); if (b) b.focus(); } catch (e) { /* sem foco, segue */ }
  }, [estado]);

  const tocar = (id) => { try { setEscolhas((l) => alternarPonto(base, l, id)); } catch (e) { /* o disco não muda */ } };
  const confirmar = () => {
    for (const id of plano.feitas) { try { aoEscolher(id); } catch (e) { /* nunca custa o turno */ } }
    try { aoFechar(); } catch (e) { /* idem */ }
  };
  const quantos = base.pontosAtr;

  return (
    <div role="dialog" aria-modal="true" aria-label={`Nível ${nv}`} className="fixed inset-0 z-50 tv-cerimonia-reduzida" onClick={vivo ? saltar : undefined}>
      <div aria-hidden="true" className={`absolute inset-0 ${vivo ? "tv-cerimonia-veu" : ""}`} style={{ background: T.bg, opacity: C.veu.opacidade }} />
      <div aria-hidden="true" className={`absolute inset-0 pointer-events-none ${vivo ? "tv-cerimonia-luz" : ""}`}
        style={{ background: `radial-gradient(ellipse at 50% 100%, ${alfa(T.amber, V.luz)}, ${alfa(T.amber, 0)} 70%)`, ...(vivo ? atraso(C.luz.de) : null) }} />
      {/* o rolar é por fora e a coluna por dentro: num flex-col que rola, os
          filhos encolhem para caber, e o medalhão media 92 px em vez de 262 */}
      <div className="relative h-full tv-scroll overflow-y-auto">
      <div className="flex flex-col items-center" style={{ padding: V.enchimento, gap: FICHA_CARTA.folga }}>
        <MedalhaoDaCerimonia p={p} nivel={nv} gemaNova={gemaNova} vivo={vivo} lex={lex} />
        <div className={`flex flex-col items-center ${vivo ? "tv-cerimonia-numero" : ""}`} style={vivo ? atraso(C.numero.de) : undefined}>
          <span className="tv-titulo uppercase" style={{ color: T.amberSoft, fontSize: V.rotulo, letterSpacing: `${V.espacoDoRotulo}em` }}>Nível</span>
          <span className="tv-titulo" style={{ color: T.amber, fontSize: V.numero, lineHeight: 1 }}>{nv}</span>
        </div>
        {gemaNova && nomeDaSubclasse ? (
          <span className={`tv-display ${vivo ? "tv-cerimonia-ganho" : ""}`} style={{ color: T.amberSoft, fontSize: TIPOS.titulo, ...(vivo ? atraso(C.gema.de) : null) }}>{nomeDaSubclasse}</span>
        ) : null}
        <p className="tv-mono flex flex-wrap justify-center" style={{ color: T.ink, fontSize: TIPOS.maquina, maxWidth: V.largura, columnGap: FICHA_CARTA.folga }}>
          {linhasDosGanhos.map((g, i) => (
            <span key={g.id || i} className={vivo ? "tv-cerimonia-ganho" : ""} style={vivo ? atraso(C.ganhos.de + i * C.ganhos.passo) : undefined}>
              {textoDoGanho(g)}
            </span>
          ))}
        </p>
        <div ref={primeiroDisco} className={`w-full flex flex-col items-center ${vivo ? "tv-cerimonia-escolha" : estado === "saltou" ? "tv-cerimonia-esvai" : ""}`}
          style={{ maxWidth: V.largura, gap: FICHA_CARTA.folga, pointerEvents: vivo ? "none" : "auto", ...(vivo ? atraso(C.escolha.de) : null) }}
          onAnimationEnd={(e) => { if (e.target === e.currentTarget && vivo) setEstado("acabou"); }}>
          {quantos > 0 ? (
            <>
              <div className="text-center">
                <h2 className="tv-titulo" style={{ color: T.ink, fontSize: TIPOS.titulo }}>{quantos === 1 ? "Um ponto de atributo" : `${quantos} pontos de atributo`}</h2>
                <p className="tv-body" style={{ color: T.inkDim, fontSize: TIPOS.corpo }}>Toque num disco; toque outra vez para desfazer.</p>
              </div>
              <div className="grid w-full justify-items-center" style={{ gridTemplateColumns: `repeat(${FICHA_CARTA.colunas}, 1fr)`, rowGap: FICHA_CARTA.folga }}>
                {ATRIBUTOS.map((a) => {
                  const antesV = Math.max(0, Number((base.atributos || {})[a.id]) || 0);
                  const depoisV = Math.max(0, Number((plano.pers.atributos || {})[a.id]) || 0);
                  const ganhou = escolhas.includes(a.id) && depoisV > antesV;
                  let chk = { pode: false, custo: 0 };
                  try { chk = podeSubirAtributo(plano.pers, a.id); } catch (e) { /* só mostra */ }
                  const noTeto = !ganhou && antesV >= teto;
                  const linha = ganhou ? `${sinal(antesV)} → ${sinal(depoisV)}` : noTeto ? "no teto" : chk.custo ? `custa ${chk.custo}` : "";
                  return (
                    <Disco key={a.id} atributo={a.id} valor={sinal(depoisV)} rotulo={a.nome} linha={linha}
                      estado={ganhou ? "ganhou" : noTeto ? "teto" : "repouso"} degrau={degrauDaMoldura(nv)}
                      aoTocar={ganhou || chk.pode ? () => tocar(a.id) : null} />
                  );
                })}
              </div>
              <div className="w-full flex flex-col gap-2">
                <Botao corpo primario desativado={!plano.linhas.length} onClick={() => { if (plano.linhas.length) confirmar(); }}>{rotuloDoConfirmar(plano.linhas)}</Botao>
                <Botao corpo onClick={() => { try { aoGastarDepois(); } catch (e) { /* nunca custa o turno */ } }}>Gastar depois</Botao>
              </div>
            </>
          ) : (
            <Botao corpo primario onClick={() => { try { aoFechar(); } catch (e) { /* idem */ } }}>Continuar</Botao>
          )}
        </div>
        {vivo ? <span className="tv-mono" style={{ color: T.inkDim, fontSize: TIPOS.maquina }}>Toque para saltar</span> : null}
      </div>
      </div>
    </div>
  );
}
