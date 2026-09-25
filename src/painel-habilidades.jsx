/* ============================================================
   AS DUAS GAVETAS DA BATALHA (E3) — `Habilidades (✦)` e o caderno

   POR QUE SÃO GAVETA E NÃO VERBO, e a razão é de E1: *lista nunca entra
   em fileira fixa*. A fileira dos verbos é fixa porque se aprende em duas
   lutas e se usa sem olhar; a lista de habilidades varia por classe, por
   nível e por PM — no dia em que o mago aprende a sétima magia, a fileira
   deixaria de ser fixa. Então ela abre, e não se alinha.

   POR QUE SAÍRAM DO `App.jsx`. Nasceram lá e ficaram lá, e nada as
   prendia: não tocam em estado do jogo, não leem `ref` nenhuma, e tudo o
   que decidem sai de `magias.js` e de `regras-jogo.js`. Eram 189 linhas de
   TELA dentro do arquivo que existe para ser FIAÇÃO — e a lei do ciclo é
   que o melhor uso do bastão é gastá-lo para não precisar mais dele.

   Saíram byte a byte: nem uma linha de comportamento mudou na mudança.
   ============================================================ */

import React from "react";
import { T } from "./estilo.js";
import { Glifo, IconeCheck } from "./ui.jsx";
import { ehPreparavel, ehRitual, estaPreparada, garantirPreparadas, limitePreparadas, motivoDoCaderno, preparaveisDe } from "./magias.js";
import { recargaPadrao } from "./regras-jogo.js";
export function PainelHabilidades({ personagem, selecionar, fechar, escolhidas = [], limite = 1 }) {
  const [busca, setBusca] = React.useState("");
  /* ---- SÓ O QUE DÁ PARA USAR (v9.33) ----
     As guardadas apareciam aqui, apagadas, com o motivo. A intenção era boa —
     esconder faria o jogador procurar a magia, não achar e concluir que
     perdeu a habilidade. Mas com o grimório de 85 magias a lista ficou
     comprida o bastante para o remédio virar o problema: uma dúzia de linhas
     mortas empurrando para baixo justamente as que ele veio usar, no meio de
     uma luta.

     A saída é a mesma do resto da tela: não esconder, DOBRAR. O que sai na
     luta fica em cima; o que está guardado vira uma linha que se abre, e ela
     diz onde preparar. Ninguém acha que perdeu nada, e a lista de combate
     volta a ser a lista de combate. */
  const [verGuardadas, setVerGuardadas] = React.useState(false);
  const tudo = (personagem.habilidades || []).filter((h) => h && h.nome);
  const guardadas = tudo.filter((h) => ehPreparavel(h, personagem) && !estaPreparada(personagem, h));
  const todas = tudo.filter((h) => !guardadas.includes(h));
  const normal = (x) => (x || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const filtrar = (l) => busca ? l.filter((h) => normal(h.nome).includes(normal(busca)) || normal(h.descricao).includes(normal(busca))) : l;
  const lista = filtrar(todas);
  const listaGuardadas = filtrar(guardadas);
  const muitas = tudo.length > 6;
  return (
    <div className="tv-fade tv-margem-abas mx-4 md:mx-8 mb-2 rounded-2xl p-4" style={{ background: T.panel, border: `1px solid ${T.violet}` }}>
      <div className="flex items-center justify-between mb-3">
        <div className="tv-mono text-xs uppercase tracking-widest" style={{ color: T.violetSoft }}>
          Habilidades · {personagem.mana}/{personagem.manaMax} PM
          {limite > 1 ? ` · até ${limite} neste turno (${escolhidas.length} marcada${escolhidas.length === 1 ? "" : "s"})` : ` · ${todas.length}`}
        </div>
        <button onClick={fechar} className="tv-mono text-sm px-1.5" style={{ color: T.inkDim }}>✕</button>
      </div>
      {muitas && (
        <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar habilidade…"
          className="w-full rounded-lg px-3 py-2 mb-3 tv-body text-sm outline-none" style={{ background: T.panelSoft, border: `1px solid ${T.line}`, color: T.ink }} />
      )}
      {tudo.length === 0 ? (
        <div className="tv-body text-sm italic" style={{ color: T.inkDim }}>Você ainda não despertou nenhuma habilidade. Elas virão com a história.</div>
      ) : todas.length === 0 ? (
        <div className="tv-body text-sm italic" style={{ color: T.inkDim }}>Nenhuma magia preparada — todas as {guardadas.length} que você sabe estão guardadas. Abra a ficha e escolha o que levar na cabeça.</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-2 tv-scroll" style={{ maxHeight: "38vh", overflowY: "auto" }}>
          {lista.map((h, i) => {
            const custo = Math.max(0, Number(h.custo) || 0);
            const semMana = personagem.mana < custo;
            const rec = (personagem.habRecarga || {})[(h.nome || "").toLowerCase()] || 0;
            const marcada = escolhidas.some((x) => x.nome === h.nome);
            /* com dois movimentos dá para marcar duas magias e descrever as
               duas de uma vez — o turno inteiro numa tacada só (v9.5) */
            const cheio = !marcada && escolhidas.length >= limite;
            /* nesta lista já não há guardada nenhuma: elas saíram para a
               dobra lá embaixo. O selo 📖 fica, para o jogador reconhecer o
               que veio do caderno e o que está sempre à mão. */
            const doCaderno = ehPreparavel(h, personagem);
            const guardada = false;
            const travada = semMana || rec > 0 || cheio;
            return (
              <button key={i} onClick={() => !travada && selecionar(h)} disabled={travada} className="text-left rounded-xl p-3 transition-all"
                style={{ background: marcada ? T.violet : T.panelSoft, border: `1px solid ${marcada ? T.violet : travada ? T.line : T.violet}`, opacity: travada ? 0.45 : 1, cursor: travada ? "not-allowed" : "pointer" }}>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="tv-display text-lg leading-none" /* E3: era `#14101F` escrito à mão, que é `T.onSecond` byte a byte — a
                      cópia veio junto na mudança de casa e morre aqui, que é o
                      único sítio onde ela era visível. Zero diferença na tela. */
                    style={{ color: marcada ? T.onSecond : T.ink }}>{marcada ? "✓ " : ""}{h.nome}</span>
                  <span className="flex items-center gap-1.5 shrink-0">
                    {rec > 0 && <span className="tv-mono text-[9px] px-1 py-0.5 rounded" style={{ border: `1px solid ${T.line}`, color: T.inkDim }}><Glifo nome="relogio" tamanho={12} /> {rec}t</span>}
                    {guardada && <span className="tv-mono text-[9px] px-1 py-0.5 rounded" style={{ border: `1px solid ${T.line}`, color: T.inkDim }} title={ehRitual(h) ? "Não preparada hoje — fora de combate você ainda pode conduzi-la como ritual" : "Não preparada hoje. Prepare-a no próximo descanso longo."}>guardada</span>}
                                        <span className="tv-mono text-[10px]" style={{ color: semMana ? T.danger : T.violetSoft }}>{custo} PM</span>
                  </span>
                </div>
                <div className="tv-body text-xs mt-1" style={{ color: T.inkDim }}>{h.descricao}</div>
                {(() => { const r = h.recarga != null ? Math.max(0, Number(h.recarga) || 0) : recargaPadrao(custo); return r > 0 && rec === 0 ? <div className="tv-mono text-[9px] mt-1" style={{ color: T.inkDim }}>recarga: {r}t após o uso</div> : null; })()}
              </button>
            );
          })}
        </div>
      )}
      {guardadas.length > 0 && (
        <div className="mt-2 pt-2" style={{ borderTop: `1px solid ${T.line}` }}>
          <button onClick={() => setVerGuardadas((v) => !v)}
            title="Magias que você sabe mas não preparou hoje. Elas não saem na luta."
            className="tv-mono text-[10px] flex items-center gap-2" style={{ color: T.inkDim }}>
            {guardadas.length} guardada{guardadas.length === 1 ? "" : "s"} — não saem na luta
            <span style={{ opacity: 0.7 }}>{verGuardadas ? "▴ esconder" : "▾ ver quais"}</span>
          </button>
          {verGuardadas && (
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {listaGuardadas.map((h) => (
                <span key={h.nome} className="tv-mono text-[10px] px-2 py-1 rounded-full"
                  title={ehRitual(h) ? "Fora de combate você ainda pode conduzi-la como ritual, pagando tempo." : "Prepare-a na ficha ou no acampamento."}
                  style={{ border: `1px solid ${T.line}`, color: T.inkDim }}>
                  {h.nome}{ehRitual(h) ? <> <Glifo nome="relogio" tamanho={12} rotulo="ritual" /></> : null}
                </span>
              ))}
              <span className="tv-body text-[10px] w-full mt-1" style={{ color: T.inkDim }}>
                Para trocar o que você leva, abra a ficha (Gestão › Ficha) ou acampe — o painel “Magias na cabeça” está nos dois.
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------------- O CADERNO DE MAGIAS (v9.33) ----------------
   Ele já existia, e morava num lugar só: dentro do painel de acampamento.
   O jogador procurou na ficha — que é onde se "arruma as habilidades" —,
   não achou, acampou para ver se aparecia, e não achou de novo. Duas
   coisas estavam erradas ao mesmo tempo: o painel só existia numa tela
   passageira, e quando não havia o que preparar ele simplesmente não era
   desenhado, então o vazio não distinguia "procurei no lugar errado" de
   "isto não existe para mim".

   Agora é um componente só, desenhado nos DOIS lugares, e ele aparece
   mesmo quando está vazio — dizendo por quê. */
export function PainelCaderno({ personagem, onPreparar, compacto = false, travado = "" }) {
  const prep = garantirPreparadas(personagem);
  const teto = limitePreparadas(personagem);
  const lista = preparaveisDe(personagem);
  const motivo = motivoDoCaderno(personagem);
  return (
    <div className="rounded-xl px-3 py-2 mb-3" style={{ background: T.panelSoft, border: `1px solid ${lista.length ? T.violet : T.line}` }}>
      <div className="flex items-baseline justify-between gap-2 mb-1.5">
        <div className="tv-mono text-[10px] uppercase tracking-widest" style={{ color: T.violetSoft }}><Glifo nome="faisca" tamanho={12} /> Magias na cabeça</div>
        {lista.length > 0 && <div className="tv-mono text-[10px]" style={{ color: prep.length >= teto ? T.violetSoft : T.inkDim }}>{prep.length}/{teto}</div>}
      </div>
      {motivo ? (
        <div className="tv-body text-[11px]" style={{ color: T.inkDim }}>{motivo}</div>
      ) : (
        <>
          <div className="flex flex-wrap gap-1.5">
            {lista.map((h) => {
              const on = prep.includes(h.nome);
              return (
                <button key={h.nome} onClick={() => onPreparar(h.nome)} disabled={!!travado}
                  title={`${h.descricao || ""}${ehRitual(h) ? "\n\nRitual: fora de combate dá para conduzi-la mesmo sem preparar, pagando tempo." : ""}${travado ? `\n\n${travado}` : ""}`}
                  className="tv-mono text-[10px] px-2 py-1 rounded-full"
                  style={{ background: on ? T.violet : "transparent", color: on ? T.onSecond : T.inkDim, border: `1px solid ${on ? T.violet : T.line}`, opacity: travado ? 0.5 : 1, cursor: travado ? "not-allowed" : "pointer" }}>
                  {on ? <><IconeCheck tamanho={10} cor={T.onSecond} /> </> : null}{h.nome} <span style={{ opacity: 0.7 }}>{Math.max(0, Number(h.custo) || 0)}PM</span>{ehRitual(h) ? <> <Glifo nome="relogio" tamanho={12} rotulo="ritual" /></> : null}
                </button>
              );
            })}
          </div>
          {/* v9.99: o painel FICA na ficha — achar onde se arruma continua
              valendo, e foi por isso que a v9.33 o trouxe para cá. O que
              muda é que fora do acampamento ele MOSTRA e não deixa mexer,
              dizendo por quê: um caderno em branco ensinaria de novo que o
              jogador procurou no lugar errado. */}
          {travado ? (
            <div className="tv-body text-[10px] mt-1.5" style={{ color: T.amberSoft }}>
              <Glifo nome="cadeado" tamanho={12} /> {travado}.
            </div>
          ) : !compacto && (
            <div className="tv-body text-[10px] mt-1.5" style={{ color: T.inkDim }}>
              Toque para preparar ou guardar. Só as preparadas aparecem no botão <Glifo nome="faisca" tamanho={12} /> Habilidades — as guardadas voltam a caber no próximo descanso longo, e as marcadas com <Glifo nome="relogio" tamanho={12} /> ainda podem ser conduzidas como ritual fora da luta.
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ---------------- Telas de criação ---------------- */

/* ---------------- A CRIAÇÃO DO MUNDO (v9.173) ----------------
   Redesenhada em `criacao-mundo-v2`. A tela mais decisiva do jogo era a
   mais apertada: 672px de coluna para sete gêneros, quatro moldes, oito
   arcos, oito vozes e dois textos longos — tudo empilhado numa fita
   vertical sem respiro.

   Agora a coluna tem 1040, as escolhas vêm em DUAS COLUNAS de cartões
   com ícone e descrição, e as seções são separadas por divisória rúnica.
   Cada seção ganhou cabeçalho de três linhas — sobrelinha, título e o
   que aquilo decide no jogo —, que é o que faz a pessoa entender que
   está escolhendo o motor da campanha, e não preenchendo um cadastro.

   DUAS COISAS DO DESENHO NÃO ENTRARAM, E É DE PROPÓSITO:

   Os selos "PREFERIDO" (na Torre) e "REQUISITADO" (no Taverneiro). O
   jogo não mede preferência de ninguém — inventar popularidade para
   empurrar uma escolha é mentir para quem senta à mesa, e a primeira
   campanha da pessoa não deveria ser decidida por um selo falso.

   E o texto da APRESENTAÇÃO. O desenho descreve "Clássica" como
   concordância medieval e "Plural" como linguagem neutra de gênero — e
   não é isso que o botão faz. Ele decide se o RETRATO das pessoas do
   mundo cumpre o gênero da ficha sempre, ou se cerca de uma em sete se
   apresenta diferente. Descrever errado uma mecânica é pior do que não
   descrevê-la: a pessoa escolhe uma coisa achando que escolheu outra. */
