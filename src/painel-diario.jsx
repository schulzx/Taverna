/* ============================================================
   PAINEL DIÁRIO — arco da campanha, missões e fios do mundo (v8.8) — Taverna
   Extraído do App.jsx na modularização.
   ============================================================ */
import React from "react";
import { T } from "./constantes.js";
import { ESTRUTURAS, estruturaPorId } from "./historia.js";
import { ativas as missoesAtivas, ofertas as missoesOferecidas, garantirMissoes, etapaAtual, progresso as progressoMissao, textoDaEtapa, etapaDef, tipoDef as tipoMissao } from "./missoes.js";

/* ---------------- O CARTÃO DA MISSÃO (v9.27) ----------------
   A regra de desenho é uma só, e ela é de gameplay: mostrar o que
   fazer AGORA e esconder o que vem depois. A etapa atual aparece
   por inteiro, as cumpridas ficam riscadas, e as futuras são pontos
   fechados — o jogador sabe quanto falta sem saber o quê.

   Uma lista inteira aberta transformaria a aventura num checklist,
   e um cartão sem etapa nenhuma é o que existia antes: um bilhete
   que não dizia o que fazer. */
function CartaoMissao({ m, aoResponder, aoEncerrarLegado }) {
  const t = tipoMissao(m.tipo);
  const p = progressoMissao(m);
  const atual = etapaAtual(m);
  const oferta = m.status === "oferecida";
  const fim = m.status === "concluida" || m.status === "falhada" || m.status === "recusada";
  const cor = m.status === "concluida" ? T.ok
    : m.status === "falhada" ? T.danger
    : oferta ? T.violet
    : m.tipo === "principal" ? T.amber : T.line;
  return (
    <div className="rounded-lg px-3 py-2.5" style={{ background: T.panelSoft, border: `1px solid ${cor}`, opacity: fim ? 0.6 : 1 }}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="tv-body text-sm" style={{ color: T.ink }}>
          {m.status === "concluida" ? "✓ " : m.status === "falhada" ? "✗ " : m.status === "recusada" ? "— " : `${t.icone} `}{m.titulo}
        </span>
        <span className="tv-mono text-[9px] px-1.5 py-0.5 rounded shrink-0" style={{ color: cor === T.line ? T.inkDim : cor, border: `1px solid ${cor === T.line ? T.line : cor}` }}>
          {oferta ? "OFERTA" : t.rotulo.toUpperCase()}
        </span>
      </div>
      {m.dador && <div className="tv-body text-[11px] mt-0.5" style={{ color: T.inkDim }}>de {m.dador}</div>}
      {m.descricao && <div className="tv-body text-xs mt-0.5" style={{ color: T.inkDim }}>{m.descricao}</div>}

      {!fim && (m.etapas || []).length > 0 && (
        <div className="mt-2">
          <div className="flex items-center gap-1 mb-1.5">
            {m.etapas.map((e, i) => (
              <span key={i} title={e.feito ? "cumprida" : i === p.feitas ? "é o que falta agora" : "ainda por vir"}
                style={{
                  width: 7, height: 7, borderRadius: 99, display: "inline-block",
                  background: e.feito ? T.ok : i === p.feitas ? T.amber : "transparent",
                  border: `1px solid ${e.feito ? T.ok : i === p.feitas ? T.amber : T.line}`,
                }} />
            ))}
            <span className="tv-mono text-[9px] ml-1" style={{ color: T.inkDim }}>{p.feitas}/{p.total}</span>
          </div>
          {atual ? (
            <div className="tv-body text-xs" style={{ color: T.amberSoft }}>
              {etapaDef(atual.tipo).icone} {textoDaEtapa(atual)}
            </div>
          ) : null}
          {p.total - p.feitas > 1 && (
            <div className="tv-body text-[10px] mt-0.5 italic" style={{ color: T.inkDim }}>
              …e mais {p.total - p.feitas - 1} passo{p.total - p.feitas - 1 > 1 ? "s" : ""} depois deste.
            </div>
          )}
        </div>
      )}

      {m.recompensa && !fim && (
        <div className="tv-mono text-[10px] mt-1.5" style={{ color: T.inkDim }}>
          paga ◉ {m.recompensa.moedas} · {m.recompensa.xp} XP{m.recompensa.item ? ` · item ${m.recompensa.item}` : ""}
        </div>
      )}

      {m.legado && m.status === "ativa" && aoEncerrarLegado && (
        <div className="mt-2">
          <div className="tv-body text-[10px] mb-1.5" style={{ color: T.inkDim }}>
            Esta missão vem de antes do sistema de etapas — o código não tem como saber se você a terminou. Quem sabe é você.
          </div>
          <div className="flex gap-2">
            <button onClick={() => aoEncerrarLegado(m.id, "concluida")} className="tv-mono text-[10px] px-2.5 py-1 rounded-lg"
              style={{ color: T.ok, border: `1px solid ${T.ok}` }}>✓ já terminei</button>
            <button onClick={() => aoEncerrarLegado(m.id, "falhada")} className="tv-mono text-[10px] px-2.5 py-1 rounded-lg"
              style={{ color: T.danger, border: `1px solid ${T.line}` }}>✗ ficou pelo caminho</button>
          </div>
        </div>
      )}
      {oferta && aoResponder && (
        <div className="flex gap-2 mt-2">
          <button onClick={() => aoResponder(m.id, true)} className="tv-mono text-[11px] px-3 py-1.5 rounded-lg"
            style={{ background: T.violet, color: T.onSecond, fontWeight: 600 }}>Aceitar</button>
          <button onClick={() => aoResponder(m.id, false)} className="tv-mono text-[11px] px-3 py-1.5 rounded-lg"
            style={{ color: T.inkDim, border: `1px solid ${T.line}` }}>Recusar</button>
        </div>
      )}
    </div>
  );
}

export function PainelDiario({ historia, quests, trocarArco, eventos, diaAtual, missoes = [], aoResponderMissao, aoEncerrarLegado }) {
  const [trocando, setTrocando] = React.useState(false);
  const est = estruturaPorId((historia || {}).estrutura);
  const todas = garantirMissoes(missoes);
  const ativasM = todas.filter((m) => m.status === "ativa");
  const ofertasM = todas.filter((m) => m.status === "oferecida");
  /* "o que o mundo impôs" x "o que você aceitou": a separação não é
     cosmética. É ela que deixa claro, de relance, o que foi escolha do
     jogador e o que foi consequência — a distinção que o sistema inteiro
     de missões existe para tornar visível. */
  const principaisM = ativasM.filter((m) => tipoMissao(m.tipo).forcada);
  const secundariasM = ativasM.filter((m) => !tipoMissao(m.tipo).forcada);
  const encerradasM = todas.filter((m) => ["concluida", "falhada", "recusada"].includes(m.status));
  return (
    <div>
      <div className="rounded-xl p-4 mb-4" style={{ background: T.panelSoft, border: `1px solid ${T.violet}` }}>
        <div className="flex items-center justify-between mb-1">
          <div className="tv-mono text-[10px] uppercase tracking-widest" style={{ color: T.violetSoft }}>Arco da campanha</div>
          <button onClick={() => setTrocando((v) => !v)} className="tv-mono text-[10px] px-2 py-0.5 rounded" style={{ border: `1px solid ${T.line}`, color: T.inkDim }}>↺ trocar arco</button>
        </div>
        <div className="tv-display text-xl" style={{ color: T.ink }}>{est.nome}</div>
        {/* v9.28: a fila de etapas ("O Chamado → A Travessia → Provações…")
            saiu daqui. Ver que você está em "Provações" é saber que ainda vem
            "O Abismo" — o jogador passava a esperar a derrota em vez de
            vivê-la, e o mesmo valia para o desfecho. O arco é uma promessa de
            gênero, e é só isso que ele precisa ver; onde ele está dentro dele
            é bastidor do sistema. */}
        <div className="tv-body text-xs mt-1" style={{ color: T.inkDim }}>{est.desc}</div>
        {trocando && (
          <div className="mt-3 space-y-2">
            <div className="tv-body text-xs" style={{ color: T.inkDim }}>Mudar a perspectiva da campanha — o mundo e a história vividos permanecem; só o rumo dramático muda.</div>
            {ESTRUTURAS.filter((e) => e.id !== (historia || {}).estrutura).map((e) => (
              <button key={e.id} onClick={() => { trocarArco(e.id); setTrocando(false); }} className="w-full text-left rounded-lg p-3" style={{ background: T.panel, border: `1px solid ${T.line}` }}>
                <div className="tv-display text-base" style={{ color: T.amberSoft }}>{e.nome}</div>
                <div className="tv-body text-xs mt-0.5" style={{ color: T.inkDim }}>{e.desc}</div>
              </button>
            ))}
          </div>
        )}
      </div>
      {ofertasM.length > 0 && (<><div className="tv-mono text-[10px] uppercase tracking-widest mb-1.5" style={{ color: T.violetSoft }}>Ofereceram a você</div><div className="space-y-2 mb-4">{ofertasM.map((m) => <CartaoMissao key={m.id} m={m} aoResponder={aoResponderMissao} />)}</div></>)}
      {ativasM.length === 0 && ofertasM.length === 0 && <div className="tv-body text-sm italic mb-4" style={{ color: T.inkDim }}>Nenhuma missão em curso — elas surgem conforme a história se abre, e você decide quais aceitar.</div>}
      {principaisM.length > 0 && (<><div className="tv-mono text-[10px] uppercase tracking-widest mb-1.5" style={{ color: T.amberSoft }}>O que o mundo impôs</div><div className="space-y-2 mb-4">{principaisM.map((m) => <CartaoMissao key={m.id} m={m} aoEncerrarLegado={aoEncerrarLegado} />)}</div></>)}
      {secundariasM.length > 0 && (<><div className="tv-mono text-[10px] uppercase tracking-widest mb-1.5" style={{ color: T.inkDim }}>O que você aceitou</div><div className="space-y-2 mb-4">{secundariasM.map((m) => <CartaoMissao key={m.id} m={m} aoEncerrarLegado={aoEncerrarLegado} />)}</div></>)}
      {encerradasM.length > 0 && (<><div className="tv-mono text-[10px] uppercase tracking-widest mb-1.5" style={{ color: T.inkDim }}>Encerradas</div><div className="space-y-2">{encerradasM.slice(-8).reverse().map((m) => <CartaoMissao key={m.id} m={m} />)}</div></>)}

      {/* FIOS DO MUNDO (v7.2): evento global em curso + fios locais com prazo */}
      {eventos && eventos.global && (
        <>
          <div className="tv-mono text-[10px] uppercase tracking-widest mt-5 mb-1.5" style={{ color: T.danger }}>🌍 Evento global em curso</div>
          <div className="rounded-lg px-3 py-2.5 mb-2" style={{ background: T.panelSoft, border: `1px solid ${T.danger}` }}>
            <div className="flex items-baseline justify-between gap-2">
              <span className="tv-body text-sm font-bold" style={{ color: T.ink }}>{eventos.global.nome}</span>
              <span className="tv-mono text-[9px] shrink-0" style={{ color: T.danger }}>etapa {eventos.global.etapa + 1}/{eventos.global.etapas.length}</span>
            </div>
            <div className="tv-body text-xs mt-0.5" style={{ color: T.inkDim }}>{eventos.global.semente}</div>
            <div className="tv-body text-xs mt-1" style={{ color: T.amberSoft }}>▶ Agora: {eventos.global.etapas[eventos.global.etapa]}</div>
          </div>
        </>
      )}
      {eventos && (eventos.locais || []).length > 0 && (
        <>
          <div className="tv-mono text-[10px] uppercase tracking-widest mt-4 mb-1.5" style={{ color: T.inkDim }}>🌱 Fios do mundo (se resolvem sem você)</div>
          <div className="space-y-2">
            {eventos.locais.map((l) => (
              <div key={l.id} className="rounded-lg px-3 py-2.5" style={{ background: T.panelSoft, border: `1px solid ${T.line}` }}>
                <div className="tv-body text-xs" style={{ color: T.ink }}>{l.icone} {l.texto}</div>
                <div className="flex items-baseline justify-between gap-2 mt-1">
                  <span className="tv-body text-[11px] italic" style={{ color: T.violetSoft }}>{l.gancho}</span>
                  <span className="tv-mono text-[9px] shrink-0" style={{ color: diaAtual >= l.expiraEm ? T.danger : T.inkDim }}>até dia {l.expiraEm}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* PainelMapa extraído para ./painel-mapa.jsx (v8.8) */
