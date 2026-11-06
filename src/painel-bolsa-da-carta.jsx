/* ============================================================
   A BOLSA DENTRO DA CARTA (AR1 · 06/11/2026) — mente/pauta.md §Fase AR

   A pessoa, em 05/11: a carta do herói e a Bolsa abriam duas telas que
   faziam o mesmo de formas diferentes, e «Mais da bolsa» abria a gaveta
   antiga. Agora há uma casa só (`PainelFichaCarta`), e o que só a gaveta
   antiga fazia mora aqui, por baixo do boneco e da mochila:

   · o que se leva, item a item, com o verbo de cada um — usar (o
     consumível), o verbo do item (a Reforma dos Itens), dar a um
     companheiro, desmontar em essência, soltar;
   · a sintonia das peças vestidas que a pedem (o poder responde, ou dorme);
   · a bancada e a forja (`oficina`, que o App monta).

   Aqui só se pinta: cada linha chega pronta do App, com as ações já
   embrulhadas em `calou` — quem decide o que um item faz é o motor.
   Linha: { chave, nome, qtd, icone, nota, descricao, acoes: [{ id,
   rotulo, dica, primario, fazer }], dar: { destinos: [nome], fazer(nome) } }.
   ============================================================ */
import React from "react";
import { T } from "./constantes.js";
import { FICHA_CARTA, TIPOS, ALVOS } from "./estilo.js";
import { Glifo } from "./ui.jsx";

const F = FICHA_CARTA.folga;

/* o controle miúdo da linha: alvo de piso, a forma do Botao da casa */
function Acao({ a }) {
  return (
    <button type="button" title={a.dica || undefined} onClick={() => { try { a.fazer(); } catch (e) { /* o App avisa */ } }}
      className="tv-mono tv-anel-foco rounded-lg" style={{ minHeight: ALVOS.piso, paddingLeft: F * 0.75, paddingRight: F * 0.75, fontSize: TIPOS.maquina, fontWeight: 600,
        background: a.primario ? T.amber : "transparent", color: a.primario ? T.onAccent : T.inkDim, border: a.primario ? "none" : `1px solid ${T.lineStrong}` }}>
      {a.rotulo}
    </button>
  );
}

function Dar({ dar, nome }) {
  if (!dar || !Array.isArray(dar.destinos) || !dar.destinos.length) return null;
  return (
    <select value="" aria-label={`Dar ${nome} a`} onChange={(e) => { const v = e.target.value; if (v) { try { dar.fazer(v); } catch (er) { /* o App avisa */ } } }}
      className="tv-mono tv-anel-foco rounded-lg" style={{ minHeight: ALVOS.piso, paddingLeft: F / 2, paddingRight: F / 2, fontSize: TIPOS.maquina, background: T.panel, color: T.violetSoft, border: `1px solid ${T.lineStrong}` }}>
      <option value="">Dar a…</option>
      {dar.destinos.map((d) => <option key={d} value={d}>{d}</option>)}
    </select>
  );
}

function Titulo({ children, direita = null }) {
  return (
    <div className="flex items-baseline justify-between">
      <h3 className="tv-titulo uppercase" style={{ color: T.inkDim, fontSize: FICHA_CARTA.texto.nota, letterSpacing: "0.12em" }}>{children}</h3>
      {direita}
    </div>
  );
}

export function BolsaDaCarta({ itens = [], moedas = null, essencia = null, sintonia = [], oficina = null, vazio = "Bolsos vazios." }) {
  const lista = Array.isArray(itens) ? itens : [];
  return (
    <section aria-label="O que se leva" className="flex flex-col" style={{ gap: F }}>
      <Titulo direita={moedas != null || essencia != null ? (
        <span className="tv-mono inline-flex items-center" style={{ gap: F / 2, color: T.amberSoft, fontSize: TIPOS.maquina }}>
          {moedas != null ? <span className="inline-flex items-center" style={{ gap: F / 4 }}><Glifo nome="moeda" tamanho={TIPOS.maquina} rotulo="moedas" />{moedas}</span> : null}
          {essencia != null ? <span className="inline-flex items-center" style={{ gap: F / 4, color: T.violetSoft }}><Glifo nome="essencia" tamanho={TIPOS.maquina} rotulo="essência" />{essencia}</span> : null}
        </span>
      ) : null}>O que se leva</Titulo>
      {lista.length === 0 ? <p className="tv-body italic" style={{ color: T.inkDim, fontSize: TIPOS.rotulo }}>{vazio}</p> : (
        <ul className="flex flex-col" style={{ gap: F / 2 }}>
          {lista.map((it) => (
            <li key={it.chave} className="rounded-lg" style={{ background: T.panelSoft, padding: F * 0.75 }}>
              <div className="tv-body flex items-start" style={{ gap: F / 2, color: T.ink, fontSize: TIPOS.corpo }}>
                <span aria-hidden="true" className="shrink-0" style={{ color: T.amber }}>{it.icone || <Glifo nome="bolsa" tamanho={TIPOS.corpo} />}</span>
                <span className="flex-1 min-w-0" style={{ overflowWrap: "anywhere" }}>{it.nome}{it.qtd > 1 ? <span className="tv-mono" style={{ color: T.amberSoft, fontSize: TIPOS.maquina }}> ×{it.qtd}</span> : null}</span>
              </div>
              {it.nota ? <div className="tv-mono" style={{ color: T.violetSoft, fontSize: TIPOS.maquina, marginTop: F / 4 }}>{it.nota}</div> : null}
              {it.descricao ? <div className="tv-body italic" style={{ color: T.inkDim, fontSize: TIPOS.rotulo, marginTop: F / 4 }}>{it.descricao}</div> : null}
              {(it.acoes && it.acoes.length) || it.dar ? (
                <div className="flex flex-wrap items-center" style={{ gap: F / 2, marginTop: F / 2 }}>
                  {(it.acoes || []).map((a) => <Acao key={a.id} a={a} />)}
                  <Dar dar={it.dar} nome={it.nome} />
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
      {Array.isArray(sintonia) && sintonia.length ? (
        <div className="flex flex-col" style={{ gap: F / 4 }}>
          <Titulo>Sintonia</Titulo>
          {sintonia.map((s) => (
            <p key={s.nome} className="tv-mono" title={s.dica || undefined} style={{ color: s.ligado ? T.ok : T.inkDim, fontSize: TIPOS.maquina }}>
              {s.ligado ? <Glifo nome="faisca" tamanho={TIPOS.maquina} /> : "○"} {s.nome} — {s.ligado ? "o poder responde" : "dorme: é só metal enquanto não sintonizar"}
            </p>
          ))}
        </div>
      ) : null}
      {oficina ? (
        <div className="flex flex-col" style={{ gap: F / 2 }}>
          <Titulo>A bancada</Titulo>
          {oficina}
        </div>
      ) : null}
    </section>
  );
}
