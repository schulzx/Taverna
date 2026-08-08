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
import { CLASSES, classePorNome, arvoreDaClasse, arvoreDaSubclasse, ranksDoPersonagem, pontosDisponiveis, pontosTotais, pontosNoNivel, custoRespec, subclasseEscolhida, podeEscolherSubclasse, RANK_PARA_SUBCLASSE, habilidadesDaSubclasse, arvoreDaEspecializacao, especializacaoEscolhida, podeEscolherEspecializacao, especializacoesDaSubclasse, habilidadesDaEspecializacao, RANK_PARA_ESPECIALIZACAO, DEGRAUS_ESPECIALIZACAO } from "./classes.js";
import { tabelaDeAtributos, pontosAtributoDisponiveis, pontosAtributoNoNivel, pontosAtributoTotais, tetoAtributo, conselhoDeBuild, custoDoDegrau } from "./atributos.js";

export function PainelTalentos({ personagem, onAprender, onRespec, onEscolherSubclasse, onEscolherEspecializacao, onSubirAtributo, onRespecAtributos, grupo = [] }) {
  const [abaClasse, setAbaClasse] = React.useState(personagem.classe || (CLASSES[0] && CLASSES[0].nome));
  const [aba, setAba] = React.useState("talentos");
  const [confirmarRespec, setConfirmarRespec] = React.useState(false);
  const [confirmarRespecAtr, setConfirmarRespecAtr] = React.useState(false);

  const ranks = ranksDoPersonagem(personagem);
  const pontos = pontosDisponiveis(personagem);
  const abertas = Object.keys(ranks);
  const custo = custoRespec(personagem.nivel || 1);
  const podeRespec = (personagem.moedas || 0) >= custo;
  const pontosAtr = pontosAtributoDisponiveis(personagem);

  /* a mesma fileira de abas em todas as telas do painel */
  const abas = (
    <div className="flex gap-1.5 flex-wrap">
      {[["talentos", "Habilidades"], ["atributos", `Atributos${pontosAtr > 0 ? ` (${pontosAtr})` : ""}`], ["grupo", "Do grupo"]].map(([id, rot]) => (
        <button key={id} onClick={() => setAba(id)} className="tv-mono text-[10px] px-2.5 py-1.5 rounded-full"
          style={aba === id
            ? { background: T.amber, color: T.onAccent, fontWeight: 600, border: `1px solid ${T.amber}` }
            : { background: T.panelSoft, color: id === "atributos" && pontosAtr > 0 ? T.amberSoft : T.inkDim, border: `1px solid ${id === "atributos" && pontosAtr > 0 ? T.amber : T.line}` }}>
          {rot}
        </button>
      ))}
    </div>
  );

  /* ---- ATRIBUTOS: onde a multiclasse deixa de ser cosmética ---- */
  if (aba === "atributos") {
    const linhas = tabelaDeAtributos(personagem);
    const teto = tetoAtributo(personagem.nivel || 1);
    const conselho = conselhoDeBuild(personagem);
    return (
      <>
        {abas}
        <div className="rounded-xl px-4 py-3" style={{ background: T.panelSoft, border: `1px solid ${pontosAtr > 0 ? T.amber : T.line}` }}>
          <div className="flex items-center justify-between gap-2">
            <span className="tv-mono text-[10px] uppercase tracking-widest" style={{ color: T.inkDim }}>Pontos de atributo</span>
            <span className="tv-display text-2xl" style={{ color: pontosAtr > 0 ? T.amber : T.inkDim }}>{pontosAtr}</span>
          </div>
          <div className="tv-body text-xs mt-1" style={{ color: T.inkDim }}>
            Cada nível rende {pontosAtributoNoNivel(Math.max(2, personagem.nivel || 2))} pontos — {pontosAtributoTotais(personagem.nivel || 1)} acumulados no nível {personagem.nivel || 1}.
            Subir custa mais conforme o degrau: até +3 custa 1, +4 e +5 custam 2, +6 e +7 custam 3, +8 custa 4.
            O teto do seu nível é <b style={{ color: T.amberSoft }}>+{teto}</b> (sobe no 10, no 15 e no 20). Levar os seis ao máximo nunca cabe: escolher é a graça.
          </div>
        </div>

        {conselho && (
          <div className="rounded-xl p-3" style={{ background: T.panelSoft, border: `1px dashed ${T.violet}` }}>
            <div className="tv-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: T.violetSoft }}>Sua build</div>
            <div className="tv-body text-xs" style={{ color: T.inkDim }}>{conselho}</div>
          </div>
        )}

        <div className="space-y-1.5">
          {linhas.map((l) => (
            <div key={l.id} className="rounded-xl px-3 py-2.5" style={{ background: T.panelSoft, border: `1px solid ${l.chave ? T.amber : T.line}` }}>
              <div className="flex items-baseline justify-between gap-2">
                <span className="tv-display text-base" style={{ color: T.ink }}>
                  {l.chave ? "★ " : ""}{l.nome}
                </span>
                <span className="tv-mono text-sm font-semibold" style={{ color: l.valor >= l.teto ? T.ok : T.amber }}>+{l.valor}<span className="text-[9px]" style={{ color: T.inkDim }}> / {l.teto}</span></span>
              </div>
              <div className="tv-body text-xs mt-0.5" style={{ color: T.inkDim }}>
                {l.desc}{l.chave ? ` — rege as habilidades de ${l.classesQueUsam.join(" e ")}.` : ""}
              </div>
              {l.pode ? (
                <button onClick={() => onSubirAtributo && onSubirAtributo(l.id)}
                  className="w-full tv-mono text-[10px] px-3 py-1.5 rounded-lg mt-2"
                  style={{ background: T.amber, color: T.onAccent, fontWeight: 600 }}>
                  +1 · {l.custoProximo} ponto{l.custoProximo > 1 ? "s" : ""}
                </button>
              ) : (
                <div className="tv-mono text-[10px] mt-1.5" style={{ color: T.inkDim }}>{l.motivo}</div>
              )}
            </div>
          ))}
        </div>

        <div className="rounded-xl p-3" style={{ background: T.panelSoft, border: `1px solid ${T.line}` }}>
          <div className="tv-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: T.inkDim }}>Redistribuir atributos</div>
          <div className="tv-body text-xs mb-2" style={{ color: T.inkDim }}>
            Volta tudo à ficha de criação e devolve os {pontosAtributoTotais(personagem.nivel || 1)} pontos. Custa ◉ {custo} — você tem ◉ {personagem.moedas || 0}.
          </div>
          {!confirmarRespecAtr ? (
            <button onClick={() => setConfirmarRespecAtr(true)} disabled={!podeRespec}
              className="w-full tv-mono text-[10px] px-3 py-2 rounded-lg"
              style={{ border: `1px solid ${T.danger}`, color: T.danger, opacity: podeRespec ? 1 : 0.45 }}>
              ⟲ redistribuir atributos
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => { setConfirmarRespecAtr(false); onRespecAtributos && onRespecAtributos(); }} className="flex-1 tv-mono text-[10px] px-3 py-2 rounded-lg" style={{ background: T.danger, color: "#1A0F0D", fontWeight: 600 }}>confirmar ◉ {custo}</button>
              <button onClick={() => setConfirmarRespecAtr(false)} className="flex-1 tv-mono text-[10px] px-3 py-2 rounded-lg" style={{ border: `1px solid ${T.line}`, color: T.inkDim }}>cancelar</button>
            </div>
          )}
        </div>
      </>
    );
  }

  /* ---- habilidades dos companheiros ---- */
  if (aba === "grupo") {
    return (
      <>
        {abas}
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

  /* o mesmo cartão serve para a árvore da classe e a da subclasse */
  const cartaoHabilidades = (lista) => (
    <div className="space-y-1.5">
      {lista.map((h) => {
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
                  aprender · {h.custoPontos} ponto{h.custoPontos > 1 ? "s" : ""}
                </button>
              ) : (
                <div className="tv-mono text-[10px] mt-1.5" style={{ color: T.inkDim }}>{h.motivo}</div>
              )
            )}
          </div>
        );
      })}
    </div>
  );

  /* ---- ESPECIALIZAÇÃO: o terceiro andar (v9.6) ----
     Só aparece depois que a subclasse existe. Ir fundo aqui consome quase
     todo o orçamento de pontos: é a alternativa à multiclasse, não um extra. */
  const blocoEspecializacao = (subEscolhida) => {
    const opcoes = especializacoesDaSubclasse(subEscolhida);
    if (!opcoes.length) return null;
    const escolhida = especializacaoEscolhida(personagem, abaClasse);
    const chk = podeEscolherEspecializacao(personagem, abaClasse);
    if (escolhida) {
      return (
        <>
          <div className="rounded-xl p-3" style={{ background: T.panelSoft, border: `1px solid ${T.ok}` }}>
            <div className="tv-mono text-[10px] uppercase tracking-widest" style={{ color: T.ok }}>Especialização</div>
            <div className="tv-display text-xl" style={{ color: T.ink }}>★ {escolhida}</div>
            <div className="tv-body text-xs mt-0.5" style={{ color: T.inkDim }}>O que você fez tantas vezes que virou seu nome.</div>
          </div>
          {cartaoHabilidades(arvoreDaEspecializacao(personagem, abaClasse))}
        </>
      );
    }
    return (
      <div className="rounded-xl p-3" style={{ background: T.panelSoft, border: `1px solid ${chk.pode ? T.ok : T.line}` }}>
        <div className="tv-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: chk.pode ? T.ok : T.inkDim }}>
          Especialização de {subEscolhida}
        </div>
        {!chk.pode ? (
          <div className="tv-body text-xs" style={{ color: T.inkDim }}>
            Abre com {RANK_PARA_ESPECIALIZACAO} degraus de {abaClasse} — {chk.motivo}. É o terceiro andar: três habilidades exclusivas nos degraus {DEGRAUS_ESPECIALIZACAO.join(", ")}.
            Chegar aqui consome quase todo o seu orçamento de pontos — quem prefere multiclasse não chega, e tudo bem.
          </div>
        ) : (
          <>
            <div className="tv-body text-xs mb-2" style={{ color: T.inkDim }}>
              Você foi fundo o bastante. Escolha o ramo — é para sempre, só a redistribuição desfaz.
            </div>
            <div className="space-y-2">
              {opcoes.map((e) => (
                <button key={e} onClick={() => onEscolherEspecializacao && onEscolherEspecializacao(abaClasse, e)}
                  className="w-full text-left rounded-xl p-3" style={{ background: T.panel, border: `1px solid ${T.ok}` }}>
                  <div className="tv-display text-lg" style={{ color: T.ink }}>{e}</div>
                  <div className="tv-mono text-[10px] mt-1" style={{ color: T.violetSoft }}>
                    {habilidadesDaEspecializacao(e).map((h) => h.nome).join(" · ")}
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <>
      {/* cabeçalho: pontos e degraus por classe */}
      <div className="rounded-xl px-4 py-3" style={{ background: T.panelSoft, border: `1px solid ${pontos > 0 ? T.violet : T.line}` }}>
        <div className="flex items-center justify-between gap-2">
          <span className="tv-mono text-[10px] uppercase tracking-widest" style={{ color: T.inkDim }}>Pontos de habilidade</span>
          <span className="tv-display text-2xl" style={{ color: pontos > 0 ? T.violetSoft : T.inkDim }}>{pontos}</span>
        </div>
        <div className="tv-body text-xs mt-1" style={{ color: T.inkDim }}>
          O ganho <b>acelera</b>: cada nível vale {pontosNoNivel(personagem.nivel || 1)} ponto{pontosNoNivel(personagem.nivel || 1) > 1 ? "s" : ""} agora (1 até o nível 5, 2 até o 10, 3 até o 15, 4 daí em diante) — {pontosTotais(personagem.nivel || 1)} acumulados no nível {personagem.nivel || 1}.
          Gastar custa conforme o degrau: 1–3 custam 1 ponto, 4–7 custam 2, 8+ custam 3. Dá para dominar uma classe e mergulhar fundo noutra — nunca para ter tudo. Habilidade de degrau N exige N−1 degraus naquela classe; com {RANK_PARA_SUBCLASSE} degraus abre a subclasse.
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

      {abas}

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
      {cartaoHabilidades(arvore)}

      {/* ---- SUBCLASSE: o segundo andar ---- */}
      {(() => {
        const c = classePorNome(abaClasse);
        if (!c || !(c.subclasses || []).length) return null;
        const escolhida = subclasseEscolhida(personagem, abaClasse);
        const chk = podeEscolherSubclasse(personagem, abaClasse);
        if (escolhida) {
          const ficha = c.subclasses.find((s) => s.nome === escolhida);
          return (
            <>
              <div className="rounded-xl p-3" style={{ background: T.panelSoft, border: `1px solid ${T.amber}` }}>
                <div className="tv-mono text-[10px] uppercase tracking-widest" style={{ color: T.amberSoft }}>Caminho escolhido</div>
                <div className="tv-display text-xl" style={{ color: T.ink }}>{escolhida}</div>
                {ficha && <div className="tv-body text-xs mt-0.5" style={{ color: T.inkDim }}>{ficha.desc}</div>}
              </div>
              {cartaoHabilidades(arvoreDaSubclasse(personagem, abaClasse))}
              {blocoEspecializacao(escolhida)}
            </>
          );
        }
        return (
          <div className="rounded-xl p-3" style={{ background: T.panelSoft, border: `1px solid ${chk.pode ? T.amber : T.line}` }}>
            <div className="tv-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: chk.pode ? T.amberSoft : T.inkDim }}>
              Subclasse de {abaClasse}
            </div>
            {!chk.pode ? (
              <div className="tv-body text-xs" style={{ color: T.inkDim }}>
                Abre com {RANK_PARA_SUBCLASSE} degraus de {abaClasse} — {chk.motivo}. Cada subclasse traz quatro habilidades próprias, e você segue <b>uma só</b>: escolher é abrir mão do resto.
              </div>
            ) : (
              <>
                <div className="tv-body text-xs mb-2" style={{ color: T.inkDim }}>
                  Escolha o caminho. É para sempre — só a redistribuição desfaz. Cada um abre quatro habilidades exclusivas nos degraus 3, 5, 7 e 9.
                </div>
                <div className="space-y-2">
                  {c.subclasses.map((s) => (
                    <button key={s.nome} onClick={() => onEscolherSubclasse && onEscolherSubclasse(abaClasse, s.nome)}
                      className="w-full text-left rounded-xl p-3" style={{ background: T.panel, border: `1px solid ${T.amber}` }}>
                      <div className="tv-display text-lg" style={{ color: T.ink }}>{s.nome}</div>
                      <div className="tv-body text-xs mt-0.5" style={{ color: T.inkDim }}>{s.desc}</div>
                      <div className="tv-mono text-[10px] mt-1.5" style={{ color: T.violetSoft }}>
                        {habilidadesDaSubclasse(s.nome).map((h) => h.nome).join(" · ")}
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        );
      })()}

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
