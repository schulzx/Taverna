/* ============================================================
   PAINEL TALENTOS (v9.2) — a árvore, os pontos e a multiclasse

   Antes o jogador escolhia uma habilidade na hora de subir de
   nível e nunca mais via a lista inteira: não dava para saber o
   que existia à frente, nem trocar uma escolha ruim, nem investir
   numa segunda classe.

   Aqui ele vê tudo: quanto tem em cada classe, o que está
   destravado, o que falta para o próximo degrau, e pode abrir
   outra classe quando quiser. A regra é uma só — habilidade de
   nível N exige N−1 degraus naquela classe.
   ============================================================ */
import React from "react";
import { T } from "./constantes.js";
import { CLASSES, classePorNome, arvoreDaClasse, ranksDoPersonagem, pontosDisponiveis, custoRespec } from "./classes.js";

export function PainelTalentos({ personagem, onAprender, onRespec, grupo = [] }) {
  const [abaClasse, setAbaClasse] = React.useState(personagem.classe || (CLASSES[0] && CLASSES[0].nome));
  const [verGrupo, setVerGrupo] = React.useState(false);
  const [confirmarRespec, setConfirmarRespec] = React.useState(false);

  const ranks = ranksDoPersonagem(personagem);
  const pontos = pontosDisponiveis(personagem);
  const abertas = Object.keys(ranks);
  const custo = custoRespec(personagem.nivel || 1);
  const podeRespec = (personagem.moedas || 0) >= custo;

  /* ---- habilidades dos companheiros ---- */
  if (verGrupo) {
    return (
      <>
        <div className="flex gap-1.5">
          <button onClick={() => setVerGrupo(false)} className="tv-mono text-[10px] px-2.5 py-1.5 rounded-full" style={{ background: T.panelSoft, color: T.inkDim, border: `1px solid ${T.line}` }}>← minhas</button>
          <span className="tv-mono text-[10px] px-2.5 py-1.5 rounded-full" style={{ background: T.amber, color: T.onAccent, fontWeight: 600 }}>Do grupo</span>
        </div>
        {!grupo.length ? (
          <div className="tv-body text-sm italic" style={{ color: T.inkDim }}>Você viaja sozinho. Companheiros trazem as próprias habilidades — e o sistema joga com elas.</div>
        ) : grupo.map((c) => (
          <div key={c.nome} className="rounded-xl p-3" style={{ background: T.panelSoft, border: `1px solid ${T.line}` }}>
            <div className="flex items-baseline justify-between gap-2 flex-wrap">
              <span className="tv-display text-lg" style={{ color: T.ink }}>{c.nome}</span>
              <span className="tv-mono text-[10px]" style={{ color: T.amberSoft }}>{c.classe || "aventureiro"} · nv {c.nivel || 1}</span>
            </div>
            <div className="tv-mono text-[10px] mb-2" style={{ color: T.inkDim }}>
              {c.vida}/{c.vidaMax} PV{c.manaMax ? ` · ${c.mana != null ? c.mana : c.manaMax}/${c.manaMax} PM` : ""}
            </div>
            {!(c.habilidades || []).length ? (
              <div className="tv-body text-xs italic" style={{ color: T.inkDim }}>Sem habilidades registradas ainda.</div>
            ) : (
              <div className="space-y-1.5">
                {(c.habilidades || []).map((h, i) => {
                  const nome = typeof h === "string" ? h : h.nome;
                  const desc = typeof h === "object" ? h.descricao : "";
                  const custoH = typeof h === "object" ? h.custo : null;
                  return (
                    <div key={i} className="rounded-lg px-2.5 py-1.5" style={{ background: T.panel, border: `1px solid ${T.line}` }}>
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="tv-body text-sm" style={{ color: T.ink }}>{nome}</span>
                        {custoH != null && <span className="tv-mono text-[9px] shrink-0" style={{ color: T.violetSoft }}>{custoH} PM</span>}
                      </div>
                      {desc && <div className="tv-body text-xs" style={{ color: T.inkDim }}>{desc}</div>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
        <div className="tv-body text-xs" style={{ color: T.inkDim }}>
          O sistema joga por eles em combate: curam quem está caindo, dão buff no começo da luta e usam a magia certa. O Mestre só narra o que aconteceu.
        </div>
      </>
    );
  }

  const arvore = arvoreDaClasse(personagem, abaClasse);
  const rankAtual = ranks[abaClasse] || 0;

  return (
    <>
      {/* cabeçalho: pontos e degraus por classe */}
      <div className="rounded-xl px-4 py-3" style={{ background: T.panelSoft, border: `1px solid ${pontos > 0 ? T.violet : T.line}` }}>
        <div className="flex items-center justify-between gap-2">
          <span className="tv-mono text-[10px] uppercase tracking-widest" style={{ color: T.inkDim }}>Pontos de habilidade</span>
          <span className="tv-display text-2xl" style={{ color: pontos > 0 ? T.violetSoft : T.inkDim }}>{pontos}</span>
        </div>
        <div className="tv-body text-xs mt-1" style={{ color: T.inkDim }}>
          Um por nível. Gaste onde quiser: aprofunde a sua classe ou abra outra — habilidade de nível N exige N−1 degraus naquela classe.
        </div>
        {abertas.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {abertas.map((cl) => (
              <span key={cl} className="tv-mono text-[10px] px-2 py-0.5 rounded-full" style={{ border: `1px solid ${cl === personagem.classe ? T.amber : T.violet}`, color: cl === personagem.classe ? T.amberSoft : T.violetSoft }}>
                {cl} {ranks[cl]}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-1.5">
        <span className="tv-mono text-[10px] px-2.5 py-1.5 rounded-full" style={{ background: T.amber, color: T.onAccent, fontWeight: 600 }}>Minhas</span>
        <button onClick={() => setVerGrupo(true)} className="tv-mono text-[10px] px-2.5 py-1.5 rounded-full" style={{ background: T.panelSoft, color: T.inkDim, border: `1px solid ${T.line}` }}>Do grupo →</button>
      </div>

      {/* seletor de classe: as abertas primeiro, depois as que dá para abrir */}
      <div className="flex flex-wrap gap-1.5">
        {[...abertas, ...CLASSES.map((c) => c.nome).filter((n) => !abertas.includes(n))].map((n) => {
          const nova = !abertas.includes(n);
          return (
            <button key={n} onClick={() => setAbaClasse(n)}
              className="tv-mono text-[10px] px-2.5 py-1.5 rounded-full"
              style={{
                background: abaClasse === n ? T.violet : T.panelSoft,
                color: abaClasse === n ? "#14101F" : nova ? T.inkDim : T.ink,
                border: `1px solid ${abaClasse === n ? T.violet : T.line}`,
                fontWeight: 600, opacity: nova && abaClasse !== n ? 0.6 : 1,
              }}>
              {n}{nova ? " +" : ` ${ranks[n]}`}
            </button>
          );
        })}
      </div>

      {!abertas.includes(abaClasse) && (
        <div className="rounded-xl p-3" style={{ background: T.panelSoft, border: `1px dashed ${T.violet}` }}>
          <div className="tv-body text-sm" style={{ color: T.ink }}>⚔ Abrir <b>{abaClasse}</b> como segunda classe</div>
          <div className="tv-body text-xs mt-1" style={{ color: T.inkDim }}>
            {(classePorNome(abaClasse) || {}).desc} Basta gastar um ponto numa habilidade de nível 1 abaixo — daí em diante você é {personagem.classe} e {abaClasse}.
          </div>
        </div>
      )}

      {/* a árvore */}
      <div className="space-y-1.5">
        {arvore.map((h) => {
          const cor = h.dominada ? T.ok : h.pode ? T.violet : T.line;
          return (
            <div key={h.nome} className="rounded-xl px-3 py-2.5" style={{ background: h.dominada ? T.panel : T.panelSoft, border: `1px solid ${cor}`, opacity: h.dominada || h.pode ? 1 : 0.55 }}>
              <div className="flex items-baseline justify-between gap-2">
                <span className="tv-display text-base" style={{ color: h.dominada ? T.ok : T.ink }}>
                  {h.dominada ? "✓ " : h.pode ? "" : "🔒 "}{h.nome}
                </span>
                <span className="tv-mono text-[9px] shrink-0" style={{ color: T.violetSoft }}>{h.custo} PM · degrau {h.nivel}</span>
              </div>
              <div className="tv-body text-xs mt-0.5" style={{ color: T.inkDim }}>{h.descricao}</div>
              {!h.dominada && (
                h.pode ? (
                  <button onClick={() => onAprender && onAprender(abaClasse, h.nome)}
                    className="w-full tv-mono text-[10px] px-3 py-1.5 rounded-lg mt-2"
                    style={{ background: T.violet, color: "#14101F", fontWeight: 600 }}>
                    aprender · 1 ponto
                  </button>
                ) : (
                  <div className="tv-mono text-[10px] mt-1.5" style={{ color: T.inkDim }}>{h.motivo}</div>
                )
              )}
            </div>
          );
        })}
      </div>

      {/* respec */}
      <div className="rounded-xl p-3" style={{ background: T.panelSoft, border: `1px solid ${T.line}` }}>
        <div className="tv-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: T.inkDim }}>Recomeçar do zero</div>
        <div className="tv-body text-xs mb-2" style={{ color: T.inkDim }}>
          Devolve TODOS os pontos e apaga as habilidades de classe (as únicas e as dádivas ficam). Custa ◉ {custo} — você tem ◉ {personagem.moedas || 0}.
        </div>
        {!confirmarRespec ? (
          <button onClick={() => setConfirmarRespec(true)} disabled={!podeRespec}
            className="w-full tv-mono text-[10px] px-3 py-2 rounded-lg"
            style={{ border: `1px solid ${T.danger}`, color: T.danger, opacity: podeRespec ? 1 : 0.45 }}>
            ⟲ redistribuir tudo
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => { setConfirmarRespec(false); onRespec && onRespec(); }} className="flex-1 tv-mono text-[10px] px-3 py-2 rounded-lg" style={{ background: T.danger, color: "#1A0F0D", fontWeight: 600 }}>confirmar ◉ {custo}</button>
            <button onClick={() => setConfirmarRespec(false)} className="flex-1 tv-mono text-[10px] px-3 py-2 rounded-lg" style={{ border: `1px solid ${T.line}`, color: T.inkDim }}>cancelar</button>
          </div>
        )}
      </div>
    </>
  );
}
