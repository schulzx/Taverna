/* ============================================================
   O HERÓI — A FICHA COMO CARTA (AAA · 05/11/2026) — formas.md §AAA §2
   Figma: Ficha · carta · 375 (255:113) e O herói · 1280 (257:1110).

   A carta é a ficha: o retrato na janela em arco, o nível e a CA nos
   cantos, a gema no fecho, o selo na base, as marcas no aro. O nome em
   Cinzel; a classe e a subclasse em amberSoft; a marca da subclasse; os
   atributos em discos com ícone (o aro no metal do degrau — a ficha sobe
   de degrau com o herói); PV e PM em barras, o XP numa linha âmbar; e
   «N pontos por gastar» em moldura âmbar quando os há — a porta da
   subida para quem a adiou: tocar num disco põe um ponto, pelo preço que
   o disco diz por baixo.

   375: duas abas, Ficha e Equipamento (não cabem as duas). 1280: uma tela
   só, em três colunas — a carta, a ficha, o equipamento —, e ver a ficha e
   trocar uma peça custa zero trocas de aba.

   Aqui só se pinta: a conta dos pontos é de atributos.js; a CA de
   combate.js; a moldura de moldura.js. Tudo chega por props.
   ============================================================ */
import React from "react";
import { T, XP_POR_NIVEL } from "./constantes.js";
import { FICHA_CARTA, VB_DA_MOLDURA, TIPOS, ALVOS, TAMANHOS_DA_MOLDURA } from "./estilo.js";
import { Botao, useMesa } from "./ui.jsx";
import { Disco } from "./painel-moldura.jsx";
import { PainelEquipamento, RostoNaMoldura, caDoHeroi } from "./painel-equipamento.jsx";
import { molduraDe } from "./moldura.js";
import { marcaDe } from "./marca-da-subclasse.js";
import { PERICIAS } from "./pericias.js";
import { pontosAtributoDisponiveis } from "./atributos.js";
import { discosDaFicha } from "./subida-de-nivel.js";

/* a barra de PV, PM ou XP */
function Barra({ rotulo, atual, max, cor }) {
  const pct = Math.max(0, Math.min(100, ((Number(atual) || 0) / (Number(max) || 1)) * 100));
  return (
    <div>
      <div className="flex items-baseline justify-between tv-mono" style={{ fontSize: TIPOS.maquina, color: T.inkDim }}>
        <span>{rotulo}</span><span>{atual ?? 0} / {max ?? 0}</span>
      </div>
      <div className="rounded-full overflow-hidden" style={{ height: FICHA_CARTA.barra, background: T.panel, marginTop: FICHA_CARTA.barra / 2 }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: cor }} />
      </div>
    </div>
  );
}

/* QUEM É: o nome, a classe e a subclasse, o nível e a raça */
function QuemE({ p, tamanho, centro = false }) {
  let sub = null;
  try { const m = marcaDe(p); sub = m ? m.subclasse : null; } catch (e) { sub = null; }
  return (
    <div className={centro ? "text-center" : ""}>
      <div className="tv-titulo leading-tight" style={{ color: T.ink, fontSize: tamanho }}>{p.nome}</div>
      <div className="tv-display" style={{ color: T.amberSoft, fontSize: TIPOS.corpo }}>{[p.classe, sub].filter(Boolean).join(" · ")}</div>
      <div className="tv-mono" style={{ color: T.inkDim, fontSize: TIPOS.maquina }}>Nível {p.nivel || 1}{p.raca ? ` · ${p.raca}` : ""}</div>
    </div>
  );
}

/* A CARTA com o nome na placa (a mesa, §2): o texto pousa no rect da placa
   da carta (FICHA_CARTA.placa, em unidades da carta) */
function CartaComPlaca({ p, largura, lex }) {
  const vb = VB_DA_MOLDURA.carta, k = largura / TAMANHOS_DA_MOLDURA.carta.largura, pl = FICHA_CARTA.placa;
  return (
    <div className="relative shrink-0" style={{ width: vb[2] * k, height: vb[3] * k }}>
      <RostoNaMoldura personagem={p} tamanho="carta" aro={largura} lex={lex} />
      <div className="absolute flex items-center justify-center" style={{ left: (pl.x - vb[0]) * k, top: (pl.y - vb[1]) * k, width: pl.largura * k, height: pl.altura * k }}>
        <QuemE p={p} tamanho={FICHA_CARTA.nome.mesa} centro />
      </div>
    </div>
  );
}

/* A MARCA DA SUBCLASSE: a perícia que ela treina e o que diz */
function LinhaDaMarca({ p }) {
  let m = null;
  try { m = marcaDe(p); } catch (e) { m = null; }
  if (!m) return null;
  const per = (PERICIAS.find((x) => x.id === m.pericia) || {}).nome || m.pericia;
  return <p className="tv-body italic" style={{ color: T.inkDim, fontSize: TIPOS.rotulo }}>Marca {m.subclasse}: {m.diz} — treina {per}.</p>;
}

/* OS ATRIBUTOS: seis discos em 3 × 2 e, se há pontos, a moldura âmbar */
function Atributos({ p, aoSubirAtributo }) {
  let degrau = "ferro";
  try { degrau = molduraDe(p).degrau; } catch (e) { degrau = "ferro"; }
  const discos = discosDaFicha(p);
  let pontos = 0;
  try { pontos = pontosAtributoDisponiveis(p); } catch (e) { pontos = 0; }
  return (
    <section aria-label="Atributos" className="flex flex-col" style={{ gap: FICHA_CARTA.folga }}>
      <h3 className="tv-titulo uppercase" style={{ color: T.inkDim, fontSize: FICHA_CARTA.texto.nota, letterSpacing: "0.12em" }}>Atributos</h3>
      <div className="grid justify-items-center" style={{ gridTemplateColumns: `repeat(${FICHA_CARTA.colunas}, 1fr)`, rowGap: FICHA_CARTA.folga }}>
        {discos.map((d) => (
          <Disco key={d.id} atributo={d.id} valor={d.texto} rotulo={d.nome} linha={d.linha} estado={d.estado} degrau={degrau}
            aoTocar={d.aceita && aoSubirAtributo ? () => { try { aoSubirAtributo(d.id); } catch (e) { /* o App avisa */ } } : null} />
        ))}
      </div>
      {pontos > 0 ? (
        <div className="rounded-xl" style={{ border: `1px solid ${T.amber}`, padding: FICHA_CARTA.folga * 0.75 }}>
          <div className="tv-body" style={{ color: T.amberSoft, fontSize: TIPOS.corpo }}>{pontos} {pontos === 1 ? "ponto de atributo" : "pontos de atributo"} por gastar</div>
          <div className="tv-body" style={{ color: T.inkDim, fontSize: TIPOS.rotulo }}>Toque num disco para pôr um ponto</div>
        </div>
      ) : null}
    </section>
  );
}

function Vitais({ p }) {
  const nivel = p.nivel || 1;
  let xpMax = 0;
  try { xpMax = XP_POR_NIVEL(nivel); } catch (e) { xpMax = 0; }
  return (
    <div className="flex flex-col" style={{ gap: FICHA_CARTA.folga * 0.75 }}>
      <Barra rotulo="PV" atual={p.vida} max={p.vidaMax} cor={T.danger} />
      <Barra rotulo="PM" atual={p.mana} max={p.manaMax} cor={T.violet} />
      <Barra rotulo="XP" atual={p.xp || 0} max={xpMax} cor={T.amber} />
    </div>
  );
}

/* O PAINEL. Props, por extenso:
   · personagem — a ficha (atributos, pontosAtr, vida/vidaMax, mana/manaMax,
     xp, nivel, classe, raca, equipados, inventario, feitos);
   · emCombate, aoEquipar(item, slot), aoDesequipar(slot) — passam ao
     PainelEquipamento;
   · aoSubirAtributo(attrId) — um ponto num atributo (o subirAtributo do App);
   · aoFechar — a seta do telefone e o «Fechar» da mesa;
   · lex, limite (a mochila), aba ("ficha" | "equipamento", no telefone). */
export function PainelFichaCarta({ personagem, emCombate = false, aoEquipar, aoDesequipar, aoSubirAtributo = null, aoFechar = null, lex = null, limite = null, aba = "ficha" }) {
  const p = personagem || {};
  const mesa = useMesa();
  const [qual, setQual] = React.useState(aba === "equipamento" ? "equipamento" : "ficha");
  const ca = caDoHeroi(p);
  const equipamento = <PainelEquipamento personagem={p} emCombate={emCombate} aoEquipar={aoEquipar} aoDesequipar={aoDesequipar} limite={limite} lex={lex} />;

  if (mesa) {
    const M = FICHA_CARTA.mesa;
    return (
      <section aria-label="O herói" className="flex flex-col" style={{ gap: FICHA_CARTA.folga }}>
        <header className="flex items-center justify-between" style={{ borderBottom: `1px solid ${T.line}`, paddingBottom: FICHA_CARTA.folga / 2 }}>
          <h2 className="tv-titulo uppercase" style={{ color: T.inkDim, fontSize: FICHA_CARTA.texto.nota, letterSpacing: "0.16em" }}>O herói</h2>
          {aoFechar ? <Botao pequeno onClick={aoFechar}>Fechar</Botao> : null}
        </header>
        <div className="grid items-start" style={{ gridTemplateColumns: M.colunas.join(" "), gap: M.folga }}>
          <div className="flex flex-col items-center" style={{ gap: FICHA_CARTA.folga }}>
            <CartaComPlaca p={p} largura={FICHA_CARTA.carta.mesa} lex={lex} />
            <LinhaDaMarca p={p} />
          </div>
          <div className="flex flex-col" style={{ gap: FICHA_CARTA.folga * 1.5 }}>
            <Vitais p={p} />
            <Atributos p={p} aoSubirAtributo={aoSubirAtributo} />
            {ca != null ? <p className="tv-mono" style={{ color: T.ink, fontSize: TIPOS.maquina }}>CA {ca}</p> : null}
          </div>
          <div style={{ borderLeft: `1px solid ${T.line}`, paddingLeft: M.folga / 2 }}>{equipamento}</div>
        </div>
      </section>
    );
  }

  const aba_ = (id, nome) => (
    <button type="button" role="tab" aria-selected={qual === id} onClick={() => setQual(id)}
      className="flex-1 tv-display" style={{ minHeight: ALVOS.piso, fontSize: TIPOS.corpo, color: qual === id ? T.amber : T.inkDim, borderBottom: `2px solid ${qual === id ? T.amber : T.line}` }}>
      {nome}
    </button>
  );
  return (
    <section aria-label="O herói" className="flex flex-col" style={{ gap: FICHA_CARTA.folga }}>
      <header className="flex items-center" style={{ gap: FICHA_CARTA.folga / 2 }}>
        {aoFechar ? <button type="button" onClick={aoFechar} aria-label="Voltar" className="tv-mono" style={{ minWidth: ALVOS.piso, minHeight: ALVOS.piso, color: T.ink }}>{"‹"}</button> : null}
        <h2 className="tv-titulo" style={{ color: T.ink, fontSize: TIPOS.titulo }}>{p.nome}</h2>
      </header>
      <div role="tablist" className="flex">{aba_("ficha", "Ficha")}{aba_("equipamento", "Equipamento")}</div>
      {qual === "equipamento" ? equipamento : (
        <>
          <div className="flex items-start" style={{ gap: FICHA_CARTA.folga * 0.75 }}>
            <RostoNaMoldura personagem={p} tamanho="carta" aro={FICHA_CARTA.carta.telefone} lex={lex} />
            <div className="flex-1 min-w-0 flex flex-col" style={{ gap: FICHA_CARTA.folga * 0.75 }}>
              <QuemE p={p} tamanho={FICHA_CARTA.nome.telefone} />
              <Vitais p={p} />
            </div>
          </div>
          <LinhaDaMarca p={p} />
          <Atributos p={p} aoSubirAtributo={aoSubirAtributo} />
        </>
      )}
    </section>
  );
}
