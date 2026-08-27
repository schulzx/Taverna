/* ============================================================
   O PAINEL DA GUILDA (v9.133) — fase 4 do plano

   Tudo o que o motor decide, aqui só se mostra e se aciona. Nenhuma regra
   nasce neste arquivo: se um número parecer errado, o erro está em
   `guildas.js`.

   A tela tem dois estados, e eles são jogos diferentes:

   · SEM CASA — o mundo tem guildas, cada uma com ofício, sede, lema, leis e
     poder. Bater à porta é um ato, e ela pode não abrir. Aqui o painel é uma
     escolha: entrar numa fecha as outras.

   · COM CASA — posto, contribuição, o que falta para o próximo degrau, as
     leis que você jurou, o cofre e quanto dele o seu posto alcança, as
     faltas que já pesam, a guerra se houver. E o trabalho da casa, que é a
     razão de ela existir.
   ============================================================ */
import React from "react";
import { T } from "./constantes.js";
import { Botao } from "./ui.jsx";
import {
  oficioPorId, leisDa, nomeDoPosto, degrauDaCasa, DEGRAUS, resumoDaGuilda,
  podeMandar, podeDelegar, faixaDeAtrito, NIVEL_PARA_FUNDAR, CUSTO_DE_FUNDAR,
  FALTAS_ATE_EXPULSAR, OFICIOS,
} from "./guildas.js";

const Barra = ({ frac, cor }) => (
  <div className="h-1.5 rounded-full overflow-hidden w-full" style={{ background: T.bg }}>
    <div className="h-full rounded-full" style={{ width: `${Math.round(Math.max(0, Math.min(1, frac)) * 100)}%`, background: cor, transition: "width .4s" }} />
  </div>
);

const Rotulo = ({ children, cor }) => (
  <p className="tv-mono text-[9px] uppercase tracking-[0.2em] mb-1.5" style={{ color: cor || T.inkDim }}>{children}</p>
);

function CartaoDaCasa({ g, aoEntrar, motivo }) {
  const of = oficioPorId(g.oficio);
  return (
    <div className="rounded-xl p-3" style={{ background: T.panelSoft, border: `1px solid ${T.line}` }}>
      <div className="flex items-start justify-between gap-2">
        <span className="tv-display text-lg leading-tight" style={{ color: T.ink }}>{of.icone} {g.nome}</span>
        <span className="tv-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0" style={{ border: `1px solid ${T.violet}`, color: T.violetSoft }}>
          poder {g.poder}
        </span>
      </div>
      <div className="tv-body text-xs italic mt-0.5" style={{ color: T.amberSoft }}>“{g.lema}”</div>
      <div className="tv-body text-xs mt-1" style={{ color: T.inkDim }}>{of.o}.</div>
      <div className="tv-mono text-[9px] mt-1.5" style={{ color: T.violetSoft }}>
        sede em {g.sede} · {g.mestre} no comando · {g.membros.length} na casa
      </div>
      <div className="flex flex-wrap gap-1 mt-1.5">
        {leisDa(g).map((l) => (
          <span key={l.id} className="tv-mono text-[9px] px-1.5 py-0.5 rounded" style={{ border: `1px solid ${T.line}`, color: T.inkDim }} title={l.texto(g)}>
            {l.icone} {l.nome}
          </span>
        ))}
      </div>
      {g.guerraCom && <div className="tv-mono text-[9px] mt-1.5" style={{ color: T.danger }}>⚔ em guerra</div>}
      <div className="flex items-center gap-2 mt-2 flex-wrap">
        <button onClick={() => aoEntrar(g)} className="tv-mono text-[10px] px-2 py-1 rounded"
          style={{ border: `1px solid ${motivo ? T.line : T.amber}`, color: motivo ? T.inkDim : T.amberSoft }}>
          ✋ bater à porta
        </button>
        {motivo && <span className="tv-mono text-[9px]" style={{ color: T.inkDim }}>{motivo}</span>}
      </div>
    </div>
  );
}

export function PainelGuilda({
  guildas = [], minha = null, personagem = {}, cidadeAtual = "", tarefas = [], elenco = [],
  aoEntrar, aoSair, aoPegarTrabalho, aoDelegar, aoPromover, aoExpulsar, aoAdmitir,
  aoFundar, aoSacar, aoDepositar, aoPedirPazes, trabalhos = [], motivoDeEntrar,
}) {
  const [verMembros, setVerMembros] = React.useState(false);
  const [formFundar, setFormFundar] = React.useState(false);
  const [fNome, setFNome] = React.useState("");
  const [fOficio, setFOficio] = React.useState("laminas");
  const [delegando, setDelegando] = React.useState(null);
  const [valor, setValor] = React.useState("");

  const r = minha && minha.membro ? resumoDaGuilda(minha) : null;

  /* ---------------- SEM CASA ---------------- */
  if (!r) {
    const nivel = personagem.nivel || 1;
    const podeF = nivel >= NIVEL_PARA_FUNDAR;
    return (
      <div className="space-y-3">
        <div className="tv-body text-xs italic" style={{ color: T.inkDim }}>
          As casas do mundo. Cada uma tem ofício, lei e escada própria — e você só pode servir a uma.
          Entrar vale desde o primeiro dia; fundar a sua é coisa de nível {NIVEL_PARA_FUNDAR}.
        </div>
        {guildas.length === 0 ? (
          <div className="tv-body text-sm italic text-center py-8" style={{ color: T.inkDim }}>
            Nenhuma casa conhecida ainda. Elas ficam nas cidades maiores — viaje, e as portas aparecem.
          </div>
        ) : (
          <div className="space-y-2">
            {guildas.map((g) => <CartaoDaCasa key={g.id} g={g} aoEntrar={aoEntrar} motivo={motivoDeEntrar && motivoDeEntrar(g)} />)}
          </div>
        )}

        <div className="rounded-xl p-3" style={{ background: T.panelSoft, border: `1px solid ${podeF ? T.amber : T.line}` }}>
          <Rotulo cor={podeF ? T.amber : T.inkDim}>A sua própria casa</Rotulo>
          {!podeF ? (
            <div className="tv-body text-xs" style={{ color: T.inkDim }}>
              Nível {NIVEL_PARA_FUNDAR} e ◉ {CUSTO_DE_FUNDAR} abrem as portas de uma casa sua. Você tem nível {nivel}.
              Até lá, sirva numa — é onde se aprende o que uma guilda faz.
            </div>
          ) : !formFundar ? (
            <Botao primario pequeno onClick={() => setFormFundar(true)}>⚑ fundar uma casa · ◉ {CUSTO_DE_FUNDAR}</Botao>
          ) : (
            <div className="space-y-2">
              <input value={fNome} onChange={(e) => setFNome(e.target.value)} placeholder="o nome da casa"
                className="tv-body text-sm w-full rounded-lg px-2 py-1.5"
                style={{ background: T.panel, border: `1px solid ${T.line}`, color: T.ink }} />
              <div className="flex flex-wrap gap-1">
                {OFICIOS.map((o) => (
                  <button key={o.id} onClick={() => setFOficio(o.id)} className="tv-mono text-[10px] px-2 py-1 rounded"
                    style={{ border: `1px solid ${fOficio === o.id ? T.amber : T.line}`, color: fOficio === o.id ? T.amberSoft : T.inkDim }}>
                    {o.icone} {o.nome}
                  </button>
                ))}
              </div>
              <div className="tv-body text-xs" style={{ color: T.inkDim }}>{oficioPorId(fOficio).o}.</div>
              <div className="flex gap-2">
                <Botao primario pequeno desativado={!fNome.trim()} onClick={() => { aoFundar(fNome.trim(), fOficio); setFormFundar(false); }}>abrir as portas</Botao>
                <button onClick={() => setFormFundar(false)} className="tv-mono text-[10px] px-2 py-1 rounded" style={{ border: `1px solid ${T.line}`, color: T.inkDim }}>✕</button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ---------------- COM CASA ---------------- */
  const of = r.oficio;
  const proxExige = r.degrau.i < DEGRAUS.length - 1 ? degrauDaCasa(r.degrau.i + 1).exige : r.contribuicao;
  const anterior = r.degrau.exige;
  const frac = proxExige > anterior ? (r.contribuicao - anterior) / (proxExige - anterior) : 1;
  const mandar = podeMandar(minha);
  const vagas = podeDelegar(minha);
  const fora = (minha.membros || []).filter((m) => m.fora).length;

  return (
    <div className="space-y-3">
      {/* ---- quem você é nesta casa ---- */}
      <div className="rounded-xl p-4" style={{ background: T.panelSoft, border: `1px solid ${r.guerra ? T.danger : T.amber}` }}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="tv-display text-xl leading-tight truncate" style={{ color: T.ink }}>{of.icone} {r.nome}</div>
            <div className="tv-mono text-[10px] uppercase tracking-widest" style={{ color: T.amberSoft }}>
              {r.posto}{r.doJogador ? " · a casa é sua" : ""}
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="tv-mono text-[9px] uppercase tracking-widest" style={{ color: T.inkDim }}>Cofre</div>
            <div className="tv-display text-xl leading-none" style={{ color: T.amber }}>◉ {r.cofre}</div>
          </div>
        </div>

        {/* duas linhas, e nao uma: a descricao do degrau e longa e colidia
            com "faltam N para X" quando as duas dividiam a mesma linha */}
        <div className="mt-2.5">
          {r.proximo && (
            <div className="tv-mono text-[9px] mb-1 text-right" style={{ color: T.amberSoft }}>
              faltam {r.falta} para {r.proximo}
            </div>
          )}
          <Barra frac={frac} cor={T.amber} />
          <div className="tv-mono text-[9px] mt-1" style={{ color: T.inkDim }}>{r.degrau.o}</div>
        </div>

        {r.emProva && (
          <div className="rounded-lg px-2.5 py-2 mt-2.5" style={{ background: T.panel, border: `1px solid ${T.violet}` }}>
            <div className="tv-mono text-[9px] uppercase tracking-widest" style={{ color: T.violetSoft }}>Em prova</div>
            <div className="tv-body text-xs mt-0.5" style={{ color: T.inkDim }}>
              Você está na casa, mas ainda não é da casa. A prova de ingresso está no diário —
              até ela cair, não há trabalho, nem cofre, nem gente às suas ordens.
            </div>
          </div>
        )}
        {r.faltas > 0 && (
          <div className="tv-mono text-[9px] mt-2" style={{ color: r.ateExpulsar <= 3 ? T.danger : T.amberSoft }}>
            ⚠ {r.faltas} falta{r.faltas > 1 ? "s" : ""} anotada{r.faltas > 1 ? "s" : ""} — {r.ateExpulsar} até a porta da rua
          </div>
        )}
        {r.guerra && (
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="tv-mono text-[10px]" style={{ color: T.danger }}>⚔ A casa está em guerra. O trabalho mudou.</span>
            {podeMandar(minha) && (
              <button onClick={aoPedirPazes} className="tv-mono text-[9px] px-2 py-1 rounded" style={{ border: `1px solid ${T.ok}`, color: T.ok }}>🕊 pedir as pazes</button>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <span className="tv-mono text-[9px]" style={{ color: T.inkDim }}>saque até ◉ {r.degrau.saque}</span>
          <input value={valor} onChange={(e) => setValor(e.target.value.replace(/\D/g, ""))} placeholder="0"
            className="tv-mono text-xs rounded px-2 py-1" style={{ background: T.panel, border: `1px solid ${T.line}`, color: T.ink, width: 72 }} />
          <button onClick={() => { aoSacar(Number(valor) || 0); setValor(""); }} className="tv-mono text-[10px] px-2 py-1 rounded"
            style={{ border: `1px solid ${T.amber}`, color: T.amberSoft }}>sacar</button>
          <button onClick={() => { aoDepositar(Number(valor) || 0); setValor(""); }} className="tv-mono text-[10px] px-2 py-1 rounded"
            style={{ border: `1px solid ${T.violet}`, color: T.violetSoft }}>depositar</button>
          {!r.doJogador && (
            <button onClick={aoSair} className="tv-mono text-[9px] px-2 py-1 rounded ml-auto" style={{ border: `1px solid ${T.line}`, color: T.inkDim }}>sair da casa</button>
          )}
        </div>
      </div>

      {/* ---- as leis que você jurou ---- */}
      <div>
        <Rotulo>As leis da casa</Rotulo>
        <div className="space-y-1">
          {leisDa(minha).map((l) => (
            <div key={l.id} className="rounded-lg px-2.5 py-1.5 flex items-baseline gap-2" style={{ background: T.panelSoft, border: `1px solid ${T.line}` }}>
              <span className="tv-mono text-[11px] shrink-0">{l.icone}</span>
              <span className="tv-body text-xs" style={{ color: T.inkDim }}>{l.texto(minha)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ---- o trabalho da casa ---- */}
      <div>
        <Rotulo cor={T.amber}>O trabalho da casa</Rotulo>
        {trabalhos.length === 0 ? (
          <div className="tv-body text-xs italic py-3 text-center" style={{ color: T.inkDim }}>Nada para o seu posto agora. Volte depois de uns dias.</div>
        ) : (
          <div className="space-y-2">
            {trabalhos.map((t) => (
              <div key={t.id} className="rounded-xl p-3" style={{ background: T.panelSoft, border: `1px solid ${t.guerra ? T.danger : T.line}` }}>
                <div className="flex items-start justify-between gap-2">
                  <span className="tv-display text-base leading-tight" style={{ color: T.ink }}>{t.icone} {t.titulo}</span>
                  <span className="tv-mono text-[9px] px-1.5 py-0.5 rounded shrink-0" style={{ border: `1px solid ${T.amber}`, color: T.amberSoft }}>◉ {t.paga}</span>
                </div>
                <div className="tv-mono text-[9px] mt-1" style={{ color: T.violetSoft }}>nível {t.nivel} · rende {t.contribui} de contribuição</div>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <button onClick={() => aoPegarTrabalho(t)} className="tv-mono text-[10px] px-2 py-1 rounded" style={{ border: `1px solid ${T.amber}`, color: T.amberSoft }}>✍ eu faço</button>
                  {vagas > 0 && (
                    <button onClick={() => setDelegando(delegando === t.id ? null : t.id)} className="tv-mono text-[10px] px-2 py-1 rounded"
                      style={{ border: `1px solid ${T.violet}`, color: T.violetSoft }}>
                      ⇢ mandar alguém ({fora}/{vagas})
                    </button>
                  )}
                </div>
                {delegando === t.id && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {(minha.membros || []).filter((m) => !m.fora).map((m) => (
                      <button key={m.nome} onClick={() => { aoDelegar(t, m.nome); setDelegando(null); }}
                        className="tv-mono text-[10px] px-2 py-1 rounded" style={{ border: `1px solid ${T.line}`, color: T.ink }}
                        title={`${nomeDoPosto(minha, m.posto)} — ${m.papel}`}>
                        {m.nome} · {nomeDoPosto(minha, m.posto)}
                      </button>
                    ))}
                    {(minha.membros || []).every((m) => m.fora) && <span className="tv-mono text-[9px]" style={{ color: T.inkDim }}>todos já estão fora em serviço</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ---- quem está fora em serviço ---- */}
      {tarefas.length > 0 && (
        <div>
          <Rotulo cor={T.violetSoft}>Fora em serviço</Rotulo>
          <div className="space-y-1">
            {tarefas.map((t) => (
              <div key={t.id} className="rounded-lg px-2.5 py-1.5" style={{ background: T.panelSoft, border: `1px solid ${T.violet}` }}>
                <div className="tv-body text-xs" style={{ color: T.ink }}>{t.quem} — {t.titulo}</div>
                <div className="tv-mono text-[9px]" style={{ color: T.inkDim }}>volta em {t.dias} dia{t.dias > 1 ? "s" : ""} · {t.chance}% de dar certo</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---- a casa ---- */}
      <div>
        <button onClick={() => setVerMembros((v) => !v)} className="w-full text-left">
          <Rotulo>{verMembros ? "▾" : "▸"} A casa · {(minha.membros || []).length} pessoas</Rotulo>
        </button>
        {verMembros && (
          <div className="space-y-1">
            {(minha.membros || []).map((m) => (
              <div key={m.nome} className="rounded-lg px-2.5 py-1.5 flex items-center gap-2" style={{ background: T.panelSoft, border: `1px solid ${T.line}`, opacity: m.fora ? 0.55 : 1 }}>
                <div className="min-w-0 flex-1">
                  <div className="tv-body text-xs truncate" style={{ color: T.ink }}>{m.nome}{m.fora ? " — fora em serviço" : ""}</div>
                  <div className="tv-mono text-[9px]" style={{ color: T.inkDim }}>{nomeDoPosto(minha, m.posto)} · {m.papel}</div>
                </div>
                {mandar && !m.fora && (
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => aoPromover(m.nome)} className="tv-mono text-[10px] px-1.5 py-1 rounded" style={{ border: `1px solid ${T.amber}`, color: T.amberSoft }} title="Promover">▲</button>
                    <button onClick={() => aoExpulsar(m.nome)} className="tv-mono text-[10px] px-1.5 py-1 rounded" style={{ border: `1px solid ${T.danger}`, color: T.danger }} title="Expulsar">✕</button>
                  </div>
                )}
              </div>
            ))}
            {mandar && (
              <div className="pt-1">
                <Rotulo>Admitir do elenco</Rotulo>
                <div className="flex flex-wrap gap-1">
                  {elenco.filter((p) => !(minha.membros || []).some((m) => m.nome === p.nome)).slice(0, 10).map((p) => (
                    <button key={p.nome} onClick={() => aoAdmitir(p)} className="tv-mono text-[10px] px-2 py-1 rounded"
                      style={{ border: `1px solid ${T.line}`, color: T.inkDim }}>+ {p.nome}</button>
                  ))}
                  {elenco.length === 0 && <span className="tv-mono text-[9px]" style={{ color: T.inkDim }}>ninguém conhecido para admitir ainda</span>}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ---- as outras casas, e como estamos com elas ---- */}
      {guildas.filter((g) => g.id !== minha.id).length > 0 && (
        <div>
          <Rotulo>As outras casas</Rotulo>
          <div className="space-y-1">
            {guildas.filter((g) => g.id !== minha.id).map((g) => {
              const at = (minha.atrito || {})[g.id] || 0;
              const fa = faixaDeAtrito(at);
              const cor = fa === "guerra" ? T.danger : fa === "rivalidade" ? T.danger : fa === "arranhão" ? T.amber : T.inkDim;
              return (
                <div key={g.id} className="rounded-lg px-2.5 py-1.5 flex items-center justify-between gap-2" style={{ background: T.panelSoft, border: `1px solid ${T.line}` }}>
                  <span className="tv-body text-xs truncate" style={{ color: T.ink }}>{oficioPorId(g.oficio).icone} {g.nome}</span>
                  <span className="tv-mono text-[9px] uppercase tracking-wider shrink-0" style={{ color: cor }}>{fa}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
